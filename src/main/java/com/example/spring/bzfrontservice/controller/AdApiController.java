package com.example.spring.bzfrontservice.controller;

import com.example.spring.bzfrontservice.dto.AdEditRequestDTO;
import com.example.spring.bzfrontservice.service.AdService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/ad")
public class AdApiController {

    private final AdService adService;

    @PostMapping(value = "/write", consumes = "multipart/form-data")
    public ResponseEntity<?> saveAd(@RequestParam("adArea") String adPosition,
                                    @RequestParam("startDate") String adStart,
                                    @RequestParam("endDate") String adEnd,
                                    @RequestParam("adName") String adTitle,
                                    @RequestParam("adLink") String adUrl,
                                    @RequestParam("adImage") MultipartFile adImage) {

        return adService.writeAd(adPosition, adStart, adEnd, adTitle, adUrl, adImage);
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

        return adService.editAd(id, adPosition, adStart, adEnd, adTitle, adUrl, adImage);
    }

    @DeleteMapping("/erase")
    public ResponseEntity<Map<String, String>> deleteAds(@RequestBody Map<String, List<Long>> request) {
        List<Long> ids = request.get("ids");
        return adService.deleteAd(ids);
    }

    @PostMapping("/updateStatus/{id}")
    public ResponseEntity<Map<String, String>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        String newStatus = request.get("status");

        if (newStatus == null || newStatus.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "상태 값이 제공되지 않았습니다."));
        }

        return adService.updateStatus(id, newStatus);
    }
}
