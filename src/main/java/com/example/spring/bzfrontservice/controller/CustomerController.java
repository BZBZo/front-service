package com.example.spring.bzfrontservice.controller;

import com.example.spring.bzfrontservice.dto.SecurityUserDTO;
import com.example.spring.bzfrontservice.service.UserService;
import lombok.RequiredArgsConstructor;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.Reader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Controller
@RequiredArgsConstructor
@RequestMapping("/customer")
public class CustomerController {
    private final UserService userService;

    @GetMapping("/cart/list")
    public String cart(){
        return "cart";
    }

    // 바로 구매
    @GetMapping("/payment")
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

        return "checkout";
    }

    @GetMapping("/payment/success")
    public String successPayment(@RequestParam String paymentKey,
                                 @RequestParam String orderId,
                                 @RequestParam String amount,
                                 @RequestParam String paymentType){
        // paymentKey도 반드시 저장해야됨
        return "success";
    }

    @GetMapping("/payment/fail")
    public String failPayment(@RequestParam String code,
                              @RequestParam String message,
                              @RequestParam String orderId){
        return "fail";
    }

}
