package com.example.spring.bzfrontservice.service;

import com.example.spring.bzfrontservice.client.SellerClient;
import com.example.spring.bzfrontservice.dto.CongDongIngDTO;
import com.example.spring.bzfrontservice.dto.ProdReadResponseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class CongdongService {

    private final SellerClient sellerClient;

    public List<ProdReadResponseDTO> getCongDongProducts() {
        log.info("[Front Service] FeignClient 호출 시작");
        List<ProdReadResponseDTO> products = sellerClient.getCongDongProducts();
        log.info("[Front Service] FeignClient 호출 완료. 받은 데이터: {}", products);
        return products;
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

    public CongDongIngDTO joinCongdong(String token, Long productId, String condition, List<Long> congs) {
        log.info("🚀 공동구매 참여 요청 (Front Service) → productId={}, condition={}, congs={}", productId, condition, congs);

        // JSON 형태의 요청 데이터 생성
        Map<String, Object> requestBody = Map.of(
                "productId", productId,
                "condition", condition,
                "congs", congs // 기존 참여자 목록 (memberNo 포함)
        );

        log.info("📌 생성된 요청 바디: {}", requestBody);
        log.info("🔑 Token 포함: {}", token);

        // 🚀 FeignClient를 통해 seller-service 호출 (토큰 포함)
        ResponseEntity<CongDongIngDTO> response = sellerClient.joinCongdong(requestBody, token);

        if (response.getStatusCode().is2xxSuccessful()) {
            log.info("✅ 공동구매 참여 성공! 응답 데이터: {}", response.getBody());
            return response.getBody();
        } else {
            log.error("❌ 공동구매 참여 실패 - HTTP 상태 코드: {}", response.getStatusCode());
            throw new RuntimeException("공동구매 참여에 실패했습니다.");
        }
    }


    // **상품 ID로 공동구매 진행 중인 정보 가져오는 메서드**
    public List<CongDongIngDTO> getCongDongIngByProductId(Long productId) {
        log.info("공동구매 진행 정보 조회 요청 - productId: {}", productId);

        // Feign Client를 이용해 seller-service에서 공동구매 진행 정보 가져오기
        ResponseEntity<List<CongDongIngDTO>> response = sellerClient.getCongDongIngByProductId(productId);

        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            log.warn("공동구매 진행 정보 조회 실패 - productId: {}", productId);
            return Collections.emptyList(); // 빈 리스트 반환
        }

        List<CongDongIngDTO> congdongIngList = response.getBody();
        log.info("조회된 공동구매 목록: {}", congdongIngList);

        return congdongIngList;
    }

}
