package com.example.spring.bzfrontservice.controller;

import com.example.spring.bzfrontservice.dto.CongDongIngDTO;
import com.example.spring.bzfrontservice.dto.PurchaseDTO;
import com.example.spring.bzfrontservice.dto.ReviewDTO;
import com.example.spring.bzfrontservice.dto.SecurityUserDTO;
import com.example.spring.bzfrontservice.service.CongdongService;
import com.example.spring.bzfrontservice.service.CustomerService;
import com.example.spring.bzfrontservice.service.PurchaseService;
import com.example.spring.bzfrontservice.service.UserService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@Slf4j
@Controller
@RequiredArgsConstructor
@RequestMapping("/customer")
public class CustomerController {
    private final UserService userService;
    private final CustomerService customerService;
    private final PurchaseService purchaseService;
    private final CongdongService congdongService;

    @GetMapping("/cart/list")
    public String cart(){
        return "cart";
    }

    // 바로 구매
    @GetMapping("/purchase/direct")
    public String showPaymentPage(@RequestParam("productId") Long productId,
                                  @RequestParam("price") Double price,
                                  @RequestParam("memberNo") Long memberNo,
                                  @RequestParam("quantity") Integer quantity,
                                  @RequestParam("congId") Long congId,
                                  Model model) {
        SecurityUserDTO dto = userService.loadMemberDetail(memberNo);

        // 필요한 데이터를 모델에 추가
        model.addAttribute("productId", productId);
        model.addAttribute("price", price);
        model.addAttribute("quantity", quantity);
        model.addAttribute("totalPrice", quantity * price);
        model.addAttribute("member", dto);
        model.addAttribute("congId", congId);

        return "payment";
    }

    // 주문 요청 처리
    @GetMapping("/purchase/cart")
    public String processCartPurchase( @RequestParam(value = "orderId", required = false) String orderId,
                                       @RequestParam("totalAmount") Double totalAmount,
                                      @RequestParam("productList") String productListJson,
                                      @RequestParam("memberNo") Long memberNo,
                                      Model model) {
        ObjectMapper objectMapper = new ObjectMapper();
        List<Map<String, Object>> productList;
        try {
            productList = objectMapper.readValue(productListJson, new TypeReference<List<Map<String, Object>>>() {});
            System.out.println("productListJson: " + productListJson + ", productList: " + productList);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Invalid productList format", e);
        }

        System.out.println("Total Amount: " + totalAmount);
        System.out.println("Product List: " + productList);
        System.out.println("Member No: " + memberNo);

        SecurityUserDTO dto = userService.loadMemberDetail(memberNo);

        // 모델에 데이터 추가
        model.addAttribute("totalPrice", totalAmount);
        model.addAttribute("productList", productList);
        model.addAttribute("member", dto);

        return "payment2";
    }

    // 주문 데이터 저장 로직 (샘플 메서드)
    private void saveOrderToDatabase(PurchaseDTO dto) {
        // 예제: 데이터베이스에 저장
        // 실제로는 서비스 클래스에서 처리하는 것이 더 적합
        System.out.println("Saving order to database...");
        System.out.println("Order Details: " + dto);
    }

    @GetMapping("/purchase/success")
    public String successPayment(@RequestParam String paymentKey,
                                 @RequestParam String orderId,
                                 @RequestParam String amount,
                                 @RequestParam String paymentType){


        return "pay_success";
    }

    @GetMapping("/purchase/fail")
    public String failPayment(@RequestParam String code,
                              @RequestParam String message,
                              @RequestParam String orderId){
        return "pay_fail";
    }

    @GetMapping("/history")
    public String history(
            @RequestParam Long memberNo,
            @RequestParam(defaultValue = "1") int page, // 기본값을 1로 설정
            @RequestParam(defaultValue = "5") int size,
            Model model) {

        Page<PurchaseDTO> purchasePage = purchaseService.getPurchaseListByMemberNo(memberNo, page, size);

        List<PurchaseDTO> purchases = purchasePage.getContent(); // 현재 페이지의 데이터만 가져옴
        purchaseService.enrichPurchasesWithProducts(purchases); // ✅ 상품 정보 추가

        model.addAttribute("purchases", purchases); // ✅ 상품 정보가 포함된 purchases 추가
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", purchasePage.getTotalPages());
        model.addAttribute("memberNo", memberNo);

        return "purchase_list";
    }


