package com.example.spring.bzfrontservice.client;

import com.example.spring.bzfrontservice.dto.AdDTO;
import com.example.spring.bzfrontservice.dto.AdEditRequestDTO;
import com.example.spring.bzfrontservice.dto.AdWriteRequestDTO;
import com.example.spring.bzfrontservice.dto.GetResolvesTimesRequestDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@FeignClient(name="adClient", url="${bzbzo.bz-edge-service-url}/ad")
public interface AdClient {
    @PostMapping(value = "/write", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    ResponseEntity<?> writeAd(
            @RequestParam("adArea") String adPosition,
            @RequestParam("startDate") String adStart,
            @RequestParam("seller_id") Long seller_id,
            @RequestParam("endDate") String adEnd,
            @RequestParam("adName") String adTitle,
            @RequestParam("adLink") String adUrl,
            @RequestPart("adImage") MultipartFile adImage
    );

    @GetMapping("/detail/{id}")
    AdDTO getAdDetail(@PathVariable Long id);

    @PostMapping("/edit/{id}")
    ResponseEntity<?> editAd(@PathVariable Long id,
                             @RequestPart("adArea") String adPosition,
                             @RequestPart("startDate") String adStart,
                             @RequestPart("endDate") String adEnd,
                             @RequestPart("adName") String adTitle,
                             @RequestPart("adLink") String adUrl,
                             @RequestPart("adImage") MultipartFile adImage);

    @GetMapping("/list")
    Page<AdDTO> getAds(@RequestParam("page") int page, @RequestParam("size") int size);

    @DeleteMapping("/erase")
    ResponseEntity<Map<String, String>> deleteAd(@RequestBody List<Long> ids);

    @PostMapping("/updateStatus/{id}")
    ResponseEntity<Map<String, String>> updateStatus(@PathVariable Long id, @RequestBody String newStatus);

    @GetMapping("/reserved-times")
    List<GetResolvesTimesRequestDTO> getReservedTimes(@RequestParam String nowArea);

    @GetMapping("/getAd")
    List<AdDTO> getAds();


}
