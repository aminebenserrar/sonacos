package com.sonacos.backend.dto.product;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ProductResponse(
        Long id,
        String slug,
        String reference,
        String name,
        String shortDescription,
        String fullDescription,
        BigDecimal price,
        String unit,
        String imageUrl,
        Integer stockQuantity,
        Integer alertThreshold,
        boolean active,
        boolean featured,
        Long categoryId,
        String categoryName,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
