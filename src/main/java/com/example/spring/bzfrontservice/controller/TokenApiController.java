package com.example.spring.bzfrontservice.controller;

import com.example.spring.bzfrontservice.dto.RefreshTokenClientResponseDTO;
import com.example.spring.bzfrontservice.dto.TokenRefreshResponseDTO;
import com.example.spring.bzfrontservice.dto.ValidTokenRequestDTO;
import com.example.spring.bzfrontservice.dto.ValidTokenResponseDTO;
import com.example.spring.bzfrontservice.service.TokenService;
import com.example.spring.bzfrontservice.util.CookieUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class TokenApiController {

    private final TokenService tokenService;

    @PostMapping("/refresh-token")
    ResponseEntity<?> refresh(
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        RefreshTokenClientResponseDTO responseDTO = tokenService.refreshToken(request.getCookies());

        if (responseDTO == null || responseDTO.getStatus() != 1 ) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Refresh Token 유효하지 않습니다.");
        }

//        CookieUtil.addCookie(response, "refreshToken", responseDTO.getRefreshToken(), 7*24*60*60);

        return ResponseEntity.ok(
                TokenRefreshResponseDTO.builder()
                        .accessToken(responseDTO.getAccessToken())
                        .status(responseDTO.getStatus())
                        .build()
        );
    }

    @PostMapping("/get-token")
    public ResponseEntity<Map<String, String>> getToken(HttpServletRequest request) {
        // 쿠키에서 accessToken을 가져옵니다.
        String accessTokenFromCookies = CookieUtil.getTokenFromCookies(request.getCookies(), "Authorization");

        // accessToken을 JSON 형식으로 응답
        Map<String, String> responseMap = new HashMap<>();
        responseMap.put("accessToken", accessTokenFromCookies);

        return ResponseEntity.ok(responseMap);
    }


    @PostMapping("/validToken")
    public ResponseEntity<?> validToken( @RequestBody ValidTokenRequestDTO validTokenRequestDTO) {
        System.out.println("컨트롤러 받는 값 : " + validTokenRequestDTO.getToken());
        return tokenService.validToken(validTokenRequestDTO);
    }

}