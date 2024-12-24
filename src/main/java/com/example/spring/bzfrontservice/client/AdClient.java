package com.example.spring.bzfrontservice.client;

import com.example.spring.bzfrontservice.dto.AdDTO;
import com.example.spring.bzfrontservice.dto.AdEditRequestDTO;
import com.example.spring.bzfrontservice.dto.AdWriteRequestDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@FeignClient(name="adClient", url="${bzbzo.bz-ad-service-url}")
public interface AdClient {
    @PostMapping("/write")
    ResponseEntity<?> writeAd(@RequestBody AdWriteRequestDTO adWriteRequestDTO);

    @GetMapping("/detail/{id}")
    AdDTO getAdDetail(@PathVariable Long id);

    @PostMapping("/edit/{id}")
    ResponseEntity<?> editAd(@PathVariable Long id, @RequestBody AdEditRequestDTO adEditRequestDTO);

    @GetMapping("/list")
    Page<AdDTO> getAds(@RequestParam("page") int page, @RequestParam("size") int size);

    @DeleteMapping("/erase")
    ResponseEntity<Map<String, String>> deleteAd(@RequestBody List<Long> ids);

    @PostMapping("/updateStatus/{id}")
    ResponseEntity<Map<String, String>> updateStatus(@PathVariable Long id, @RequestBody String newStatus);
}
