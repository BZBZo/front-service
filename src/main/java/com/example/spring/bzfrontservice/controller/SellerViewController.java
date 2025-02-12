
package com.example.spring.bzfrontservice.controller;

import com.example.spring.bzfrontservice.dto.CongDongIngDTO;
import com.example.spring.bzfrontservice.dto.ProdReadResponseDTO;
import com.example.spring.bzfrontservice.dto.SaleHistoryDTO;
import com.example.spring.bzfrontservice.dto.SecurityUserDTO;
import com.example.spring.bzfrontservice.service.CustomerService;
import com.example.spring.bzfrontservice.service.CongdongService;
import com.example.spring.bzfrontservice.service.SellerService;
import com.example.spring.bzfrontservice.service.UserService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/product")
public class SellerViewController {

    private final SellerService sellerService;
    private final CongdongService congdongService;
    private final UserService userService;
    private final CustomerService customerService;

    @GetMapping("/list")
    public String productTotalList(@RequestParam(defaultValue = "1") int page, Model model) {

        int pageSize = 8;

        log.info("Requested Page: {}", page);
        log.info("Page Size: {}", pageSize);

        int adjustedPage = page - 1; // 0 기반으로 변환
        if (adjustedPage < 0) {
            adjustedPage = 0; // 최소값 0 보장
        }

        log.info("Adjusted Page (0-based): {}", adjustedPage);

        Page<ProdReadResponseDTO> productPage = sellerService.findAll(adjustedPage, pageSize);
        log.info("Total Elements: {}", productPage.getTotalElements());
        log.info("Total Pages: {}", productPage.getTotalPages());
        log.info("Current Page: {}", productPage.getNumber() + 1); // 1 기반으로 출력
        log.info("Number of Elements in Current Page: {}", productPage.getNumberOfElements());

        List<ProdReadResponseDTO> products = productPage.getContent();
        log.info("Products on Current Page: {}", products);

        int totalPages = productPage.getTotalPages();
        int pageBlock = 5; // 한 번에 표시할 페이지 번호 수
        int startPage = ((page - 1) / pageBlock) * pageBlock + 1;
        int endPage = Math.min(startPage + pageBlock - 1, totalPages);

        log.info("Start Page: {}", startPage);
        log.info("End Page: {}", endPage);

        model.addAttribute("products", products);
        model.addAttribute("currentPage", page); // 1 기반 현재 페이지
        model.addAttribute("totalPages", totalPages); // 총 페이지 수
        model.addAttribute("startPage", startPage); // 표시할 시작 페이지
        model.addAttribute("endPage", endPage); // 표시할 끝 페이지
        model.addAttribute("hasNext", productPage.hasNext());
        model.addAttribute("hasPrevious", productPage.hasPrevious());

        log.info("Has Next Page: {}", productPage.hasNext());
        log.info("Has Previous Page: {}", productPage.hasPrevious());

        return "product_list";
    }

    // 콩동 구매 리스트 페에지ㅣ
    @GetMapping("/congdong")
    public String loadCongDongPage(Model model) {
        log.info("[Front Service] 콩동 페이지 로드 시작");

        // FeignClient를 통해 데이터 가져오기
        List<ProdReadResponseDTO> products = congdongService.getCongDongProducts();

        List<CongDongIngDTO> activeProducts = sellerService.getCongDongActiveProducts();

        log.info("[Front Service] 콩동 데이터 로드 완료. 상품 수: {}", products.size());
        log.info("[Front Service] 상품 데이터: {}", products);

        model.addAttribute("products", products);
        model.addAttribute("activeProducts", activeProducts);
        return "congdongzone";
    }

    // 상품 등록 페이지
    @GetMapping("/upload")
    public String uploadProduct() {
        return "product_upload";
    }

