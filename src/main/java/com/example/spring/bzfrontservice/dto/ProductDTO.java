package com.example.spring.bzfrontservice.dto;

import lombok.Builder;
import lombok.Data;
import lombok.Getter;

@Data
@Builder
@Getter
public class ProductDTO {
    private Long id; // 상품 ID 추가
    private String name;
    private String mainPicturePath;
    private Integer price;
    private String description;
    private boolean isCong;
}