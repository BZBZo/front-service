package com.example.spring.bzfrontservice.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SecurityUserDTO {
    private Long memberNo;
    private String email;
    private String nickname;
    private String phone;
    private String provider;
    private String userRole;
    private String businessNumber;
    private String profilePic;
    private String introduce;
}
