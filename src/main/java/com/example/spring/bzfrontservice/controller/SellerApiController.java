package com.example.spring.bzfrontservice.controller;

import com.example.spring.bzfrontservice.dto.ProdUploadRequestDTO;
import com.example.spring.bzfrontservice.dto.ProdUploadResponseDTO;
import com.example.spring.bzfrontservice.service.SellerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/seller/product")
@RequiredArgsConstructor
public class SellerApiController {

    private final SellerService sellerService;

    // 상품 등록 (POST)
    @PostMapping
    public ResponseEntity<ProdUploadResponseDTO> addProduct(
            @ModelAttribute ProdUploadRequestDTO dto,
            @RequestPart("mainPicture") MultipartFile mainPicture) {
        try {
            Long productId = sellerService.save(dto, mainPicture); // 수정된 서비스 호출
            log.info("Product ID: {}", productId);
            return ResponseEntity.ok(
                    ProdUploadResponseDTO.builder()
                            .url("/seller/product/list")
                            .mainPicturePath(dto.getMainPicturePath())
                            .build()
            );
        } catch (Exception e) {
            log.error("상품 등록 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ProdUploadResponseDTO.builder()
                            .url("/seller/product/upload")
                            .build()
            );
        }
    }

    // 상품 수정 (PUT)
    @PutMapping("/update/{id}")
    public ResponseEntity<Map<String, Object>> updateProduct(@PathVariable Long id, @ModelAttribute ProdUploadRequestDTO dto) {
        try {
            sellerService.updateProduct(id, dto); // 상품 수정
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            log.error("상품 수정 중 오류 발생 {}: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "상품 수정 중 서버 오류가 발생했습니다. 다시 시도해 주세요."
            ));
        }
    }

    // 상품 삭제 (DELETE)
    @DeleteMapping("/detail/{id}")
    public ResponseEntity<Map<String, Object>> removeProduct(@PathVariable Long id) {
        try {
            sellerService.deleteProduct(id); // 상품 삭제
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "상품이 성공적으로 삭제되었습니다.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "상품 삭제에 실패했습니다.");
            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED).body(response);
        }
    }

    // 판매자 상품 등록 검증 (POST)
    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifySellerProduct(@ModelAttribute ProdUploadRequestDTO dto) {
        try {
            sellerService.verifySellerProduct(dto); // 판매자 상품 등록 검증
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            log.error("판매자 상품 등록 검증 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("success", false, "message", "판매자 상품 등록 검증 실패"));
        }
    }

    // 상품 상태 조회 (GET)
    @GetMapping("/status/{id}")
    public ResponseEntity<Map<String, Object>> getProductStatus(@PathVariable Long id) {
        try {
            Map<String, Object> status = sellerService.getProductStatus(id); // 상품 상태 조회
            return ResponseEntity.ok(status);
        } catch (Exception e) {
            log.error("상품 상태 조회 실패 {}: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

}