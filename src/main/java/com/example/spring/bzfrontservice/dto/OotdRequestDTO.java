package com.example.spring.bzfrontservice.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
@Getter
@Setter
public class OotdRequestDTO {
    private Long memberNo;  // 작성자 ID
    private String tags;     // 게시글 태그
    private MultipartFile imgUrls;  // 업로드된 이미지 경로
    private String relProd;   // 관련 상품 ID 문자열 (콤마로 구분)
    private String timestamp; // 작성 시간
}