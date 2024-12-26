package com.example.spring.bzfrontservice.service;

import com.example.spring.bzfrontservice.client.AuthClient;
import com.example.spring.bzfrontservice.dto.JoinRequestDTO;
import com.example.spring.bzfrontservice.dto.JoinResponseDTO;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserService {
    private final AuthClient authClient;

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    public ResponseEntity<JoinResponseDTO> join(JoinRequestDTO joinRequestDTO) {
        return authClient.join(joinRequestDTO);
    }

    public ResponseEntity<?> checkBusinessNumber(String authorizationHeader, String businessNumber) {
        return authClient.checkBusinessNumber(authorizationHeader, businessNumber);
    }

    public ResponseEntity<?> checkNickname(String authorizationHeader, String nickname) {
        return authClient.checkNickname(authorizationHeader, nickname);
    }

    public ResponseEntity<?> checkSellerPhone(String authorizationHeader, String sellerPhone) {
        return authClient.checkSellerPhone(authorizationHeader, sellerPhone);
    }

    public ResponseEntity<?> checkCustomerPhone(String authorizationHeader, String customerPhone) {
        return authClient.checkCustomerPhone(authorizationHeader, customerPhone);
    }

    public ResponseEntity<?> loadUserInfo(String authorizationHeader) {
        // 전달된 Authorization 헤더 로그
        logger.info("UserService received Authorization Header: {}", authorizationHeader);

        return authClient.loadUserInfo(authorizationHeader);
    }

    public boolean updateField(String authorizationHeader, String field, String newValue) {
        try {
            Map<String, String> valueMap = new HashMap<>();
            valueMap.put(field, newValue);
            ResponseEntity<?> response = authClient.updateUserField(authorizationHeader, field, valueMap);
            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            logger.error("Error updating user field: {}", e.getMessage());
            return false;
        }
    }

//    이미지 업로드 (미완)
//    public boolean updateImage(String authorizationHeader, String field, MultipartFile file) {
//        try {
//            ResponseEntity<?> response = authClient.updateUserImage(authorizationHeader, field, file);
//            return response.getStatusCode().is2xxSuccessful();
//        } catch (Exception e) {
//            logger.error("Error updating user image: {}", e.getMessage());
//            return false;
//        }
//    }



    public boolean deleteUser(String authorizationHeader) {
        try {
            ResponseEntity<String> response = authClient.deleteUser(authorizationHeader);
            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            logger.error("Error deleting user: {}", e.getMessage());
            return false;
        }
    }
}