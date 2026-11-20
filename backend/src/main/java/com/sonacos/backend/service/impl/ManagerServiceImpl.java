package com.sonacos.backend.service.impl;

import com.sonacos.backend.dto.manager.ManagerCreateStockMovementRequest;
import com.sonacos.backend.dto.manager.ManagerOrderResponse;
import com.sonacos.backend.dto.manager.ManagerUpdateOrderStatusRequest;
import com.sonacos.backend.dto.manager.ManagerUpdatePaymentStatusRequest;
import com.sonacos.backend.dto.manager.PaymentRecordResponse;
import com.sonacos.backend.dto.manager.StockMovementResponse;
import com.sonacos.backend.entity.CustomerOrder;
import com.sonacos.backend.entity.Payment;
import com.sonacos.backend.entity.Product;
import com.sonacos.backend.entity.StockMovement;
import com.sonacos.backend.entity.User;
import com.sonacos.backend.enums.OrderStatus;
import com.sonacos.backend.enums.PaymentStatus;
import com.sonacos.backend.enums.StockMovementType;
import com.sonacos.backend.exception.BusinessException;
import com.sonacos.backend.exception.ResourceNotFoundException;
import com.sonacos.backend.repository.CustomerOrderRepository;
import com.sonacos.backend.repository.PaymentRepository;
import com.sonacos.backend.repository.ProductRepository;
import com.sonacos.backend.repository.StockMovementRepository;
import com.sonacos.backend.service.AuditLogService;
import com.sonacos.backend.service.CurrentUserService;
import com.sonacos.backend.service.ManagerService;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ManagerServiceImpl implements ManagerService {

    private final CustomerOrderRepository customerOrderRepository;
    private final PaymentRepository paymentRepository;
    private final ProductRepository productRepository;
    private final StockMovementRepository stockMovementRepository;
    private final CurrentUserService currentUserService;
    private final AuditLogService auditLogService;

    @Override
    public List<ManagerOrderResponse> getOrders() {
        return customerOrderRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream()
                .map(this::toOrderResponse)
                .toList();
    }

    @Override
    public List<PaymentRecordResponse> getPayments() {
        return paymentRepository.findAll(Sort.by(Sort.Direction.DESC, "id")).stream()
                .map(this::toPaymentResponse)
                .toList();
    }

    @Override
    public List<StockMovementResponse> getStockMovements() {
        return stockMovementRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream()
                .map(this::toStockMovementResponse)
                .toList();
    }

    @Override
    @Transactional
    public ManagerOrderResponse updateOrderStatus(Long orderId, ManagerUpdateOrderStatusRequest request) {
        CustomerOrder order = customerOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Commande introuvable"));
        String oldStatus = order.getStatus().name();
        validateOrderTransition(order.getStatus(), request.status());
        order.setStatus(request.status());
        CustomerOrder savedOrder = customerOrderRepository.save(order);
        auditLogService.log(
                "UPDATE_ORDER_STATUS",
                "ORDER",
                savedOrder.getOrderNumber(),
                "Statut de commande modifie",
                oldStatus,
                savedOrder.getStatus().name()
        );
        return toOrderResponse(savedOrder);
    }

    @Override
    @Transactional
    public PaymentRecordResponse updatePaymentStatus(Long paymentId, ManagerUpdatePaymentStatusRequest request) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Paiement introuvable"));
        String oldStatus = payment.getStatus().name();
        validatePaymentTransition(payment.getStatus(), request.status());
        payment.setStatus(request.status());
        payment.setValidatedBy(currentUserService.getCurrentUser());
        if (request.status().name().equals("VALIDE") && payment.getPaymentDate() == null) {
            payment.setPaymentDate(LocalDateTime.now());
        }
        Payment savedPayment = paymentRepository.save(payment);
        auditLogService.log(
                "UPDATE_PAYMENT_STATUS",
                "PAYMENT",
                savedPayment.getPaymentReference(),
                "Statut de paiement modifie",
                oldStatus,
                savedPayment.getStatus().name()
        );
        return toPaymentResponse(savedPayment);
    }

    @Override
    @Transactional
    public StockMovementResponse createStockMovement(ManagerCreateStockMovementRequest request) {
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Produit introuvable"));
        User currentUser = currentUserService.getCurrentUser();
        int stockBefore = product.getStockQuantity();
        int stockAfter = computeStockAfter(stockBefore, request.movementType(), request.quantity());
        product.setStockQuantity(stockAfter);

        StockMovement movement = stockMovementRepository.save(StockMovement.builder()
                .product(product)
                .movementType(request.movementType())
                .quantity(request.quantity())
                .stockBefore(stockBefore)
                .stockAfter(stockAfter)
                .reason(request.reason().trim())
                .performedBy(currentUser)
                .createdAt(LocalDateTime.now())
                .build());

        productRepository.save(product);
        auditLogService.log(
                "UPDATE_STOCK",
                "STOCK",
                product.getReference(),
                "Mouvement de stock enregistre: " + request.movementType().name(),
                String.valueOf(stockBefore),
                String.valueOf(stockAfter)
        );
        return toStockMovementResponse(movement);
    }

    private int computeStockAfter(int stockBefore, StockMovementType movementType, int quantity) {
        return switch (movementType) {
            case ENTREE, AJUSTEMENT, ANNULATION_RESERVATION -> stockBefore + quantity;
            case SORTIE, RESERVATION -> {
                if (quantity > stockBefore) {
                    throw new BusinessException("Stock insuffisant pour ce mouvement");
                }
                yield stockBefore - quantity;
            }
        };
    }

    private ManagerOrderResponse toOrderResponse(CustomerOrder order) {
        return new ManagerOrderResponse(
                order.getId(),
                order.getOrderNumber(),
                order.getClient().getFirstName() + " " + order.getClient().getLastName(),
                order.getTotalAmount(),
                order.getStatus(),
                order.getPayment() != null ? order.getPayment().getStatus() : null,
                order.getCreatedAt()
        );
    }

    private PaymentRecordResponse toPaymentResponse(Payment payment) {
        return new PaymentRecordResponse(
                payment.getId(),
                payment.getPaymentReference(),
                payment.getOrder().getOrderNumber(),
                payment.getOrder().getClient().getFirstName() + " " + payment.getOrder().getClient().getLastName(),
                payment.getAmount(),
                payment.getPaymentMode(),
                payment.getStatus(),
                payment.getPaymentDate()
        );
    }

    private StockMovementResponse toStockMovementResponse(StockMovement movement) {
        return new StockMovementResponse(
                movement.getId(),
                movement.getProduct().getReference(),
                movement.getProduct().getName(),
                movement.getMovementType(),
                movement.getQuantity(),
                movement.getStockBefore(),
                movement.getStockAfter(),
                movement.getReason(),
                movement.getCreatedAt()
        );
    }

    private void validateOrderTransition(OrderStatus currentStatus, OrderStatus nextStatus) {
        if (currentStatus == nextStatus) {
            return;
        }

        boolean allowed = switch (currentStatus) {
            case EN_ATTENTE -> nextStatus == OrderStatus.CONFIRMEE
                    || nextStatus == OrderStatus.ANNULEE
                    || nextStatus == OrderStatus.REFUSEE;
            case CONFIRMEE -> nextStatus == OrderStatus.EN_PREPARATION
                    || nextStatus == OrderStatus.ANNULEE
                    || nextStatus == OrderStatus.REFUSEE;
            case EN_PREPARATION -> nextStatus == OrderStatus.PRETE
                    || nextStatus == OrderStatus.ANNULEE
                    || nextStatus == OrderStatus.REFUSEE;
            case PRETE -> nextStatus == OrderStatus.EXPEDIEE
                    || nextStatus == OrderStatus.LIVREE
                    || nextStatus == OrderStatus.ANNULEE
                    || nextStatus == OrderStatus.REFUSEE;
            case EXPEDIEE -> nextStatus == OrderStatus.LIVREE;
            case LIVREE, ANNULEE, REFUSEE -> false;
        };

        if (!allowed) {
            throw new BusinessException("Transition de statut de commande invalide");
        }
    }

    private void validatePaymentTransition(PaymentStatus currentStatus, PaymentStatus nextStatus) {
        if (currentStatus == nextStatus) {
            return;
        }

        boolean allowed = switch (currentStatus) {
            case EN_ATTENTE -> nextStatus == PaymentStatus.VALIDE || nextStatus == PaymentStatus.REFUSE;
            case VALIDE -> nextStatus == PaymentStatus.REMBOURSE;
            case REFUSE, REMBOURSE -> false;
        };

        if (!allowed) {
            throw new BusinessException("Transition de statut de paiement invalide");
        }
    }
}