    // 판매자의 상품 상세 페이지
    @GetMapping("/detail/po/{productId}")
    public String productDetail(
            @PathVariable Long productId,
            @RequestHeader(value = "Authorization", required = false) String token,
            Model model
    ) {
        System.out.println("Token received in Seller Controller: " + token);

        if (token == null || token.isEmpty()) {
            throw new IllegalStateException("Authorization token is missing");
        }

        // 현재 사용자 memberNo 가져오기
        Long memberNo = userService.getMemberNo(token);
        log.info("How memberNo?: {}", memberNo);

        ProdReadResponseDTO product = sellerService.getProductDetailto(productId, token);
        log.info("Response product: {}", product);

        // 사용자와 상품 소유자 확인
        boolean isOwner = product.getSellerId().equals(memberNo);

        // 로그 추가
        log.info("Product Seller ID: {}", product.getSellerId());
        log.info("Current User MemberNo: {}", memberNo);
        log.info("Is Owner: {}", isOwner);

        model.addAttribute("product", product);
        model.addAttribute("isOwner", isOwner);

        return "product_detail"; // product_detail.html 반환
    }

    // 상품 상세 페이지
    @GetMapping("/detail/{id}")
    public String productDetail(@PathVariable("id") Long productId, Model model) {
        // 서비스 계층을 통해 상품 상세 정보 가져오기
        ProdReadResponseDTO product = sellerService.getProductDetails(productId);
        Integer count = customerService.countReview(productId);
        log.info("상품 상세 정보: {}", product);
        SecurityUserDTO sellerInfo= userService.loadMemberDetail(product.getSellerId());

        // **공동구매 진행 정보 가져오기**
        List<CongDongIngDTO> congdongIngList = congdongService.getCongDongIngByProductId(productId);
        log.info("공동구매 진행 목록: {}", congdongIngList);

        // 모델에 데이터 추가
        model.addAttribute("reviewCount", count);
        model.addAttribute("product", product);
        model.addAttribute("sellerInfo", sellerInfo);
        model.addAttribute("congdongIngList", congdongIngList); // congsList → congdongIngList 변경

        return "product_detail_all";
    }

    // 상품 수정 페이지
    @GetMapping("/edit/{id}")
    public String editProduct(@PathVariable Long id, Model model) {
        log.info("Editing product with ID: {}", id);
        ProdReadResponseDTO product = sellerService.getProductEditInfo(id);
        log.info("Editing product: {}", product);
        model.addAttribute("product", product);
        return "product_edit";
    }

    @GetMapping("/myShop/{memberNo}")
    public String loadMyShop(@PathVariable Long memberNo,
                             @CookieValue(value = "Authorization", required = false) String token,
                             Model model) {
        if (token == null || token.isEmpty()) {
            throw new IllegalStateException("Authorization token is missing");
        }

        // 현재 사용자 memberNo 가져오기
        Long userId = userService.getMemberNo(token);
        log.info("How MBN???: {}", userId);


        int page = 1;

        if(memberNo.equals(userId)){
            int pageSize = 5;

            // 페이지 1부터 시작하도록 조정
            int adjustedPage = page - 1;
            if (adjustedPage < 0) {
                adjustedPage = 0; // 최소값 0
            }

            Page<ProdReadResponseDTO> productPage = sellerService.getProductsForSeller(adjustedPage, pageSize, token);
            List<ProdReadResponseDTO> products = productPage.getContent();

            int totalPages = productPage.getTotalPages();
            int pageBlock = 10; // 페이지 블록 크기
            int startPage = (adjustedPage / pageBlock) * pageBlock;
            int endPage = Math.min(startPage + pageBlock - 1, totalPages - 1);

            model.addAttribute("products", products);
            model.addAttribute("userId", userId);
            model.addAttribute("productPage", productPage);
            model.addAttribute("startPage", startPage + 1); // 1부터 시작
            model.addAttribute("endPage", endPage + 1); // 1부터 시작
            model.addAttribute("showPrevious", startPage > 0);
            model.addAttribute("showNext", endPage < totalPages - 1);

            // 판매자 본인
            return "mymarket";
        } else{
            int pageSize = 8;

            log.info("Requested Page: {}", page);
            log.info("Page Size: {}", pageSize);

            int adjustedPage = page - 1; // 0 기반으로 변환
            if (adjustedPage < 0) {
                adjustedPage = 0; // 최소값 0 보장
            }

            log.info("Adjusted Page (0-based): {}", adjustedPage);

            SecurityUserDTO sellerInfo = userService.loadMemberDetail(memberNo);

            Page<ProdReadResponseDTO> productPage = sellerService.findAllBySellerId(adjustedPage, pageSize, memberNo);
            log.info("Total Elements: {}", productPage.getTotalElements());
            log.info("Total Pages: {}", productPage.getTotalPages());
            log.info("Current Page: {}", productPage.getNumber() + 1); // 1 기반으로 출력
            log.info("Number of Elements in Current Page: {}", productPage.getNumberOfElements());

            List<ProdReadResponseDTO> products = productPage.getContent();
            log.info("Products on Current Page: {}", products);

            int totalPages = productPage.getTotalPages();
            int pageBlock = 5; // 한 번에 표시할 페이지 번호 수
            int startPage = ((page - 1) / pageBlock) * pageBlock + 1;
            int endPage = Math.min(startPage + pageBlock - 1, totalPages);

            log.info("Start Page: {}", startPage);
            log.info("End Page: {}", endPage);

            model.addAttribute("products", products);
            model.addAttribute("currentPage", page); // 1 기반 현재 페이지
            model.addAttribute("totalPages", totalPages); // 총 페이지 수
            model.addAttribute("startPage", startPage); // 표시할 시작 페이지
            model.addAttribute("endPage", endPage); // 표시할 끝 페이지
            model.addAttribute("hasNext", productPage.hasNext());
            model.addAttribute("hasPrevious", productPage.hasPrevious());

            model.addAttribute("sellerInfo", sellerInfo);

            log.info("Has Next Page: {}", productPage.hasNext());
            log.info("Has Previous Page: {}", productPage.hasPrevious());


            // 구매자가 접근할 때
            return "myshop";
        }
    }

