package com.veyro.repository;

import com.veyro.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    Optional<Product> findBySlugAndActiveTrue(String slug);
    Optional<Product> findBySlug(String slug);
    boolean existsBySlug(String slug);

    List<Product> findTop8ByActiveTrueAndFeaturedTrueOrderByRatingDesc();
    List<Product> findTop8ByActiveTrueOrderByReviewCountDesc();
    List<Product> findTop8ByActiveTrueOrderByCreatedAtDesc();

    List<Product> findTop4ByActiveTrueAndCategoryIdAndIdNot(Long categoryId, Long productId);

    @Query("SELECT p FROM Product p WHERE p.active = true " +
           "AND (:categoryId IS NULL OR p.category.id = :categoryId) " +
           "AND (:categorySlug IS NULL OR p.category.slug = :categorySlug) " +
           "AND (:keyword IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "     OR LOWER(p.brand) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "     OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:minPrice IS NULL OR COALESCE(p.salePrice, p.price) >= :minPrice) " +
           "AND (:maxPrice IS NULL OR COALESCE(p.salePrice, p.price) <= :maxPrice) " +
           "AND (:minRating IS NULL OR p.rating >= :minRating) " +
           "AND (:inStockOnly = false OR p.stockQuantity > 0)")
    Page<Product> searchProducts(
            @Param("keyword") String keyword,
            @Param("categoryId") Long categoryId,
            @Param("categorySlug") String categorySlug,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("minRating") BigDecimal minRating,
            @Param("inStockOnly") boolean inStockOnly,
            Pageable pageable);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.stockQuantity <= :threshold")
    long countLowStockProducts(@Param("threshold") int threshold);
}
