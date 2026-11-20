package com.sonacos.backend.dto.manager;

import com.sonacos.backend.enums.StockMovementType;
import java.time.LocalDateTime;

public record StockMovementResponse(
        Long id,
        String productReference,
        String productName,
        StockMovementType movementType,
        Integer quantity,
        Integer stockBefore,
        Integer stockAfter,
        String reason,
        LocalDateTime createdAt
) {
}
