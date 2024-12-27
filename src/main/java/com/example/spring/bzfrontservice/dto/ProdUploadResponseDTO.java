package com.example.spring.bzfrontservice.dto;

import lombok.Builder;
import lombok.Data;
import lombok.Getter;

@Getter
@Builder
@Data
public class ProdUploadResponseDTO {
    private String url;
    private String mainPicturePath; // mainPicturePath 필드 추가
    private Long productId; // 상품 ID 추가
}
