package com.example.spring.bzfrontservice.client;

import com.example.spring.bzfrontservice.dto.JoinRequestDTO;
import com.example.spring.bzfrontservice.dto.JoinResponseDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name="authClient", url="${bzbzo.bz-auth-service-url}")
public interface AuthClient {
    @PostMapping("/join")
    ResponseEntity<JoinResponseDTO> join(@RequestBody JoinRequestDTO joinRequestDTO);

    @PostMapping("/check/businessNumber")
    ResponseEntity<?> checkBusinessNumber(@RequestHeader("Authorization") String authorizationHeader, @RequestParam String businessNumber);

    @PostMapping("/check/nickname")
    ResponseEntity<?> checkNickname(@RequestHeader("Authorization") String authorizationHeader, @RequestParam String nickname);

    @PostMapping("/check/sellerPhone")
    ResponseEntity<?> checkSellerPhone(@RequestHeader("Authorization") String authorizationHeader, @RequestParam String sellerPhone);

    @PostMapping("/check/customerPhone")
    ResponseEntity<?> checkCustomerPhone(@RequestHeader("Authorization") String authorizationHeader, @RequestParam String customerPhone);

    //
//    @PostMapping("/refresh")
//    RefreshTokenClientResponseDTO refresh(@RequestBody RefreshTokenRequestDTO refreshTokenRequestDTO);
}
