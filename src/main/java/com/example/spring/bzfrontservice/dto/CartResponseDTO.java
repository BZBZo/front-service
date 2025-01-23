package com.example.spring.bzfrontservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor // 기본 생성자 추가
@AllArgsConstructor // 모든 필드를 포함하는 생성자 추가
public class CartResponseDTO {
    private Long productId;
    private String name;
    private String mainPicturePath;
    private int price;
    private int quantity;
}

