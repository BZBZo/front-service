package com.example.spring.bzfrontservice.controller;

import com.example.spring.bzfrontservice.client.SellerClient;
import com.example.spring.bzfrontservice.dto.OotdRequestDTO;
import com.example.spring.bzfrontservice.dto.OotdResponseDTO;
import com.example.spring.bzfrontservice.dto.ProdReadResponseDTO;
import com.example.spring.bzfrontservice.dto.ProductDTO;
import com.example.spring.bzfrontservice.service.OotdIntegrationService;
import com.example.spring.bzfrontservice.service.UserService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Controller
@RequiredArgsConstructor
@RequestMapping("/ootd")
public class OotdController {
    private static final Logger log = LoggerFactory.getLogger(OotdController.class);
    private final OotdIntegrationService ootdIntegrationService;
    private final SellerClient sellerClient;
    private final UserService userService;

    @GetMapping("/list")
    public String getOotdListPage(@CookieValue(value = "Authorization", required = false) String authorization,
                                  Model model) {
        List<OotdResponseDTO> ootdList = ootdIntegrationService.getOotdListWithDetails(authorization);
        model.addAttribute("ootdList", ootdList);
        return "ootd_list";
    }

    @GetMapping("/write")
    public String renderWritePage(@CookieValue(value = "Authorization", required = false) String authorization,
                                  Model model) {
        // 사용자 정보 가져오기
        Map<String, String> userInfo = userService.fetchUserInfo(authorization);
        log.info("userInfo: {}", userInfo);
        String nickname = userInfo.get("nickname");
        String profileImageUrl=userInfo.get("profilePic");


        model.addAttribute("user", userInfo);
        return "ootd_write";
    }

}


