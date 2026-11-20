package com.sonacos.backend.service;

import com.sonacos.backend.dto.manager.ManagerCreateStockMovementRequest;
import com.sonacos.backend.dto.manager.ManagerOrderResponse;
import com.sonacos.backend.dto.manager.ManagerUpdateOrderStatusRequest;
import com.sonacos.backend.dto.manager.ManagerUpdatePaymentStatusRequest;
import com.sonacos.backend.dto.manager.PaymentRecordResponse;
import com.sonacos.backend.dto.manager.StockMovementResponse;
import java.util.List;

public interface ManagerService {
    List<ManagerOrderResponse> getOrders();
    List<PaymentRecordResponse> getPayments();
    List<StockMovementResponse> getStockMovements();
    ManagerOrderResponse updateOrderStatus(Long orderId, ManagerUpdateOrderStatusRequest request);
    PaymentRecordResponse updatePaymentStatus(Long paymentId, ManagerUpdatePaymentStatusRequest request);
    StockMovementResponse createStockMovement(ManagerCreateStockMovementRequest request);
}
