package com.sonacos.backend.controller;

import com.sonacos.backend.dto.archive.ArchiveDocumentResponse;
import com.sonacos.backend.dto.audit.AuditDashboardResponse;
import com.sonacos.backend.dto.audit.AuditLogResponse;
import com.sonacos.backend.dto.common.PageResponse;
import com.sonacos.backend.dto.manager.ManagerOrderResponse;
import com.sonacos.backend.dto.manager.PaymentRecordResponse;
import com.sonacos.backend.dto.manager.StockMovementResponse;
import com.sonacos.backend.dto.validation.ValidationOperationResponse;
import com.sonacos.backend.service.ArchivisteService;
import com.sonacos.backend.service.AuditLogService;
import com.sonacos.backend.service.ManagerService;
import com.sonacos.backend.service.ValidationService;
import com.sonacos.backend.util.PaginationUtils;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auditeur")
@RequiredArgsConstructor
@PreAuthorize("hasRole('AUDITEUR')")
@Tag(name = "Auditeur")
public class AuditeurController {

    private final AuditLogService auditLogService;
    private final ManagerService managerService;
    private final ValidationService validationService;
    private final ArchivisteService archivisteService;

    @GetMapping("/dashboard")
    public AuditDashboardResponse getDashboard() {
        return auditLogService.getDashboard();
    }

    @GetMapping("/orders")
    public List<ManagerOrderResponse> getOrders() {
        return managerService.getOrders();
    }

    @GetMapping("/payments")
    public List<PaymentRecordResponse> getPayments() {
        return managerService.getPayments();
    }

    @GetMapping("/stock-movements")
    public List<StockMovementResponse> getStockMovements() {
        return managerService.getStockMovements();
    }

    @GetMapping("/invoices")
    public List<ArchiveDocumentResponse> getInvoices() {
        return archivisteService.getDocuments();
    }

    @GetMapping("/validations")
    public List<ValidationOperationResponse> getValidations() {
        return validationService.getOperations();
    }

    @GetMapping("/journal")
    public PageResponse<AuditLogResponse> getJournal(
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
        return auditLogService.getLogs(
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

    @GetMapping("/journal/{activityId}")
    public AuditLogResponse getJournalEntry(@PathVariable Long activityId) {
        return auditLogService.getLogById(activityId);
    }
}
