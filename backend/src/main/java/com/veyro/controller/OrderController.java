package com.veyro.controller;

import com.veyro.dto.*;
import com.veyro.security.UserPrincipal;
import com.veyro.service.OrderService;
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
@RequestMapping("/api/orders")
@Tag(name = "Orders and Checkout", description = "Endpoints for order placement, tracking, and cancellation")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/checkout")
    @Operation(summary = "Checkout current shopping cart and create an order")
    public ResponseEntity<OrderDto> checkout(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody CheckoutRequest request) {
        OrderDto order = orderService.checkout(userPrincipal.getId(), request);
        return new ResponseEntity<>(order, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get authenticated user's order history")
    public ResponseEntity<PagedResponse<OrderDto>> getMyOrders(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<OrderDto> orders = orderService.getUserOrders(
                userPrincipal.getId(),
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get specific order details by ID")
    public ResponseEntity<OrderDto> getOrderById(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        OrderDto order = orderService.getUserOrderById(id, userPrincipal.getId());
        return ResponseEntity.ok(order);
    }

    @GetMapping("/number/{orderNumber}")
    @Operation(summary = "Get specific order details by unique order number")
    public ResponseEntity<OrderDto> getOrderByNumber(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable String orderNumber) {
        OrderDto order = orderService.getOrderByOrderNumber(orderNumber, userPrincipal.getId());
        return ResponseEntity.ok(order);
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel an eligible order")
    public ResponseEntity<OrderDto> cancelOrder(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "Cancelled by user") String reason) {
        OrderDto order = orderService.cancelOrder(id, userPrincipal.getId(), reason);
        return ResponseEntity.ok(order);
    }
}
