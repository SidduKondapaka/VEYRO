package com.veyro.service;

import com.veyro.dto.*;
import com.veyro.entity.*;
import com.veyro.exception.BadRequestException;
import com.veyro.exception.ResourceNotFoundException;
import com.veyro.repository.CategoryRepository;
import com.veyro.repository.ProductImageRepository;
import com.veyro.repository.ProductRepository;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductImageRepository productImageRepository;

    public ProductService(ProductRepository productRepository,
                          CategoryRepository categoryRepository,
                          ProductImageRepository productImageRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.productImageRepository = productImageRepository;
    }

    @Transactional(readOnly = true)
    public PagedResponse<ProductDto> searchProducts(
            String keyword,
            Long categoryId,
            String categorySlug,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            BigDecimal minRating,
            Boolean inStockOnly,
            int page,
            int size,
            String sortBy,
            String sortDirection) {

        Sort sort;
        if ("price_asc".equalsIgnoreCase(sortBy) || ("price".equalsIgnoreCase(sortBy) && "asc".equalsIgnoreCase(sortDirection))) {
            sort = Sort.by(Sort.Direction.ASC, "price");
        } else if ("price_desc".equalsIgnoreCase(sortBy) || ("price".equalsIgnoreCase(sortBy) && "desc".equalsIgnoreCase(sortDirection))) {
            sort = Sort.by(Sort.Direction.DESC, "price");
        } else if ("rating".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.DESC, "rating");
        } else if ("popular".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.DESC, "reviewCount");
        } else {
            sort = Sort.by(Sort.Direction.DESC, "createdAt");
        }

        Pageable pageable = PageRequest.of(page, size, sort);
        boolean inStock = Boolean.TRUE.equals(inStockOnly);

        Page<Product> productPage = productRepository.searchProducts(
                keyword, categoryId, categorySlug, minPrice, maxPrice, minRating, inStock, pageable);

        List<ProductDto> content = productPage.getContent().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                content,
                productPage.getNumber(),
                productPage.getSize(),
                productPage.getTotalElements(),
                productPage.getTotalPages(),
                productPage.isLast()
        );
    }

    @Transactional(readOnly = true)
    public ProductDetailDto getProductDetailBySlug(String slug) {
        Product product = productRepository.findBySlugAndActiveTrue(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with slug: " + slug));

        ProductDetailDto detailDto = mapToDetailDto(product);

        // Fetch related products from same category
        List<Product> related = productRepository.findTop4ByActiveTrueAndCategoryIdAndIdNot(
                product.getCategory().getId(), product.getId());
        detailDto.setRelatedProducts(related.stream().map(this::mapToDto).collect(Collectors.toList()));

        return detailDto;
    }

    @Transactional(readOnly = true)
    public ProductDto getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return mapToDto(product);
    }

    @Transactional(readOnly = true)
    public List<ProductDto> getFeaturedProducts() {
        return productRepository.findTop8ByActiveTrueAndFeaturedTrueOrderByRatingDesc().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductDto> getBestSellingProducts() {
        return productRepository.findTop8ByActiveTrueOrderByReviewCountDesc().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductDto> getNewArrivals() {
        return productRepository.findTop8ByActiveTrueOrderByCreatedAtDesc().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductDto createProduct(ProductRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        String slug = CategoryService.toSlug(request.getName().trim());
        if (productRepository.existsBySlug(slug)) {
            slug = slug + "-" + System.currentTimeMillis();
        }

        Product product = new Product();
        product.setName(request.getName().trim());
        product.setSlug(slug);
        product.setDescription(request.getDescription());
        product.setBrand(request.getBrand().trim());
        product.setCategory(category);
        product.setPrice(request.getPrice());
        product.setSalePrice(request.getSalePrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setActive(request.isActive());
        product.setFeatured(request.isFeatured());

        Product saved = productRepository.save(product);

        // Save images
        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            for (int i = 0; i < request.getImageUrls().size(); i++) {
                String url = request.getImageUrls().get(i);
                if (url != null && !url.trim().isEmpty()) {
                    ProductImage img = new ProductImage(url.trim(), i == 0, i);
                    saved.addImage(img);
                }
            }
            saved = productRepository.save(saved);
        }

        return mapToDto(saved);
    }

    @Transactional
    public ProductDto updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        product.setName(request.getName().trim());
        product.setDescription(request.getDescription());
        product.setBrand(request.getBrand().trim());
        product.setCategory(category);
        product.setPrice(request.getPrice());
        product.setSalePrice(request.getSalePrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setActive(request.isActive());
        product.setFeatured(request.isFeatured());

        // Update images if provided
        if (request.getImageUrls() != null) {
            product.getImages().clear();
            for (int i = 0; i < request.getImageUrls().size(); i++) {
                String url = request.getImageUrls().get(i);
                if (url != null && !url.trim().isEmpty()) {
                    ProductImage img = new ProductImage(url.trim(), i == 0, i);
                    product.addImage(img);
                }
            }
        }

        Product updated = productRepository.save(product);
        return mapToDto(updated);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        // Soft delete / deactivate to preserve order history
        product.setActive(false);
        productRepository.save(product);
    }

    public ProductDto mapToDto(Product product) {
        ProductDto dto = new ProductDto();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setSlug(product.getSlug());
        dto.setBrand(product.getBrand());
        dto.setCategoryId(product.getCategory().getId());
        dto.setCategoryName(product.getCategory().getName());
        dto.setCategorySlug(product.getCategory().getSlug());
        dto.setPrice(product.getPrice());
        dto.setSalePrice(product.getSalePrice());
        dto.setStockQuantity(product.getStockQuantity());
        dto.setRating(product.getRating());
        dto.setReviewCount(product.getReviewCount());
        dto.setActive(product.isActive());
        dto.setFeatured(product.isFeatured());

        List<String> urls = new ArrayList<>();
        String primary = null;
        for (ProductImage img : product.getImages()) {
            urls.add(img.getImageUrl());
            if (img.isPrimary() && primary == null) {
                primary = img.getImageUrl();
            }
        }
        if (primary == null && !urls.isEmpty()) {
            primary = urls.get(0);
        }
        dto.setPrimaryImageUrl(primary);
        dto.setImageUrls(urls);
        return dto;
    }

    public ProductDetailDto mapToDetailDto(Product product) {
        ProductDetailDto dto = new ProductDetailDto();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setSlug(product.getSlug());
        dto.setDescription(product.getDescription());
        dto.setBrand(product.getBrand());
        dto.setCategoryId(product.getCategory().getId());
        dto.setCategoryName(product.getCategory().getName());
        dto.setCategorySlug(product.getCategory().getSlug());
        dto.setPrice(product.getPrice());
        dto.setSalePrice(product.getSalePrice());
        dto.setStockQuantity(product.getStockQuantity());
        dto.setRating(product.getRating());
        dto.setReviewCount(product.getReviewCount());
        dto.setActive(product.isActive());
        dto.setFeatured(product.isFeatured());

        List<String> urls = new ArrayList<>();
        String primary = null;
        for (ProductImage img : product.getImages()) {
            urls.add(img.getImageUrl());
            if (img.isPrimary() && primary == null) {
                primary = img.getImageUrl();
            }
        }
        if (primary == null && !urls.isEmpty()) {
            primary = urls.get(0);
        }
        dto.setPrimaryImageUrl(primary);
        dto.setImageUrls(urls);
        return dto;
    }
}
