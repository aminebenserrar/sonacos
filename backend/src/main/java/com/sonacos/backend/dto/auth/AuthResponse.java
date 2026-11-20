package com.sonacos.backend.dto.auth;

public record AuthResponse(
        String accessToken,
        String tokenType,
        long expiresInMs,
        UserProfileResponse user
) {
}
