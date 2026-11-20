package com.sonacos.backend.dto.admin;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AdminUpdateUserRequest(
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
        boolean active,
        @Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caracteres")
        String password
) {
}
