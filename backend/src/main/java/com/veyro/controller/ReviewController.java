package com.veyro.controller;

import com.veyro.dto.*;
import com.veyro.security.UserPrincipal;
import com.veyro.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products/{productId}/reviews")
@Tag(name = "Product Reviews", description = "Endpoints for customer product ratings and reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping
    @Operation(summary = "Get reviews for a product with pagination")
    public ResponseEntity<PagedResponse<ReviewDto>> getReviews(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        PagedResponse<ReviewDto> reviews = reviewService.getProductReviews(
                productId,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        return ResponseEntity.ok(reviews);
    }

    @PostMapping
    @Operation(summary = "Submit a customer rating and review")
    public ResponseEntity<ReviewDto> addReview(
            @PathVariable Long productId,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody CreateReviewRequest request) {
        ReviewDto review = reviewService.addReview(productId, userPrincipal.getId(), request);
        return new ResponseEntity<>(review, HttpStatus.CREATED);
    }
}
