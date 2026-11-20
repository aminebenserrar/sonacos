package com.sonacos.backend.dto.audit;

import java.time.LocalDateTime;

public record AuditLogResponse(
        Long id,
        String actionType,
        String objectType,
        String objectIdentifier,
        String description,
        String performedByFullName,
        String performedByEmail,
        String performedByRole,
        String level,
        LocalDateTime createdAt,
        String oldValue,
        String newValue
) {
}
