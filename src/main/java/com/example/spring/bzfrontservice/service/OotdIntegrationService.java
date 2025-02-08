package com.example.spring.bzfrontservice.service;

import com.example.spring.bzfrontservice.client.AuthClient;
import com.example.spring.bzfrontservice.client.OotdClient;
import com.example.spring.bzfrontservice.client.SellerClient;
import com.example.spring.bzfrontservice.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.Serializable;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OotdIntegrationService {

    private final OotdClient ootdClient;
    private final SellerClient sellerClient;
    private final UserService userService;

    public List<OotdResponseDTO> getOotdListWithDetails(String authorization) {
        // OOTD 리스트 가져오기
        List<OotdResponseDTO> ootdList = ootdClient.getOotdList();
        log.info("Fetched OOTD List: {}", ootdList);

        // 사용자 정보 가져오기
        Map<String, Serializable> userInfo = userService.fetchUserInfo(authorization);
        log.info("Fetched user info: {}", userInfo);

        Long memberNo = userInfo.containsKey("memberNo") ? Long.valueOf((String) userInfo.get("memberNo")) : null;

        // 🔥 작성자 정보 가져오기 (memberNo 기반)
        Map<Long, SecurityUserDTO> userMap = fetchUserInfoForOotds(ootdList);

        // 각 OOTD 항목에 사용자 및 상품 정보 추가
        return ootdList.stream().map(ootd -> {
            // 🔹 작성자 정보 설정
            SecurityUserDTO user = userMap.get(ootd.getMemberNo());
            if (user != null) {
                ootd.setNickname(user.getNickname());
                ootd.setProfilePic(user.getProfilePic());
                ootd.setWriterNo(user.getMemberNo());
                log.info(ootd.toString());
            } else {
                ootd.setNickname("Guest");
                ootd.setProfilePic("/images/default-profile.png");
                ootd.setWriterNo(Long.valueOf("0"));
            }

            // OOTD 이미지 URL 처리
            String image = ootd.getImgUrls();
            if (image != null && !image.startsWith("http")) {
                ootd.setImgUrls(image);
            }

            // 상품 정보 처리
            List<ProductDTO> productList = processProductList(ootd.getRelProd());
            ootd.setProducts(productList);

            // 🔥 사용자가 좋아요를 눌렀는지 확인
            if (memberNo != null && memberNo > 0) {
                boolean isLiked = isUserLikedOotd(memberNo, ootd.getId());
                ootd.setLiked(isLiked);
            } else {
                ootd.setLiked(false);
            }

            return ootd;
        }).collect(Collectors.toList());

            
    }

    /**
     * 🔥 OOTD 작성자의 정보를 한 번에 가져오는 메서드
     * - OOTD 작성자의 memberNo 목록을 수집
     * - 여러 사용자 정보를 한 번의 API 요청으로 가져옴
     */
    private Map<Long, SecurityUserDTO> fetchUserInfoForOotds(List<OotdResponseDTO> ootdList) {
        // 작성자의 memberNo 목록을 중복 없이 수집
        Set<Long> memberNos = ootdList.stream()
                .map(OotdResponseDTO::getMemberNo)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        // 작성자 정보 요청
        List<SecurityUserDTO> users = userService.fetchWritersByMemberNos(memberNos);

        // memberNo를 키로 하는 Map으로 변환
        return users.stream()
                .collect(Collectors.toMap(SecurityUserDTO::getMemberNo, user -> user));
    }

    private boolean isUserLikedOotd(Long memberNo, Long id) {
        if (memberNo == null || id == null) {
            return false;
        }
        return ootdClient.isUserLikedOotd(memberNo, id);
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

    public int getHeartNum(Long ootdId) {
        return ootdClient.getHeartNum(ootdId);
    }

    public boolean toggleLike(Long memberNo, Long ootdId) {
        return ootdClient.toggleLike(memberNo, ootdId);
    }

    public List<OotdResponseDTO> getRecentOotds(int i) {
        return ootdClient.getRecentOotds(i);
    }
}








