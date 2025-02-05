package com.example.spring.bzfrontservice.controller;

import com.example.spring.bzfrontservice.client.CustomerClient;
import com.example.spring.bzfrontservice.dto.CartRequestDTO;
import com.example.spring.bzfrontservice.dto.CartResponseDTO;
import com.example.spring.bzfrontservice.dto.PurchaseDTO;
import com.example.spring.bzfrontservice.dto.ReviewWriteRequestDTO;
import com.example.spring.bzfrontservice.service.CartService;
import com.example.spring.bzfrontservice.service.CustomerService;
import com.example.spring.bzfrontservice.service.PurchaseService;
import com.example.spring.bzfrontservice.service.UserService;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.*;

@RestController
@Slf4j
@RequestMapping("/customer")
@RequiredArgsConstructor
public class CustomerApiController {

    private final CustomerService customerService;
    private final UserService userService;
    private final PurchaseService purchaseService;
    private final CartService cartService;

    @PostMapping("/cart/add")
    public ResponseEntity<String> addToCart(
            @RequestBody CartRequestDTO cartRequest,
            @RequestHeader("Authorization") String token) {
        customerService.addToCart(cartRequest, token);
        return ResponseEntity.ok("장바구니에 추가되었습니다.");
    }

    // 장바구니 목록 가져오기
    @GetMapping("/cart/list/items")
    public ResponseEntity<List<CartResponseDTO>> getCartItems(@RequestHeader("Authorization") String token) {
        List<CartResponseDTO> cartItems = cartService.getCartItems(token);
        return ResponseEntity.ok(cartItems);
    }

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
        ;
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

            System.out.println(productList + " 구매 상품");

            // 이걸 js에서 해도 될듯
            savePaymentDetails(orderId, paymentKey, totalAmount, approvedAt, method, memberNo, productList);

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

    // 결제 정보를 저장하는 메서드 예제
    private void savePaymentDetails(String orderId, String paymentKey, Double totalAmount, String approvedAt, String method, Long memberNo, String productList) {
        // 예: DB에 결제 정보 저장
        System.out.println("Saving payment details...");
        System.out.println("Order ID: " + orderId);
        System.out.println("Payment Key: " + paymentKey);
        System.out.println("Total Amount: " + totalAmount);
        System.out.println("Approved At: " + approvedAt);
        System.out.println("Payment Method: " + method);
        System.out.println("Member No: " + memberNo);

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


    @PostMapping(value = "/history/review/{productId}/{purchaseId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadReview(@RequestParam("memberNo") Long memberNo,
                                                            @PathVariable("productId") Long productId, // 변경 (PathVariable 사용)
                                                            @PathVariable("purchaseId") Long purchaseId, // 변경 (PathVariable 사용)
                                                            @RequestParam("content") String content,
                                                            @RequestPart(value = "reviewImg", required = false) List<MultipartFile> reviewImages) {  // required = false 설정
        Map<String, String> response = new HashMap<>();

        try {
            log.info("📌 리뷰 작성 요청 - memberNo: {}, productId: {}, purchaseId: {}, content: {}",
                    memberNo, productId, purchaseId, content);

            // 이미지가 없을 경우 빈 리스트로 초기화
            if (reviewImages == null) {
                reviewImages = new ArrayList<>();
            }
            log.info("📌 업로드된 이미지 개수: {}", reviewImages.size());

            // 서비스 호출 - FeignClient 연결
            ResponseEntity<Map<String, String>> serverResponse = customerService.writeReview(memberNo, productId, purchaseId, content, reviewImages);

            // 서버 응답이 OK일 경우 처리
            if (serverResponse.getStatusCode() == HttpStatus.OK) {
                response.put("url", "/customer/history?memberNo="+memberNo);
                response.put("message", "리뷰 등록이 완료되었습니다.");
                return ResponseEntity.ok(response);
            } else {
                response.put("message", "서버에서 리뷰 등록이 실패했습니다: " + serverResponse.getBody().get("message"));
                return ResponseEntity.status(serverResponse.getStatusCode()).body(response);
            }

        } catch (FeignException.FeignClientException e) {
            log.error("🚨 FeignClientException 발생: {}", e.getMessage(), e);
            response.put("message", "서버와의 통신 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(response);
        } catch (Exception e) {
            log.error("🚨 예상치 못한 예외 발생: {}", e.getMessage(), e);
            response.put("message", "알 수 없는 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}

