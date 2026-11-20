package com.sonacos.backend.service.impl;

import com.sonacos.backend.dto.auth.AuthResponse;
import com.sonacos.backend.dto.auth.ChangePasswordRequest;
import com.sonacos.backend.dto.auth.LoginRequest;
import com.sonacos.backend.dto.auth.RegisterRequest;
import com.sonacos.backend.dto.auth.UpdateProfileRequest;
import com.sonacos.backend.dto.auth.UserProfileResponse;
import com.sonacos.backend.entity.Role;
import com.sonacos.backend.entity.User;
import com.sonacos.backend.entity.OperationHistory;
import com.sonacos.backend.enums.RoleCode;
import com.sonacos.backend.exception.BusinessException;
import com.sonacos.backend.exception.ConflictException;
import com.sonacos.backend.mapper.UserMapper;
import com.sonacos.backend.repository.RoleRepository;
import com.sonacos.backend.repository.OperationHistoryRepository;
import com.sonacos.backend.repository.UserRepository;
import com.sonacos.backend.service.AuditLogService;
import com.sonacos.backend.security.JwtService;
import com.sonacos.backend.security.UserPrincipal;
import com.sonacos.backend.service.AuthService;
import java.util.Set;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserMapper userMapper;
    private final AuditLogService auditLogService;
    private final OperationHistoryRepository operationHistoryRepository;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new ConflictException("Cet email est deja utilise");
        }

        Role clientRole = roleRepository.findByCode(RoleCode.CLIENT)
                .orElseThrow(() -> new BusinessException("Le role CLIENT est introuvable"));

        User user = User.builder()
                .firstName(request.firstName().trim())
                .lastName(request.lastName().trim())
                .email(request.email().trim().toLowerCase())
                .phone(request.phone().trim())
                .address(request.address().trim())
                .city(request.city().trim())
                .password(passwordEncoder.encode(request.password()))
                .active(true)
                .roles(Set.of(clientRole))
                .build();

        User savedUser = userRepository.save(user);
        operationHistoryRepository.save(OperationHistory.builder()
                .actionType("CREATE_USER")
                .objectType("USER")
                .objectIdentifier(savedUser.getEmail())
                .description("Compte client cree via inscription")
                .user(savedUser)
                .createdAt(LocalDateTime.now())
                .oldValue(null)
                .newValue("CLIENT")
                .build());
        return buildAuthResponse(savedUser);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                UsernamePasswordAuthenticationToken.unauthenticated(
                        request.email().trim().toLowerCase(),
                        request.password()
                )
        );

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findByEmailIgnoreCase(principal.getEmail())
                .orElseThrow(() -> new BusinessException("Utilisateur introuvable"));

        if (!user.isActive()) {
            throw new BusinessException("Ce compte est desactive");
        }

        return buildAuthResponse(user);
    }

    @Override
    public UserProfileResponse me() {
        return userMapper.toProfile(getCurrentUser());
    }

    @Override
    @Transactional
    public UserProfileResponse updateProfile(UpdateProfileRequest request) {
        User user = getCurrentUser();
        String normalizedEmail = request.email().trim().toLowerCase();
        if (!user.getEmail().equalsIgnoreCase(normalizedEmail)
                && userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new ConflictException("Cet email est deja utilise");
        }

        user.setFirstName(request.firstName().trim());
        user.setLastName(request.lastName().trim());
        user.setPhone(request.phone().trim());
        user.setAddress(request.address().trim());
        user.setCity(request.city().trim());
        user.setEmail(normalizedEmail);
        User savedUser = userRepository.save(user);
        auditLogService.log(
                "UPDATE_PROFILE",
                "USER",
                savedUser.getEmail(),
                "Profil personnel mis a jour"
        );
        return userMapper.toProfile(savedUser);
    }

    @Override
    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        User user = getCurrentUser();
        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new BusinessException("Le mot de passe actuel est incorrect");
        }
        if (passwordEncoder.matches(request.newPassword(), user.getPassword())) {
            throw new BusinessException("Le nouveau mot de passe doit etre different de l ancien");
        }
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
        auditLogService.log(
                "CHANGE_PASSWORD",
                "USER",
                user.getEmail(),
                "Mot de passe utilisateur modifie"
        );
    }

    private AuthResponse buildAuthResponse(User user) {
        return new AuthResponse(
                jwtService.generateToken(user),
                "Bearer",
                86_400_000L,
                userMapper.toProfile(user)
        );
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            throw new BusinessException("Utilisateur non authentifie");
        }
        return userRepository.findById(principal.getId())
                .orElseThrow(() -> new BusinessException("Utilisateur introuvable"));
    }
}
