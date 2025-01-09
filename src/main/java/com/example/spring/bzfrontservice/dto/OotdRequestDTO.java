package com.example.spring.bzfrontservice.dto;

import lombok.Data;

import java.util.List;

@Data
public class OotdRequestDTO {
    private Long customerId;       // 작성자 ID
    private String title;          // 게시글 제목
    private String relProd;   // 관련 상품 ID 문자열 (콤마로 구분)
    private String imageUrl;       // 업로드된 이미지 URL
}