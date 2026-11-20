package com.sonacos.backend.dto.validation;

import com.sonacos.backend.enums.ValidationStatus;
import jakarta.validation.constraints.NotNull;

public record ValidationDecisionRequest(
        @NotNull(message = "La decision est obligatoire")
        ValidationStatus status,
        String rejectionReason
) {
}
