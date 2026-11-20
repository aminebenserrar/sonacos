package com.sonacos.backend.dto.cart;

import java.math.BigDecimal;
import java.util.List;

public record CartResponse(
        Long id,
        Long clientId,
        int itemsCount,
        BigDecimal totalAmount,
        List<CartItemResponse> items
) {
}
