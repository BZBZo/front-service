package com.example.spring.bzfrontservice.client;

import org.springframework.cloud.openfeign.FeignClient;

@FeignClient(name="adClient", url="${bzbzo.bz-ad-service-url}")
public interface AdClient {
}
