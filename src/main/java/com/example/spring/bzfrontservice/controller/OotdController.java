package com.example.spring.bzfrontservice.controller;

import com.example.spring.bzfrontservice.client.SellerClient;
import com.example.spring.bzfrontservice.dto.OotdResponseDTO;
import com.example.spring.bzfrontservice.dto.ProdReadResponseDTO;
import com.example.spring.bzfrontservice.service.OotdIntegrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Controller
@RequiredArgsConstructor
@RequestMapping("/ootd")
public class OotdController {
    private final OotdIntegrationService ootdIntegrationService;
    private final SellerClient sellerClient;

    @GetMapping("/list")
    public String getOotdListPage(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            Model model) {
        try {
            List<OotdResponseDTO> ootdList = ootdIntegrationService.getOotdListWithDetails(authorization);
            model.addAttribute("ootdList", ootdList);
            return "ootd_list";
        } catch (Exception e) {
            model.addAttribute("errorMessage", "OOTD 데이터를 불러오는 중 오류가 발생했습니다.");
            return "error";
        }
    }

    @GetMapping("/write")
    public String renderWritePage(Model model) {
        model.addAttribute("user", getUserInfo());
        return "ootd_write";
    }



    private Object getUserInfo() {
        return Map.of(
                "nickname", "miyoung",
                "profileImageUrl", "/images/default-profile.png",
                "id", "12345"
        );
    }

    @GetMapping("/search/products")
    @ResponseBody
    public List<ProdReadResponseDTO> searchProducts(@RequestParam String keyword) {
        // SellerClient에서 페이지 기반으로 전체 상품을 가져옴
        Page<ProdReadResponseDTO> allProducts = sellerClient.getProductList(0, 100, "application/json");

        // 키워드로 필터링
        return allProducts.getContent().stream()
                .filter(product -> product.getName().toLowerCase().contains(keyword.toLowerCase()))
                .collect(Collectors.toList());
    }

}


