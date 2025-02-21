package com.example.spring.bzfrontservice.controller;

import com.example.spring.bzfrontservice.dto.PurchaseDTO;
import com.example.spring.bzfrontservice.dto.SecurityUserDTO;
import com.example.spring.bzfrontservice.service.PurchaseService;
import com.example.spring.bzfrontservice.service.UserService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Map;

@Slf4j
@Controller
@RequiredArgsConstructor
@RequestMapping("/customer")
public class PurchaseController {
    private final UserService userService;
    private final PurchaseService purchaseService;

    // 바로 구매
    @GetMapping("/purchase/direct")
    public String showPaymentPage(@RequestParam("productId") Long productId,
                                  @RequestParam("price") Double price,
                                  @RequestParam("memberNo") Long memberNo,
                                  @RequestParam("quantity") Integer quantity,
                                  @RequestParam("congId") Long congId,
                                  Model model) {
        SecurityUserDTO dto = userService.loadMemberDetail(memberNo);

        // 필요한 데이터를 모델에 추가
        model.addAttribute("productId", productId);
        model.addAttribute("price", price);
        model.addAttribute("quantity", quantity);
        model.addAttribute("totalPrice", quantity * price);
        model.addAttribute("member", dto);
        model.addAttribute("congId", congId);

        return "payment";
    }

    // 주문 요청 처리
    @GetMapping("/purchase/cart")
    public String processCartPurchase( @RequestParam(value = "orderId", required = false) String orderId,
                                       @RequestParam("totalAmount") Double totalAmount,
                                       @RequestParam("productList") String productListJson,
                                       @RequestParam("memberNo") Long memberNo,
                                       Model model) {
        ObjectMapper objectMapper = new ObjectMapper();
        List<Map<String, Object>> productList;
        try {
            productList = objectMapper.readValue(productListJson, new TypeReference<List<Map<String, Object>>>() {});
            System.out.println("productListJson: " + productListJson + ", productList: " + productList);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Invalid productList format", e);
        }

        System.out.println("Total Amount: " + totalAmount);
        System.out.println("Product List: " + productList);
        System.out.println("Member No: " + memberNo);

        SecurityUserDTO dto = userService.loadMemberDetail(memberNo);

        // 모델에 데이터 추가
        model.addAttribute("totalPrice", totalAmount);
        model.addAttribute("productList", productList);
        model.addAttribute("member", dto);

        return "payment2";
    }

    @GetMapping("/purchase/success")
    public String successPayment(@RequestParam String paymentKey,
                                 @RequestParam String orderId,
                                 @RequestParam String amount,
                                 @RequestParam String paymentType){


        return "pay_success";
    }

    @GetMapping("/purchase/fail")
    public String failPayment(@RequestParam String code,
                              @RequestParam String message,
                              @RequestParam String orderId){
        return "pay_fail";
    }

    @GetMapping("/history")
    public String history(
            @RequestParam Long memberNo,
            @RequestParam(defaultValue = "1") int page, // 기본값을 1로 설정
            @RequestParam(defaultValue = "5") int size,
            Model model) {

        Page<PurchaseDTO> purchasePage = purchaseService.getPurchaseListByMemberNo(memberNo, page, size);

        List<PurchaseDTO> purchases = purchasePage.getContent(); // 현재 페이지의 데이터만 가져옴
        purchaseService.enrichPurchasesWithProducts(purchases); // ✅ 상품 정보 추가

        model.addAttribute("purchases", purchases); // ✅ 상품 정보가 포함된 purchases 추가
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", purchasePage.getTotalPages());
        model.addAttribute("memberNo", memberNo);

        return "purchase_list";
    }
}
