package com.example.spring.bzfrontservice.client;

import com.example.spring.bzfrontservice.dto.CartRequestDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "CustomerClient", url = "${bzbzo.bz-edge-service-url}/customer")
public interface CustomerClient {

    @PostMapping("/cart/add")
    void addToCart(@RequestBody CartRequestDTO cartRequest,
                   @RequestHeader("Authorization") String token);
}
