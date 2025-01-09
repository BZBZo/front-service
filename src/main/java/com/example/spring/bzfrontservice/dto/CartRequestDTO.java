package com.example.spring.bzfrontservice.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class CartRequestDTO {
    private Long productId;
    private Long memberNo;

    // Getters and Setters
}
