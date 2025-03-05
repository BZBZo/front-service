package com.example.spring.bzfrontservice.service;

import com.example.spring.bzfrontservice.client.CustomerClient;
import com.example.spring.bzfrontservice.dto.ReviewDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerClient customerClient;

    public ResponseEntity<Map<String, String>> writeReview(Long memberNo, Long productId, Long purchaseId, String content, MultipartFile[] images) {
        return customerClient.writeReview(memberNo, productId, purchaseId, content, images);
    }

    public ReviewDTO findReviewByIds(Long purchaseId, Long productId, Long memberNo) {
        return customerClient.findReviewByIds(purchaseId,productId,memberNo);
    }

    public Page<ReviewDTO> findReviewsByProductId(Long productId, int page, int size) {
        return customerClient.findReviewsByProductId(productId, page, size,"application/json");
    }

    public Integer countReview(Long productId) {
        return customerClient.countReview(productId);
    }
}
