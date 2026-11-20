package com.sonacos.backend.dto.cart;

import java.math.BigDecimal;

public record CartItemResponse(
        Long id,
        Long productId,
        String productSlug,
        String productName,
        String productReference,
        String categoryName,
        String unit,
        String imageUrl,
        Integer quantity,
        Integer availableStock,
        BigDecimal unitPrice,
        BigDecimal subtotal
) {
}
