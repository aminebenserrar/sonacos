package com.sonacos.backend.dto.manager;

import com.sonacos.backend.enums.PaymentMode;
import com.sonacos.backend.enums.PaymentStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PaymentRecordResponse(
        Long id,
        String paymentReference,
        String orderNumber,
        String clientFullName,
        BigDecimal amount,
        PaymentMode paymentMode,
        PaymentStatus status,
        LocalDateTime paymentDate
) {
}
