package com.example.spring.bzfrontservice.controller;

import com.example.spring.bzfrontservice.dto.CartRequestDTO;
import com.example.spring.bzfrontservice.dto.CartResponseDTO;
import com.example.spring.bzfrontservice.service.CartService;
import com.example.spring.bzfrontservice.service.CustomerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@Slf4j
@RequestMapping("/customer")
@RequiredArgsConstructor
public class CartApiController {
    private final CustomerService customerService;
    private final CartService cartService;

    @PostMapping("/cart/add")
    public ResponseEntity<String> addToCart(
            @RequestBody CartRequestDTO cartRequest,
            @RequestHeader("Authorization") String token) {
        cartService.addToCart(cartRequest, token);
        return ResponseEntity.ok("장바구니에 추가되었습니다.");
    }

    // 장바구니 목록 가져오기
    @GetMapping("/cart/list/items")
    public ResponseEntity<List<CartResponseDTO>> getCartItems(@RequestHeader("Authorization") String token) {
        List<CartResponseDTO> cartItems = cartService.getCartItems(token);
        return ResponseEntity.ok(cartItems);
    }
}
