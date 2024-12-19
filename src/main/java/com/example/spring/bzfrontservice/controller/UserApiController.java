package com.example.spring.bzfrontservice.controller;

import com.example.spring.bzfrontservice.dto.JoinRequestDTO;
import com.example.spring.bzfrontservice.dto.JoinResponseDTO;
import com.example.spring.bzfrontservice.service.UserService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/webs")
public class UserApiController {
    private final UserService userService;

    private static final Logger logger = LoggerFactory.getLogger(UserApiController.class);

    @PostMapping("/join")
    public ResponseEntity<JoinResponseDTO> join(@RequestBody JoinRequestDTO joinRequestDTO) {
        return userService.join(joinRequestDTO);
    }

    @PostMapping("/check/businessNumber")
    public ResponseEntity<?> checkBusinessNumber(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader,
            @RequestParam String businessNumber) {
        return userService.checkBusinessNumber(authorizationHeader, businessNumber);
    }

    @PostMapping("/check/nickname")
    public ResponseEntity<?> checkNickname(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader,
            @RequestParam String nickname) {
        System.out.println(nickname);
        return userService.checkNickname(authorizationHeader, nickname);
    }

    @PostMapping("/check/sellerPhone")
    public ResponseEntity<?> checkSellerPhone(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader,
            @RequestParam String sellerPhone) {
        return userService.checkSellerPhone(authorizationHeader, sellerPhone);
    }

    @PostMapping("/check/customerPhone")
    public ResponseEntity<?> checkCustomerPhone(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader,
            @RequestParam String customerPhone) {
        return userService.checkCustomerPhone(authorizationHeader, customerPhone);
    }

    @GetMapping("/user/info")
    public ResponseEntity<?> loadUserInfo(@RequestHeader(value = HttpHeaders.AUTHORIZATION) String authorizationHeader) {
        // 요청 받은 Authorization 헤더 로그
        return userService.loadUserInfo(authorizationHeader);
    }

}
