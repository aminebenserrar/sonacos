package com.sonacos.backend.dto.admin;

import com.sonacos.backend.enums.RoleCode;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.Set;

public record AdminCreateUserRequest(
        @NotBlank(message = "Le prenom est obligatoire")
        String firstName,
        @NotBlank(message = "Le nom est obligatoire")
        String lastName,
        @NotBlank(message = "L email est obligatoire")
        @Email(message = "L email est invalide")
        String email,
        @NotBlank(message = "Le telephone est obligatoire")
        String phone,
        @NotBlank(message = "L adresse est obligatoire")
        String address,
        @NotBlank(message = "La ville est obligatoire")
        String city,
        @NotNull(message = "Le statut actif est obligatoire")
        Boolean active,
        @NotBlank(message = "Le mot de passe est obligatoire")
        @Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caracteres")
        String password,
        @NotEmpty(message = "Au moins un role est obligatoire")
        Set<@NotNull(message = "Le role ne peut pas etre vide") RoleCode> roles
) {
}
