package com.sonacos.backend.dto.admin;

import java.time.LocalDateTime;
import java.util.Set;

public record AdminUserResponse(
        Long id,
        String firstName,
        String lastName,
        String fullName,
        String email,
        String phone,
        String address,
        String city,
        boolean active,
        Set<String> roles,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
