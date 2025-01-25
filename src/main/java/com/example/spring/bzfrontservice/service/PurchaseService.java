package com.example.spring.bzfrontservice.service;

import com.example.spring.bzfrontservice.client.CustomerClient;
import com.example.spring.bzfrontservice.dto.PurchaseDTO;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PurchaseService {
    private final CustomerClient customerClient;

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

    public List<PurchaseDTO> getPurchaseListByMemberNo(Long memberNo) {
        return customerClient.getPurchaseListByMemberNo(memberNo);
    }

//    // 구매한 상품에 대한 리뷰 작성 여부를 매칭
//    public void enrichPurchasesWithProducts(List<PurchaseDTO> purchases) {
//        ObjectMapper objectMapper = new ObjectMapper();
//
//        for (PurchaseDTO purchase : purchases) {
//            try {
//                Map<String, Integer> productMap = objectMapper.readValue(purchase.getProductList(), new TypeReference<Map<String, Integer>>() {});
//                List<ProdReadResponseDTO> products = new ArrayList<>();
//                List<Review> reviews = reviewRepository.findByPurchaseId(purchase.getId());
//
//                // 각 제품 ID에 대한 리뷰 여부를 매핑
//                Map<Long, Boolean> reviewedProductIds = new HashMap<>();
//                for (Review review : reviews) {
//                    reviewedProductIds.put(review.getProduct().getId(), true);
//                }
//
//                for (Map.Entry<String, Integer> entry : productMap.entrySet()) {
//                    Long productId = Long.valueOf(entry.getKey());
//                    Integer quantity = entry.getValue();
//                    ProdReadResponseDTO product = sellerService.getProductById(productId);
//                    product.setQuantity(String.valueOf(quantity));
//
//                    // 각 Product 객체에 현재 Purchase의 리뷰 상태 저장
//                    boolean isReviewed = reviewedProductIds.getOrDefault(productId, false);
//                    product.setReviewedForPurchase(purchase.getPurchaseId(), isReviewed);
//
//                    products.add(product);
//                }
//                purchase.setProducts(products);
//            } catch (JsonProcessingException e) {
//                throw new RuntimeException("Error processing product list from purchase", e);
//            }
//        }
//    }
}
