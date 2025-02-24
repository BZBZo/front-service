package com.example.spring.bzfrontservice.controller;

import com.example.spring.bzfrontservice.dto.CongDongIngDTO;
import com.example.spring.bzfrontservice.dto.ProdReadResponseDTO;
import com.example.spring.bzfrontservice.service.CongdongService;
import com.example.spring.bzfrontservice.service.SellerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@Controller
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/product")
public class CongdongController {
    private final CongdongService congdongService;
    private final SellerService sellerService;

    // 콩동 구매 리스트 페에지ㅣ
    @GetMapping("/congdong")
    public String loadCongDongPage(Model model) {
        log.info("[Front Service] 콩동 페이지 로드 시작");

        // FeignClient를 통해 데이터 가져오기
        List<ProdReadResponseDTO> products = congdongService.getCongDongProducts();

        List<CongDongIngDTO> activeProducts = sellerService.getCongDongActiveProducts();

        log.info("[Front Service] 콩동 데이터 로드 완료. 상품 수: {}", products.size());
        log.info("[Front Service] 상품 데이터: {}", products);

        model.addAttribute("products", products);
        model.addAttribute("activeProducts", activeProducts);
        return "congdongzone";
    }
}
