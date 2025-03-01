package com.example.spring.bzfrontservice.controller;

import com.example.spring.bzfrontservice.dto.*;
import com.example.spring.bzfrontservice.service.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@Slf4j
@Controller
@RequiredArgsConstructor
@RequestMapping("/customer")
public class CustomerController {
    private final UserService userService;
    private final SellerService sellerService;
    private final CustomerService customerService;
    private final CongdongService congdongService;

    // 상품 상세 페이지
    @GetMapping("/product/detail/{id}")
    public String productDetail(@PathVariable("id") Long productId, Model model) {
        // 서비스 계층을 통해 상품 상세 정보 가져오기
        ProdReadResponseDTO product = sellerService.getProductDetails(productId);
        Integer count = customerService.countReview(productId);
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

    @GetMapping("/cart/list")
    public String cart(){
        return "cart";
    }



    @GetMapping("/history/review/{productId}/{purchaseId}")
    public String writeReview(@PathVariable Long productId,
                              @PathVariable Long purchaseId,
                              Model model) {

        model.addAttribute("productId", productId);
        model.addAttribute("purchaseId", purchaseId);

        return "review_write";
    }

    @GetMapping("/history/review/detail/{productId}/{purchaseId}/{memberNo}")
    public String detailReview(@PathVariable Long productId,
                               @PathVariable Long purchaseId,
                               @PathVariable Long memberNo,
                               Model model) {

        model.addAttribute("productId", productId);
        model.addAttribute("purchaseId", purchaseId);
        model.addAttribute("memberNo", memberNo);

        ReviewDTO review = customerService.findReviewByIds(purchaseId, productId, memberNo);
        model.addAttribute("review", review);

        return "review_detail";
    }

    @GetMapping("/alarm")
    public String congAlarm(){

        return "congAl";
    }
}
