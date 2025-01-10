package com.example.spring.bzfrontservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProdUploadRequestDTO {
    private String name;
    private Integer price;
    private String quantity;
    private String category;
    private String description;
    private MultipartFile mainPicture; // 메인 이미지 파일
    private String mainPicturePath; // 메인 이미지 경로 추가
    @JsonProperty("isCong")
    private boolean isCong;
    private String condition; // 모집인원과 할인율 정보를 JSON 형식으로 저장
    private Long sellerId;

}

