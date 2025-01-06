package com.example.spring.bzfrontservice.client;

import com.example.spring.bzfrontservice.dto.*;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@FeignClient(name="authClient", url="${bzbzo.bz-auth-service-url}")
public interface AuthClient {

    Logger logger = LoggerFactory.getLogger(AuthClient.class);

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

    @GetMapping("/user/info")
    ResponseEntity<?> loadUserInfo(@RequestHeader("Authorization") String authorizationHeader);

    @PutMapping("/user/update/{field}")
    ResponseEntity<?> updateUserField(@RequestHeader("Authorization") String authorizationHeader,
                                      @PathVariable String field,
                                      @RequestBody Map<String, String> value);

//    이미지 업로드 (미완)
//    @PostMapping("/user/update/{field}")
//    ResponseEntity<?> updateUserImage(@RequestHeader("Authorization") String authorizationHeader,
//                                      @PathVariable String field,
//                                      @RequestPart("file") MultipartFile file);


    @DeleteMapping("/user/delete")
    ResponseEntity<String> deleteUser(@RequestHeader("Authorization") String authorizationHeader);

    //
//    @PostMapping("/token/refresh")
//    ResponseEntity<TokenResponseStatus> refresh(@RequestHeader("Authorization") final String accessToken);


    @PostMapping("/token/validToken")
    ResponseEntity<?> validToken(@RequestBody ValidTokenRequestDTO validTokenRequestDTO);

    @PostMapping("/token/refresh")
    RefreshTokenClientResponseDTO refresh(@RequestBody TokenRefreshRequestDTO tokenRefreshRequestDTO);

    @PostMapping("/token/logout")
    ResponseEntity<?> logout(@RequestHeader("Authorization") String accessToken);
}
