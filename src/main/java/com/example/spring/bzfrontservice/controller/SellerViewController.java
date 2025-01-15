
package com.example.spring.bzfrontservice.controller;

import com.example.spring.bzfrontservice.dto.ProdReadResponseDTO;
import com.example.spring.bzfrontservice.service.SellerService;
import com.example.spring.bzfrontservice.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/product")
public class SellerViewController {

    private final SellerService sellerService;
    private final UserService userService;

    // 상품 목록 조회 (HTML 반환)
    @GetMapping("/list")
    public String productList(@RequestParam(defaultValue = "0") int page, Model model) {
        int pageSize = 5;

        Page<ProdReadResponseDTO> productPage = sellerService.findAll(page, pageSize);
        log.info("Response: {}", productPage);
        List<ProdReadResponseDTO> products = productPage.getContent();
        log.info("Products: {}", products);

        int totalPages = productPage.getTotalPages();
        int pageBlock = 10; // 페이지 블록 크기
        int startPage = (page / pageBlock) * pageBlock;
        int endPage = Math.min(startPage + pageBlock - 1, totalPages - 1);

        model.addAttribute("products", products);
        model.addAttribute("productPage", productPage);
        model.addAttribute("startPage", startPage);
        model.addAttribute("endPage", endPage);
        model.addAttribute("showPrevious", startPage > 0);
        model.addAttribute("showNext", endPage < totalPages - 1);

        return "product_list";
    }

    // 상품 등록 페이지
    @GetMapping("/upload")
    public String uploadProduct() {
        return "product_upload";
    }

    // 상품 상세 페이지
    @GetMapping("/detail/po/{productId}")
    public String productDetail(
            @PathVariable Long productId,
            @RequestHeader(value = "Authorization", required = false) String token,
            Model model
    ) {
        System.out.println("Token received in Seller Controller: " + token);

        if (token == null || token.isEmpty()) {
            throw new IllegalStateException("Authorization token is missing");
        }

        // 현재 사용자 memberNo 가져오기
        Long memberNo = userService.getMemberNo(token);
        log.info("How memberNo?: {}", memberNo);

        ProdReadResponseDTO product = sellerService.getProductDetailto(productId, token);
        log.info("Response product: {}", product);

        // 사용자와 상품 소유자 확인
        boolean isOwner = product.getSellerId().equals(memberNo);

        // 로그 추가
        log.info("Product Seller ID: {}", product.getSellerId());
        log.info("Current User MemberNo: {}", memberNo);
        log.info("Is Owner: {}", isOwner);

        model.addAttribute("product", product);
        model.addAttribute("isOwner", isOwner);

        return "product_detail"; // product_detail.html 반환
    }

    // 상품 수정 페이지
    @GetMapping("/edit/{id}")
    public String editProduct(@PathVariable Long id, Model model) {
        log.info("Editing product with ID: {}", id);
        ProdReadResponseDTO product = sellerService.getProductEditInfo(id);
        log.info("Editing product: {}", product);
        model.addAttribute("product", product);
        return "product_edit";
    }
}