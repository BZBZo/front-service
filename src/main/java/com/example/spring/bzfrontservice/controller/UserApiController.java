package com.example.spring.bzfrontservice.controller;

import com.example.spring.bzfrontservice.dto.JoinRequestDTO;
import com.example.spring.bzfrontservice.dto.JoinResponseDTO;
//import com.example.spring.bzfrontservice.service.FileStorageService;
//import com.example.spring.bzfrontservice.dto.StatusResponseDto;
import com.example.spring.bzfrontservice.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/webs")
public class UserApiController {
    private final UserService userService;
//    private final FileStorageService fileStorageService;

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

    @PutMapping("/user/update/{field}")
    public ResponseEntity<String> updateUserField(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authorizationHeader,
            @PathVariable String field,
            @RequestBody Map<String, String> value) {
        String newValue = value.get(field);
        boolean isUpdated = userService.updateField(authorizationHeader, field, newValue);
        if (isUpdated) {
            return ResponseEntity.ok("수정되었습니다.");
        } else {
            return ResponseEntity.badRequest().body("수정에 실패했습니다.");
        }
    }

//    이미지 업로드 (미완)
//    @PostMapping("/user/update/{field}")
//    public ResponseEntity<String> updateUserImage(
//            @PathVariable String field,
//            @RequestParam("file") MultipartFile file,
//            @RequestHeader("Authorization") String token) {
//
//        try {
//            // 파일 처리 로직 (예: 파일 저장)
//            if (file != null && !file.isEmpty()) {
//                String fileName = fileStorageService.store(file); // 파일 저장 로직
//                return ResponseEntity.ok("이미지가 업로드되었습니다.");
//            } else {
//                return ResponseEntity.badRequest().body("파일을 선택해주세요.");
//            }
//        } catch (Exception e) {
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("이미지 업로드에 실패했습니다.");
//        }
//    }


    @DeleteMapping("/user/delete")
    public ResponseEntity<String> deleteUser(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authorizationHeader) {
        boolean isDeleted = userService.deleteUser(authorizationHeader);
        if (isDeleted) {
            return ResponseEntity.ok("회원 탈퇴가 완료되었습니다.");
        } else {
            return ResponseEntity.badRequest().body("회원 탈퇴에 실패했습니다.");
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        System.out.println("logout" + request.getHeader(HttpHeaders.AUTHORIZATION));

        // Access Token 확인
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Access Token is missing or invalid.");
        }

        String token = authHeader.substring(7); // 'Bearer ' 이후의 토큰 값

        System.out.println(token +" : logout controller token 받았음");

        try{
            return userService.logout(token);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("logout 에러 발생");
        }

    }

}