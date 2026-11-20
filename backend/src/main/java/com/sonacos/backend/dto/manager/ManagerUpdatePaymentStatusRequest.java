package com.sonacos.backend.dto.manager;

import com.sonacos.backend.enums.PaymentStatus;
import jakarta.validation.constraints.NotNull;

public record ManagerUpdatePaymentStatusRequest(
        @NotNull(message = "Le statut de paiement est obligatoire")
        PaymentStatus status
) {
}
