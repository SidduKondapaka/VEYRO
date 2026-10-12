package com.veyro.service;

import com.veyro.dto.*;
import com.veyro.entity.*;
import com.veyro.exception.ResourceNotFoundException;
import com.veyro.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final WishlistItemRepository wishlistItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CartService cartService;

    public WishlistService(WishlistRepository wishlistRepository,
                           WishlistItemRepository wishlistItemRepository,
                           ProductRepository productRepository,
                           UserRepository userRepository,
                           CartService cartService) {
        this.wishlistRepository = wishlistRepository;
        this.wishlistItemRepository = wishlistItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.cartService = cartService;
    }

    @Transactional
    public WishlistDto getWishlist(Long userId) {
        Wishlist wishlist = getOrCreateWishlist(userId);
        return mapToDto(wishlist);
    }

    @Transactional
    public WishlistDto addToWishlist(Long userId, Long productId) {
        Wishlist wishlist = getOrCreateWishlist(userId);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        Optional<WishlistItem> existing = wishlistItemRepository.findByWishlistIdAndProductId(wishlist.getId(), productId);
        if (existing.isEmpty()) {
            WishlistItem item = new WishlistItem(wishlist, product);
            wishlist.addItem(item);
            wishlistItemRepository.save(item);
        }

        Wishlist updated = wishlistRepository.findById(wishlist.getId()).orElse(wishlist);
        return mapToDto(updated);
    }

    @Transactional
    public WishlistDto removeFromWishlist(Long userId, Long productId) {
        Wishlist wishlist = getOrCreateWishlist(userId);
        wishlistItemRepository.deleteByWishlistIdAndProductId(wishlist.getId(), productId);
        Wishlist updated = wishlistRepository.findById(wishlist.getId()).orElse(wishlist);
        return mapToDto(updated);
    }

    @Transactional
    public CartDto moveToCart(Long userId, Long productId) {
        // Add to cart
        CartDto cart = cartService.addToCart(userId, new AddToCartRequest(productId, 1));
        // Remove from wishlist
        removeFromWishlist(userId, productId);
        return cart;
    }

    private Wishlist getOrCreateWishlist(Long userId) {
        return wishlistRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
            Wishlist newWishlist = new Wishlist(user);
            return wishlistRepository.save(newWishlist);
        });
    }

    public WishlistDto mapToDto(Wishlist wishlist) {
        WishlistDto dto = new WishlistDto();
        dto.setId(wishlist.getId());

        List<WishlistItemDto> itemDtos = new ArrayList<>();
        for (WishlistItem item : wishlist.getItems()) {
            Product product = item.getProduct();
            WishlistItemDto itemDto = new WishlistItemDto();
            itemDto.setId(item.getId());
            itemDto.setProductId(product.getId());
            itemDto.setProductName(product.getName());
            itemDto.setProductSlug(product.getSlug());
            itemDto.setPrice(product.getPrice());
            itemDto.setSalePrice(product.getSalePrice());
            itemDto.setStockQuantity(product.getStockQuantity());
            itemDto.setAddedAt(item.getAddedAt());

            String image = product.getImages().isEmpty() ? null : product.getImages().get(0).getImageUrl();
            itemDto.setProductImage(image);

            itemDtos.add(itemDto);
        }

        dto.setItems(itemDtos);
        dto.setTotalItems(itemDtos.size());
        return dto;
    }
}
