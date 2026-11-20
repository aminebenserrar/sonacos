package com.sonacos.backend.dto.audit;

import java.util.List;

public record AuditDashboardResponse(
        long operationsToday,
        long sensitiveOperationsToday,
        long anomaliesToday,
        long activeUsersToday,
        List<AuditLogResponse> recentOperations,
        List<AuditModuleCountResponse> moduleBreakdown
) {
}
