package com.example.spring.bzfrontservice.controller;

import com.example.spring.bzfrontservice.dto.PurchaseDTO;
import com.example.spring.bzfrontservice.service.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.Reader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@RestController
@Slf4j
@RequestMapping("/customer")
@RequiredArgsConstructor
public class PurchaseApiController {

    private final PurchaseService purchaseService;
    private final SellerService sellerService;

    @PostMapping("/purchase/confirm")
    public ResponseEntity<JSONObject> confirmPayment(@RequestBody String jsonBody) throws Exception {

        JSONParser parser = new JSONParser();
        String orderId;
        String amount;
        String paymentKey;
        try {
            // 클라이언트에서 받은 JSON 요청 바디입니다.
            JSONObject requestData = (JSONObject) parser.parse(jsonBody);
            paymentKey = (String) requestData.get("paymentKey");
            orderId = (String) requestData.get("orderId");
            amount = (String) requestData.get("amount");


        } catch (ParseException e) {
            throw new RuntimeException(e);
        }

        JSONObject obj = new JSONObject();
        obj.put("orderId", orderId);
        obj.put("amount", amount);
        obj.put("paymentKey", paymentKey);

        // 토스페이먼츠 API는 시크릿 키를 사용자 ID로 사용하고, 비밀번호는 사용하지 않습니다.
        // 비밀번호가 없다는 것을 알리기 위해 시크릿 키 뒤에 콜론을 추가합니다.
        String widgetSecretKey = "test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6";
        Base64.Encoder encoder = Base64.getEncoder();
        byte[] encodedBytes = encoder.encode((widgetSecretKey + ":").getBytes(StandardCharsets.UTF_8));
        String authorizations = "Basic " + new String(encodedBytes);

        // 결제를 승인하면 결제수단에서 금액이 차감돼요.
        URL url = new URL("https://api.tosspayments.com/v1/payments/confirm");
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setRequestProperty("Authorization", authorizations);
        connection.setRequestProperty("Content-Type", "application/json");
        connection.setRequestMethod("POST");
        connection.setDoOutput(true);

        OutputStream outputStream = connection.getOutputStream();
        outputStream.write(obj.toString().getBytes("UTF-8"));

        int code = connection.getResponseCode();
        boolean isSuccess = code == 200;

        InputStream responseStream = isSuccess ? connection.getInputStream() : connection.getErrorStream();

        // 결제 성공 및 실패 비즈니스 로직을 구현하세요.
        Reader reader = new InputStreamReader(responseStream, StandardCharsets.UTF_8);
        JSONObject jsonObject = (JSONObject) parser.parse(reader);
        responseStream.close();
        if (isSuccess) {
            // 결제 성공 로직
            System.out.println("결제 성공!");

            // 필수 데이터 추출
            String approvedAt = (String) jsonObject.get("approvedAt");
            String method = (String) jsonObject.get("method");
            Double totalAmount = Double.parseDouble(jsonObject.get("totalAmount").toString());
            JSONObject metadata = (JSONObject) jsonObject.get("metadata");
            Long memberNo = metadata != null ? Long.parseLong(metadata.get("memberNo").toString()) : null;
            String productList = metadata != null ? (String) metadata.get("productList") : null;
            String congId = metadata != null ? (String) metadata.get("congId") : null;

            System.out.println(productList + " 구매 상품");

            // 이걸 js에서 해도 될듯
            savePaymentDetails(orderId, paymentKey, totalAmount, approvedAt, method, memberNo, productList);
            saveSellerHistory(orderId, approvedAt, memberNo, productList);

            if(!congId.equals("0")){
                Long congdongId = Long.parseLong(congId);
                updateCongPayState(congdongId, memberNo);
            }

            jsonObject.put("memberNo", memberNo);

            // 클라이언트로 성공 응답 반환
            return ResponseEntity.ok(jsonObject);

        } else {
            // 결제 실패 로직
            System.out.println("결제 실패!");

            // 실패 사유 추출
            String message = (String) jsonObject.get("message");
            String codeMessage = (String) jsonObject.get("code");

            // 로그 기록 또는 사용자 알림
            System.err.println("결제 실패 메시지: " + message);
            System.err.println("실패 코드: " + codeMessage);

            // 클라이언트로 실패 응답 반환
            return ResponseEntity.status(code).body(jsonObject);
        }
    }

    private void updateCongPayState(Long congId, Long memberNo) {
        sellerService.updateCongPayState(congId, memberNo);
    }

    private void saveSellerHistory(String orderId, String approvedAt, Long memberNo, String productList) {
        PurchaseDTO dto = PurchaseDTO.builder()
                .orderId(orderId)
                .approvedAt(approvedAt)
                .memberNo(memberNo)
                .productList(productList)
                .build();
        sellerService.saveSellerHistory(dto);
    }

    // 결제 정보를 저장하는 메서드 예제
    private void savePaymentDetails(String orderId, String paymentKey, Double totalAmount, String approvedAt, String method, Long memberNo, String productList) {

        PurchaseDTO dto = PurchaseDTO.builder()
                .orderId(orderId)
                .paymentKey(paymentKey)
                .totalAmount(totalAmount)
                .approvedAt(approvedAt)
                .method(method)
                .memberNo(memberNo)
                .productList(productList)
                .build();

        purchaseService.savePurchaseHistory(dto);

    }

}
