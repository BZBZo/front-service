package com.example.spring.bzfrontservice.service;

import com.example.spring.bzfrontservice.client.AdClient;
import com.example.spring.bzfrontservice.dto.AdDTO;
import com.example.spring.bzfrontservice.dto.AdEditRequestDTO;
import com.example.spring.bzfrontservice.dto.AdWriteRequestDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdService {
    private final AdClient adClient;

    public ResponseEntity<?> writeAd(AdWriteRequestDTO adWriteRequestDTO) {
        return adClient.writeAd(adWriteRequestDTO);
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
}
