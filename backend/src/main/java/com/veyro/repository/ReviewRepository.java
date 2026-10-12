package com.veyro.repository;

import com.veyro.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    Page<Review> findByProductIdAndApprovedTrueOrderByCreatedAtDesc(Long productId, Pageable pageable);
    List<Review> findByProductIdAndApprovedTrue(Long productId);
    Optional<Review> findByProductIdAndUserId(Long productId, Long userId);
    boolean existsByProductIdAndUserId(Long productId, Long userId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.id = :productId AND r.approved = true")
    Double getAverageRatingByProductId(@Param("productId") Long productId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.product.id = :productId AND r.approved = true")
    Integer countApprovedByProductId(@Param("productId") Long productId);

    @Query("SELECT CASE WHEN COUNT(oi) > 0 THEN TRUE ELSE FALSE END FROM OrderItem oi " +
           "WHERE oi.order.user.id = :userId AND oi.product.id = :productId " +
           "AND oi.order.orderStatus = 'DELIVERED'")
    boolean hasUserPurchasedProduct(@Param("userId") Long userId, @Param("productId") Long productId);

    Page<Review> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
