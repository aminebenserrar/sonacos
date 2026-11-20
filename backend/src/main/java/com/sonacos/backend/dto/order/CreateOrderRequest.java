package com.sonacos.backend.dto.order;

import com.sonacos.backend.enums.PaymentMode;
import com.sonacos.backend.enums.ReceptionMode;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateOrderRequest(
        @NotNull(message = "Le mode de reception est obligatoire")
        ReceptionMode receptionMode,
        @Size(max = 255, message = "L adresse de livraison est trop longue")
        String deliveryAddress,
        @NotNull(message = "Le mode de paiement est obligatoire")
        PaymentMode paymentMode,
        @Size(max = 1000, message = "Le commentaire est trop long")
        String comment
) {
}
