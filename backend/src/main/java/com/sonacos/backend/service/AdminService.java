package com.sonacos.backend.service;

import com.sonacos.backend.dto.admin.AdminCreateUserRequest;
import com.sonacos.backend.dto.admin.AdminUpdateUserRequest;
import com.sonacos.backend.dto.admin.AdminUserResponse;
import com.sonacos.backend.dto.admin.AdminUpdateUserRolesRequest;
import com.sonacos.backend.dto.admin.AdminUpdateUserStatusRequest;
import com.sonacos.backend.dto.audit.AuditLogResponse;
import com.sonacos.backend.dto.common.PageResponse;
import java.util.List;

public interface AdminService {
    List<String> getRoles();
    List<AdminUserResponse> getUsers();
    AdminUserResponse createUser(AdminCreateUserRequest request);
    AdminUserResponse updateUser(Long userId, AdminUpdateUserRequest request);
    AdminUserResponse updateUserStatus(Long userId, AdminUpdateUserStatusRequest request);
    AdminUserResponse updateUserRoles(Long userId, AdminUpdateUserRolesRequest request);
    PageResponse<AuditLogResponse> getActivity(
            int page,
            int size,
            String query,
            String user,
            String role,
            String actionType,
            String module,
            String level,
            String date
    );
    AuditLogResponse getActivityById(Long activityId);
}
