package com.veyro.service;

import com.veyro.dto.*;
import com.veyro.entity.*;
import com.veyro.exception.BadRequestException;
import com.veyro.exception.InsufficientStockException;
import com.veyro.exception.ResourceNotFoundException;
import com.veyro.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartService(CartRepository cartRepository,
                       CartItemRepository cartItemRepository,
                       ProductRepository productRepository,
                       UserRepository userRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public CartDto getCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        return mapToDto(cart);
    }

    @Transactional
    public CartDto addToCart(Long userId, AddToCartRequest request) {
        Cart cart = getOrCreateCart(userId);

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        if (!product.isActive()) {
            throw new BadRequestException("Product is currently unavailable");
        }

        if (product.getStockQuantity() <= 0) {
            throw new InsufficientStockException("Product is out of stock");
        }

        Optional<CartItem> existingItemOpt = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId());

        if (existingItemOpt.isPresent()) {
            CartItem item = existingItemOpt.get();
            int newQuantity = item.getQuantity() + request.getQuantity();
            if (newQuantity > product.getStockQuantity()) {
                throw new InsufficientStockException(
                        "Cannot add " + request.getQuantity() + " more items. Only " + product.getStockQuantity() + " available in stock.");
            }
            item.setQuantity(newQuantity);
            cartItemRepository.save(item);
        } else {
            if (request.getQuantity() > product.getStockQuantity()) {
                throw new InsufficientStockException(
                        "Requested quantity (" + request.getQuantity() + ") exceeds available stock (" + product.getStockQuantity() + ")");
            }
            CartItem newItem = new CartItem(cart, product, request.getQuantity());
            cart.addItem(newItem);
            cartItemRepository.save(newItem);
        }

        Cart updatedCart = cartRepository.findById(cart.getId()).orElse(cart);
        return mapToDto(updatedCart);
    }

    @Transactional
    public CartDto updateCartItem(Long userId, Long itemId, UpdateCartItemRequest request) {
        CartItem item = cartItemRepository.findByIdAndCartUserId(itemId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found or unauthorized"));

        Product product = item.getProduct();
        if (request.getQuantity() > product.getStockQuantity()) {
            throw new InsufficientStockException(
                    "Requested quantity (" + request.getQuantity() + ") exceeds available stock (" + product.getStockQuantity() + ")");
        }

        item.setQuantity(request.getQuantity());
        cartItemRepository.save(item);

        Cart cart = item.getCart();
        return mapToDto(cart);
    }

    @Transactional
    public CartDto removeCartItem(Long userId, Long itemId) {
        CartItem item = cartItemRepository.findByIdAndCartUserId(itemId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found or unauthorized"));

        Cart cart = item.getCart();
        cart.removeItem(item);
        cartItemRepository.delete(item);

        return mapToDto(cart);
    }

    @Transactional
    public CartDto clearCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        cartItemRepository.deleteByCartId(cart.getId());
        cart.clearItems();
        return mapToDto(cart);
    }

    private Cart getOrCreateCart(Long userId) {
        return cartRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
            Cart newCart = new Cart(user);
            return cartRepository.save(newCart);
        });
    }

    public CartDto mapToDto(Cart cart) {
        CartDto dto = new CartDto();
        dto.setId(cart.getId());

        List<CartItemDto> itemDtos = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;
        int totalItems = 0;

        for (CartItem item : cart.getItems()) {
            Product product = item.getProduct();
            BigDecimal effectivePrice = product.getSalePrice() != null ? product.getSalePrice() : product.getPrice();
            BigDecimal itemTotal = effectivePrice.multiply(BigDecimal.valueOf(item.getQuantity()));

            CartItemDto itemDto = new CartItemDto();
            itemDto.setId(item.getId());
            itemDto.setProductId(product.getId());
            itemDto.setProductName(product.getName());
            itemDto.setProductSlug(product.getSlug());
            itemDto.setUnitPrice(effectivePrice);
            itemDto.setQuantity(item.getQuantity());
            itemDto.setAvailableStock(product.getStockQuantity());
            itemDto.setSubtotal(itemTotal);

            String image = product.getImages().isEmpty() ? null : product.getImages().get(0).getImageUrl();
            itemDto.setProductImage(image);

            itemDtos.add(itemDto);
            subtotal = subtotal.add(itemTotal);
            totalItems += item.getQuantity();
        }

        dto.setItems(itemDtos);
        dto.setTotalItems(totalItems);
        dto.setSubtotal(subtotal);

        // Free shipping if subtotal >= 500, else 40
        BigDecimal shipping = subtotal.compareTo(BigDecimal.valueOf(500)) >= 0 || totalItems == 0
                ? BigDecimal.ZERO
                : BigDecimal.valueOf(40.00);
        dto.setEstimatedShipping(shipping);
        dto.setTotal(subtotal.add(shipping));

        return dto;
    }
}
