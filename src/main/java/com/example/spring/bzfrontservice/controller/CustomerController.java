package com.example.spring.bzfrontservice.controller;

import com.example.spring.bzfrontservice.dto.PurchaseDTO;
import com.example.spring.bzfrontservice.dto.SecurityUserDTO;
import com.example.spring.bzfrontservice.service.PurchaseService;
import com.example.spring.bzfrontservice.service.UserService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

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

    // 주문 데이터 저장 로직 (샘플 메서드)
    private void saveOrderToDatabase(PurchaseDTO dto) {
        // 예제: 데이터베이스에 저장
        // 실제로는 서비스 클래스에서 처리하는 것이 더 적합
        System.out.println("Saving order to database...");
        System.out.println("Order Details: " + dto);
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
        List<PurchaseDTO> purchases = purchaseService.getPurchaseListByMemberNo(memberNo);
        System.out.println(Arrays.toString(purchases.toArray())+"  "+purchases.getFirst().getPurchaseId());
        purchaseService.enrichPurchasesWithProducts(purchases);

        model.addAttribute("purchases", purchases);

        return "purchase_list";
    }

    @GetMapping("/history/review/{productId}/{purchaseId}")
    public String writeReview(@PathVariable Long productId,
                              @PathVariable Long purchaseId,
                              Model model) {

        model.addAttribute("productId", productId);
        model.addAttribute("purchaseId", purchaseId);

        return "review_write";
    }

}
