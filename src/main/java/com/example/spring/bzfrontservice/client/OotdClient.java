package com.example.spring.bzfrontservice.client;

import com.example.spring.bzfrontservice.dto.OotdRequestDTO;
import com.example.spring.bzfrontservice.dto.OotdResponseDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@FeignClient(name = "ootdClient", url = "${bzbzo.bz-edge-service-url}/ootd")
public interface OotdClient {

    @GetMapping()
    List<OotdResponseDTO> getOotdList();

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    ResponseEntity<String> createOotd(@RequestParam("memberNo") Long memberNo,
                                      @RequestParam("tags") String tags,
                                      @RequestParam("relProd") String relProd,
                                      @RequestPart("image") MultipartFile image,
                                      @RequestHeader(value = "Authorization", required = false) String authorization);

    @GetMapping("/like/history")
    boolean isUserLikedOotd(@RequestParam Long memberNo, @RequestParam Long id);

    @GetMapping("/heart/num")
    int getHeartNum(@RequestParam Long ootdId);

    @PostMapping("/heart")
    boolean toggleLike(@RequestParam Long memberNo, @RequestParam Long ootdId);

    @GetMapping("/recent")
    List<OotdResponseDTO> getRecentOotds(@RequestParam int i);
}
