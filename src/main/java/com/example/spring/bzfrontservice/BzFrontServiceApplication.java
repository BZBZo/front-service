package com.example.spring.bzfrontservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class BzFrontServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(BzFrontServiceApplication.class, args);
    }

}
