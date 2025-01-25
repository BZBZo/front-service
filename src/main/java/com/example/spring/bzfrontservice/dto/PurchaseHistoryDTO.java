package com.example.spring.bzfrontservice.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class PurchaseHistoryDTO {
    Long purchaseId;
    String orderId;
    String paymentKey;
    Long totalAmount;
    String approvedAt;
    String method;
    Long memberNo;
    String productList;
}
