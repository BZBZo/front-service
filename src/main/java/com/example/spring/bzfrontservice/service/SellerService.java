package com.example.spring.bzfrontservice.service;


import com.example.spring.bzfrontservice.client.SellerClient;
import com.example.spring.bzfrontservice.dto.CongdongDTO;
import com.example.spring.bzfrontservice.dto.ProdReadResponseDTO;
import com.example.spring.bzfrontservice.dto.ProdUploadRequestDTO;
import com.example.spring.bzfrontservice.dto.ProdUploadResponseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
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

    public void save(ProdUploadRequestDTO dto, MultipartFile mainPicture) throws IOException {
        log.info("Received isCong: {}", dto.isCong());

        // 1. 파일 저장
        String mainPicturePath = saveFile(mainPicture);
        dto.setMainPicturePath(mainPicturePath);

        // 2. 상품 등록 요청 (파일과 DTO 전달)
        ResponseEntity<ProdUploadResponseDTO> response = sellerClient.addProduct(mainPicture, dto);

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


//    public Long save(ProdUploadRequestDTO dto, MultipartFile mainPicture) throws IOException {
//        log.info("Received isCong: {}", dto.isCong());
//
//        // 1. 파일 저장
//        String mainPicturePath = saveFile(mainPicture);
//        dto.setMainPicturePath(mainPicturePath);
//
//        // 2. 상품 등록 요청 (파일과 DTO 전달)
//        ResponseEntity<ProdUploadResponseDTO> response = sellerClient.addProduct(mainPicture, dto);
//
//        log.info("Response body: {}", response.getBody()); // 응답 전체를 먼저 출력
//
//        // 3. 응답 처리
//        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
//            Long productId = response.getBody().getProductId(); // DTO에서 상품 ID 직접 가져오기
//            log.info("Received productId: {}", productId);  // 여기서 productId를 로그로 출력
//
//            // 상품 ID 처리
//            if (dto.isCong() && productId == null) {
//                // isCong이 true일 때만 상품 ID가 필요함
//                log.error("상품 ID가 응답에 포함되지 않았습니다.");
//                throw new RuntimeException("상품 ID가 응답에 포함되지 않았습니다.");
//            }
//
//            // 상품 ID가 유효하면 Congdong 추가 처리
//            log.info("상품 ID: {}", productId);
//            saveCongdong(dto, productId); // Congdong 추가 처리
//            return productId;
//        } else {
//            log.error("상품 등록 실패: 응답 본문이 없습니다.");
//            throw new RuntimeException("상품 등록 실패: " +
//                    (response.getBody() == null ? "응답 본문이 없습니다." : "상태 코드: " + response.getStatusCode()));
//        }
//    }

//    public Long save(ProdUploadRequestDTO dto, MultipartFile mainPicture) throws IOException {
//        log.info("Received isCong: {}", dto.isCong());
//
//        // 1. 파일 저장
//        String mainPicturePath = saveFile(mainPicture);
//        dto.setMainPicturePath(mainPicturePath);
//
//        // 2. 상품 등록 요청 (파일과 DTO 전달)
//        ResponseEntity<ProdUploadResponseDTO> response = sellerClient.addProduct(mainPicture, dto);
//
//        log.info("Response: {}", response); // 응답 전체를 먼저 출력
//
//        // 3. 응답 처리
//        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
//            Long productId = response.getBody().getProductId(); // DTO에서 상품 ID 직접 가져오기
//            log.info("Response body: {}", response.getBody());
//            log.info("Received productId: {}", productId);  // 여기서 productId를 로그로 출력
//            log.error("상품 ID가 응답에 포함되지 않았습니다.");
////            if (productId == null) {
////                log.error("상품 ID가 응답에 포함되지 않았습니다.");
////                throw new RuntimeException("상품 ID가 응답에 포함되지 않았습니다.");
////            }
//            log.info("상품 ID: {}", productId);
//            saveCongdong(dto, productId); // Congdong 추가 처리
//            return productId;
//        } else {
//            log.error("상품 등록 실패: 응답 본문이 없습니다.");
//            throw new RuntimeException("상품 등록 실패: " +
//                    (response.getBody() == null ? "응답 본문이 없습니다." : "상태 코드: " + response.getStatusCode()));
//        }
//    }

    public void updateProduct(Long id, ProdUploadRequestDTO dto) throws IOException {
        // 외부 API를 통해 상품 정보를 조회 (기존 DB 조회 코드 제거)
        ProdReadResponseDTO product = sellerClient.getProductDetail(id);

        // 받은 데이터로 수정할 정보를 설정
        String filteredDescription = filterDescription(dto.getDescription());
        dto.setDescription(filteredDescription);

        // 외부 API를 통해 상품 수정 요청
        ResponseEntity<Map<String, Object>> response = sellerClient.editProduct(id, dto);

        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException("상품 수정 실패");
        }

        // 상품 수정 후 Congdong 상태 업데이트
        updateCongdong(id, dto);
    }

    // 상품 삭제
    public void deleteProduct(Long id) {
        ResponseEntity<Map<String, Object>> response = sellerClient.removeProduct(id);
        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException("상품 삭제 실패");
        }

        // 해당 상품에 대한 Congdong 삭제
        deleteCongdong(id);
    }

    // 상품 상세 조회
    public ProdReadResponseDTO getProductDetails(Long id) {
        return sellerClient.getProductDetail(id);
    }

    // 판매자 상품 등록 검증
    public void verifySellerProduct(ProdUploadRequestDTO dto) {
        ResponseEntity<Map<String, Object>> response = sellerClient.verifySellerProduct(dto);
        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException("판매자 상품 등록 검증 실패");
        }
    }

    // 상품 상태 조회
    public Map<String, Object> getProductStatus(Long id) {
        ResponseEntity<Map<String, Object>> response = sellerClient.getProductStatus(id);
        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException("상품 상태 조회 실패");
        }
        return response.getBody();
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
            sellerClient.updateCongdong(productId, congdongDTO); // 외부 API 호출하여 Congdong 업데이트
            log.info("Congdong updated for product ID: {}", productId);
        } else {
            log.info("No Congdong update for product ID: {} because isCong is false", productId);
        }
    }

    // Congdong 삭제
    private void deleteCongdong(Long productId) {
        sellerClient.deleteCongdongByProductId(productId); // 외부 API 호출하여 Congdong 삭제
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
}
//package com.example.spring.bzfrontservice.service;
//
//
//import com.example.spring.bzfrontservice.client.SellerClient;
//import com.example.spring.bzfrontservice.dto.CongdongDTO;
//import com.example.spring.bzfrontservice.dto.ProdReadResponseDTO;
//import com.example.spring.bzfrontservice.dto.ProdUploadRequestDTO;
//import com.example.spring.bzfrontservice.dto.ProdUploadResponseDTO;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.jsoup.Jsoup;
//import org.jsoup.safety.Safelist;
//import org.springframework.data.domain.Page;
//import org.springframework.data.domain.Pageable;
//import org.springframework.http.ResponseEntity;
//import org.springframework.stereotype.Service;
//import org.springframework.util.StringUtils;
//import org.springframework.web.multipart.MultipartFile;
//
//import java.io.IOException;
//import java.nio.file.Files;
//import java.nio.file.Path;
//import java.nio.file.Paths;
//import java.nio.file.StandardCopyOption;
//import java.util.Map;
//
//
//@Slf4j
//@Service
//@RequiredArgsConstructor
//public class SellerService {
//
//    private final SellerClient sellerClient;
//
//    public Page<ProdReadResponseDTO> findAll(Pageable pageable) {
//        return sellerClient.getProductList(pageable.getPageNumber(), pageable.getPageSize());
//    }
//
//    public Long save(ProdUploadRequestDTO dto, MultipartFile mainPicture) throws IOException {
//        // 1. 파일 저장
//        String mainPicturePath = saveFile(mainPicture);
//        dto.setMainPicturePath(mainPicturePath);
//
//        // 2. 상품 등록 요청 (파일과 DTO 전달)
//        ResponseEntity<ProdUploadResponseDTO> response = sellerClient.addProduct(mainPicture, dto);
//
//        log.info("Response: {}", response); // 응답 전체를 먼저 출력
//
//        // 3. 응답 처리
//        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
//            Long productId = response.getBody().getProductId(); // DTO에서 상품 ID 직접 가져오기
//            if (productId == null) {
//                log.error("상품 ID가 응답에 포함되지 않았습니다.");
//                throw new RuntimeException("상품 ID가 응답에 포함되지 않았습니다.");
//            }
//            log.info("상품 ID: {}", productId);
//            saveCongdong(dto, productId); // Congdong 추가 처리
//            return productId;
//        } else {
//            log.error("상품 등록 실패: 응답 본문이 없습니다.");
//            throw new RuntimeException("상품 등록 실패: " +
//                    (response.getBody() == null ? "응답 본문이 없습니다." : "상태 코드: " + response.getStatusCode()));
//        }
//    }
//
//    public void updateProduct(Long id, ProdUploadRequestDTO dto) throws IOException {
//        // 외부 API를 통해 상품 정보를 조회 (기존 DB 조회 코드 제거)
//        ProdReadResponseDTO product = sellerClient.getProductDetail(id);
//
//        // 받은 데이터로 수정할 정보를 설정
//        String filteredDescription = filterDescription(dto.getDescription());
//        dto.setDescription(filteredDescription);
//
//        // 외부 API를 통해 상품 수정 요청
//        ResponseEntity<Map<String, Object>> response = sellerClient.editProduct(id, dto);
//
//        if (!response.getStatusCode().is2xxSuccessful()) {
//            throw new RuntimeException("상품 수정 실패");
//        }
//
//        // 상품 수정 후 Congdong 상태 업데이트
//        updateCongdong(id, dto);
//    }
//
//    // 상품 삭제
//    public void deleteProduct(Long id) {
//        ResponseEntity<Map<String, Object>> response = sellerClient.removeProduct(id);
//        if (!response.getStatusCode().is2xxSuccessful()) {
//            throw new RuntimeException("상품 삭제 실패");
//        }
//
//        // 해당 상품에 대한 Congdong 삭제
//        deleteCongdong(id);
//    }
//
//    // 상품 상세 조회
//    public ProdReadResponseDTO getProductDetails(Long id) {
//        return sellerClient.getProductDetail(id);
//    }
//
//    // 판매자 상품 등록 검증
//    public void verifySellerProduct(ProdUploadRequestDTO dto) {
//        ResponseEntity<Map<String, Object>> response = sellerClient.verifySellerProduct(dto);
//        if (!response.getStatusCode().is2xxSuccessful()) {
//            throw new RuntimeException("판매자 상품 등록 검증 실패");
//        }
//    }
//
//    // 상품 상태 조회
//    public Map<String, Object> getProductStatus(Long id) {
//        ResponseEntity<Map<String, Object>> response = sellerClient.getProductStatus(id);
//        if (!response.getStatusCode().is2xxSuccessful()) {
//            throw new RuntimeException("상품 상태 조회 실패");
//        }
//        return response.getBody();
//    }
//
//    // Congdong 저장
//    private void saveCongdong(ProdUploadRequestDTO dto, Long productId) {
//        if (dto.isCong()) {
//            CongdongDTO congdongDTO = CongdongDTO.builder()
//                    .productId(productId)
//                    .condition(dto.getCondition())
//                    .build();
//            sellerClient.saveCongdong(congdongDTO); // 외부 API 호출하여 Congdong 저장
//            log.info("Congdong saved for product ID: {}", productId);
//        } else {
//            log.info("No Congdong saved for product ID: {} because isCong is false", productId);
//        }
//    }
//
//    // Congdong 업데이트
//    private void updateCongdong(Long productId, ProdUploadRequestDTO dto) {
//        if (dto.isCong()) {
//            CongdongDTO congdongDTO = CongdongDTO.builder()
//                    .productId(productId)
//                    .condition(dto.getCondition())
//                    .build();
//            sellerClient.updateCongdong(productId, congdongDTO); // 외부 API 호출하여 Congdong 업데이트
//            log.info("Congdong updated for product ID: {}", productId);
//        } else {
//            log.info("No Congdong update for product ID: {} because isCong is false", productId);
//        }
//    }
//
//    // Congdong 삭제
//    private void deleteCongdong(Long productId) {
//        sellerClient.deleteCongdongByProductId(productId); // 외부 API 호출하여 Congdong 삭제
//        log.info("Congdong deleted for product ID: {}", productId);
//    }
//
//    // 필터링 메서드
//    private String filterDescription(String description) {
//        if (description == null || description.isEmpty()) {
//            return ""; // 빈 값 처리
//        }
//
//        // 허용할 태그 정의
//        Safelist safelist = Safelist.basicWithImages()
//                .addTags("a") // 필요한 태그 추가
//                .addAttributes("a", "href", "target") // 링크 태그의 허용 속성 추가
//                .addAttributes("img", "src", "alt", "title"); // 이미지 태그의 허용 속성 추가
//
//        // HTML 파싱 및 클린 처리
//        String cleanedDescription = Jsoup.clean(description, safelist);
//
//        // 불필요한 태그 제거: <p>, <br> 등만 남은 경우
//        cleanedDescription = cleanedDescription.replaceAll("(?i)<(br|p|/p|\\s)*?>", "").trim();
//
//        // 결과가 빈 문자열이면 빈 값 반환
//        return cleanedDescription.isEmpty() ? "" : cleanedDescription;
//    }
//
//    // 파일 저장 메서드
//    private String saveFile(MultipartFile file) throws IOException {
//        // 파일 저장 디렉토리 설정
//        String uploadDir = "src/main/resources/static/uploads/";
//        String fileName = generateUniqueFileName(file.getOriginalFilename());
//        Path filePath = Paths.get(uploadDir + fileName);
//
//        if (!Files.exists(filePath.getParent())) {
//            Files.createDirectories(filePath.getParent());
//        }
//        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
//
//        // 상대 경로 반환 (클라이언트 접근 가능)
//        return "/uploads/" + fileName;
//    }
//
//    private String generateUniqueFileName(String originalName) {
//        String baseName = StringUtils.stripFilenameExtension(originalName);
//        String extension = StringUtils.getFilenameExtension(originalName);
//        return baseName + "_" + System.currentTimeMillis() + "." + extension;
//    }
//}