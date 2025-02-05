package com.example.spring.bzfrontservice.client;

import com.example.spring.bzfrontservice.dto.CartRequestDTO;
import com.example.spring.bzfrontservice.dto.ProductQuantityDTO;
import com.example.spring.bzfrontservice.dto.PurchaseDTO;
import com.example.spring.bzfrontservice.dto.ReviewDTO;
import org.springframework.cloud.openfeign.FeignClient;
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
    List<PurchaseDTO> getPurchaseListByMemberNo(@RequestParam Long memberNo);

    @GetMapping("/history/review")
    List<ReviewDTO> findReviewsByPurchaseId(@RequestParam Long purchaseId);

    @PostMapping(value = "/history/review", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    ResponseEntity<Map<String, String>> writeReview(
            @RequestParam("memberNo") Long memberNo,  // 일반 텍스트 데이터는 @RequestParam으로 변경
            @RequestParam("productId") Long productId,
            @RequestParam("purchaseId") Long purchaseId,
            @RequestParam("content") String content,
            @RequestPart(value = "reviewImg", required = false) List<MultipartFile> images
    );

}

