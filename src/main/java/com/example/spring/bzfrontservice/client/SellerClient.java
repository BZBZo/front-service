package com.example.spring.bzfrontservice.client;


import com.example.spring.bzfrontservice.dto.*;
import feign.Headers;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

@FeignClient(name = "sellerClient", url = "${bzbzo.bz-edge-service-url}/product")
public interface SellerClient {

    @GetMapping("/list")
    Page<ProdReadResponseDTO> getProductList(
            @RequestParam("page") int page,
            @RequestParam("size") int size,
            @RequestHeader("Accept") String acceptHeader); // Accept 헤더 추가

    // 상품 등록 (POST)
    @PostMapping( consumes = "multipart/form-data")
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
    @DeleteMapping("/detail/{id}")
    ResponseEntity<Map<String, Object>> removeProduct(@PathVariable Long id);

    // 상품 상세 조회 (GET)
    @GetMapping("/detail/{id}")
    ProdReadResponseDTO getProductDetail(@PathVariable Long id);

    // seller 관련 기능 - 예를 들어 판매자 상품 등록을 위한 추가 기능
    @PostMapping("/seller/product/verify")
    ResponseEntity<Map<String, Object>> verifySellerProduct(@ModelAttribute ProdUploadRequestDTO dto);

    // seller 관련 기능 - 예를 들어 상품 상태 조회
    @GetMapping("/seller/product/status/{id}")
    ResponseEntity<Map<String, Object>> getProductStatus(@PathVariable Long id);

    // Congdong 업데이트 (PUT)
    @PutMapping("/product/congdong/{id}")
    ResponseEntity<Map<String, Object>> updateCongdong(
            @PathVariable Long id,
            @RequestBody CongdongDTO congdongDTO
    );
}