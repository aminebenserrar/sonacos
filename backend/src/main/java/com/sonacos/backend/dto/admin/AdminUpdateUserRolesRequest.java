package com.sonacos.backend.dto.admin;

import com.sonacos.backend.enums.RoleCode;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.Set;

public record AdminUpdateUserRolesRequest(
        @NotEmpty(message = "Au moins un role est obligatoire")
        Set<@NotNull(message = "Le role ne peut pas etre vide") RoleCode> roles
) {
}
