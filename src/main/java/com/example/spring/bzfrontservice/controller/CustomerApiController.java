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
        customerClient.addToCart(cartRequest, token); // quantity 포함
        return ResponseEntity.ok("장바구니에 추가되었습니다.");
    }


}
