package com.example.spring.bzfrontservice.service;


import com.example.spring.bzfrontservice.client.SellerClient;
import com.example.spring.bzfrontservice.dto.*;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;


@Slf4j
@Service
@RequiredArgsConstructor
public class SellerService {

    private final SellerClient sellerClient;

    public Page<ProdReadResponseDTO> findAll(int page, int size) {
        System.out.println("seller service findall");
        return sellerClient.getProductList(page, size, "application/json");
    }

    public void save(ProdUploadRequestDTO dto, MultipartFile mainPicture, String token) throws IOException {
        log.info("Received isCong: {}", dto.isCong());

        // 1. 파일 저장
        String mainPicturePath = saveFile(mainPicture);
        dto.setMainPicturePath(mainPicturePath);

        // 2. 상품 등록 요청 (파일과 DTO 전달)
        ResponseEntity<ProdUploadResponseDTO> response = sellerClient.addProduct(mainPicture, dto, token);

        log.info("Response body: {}", response.getBody()); // 응답 전체를 먼저 출력

        // 3. 응답 처리
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            log.info("상품 등록 성공, 응답 본문: {}", response.getBody());

            // `productId` 처리하지 않음
            saveCongdong(dto);  // Congdong 추가 처리 (상품 등록 후 후속 작업)
        } else {
            log.error("상품 등록 실패: 응답 본문이 없습니다.");
            throw new RuntimeException("상품 등록 실패: " +
                    (response.getBody() == null ? "응답 본문이 없습니다." : "상태 코드: " + response.getStatusCode()));
        }
    }

    public void updateProduct(Long id, ProdUploadRequestDTO dto, MultipartFile mainPicture) throws IOException {
        // 설명 필터링
        String filteredDescription = filterDescription(dto.getDescription());
        dto.setDescription(filteredDescription);
        log.info("Filtered Description: {}", filteredDescription);

        // 이미지 파일이 있을 경우, 저장하고 경로를 DTO에 설정
        if (mainPicture != null && !mainPicture.isEmpty()) {
            log.info("New main picture uploaded. File name: {}", mainPicture.getOriginalFilename());
            String mainPicturePath = saveFile(mainPicture); // 파일 저장
            dto.setMainPicturePath(mainPicturePath); // DTO에 이미지 경로 설정
            log.info("New image path set: {}", mainPicturePath);
        } else {
            // 이미지가 없을 경우 기존 경로 사용
            String existingPicturePath = dto.getMainPicturePath(); // 기존 이미지 경로
            if (existingPicturePath != null && !existingPicturePath.isEmpty()) {
                log.info("No new image uploaded. Using existing image path: {}", existingPicturePath);
                dto.setMainPicturePath(existingPicturePath); // 기존 경로를 그대로 사용
            } else {
                log.warn("No image provided and no existing image path found.");
            }
        }

        log.info("Starting product update for ID: {}", id);
        log.info("Updated DTO: {}", dto);

        // 외부 API를 통해 상품 수정 요청

        log.info("Sending request to SellerClient.editProduct with data: {}", dto);
        log.info("Main Picture: {}", mainPicture != null ? mainPicture.getOriginalFilename() : "No file uploaded");

        ResponseEntity<Map<String, Object>> response = sellerClient.editProduct(id, mainPicture, dto);

        log.info("Response from SellerClient: {}", response);

        if (!response.getStatusCode().is2xxSuccessful()) {
            log.error("Failed to update product with ID: {}, Response: {}", id, response);
            throw new RuntimeException("상품 수정 실패");
        }

        log.info("Product update API call successful for ID: {}", id);

        // 상품 수정 후 Congdong 상태 업데이트
        updateCongdong(id, dto);
        log.info("Congdong status updated for product ID: {}", id);

        log.info("Product update completed successfully for ID: {}", id);
    }

    // 상품 삭제
    public void deleteProduct(Long id) {
        log.info("Deleting product with ID: {}", id);

        ResponseEntity<Map<String, Object>> response = sellerClient.removeProduct(id);

        // 응답 로그
        log.info("Response from Seller Service: Status = {}, Body = {}", response.getStatusCode(), response.getBody());

        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException("상품 삭제 실패: " + response.getBody().get("message"));
        }

        // 해당 상품에 대한 Congdong 삭제
        deleteCongdong(id);
    }

    // 상품 수정 정보 조회
    public ProdReadResponseDTO getProductEditInfo(Long id) {
        log.info("Fetching product edit info for product ID: {}", id);

        // SellerClient를 통해 상품 수정 정보를 가져옵니다.
        return sellerClient.getProductEdit(id); // 클라이언트 메소드 호출
    }

    // 기냥 상품 상세 조회
    public ProdReadResponseDTO getProductDetails(Long id) {
        try {
            // 로그 추가: FeignClient 호출 전에 확인
            System.out.println("FeignClient 호출: ID=" + id);

            // FeignClient를 통해 상품 상세 정보 가져오기
            return sellerClient.loadProductDetails(id);
        } catch (FeignException e) {
            throw new RuntimeException("Failed to fetch product details: " + e.getMessage(), e);
        }
    }

    // 판매자 상품 상세 조회
    public ProdReadResponseDTO getProductDetailto(Long id, String token) {
        try {
            // 토큰 확인을 위한 로그
            System.out.println("Token being sent to Seller Service via Feign: " + token);
            // 로그 추가: FeignClient 호출 전에 확인
            System.out.println("FeignClient 호출: ID=" + id + ", Token=" + token);

            return sellerClient.loadProductDetail(id, token);
        } catch (FeignException e) {
            throw new RuntimeException("Failed to fetch product details: " + e.getMessage(), e);
        }
    }

    // 판매자가 상품 조회
    public Page<ProdReadResponseDTO> getProductsForSeller(int page, int size, String token) {
        try {
            // 토큰 확인을 위한 로그
            System.out.println("Token being sent to Seller Service via Feign: " + token);
            // 로그 추가: FeignClient 호출 전에 확인
            System.out.println("FeignClient Token=" + token);

            return sellerClient.loadmyProduct(page, size, token);
        } catch (FeignException e) {
            throw new RuntimeException("Failed to fetch product details: " + e.getMessage(), e);
        }
    }

    public List<ProdReadResponseDTO> getCongDongProducts() {
        log.info("[Front Service] FeignClient 호출 시작");
        List<ProdReadResponseDTO> products = sellerClient.getCongDongProducts();
        log.info("[Front Service] FeignClient 호출 완료. 받은 데이터: {}", products);
        return products;
    }

    public List<CongDongIngDTO> getCongDongActiveProducts() {
        log.info("[Front Service] FeignClient 호출 - 진행 중인 공구 리스트");
        List<CongDongIngDTO> activeProducts = sellerClient.getCongDongActiveProducts();
        log.info("[Front Service] 진행 중인 공구 리스트 로드 완료. 진행 중인 공구 수: {}", activeProducts.size());
        return activeProducts;
    }

    public CongDongIngDTO startCongdong(Long productId, String condition, String token, List<Long> congs) {
        log.info("Starting CongDong for productId: {}, condition: {}, congs={}", productId, condition, congs);

        // JSON 형태의 요청 데이터 생성
        Map<String, Object> requestBody = Map.of(
                "productId", productId,
                "condition", condition,
                "congs", congs
        );

        log.info("Request body: {}, Token: {}", requestBody, token);

        // FeignClient를 통해 seller-service 호출 (토큰 포함)
        ResponseEntity<CongDongIngDTO> response = sellerClient.startCongdong(requestBody, token);

        if (response.getStatusCode().is2xxSuccessful()) {
            log.info("CongDong started successfully: {}", response.getBody());
            return response.getBody();
        } else {
            log.error("Failed to start CongDong: {}", response.getStatusCode());
            throw new RuntimeException("공동구매 시작에 실패했습니다.");
        }
    }


    // Congdong 저장
    private void saveCongdong(ProdUploadRequestDTO dto) {
        if (dto.isCong()) {
            // condition을 CongdongDTO로 변환
            Map<Integer, Integer> conditionMap = CongdongDTO.parseCondition(dto.getCondition());

            CongdongDTO congdongDTO = CongdongDTO.builder()
                    .condition(CongdongDTO.formatCondition(conditionMap))  // 변환된 condition 설정
                    .build();

            // 이 부분에서 외부 API 호출을 제거하고, 실제로 저장만 진행하거나 콘솔에 출력
            log.info("Congdong saved with condition: {}", congdongDTO.getCondition());
        } else {
            log.info("No Congdong saved because isCong is false");
        }
    }

    // Congdong 업데이트
    private void updateCongdong(Long productId, ProdUploadRequestDTO dto) {
        if (dto.isCong()) {
            CongdongDTO congdongDTO = CongdongDTO.builder()
                    .productId(productId)
                    .condition(dto.getCondition())
                    .build();
            log.info("Congdong updated for Product ID: {}, Condition: {}", productId, congdongDTO.getCondition());
        } else {
            log.info("No Congdong update for Product ID: {} because isCong is false", productId);
        }
    }

    // Congdong 삭제
    private void deleteCongdong(Long productId) {
        log.info("Congdong deleted for product ID: {}", productId);
    }


    // 필터링 메서드
    private String filterDescription(String description) {
        if (description == null || description.isEmpty()) {
            return ""; // 빈 값 처리
        }

        // 허용할 태그 정의
        Safelist safelist = Safelist.basicWithImages()
                .addTags("a") // 필요한 태그 추가
                .addAttributes("a", "href", "target") // 링크 태그의 허용 속성 추가
                .addAttributes("img", "src", "alt", "title"); // 이미지 태그의 허용 속성 추가

        // HTML 파싱 및 클린 처리
        String cleanedDescription = Jsoup.clean(description, safelist);

        // 불필요한 태그 제거: <p>, <br> 등만 남은 경우
        cleanedDescription = cleanedDescription.replaceAll("(?i)<(br|p|/p|\\s)*?>", "").trim();

        // 결과가 빈 문자열이면 빈 값 반환
        return cleanedDescription.isEmpty() ? "" : cleanedDescription;
    }

    // 파일 저장 메서드
    private String saveFile(MultipartFile file) throws IOException {
        // 파일 저장 디렉토리 설정
        String uploadDir = "src/main/resources/static/uploads/";
        String fileName = generateUniqueFileName(file.getOriginalFilename());
        Path filePath = Paths.get(uploadDir + fileName);

        if (!Files.exists(filePath.getParent())) {
            Files.createDirectories(filePath.getParent());
        }
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // 상대 경로 반환 (클라이언트 접근 가능)
        return "/uploads/" + fileName;
    }

    private String generateUniqueFileName(String originalName) {
        String baseName = StringUtils.stripFilenameExtension(originalName);
        String extension = StringUtils.getFilenameExtension(originalName);
        return baseName + "_" + System.currentTimeMillis() + "." + extension;
    }

    public List<ProdReadResponseDTO> getAllProducts() {
        return sellerClient.getAllProducts();
    }

    public void saveSellerHistory(PurchaseDTO dto) {
        sellerClient.saveSellerHistory(dto);
    }

    public List<SaleHistoryDTO> getSaleHistoryBySellerID(Long userId) {
        return sellerClient.getSaleHistoryBySellerID(userId);
    }

    public void completeCongdong(Long id, List<Long> congs) {
        sellerClient.completeCongdong(id, congs);
    }

    public void updateCongPayState(Long congId, Long memberNo) {
        sellerClient.updateCongPayState(congId, memberNo);
    }
}