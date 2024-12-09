package com.example.spring.bzfrontservice.dto;

import lombok.Getter;

@Getter
public class JoinClientResponseDTO {
    private boolean isSuccess;

    public JoinResponseDTO toJoinResponseDTO() {
        return JoinResponseDTO.builder()
                .isSuccess(isSuccess)
                .url(isSuccess ? "/webs/signin" : "/webs/join")
                .build();
    }
}
