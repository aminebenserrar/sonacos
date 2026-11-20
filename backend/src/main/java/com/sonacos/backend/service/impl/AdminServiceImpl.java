package com.sonacos.backend.service.impl;

import com.sonacos.backend.dto.admin.AdminCreateUserRequest;
import com.sonacos.backend.dto.admin.AdminUpdateUserRequest;
import com.sonacos.backend.dto.admin.AdminUserResponse;
import com.sonacos.backend.dto.admin.AdminUpdateUserRolesRequest;
import com.sonacos.backend.dto.admin.AdminUpdateUserStatusRequest;
import com.sonacos.backend.dto.audit.AuditLogResponse;
import com.sonacos.backend.dto.common.PageResponse;
import com.sonacos.backend.entity.Role;
import com.sonacos.backend.entity.User;
import com.sonacos.backend.exception.BusinessException;
import com.sonacos.backend.exception.ConflictException;
import com.sonacos.backend.exception.ResourceNotFoundException;
import com.sonacos.backend.repository.RoleRepository;
import com.sonacos.backend.repository.UserRepository;
import com.sonacos.backend.service.AdminService;
import com.sonacos.backend.service.AuditLogService;
import com.sonacos.backend.service.CurrentUserService;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    @Override
    public List<String> getRoles() {
        return roleRepository.findAll(Sort.by(Sort.Direction.ASC, "code")).stream()
                .map(role -> role.getCode().name())
                .toList();
    }

    @Override
    public List<AdminUserResponse> getUsers() {
        return userRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public AdminUserResponse createUser(AdminCreateUserRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new ConflictException("Cet email est deja utilise");
        }

        Set<Role> roles = request.roles().stream()
                .map(code -> roleRepository.findByCode(code)
                        .orElseThrow(() -> new ResourceNotFoundException("Role introuvable: " + code.name())))
                .collect(Collectors.toSet());

        User user = User.builder()
                .firstName(request.firstName().trim())
                .lastName(request.lastName().trim())
                .email(normalizedEmail)
                .phone(request.phone().trim())
                .address(request.address().trim())
                .city(request.city().trim())
                .active(Boolean.TRUE.equals(request.active()))
                .password(passwordEncoder.encode(request.password().trim()))
                .roles(roles)
                .build();

        User savedUser = userRepository.save(user);
        String roleSummary = savedUser.getRoles().stream()
                .map(role -> role.getCode().name())
                .sorted()
                .collect(Collectors.joining(", "));
        auditLogService.log(
                "CREATE_USER",
                "USER",
                savedUser.getEmail(),
                "Compte interne cree par l administration",
                null,
                roleSummary
        );
        return toResponse(savedUser);
    }

    @Override
    @Transactional
    public AdminUserResponse updateUser(Long userId, AdminUpdateUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        String oldSummary = user.getEmail() + " | " + user.getCity() + " | " + (user.isActive() ? "ACTIF" : "INACTIF");

        User currentUser = currentUserService.getCurrentUser();
        if (currentUser.getId().equals(user.getId()) && !request.active()) {
            throw new BusinessException("Vous ne pouvez pas desactiver votre propre compte");
        }

        String normalizedEmail = request.email().trim().toLowerCase();
        if (!user.getEmail().equalsIgnoreCase(normalizedEmail)
                && userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new ConflictException("Cet email est deja utilise");
        }

        user.setFirstName(request.firstName().trim());
        user.setLastName(request.lastName().trim());
        user.setEmail(normalizedEmail);
        user.setPhone(request.phone().trim());
        user.setAddress(request.address().trim());
        user.setCity(request.city().trim());
        user.setActive(request.active());

        if (request.password() != null && !request.password().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.password().trim()));
        }

        User savedUser = userRepository.save(user);
        auditLogService.log(
                "UPDATE_USER",
                "USER",
                savedUser.getEmail(),
                "Profil utilisateur modifie par l administration",
                oldSummary,
                savedUser.getEmail() + " | " + savedUser.getCity() + " | " + (savedUser.isActive() ? "ACTIF" : "INACTIF")
        );
        return toResponse(savedUser);
    }

    @Override
    @Transactional
    public AdminUserResponse updateUserStatus(Long userId, AdminUpdateUserStatusRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        String previousStatus = user.isActive() ? "ACTIF" : "INACTIF";

        User currentUser = currentUserService.getCurrentUser();
        if (currentUser.getId().equals(user.getId()) && !request.active()) {
            throw new BusinessException("Vous ne pouvez pas desactiver votre propre compte");
        }

        user.setActive(request.active());
        User savedUser = userRepository.save(user);
        auditLogService.log(
                request.active() ? "ACTIVATE_USER" : "DEACTIVATE_USER",
                "USER",
                savedUser.getEmail(),
                "Statut du compte utilisateur modifie",
                previousStatus,
                savedUser.isActive() ? "ACTIF" : "INACTIF"
        );
        return toResponse(savedUser);
    }

    @Override
    @Transactional
    public AdminUserResponse updateUserRoles(Long userId, AdminUpdateUserRolesRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        String oldRoles = user.getRoles().stream()
                .map(role -> role.getCode().name())
                .sorted()
                .collect(Collectors.joining(", "));

        User currentUser = currentUserService.getCurrentUser();
        if (currentUser.getId().equals(user.getId()) && !request.roles().contains(com.sonacos.backend.enums.RoleCode.ADMIN)) {
            throw new BusinessException("Vous ne pouvez pas retirer votre propre role ADMIN");
        }

        Set<Role> roles = request.roles().stream()
                .map(code -> roleRepository.findByCode(code)
                        .orElseThrow(() -> new ResourceNotFoundException("Role introuvable: " + code.name())))
                .collect(Collectors.toSet());

        user.setRoles(roles);
        User savedUser = userRepository.save(user);
        String newRoles = savedUser.getRoles().stream()
                .map(role -> role.getCode().name())
                .sorted()
                .collect(Collectors.joining(", "));
        auditLogService.log(
                "UPDATE_USER_ROLES",
                "USER",
                savedUser.getEmail(),
                "Roles utilisateur mis a jour par l administration",
                oldRoles,
                newRoles
        );
        return toResponse(savedUser);
    }

    @Override
    public PageResponse<AuditLogResponse> getActivity(
            int page,
            int size,
            String query,
            String user,
            String role,
            String actionType,
            String module,
            String level,
            String date
    ) {
        return auditLogService.getLogs(page, size, query, user, role, actionType, module, level, date);
    }

    @Override
    public AuditLogResponse getActivityById(Long activityId) {
        return auditLogService.getLogById(activityId);
    }

    private AdminUserResponse toResponse(User user) {
        return new AdminUserResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getFirstName() + " " + user.getLastName(),
                user.getEmail(),
                user.getPhone(),
                user.getAddress(),
                user.getCity(),
                user.isActive(),
                user.getRoles().stream()
                        .map(role -> role.getCode().name())
                        .collect(Collectors.toSet()),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
