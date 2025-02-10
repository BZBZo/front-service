package com.example.spring.bzfrontservice.service;

import com.example.spring.bzfrontservice.client.CustomerClient;
import com.example.spring.bzfrontservice.dto.ProdReadResponseDTO;
import com.example.spring.bzfrontservice.dto.ProductQuantityDTO;
import com.example.spring.bzfrontservice.dto.PurchaseDTO;
import com.example.spring.bzfrontservice.dto.ReviewDTO;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PurchaseService {
    private final CustomerClient customerClient;
    private final SellerService sellerService;

    public void savePurchaseHistory(PurchaseDTO dto) {
        try {

            ResponseEntity<String> response = customerClient.savePurchaseHistory(dto);

            if (response.getStatusCode().is2xxSuccessful()) {
                System.out.println("바로 구매 - 저장 성공");
            } else {
                System.err.println("바로 구매 저장 실패: " + response.getStatusCode() + " - " + response.getBody());
            }

        } catch (FeignException.BadRequest e) {
            // 400 에러
            System.err.println("Bad Request 에러 발생: " + e.contentUTF8());
        } catch (FeignException.Unauthorized e) {
            // 401 에러
            System.err.println("Unauthorized 에러 발생: " + e.contentUTF8());
        } catch (FeignException e) {
            // 기타 Feign 에러
            System.err.println("FeignException 발생: " + e.contentUTF8());
        } catch (Exception e) {
            // 기타 예외
            System.err.println("예기치 못한 에러 발생: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public Page<PurchaseDTO> getPurchaseListByMemberNo(Long memberNo, int page, int size) {
        return customerClient.getPurchaseListByMemberNo(memberNo, page, size);
    }

    public void enrichPurchasesWithProducts(List<PurchaseDTO> purchases) {
        ObjectMapper objectMapper = new ObjectMapper();

        for (PurchaseDTO purchase : purchases) {
            System.out.println("여기서 문제인가? "+purchase.toString()+"  "+purchase.getPurchaseId()+"  "+purchase.getProductList());
            try {
                // JSON 배열을 DTO 리스트로 변환
                List<ProductQuantityDTO> productList = objectMapper.readValue(
                        purchase.getProductList(), new TypeReference<List<ProductQuantityDTO>>() {}
                );

                List<ProdReadResponseDTO> products = new ArrayList<>();
                List<ReviewDTO> reviews = customerClient.findReviewsByPurchaseId(purchase.getPurchaseId());

                // 리뷰 여부를 매핑
                Map<Long, Boolean> reviewedProductIds = new HashMap<>();
                for (ReviewDTO review : reviews) {
                    reviewedProductIds.put(review.getProductId(), true);
                }

                // 변환된 DTO 리스트를 활용
                for (ProductQuantityDTO productInfo : productList) {
                    Long productId = productInfo.getProductId();
                    Integer quantity = productInfo.getQuantity();

                    ProdReadResponseDTO product = sellerService.getProductDetails(productId);
                    product.setQuantity(String.valueOf(quantity));

                    // Null 체크 후 초기화 (여기가 핵심)
                    if (product.getReviewedPurchases() == null) {
                        product.setReviewedPurchases(new HashMap<>());
                    }
                    product.setReviewedForPurchase(purchase.getPurchaseId(), reviewedProductIds.getOrDefault(productId, false));

                    products.add(product);
                }

                purchase.setProducts(products);
            } catch (JsonProcessingException e) {
                throw new RuntimeException("Error processing product list from purchase", e);
            }
        }
    }

}
