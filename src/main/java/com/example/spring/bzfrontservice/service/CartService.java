package com.example.spring.bzfrontservice.service;

import com.example.spring.bzfrontservice.client.CustomerClient;
import com.example.spring.bzfrontservice.client.SellerClient;
import com.example.spring.bzfrontservice.dto.CartResponseDTO;
import com.example.spring.bzfrontservice.dto.ProductQuantityDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CartService {
    private final CustomerClient customerClient;
    private final SellerClient sellerClient;

    public List<CartResponseDTO> getCartItems(String token) {
        List<ProductQuantityDTO> cartItems = customerClient.getCartItems(token);

        List<CartResponseDTO> response = new ArrayList<>();
        for (ProductQuantityDTO item : cartItems) {
            var product = sellerClient.getProductDetail(item.getProductId());

            var cartResponse = new CartResponseDTO(
                    item.getProductId(),
                    product.getName(),
                    product.getMainPicturePath(),
                    product.getPrice(),
                    item.getQuantity()
            );

            response.add(cartResponse);
        }

        return response;
    }
}

