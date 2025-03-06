package com.example.spring.bzfrontservice.controller;

import com.example.spring.bzfrontservice.dto.*;
import com.example.spring.bzfrontservice.service.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Slf4j
@Controller
@RequiredArgsConstructor
@RequestMapping("/customer")
public class ReviewController {
    private final ReviewService reviewService;

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

        ReviewDTO review = reviewService.findReviewByIds(purchaseId, productId, memberNo);
        model.addAttribute("review", review);

        return "review_detail";
    }

    @GetMapping("/alarm")
    public String congAlarm(){

        return "congAl";
    }
}
