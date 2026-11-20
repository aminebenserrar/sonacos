package com.sonacos.backend.service;

import com.sonacos.backend.dto.auth.AuthResponse;
import com.sonacos.backend.dto.auth.ChangePasswordRequest;
import com.sonacos.backend.dto.auth.LoginRequest;
import com.sonacos.backend.dto.auth.RegisterRequest;
import com.sonacos.backend.dto.auth.UpdateProfileRequest;
import com.sonacos.backend.dto.auth.UserProfileResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    UserProfileResponse me();
    UserProfileResponse updateProfile(UpdateProfileRequest request);
    void changePassword(ChangePasswordRequest request);
}
