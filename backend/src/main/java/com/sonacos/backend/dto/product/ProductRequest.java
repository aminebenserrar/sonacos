package com.sonacos.backend.dto.product;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record ProductRequest(
        @NotBlank(message = "Le slug est obligatoire")
        String slug,
        @NotBlank(message = "La reference est obligatoire")
        String reference,
        @NotBlank(message = "Le nom est obligatoire")
        String name,
        @NotBlank(message = "La description courte est obligatoire")
        String shortDescription,
        @NotBlank(message = "La description complete est obligatoire")
        String fullDescription,
        @NotNull(message = "Le prix est obligatoire")
        @DecimalMin(value = "0.01", message = "Le prix doit etre strictement positif")
        BigDecimal price,
        @NotBlank(message = "L unite est obligatoire")
        String unit,
        String imageUrl,
        @NotNull(message = "La quantite en stock est obligatoire")
        @Min(value = 0, message = "La quantite en stock doit etre positive ou nulle")
        Integer stockQuantity,
        @NotNull(message = "Le seuil d alerte est obligatoire")
        @Min(value = 0, message = "Le seuil d alerte doit etre superieur ou egal a zero")
        Integer alertThreshold,
        @NotNull(message = "La categorie est obligatoire")
        Long categoryId,
        boolean active,
        boolean featured
) {
}
