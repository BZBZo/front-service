package com.example.spring.bzfrontservice.service;

import com.example.spring.bzfrontservice.client.AuthClient;
import com.example.spring.bzfrontservice.dto.RefreshTokenClientResponseDTO;
import com.example.spring.bzfrontservice.dto.TokenRefreshRequestDTO;
import com.example.spring.bzfrontservice.dto.ValidTokenRequestDTO;
import com.example.spring.bzfrontservice.util.CookieUtil;
import jakarta.servlet.http.Cookie;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TokenService {
    private final AuthClient authClient;

    public RefreshTokenClientResponseDTO refreshToken(Cookie[] cookies) {
        String accessTokenFromCookies = CookieUtil.getTokenFromCookies(cookies, "Authorization");

        if (accessTokenFromCookies == null){
            return null;
        }
        TokenRefreshRequestDTO build = TokenRefreshRequestDTO.builder()
                .accessToken(accessTokenFromCookies)
                .build();

        return authClient.refresh(build);
    }

    public ResponseEntity<?> validToken(ValidTokenRequestDTO validTokenRequestDTO) {
        System.out.println(validTokenRequestDTO.getToken() + " : 클라이언트에서 받은 dto에서 뽑은 값 ");
        System.out.println(validTokenRequestDTO + " : 서버로 넘기는 값");
        return authClient.validToken(validTokenRequestDTO);
    }
}