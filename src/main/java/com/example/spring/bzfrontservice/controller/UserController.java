package com.example.spring.bzfrontservice.controller;

import com.example.spring.bzfrontservice.dto.CongDongIngDTO;
import com.example.spring.bzfrontservice.dto.OotdResponseDTO;
import com.example.spring.bzfrontservice.dto.ProdReadResponseDTO;
import com.example.spring.bzfrontservice.dto.SecurityUserDTO;
import com.example.spring.bzfrontservice.service.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Controller
@RequiredArgsConstructor
@RequestMapping("/webs")
public class UserController {
    private final UserService userService;
    private final SellerService sellerService;
    private final ReviewService reviewService;
    private final CongdongService congdongService;
    private final OotdIntegrationService ootdService;

    @GetMapping("/signin")
    public String login() {
        return "signin";
    }

    @GetMapping("/loginSuccess")
    public String home(Model model) {
        // 전체 상품 가져오기
        Page<ProdReadResponseDTO> products = sellerService.findAll(0, 10);

        List<ProdReadResponseDTO> allProducts = sellerService.getAllProducts();

        // 공구 가능 상품 필터링
        List<ProdReadResponseDTO> congproducts = allProducts.stream()
                .filter(ProdReadResponseDTO::isCong)
                .collect(Collectors.toList());

        // 진행 중인 공구 상품 가져오기
        List<CongDongIngDTO> ingProducts = sellerService.getCongDongActiveProducts();

        List<CongDongIngDTO> activeProducts = ingProducts.stream()
                .filter(product -> "ing".equals(product.getState()))
                .collect(Collectors.toList());

        List<OotdResponseDTO> ootdList = ootdService.getRecentOotds(5); // 최근 5개 가져오기
        model.addAttribute("ootdList", ootdList); // 모델에 데이터 추가

        // 로그 확인
        System.out.println("✅ 공구 가능 상품 개수: " + congproducts.size());
        System.out.println("✅ 진행 중인 공구 개수: " + activeProducts.size());

        // 모델에 데이터 추가
        model.addAttribute("products", products);
        model.addAttribute("congproducts", congproducts);
        model.addAttribute("activeProducts", activeProducts);

        return "home";
    }


    @GetMapping("/join")
    public String join(@RequestParam String email, @RequestParam String provider, @RequestParam String role, Model model){
        System.out.println("role" + role);
        model.addAttribute("email", email);
        model.addAttribute("provider", provider);
        model.addAttribute("role", role);

        return "join";
    }

    @GetMapping("/profile")
    public String profile(){

        return "profile";
    }

    // 상품 상세 페이지
    @GetMapping("/customer/product/detail/{id}")
    public String productDetail(@PathVariable("id") Long productId, Model model) {
        // 서비스 계층을 통해 상품 상세 정보 가져오기
        ProdReadResponseDTO product = sellerService.getProductDetails(productId);
        Integer count = reviewService.countReview(productId);
        log.info("상품 상세 정보: {}", product);
        SecurityUserDTO sellerInfo= userService.loadMemberDetail(product.getSellerId());

        // **공동구매 진행 정보 가져오기**
        List<CongDongIngDTO> congdongIngList = congdongService.getCongDongIngByProductId(productId);
        log.info("공동구매 진행 목록: {}", congdongIngList);

        // 모델에 데이터 추가
        model.addAttribute("reviewCount", count);
        model.addAttribute("product", product);
        model.addAttribute("sellerInfo", sellerInfo);
        model.addAttribute("congdongIngList", congdongIngList); // congsList → congdongIngList 변경

        return "product_detail_all";
    }
}
