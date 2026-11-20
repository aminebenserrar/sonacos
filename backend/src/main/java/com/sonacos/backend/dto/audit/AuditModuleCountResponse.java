package com.sonacos.backend.dto.audit;

public record AuditModuleCountResponse(
        String module,
        long count
) {
}
