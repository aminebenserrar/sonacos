package com.sonacos.backend.dto.cart;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record AddCartItemRequest(
        @NotNull(message = "Le produit est obligatoire")
        Long productId,
        @NotNull(message = "La quantite est obligatoire")
        @Min(value = 1, message = "La quantite doit etre au moins egale a 1")
        Integer quantity
) {
}
