package com.veyro.controller;

import com.veyro.dto.*;
import com.veyro.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
@Tag(name = "Admin Operations", description = "Endpoints restricted to administrative users for store management")
public class AdminController {

    private final AdminService adminService;
    private final ProductService productService;
    private final CategoryService categoryService;
    private final OrderService orderService;
    private final ReviewService reviewService;

    public AdminController(AdminService adminService,
                           ProductService productService,
                           CategoryService categoryService,
                           OrderService orderService,
                           ReviewService reviewService) {
        this.adminService = adminService;
        this.productService = productService;
        this.categoryService = categoryService;
        this.orderService = orderService;
        this.reviewService = reviewService;
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get aggregated administrator statistics and sales summary")
    public ResponseEntity<DashboardStatsDto> getDashboardStats() {
        DashboardStatsDto stats = adminService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/customers")
    @Operation(summary = "List registered customers with pagination")
    public ResponseEntity<PagedResponse<UserDto>> getCustomers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        PagedResponse<UserDto> customers = adminService.getAllCustomers(
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        return ResponseEntity.ok(customers);
    }

    // Orders Management
    @GetMapping("/orders")
    @Operation(summary = "List all customer orders with filtering by status and search")
    public ResponseEntity<PagedResponse<OrderDto>> getOrders(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        PagedResponse<OrderDto> orders = orderService.getAllOrdersAdmin(
                status, search, PageRequest.of(page, size));
        return ResponseEntity.ok(orders);
    }

    @PatchMapping("/orders/{id}/status")
    @Operation(summary = "Update order status (Confirmed, Processing, Shipped, Delivered, Cancelled)")
    public ResponseEntity<OrderDto> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        OrderDto order = orderService.updateOrderStatusAdmin(id, request);
        return ResponseEntity.ok(order);
    }

    // Products Management
    @PostMapping("/products")
    @Operation(summary = "Create a new product in the catalog")
    public ResponseEntity<ProductDto> createProduct(@Valid @RequestBody ProductRequest request) {
        ProductDto created = productService.createProduct(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/products/{id}")
    @Operation(summary = "Update an existing product")
    public ResponseEntity<ProductDto> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request) {
        ProductDto updated = productService.updateProduct(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/products/{id}")
    @Operation(summary = "Deactivate/delete a product")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Product deleted successfully"));
    }

    // Categories Management
    @GetMapping("/categories")
    @Operation(summary = "Get all categories for management")
    public ResponseEntity<List<CategoryDto>> getCategories() {
        List<CategoryDto> categories = categoryService.getAllCategoriesAdmin();
        return ResponseEntity.ok(categories);
    }

    @PostMapping("/categories")
    @Operation(summary = "Create a new category")
    public ResponseEntity<CategoryDto> createCategory(@Valid @RequestBody CategoryRequest request) {
        CategoryDto created = categoryService.createCategory(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/categories/{id}")
    @Operation(summary = "Update an existing category")
    public ResponseEntity<CategoryDto> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request) {
        CategoryDto updated = categoryService.updateCategory(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/categories/{id}")
    @Operation(summary = "Delete a category")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success("Category deleted successfully"));
    }

    // Reviews Moderation
    @GetMapping("/reviews")
    @Operation(summary = "List all customer reviews for moderation")
    public ResponseEntity<PagedResponse<ReviewDto>> getReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PagedResponse<ReviewDto> reviews = reviewService.getAllReviewsAdmin(
                PageRequest.of(page, size));
        return ResponseEntity.ok(reviews);
    }

    @DeleteMapping("/reviews/{id}")
    @Operation(summary = "Delete an inappropriate review")
    public ResponseEntity<ApiResponse<Void>> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return ResponseEntity.ok(ApiResponse.success("Review deleted successfully"));
    }
}
