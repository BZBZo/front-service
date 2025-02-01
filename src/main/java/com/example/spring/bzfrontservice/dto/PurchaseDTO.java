package com.example.spring.bzfrontservice.dto;

import jakarta.persistence.Transient;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
public class PurchaseDTO {
    Long purchaseId;
    String orderId;
    String paymentKey;
    Double totalAmount;
    String approvedAt;
    String method;
    Long memberNo;
    String productList;

    @Transient
    private List<ProdReadResponseDTO> products;

}
