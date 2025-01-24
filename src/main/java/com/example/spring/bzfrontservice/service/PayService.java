package com.example.spring.bzfrontservice.service;

import com.example.spring.bzfrontservice.client.CustomerClient;
import com.example.spring.bzfrontservice.controller.CustomerController;
import com.example.spring.bzfrontservice.dto.PurchaseHistoryDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PayService {
    private final CustomerClient customerClient;

    public void savePurchaseHistory(PurchaseHistoryDTO dto) {
        try {
            customerClient.savePurchaseHistory(dto);
        }catch (Exception e){
            e.printStackTrace();
            System.out.println("바로 구매 저장 실패");
        }
    }
}
