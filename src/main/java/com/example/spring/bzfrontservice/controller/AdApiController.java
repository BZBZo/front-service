package com.example.spring.bzfrontservice.controller;

import com.example.spring.bzfrontservice.dto.AdDTO;
import com.example.spring.bzfrontservice.dto.AdEditRequestDTO;
import com.example.spring.bzfrontservice.dto.GetResolvesTimesRequestDTO;
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
                                    @RequestParam("memberNo") String seller_id,
                                    @RequestParam("endDate") String adEnd,
                                    @RequestParam("adName") String adTitle,
                                    @RequestParam("adLink") String adUrl,
                                    @RequestParam("adImage") MultipartFile adImage) {
        // seller_id 값 확인 (디버깅 로그)
        System.out.println("Raw seller_id :: " + seller_id);

        // seller_id 값 전처리: 쉼표(`,`) 제거 후 변환
        seller_id = seller_id.replaceAll(",", "").trim();

        System.out.println("Processed seller_id :: " + seller_id);

        return adService.writeAd(adPosition, adStart, Long.valueOf(seller_id), adEnd, adTitle, adUrl, adImage);
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

    @GetMapping("/reserved-times")
    public ResponseEntity<List<GetResolvesTimesRequestDTO>> getReservedTimes(
            @RequestParam String nowArea
    ) {
        System.out.println("nowArea :: " + nowArea);
        // 서비스에서 DTO 리스트를 가져옵니다.
        List<GetResolvesTimesRequestDTO> getResolvesTimesRequestDTOS = adService.getReservedTimes(nowArea);
        return ResponseEntity.ok(getResolvesTimesRequestDTOS);
    }

    @GetMapping("/getAd")
    public List<AdDTO> getAd(){
        List<AdDTO> ads = adService.getAds();
        System.out.println("get Ads : " + ads);
        return ads;
    }
}
