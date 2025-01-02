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
@RequestMapping("/seller/product")
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
                    .url("/seller/product/list")
                    .mainPicturePath(dto.getMainPicturePath())
                    .build();  // productId가 없으므로 productId 부분을 제거

            log.info("Returning response: {}", responseDTO);
            return ResponseEntity.ok(responseDTO);  // 상품 등록 성공 응답

        } catch (Exception e) {
            log.error("상품 등록 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ProdUploadResponseDTO.builder()
                            .url("/seller/product/upload") // 실패 시 상품 등록 페이지로 돌아가도록 처리
                            .build()
            );
        }
    }

//    // 상품 등록 (POST)
//    @PostMapping(value = "/product", consumes = "multipart/form-data")
//    public ResponseEntity<ProdUploadResponseDTO> addProduct(
//            @RequestPart("mainPicture") MultipartFile mainPicture,
//            @RequestPart("productData") ProdUploadRequestDTO dto) {
//
//        try {
//            log.info("Received isCong value: {}", dto.isCong());  // isCong 값 확인
//
//            // 상품 저장 서비스 호출
//            Long productId = sellerService.save(dto, mainPicture);
//
//            // 응답 DTO 생성 후 반환
//            ProdUploadResponseDTO responseDTO = ProdUploadResponseDTO.builder()
//                    .url("/seller/product/list")
//                    .mainPicturePath(dto.getMainPicturePath())
//                    .productId(productId)  // 상품 ID 포함
//                    .build();
//
//            log.info("Returning response: {}", responseDTO);
//            return ResponseEntity.ok(responseDTO);  // 성공적으로 상품 등록 후 응답
//
//        } catch (Exception e) {
//            log.error("상품 등록 실패", e);
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
//                    ProdUploadResponseDTO.builder()
//                            .url("/seller/product/upload") // 실패 시 상품 등록 페이지로 돌아가도록 처리
//                            .build()
//            );
//        }
//    }


//    @PostMapping(consumes = "multipart/form-data")
//    public ResponseEntity<ProdUploadResponseDTO> addProduct(
//            @RequestPart("mainPicture") MultipartFile mainPicture,
//            @RequestPart("productData") String productDataJson) {
//
//        try {
//            // JSON 문자열을 객체로 변환
//            ObjectMapper objectMapper = new ObjectMapper();
//            ProdUploadRequestDTO dto = objectMapper.readValue(productDataJson, ProdUploadRequestDTO.class);
//
//            log.info("Received isCong value: {}", dto.isCong());  // isCong 값 확인
//
//            Long productId = sellerService.save(dto, mainPicture); // 수정된 서비스 호출
//            log.info("Product ID: {}", productId);
//            log.info("Product ID after save: {}", productId);  // productId 로그 찍기
//
//            // 응답 DTO 생성 후 반환
//            ProdUploadResponseDTO responseDTO = ProdUploadResponseDTO.builder()
//                    .url("/seller/product/list")
//                    .mainPicturePath(dto.getMainPicturePath())
//                    .productId(productId)
//                    .build();
//
//            log.info("Returning response: {}", responseDTO);
//            return ResponseEntity.ok(responseDTO); // 상품 등록이 성공적이면 200 OK와 함께 반환
//
//        } catch (Exception e) {
//            log.error("상품 등록 실패", e);
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
//                    ProdUploadResponseDTO.builder()
//                            .url("/seller/product/upload") // 실패 시 상품 등록 페이지로 돌아가도록 처리
//                            .build()
//            );
//        }
//    }

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