    // 상품 목록 조회 (HTML 반환)
    @GetMapping("/myMarket")
    public String loadmyProduct(
            @RequestParam(defaultValue = "1") int page, // 기본값 1
            @CookieValue(value = "Authorization", required = false) String token,
            Model model) {

        System.out.println("Token received in Seller Controller: " + token);

        if (token == null || token.isEmpty()) {
            throw new IllegalStateException("Authorization token is missing");
        }

        // 현재 사용자 memberNo 가져오기
        Long userId = userService.getMemberNo(token);
        log.info("How MBN???: {}", userId);

        int pageSize = 5;

        // 페이지 1부터 시작하도록 조정
        int adjustedPage = page - 1;
        if (adjustedPage < 0) {
            adjustedPage = 0; // 최소값 0
        }

        Page<ProdReadResponseDTO> productPage = sellerService.getProductsForSeller(adjustedPage, pageSize, token);
        List<ProdReadResponseDTO> products = productPage.getContent();

        int totalPages = productPage.getTotalPages();
        int pageBlock = 10; // 페이지 블록 크기
        int startPage = (adjustedPage / pageBlock) * pageBlock;
        int endPage = Math.min(startPage + pageBlock - 1, totalPages - 1);

        model.addAttribute("products", products);
        model.addAttribute("userId", userId);
        model.addAttribute("productPage", productPage);
        model.addAttribute("startPage", startPage + 1); // 1부터 시작
        model.addAttribute("endPage", endPage + 1); // 1부터 시작
        model.addAttribute("showPrevious", startPage > 0);
        model.addAttribute("showNext", endPage < totalPages - 1);

        return "mymarket";
    }

    @GetMapping("/sale/history")
    public String history(@CookieValue(value = "Authorization", required = false) String token, Model model) {
        if (token == null || token.isEmpty()) {
            throw new IllegalStateException("Authorization token is missing");
        }

        // 현재 사용자 memberNo 가져오기
        Long userId = userService.getMemberNo(token);
        log.info("How MBN???: {}", userId);

        List<SaleHistoryDTO> saleHistoryList = sellerService.getSaleHistoryBySellerID(userId);

        int totalSalesAmount = saleHistoryList.stream()
                .mapToInt(SaleHistoryDTO::getPrice)
                .sum();

        model.addAttribute("saleHistoryList", saleHistoryList);
        model.addAttribute("totalSalesAmount", totalSalesAmount);

        return "sale_history";
    }
}