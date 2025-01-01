package com.example.spring.bzfrontservice.service;

import com.example.spring.bzfrontservice.client.AdClient;
import com.example.spring.bzfrontservice.dto.AdDTO;
import com.example.spring.bzfrontservice.dto.AdEditRequestDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdService {
    private final AdClient adClient;

    public ResponseEntity<?> writeAd(String adPosition, String adStart, String adEnd,
                                     String adTitle, String adUrl, MultipartFile adImage) {
        return adClient.writeAd(adPosition, adStart, adEnd, adTitle, adUrl, adImage);
    }

    public AdDTO getAdDetail(Long id) {
        return adClient.getAdDetail(id);
    }

    public ResponseEntity<?> editAd(Long id, AdEditRequestDTO adEditRequestDTO) {
        return adClient.editAd(id, adEditRequestDTO);
    }

    public Page<AdDTO> getAds(int page, int size) {
        return adClient.getAds(page, size);
    }

    public ResponseEntity<Map<String, String>> deleteAd(List<Long> ids) {
        return adClient.deleteAd(ids);
    }

    public ResponseEntity<Map<String, String>> updateStatus(Long id, String newStatus) {
        return adClient.updateStatus(id, newStatus);
    }
}
