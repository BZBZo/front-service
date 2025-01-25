package com.example.spring.bzfrontservice.controller;

import com.example.spring.bzfrontservice.dto.PurchaseHistoryDTO;
import com.example.spring.bzfrontservice.dto.SecurityUserDTO;
import com.example.spring.bzfrontservice.service.PurchaseService;
import com.example.spring.bzfrontservice.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequiredArgsConstructor
@RequestMapping("/customer")
public class CustomerController {
    private final UserService userService;
    private final PurchaseService purchaseService;

    @GetMapping("/cart/list")
    public String cart(){
        return "cart";
    }

    // 바로 구매
    @GetMapping("/purchase/direct")
    public String showPaymentPage(@RequestParam("productId") Long productId,
                                  @RequestParam("price") Double price,
                                  @RequestParam("memberNo") Long memberNo,
                                  @RequestParam("quantity") Integer quantity,
                                  Model model) {
        SecurityUserDTO dto = userService.loadMemberDetail(memberNo);

        // 필요한 데이터를 모델에 추가
        model.addAttribute("productId", productId);
        model.addAttribute("price", price);
        model.addAttribute("quantity", quantity);
        model.addAttribute("totalPrice", quantity * price);
        model.addAttribute("member", dto);

        return "payment";
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
    public String history(@RequestParam Long memberNo, Model model){
        List<PurchaseHistoryDTO> purchases = purchaseService.getPurchaseListByMemberNo(memberNo);
        // 리뷰 여부 매핑은 다음에 하겠음
        // purchaseService.enrichPurchasesWithProducts(purchases);

        model.addAttribute("purchases", purchases);

        return "purchase_list";
    }

}
