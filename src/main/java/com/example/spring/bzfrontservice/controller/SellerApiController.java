package com.example.spring.bzfrontservice.controller;

import com.example.spring.bzfrontservice.dto.ProdUploadRequestDTO;
import com.example.spring.bzfrontservice.dto.ProdUploadResponseDTO;

import com.example.spring.bzfrontservice.service.SellerService;
import com.fasterxml.jackson.databind.ObjectMapper;
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
@RequestMapping("/product")
@RequiredArgsConstructor
public class SellerApiController {

    private final SellerService sellerService;

    // 상품 등록 (POST)
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<ProdUploadResponseDTO> addProduct(
            @RequestPart("mainPicture") MultipartFile mainPicture,
            @RequestPart("productData") String productDataJson) {

        try {
            // JSON 문자열을 객체로 변환
            ObjectMapper objectMapper = new ObjectMapper();
            ProdUploadRequestDTO dto = objectMapper.readValue(productDataJson, ProdUploadRequestDTO.class);

            log.info("Received isCong value: {}", dto.isCong());

            // 상품 등록 처리 (productId를 반환하지 않음)
            sellerService.save(dto, mainPicture); // 수정된 서비스 호출
            log.info("Product registered successfully");

            // 응답 DTO 생성 후 반환 (productId를 제거)
            ProdUploadResponseDTO responseDTO = ProdUploadResponseDTO.builder()
                    .url("/product/list")
                    .mainPicturePath(dto.getMainPicturePath())
                    .build();  // productId가 없으므로 productId 부분을 제거

            log.info("Returning response: {}", responseDTO);
            return ResponseEntity.ok(responseDTO);  // 상품 등록 성공 응답

        } catch (Exception e) {
            log.error("상품 등록 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ProdUploadResponseDTO.builder()
                            .url("/product/upload") // 실패 시 상품 등록 페이지로 돌아가도록 처리
                            .build()
            );
        }
    }

    // 상품 수정 (PUT)
    @PutMapping("/{id}")
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
        log.info("Received DELETE request for Product ID: {}", id);

        try {
            sellerService.deleteProduct(id);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "상품이 성공적으로 삭제되었습니다.");

            log.info("DELETE request processed successfully for Product ID: {}", id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error during DELETE request for Product ID: {}: {}", id, e.getMessage());

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "상품 삭제에 실패했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED).body(response);
        }
    }

}