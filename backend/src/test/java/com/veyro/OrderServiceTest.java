package com.veyro;

import com.veyro.dto.*;
import com.veyro.entity.*;
import com.veyro.repository.*;
import com.veyro.service.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class OrderServiceTest {

    @Autowired
    private OrderService orderService;

    @Autowired
    private CartService cartService;

    @Autowired
    private AddressService addressService;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    public void testCompleteCheckoutAndCancellationFlow() {
        // Use demo customer
        User customer = userRepository.findByEmail("customer@veyro.com")
                .orElseThrow(() -> new IllegalStateException("Demo customer not found"));

        // Get an active product with stock
        List<Product> products = productRepository.findAll();
        assertFalse(products.isEmpty());
        Product product = products.get(0);
        int initialStock = product.getStockQuantity();
        assertTrue(initialStock >= 2, "Product should have at least 2 units in stock for test");

        // Ensure user has an address
        List<AddressDto> addresses = addressService.getUserAddresses(customer.getId());
        assertFalse(addresses.isEmpty());
        Long addressId = addresses.get(0).getId();

        // Add 2 items to cart
        cartService.clearCart(customer.getId());
        cartService.addToCart(customer.getId(), new AddToCartRequest(product.getId(), 2));

        // Checkout
        CheckoutRequest checkoutRequest = new CheckoutRequest(addressId, "DEMO_CARD", "Leave at reception");
        OrderDto order = orderService.checkout(customer.getId(), checkoutRequest);

        assertNotNull(order);
        assertNotNull(order.getOrderNumber());
        assertEquals("CONFIRMED", order.getOrderStatus());
        assertEquals("PAID", order.getPaymentStatus());

        // Verify stock was reduced by 2
        Product afterCheckoutProduct = productRepository.findById(product.getId()).orElseThrow();
        assertEquals(initialStock - 2, afterCheckoutProduct.getStockQuantity());

        // Cancel the order
        OrderDto cancelledOrder = orderService.cancelOrder(order.getId(), customer.getId(), "Accidental order");
        assertEquals("CANCELLED", cancelledOrder.getOrderStatus());

        // Verify stock was restored by 2
        Product afterCancelProduct = productRepository.findById(product.getId()).orElseThrow();
        assertEquals(initialStock, afterCancelProduct.getStockQuantity());
    }
}
