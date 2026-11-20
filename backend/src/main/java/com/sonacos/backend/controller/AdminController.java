package com.sonacos.backend.controller;

import com.sonacos.backend.dto.admin.AdminCreateUserRequest;
import com.sonacos.backend.dto.admin.AdminUpdateUserRequest;
import com.sonacos.backend.dto.admin.AdminUserResponse;
import com.sonacos.backend.dto.admin.AdminUpdateUserRolesRequest;
import com.sonacos.backend.dto.admin.AdminUpdateUserStatusRequest;
import com.sonacos.backend.dto.audit.AuditLogResponse;
import com.sonacos.backend.dto.common.PageResponse;
import com.sonacos.backend.service.AdminService;
import com.sonacos.backend.util.PaginationUtils;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Administration")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/roles")
    @PreAuthorize("hasRole('ADMIN')")
    public List<String> getRoles() {
        return adminService.getRoles();
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public List<AdminUserResponse> getUsers() {
        return adminService.getUsers();
    }

    @PostMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public AdminUserResponse createUser(@Valid @RequestBody AdminCreateUserRequest request) {
        return adminService.createUser(request);
    }

    @PatchMapping("/users/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public AdminUserResponse updateUser(
            @PathVariable Long userId,
            @Valid @RequestBody AdminUpdateUserRequest request
    ) {
        return adminService.updateUser(userId, request);
    }

    @PatchMapping("/users/{userId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public AdminUserResponse updateUserStatus(
            @PathVariable Long userId,
            @Valid @RequestBody AdminUpdateUserStatusRequest request
    ) {
        return adminService.updateUserStatus(userId, request);
    }

    @PatchMapping("/users/{userId}/roles")
    @PreAuthorize("hasRole('ADMIN')")
    public AdminUserResponse updateUserRoles(
            @PathVariable Long userId,
            @Valid @RequestBody AdminUpdateUserRolesRequest request
    ) {
        return adminService.updateUserRoles(userId, request);
    }

    @GetMapping("/activity")
    @PreAuthorize("hasRole('ADMIN')")
    public PageResponse<AuditLogResponse> getActivity(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String user,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String actionType,
            @RequestParam(required = false) String module,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String date
    ) {
        return adminService.getActivity(
                PaginationUtils.normalizePage(page),
                PaginationUtils.normalizeSize(size),
                query,
                user,
                role,
                actionType,
                module,
                level,
                date
        );
    }

    @GetMapping("/activity/{activityId}")
    @PreAuthorize("hasRole('ADMIN')")
    public AuditLogResponse getActivityById(@PathVariable Long activityId) {
        return adminService.getActivityById(activityId);
    }
}
