package com.example.spring.bzfrontservice.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RefreshTokenClientResponseDTO {
    private int status;
    private String accessToken;
    private String refreshToken;
}
