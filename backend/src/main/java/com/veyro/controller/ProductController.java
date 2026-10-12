package com.veyro.controller;

import com.veyro.dto.*;
import com.veyro.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@Tag(name = "Product Catalog", description = "Public endpoints for product discovery, search, filters, and details")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    @Operation(summary = "Search and filter products with pagination and sorting")
    public ResponseEntity<PagedResponse<ProductDto>> searchProducts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) BigDecimal minRating,
            @RequestParam(required = false, defaultValue = "false") Boolean inStockOnly,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "newest") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {

        PagedResponse<ProductDto> products = productService.searchProducts(
                keyword, categoryId, category, minPrice, maxPrice, minRating, inStockOnly,
                page, size, sortBy, sortDirection);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Get detailed product information by slug with related products")
    public ResponseEntity<ProductDetailDto> getProductBySlug(@PathVariable String slug) {
        ProductDetailDto product = productService.getProductDetailBySlug(slug);
        return ResponseEntity.ok(product);
    }

    @GetMapping("/id/{id}")
    @Operation(summary = "Get product by ID")
    public ResponseEntity<ProductDto> getProductById(@PathVariable Long id) {
        ProductDto product = productService.getProductById(id);
        return ResponseEntity.ok(product);
    }

    @GetMapping("/featured")
    @Operation(summary = "Get featured products for homepage showcase")
    public ResponseEntity<List<ProductDto>> getFeaturedProducts() {
        List<ProductDto> products = productService.getFeaturedProducts();
        return ResponseEntity.ok(products);
    }

    @GetMapping("/best-sellers")
    @Operation(summary = "Get best-selling products")
    public ResponseEntity<List<ProductDto>> getBestSellingProducts() {
        List<ProductDto> products = productService.getBestSellingProducts();
        return ResponseEntity.ok(products);
    }

    @GetMapping("/new-arrivals")
    @Operation(summary = "Get newest arrival products")
    public ResponseEntity<List<ProductDto>> getNewArrivals() {
        List<ProductDto> products = productService.getNewArrivals();
        return ResponseEntity.ok(products);
    }
}
