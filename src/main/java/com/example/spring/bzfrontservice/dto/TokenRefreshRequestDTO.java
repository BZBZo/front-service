package com.example.spring.bzfrontservice.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TokenRefreshRequestDTO {
    private String refreshToken;
    private String accessToken;
}
