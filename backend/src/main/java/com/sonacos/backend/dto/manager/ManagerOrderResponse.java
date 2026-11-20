package com.sonacos.backend.dto.manager;

import com.sonacos.backend.enums.OrderStatus;
import com.sonacos.backend.enums.PaymentStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ManagerOrderResponse(
        Long id,
        String orderNumber,
        String clientFullName,
        BigDecimal totalAmount,
        OrderStatus status,
        PaymentStatus paymentStatus,
        LocalDateTime createdAt
) {
}
