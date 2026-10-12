package com.veyro.controller;

import com.veyro.dto.CartDto;
import com.veyro.dto.WishlistDto;
import com.veyro.security.UserPrincipal;
import com.veyro.service.WishlistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wishlist")
@Tag(name = "Wishlist", description = "Endpoints for managing saved wishlist items")
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    @GetMapping
    @Operation(summary = "Get current user's wishlist")
    public ResponseEntity<WishlistDto> getWishlist(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        WishlistDto wishlist = wishlistService.getWishlist(userPrincipal.getId());
        return ResponseEntity.ok(wishlist);
    }

    @PostMapping("/items/{productId}")
    @Operation(summary = "Add a product to wishlist")
    public ResponseEntity<WishlistDto> addToWishlist(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long productId) {
        WishlistDto wishlist = wishlistService.addToWishlist(userPrincipal.getId(), productId);
        return ResponseEntity.ok(wishlist);
    }

    @DeleteMapping("/items/{productId}")
    @Operation(summary = "Remove a product from wishlist")
    public ResponseEntity<WishlistDto> removeFromWishlist(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long productId) {
        WishlistDto wishlist = wishlistService.removeFromWishlist(userPrincipal.getId(), productId);
        return ResponseEntity.ok(wishlist);
    }

    @PostMapping("/items/{productId}/move-to-cart")
    @Operation(summary = "Move product from wishlist to cart")
    public ResponseEntity<CartDto> moveToCart(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long productId) {
        CartDto cart = wishlistService.moveToCart(userPrincipal.getId(), productId);
        return ResponseEntity.ok(cart);
    }
}
