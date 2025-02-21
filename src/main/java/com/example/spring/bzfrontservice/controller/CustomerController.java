package com.example.spring.bzfrontservice.controller;

import com.example.spring.bzfrontservice.dto.*;
import com.example.spring.bzfrontservice.service.*;
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
    private final SellerService sellerService;
    private final CustomerService customerService;
    private final CongdongService congdongService;

    // 상품 상세 페이지
    @GetMapping("/product/detail/{id}")
    public String productDetail(@PathVariable("id") Long productId, Model model) {
        // 서비스 계층을 통해 상품 상세 정보 가져오기
        ProdReadResponseDTO product = sellerService.getProductDetails(productId);
        Integer count = customerService.countReview(productId);
        log.info("상품 상세 정보: {}", product);
        SecurityUserDTO sellerInfo= userService.loadMemberDetail(product.getSellerId());

        // **공동구매 진행 정보 가져오기**
        List<CongDongIngDTO> congdongIngList = congdongService.getCongDongIngByProductId(productId);
        log.info("공동구매 진행 목록: {}", congdongIngList);

        // 모델에 데이터 추가
        model.addAttribute("reviewCount", count);
        model.addAttribute("product", product);
        model.addAttribute("sellerInfo", sellerInfo);
        model.addAttribute("congdongIngList", congdongIngList); // congsList → congdongIngList 변경

        return "product_detail_all";
    }

    @GetMapping("/cart/list")
    public String cart(){
        return "cart";
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

    @GetMapping("/alarm")
    public String congAlarm(){

        return "congAl";
    }
}
