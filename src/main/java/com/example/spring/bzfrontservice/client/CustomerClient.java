package com.example.spring.bzfrontservice.client;

import com.example.spring.bzfrontservice.dto.CartRequestDTO;
import com.example.spring.bzfrontservice.dto.ProductQuantityDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(name = "CustomerClient", url = "${bzbzo.bz-edge-service-url}/customer/cart")
public interface CustomerClient {

    @PostMapping("/add")
    void addToCart(@RequestBody CartRequestDTO cartRequest,
                   @RequestHeader("Authorization") String token);

    @GetMapping("/list")
    List<ProductQuantityDTO> getCartItems(@RequestHeader("Authorization") String token);
}

