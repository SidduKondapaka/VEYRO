package com.veyro;

import com.veyro.dto.PagedResponse;
import com.veyro.dto.ProductDto;
import com.veyro.service.ProductService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class ProductServiceTest {

    @Autowired
    private ProductService productService;

    @Test
    public void testCatalogRetrievalAndSearch() {
        // Retrieve seeded products
        PagedResponse<ProductDto> response = productService.searchProducts(
                null, null, null, null, null, null, false, 0, 10, "newest", "desc");

        assertNotNull(response);
        assertFalse(response.getContent().isEmpty(), "Catalog should contain seeded products");

        // Search by keyword
        PagedResponse<ProductDto> searchResponse = productService.searchProducts(
                "Headphones", null, null, null, null, null, false, 0, 10, "newest", "desc");

        assertNotNull(searchResponse);
        assertTrue(searchResponse.getContent().stream()
                .anyMatch(p -> p.getName().toLowerCase().contains("headphones")));

        // Check featured products
        List<ProductDto> featured = productService.getFeaturedProducts();
        assertNotNull(featured);
        assertFalse(featured.isEmpty());
    }
}
