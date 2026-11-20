package com.sonacos.backend.service;

import com.sonacos.backend.dto.audit.AuditLogResponse;
import com.sonacos.backend.dto.audit.AuditDashboardResponse;
import com.sonacos.backend.dto.common.PageResponse;

public interface AuditLogService {
    void log(String actionType, String objectType, String objectIdentifier, String description);
    void log(
            String actionType,
            String objectType,
            String objectIdentifier,
            String description,
            String oldValue,
            String newValue
    );
    PageResponse<AuditLogResponse> getLogs(
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

    AuditLogResponse getLogById(Long logId);

    AuditDashboardResponse getDashboard();
}
