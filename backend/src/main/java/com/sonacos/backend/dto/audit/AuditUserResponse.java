package com.sonacos.backend.dto.audit;

import java.time.LocalDateTime;
import java.util.Set;

public record AuditUserResponse(
        Long id,
        String fullName,
        String email,
        boolean active,
        Set<String> roles,
        LocalDateTime createdAt
) {
}
