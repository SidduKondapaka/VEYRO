package com.veyro.controller;

import com.veyro.dto.*;
import com.veyro.security.UserPrincipal;
import com.veyro.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@Tag(name = "Shopping Cart", description = "Endpoints for managing authenticated customer shopping carts")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    @Operation(summary = "Get current user's shopping cart")
    public ResponseEntity<CartDto> getCart(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        CartDto cart = cartService.getCart(userPrincipal.getId());
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/items")
    @Operation(summary = "Add an item to the shopping cart")
    public ResponseEntity<CartDto> addToCart(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody AddToCartRequest request) {
        CartDto cart = cartService.addToCart(userPrincipal.getId(), request);
        return ResponseEntity.ok(cart);
    }

    @PatchMapping("/items/{itemId}")
    @Operation(summary = "Update quantity of a cart item")
    public ResponseEntity<CartDto> updateCartItem(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long itemId,
            @Valid @RequestBody UpdateCartItemRequest request) {
        CartDto cart = cartService.updateCartItem(userPrincipal.getId(), itemId, request);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/items/{itemId}")
    @Operation(summary = "Remove an item from the cart")
    public ResponseEntity<CartDto> removeCartItem(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long itemId) {
        CartDto cart = cartService.removeCartItem(userPrincipal.getId(), itemId);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping
    @Operation(summary = "Clear all items from the cart")
    public ResponseEntity<CartDto> clearCart(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        CartDto cart = cartService.clearCart(userPrincipal.getId());
        return ResponseEntity.ok(cart);
    }
}