    @GetMapping("/history/review/{productId}/{purchaseId}")
    public String writeReview(@PathVariable Long productId,
                              @PathVariable Long purchaseId,
                              Model model) {

        model.addAttribute("productId", productId);
        model.addAttribute("purchaseId", purchaseId);

        return "review_write";
    }

    @GetMapping("/history/review/detail/{productId}/{purchaseId}/{memberNo}")
    public String detailReview(@PathVariable Long productId,
                               @PathVariable Long purchaseId,
                               @PathVariable Long memberNo,
                               Model model) {

        model.addAttribute("productId", productId);
        model.addAttribute("purchaseId", purchaseId);
        model.addAttribute("memberNo", memberNo);

        ReviewDTO review = customerService.findReviewByIds(purchaseId, productId, memberNo);
        model.addAttribute("review", review);

        return "review_detail";
    }

    @GetMapping("/congdong/history")
    public String getMyCongdongHistory(
            @RequestHeader("Authorization") String token,  // ✅ 토큰 받기
            Model model) {

        log.info("📢 [Front Controller] 공동구매 참여 목록 조회 요청 - Authorization 헤더 포함");

        // ✅ 토큰 로그 확인
        System.out.println("Token received in Front Controller: " + token);

        if (token == null || token.isEmpty()) {
            throw new IllegalStateException("Authorization token is missing");
        }

        // ✅ 컨트롤러에서 `memberNo` 추출
        Long memberNo = userService.getMemberNo(token);
        log.info("📢 [Front Controller] memberNo 조회 결과: {}", memberNo);

        // ✅ `memberNo`를 직접 `FeignClient`로 넘김
        List<CongDongIngDTO> youcong = congdongService.getMyCongdong(token, memberNo);
        log.info("📢 [Front Controller] 조회된 공동구매: {}", youcong);

        log.info("📢 [Front Controller] 조회된 공동구매 개수: {}", youcong.size());
        ObjectMapper objectMapper = new ObjectMapper();

        for (CongDongIngDTO cong : youcong) {
            try {
                if (cong.getCondition() != null) {
                    // `{10:40}` -> `{"10":40}` 형식으로 변환 후 JSON 파싱
                    String fixedJson = cong.getCondition().replaceAll("(\\d+):", "\"$1\":");
                    Map<String, Integer> conditionMap = objectMapper.readValue(fixedJson, new TypeReference<>() {});

                    // 할인율 값 가져오기 (예: 40)
                    int discountRate = conditionMap.values().iterator().next();

                    // 할인율 적용한 최종 가격 계산 (예: 10000원 → 6000원)
                    int discountedPrice = cong.getPrice() - (cong.getPrice() * discountRate / 100);

                    // DTO에 할인가 저장
                    cong.setDiscountedPrice(discountedPrice);

                    log.info("✅ 상품 ID: {}, 원가: {}, 할인율: {}%, 할인가: {}",
                            cong.getProductId(), cong.getPrice(), discountRate, discountedPrice);
                }
            } catch (Exception e) {
                log.error("❌ JSON 파싱 오류: {}", cong.getCondition(), e);
            }
        }

        for (CongDongIngDTO cong : youcong) {
            try {
                // ✅ `congs`가 String이면 JSON 파싱하여 List<Integer>로 변환 후 새로운 필드에 저장
                if (cong.getCongs() != null) {
                    List<Integer> parsedCongs = objectMapper.readValue(cong.getCongs(), new TypeReference<List<Integer>>() {});
                    cong.setCongsList(parsedCongs); // 변환된 값 저장
                }

                // ✅ `isPaid`도 String이면 JSON 파싱하여 List<Integer>로 변환 후 새로운 필드에 저장
                if (cong.getIsPaid() != null) {
                    List<Integer> parsedIsPaid = objectMapper.readValue(cong.getIsPaid(), new TypeReference<List<Integer>>() {});
                    cong.setIsPaidList(parsedIsPaid);
                }
            } catch (Exception e) {
                log.error("❌ isPaid 처리 오류 (ID={}): {}", cong.getId(), e.getMessage());
            }
        }



        model.addAttribute("youcong", youcong);
        model.addAttribute("memberNo", memberNo);
        return "congdongpick";
    }
}
