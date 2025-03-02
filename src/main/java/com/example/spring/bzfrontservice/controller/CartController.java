package com.example.spring.bzfrontservice.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@Slf4j
@RequestMapping("/customer")
@RequiredArgsConstructor
public class CartController {
    @GetMapping("/cart/list")
    public String cart(){
        return "cart";
    }
}
