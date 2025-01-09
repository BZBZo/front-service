package com.example.spring.bzfrontservice.client;

import com.example.spring.bzfrontservice.dto.OotdResponseDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@FeignClient(name = "ootdClient", url = "${bzbzo.bz-ootd-service-url}")
public interface OotdClient {

    @GetMapping("/api/ootd")
    List<OotdResponseDTO> getOotdList();
}
