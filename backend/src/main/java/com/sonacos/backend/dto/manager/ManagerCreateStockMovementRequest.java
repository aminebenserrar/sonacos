package com.sonacos.backend.dto.manager;

import com.sonacos.backend.enums.StockMovementType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ManagerCreateStockMovementRequest(
        @NotNull(message = "Le produit est obligatoire")
        Long productId,
        @NotNull(message = "Le type de mouvement est obligatoire")
        StockMovementType movementType,
        @NotNull(message = "La quantite est obligatoire")
        @Min(value = 1, message = "La quantite doit etre superieure a zero")
        Integer quantity,
        @NotBlank(message = "Le motif est obligatoire")
        String reason
) {
}
