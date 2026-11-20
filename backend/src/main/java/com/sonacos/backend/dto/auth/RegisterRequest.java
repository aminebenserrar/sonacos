package com.sonacos.backend.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "Le prenom est obligatoire")
        String firstName,
        @NotBlank(message = "Le nom est obligatoire")
        String lastName,
        @NotBlank(message = "L email est obligatoire")
        @Email(message = "L email doit etre valide")
        String email,
        @NotBlank(message = "Le telephone est obligatoire")
        String phone,
        @NotBlank(message = "L adresse est obligatoire")
        String address,
        @NotBlank(message = "La ville est obligatoire")
        String city,
        @NotBlank(message = "Le mot de passe est obligatoire")
        @Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caracteres")
        String password
) {
}
