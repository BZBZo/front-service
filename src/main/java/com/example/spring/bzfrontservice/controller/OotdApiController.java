package com.example.spring.bzfrontservice.controller;

import com.example.spring.bzfrontservice.client.SellerClient;
import com.example.spring.bzfrontservice.dto.OotdRequestDTO;
import com.example.spring.bzfrontservice.dto.ProdReadResponseDTO;
import com.example.spring.bzfrontservice.service.OotdIntegrationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/ootd")
public class OotdApiController {
    private final OotdIntegrationService ootdIntegrationService;
    private final SellerClient sellerClient;

    @PostMapping(value = "/write", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    ResponseEntity<String> createOotd(@RequestParam("memberNo") Long memberNo,
                                      @RequestParam("tags") String tags,
                                      @RequestParam("relProd") String relProd,
                                      @RequestPart("image") MultipartFile image,
                                      @RequestHeader(value = "Authorization", required = false) String authorization){
        System.out.println("여기에는 도착? memberNo: " + memberNo + "tags: " + tags + "relProd: " + relProd);
        return ootdIntegrationService.createOotd(memberNo ,tags,relProd,image,authorization);
    }

    @GetMapping("/search/products")
    @ResponseBody
    public List<ProdReadResponseDTO> searchProducts(@RequestParam String keyword) {
        // SellerClient에서 페이지 기반으로 전체 상품을 가져옴
        Page<ProdReadResponseDTO> allProducts = sellerClient.getProductList(0, 100, "application/json");

        // 키워드로 필터링
        return allProducts.getContent().stream()
                .filter(product -> product.getName().toLowerCase().contains(keyword.toLowerCase()))
                .collect(Collectors.toList());
    }
}
