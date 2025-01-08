package com.example.spring.bzfrontservice.controller;

import com.example.spring.bzfrontservice.dto.ProdReadResponseDTO;
import com.example.spring.bzfrontservice.service.SellerService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.stream.Collectors;

@Controller
@RequiredArgsConstructor
@RequestMapping("/webs")
public class UserController {

    private final SellerService sellerService;

    @GetMapping("/signin")
    public String login() {
        return "signin";
    }

    @GetMapping("/loginSuccess")
    public String home(Model model) {
        // findAll 메서드를 사용하여 상품 목록을 가져옵니다.
        Page<ProdReadResponseDTO> products = sellerService.findAll(0, 10); // 페이지 번호와 사이즈를 설정하여 데이터 가져오기

        // 공구 가능 상품만 필터링
        List<ProdReadResponseDTO> congproducts = products.getContent().stream()
                .filter(ProdReadResponseDTO::isCong)
                .collect(Collectors.toList()); // isCong이 true인 상품만 필터링

        // 데이터를 모델에 추가
        model.addAttribute("products", products); // 전체 상품 목록
        model.addAttribute("congproducts", congproducts); // 공구 가능 상품만 필터링한 목록

        // home 페이지로 이동
        return "home";
    }

    @GetMapping("/join")
    public String join(@RequestParam String email, @RequestParam String provider, @RequestParam String role, Model model){
        model.addAttribute("email", email);
        model.addAttribute("provider", provider);
        model.addAttribute("role", role);

        return "join";
    }

    @GetMapping("/profile")
    public String profile(){

        return "profile";
    }
}
