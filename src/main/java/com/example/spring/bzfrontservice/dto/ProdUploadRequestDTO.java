package com.example.spring.bzfrontservice.dto;

import lombok.Builder;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
@Builder
public class ProdUploadRequestDTO {
    private String name;
    private Integer price;
    private String quantity;
    private String category;
    private String description;
    private MultipartFile mainPicture; // 메인 이미지 파일
    private String mainPicturePath; // 메인 이미지 경로 추가
    private boolean isCong;
    private String condition; // 모집인원과 할인율 정보를 JSON 형식으로 저장
}