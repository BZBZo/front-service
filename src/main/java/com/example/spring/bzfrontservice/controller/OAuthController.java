package com.example.spring.bzfrontservice.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;

import java.net.URI;

@Controller
public class OAuthController {

    @GetMapping("/start-oauth/{provider}")
    public String startOAuth(@PathVariable String provider) {
//        // /proxy/oauth2/authorization/{provider} 경로로 리디렉션
//        return "redirect:/proxy/oauth2/authorization/" + provider;

        return "redirect:http://himedia-a.com/oauth2/authorization/"+provider;

    }

//    // /proxy/oauth2/authorization/{provider} 요청을 내부 bz-edge-service로 전달
//    @GetMapping("/proxy/oauth2/authorization/{provider}")
//    public ResponseEntity<Void> proxyToEdgeService(@PathVariable String provider) {
//        // bz-edge-service로 요청 리디렉션
//        String url = "http://bz-edge-service:90/oauth2/authorization/" + provider;
//        HttpHeaders headers = new HttpHeaders();
//        headers.setLocation(URI.create(url));
//        return new ResponseEntity<>(headers, HttpStatus.FOUND);
//    }

}