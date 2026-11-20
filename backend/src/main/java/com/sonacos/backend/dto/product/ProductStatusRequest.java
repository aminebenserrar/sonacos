package com.sonacos.backend.dto.product;

public record ProductStatusRequest(
        boolean active,
        boolean featured
) {
}
