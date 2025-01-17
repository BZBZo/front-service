package com.example.spring.bzfrontservice.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class CartRequestDTO {
    private Long productId;
    private Long memberNo;
    private Integer quantity; // 추가된 필드

    // 기본 생성자
    public CartRequestDTO() {
    }

    public CartRequestDTO(Long productId, Long memberNo, Integer quantity) {
        this.productId = productId;
        this.memberNo = memberNo;
        this.quantity = quantity;
    }
}



