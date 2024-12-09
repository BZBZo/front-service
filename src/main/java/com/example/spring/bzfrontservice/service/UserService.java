package com.example.spring.bzfrontservice.service;

import com.example.spring.bzfrontservice.client.AuthClient;
import com.example.spring.bzfrontservice.dto.JoinRequestDTO;
import com.example.spring.bzfrontservice.dto.JoinResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private final AuthClient authClient;

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
}