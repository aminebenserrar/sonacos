package com.sonacos.backend.dto.order;

import com.sonacos.backend.enums.OrderStatus;
import com.sonacos.backend.enums.PaymentMode;
import com.sonacos.backend.enums.PaymentStatus;
import com.sonacos.backend.enums.ReceptionMode;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderResponse(
        Long id,
        String orderNumber,
        BigDecimal totalAmount,
        OrderStatus status,
        ReceptionMode receptionMode,
        String deliveryAddress,
        PaymentMode paymentMode,
        PaymentStatus paymentStatus,
        String comment,
        LocalDateTime createdAt,
        List<OrderItemResponse> items,
        Long invoiceId,
        String invoiceNumber,
        String invoicePdfPath
) {
}
