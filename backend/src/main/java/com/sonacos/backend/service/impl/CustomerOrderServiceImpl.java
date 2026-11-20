package com.sonacos.backend.service.impl;

import com.sonacos.backend.dto.archive.ArchiveDocumentFile;
import com.sonacos.backend.dto.invoice.InvoiceResponse;
import com.sonacos.backend.dto.order.CreateOrderRequest;
import com.sonacos.backend.dto.order.OrderResponse;
import com.sonacos.backend.entity.Cart;
import com.sonacos.backend.entity.CartItem;
import com.sonacos.backend.entity.CustomerOrder;
import com.sonacos.backend.entity.Invoice;
import com.sonacos.backend.entity.OrderItem;
import com.sonacos.backend.entity.Payment;
import com.sonacos.backend.entity.Product;
import com.sonacos.backend.entity.StockMovement;
import com.sonacos.backend.entity.User;
import com.sonacos.backend.enums.OrderStatus;
import com.sonacos.backend.enums.PaymentStatus;
import com.sonacos.backend.enums.ReceptionMode;
import com.sonacos.backend.enums.StockMovementType;
import com.sonacos.backend.exception.BusinessException;
import com.sonacos.backend.exception.ResourceNotFoundException;
import com.sonacos.backend.mapper.OrderMapper;
import com.sonacos.backend.repository.CustomerOrderRepository;
import com.sonacos.backend.repository.InvoiceRepository;
import com.sonacos.backend.repository.PaymentRepository;
import com.sonacos.backend.repository.ProductRepository;
import com.sonacos.backend.repository.StockMovementRepository;
import com.sonacos.backend.service.AuditLogService;
import com.sonacos.backend.service.CartService;
import com.sonacos.backend.service.CurrentUserService;
import com.sonacos.backend.service.CustomerOrderService;
import com.sonacos.backend.service.ArchivisteService;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomerOrderServiceImpl implements CustomerOrderService {

    private static final BigDecimal VAT_RATE = new BigDecimal("0.20");

    private final CustomerOrderRepository customerOrderRepository;
    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;
    private final ProductRepository productRepository;
    private final StockMovementRepository stockMovementRepository;
    private final CurrentUserService currentUserService;
    private final CartService cartService;
    private final CartServiceImpl cartServiceImpl;
    private final ArchivisteService archivisteService;
    private final OrderMapper orderMapper;
    private final AuditLogService auditLogService;

    @Override
    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {
        User client = currentUserService.getCurrentUser();
        Cart cart = cartServiceImpl.getOrCreateCart(client);

        if (cart.getItems().isEmpty()) {
            throw new BusinessException("Le panier est vide");
        }

        if (request.receptionMode() == ReceptionMode.LIVRAISON
                && (request.deliveryAddress() == null || request.deliveryAddress().isBlank())) {
            throw new BusinessException("L adresse de livraison est obligatoire pour une livraison");
        }

        validateCartStock(cart);

        BigDecimal totalAmount = cart.getItems().stream()
                .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        CustomerOrder order = CustomerOrder.builder()
                .orderNumber(generateUniqueOrderNumber())
                .client(client)
                .totalAmount(totalAmount)
                .status(OrderStatus.CONFIRMEE)
                .receptionMode(request.receptionMode())
                .deliveryAddress(request.receptionMode() == ReceptionMode.LIVRAISON
                        ? request.deliveryAddress().trim()
                        : client.getAddress())
                .paymentMode(request.paymentMode())
                .comment(request.comment())
                .build();

        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();
            int stockBefore = product.getStockQuantity();
            int updatedStock = product.getStockQuantity() - cartItem.getQuantity();
            product.setStockQuantity(updatedStock);

            order.getItems().add(OrderItem.builder()
                    .order(order)
                    .product(product)
                    .productNameSnapshot(product.getName())
                    .productReferenceSnapshot(product.getReference())
                    .quantity(cartItem.getQuantity())
                    .unitPrice(cartItem.getUnitPrice())
                    .subtotal(cartItem.getUnitPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())))
                    .build());

            stockMovementRepository.save(StockMovement.builder()
                    .product(product)
                    .movementType(StockMovementType.SORTIE)
                    .quantity(cartItem.getQuantity())
                    .stockBefore(stockBefore)
                    .stockAfter(updatedStock)
                    .reason("Sortie automatique suite a la commande " + order.getOrderNumber())
                    .performedBy(client)
                    .createdAt(LocalDateTime.now())
                    .build());
        }

        CustomerOrder savedOrder = customerOrderRepository.save(order);
        productRepository.saveAll(savedOrder.getItems().stream().map(OrderItem::getProduct).toList());

        Payment payment = paymentRepository.save(Payment.builder()
                .paymentReference(generateUniquePaymentReference())
                .order(savedOrder)
                .amount(savedOrder.getTotalAmount())
                .paymentMode(savedOrder.getPaymentMode())
                .status(PaymentStatus.EN_ATTENTE)
                .build());
        savedOrder.setPayment(payment);

        BigDecimal taxAmount = totalAmount.multiply(VAT_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal amountExcludingTax = totalAmount.subtract(taxAmount).setScale(2, RoundingMode.HALF_UP);

        String invoiceNumber = generateUniqueInvoiceNumber();
        Invoice invoice = invoiceRepository.save(Invoice.builder()
                .invoiceNumber(invoiceNumber)
                .order(savedOrder)
                .amountExcludingTax(amountExcludingTax)
                .taxAmount(taxAmount)
                .totalAmount(totalAmount)
                .pdfPath("/documents/factures/" + invoiceNumber + ".pdf")
                .generatedAt(LocalDateTime.now())
                .build());
        savedOrder.setInvoice(invoice);

        cartService.clearCart();
        auditLogService.log(
                "CREATE_ORDER",
                "ORDER",
                savedOrder.getOrderNumber(),
                "Commande client creee avec generation automatique de facture",
                null,
                savedOrder.getStatus().name()
        );
        return orderMapper.toResponse(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getMyOrders() {
        User client = currentUserService.getCurrentUser();
        return customerOrderRepository.findByClientOrderByCreatedAtDesc(client).stream()
                .map(orderMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvoiceResponse> getMyInvoices() {
        User client = currentUserService.getCurrentUser();
        return invoiceRepository.findByOrderClientOrderByGeneratedAtDesc(client).stream()
                .map(orderMapper::toInvoiceResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ArchiveDocumentFile downloadMyInvoice(Long invoiceId) {
        User client = currentUserService.getCurrentUser();
        Invoice invoice = invoiceRepository.findDetailedById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Facture introuvable"));

        if (!invoice.getOrder().getClient().getId().equals(client.getId())) {
            throw new ResourceNotFoundException("Facture introuvable");
        }

        return archivisteService.downloadInvoice(invoiceId);
    }

    private void validateCartStock(Cart cart) {
        for (CartItem item : cart.getItems()) {
            if (item.getQuantity() > item.getProduct().getStockQuantity()) {
                throw new BusinessException("Stock insuffisant pour le produit " + item.getProduct().getName());
            }
        }
    }

    private String generateUniqueOrderNumber() {
        return generateSequentialReference(
                "CMD-" + LocalDate.now().getYear() + "-",
                customerOrderRepository.findAll().stream().map(CustomerOrder::getOrderNumber).toList()
        );
    }

    private String generateUniquePaymentReference() {
        return generateSequentialReference(
                "PAY-" + LocalDate.now().getYear() + "-",
                paymentRepository.findAll().stream().map(Payment::getPaymentReference).toList()
        );
    }

    private String generateUniqueInvoiceNumber() {
        return generateSequentialReference(
                "FAC-" + LocalDate.now().getYear() + "-",
                invoiceRepository.findAll().stream().map(Invoice::getInvoiceNumber).toList()
        );
    }

    private String generateSequentialReference(String prefix, Collection<String> existingReferences) {
        int nextSequence = existingReferences.stream()
                .mapToInt(reference -> extractSequence(reference, prefix))
                .max()
                .orElse(0) + 1;

        String value;
        do {
            value = prefix + String.format("%04d", nextSequence++);
        } while (existingReferences.contains(value)
                || customerOrderRepository.existsByOrderNumber(value)
                || paymentRepository.existsByPaymentReference(value)
                || invoiceRepository.existsByInvoiceNumber(value));

        return value;
    }

    private int extractSequence(String reference, String prefix) {
        if (reference == null || !reference.startsWith(prefix)) {
            return -1;
        }

        String suffix = reference.substring(prefix.length());
        if (!suffix.chars().allMatch(Character::isDigit)) {
            return -1;
        }

        return Integer.parseInt(suffix);
    }
}
