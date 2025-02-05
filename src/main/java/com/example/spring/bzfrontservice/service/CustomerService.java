package com.example.spring.bzfrontservice.service;

import com.example.spring.bzfrontservice.client.CustomerClient;
import com.example.spring.bzfrontservice.dto.CartRequestDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerClient customerClient;

    public void addToCart(CartRequestDTO cartRequest, String token) {
        customerClient.addToCart(cartRequest, token);
    }

    public ResponseEntity<Map<String, String>> writeReview(Long memberNo, Long productId, Long purchaseId, String content, List<MultipartFile> images) {
        return customerClient.writeReview(memberNo, productId, purchaseId, content, images);
    }
}
