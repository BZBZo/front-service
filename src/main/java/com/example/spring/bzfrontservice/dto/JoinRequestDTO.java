package com.example.spring.bzfrontservice.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class JoinRequestDTO {
    private Long memberNo;
    private String email;
    private String nickname;
    private String phone;
    private String provider;
    private String role;
    private String businessNumber;
}
