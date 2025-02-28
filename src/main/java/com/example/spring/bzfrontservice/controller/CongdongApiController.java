package com.example.spring.bzfrontservice.controller;

import com.example.spring.bzfrontservice.dto.CongDongIngDTO;
import com.example.spring.bzfrontservice.service.CongdongService;
import com.example.spring.bzfrontservice.service.SellerService;
import com.example.spring.bzfrontservice.service.UserService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@Slf4j
@RestController
@RequestMapping("/product")
@RequiredArgsConstructor
public class CongdongApiController {

    private final SellerService sellerService;
    private final CongdongService congdongService;
    private final UserService userService;

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
        CongDongIngDTO congdong = congdongService.startCongdong(productId, condition, token, congs);

        return ResponseEntity.ok(congdong);
    }

    @PutMapping("/congdong")
    public ResponseEntity<Map<String, Object>> joinCongdong(
            @RequestBody Map<String, Object> requestBody,
            @RequestHeader("Authorization") String token
    ) {
        log.info("✔ 공동구매 참여 요청 수신 (Front Controller)");
        log.info("✔ 요청 바디: {}", requestBody);

        if (token == null || token.isEmpty()) {
            throw new IllegalStateException("❌ Authorization token is missing");
        }

        // 🔥 현재 사용자 memberNo 가져오기
        Long memberNo = userService.getMemberNo(token);
        log.info("✔ Extracted memberNo: {}", memberNo);

        // 요청 데이터 추출
        Long productId = Long.valueOf(requestBody.get("productId").toString());
        String condition = requestBody.get("condition").toString();
        log.info("🔎 추출된 productId: {}, condition: {}", productId, condition);

        // 🚀 기존 공동구매 참여자 리스트 불러오기
        List<CongDongIngDTO> congdongList = congdongService.getCongDongIngByProductId(productId);
        log.info("📌 해당 상품 ID({})의 공동구매 목록 조회 완료: {}", productId, congdongList);

        // 🔎 조건 일치하는 공동구매 찾기
        CongDongIngDTO existingCongdong = congdongList.stream()
                .filter(congdong -> congdong.getCondition().equals(condition))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("❌ 해당 조건의 공동구매가 존재하지 않습니다."));

        // 🚀 기존 참여자 목록 가져오기 (DTO에서 JSON 변환)
        List<Long> congs = Optional.ofNullable(existingCongdong.getCongs())
                .map(json -> {
                    log.info("🔍 기존 congs(JSON): {}", json);
                    try {
                        return new ObjectMapper().readValue(json, new TypeReference<List<Long>>() {});
                    } catch (JsonProcessingException e) {
                        log.error("❌ JSON 파싱 실패, 빈 리스트 반환", e);
                        return new ArrayList<Long>();
                    }
                })
                .orElse(new ArrayList<>());

        // 🔥 현재 참여자가 이미 있는지 확인
        boolean alreadyJoined = congs.contains(memberNo);

        if (!alreadyJoined) {
            congs.add(memberNo);
            log.info("✔ 공동구매 참여자 추가 완료! 현재 congs 목록: {}", congs);
        } else {
            log.info("⚠ 이미 공동구매 참여 중: memberNo={}", memberNo);
        }

        // 🚀 FeignClient 호출 (최종 congs 포함)
        CongDongIngDTO congdong = congdongService.joinCongdong(token, productId, condition, congs);
        log.info("🚀 공동구매 참여 완료! 최종 응답 데이터: {}", congdong);

        log.info("✅ 현재 congs 리스트: {}", congs);

        // 🔎 congs 리스트 크기 가져오기
        int congsSize = congs.size();
        log.info("✅ 참가자 수 (congs size): {}", congsSize);

        // 🔎 condition의 key 값 가져오기
        int conditionKey = getConditionKey(condition);
        log.info("✅ 모집 인원 (condition key): {}", conditionKey);

        // 🔥 모집 인원이 꽉 찼는지 확인
        boolean isFull = congsSize >= conditionKey;

        if (isFull) {
            log.info("✅ 모집 완료!!");
            sellerService.completeCongdong(existingCongdong.getId(),congs);
        }

        // ✅ 응답 데이터에 `alreadyJoined` 및 `isFull` 추가
        Map<String, Object> response = new HashMap<>();
        response.put("congdong", congdong);
        response.put("alreadyJoined", alreadyJoined);

        return ResponseEntity.ok(response);
    }

    /**
     * condition의 key 값 추출 (예: "{5:6}" → 5)
     */
    private int getConditionKey(String condition) {
        try {
            condition = condition.replaceAll("[{}]", ""); // 중괄호 제거
            String[] parts = condition.split(":");
            return Integer.parseInt(parts[0].trim());
        } catch (Exception e) {
            log.error("❌ condition key 추출 실패: {}", e.getMessage());
            return -1; // 실패 시 -1 반환
        }
    }

}
