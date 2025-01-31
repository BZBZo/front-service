package com.example.spring.bzfrontservice.controller;

import com.example.spring.bzfrontservice.dto.CongDongIngDTO;
import com.example.spring.bzfrontservice.dto.ProdUploadRequestDTO;
import com.example.spring.bzfrontservice.dto.ProdUploadResponseDTO;
import com.example.spring.bzfrontservice.service.SellerService;
import com.example.spring.bzfrontservice.service.UserService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/product")
@RequiredArgsConstructor
public class SellerApiController {

    private final SellerService sellerService;
    private final UserService userService;

    // 상품 등록 (POST)
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<ProdUploadResponseDTO> addProduct(
            @RequestPart("mainPicture") MultipartFile mainPicture,
            @RequestPart("productData") String productDataJson,
            @RequestHeader("Authorization") String token // Authorization 헤더 추가
    ) {
        log.info("Authorization Header: {}", token);
        try {
            // JSON 문자열을 객체로 변환
            ObjectMapper objectMapper = new ObjectMapper();
            ProdUploadRequestDTO dto = objectMapper.readValue(productDataJson, ProdUploadRequestDTO.class);

            log.info("Received isCong value: {}", dto.isCong());
            log.info("Received  value: {}", dto);

            // **UserService를 통해 memberNo 조회**
            Long memberNo = userService.getMemberNo(token);
            log.info("Fetched memberNo: {}", memberNo);

            // **memberNo를 DTO에 설정**
            dto.setSellerId(memberNo);

            log.info("DTO received in seller: {}", dto); // 여기서 DTO 내부 값 확인
            log.info("SellerId in DTO: {}", dto.getSellerId());

            // 상품 등록 처리 (token 추가 전달)
            sellerService.save(dto, mainPicture, token); // 수정된 서비스 호출
            log.info("Product registered successfully");

            // 응답 DTO 생성 후 반환
            ProdUploadResponseDTO responseDTO = ProdUploadResponseDTO.builder()
                    .url("/product/myMarket")
                    .mainPicturePath(dto.getMainPicturePath())
                    .build();

            log.info("Returning response: {}", responseDTO);
            return ResponseEntity.ok(responseDTO);

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
    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    public ResponseEntity<Map<String, Object>> updateProduct(
            @PathVariable Long id,
            @RequestPart(value = "mainPicture", required = false) MultipartFile mainPicture, // 이미지 파일 (선택적)
            @RequestPart("productData") ProdUploadRequestDTO dto // JSON 데이터 (DTO로 변환)
    ) {
        try {
            // condition 검증: 올바른 JSON 형식인지 확인
            if (dto.getCondition() == null || dto.getCondition().isEmpty()) {
                dto.setCondition("{\"1\":0}"); // 기본값 설정
            }

            // condition을 JSON으로 파싱하여 올바른 형식인지 검증
            try {
                new ObjectMapper().readTree(dto.getCondition()); // JSON으로 파싱 시도
            } catch (JsonProcessingException e) {
                throw new IllegalArgumentException("Condition 필드는 유효한 JSON 형식이어야 합니다.");
            }

            // 필수 필드 검증
            if (dto.getName() == null || dto.getName().trim().isEmpty()) {
                throw new IllegalArgumentException("상품 이름은 필수입니다.");
            }
            if (dto.getPrice() == null || dto.getPrice() <= 0) {
                throw new IllegalArgumentException("상품 가격은 1 이상이어야 합니다.");
            }
            if (dto.getQuantity() == null || dto.getQuantity().trim().isEmpty()) {
                throw new IllegalArgumentException("상품 수량은 필수입니다.");
            }
            if (dto.getCategory() == null || dto.getCategory().trim().isEmpty()) {
                throw new IllegalArgumentException("상품 카테고리는 필수입니다.");
            }

            // description에서 HTML 태그 제거 (간단한 처리)
            String filteredDescription = Jsoup.parse(dto.getDescription()).text(); // HTML 제거
            dto.setDescription(filteredDescription);

            // mainPicture가 null인 경우 처리
            if (mainPicture != null && !mainPicture.isEmpty()) {
                // 파일 업로드 처리 (파일명 생성 등)
                String fileName = mainPicture.getOriginalFilename();
                String filePath = "/uploads/" + fileName; // 실제 저장 경로 설정 (여기서는 예시)
                dto.setMainPicturePath(filePath);
            } else {
                // 파일이 없을 경우, 기존 mainPicturePath만 갱신
                dto.setMainPicturePath(dto.getMainPicturePath() != null ? dto.getMainPicturePath() : "");
            }

            log.info("DTO received in Controller: {}", dto);
            log.info("Seller ID in DTO: {}", dto.getSellerId());

            // 상품 수정 서비스 호출
            sellerService.updateProduct(id, dto, mainPicture);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (IllegalArgumentException e) {
            // 입력값 오류 처리
            log.warn("잘못된 상품 ID 입력 {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            // 예기치 못한 오류 처리
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

    @PostMapping("/congdong")
    public ResponseEntity<CongDongIngDTO> startCongdong(
            @RequestBody Map<String, Object> requestBody, // JSON 데이터 받기
            @RequestHeader("Authorization") String token // Authorization 헤더 추가
    ) {
        log.info("Token received in Seller Controller: {}", token);

        if (token == null || token.isEmpty()) {
            throw new IllegalStateException("Authorization token is missing");
        }

        // 현재 사용자 memberNo 가져오기
        Long memberNo = userService.getMemberNo(token);
        log.info("Extracted memberNo: {}", memberNo);

        // JSON 요청에서 productId와 condition 추출
        Long productId = Long.valueOf(requestBody.get("productId").toString());
        String condition = requestBody.get("condition").toString();

        log.info("Received request to start CongDong: productId={}, condition={}", productId, condition);

        // congs에 memberNo 추가 (처음 공동구매 참여자)
        List<Long> congs = new ArrayList<>();
        congs.add(memberNo);
        log.info("공동구매 참여자 목록 (congs): {}", congs);


        // 서비스 호출 (productId, condition, token 전달)
        CongDongIngDTO congdong = sellerService.startCongdong(productId, condition, token, congs);

        return ResponseEntity.ok(congdong);
    }

}