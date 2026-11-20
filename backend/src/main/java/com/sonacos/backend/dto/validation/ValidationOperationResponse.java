package com.sonacos.backend.dto.validation;

import com.sonacos.backend.enums.ValidationOperationType;
import com.sonacos.backend.enums.ValidationPriority;
import com.sonacos.backend.enums.ValidationStatus;
import java.time.LocalDateTime;

public record ValidationOperationResponse(
        Long id,
        ValidationOperationType operationType,
        String targetReference,
        String description,
        String requesterFullName,
        String requesterEmail,
        String requesterRole,
        String responsibleFullName,
        ValidationStatus status,
        ValidationPriority priority,
        String rejectionReason,
        LocalDateTime requestedAt,
        LocalDateTime decidedAt
) {
}
