package com.sonacos.backend.controller;

import com.sonacos.backend.dto.manager.ManagerCreateStockMovementRequest;
import com.sonacos.backend.dto.manager.ManagerOrderResponse;
import com.sonacos.backend.dto.manager.ManagerUpdateOrderStatusRequest;
import com.sonacos.backend.dto.manager.ManagerUpdatePaymentStatusRequest;
import com.sonacos.backend.dto.manager.PaymentRecordResponse;
import com.sonacos.backend.dto.manager.StockMovementResponse;
import com.sonacos.backend.service.ManagerService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/manager")
@RequiredArgsConstructor
@PreAuthorize("hasRole('GESTIONNAIRE')")
@Tag(name = "Gestionnaire")
public class ManagerController {

    private final ManagerService managerService;

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

    @PatchMapping("/orders/{orderId}/status")
    public ManagerOrderResponse updateOrderStatus(
            @PathVariable Long orderId,
            @Valid @RequestBody ManagerUpdateOrderStatusRequest request
    ) {
        return managerService.updateOrderStatus(orderId, request);
    }

    @PatchMapping("/payments/{paymentId}/status")
    public PaymentRecordResponse updatePaymentStatus(
            @PathVariable Long paymentId,
            @Valid @RequestBody ManagerUpdatePaymentStatusRequest request
    ) {
        return managerService.updatePaymentStatus(paymentId, request);
    }

    @PostMapping("/stock-movements")
    public StockMovementResponse createStockMovement(@Valid @RequestBody ManagerCreateStockMovementRequest request) {
        return managerService.createStockMovement(request);
    }
}
