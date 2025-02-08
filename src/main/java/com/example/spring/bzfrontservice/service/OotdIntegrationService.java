package com.example.spring.bzfrontservice.service;

import com.example.spring.bzfrontservice.client.AuthClient;
import com.example.spring.bzfrontservice.client.OotdClient;
import com.example.spring.bzfrontservice.client.SellerClient;
import com.example.spring.bzfrontservice.dto.OotdRequestDTO;
import com.example.spring.bzfrontservice.dto.OotdResponseDTO;
import com.example.spring.bzfrontservice.dto.ProductDTO;
import com.example.spring.bzfrontservice.dto.ProdReadResponseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OotdIntegrationService {

    private final OotdClient ootdClient;
    private final SellerClient sellerClient;
    private final AuthClient authClient;
    private final UserService userService;

    @Value("${bzbzo.bz-edge-service-url}/product")
    private String sellerServiceBaseUrl; // Seller 서비스 URL

    @Value("${bzbzo.bz-edge-service-url}/ootd")
    private String ootdServiceBaseUrl; // OOTD 서비스 URL

    @Value("${bzbzo.bz-edge-service-url}/auths")
    private String authServiceBaseUrl; // Auth 서비스 URL

    public List<OotdResponseDTO> getOotdListWithDetails(String authorization) {
        // OOTD 리스트 가져오기
        List<OotdResponseDTO> ootdList = ootdClient.getOotdList();
        log.info("Fetched OOTD List: {}", ootdList);

        // 사용자 정보 가져오기
        Map<String, String> userInfo = userService.fetchUserInfo(authorization);
        log.info("Fetched user info: {}", userInfo);

        // 각 OOTD 항목에 사용자 및 상품 정보 추가
        return ootdList.stream().map(ootd -> {
            // 사용자 정보 추가
            ootd.setNickname(userInfo.getOrDefault("nickname", "Guest"));
            String profilePic = userInfo.getOrDefault("profilePic", "default-profile.png");
            //ootd.setProfilePic(profilePic.startsWith("http") ? profilePic : authServiceBaseUrl + "/uploads/" + profilePic);
            ootd.setProfilePic(profilePic);
            ootd.setMemberNo(Long.valueOf(userInfo.getOrDefault("memberNo","0")));

            // OOTD 이미지 URL 처리
            String image = ootd.getImgUrls();
            if (image != null && !image.startsWith("http")) {
                ootd.setImgUrls(image);
            }

            // 상품 정보 처리
            List<ProductDTO> productList = processProductList(ootd.getRelProd());
            ootd.setProducts(productList);

            return ootd;
        }).collect(Collectors.toList());
    }

    private List<ProductDTO> processProductList(String relProd) {
        if (relProd == null || relProd.isBlank()) return new ArrayList<>();

        return List.of(relProd.split(",")).stream()
                .map(productId -> {
                    try {
                        Long id = Long.parseLong(productId.trim());
                        ProdReadResponseDTO productDetail = sellerClient.loadProductDetails(id);
                        return ProductDTO.builder()
                                .id(productDetail.getId())
                                .name(productDetail.getName())
                                .price(productDetail.getPrice())
                                .isCong(productDetail.isCong())
                                .mainPicturePath(productDetail.getMainPicturePath())
                                .description(productDetail.getDescription())
                                .build();
                    } catch (Exception e) {
                        log.error("Error fetching product details for ID: {}", productId, e);
                        return ProductDTO.builder()
                                .name("상품 정보를 가져올 수 없습니다.")
                                .price(0)
                                .build();
                    }
                }).collect(Collectors.toList());
    }

    public ResponseEntity<String> createOotd(Long memberNo, String tags, String relProd, MultipartFile image, String authorization) {
        return ootdClient.createOotd(memberNo,tags,relProd,image,authorization);
    }
}








