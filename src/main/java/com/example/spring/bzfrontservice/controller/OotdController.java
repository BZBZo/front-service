package com.example.spring.bzfrontservice.controller;

import com.example.spring.bzfrontservice.dto.OotdResponseDTO;
import com.example.spring.bzfrontservice.service.OotdService;
import com.example.spring.bzfrontservice.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/ootd")
public class OotdController {

    private final OotdService ootdService;
    private final UserService userService;

    @GetMapping("/list")
    public String getOotdListPage(@CookieValue(value = "Authorization", required = false) String authorization,
                                  @RequestParam(value = "selectedOotdId", required = false) Long selectedOotdId,
                                  Model model) {
        List<OotdResponseDTO> ootdList = ootdService.getOotdListWithDetails(authorization);
        model.addAttribute("ootdList", ootdList);

        if (selectedOotdId != null) {
            model.addAttribute("selectedOotdId", selectedOotdId);
        }

        return "ootd_list";
    }

    @GetMapping("/write")
    public String renderWritePage(@CookieValue(value = "Authorization", required = false) String authorization,
                                  Model model) {
        // 사용자 정보 가져오기
        Map<String, Serializable> userInfo = userService.fetchUserInfo(authorization);
        log.info("userInfo: {}", userInfo);


        model.addAttribute("user", userInfo);
        return "ootd_write";
    }

    @GetMapping("/{id}")
    public String myStylePage(@PathVariable Long id,
                              @CookieValue(value = "Authorization", required = false) String authorization,
                              @RequestParam(value = "selectedOotdId", required = false) Long selectedOotdId,
                              Model model) {
        // 사용자 정보 가져오기
        Map<String, Serializable> userInfo = userService.fetchUserInfo(authorization);

            // 특정 사용자의 OOTD 리스트 가져오기
            List<OotdResponseDTO> userOotds = ootdService.getOotdsByUserId(id, authorization);
            log.info("Fetched OOTDs: {}", userOotds);  // OOTD 리스트 로그 추가

            model.addAttribute("userId", id);
            model.addAttribute("ootds", userOotds);
            model.addAttribute("user", userInfo);
            if (selectedOotdId != null) {
                model.addAttribute("selectedOotdId", selectedOotdId);
            }

        return "mystyle";
    }


}


