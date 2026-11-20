package com.sonacos.backend.dto.category;

public record CategoryResponse(
        Long id,
        String name,
        String description,
        boolean active
) {
}
