package com.sonacos.backend.dto.order;

import java.math.BigDecimal;

public record OrderItemResponse(
        Long id,
        Long productId,
        String productName,
        String productReference,
        Integer quantity,
        BigDecimal unitPrice,
        BigDecimal subtotal
) {
}
