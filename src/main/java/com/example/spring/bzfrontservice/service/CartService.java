package com.example.spring.bzfrontservice.service;

import com.example.spring.bzfrontservice.client.CustomerClient;
import com.example.spring.bzfrontservice.client.SellerClient;
import com.example.spring.bzfrontservice.dto.CartRequestDTO;
import com.example.spring.bzfrontservice.dto.CartResponseDTO;
import com.example.spring.bzfrontservice.dto.ProdReadResponseDTO;
import com.example.spring.bzfrontservice.dto.ProductQuantityDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {
    private final CustomerClient customerClient;
    private final SellerClient sellerClient;
    private final UserService userService;

    public void addToCart(CartRequestDTO cartRequest, String token) {
        customerClient.addToCart(cartRequest, token);
    }


    public List<CartResponseDTO> getCartItems(String token) {
        // front-service에서 memberNo 추출
        Long memberNo = userService.getMemberNo(token);

        // customer-service로 memberNo 전달
        List<ProductQuantityDTO> cartItems = customerClient.getCartItems(memberNo);

        // 모든 productId를 추출
        List<Long> productIds = cartItems.stream()
                .map(ProductQuantityDTO::getProductId)
                .collect(Collectors.toList());

        // seller-service로 한 번의 요청으로 데이터를 가져옴
        List<ProdReadResponseDTO> products = sellerClient.getProductsByIds(productIds);

        // cartItems와 product 정보를 매핑
        return cartItems.stream()
                .map(item -> {
                    ProdReadResponseDTO product = products.stream()
                            .filter(p -> p.getId().equals(item.getProductId()))
                            .findFirst()
                            .orElseThrow(() -> new RuntimeException("상품 정보를 찾을 수 없습니다."));

                    System.out.println("Matched Product: " + product);
                    System.out.println("Matched Quantity: " + item.getQuantity());

                    return new CartResponseDTO(
                            product.getId(),
                            product.getName(),
                            product.getMainPicturePath(),
                            product.getPrice(),
                            item.getQuantity()
                    );
                })
                .collect(Collectors.toList());
    }
}


