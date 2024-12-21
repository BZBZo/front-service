package com.example.spring.bzfrontservice.controller;

import com.example.spring.bzfrontservice.dto.AdDTO;
import com.example.spring.bzfrontservice.service.AdService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequiredArgsConstructor
@RequestMapping("/ad")
public class AdController {
    private final AdService adService;

    // 광고 등록 페이지
    @GetMapping("/write")
    public String showWritePage() {
        return "ad_write";
    }

    // 광고 상세 페이지
    @GetMapping("/detail/{id}")
    public String getAdDetail(@PathVariable Long id, Model model) {
        AdDTO adDTO = adService.getAdDetail(id);

        // 모델에 DTO 추가
        model.addAttribute("ad", adDTO);
        return "ad_detail";
    }

    @GetMapping("/edit/{id}")
    public String getEditPage(@PathVariable Long id, Model model) {
        AdDTO adDTO = adService.getAdDetail(id);

        // 모델에 DTO 추가
        model.addAttribute("ad", adDTO);
        return "ad_edit"; // 수정 페이지
    }


    @GetMapping("/list")
    public String showListPage(
            @RequestParam(defaultValue = "0") int page, // 페이지 번호
            @RequestParam(defaultValue = "10") int size, // 한 페이지에 보여줄 데이터 수
            Model model) {

        Page<AdDTO> adsPage = adService.getAds(page, size);

        model.addAttribute("ads", adsPage.getContent()); // 현재 페이지의 데이터
        model.addAttribute("currentPage", page); // 현재 페이지 번호
        model.addAttribute("totalPages", adsPage.getTotalPages()); // 전체 페이지 수

        return "ad_list";
    }
}
