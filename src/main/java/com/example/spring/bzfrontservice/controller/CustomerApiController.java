package com.example.spring.bzfrontservice.controller;

import com.example.spring.bzfrontservice.dto.*;
import com.example.spring.bzfrontservice.service.*;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


import java.util.*;
import java.util.stream.Collectors;

@RestController
@Slf4j
@RequestMapping("/customer")
@RequiredArgsConstructor
public class CustomerApiController {

    private final CustomerService customerService;
    private final CartService cartService;

    @PostMapping("/cart/add")
    public ResponseEntity<String> addToCart(
            @RequestBody CartRequestDTO cartRequest,
            @RequestHeader("Authorization") String token) {
        customerService.addToCart(cartRequest, token);
        return ResponseEntity.ok("장바구니에 추가되었습니다.");
    }

    // 장바구니 목록 가져오기
    @GetMapping("/cart/list/items")
    public ResponseEntity<List<CartResponseDTO>> getCartItems(@RequestHeader("Authorization") String token) {
        List<CartResponseDTO> cartItems = cartService.getCartItems(token);
        return ResponseEntity.ok(cartItems);
    }

    @PostMapping(value = "/history/review/{productId}/{purchaseId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadReview(
            @RequestParam("memberNo") Long memberNo,
            @PathVariable("productId") Long productId,
            @PathVariable("purchaseId") Long purchaseId,
            @RequestParam("content") String content,
            @RequestPart(value = "reviewImg", required = false) MultipartFile[] reviewImages) {

        Map<String, String> response = new HashMap<>();

        try {
            log.info("📌 리뷰 작성 요청 - memberNo: {}, productId: {}, purchaseId: {}, content: {}",
                    memberNo, productId, purchaseId, content);

            // reviewImages가 null인 경우 빈 배열로 초기화
            if (reviewImages == null) {
                reviewImages = new MultipartFile[0];
            }

            // 빈 파일 제거 (배열을 리스트로 변환 후 필터링하거나 배열에서 직접 처리)
            List<MultipartFile> validImages = Arrays.stream(reviewImages)
                    .filter(file -> file.getSize() > 0)
                    .collect(Collectors.toList());

            log.info("📌 업로드된 이미지 개수: {}", validImages.size());

            // 서비스 호출 - FeignClient 연결 (필요에 따라 배열이나 리스트 중 한 타입을 사용)
            ResponseEntity<Map<String, String>> serverResponse = customerService.writeReview(
                    memberNo, productId, purchaseId, content, validImages.toArray(new MultipartFile[0]));

            // 서버 응답이 OK일 경우 처리
            if (serverResponse.getStatusCode() == HttpStatus.OK) {
                response.put("url", "/customer/history?memberNo=" + memberNo);
                response.put("message", "리뷰 등록이 완료되었습니다.");
                return ResponseEntity.ok(response);
            } else {
                response.put("message", "서버에서 리뷰 등록이 실패했습니다: " +
                        serverResponse.getBody().get("message"));
                return ResponseEntity.status(serverResponse.getStatusCode()).body(response);
            }

        } catch (FeignException.FeignClientException e) {
            log.error("🚨 FeignClientException 발생: {}", e.getMessage(), e);
            response.put("message", "서버와의 통신 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(response);
        } catch (Exception e) {
            log.error("🚨 예상치 못한 예외 발생: {}", e.getMessage(), e);
            response.put("message", "알 수 없는 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/review/list/{productId}")
    public ResponseEntity<Map<String, Object>> getReviewsByProductId(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {

        long startTime = System.currentTimeMillis(); // 시작 시간 기록

        Page<ReviewDTO> reviewPage = customerService.findReviewsByProductId(productId, page, size);
        List<ReviewDTO> reviews = reviewPage.getContent();

        int totalPages = reviewPage.getTotalPages();
        int pageBlock = 10;
        int startPage = (page / pageBlock) * pageBlock;
        int endPage = Math.min(startPage + pageBlock - 1, totalPages - 1);

        Map<String, Object> response = new HashMap<>();
        response.put("reviews", reviews);
        response.put("startPage", startPage);
        response.put("endPage", endPage);
        response.put("totalPages", totalPages);
        response.put("showPrevious", startPage > 0);
        response.put("showNext", endPage < totalPages - 1);

        long endTime = System.currentTimeMillis(); // 종료 시간 기록
        long loadTime = endTime - startTime; // 로드 시간 계산

        System.out.println("Page load time: " + loadTime + " ms"); // 로드 시간 출력

        return ResponseEntity.ok(response);
    }

}

