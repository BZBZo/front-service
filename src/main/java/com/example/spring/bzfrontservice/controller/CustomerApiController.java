package com.example.spring.bzfrontservice.controller;

import com.example.spring.bzfrontservice.client.CustomerClient;
import com.example.spring.bzfrontservice.dto.CartRequestDTO;
import com.example.spring.bzfrontservice.dto.CartResponseDTO;
import com.example.spring.bzfrontservice.dto.ProductQuantityDTO;
import com.example.spring.bzfrontservice.service.CartService;
import com.example.spring.bzfrontservice.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
public class CustomerApiController {

    private final CustomerClient customerClient;
    private final UserService userService;
    private final CartService cartService;

    @PostMapping("/add")
    public ResponseEntity<String> addToCart(
            @RequestBody CartRequestDTO cartRequest,
            @RequestHeader("Authorization") String token) {
        customerClient.addToCart(cartRequest, token);
        return ResponseEntity.ok("장바구니에 추가되었습니다.");
    }

    // 장바구니 목록 가져오기
    @GetMapping("/list")
    public ResponseEntity<List<ProductQuantityDTO>> getCartItems(@RequestHeader("Authorization") String token) {
        Long memberNo = userService.getMemberNo(token);
        return ResponseEntity.ok(customerClient.getCartItems(memberNo));
    }
}

