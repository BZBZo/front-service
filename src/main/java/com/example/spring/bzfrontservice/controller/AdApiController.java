package com.example.spring.bzfrontservice.controller;

import com.example.spring.bzfrontservice.dto.AdEditRequestDTO;
import com.example.spring.bzfrontservice.dto.AdWriteRequestDTO;
import com.example.spring.bzfrontservice.service.AdService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;

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

    @PostMapping("/edit/{id}")
    public ResponseEntity<?> editAd(
            @PathVariable Long id,
            @RequestParam("adPosition") String adPosition,
            @RequestParam("adStart") String adStart,
            @RequestParam("adEnd") String adEnd,
            @RequestParam("adTitle") String adTitle,
            @RequestParam("adUrl") String adUrl,
            @RequestParam(value = "adImage", required = false) MultipartFile adImage
    ) {

        AdEditRequestDTO adEditRequestDTO = AdEditRequestDTO.builder()
                .adPosition(adPosition)
                .adStart(adStart)
                .adEnd(adEnd)
                .adTitle(adTitle)
                .adUrl(adUrl)
                .adImage(adImage)
                .build();

        return adService.editAd(id, adEditRequestDTO);
    }
}
