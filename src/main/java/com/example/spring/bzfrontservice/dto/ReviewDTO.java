package com.example.spring.bzfrontservice.dto;

import jakarta.persistence.Transient;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Getter
@Setter
@Builder
public class ReviewDTO {
    private Long reviewId;

    private String content;
    private LocalDateTime date;

    private Long memberNo;
    private Long productId;
    private Long purchaseId;

    private String picturePath;

}
