package com.example.spring.bzfrontservice.controller;

import com.example.spring.bzfrontservice.client.CustomerClient;
import com.example.spring.bzfrontservice.dto.CartRequestDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
public class CustomerApiController {

    private final CustomerClient customerClient;

    @PostMapping("/add")
    public ResponseEntity<String> addToCart(@RequestBody CartRequestDTO cartRequest,
                                            @RequestHeader("Authorization") String token) {
        System.out.println("Received token: " + token); // 로그 추가
        customerClient.addToCart(cartRequest, token);
        return ResponseEntity.ok("장바구니에 추가되었습니다.");
    }


}
