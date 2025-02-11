package com.example.spring.bzfrontservice.dto;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class CongDongIngDTO {
    private Long id;             // 공동구매 ID
    private Long productId;      // 상품 ID
    private String condition;    // 조건 (JSON 형태)
    private String congs;        // 참여자 목록 (JSON 형태)
    private LocalDateTime startAt; // 시작 시간
    private String state;
    private int discountedPrice;
    private String isPaid;

    private String name;            // 상품명
    private String mainPicturePath; // 상품 이미지 경로
    private Integer price;          // 상품 가격

    private List<Integer> congsList; // 변환된 참여자 목록
    private List<Integer> isPaidList; // 변환된 결제 상태

    public List<Integer> getIsPaidList() {
        try {
            return new ObjectMapper().readValue(this.isPaid, new TypeReference<List<Integer>>() {});
        } catch (Exception e) {
            return List.of(); // 변환 실패 시 빈 리스트 반환
        }
    }
}
