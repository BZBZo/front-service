package com.example.spring.bzfrontservice.controller;

import com.example.spring.bzfrontservice.dto.AdWriteRequestDTO;
import com.example.spring.bzfrontservice.service.AdService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/ad")
public class AdApiController {

    private final AdService adService;

    @PostMapping("/write")
    public ResponseEntity<?> saveAd(@RequestParam("adArea") String adPosition,
                                    @RequestParam("startDate") String adStart,
                                    @RequestParam("endDate") String adEnd,
                                    @RequestParam("adName") String adTitle,
                                    @RequestParam("adLink") String adUrl,
                                    @RequestParam("adImage") MultipartFile adImage){

        AdWriteRequestDTO adWriteRequestDTO = AdWriteRequestDTO.builder()
                .adPosition(adPosition)
                .adStart(adStart)
                .adEnd(adEnd)
                .adTitle(adTitle)
                .adUrl(adUrl)
                .adImage(adImage)
                .build();

        return adService.writeAd(adWriteRequestDTO);

    }
}
