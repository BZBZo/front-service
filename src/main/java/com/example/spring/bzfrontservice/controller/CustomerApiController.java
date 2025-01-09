package com.example.spring.bzfrontservice.controller;

import com.example.spring.bzfrontservice.client.CartClient;
import com.example.spring.bzfrontservice.dto.CartRequestDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
public class CustomerApiController {

    private final CartClient cartClient;

    @PostMapping("/add")
    public ResponseEntity<String> addToCart(@RequestBody CartRequestDTO cartRequest,
                                            @RequestHeader("Authorization") String token) {
        cartClient.addToCart(cartRequest, token); // FeignClient 호출
        return ResponseEntity.ok("장바구니에 추가되었습니다.");
    }

}
