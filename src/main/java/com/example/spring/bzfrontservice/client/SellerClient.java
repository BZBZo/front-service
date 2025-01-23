package com.example.spring.bzfrontservice.client;


import com.example.spring.bzfrontservice.dto.*;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@FeignClient(name = "sellerClient", url = "${bzbzo.bz-edge-service-url}/product")
public interface SellerClient {

    @GetMapping("/list")
    Page<ProdReadResponseDTO> getProductList(
            @RequestParam("page") int page,
            @RequestParam("size") int size,
            @RequestHeader("Accept") String acceptHeader // Accept 헤더 추가
    );

    // 상품 등록 (POST)
    @PostMapping( consumes = "multipart/form-data")
    ResponseEntity<ProdUploadResponseDTO> addProduct(
            @RequestPart("mainPicture") MultipartFile mainPicture,
            @RequestPart("productData") ProdUploadRequestDTO dto,
            @RequestHeader("Authorization") String token
    );

    // 상품 수정 (PUT)
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    ResponseEntity<Map<String, Object>> editProduct(
            @PathVariable("id") Long id,
            @RequestParam(value = "mainPicture", required = false) MultipartFile mainPicture,
            @RequestPart("dto") ProdUploadRequestDTO dto
    );

    // 상품 삭제 (DELETE)
    @DeleteMapping("/detail/{id}")
    ResponseEntity<Map<String, Object>> removeProduct(@PathVariable Long id);

    // 상품 상세 조회 (GET)
    @GetMapping("/detail/{id}")
    ProdReadResponseDTO loadProductDetails(@PathVariable Long id);

    // 상품 수정용 클라이언트
    @GetMapping("/edit/{id}")
    ProdReadResponseDTO getProductEdit(@PathVariable("id") Long id);

    // 이제 얘가 상품 상세 조회 (GET)
    @GetMapping("/detail/po/{id}")
    ProdReadResponseDTO loadProductDetail(
            @PathVariable("id") Long id,
            @RequestHeader("Authorization") String token
    );

    // 판매자가 상품 보기
    @GetMapping("/myMarket")
    Page<ProdReadResponseDTO> loadmyProduct(
            @RequestParam("page") int page,
            @RequestParam("size") int size,
            @RequestHeader("Authorization") String token
    );

    @PostMapping("/list/cart")
    List<ProdReadResponseDTO> getProductsByIds(@RequestBody List<Long> productIds);
}