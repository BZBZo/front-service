package com.example.spring.bzfrontservice.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Builder
@Getter
public class GetResolvesTimesRequestDTO {
    private LocalDateTime adStart;
    private LocalDateTime adEnd;
}
