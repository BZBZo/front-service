package com.example.spring.bzfrontservice.dto;

import jakarta.persistence.Transient;
import lombok.Builder;
import lombok.Data;

import java.util.HashMap;
import java.util.Map;

@Data
@Builder
public class ProdReadResponseDTO {
    private Long id;
    private String name;
    private Integer price;
    private String mainPicture;
    private String mainPicturePath; // mainPicturePath 필드 추가
    private String description;
    private String quantity;
    private String category;
    private boolean isCong;
    private String condition; // condition 필드 추가
    private Long sellerId;

    // 리뷰 여부를 관리하는 Map
    @Transient // 이 필드는 데이터베이스에 저장되지 않음
    private Map<Long, Boolean> reviewedPurchases = new HashMap<>();

    // 특정 구매 ID에 대한 리뷰 상태를 반환
    public Boolean isReviewedForPurchase(Long purchaseId) {
        if (this.reviewedPurchases == null) {
            return false;  // `null` 체크
        }
        return this.reviewedPurchases.getOrDefault(purchaseId, false);
    }

    // 특정 구매 ID의 리뷰 상태를 설정
    public void setReviewedForPurchase(Long purchaseId, boolean reviewed) {
        reviewedPurchases.put(purchaseId, reviewed);
    }
}
