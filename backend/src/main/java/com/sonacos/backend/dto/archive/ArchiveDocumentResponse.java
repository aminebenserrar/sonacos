package com.sonacos.backend.dto.archive;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ArchiveDocumentResponse(
        Long id,
        String documentType,
        String documentNumber,
        String orderNumber,
        String clientFullName,
        BigDecimal totalAmount,
        String pdfPath,
        LocalDateTime generatedAt,
        boolean archived,
        LocalDateTime archivedAt,
        String archivedByFullName,
        String orderStatus
) {
}
