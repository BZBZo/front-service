package com.example.spring.bzfrontservice.service;

import com.example.spring.bzfrontservice.client.AdClient;
import com.example.spring.bzfrontservice.dto.AdDTO;
import com.example.spring.bzfrontservice.dto.AdWriteRequestDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

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
}
