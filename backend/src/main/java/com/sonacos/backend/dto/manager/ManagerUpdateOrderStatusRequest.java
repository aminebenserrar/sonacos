package com.sonacos.backend.dto.manager;

import com.sonacos.backend.enums.OrderStatus;
import jakarta.validation.constraints.NotNull;

public record ManagerUpdateOrderStatusRequest(
        @NotNull(message = "Le statut de commande est obligatoire")
        OrderStatus status
) {
}
