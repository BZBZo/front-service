package com.example.spring.bzfrontservice.client;

import com.example.spring.bzfrontservice.dto.*;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.multipart.MultipartFile;

@FeignClient(name = "CustomerClient", url = "${bzbzo.bz-edge-service-url}/customer")
public interface CustomerClient {

    @PostMapping("/cart/add")
    void addToCart(@RequestBody CartRequestDTO cartRequest,
                   @RequestHeader("Authorization") String token);

    @GetMapping("/cart/list")
    List<ProductQuantityDTO> getCartItems(@RequestParam Long memberNo);

    @PostMapping("/history")
    ResponseEntity<String> savePurchaseHistory(@RequestBody PurchaseDTO dto);

    @GetMapping("/history")
    Page<PurchaseDTO> getPurchaseListByMemberNo(
            @RequestParam Long memberNo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size
    );

    @GetMapping("/history/review")
    List<ReviewDTO> findReviewsByPurchaseId(@RequestParam Long purchaseId);

    @GetMapping("/product/review/list")
    Page<ReviewDTO> findReviewsByProductId(
            @RequestParam Long productId,
            @RequestParam("page") int page,
            @RequestParam("size") int size,
            @RequestHeader("Accept") String acceptHeader // Accept 헤더 추가
    );

    @GetMapping("/product/review/count")
    Integer countReview(@RequestParam Long productId);

    @PostMapping(value = "/history/review", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    ResponseEntity<Map<String, String>> writeReview(
            @RequestParam("memberNo") Long memberNo,  // 일반 텍스트 데이터는 @RequestParam으로 변경
            @RequestParam("productId") Long productId,
            @RequestParam("purchaseId") Long purchaseId,
            @RequestParam("content") String content,
            @RequestPart(value = "reviewImg", required = false) MultipartFile[] images
    );

    @GetMapping("/history/review/detail")
    ReviewDTO findReviewByIds(
            @RequestParam("purchaseId") Long purchaseId,
            @RequestParam("productId") Long productId,
            @RequestParam("memberNo") Long memberNo);
}

