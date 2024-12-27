package com.example.spring.bzfrontservice.client;


import com.example.spring.bzfrontservice.dto.CongdongDTO;
import com.example.spring.bzfrontservice.dto.ProdReadResponseDTO;
import com.example.spring.bzfrontservice.dto.ProdUploadRequestDTO;
import com.example.spring.bzfrontservice.dto.ProdUploadResponseDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@FeignClient(name = "sellerClient", url = "${bzbzo.bz-seller-service-url}")
public interface SellerClient {

    // 상품 목록 조회 (GET)
    @GetMapping("/product/list")
    @ResponseBody
    Page<ProdReadResponseDTO> getProductList(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    );

    // 상품 등록 (POST)
    @PostMapping(value = "/product", consumes = "multipart/form-data")
    ResponseEntity<ProdUploadResponseDTO> addProduct(
            @RequestPart("mainPicture") MultipartFile mainPicture,
            @RequestPart("productData") ProdUploadRequestDTO dto
    );

    // 3. 상품 수정 (PUT)
    @PutMapping("/product/{id}")
    ResponseEntity<Map<String, Object>> editProduct(
            @PathVariable Long id,
            @ModelAttribute ProdUploadRequestDTO dto
    );

    // 상품 삭제 (DELETE)
    @DeleteMapping("/product/detail/{id}")
    ResponseEntity<Map<String, Object>> removeProduct(@PathVariable Long id);

    // 상품 상세 조회 (GET)
    @GetMapping("/product/detail/{id}")
    ProdReadResponseDTO getProductDetail(@PathVariable Long id);

    // seller 관련 기능 - 예를 들어 판매자 상품 등록을 위한 추가 기능
    @PostMapping("/seller/product/verify")
    ResponseEntity<Map<String, Object>> verifySellerProduct(@ModelAttribute ProdUploadRequestDTO dto);

    // seller 관련 기능 - 예를 들어 상품 상태 조회
    @GetMapping("/seller/product/status/{id}")
    ResponseEntity<Map<String, Object>> getProductStatus(@PathVariable Long id);

    // Congdong 저장 (POST)
    @PostMapping("/product/congdong")
    ResponseEntity<Map<String, Object>> saveCongdong(@RequestBody CongdongDTO congdongDTO);

    // Congdong 업데이트 (PUT)
    @PutMapping("/product/congdong/{id}")
    ResponseEntity<Map<String, Object>> updateCongdong(
            @PathVariable Long id,
            @RequestBody CongdongDTO congdongDTO
    );

    // Congdong 삭제 (DELETE)
    @DeleteMapping("/product/congdong/{id}")
    ResponseEntity<Map<String, Object>> deleteCongdongByProductId(@PathVariable Long id);
}