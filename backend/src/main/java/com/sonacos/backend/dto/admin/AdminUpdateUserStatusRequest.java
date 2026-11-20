package com.sonacos.backend.dto.admin;

import jakarta.validation.constraints.NotNull;

public record AdminUpdateUserStatusRequest(
        @NotNull(message = "Le statut actif est obligatoire")
        Boolean active
) {
}
