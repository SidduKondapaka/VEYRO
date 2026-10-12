package com.veyro.service;

import com.veyro.dto.*;
import com.veyro.entity.*;
import com.veyro.exception.BadRequestException;
import com.veyro.exception.ResourceNotFoundException;
import com.veyro.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public ReviewService(ReviewRepository reviewRepository,
                         ProductRepository productRepository,
                         UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public PagedResponse<ReviewDto> getProductReviews(Long productId, Pageable pageable) {
        Page<Review> reviewPage = reviewRepository.findByProductIdAndApprovedTrueOrderByCreatedAtDesc(productId, pageable);
        List<ReviewDto> content = reviewPage.getContent().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                content,
                reviewPage.getNumber(),
                reviewPage.getSize(),
                reviewPage.getTotalElements(),
                reviewPage.getTotalPages(),
                reviewPage.isLast()
        );
    }

    @Transactional
    public ReviewDto addReview(Long productId, Long userId, CreateReviewRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (reviewRepository.existsByProductIdAndUserId(productId, userId)) {
            throw new BadRequestException("You have already reviewed this product");
        }

        boolean verifiedPurchase = reviewRepository.hasUserPurchasedProduct(userId, productId);

        Review review = new Review();
        review.setProduct(product);
        review.setUser(user);
        review.setRating(request.getRating());
        review.setTitle(request.getTitle());
        review.setComment(request.getComment().trim());
        review.setVerifiedPurchase(verifiedPurchase);
        review.setApproved(true);

        Review saved = reviewRepository.save(review);

        // Recalculate and update product rating and review count
        Double avg = reviewRepository.getAverageRatingByProductId(productId);
        Integer count = reviewRepository.countApprovedByProductId(productId);

        if (avg != null) {
            product.setRating(BigDecimal.valueOf(avg).setScale(1, RoundingMode.HALF_UP));
        }
        product.setReviewCount(count != null ? count : 0);
        productRepository.save(product);

        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public PagedResponse<ReviewDto> getAllReviewsAdmin(Pageable pageable) {
        Page<Review> reviewPage = reviewRepository.findAllByOrderByCreatedAtDesc(pageable);
        List<ReviewDto> content = reviewPage.getContent().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                content,
                reviewPage.getNumber(),
                reviewPage.getSize(),
                reviewPage.getTotalElements(),
                reviewPage.getTotalPages(),
                reviewPage.isLast()
        );
    }

    @Transactional
    public void deleteReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + reviewId));
        Long productId = review.getProduct().getId();
        reviewRepository.delete(review);

        // Recalculate product rating
        Double avg = reviewRepository.getAverageRatingByProductId(productId);
        Integer count = reviewRepository.countApprovedByProductId(productId);
        Product product = productRepository.findById(productId).orElse(null);
        if (product != null) {
            product.setRating(avg != null ? BigDecimal.valueOf(avg).setScale(1, RoundingMode.HALF_UP) : BigDecimal.ZERO);
            product.setReviewCount(count != null ? count : 0);
            productRepository.save(product);
        }
    }

    public ReviewDto mapToDto(Review review) {
        ReviewDto dto = new ReviewDto();
        dto.setId(review.getId());
        dto.setProductId(review.getProduct().getId());
        dto.setProductName(review.getProduct().getName());
        dto.setUserId(review.getUser().getId());
        dto.setUserName(review.getUser().getFullName());
        dto.setUserAvatar(review.getUser().getAvatarUrl());
        dto.setRating(review.getRating());
        dto.setTitle(review.getTitle());
        dto.setComment(review.getComment());
        dto.setVerifiedPurchase(review.isVerifiedPurchase());
        dto.setApproved(review.isApproved());
        dto.setCreatedAt(review.getCreatedAt());
        return dto;
    }
}
