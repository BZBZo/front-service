package com.example.spring.bzfrontservice.dto;

import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Data
@Builder
@Getter
@Setter
public class OotdResponseDTO {
    private Long id;
    private Long memberNo;
    private String profilePic;
    private String nickname;
    private String imgUrls;
    private String title;
    private Integer heartNum;
    private String relProd; // 상품 ID 리스트
    private List<ProductDTO> products; // ProductDTO 리스트로 정의
}