package com.veyro.service;

import com.veyro.dto.*;
import com.veyro.entity.User;
import com.veyro.repository.OrderRepository;
import com.veyro.repository.ProductRepository;
import com.veyro.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderService orderService;
    private final AuthService authService;

    public AdminService(OrderRepository orderRepository,
                        ProductRepository productRepository,
                        UserRepository userRepository,
                        OrderService orderService,
                        AuthService authService) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.orderService = orderService;
        this.authService = authService;
    }

    @Transactional(readOnly = true)
    public DashboardStatsDto getDashboardStats() {
        BigDecimal totalRevenue = orderRepository.calculateTotalRevenue();
        long totalOrders = orderRepository.count();
        long totalCustomers = userRepository.count();
        long totalProducts = productRepository.count();
        long lowStockProducts = productRepository.countLowStockProducts(5);

        List<OrderDto> recentOrders = orderRepository.findTop5ByOrderByCreatedAtDesc().stream()
                .map(orderService::mapToDto)
                .collect(Collectors.toList());

        return new DashboardStatsDto(
                totalRevenue,
                totalOrders,
                totalCustomers,
                totalProducts,
                lowStockProducts,
                recentOrders
        );
    }

    @Transactional(readOnly = true)
    public PagedResponse<UserDto> getAllCustomers(Pageable pageable) {
        Page<User> userPage = userRepository.findAll(pageable);
        List<UserDto> content = userPage.getContent().stream()
                .map(authService::mapToUserDto)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                content,
                userPage.getNumber(),
                userPage.getSize(),
                userPage.getTotalElements(),
                userPage.getTotalPages(),
                userPage.isLast()
        );
    }
}
