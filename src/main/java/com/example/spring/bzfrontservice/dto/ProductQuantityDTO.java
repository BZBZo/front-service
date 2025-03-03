package com.example.spring.bzfrontservice.dto;

import lombok.*;

@Getter
@Setter
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductQuantityDTO {
    private Long productId;
    private Integer quantity;
}