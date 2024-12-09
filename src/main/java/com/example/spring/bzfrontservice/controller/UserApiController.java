package com.example.spring.bzfrontservice.controller;

import com.example.spring.bzfrontservice.dto.JoinRequestDTO;
import com.example.spring.bzfrontservice.dto.JoinResponseDTO;
import com.example.spring.bzfrontservice.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/webs")
public class UserApiController {
    private final UserService userService;

    @PostMapping("/join")
    public ResponseEntity<JoinResponseDTO> join(@RequestBody JoinRequestDTO joinRequestDTO) {
        return userService.join(joinRequestDTO);
    }

    @PostMapping("/check/businessNumber")
    public ResponseEntity<?> checkBusinessNumber(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader,
            @RequestBody String businessNumber) {
        return userService.checkBusinessNumber(authorizationHeader, businessNumber);
    }

    @PostMapping("/check/nickname")
    public ResponseEntity<?> checkNickname(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader,
            @RequestBody String nickname) {
        return userService.checkNickname(authorizationHeader, nickname);
    }

    @PostMapping("/check/sellerPhone")
    public ResponseEntity<?> checkSellerPhone(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader,
            @RequestBody String sellerPhone) {
        return userService.checkSellerPhone(authorizationHeader, sellerPhone);
    }

    @PostMapping("/check/customerPhone")
    public ResponseEntity<?> checkCustomerPhone(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader,
            @RequestBody String customerPhone) {
        return userService.checkCustomerPhone(authorizationHeader, customerPhone);
    }

}
