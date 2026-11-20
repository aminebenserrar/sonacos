package com.sonacos.backend.dto.invoice;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record InvoiceResponse(
        Long id,
        String invoiceNumber,
        String orderNumber,
        BigDecimal amountExcludingTax,
        BigDecimal taxAmount,
        BigDecimal totalAmount,
        String pdfPath,
        LocalDateTime generatedAt
) {
}
