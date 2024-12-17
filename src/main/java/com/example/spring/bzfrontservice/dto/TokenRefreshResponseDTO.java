package com.example.spring.bzfrontservice.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TokenRefreshResponseDTO {
    private int status;
    private String accessToken;
}
