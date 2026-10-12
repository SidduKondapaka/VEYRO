package com.veyro.service;

import com.veyro.dto.*;
import com.veyro.entity.*;
import com.veyro.exception.BadRequestException;
import com.veyro.exception.InsufficientStockException;
import com.veyro.exception.ResourceNotFoundException;
import com.veyro.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;
    private final CartRepository cartRepository;
    private final AddressRepository addressRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    private static final SecureRandom RANDOM = new SecureRandom();

    public OrderService(OrderRepository orderRepository,
                        OrderItemRepository orderItemRepository,
                        OrderStatusHistoryRepository orderStatusHistoryRepository,
                        CartRepository cartRepository,
                        AddressRepository addressRepository,
                        ProductRepository productRepository,
                        UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.orderStatusHistoryRepository = orderStatusHistoryRepository;
        this.cartRepository = cartRepository;
        this.addressRepository = addressRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public OrderDto checkout(Long userId, CheckoutRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("Your shopping cart is empty"));

        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Cannot checkout with an empty cart");
        }

        Address address = addressRepository.findByIdAndUserId(request.getAddressId(), userId)
                .orElseThrow(() -> new BadRequestException("Invalid delivery address selected"));

        // Format shipping address snapshot
        String formattedAddress = address.getRecipientName() + ", " +
                address.getStreetAddress() + (address.getApartment() != null ? ", " + address.getApartment() : "") + ", " +
                address.getCity() + ", " + address.getState() + " - " + address.getPostalCode() + ", " +
                address.getCountry() + " (Phone: " + address.getPhone() + ")";

        // Generate Order Number
        String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randPart = String.format("%04d", RANDOM.nextInt(10000));
        String orderNumber = "VYR-" + datePart + "-" + randPart;

        Order order = new Order();
        order.setOrderNumber(orderNumber);
        order.setUser(user);
        order.setRecipientName(address.getRecipientName());
        order.setShippingAddress(formattedAddress);
        order.setPhone(address.getPhone());
        order.setPaymentMethod(request.getPaymentMethod());
        order.setNotes(request.getNotes());

        // Process payment status for demo mode
        if ("COD".equalsIgnoreCase(request.getPaymentMethod())) {
            order.setPaymentStatus("PENDING");
        } else {
            // Simulated Card / UPI gateway (DEMO MODE)
            order.setPaymentStatus("PAID");
        }

        order.setOrderStatus("CONFIRMED");

        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        // Validate inventory and deduct stock within transaction
        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();

            // Refresh from DB to ensure latest stock
            Product freshProduct = productRepository.findById(product.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product no longer exists"));

            if (freshProduct.getStockQuantity() < cartItem.getQuantity()) {
                throw new InsufficientStockException("Insufficient stock for product '" + freshProduct.getName() +
                        "'. Requested: " + cartItem.getQuantity() + ", Available: " + freshProduct.getStockQuantity());
            }

            // Deduct stock
            freshProduct.setStockQuantity(freshProduct.getStockQuantity() - cartItem.getQuantity());
            productRepository.save(freshProduct);

            BigDecimal unitPrice = freshProduct.getSalePrice() != null ? freshProduct.getSalePrice() : freshProduct.getPrice();
            BigDecimal itemTotal = unitPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            subtotal = subtotal.add(itemTotal);

            String primaryImage = freshProduct.getImages().isEmpty() ? null : freshProduct.getImages().get(0).getImageUrl();

            OrderItem orderItem = new OrderItem(
                    order,
                    freshProduct,
                    freshProduct.getName(),
                    primaryImage,
                    unitPrice,
                    cartItem.getQuantity(),
                    itemTotal
            );
            orderItems.add(orderItem);
        }

        order.setItems(orderItems);
        order.setSubtotal(subtotal);

        // Shipping fee: free above 500
        BigDecimal shippingFee = subtotal.compareTo(BigDecimal.valueOf(500)) >= 0 ? BigDecimal.ZERO : BigDecimal.valueOf(40.00);
        order.setShippingFee(shippingFee);
        order.setDiscount(BigDecimal.ZERO);
        order.setTotalAmount(subtotal.add(shippingFee));

        Order savedOrder = orderRepository.save(order);

        // Add initial status history
        OrderStatusHistory initialHistory = new OrderStatusHistory(
                savedOrder, "CONFIRMED", "Order placed and confirmed successfully.");
        orderStatusHistoryRepository.save(initialHistory);

        // Clear the user's cart
        cart.clearItems();
        cartRepository.save(cart);

        return mapToDto(savedOrder);
    }

    @Transactional(readOnly = true)
    public PagedResponse<OrderDto> getUserOrders(Long userId, Pageable pageable) {
        Page<Order> orderPage = orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        List<OrderDto> content = orderPage.getContent().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                content,
                orderPage.getNumber(),
                orderPage.getSize(),
                orderPage.getTotalElements(),
                orderPage.getTotalPages(),
                orderPage.isLast()
        );
    }

    @Transactional(readOnly = true)
    public OrderDto getUserOrderById(Long orderId, Long userId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found or unauthorized"));
        return mapToDto(order);
    }

    @Transactional(readOnly = true)
    public OrderDto getOrderByOrderNumber(String orderNumber, Long userId) {
        Order order = orderRepository.findByOrderNumberAndUserId(orderNumber, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found or unauthorized"));
        return mapToDto(order);
    }

    @Transactional
    public OrderDto cancelOrder(Long orderId, Long userId, String reason) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found or unauthorized"));

        // Only PENDING, CONFIRMED, or PROCESSING orders can be cancelled
        if ("SHIPPED".equalsIgnoreCase(order.getOrderStatus()) ||
            "OUT_FOR_DELIVERY".equalsIgnoreCase(order.getOrderStatus()) ||
            "DELIVERED".equalsIgnoreCase(order.getOrderStatus()) ||
            "CANCELLED".equalsIgnoreCase(order.getOrderStatus())) {
            throw new BadRequestException("Order cannot be cancelled in its current status: " + order.getOrderStatus());
        }

        // Restore product stock
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
            productRepository.save(product);
        }

        order.setOrderStatus("CANCELLED");
        Order updated = orderRepository.save(order);

        OrderStatusHistory history = new OrderStatusHistory(
                updated, "CANCELLED", reason != null ? reason : "Cancelled by customer.");
        orderStatusHistoryRepository.save(history);

        return mapToDto(updated);
    }

    @Transactional(readOnly = true)
    public PagedResponse<OrderDto> getAllOrdersAdmin(String status, String search, Pageable pageable) {
        Page<Order> orderPage = orderRepository.findAllWithFilter(status, search, pageable);
        List<OrderDto> content = orderPage.getContent().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                content,
                orderPage.getNumber(),
                orderPage.getSize(),
                orderPage.getTotalElements(),
                orderPage.getTotalPages(),
                orderPage.isLast()
        );
    }

    @Transactional
    public OrderDto updateOrderStatusAdmin(Long orderId, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        String oldStatus = order.getOrderStatus();
        String newStatus = request.getStatus().toUpperCase().trim();

        // If transitioning to CANCELLED from non-cancelled, restore stock
        if ("CANCELLED".equals(newStatus) && !"CANCELLED".equals(oldStatus)) {
            for (OrderItem item : order.getItems()) {
                Product product = item.getProduct();
                product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
                productRepository.save(product);
            }
        }

        // If transitioning to DELIVERED, mark payment as PAID if COD
        if ("DELIVERED".equals(newStatus) && "PENDING".equals(order.getPaymentStatus())) {
            order.setPaymentStatus("PAID");
        }

        order.setOrderStatus(newStatus);
        Order updated = orderRepository.save(order);

        OrderStatusHistory history = new OrderStatusHistory(
                updated, newStatus, request.getComment() != null ? request.getComment() : "Status updated to " + newStatus);
        orderStatusHistoryRepository.save(history);

        return mapToDto(updated);
    }

    public OrderDto mapToDto(Order order) {
        OrderDto dto = new OrderDto();
        dto.setId(order.getId());
        dto.setOrderNumber(order.getOrderNumber());
        dto.setUserId(order.getUser().getId());
        dto.setUserEmail(order.getUser().getEmail());
        dto.setRecipientName(order.getRecipientName());
        dto.setShippingAddress(order.getShippingAddress());
        dto.setPhone(order.getPhone());
        dto.setSubtotal(order.getSubtotal());
        dto.setShippingFee(order.getShippingFee());
        dto.setDiscount(order.getDiscount());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setPaymentMethod(order.getPaymentMethod());
        dto.setPaymentStatus(order.getPaymentStatus());
        dto.setOrderStatus(order.getOrderStatus());
        dto.setNotes(order.getNotes());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());

        List<OrderItemDto> itemDtos = order.getItems().stream().map(item -> {
            OrderItemDto itemDto = new OrderItemDto();
            itemDto.setId(item.getId());
            itemDto.setProductId(item.getProduct().getId());
            itemDto.setProductName(item.getProductName());
            itemDto.setProductImage(item.getProductImage());
            itemDto.setUnitPrice(item.getUnitPrice());
            itemDto.setQuantity(item.getQuantity());
            itemDto.setTotalPrice(item.getTotalPrice());
            return itemDto;
        }).collect(Collectors.toList());
        dto.setItems(itemDtos);

        List<OrderStatusHistory> histories = orderStatusHistoryRepository.findByOrderIdOrderByCreatedAtAsc(order.getId());
        List<OrderStatusHistoryDto> historyDtos = histories.stream().map(h ->
                new OrderStatusHistoryDto(h.getId(), h.getStatus(), h.getComment(), h.getCreatedAt())
        ).collect(Collectors.toList());
        dto.setStatusHistory(historyDtos);

        return dto;
    }
}
