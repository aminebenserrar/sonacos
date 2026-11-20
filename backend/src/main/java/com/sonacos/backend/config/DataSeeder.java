package com.sonacos.backend.config;

import com.sonacos.backend.entity.Cart;
import com.sonacos.backend.entity.CartItem;
import com.sonacos.backend.entity.Category;
import com.sonacos.backend.entity.CustomerOrder;
import com.sonacos.backend.entity.Invoice;
import com.sonacos.backend.entity.OperationHistory;
import com.sonacos.backend.entity.OrderItem;
import com.sonacos.backend.entity.Payment;
import com.sonacos.backend.entity.Product;
import com.sonacos.backend.entity.Role;
import com.sonacos.backend.entity.StockMovement;
import com.sonacos.backend.entity.User;
import com.sonacos.backend.entity.ValidationOperation;
import com.sonacos.backend.enums.OrderStatus;
import com.sonacos.backend.enums.PaymentMode;
import com.sonacos.backend.enums.PaymentStatus;
import com.sonacos.backend.enums.ReceptionMode;
import com.sonacos.backend.enums.RoleCode;
import com.sonacos.backend.enums.StockMovementType;
import com.sonacos.backend.enums.ValidationOperationType;
import com.sonacos.backend.enums.ValidationPriority;
import com.sonacos.backend.enums.ValidationStatus;
import com.sonacos.backend.repository.CartRepository;
import com.sonacos.backend.repository.CategoryRepository;
import com.sonacos.backend.repository.CustomerOrderRepository;
import com.sonacos.backend.repository.InvoiceRepository;
import com.sonacos.backend.repository.OperationHistoryRepository;
import com.sonacos.backend.repository.PaymentRepository;
import com.sonacos.backend.repository.ProductRepository;
import com.sonacos.backend.repository.RoleRepository;
import com.sonacos.backend.repository.StockMovementRepository;
import com.sonacos.backend.repository.UserRepository;
import com.sonacos.backend.repository.ValidationOperationRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class DataSeeder implements ApplicationRunner {

    private static final String INTERNAL_PASSWORD = "Sonacos@2026!";
    private static final String CLIENT_PASSWORD = "Client@2026!";

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final CustomerOrderRepository customerOrderRepository;
    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;
    private final StockMovementRepository stockMovementRepository;
    private final ValidationOperationRepository validationOperationRepository;
    private final OperationHistoryRepository operationHistoryRepository;
    private final CartRepository cartRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        seedRoles();
        seedUsers();
        seedCategories();
        seedProducts();
        normalizeLegacyDemoReferences();
        seedDemoOrdersAndPayments();
        seedCarts();
        seedStockMovements();
        seedValidationOperations();
        seedArchivedDocumentsAndAuditHistory();
    }

    private void seedRoles() {
        Map<RoleCode, String> labels = Map.of(
                RoleCode.ADMIN, "Administrateur",
                RoleCode.GESTIONNAIRE, "Gestionnaire",
                RoleCode.RESPONSABLE, "Responsable",
                RoleCode.ARCHIVISTE, "Archiviste",
                RoleCode.AUDITEUR, "Auditeur",
                RoleCode.CLIENT, "Client"
        );

        for (RoleCode code : labels.keySet()) {
            roleRepository.findByCode(code).orElseGet(() -> roleRepository.save(
                    Role.builder().code(code).label(labels.get(code)).build()
            ));
        }
    }

    private void seedUsers() {
        for (DemoUserDefinition definition : userDefinitions()) {
            createOrUpdateDemoUser(definition);
        }
    }

    private void createOrUpdateDemoUser(DemoUserDefinition definition) {
        Set<Role> roles = definition.roleCodes().stream()
                .map(code -> roleRepository.findByCode(code).orElseThrow())
                .collect(Collectors.toSet());

        User user = userRepository.findByEmailIgnoreCase(definition.email()).orElse(null);

        if (user == null) {
            user = User.builder()
                    .email(definition.email())
                    .password(passwordEncoder.encode(definition.password()))
                    .roles(roles)
                    .build();
            user.setCreatedAt(definition.createdAt());
        }

        user.setFirstName(definition.firstName());
        user.setLastName(definition.lastName());
        user.setPhone(definition.phone());
        user.setAddress(definition.address());
        user.setCity(definition.city());
        user.setPassword(passwordEncoder.encode(definition.password()));
        user.setActive(definition.active());
        user.setRoles(roles);
        user.setUpdatedAt(definition.createdAt().plusHours(2));
        userRepository.save(user);
    }

    private void seedCategories() {
        for (DemoCategoryDefinition definition : categoryDefinitions()) {
            createOrUpdateCategory(definition);
        }
    }

    private void createOrUpdateCategory(DemoCategoryDefinition definition) {
        Category category = categoryRepository.findByNameIgnoreCase(definition.name()).orElse(null);

        if (category == null) {
            category = Category.builder()
                    .name(definition.name())
                    .active(true)
                    .build();
            category.setCreatedAt(definition.createdAt());
        }

        category.setDescription(definition.description());
        category.setActive(true);
        category.setUpdatedAt(definition.createdAt().plusHours(1));
        categoryRepository.save(category);
    }

    private void seedProducts() {
        for (DemoProductDefinition definition : productDefinitions()) {
            createOrUpdateProduct(definition);
        }
    }

    private void createOrUpdateProduct(DemoProductDefinition definition) {
        Product product = productRepository.findByReferenceIgnoreCase(definition.reference()).orElse(null);
        Category category = categoryRepository.findByNameIgnoreCase(definition.categoryName()).orElseThrow();

        if (product == null) {
            product = Product.builder()
                    .reference(definition.reference())
                    .slug(definition.slug())
                    .build();
            product.setCreatedAt(definition.createdAt());
        }

        product.setSlug(definition.slug());
        product.setReference(definition.reference());
        product.setName(definition.name());
        product.setShortDescription(definition.shortDescription());
        product.setFullDescription(definition.fullDescription());
        product.setPrice(definition.price());
        product.setUnit(definition.unit());
        product.setImageUrl(definition.imageUrl());
        product.setStockQuantity(definition.stockQuantity());
        product.setAlertThreshold(definition.alertThreshold());
        product.setActive(definition.active());
        product.setFeatured(definition.featured());
        product.setCategory(category);
        product.setUpdatedAt(definition.createdAt().plusHours(1));
        productRepository.save(product);
    }

    private void seedDemoOrdersAndPayments() {
        Map<String, User> usersByEmail = userRepository.findAll().stream()
                .collect(Collectors.toMap(user -> user.getEmail().toLowerCase(), user -> user, (left, right) -> left, LinkedHashMap::new));
        Map<String, Product> productsByReference = productRepository.findAll().stream()
                .collect(Collectors.toMap(product -> product.getReference().toUpperCase(), product -> product, (left, right) -> left, LinkedHashMap::new));
        Map<String, CustomerOrder> ordersByNumber = customerOrderRepository.findAll().stream()
                .collect(Collectors.toMap(CustomerOrder::getOrderNumber, order -> order, (left, right) -> left, LinkedHashMap::new));
        Map<String, Payment> paymentsByReference = paymentRepository.findAll().stream()
                .collect(Collectors.toMap(Payment::getPaymentReference, payment -> payment, (left, right) -> left, LinkedHashMap::new));
        Map<String, Invoice> invoicesByNumber = invoiceRepository.findAll().stream()
                .collect(Collectors.toMap(Invoice::getInvoiceNumber, invoice -> invoice, (left, right) -> left, LinkedHashMap::new));

        for (DemoOrderDefinition definition : orderDefinitions()) {
            createOrUpdateDemoOrder(
                    definition,
                    usersByEmail,
                    productsByReference,
                    ordersByNumber,
                    paymentsByReference,
                    invoicesByNumber
            );
        }
    }

    private void createOrUpdateDemoOrder(
            DemoOrderDefinition definition,
            Map<String, User> usersByEmail,
            Map<String, Product> productsByReference,
            Map<String, CustomerOrder> ordersByNumber,
            Map<String, Payment> paymentsByReference,
            Map<String, Invoice> invoicesByNumber
    ) {
        CustomerOrder order = ordersByNumber.get(definition.orderNumber());
        boolean isNewOrder = order == null;

        if (order == null) {
            order = CustomerOrder.builder()
                    .orderNumber(definition.orderNumber())
                    .items(new ArrayList<>())
                    .build();
            order.setCreatedAt(definition.createdAt());
        }

        User client = requireUser(usersByEmail, definition.clientEmail());
        order.setClient(client);
        order.setStatus(definition.status());
        order.setReceptionMode(definition.receptionMode());
        order.setDeliveryAddress(definition.deliveryAddress());
        order.setPaymentMode(definition.paymentMode());
        order.setComment(definition.comment());

        if (order.getItems() == null) {
            order.setItems(new ArrayList<>());
        } else {
            order.getItems().clear();
        }

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> items = new ArrayList<>();

        for (DemoOrderItem requestedItem : definition.items()) {
            Product product = requireProduct(productsByReference, requestedItem.reference());
            BigDecimal subtotal = product.getPrice().multiply(BigDecimal.valueOf(requestedItem.quantity()))
                    .setScale(2, RoundingMode.HALF_UP);

            items.add(OrderItem.builder()
                    .order(order)
                    .product(product)
                    .productNameSnapshot(product.getName())
                    .productReferenceSnapshot(product.getReference())
                    .quantity(requestedItem.quantity())
                    .unitPrice(product.getPrice())
                    .subtotal(subtotal)
                    .build());
            totalAmount = totalAmount.add(subtotal);
        }

        order.getItems().clear();
        order.getItems().addAll(items);
        order.setTotalAmount(totalAmount.setScale(2, RoundingMode.HALF_UP));
        order.setUpdatedAt(definition.createdAt().plusHours(1));

        CustomerOrder savedOrder = customerOrderRepository.save(order);
        if (isNewOrder) {
            ordersByNumber.put(savedOrder.getOrderNumber(), savedOrder);
        }

        String paymentReference = siblingReference(definition.orderNumber(), "PAY");
        Payment payment = paymentsByReference.get(paymentReference);
        if (payment == null) {
            payment = Payment.builder()
                    .paymentReference(paymentReference)
                    .order(savedOrder)
                    .build();
        }
        payment.setPaymentReference(paymentReference);
        payment.setOrder(savedOrder);
        payment.setAmount(savedOrder.getTotalAmount());
        payment.setPaymentMode(definition.paymentMode());
        payment.setStatus(definition.paymentStatus());
        payment.setPaymentDate(definition.paymentDate());
        payment.setValidatedBy(definition.validatedByEmail() != null
                ? requireUser(usersByEmail, definition.validatedByEmail())
                : null);
        Payment savedPayment = paymentRepository.save(payment);
        savedOrder.setPayment(savedPayment);
        paymentsByReference.put(savedPayment.getPaymentReference(), savedPayment);

        String invoiceNumber = siblingReference(definition.orderNumber(), "FAC");
        Invoice existingInvoice = invoicesByNumber.get(invoiceNumber);
        if (definition.invoiceGeneratedAt() == null) {
            if (existingInvoice != null) {
                savedOrder.setInvoice(null);
                invoiceRepository.delete(existingInvoice);
                invoicesByNumber.remove(invoiceNumber);
            }
            return;
        }

        BigDecimal taxAmount = savedOrder.getTotalAmount()
                .multiply(new BigDecimal("0.20"))
                .setScale(2, RoundingMode.HALF_UP);
        BigDecimal amountExcludingTax = savedOrder.getTotalAmount()
                .subtract(taxAmount)
                .setScale(2, RoundingMode.HALF_UP);

        Invoice invoice = existingInvoice;
        if (invoice == null) {
            invoice = Invoice.builder()
                    .invoiceNumber(invoiceNumber)
                    .order(savedOrder)
                    .build();
        }

        invoice.setInvoiceNumber(invoiceNumber);
        invoice.setOrder(savedOrder);
        invoice.setAmountExcludingTax(amountExcludingTax);
        invoice.setTaxAmount(taxAmount);
        invoice.setTotalAmount(savedOrder.getTotalAmount());
        invoice.setPdfPath("/documents/factures/" + invoiceNumber + ".pdf");
        invoice.setGeneratedAt(definition.invoiceGeneratedAt());
        invoice.setArchived(false);
        invoice.setArchivedAt(null);
        invoice.setArchivedBy(null);
        Invoice savedInvoice = invoiceRepository.save(invoice);
        savedOrder.setInvoice(savedInvoice);
        invoicesByNumber.put(savedInvoice.getInvoiceNumber(), savedInvoice);
    }

    private void seedCarts() {
        Map<String, User> usersByEmail = userRepository.findAll().stream()
                .collect(Collectors.toMap(user -> user.getEmail().toLowerCase(), user -> user, (left, right) -> left, LinkedHashMap::new));
        Map<String, Product> productsByReference = productRepository.findAll().stream()
                .collect(Collectors.toMap(product -> product.getReference().toUpperCase(), product -> product, (left, right) -> left, LinkedHashMap::new));

        for (DemoCartDefinition definition : cartDefinitions()) {
            User client = requireUser(usersByEmail, definition.clientEmail());
            Cart cart = cartRepository.findByClient(client)
                    .orElseGet(() -> {
                        Cart created = Cart.builder().client(client).items(new ArrayList<>()).build();
                        created.setCreatedAt(definition.createdAt());
                        return created;
                    });

            if (cart.getItems() == null) {
                cart.setItems(new ArrayList<>());
            } else {
                cart.getItems().clear();
            }

            List<CartItem> items = new ArrayList<>();
            for (DemoOrderItem itemDefinition : definition.items()) {
                Product product = requireProduct(productsByReference, itemDefinition.reference());
                items.add(CartItem.builder()
                        .cart(cart)
                        .product(product)
                        .quantity(itemDefinition.quantity())
                        .unitPrice(product.getPrice())
                        .build());
            }

            cart.getItems().clear();
            cart.getItems().addAll(items);
            cart.setUpdatedAt(definition.createdAt().plusHours(1));
            cartRepository.save(cart);
        }
    }

    private void seedStockMovements() {
        List<User> managers = userRepository.findAll().stream()
                .filter(user -> user.getRoles().stream().anyMatch(role -> role.getCode() == RoleCode.GESTIONNAIRE))
                .toList();
        List<Product> products = productRepository.findAll().stream()
                .sorted(java.util.Comparator.comparing(Product::getReference))
                .toList();
        Set<String> existingKeys = stockMovementRepository.findAll().stream()
                .map(this::buildStockMovementKey)
                .collect(Collectors.toSet());

        for (int index = 0; index < products.size(); index++) {
            Product product = products.get(index);
            User actor = managers.get(index % managers.size());

            int entryQuantity = 12 + (index % 5) * 4;
            int stockBeforeEntry = Math.max(4, product.getStockQuantity() - entryQuantity + 10 + (index % 4) * 2);
            int stockAfterEntry = stockBeforeEntry + entryQuantity;

            createStockMovementIfMissing(
                    existingKeys,
                    product,
                    StockMovementType.ENTREE,
                    entryQuantity,
                    stockBeforeEntry,
                    stockAfterEntry,
                    "Reception de lot regional pour " + product.getReference(),
                    actor,
                    at(6 + (index % 3), 11 + index % 15, 9 + index % 5, 20 + index % 30)
            );

            int finalQuantity = product.getStockQuantity();
            int adjustmentQuantity = Math.abs(stockAfterEntry - finalQuantity);
            StockMovementType finalMovementType = index % 4 == 0 ? StockMovementType.AJUSTEMENT : StockMovementType.SORTIE;
            String reason = finalMovementType == StockMovementType.AJUSTEMENT
                    ? "Ajustement d inventaire pour " + product.getReference()
                    : "Sortie liee aux commandes et retraits sur " + product.getReference();

            createStockMovementIfMissing(
                    existingKeys,
                    product,
                    finalMovementType,
                    adjustmentQuantity,
                    stockAfterEntry,
                    finalQuantity,
                    reason,
                    actor,
                    at(8, 7 + index % 3, 10 + index % 7, 10 + index % 40)
            );
        }
    }

    private void createStockMovementIfMissing(
            Set<String> existingKeys,
            Product product,
            StockMovementType movementType,
            int quantity,
            int stockBefore,
            int stockAfter,
            String reason,
            User performedBy,
            LocalDateTime createdAt
    ) {
        String key = buildStockMovementKey(product.getReference(), movementType, quantity, stockBefore, stockAfter, createdAt, reason);
        if (existingKeys.contains(key)) {
            return;
        }

        stockMovementRepository.save(StockMovement.builder()
                .product(product)
                .movementType(movementType)
                .quantity(quantity)
                .stockBefore(stockBefore)
                .stockAfter(stockAfter)
                .reason(reason)
                .performedBy(performedBy)
                .createdAt(createdAt)
                .build());
        existingKeys.add(key);
    }

    private String buildStockMovementKey(StockMovement movement) {
        return buildStockMovementKey(
                movement.getProduct().getReference(),
                movement.getMovementType(),
                movement.getQuantity(),
                movement.getStockBefore(),
                movement.getStockAfter(),
                movement.getCreatedAt(),
                movement.getReason()
        );
    }

    private String buildStockMovementKey(
            String productReference,
            StockMovementType movementType,
            int quantity,
            int stockBefore,
            int stockAfter,
            LocalDateTime createdAt,
            String reason
    ) {
        return String.join("|",
                productReference,
                movementType.name(),
                String.valueOf(quantity),
                String.valueOf(stockBefore),
                String.valueOf(stockAfter),
                createdAt.toString(),
                reason
        );
    }

    private void seedValidationOperations() {
        Map<String, User> usersByEmail = userRepository.findAll().stream()
                .collect(Collectors.toMap(user -> user.getEmail().toLowerCase(), user -> user, (left, right) -> left, LinkedHashMap::new));
        Map<String, ValidationOperation> existingValidations = validationOperationRepository.findAll().stream()
                .collect(Collectors.toMap(ValidationOperation::getTargetReference, validation -> validation, (left, right) -> left, LinkedHashMap::new));

        for (DemoValidationDefinition definition : validationDefinitions()) {
            ValidationOperation operation = existingValidations.get(definition.reference());
            if (operation == null) {
                operation = ValidationOperation.builder()
                        .targetReference(definition.reference())
                        .build();
            }

            operation.setOperationType(definition.operationType());
            operation.setTargetReference(definition.reference());
            operation.setDescription(definition.description());
            operation.setRequester(requireUser(usersByEmail, definition.requesterEmail()));
            operation.setResponsible(requireUser(usersByEmail, definition.responsibleEmail()));
            operation.setStatus(definition.status());
            operation.setPriority(definition.priority());
            operation.setRejectionReason(definition.rejectionReason());
            operation.setRequestedAt(definition.requestedAt());
            operation.setDecidedAt(definition.decidedAt());
            ValidationOperation saved = validationOperationRepository.save(operation);
            existingValidations.put(saved.getTargetReference(), saved);
        }
    }

    private void seedArchivedDocumentsAndAuditHistory() {
        Map<String, User> usersByEmail = userRepository.findAll().stream()
                .collect(Collectors.toMap(user -> user.getEmail().toLowerCase(), user -> user, (left, right) -> left, LinkedHashMap::new));

        for (DemoArchiveDefinition definition : archiveDefinitions()) {
            invoiceRepository.findByInvoiceNumber(definition.invoiceNumber()).ifPresent(invoice -> {
                invoice.setArchived(true);
                invoice.setArchivedAt(definition.archivedAt());
                invoice.setArchivedBy(requireUser(usersByEmail, definition.archivedByEmail()));
                invoiceRepository.save(invoice);
            });
        }

        List<DemoHistoryDefinition> historyDefinitions = buildAuditHistory();
        Set<String> existingHistoryKeys = operationHistoryRepository.findAll().stream()
                .map(this::buildHistoryKey)
                .collect(Collectors.toSet());

        for (DemoHistoryDefinition definition : historyDefinitions) {
            createHistoryIfMissing(existingHistoryKeys, usersByEmail, definition);
        }
    }

    private void createHistoryIfMissing(
            Set<String> existingHistoryKeys,
            Map<String, User> usersByEmail,
            DemoHistoryDefinition definition
    ) {
        String key = buildHistoryKey(definition.actionType(), definition.objectType(), definition.objectIdentifier(), definition.description(), definition.createdAt());
        if (existingHistoryKeys.contains(key)) {
            return;
        }

        operationHistoryRepository.save(OperationHistory.builder()
                .actionType(definition.actionType())
                .objectType(definition.objectType())
                .objectIdentifier(definition.objectIdentifier())
                .description(definition.description())
                .user(definition.userEmail() != null ? requireUser(usersByEmail, definition.userEmail()) : null)
                .createdAt(definition.createdAt())
                .oldValue(definition.oldValue())
                .newValue(definition.newValue())
                .build());
        existingHistoryKeys.add(key);
    }

    private String buildHistoryKey(OperationHistory history) {
        return buildHistoryKey(
                history.getActionType(),
                history.getObjectType(),
                history.getObjectIdentifier(),
                history.getDescription(),
                history.getCreatedAt()
        );
    }

    private String buildHistoryKey(
            String actionType,
            String objectType,
            String objectIdentifier,
            String description,
            LocalDateTime createdAt
    ) {
        return String.join("|", actionType, objectType, objectIdentifier, createdAt.toString(), description);
    }

    private void normalizeLegacyDemoReferences() {
        List<CustomerOrder> orders = customerOrderRepository.findAll();
        List<Payment> payments = paymentRepository.findAll();
        List<Invoice> invoices = invoiceRepository.findAll();
        List<Product> products = productRepository.findAll();
        List<ValidationOperation> validations = validationOperationRepository.findAll();
        List<OperationHistory> historyEntries = operationHistoryRepository.findAll();

        Set<String> orderNumbers = orders.stream()
                .map(CustomerOrder::getOrderNumber)
                .collect(Collectors.toSet());
        Set<String> paymentReferences = payments.stream()
                .map(Payment::getPaymentReference)
                .collect(Collectors.toSet());
        Set<String> invoiceNumbers = invoices.stream()
                .map(Invoice::getInvoiceNumber)
                .collect(Collectors.toSet());
        Set<String> validationReferences = validations.stream()
                .map(ValidationOperation::getTargetReference)
                .collect(Collectors.toSet());
        Set<String> productReferences = products.stream()
                .map(Product::getReference)
                .collect(Collectors.toSet());
        Map<String, String> normalizedOrderReferences = new LinkedHashMap<>();
        Map<String, String> normalizedPaymentReferences = new LinkedHashMap<>();
        Map<String, String> normalizedInvoiceNumbers = new LinkedHashMap<>();
        Map<String, String> normalizedProductReferences = new LinkedHashMap<>();
        Map<String, String> normalizedProductNames = new LinkedHashMap<>();
        int nextOrderSequence = nextSequence(orderNumbers, "CMD-2026-");
        int nextPaymentSequence = nextSequence(paymentReferences, "PAY-2026-");
        int nextInvoiceSequence = nextSequence(invoiceNumbers, "FAC-2026-");

        for (CustomerOrder order : orders) {
            String normalized = normalizeSeriesReference(order.getOrderNumber(), "CMD-2026-", orderNumbers, nextOrderSequence);
            if (!order.getOrderNumber().equals(normalized)) {
                orderNumbers.remove(order.getOrderNumber());
                normalizedOrderReferences.put(order.getOrderNumber(), normalized);
                order.setOrderNumber(normalized);
                orderNumbers.add(normalized);
                nextOrderSequence = nextSequence(orderNumbers, "CMD-2026-");
            }
        }

        for (Payment payment : payments) {
            String normalized = normalizeSeriesReference(payment.getPaymentReference(), "PAY-2026-", paymentReferences, nextPaymentSequence);
            if (!payment.getPaymentReference().equals(normalized)) {
                paymentReferences.remove(payment.getPaymentReference());
                normalizedPaymentReferences.put(payment.getPaymentReference(), normalized);
                payment.setPaymentReference(normalized);
                paymentReferences.add(normalized);
                nextPaymentSequence = nextSequence(paymentReferences, "PAY-2026-");
            }
        }

        for (Invoice invoice : invoices) {
            String normalized = normalizeSeriesReference(invoice.getInvoiceNumber(), "FAC-2026-", invoiceNumbers, nextInvoiceSequence);
            if (!invoice.getInvoiceNumber().equals(normalized)) {
                invoiceNumbers.remove(invoice.getInvoiceNumber());
                normalizedInvoiceNumbers.put(invoice.getInvoiceNumber(), normalized);
                invoice.setInvoiceNumber(normalized);
                invoiceNumbers.add(normalized);
                nextInvoiceSequence = nextSequence(invoiceNumbers, "FAC-2026-");
            }

            String expectedPdfPath = "/documents/factures/" + invoice.getInvoiceNumber() + ".pdf";
            if (!expectedPdfPath.equals(invoice.getPdfPath())) {
                invoice.setPdfPath(expectedPdfPath);
            }
        }

        for (Product product : products) {
            String currentReference = product.getReference();
            if (currentReference == null) {
                continue;
            }

            if (currentReference.startsWith("TEST-UP-")) {
                String suffix = currentReference.substring("TEST-UP-".length());
                String normalizedReference = normalizeUniqueProductReference(
                        "ARC-PRD-" + suffix,
                        currentReference,
                        productReferences
                );
                if (!currentReference.equals(normalizedReference)) {
                    productReferences.remove(currentReference);
                    normalizedProductReferences.put(currentReference, normalizedReference);
                    product.setReference(normalizedReference);
                    productReferences.add(normalizedReference);
                }
                product.setSlug("reference-archivee-" + suffix.toLowerCase());
                product.setName("Reference archivee " + suffix);
                product.setShortDescription("Reference technique conservee hors catalogue public.");
                product.setFullDescription("Ancienne reference de demonstration conservee pour la tracabilite interne.");
                product.setActive(false);
                product.setFeatured(false);
            }

            if (currentReference.startsWith("TEST-SEM-")) {
                String normalizedReference = normalizeUniqueProductReference(
                        "BT-RHB-099",
                        currentReference,
                        productReferences
                );
                if (!currentReference.equals(normalizedReference)) {
                    productReferences.remove(currentReference);
                    normalizedProductReferences.put(currentReference, normalizedReference);
                    product.setReference(normalizedReference);
                    productReferences.add(normalizedReference);
                }
                normalizedProductNames.put(currentReference, "Ble tendre Rihab");
                product.setSlug("ble-tendre-rihab");
                product.setName("Ble tendre Rihab");
                product.setShortDescription("Variete de ble tendre adaptee aux campagnes cerealieres marocaines.");
                product.setFullDescription("Semence de ble tendre destinee aux exploitations a la recherche d une levee reguliere et d un rendement stable.");
                product.setFeatured(false);
            }
        }

        for (CustomerOrder order : orders) {
            if (order.getItems() == null) {
                continue;
            }
            for (OrderItem item : order.getItems()) {
                String referenceSnapshot = item.getProductReferenceSnapshot();
                if (referenceSnapshot != null && normalizedProductReferences.containsKey(referenceSnapshot)) {
                    item.setProductReferenceSnapshot(normalizedProductReferences.get(referenceSnapshot));
                }
                if (referenceSnapshot != null && normalizedProductNames.containsKey(referenceSnapshot)) {
                    item.setProductNameSnapshot(normalizedProductNames.get(referenceSnapshot));
                }
            }
        }

        for (ValidationOperation validation : validations) {
            String normalized = replaceReference(
                    validation.getTargetReference(),
                    normalizedOrderReferences,
                    normalizedPaymentReferences,
                    normalizedInvoiceNumbers,
                    normalizedProductReferences
            );
            if (!validation.getTargetReference().equals(normalized) && !validationReferences.contains(normalized)) {
                validationReferences.remove(validation.getTargetReference());
                validation.setTargetReference(normalized);
                validationReferences.add(normalized);
            }
        }

        for (OperationHistory history : historyEntries) {
            String normalized = replaceReference(
                    history.getObjectIdentifier(),
                    normalizedOrderReferences,
                    normalizedPaymentReferences,
                    normalizedInvoiceNumbers,
                    normalizedProductReferences
            );
            if (!history.getObjectIdentifier().equals(normalized)) {
                history.setObjectIdentifier(normalized);
            }
        }
    }

    private int nextSequence(Set<String> references, String prefix) {
        return references.stream()
                .map(reference -> reference.replace("-DEMO-", "-"))
                .filter(reference -> reference.startsWith(prefix))
                .map(reference -> reference.substring(prefix.length()))
                .filter(suffix -> suffix.chars().allMatch(Character::isDigit))
                .mapToInt(Integer::parseInt)
                .max()
                .orElse(0) + 1;
    }

    private String normalizeSeriesReference(
            String currentValue,
            String prefix,
            Set<String> existingValues,
            int nextSequence
    ) {
        String candidate = currentValue.replace("-DEMO-", "-");
        if (candidate.matches("^" + java.util.regex.Pattern.quote(prefix) + "\\d{4}$")
                && (candidate.equals(currentValue) || !existingValues.contains(candidate))) {
            return candidate;
        }

        String normalized;
        int sequence = nextSequence;
        do {
            normalized = prefix + String.format("%04d", sequence++);
        } while (existingValues.contains(normalized));

        return normalized;
    }

    private String normalizeUniqueProductReference(
            String desiredReference,
            String currentReference,
            Set<String> existingReferences
    ) {
        if (desiredReference.equalsIgnoreCase(currentReference) || !existingReferences.contains(desiredReference)) {
            return desiredReference;
        }

        String normalized = desiredReference;
        int suffix = 2;
        while (existingReferences.contains(normalized)) {
            normalized = desiredReference + "-" + suffix++;
        }
        return normalized;
    }

    private String replaceReference(
            String currentValue,
            Map<String, String> orderReferences,
            Map<String, String> paymentReferences,
            Map<String, String> invoiceNumbers,
            Map<String, String> productReferences
    ) {
        if (currentValue == null) {
            return null;
        }

        if (orderReferences.containsKey(currentValue)) {
            return orderReferences.get(currentValue);
        }
        if (paymentReferences.containsKey(currentValue)) {
            return paymentReferences.get(currentValue);
        }
        if (invoiceNumbers.containsKey(currentValue)) {
            return invoiceNumbers.get(currentValue);
        }
        if (productReferences.containsKey(currentValue)) {
            return productReferences.get(currentValue);
        }

        return currentValue.replace("-DEMO-", "-");
    }

    private User requireUser(Map<String, User> usersByEmail, String email) {
        User user = usersByEmail.get(email.toLowerCase());
        if (user == null) {
            throw new IllegalStateException("Utilisateur seed introuvable: " + email);
        }
        return user;
    }

    private Product requireProduct(Map<String, Product> productsByReference, String reference) {
        Product product = productsByReference.get(reference.toUpperCase());
        if (product == null) {
            throw new IllegalStateException("Produit seed introuvable: " + reference);
        }
        return product;
    }

    private String siblingReference(String orderNumber, String prefix) {
        return prefix + orderNumber.substring(3);
    }

    private LocalDateTime at(int month, int day, int hour, int minute) {
        return LocalDateTime.of(2026, month, day, hour, minute);
    }

    private List<DemoUserDefinition> userDefinitions() {
        return List.of(
                new DemoUserDefinition("admin@sonacos.ma", "Admin", "SONACOS", "0522000001", "Siege SONACOS, boulevard Zerktouni", "Casablanca", INTERNAL_PASSWORD, Set.of(RoleCode.ADMIN), true, at(6, 3, 9, 0)),
                new DemoUserDefinition("nabil.ouazzani@sonacos.ma", "Nabil", "Ouazzani", "0522000002", "Direction regionale, avenue Hassan II", "Rabat", INTERNAL_PASSWORD, Set.of(RoleCode.ADMIN), true, at(6, 12, 10, 0)),
                new DemoUserDefinition("gestionnaire@sonacos.ma", "Youssef", "Alaoui", "0535621755", "Centre regional SONACOS, route de Sefrou", "Fes", INTERNAL_PASSWORD, Set.of(RoleCode.GESTIONNAIRE), true, at(6, 5, 9, 15)),
                new DemoUserDefinition("hamza.el.fassi@sonacos.ma", "Hamza", "El Fassi", "0523346158", "Plateforme logistique, quartier industriel", "Kenitra", INTERNAL_PASSWORD, Set.of(RoleCode.GESTIONNAIRE), true, at(6, 20, 9, 45)),
                new DemoUserDefinition("imane.berrada@sonacos.ma", "Imane", "Berrada", "0523402885", "Antenne commerciale, avenue Mohammed V", "Meknes", INTERNAL_PASSWORD, Set.of(RoleCode.GESTIONNAIRE), true, at(7, 2, 8, 50)),
                new DemoUserDefinition("responsable@sonacos.ma", "Nadia", "Idrissi", "0528536142", "Siege SONACOS, service validation", "Rabat", INTERNAL_PASSWORD, Set.of(RoleCode.RESPONSABLE), true, at(6, 8, 11, 5)),
                new DemoUserDefinition("mehdi.tazi@sonacos.ma", "Mehdi", "Tazi", "0537593517", "Polo de supervision, avenue Abdelkrim", "Casablanca", INTERNAL_PASSWORD, Set.of(RoleCode.RESPONSABLE), true, at(7, 4, 10, 25)),
                new DemoUserDefinition("archiviste@sonacos.ma", "Sara", "Bennani", "0522258577", "Centre documentaire SONACOS, quartier Oasis", "Casablanca", INTERNAL_PASSWORD, Set.of(RoleCode.ARCHIVISTE), true, at(6, 15, 9, 20)),
                new DemoUserDefinition("salma.amrani@sonacos.ma", "Salma", "Amrani", "0528536152", "Archive regionale, boulevard de la gare", "Marrakech", INTERNAL_PASSWORD, Set.of(RoleCode.ARCHIVISTE), true, at(7, 6, 9, 40)),
                new DemoUserDefinition("auditeur@sonacos.ma", "Karim", "Mansouri", "0523435072", "Inspection interne SONACOS, quartier administratif", "Rabat", INTERNAL_PASSWORD, Set.of(RoleCode.AUDITEUR), true, at(6, 18, 9, 30)),
                new DemoUserDefinition("omar.chraibi@sonacos.ma", "Omar", "Chraibi", "0537672595", "Cellule audit, avenue des FAR", "Casablanca", INTERNAL_PASSWORD, Set.of(RoleCode.AUDITEUR), true, at(7, 8, 9, 10)),
                new DemoUserDefinition("client@sonacos.ma", "Amine", "El Idrissi", "0661902249", "Rue des Jasmins, Maarif", "Casablanca", CLIENT_PASSWORD, Set.of(RoleCode.CLIENT), true, at(6, 21, 12, 10)),
                new DemoUserDefinition("fatima.bennani@client.ma", "Fatima", "Bennani", "0673957903", "Lotissement Al Qods", "Meknes", CLIENT_PASSWORD, Set.of(RoleCode.CLIENT), true, at(6, 23, 11, 15)),
                new DemoUserDefinition("omar.alaoui@client.ma", "Omar", "Alaoui", "0678730289", "Hay Salam, route de Marrakech", "Settat", CLIENT_PASSWORD, Set.of(RoleCode.CLIENT), true, at(6, 24, 12, 0)),
                new DemoUserDefinition("salma.rafik@client.ma", "Salma", "Rafik", "0670942387", "Quartier Tilila", "Agadir", CLIENT_PASSWORD, Set.of(RoleCode.CLIENT), true, at(6, 27, 14, 20)),
                new DemoUserDefinition("yassine.tazi@client.ma", "Yassine", "Tazi", "0656690316", "Sidi Maarouf", "Casablanca", CLIENT_PASSWORD, Set.of(RoleCode.CLIENT), false, at(6, 29, 10, 45)),
                new DemoUserDefinition("khadija.ouahbi@client.ma", "Khadija", "Ouahbi", "0678709423", "Route de Safi, Targa", "Marrakech", CLIENT_PASSWORD, Set.of(RoleCode.CLIENT), true, at(7, 1, 9, 50)),
                new DemoUserDefinition("mohamed.alaoui@client.ma", "Mohamed", "Alaoui", "0678954401", "Avenue Mohammed VI, quartier Hay Riad", "Rabat", CLIENT_PASSWORD, Set.of(RoleCode.CLIENT), true, at(7, 3, 13, 5)),
                new DemoUserDefinition("aya.benjelloun@client.ma", "Aya", "Benjelloun", "0672113344", "Residence Al Boustane", "Kenitra", CLIENT_PASSWORD, Set.of(RoleCode.CLIENT), true, at(7, 5, 10, 25)),
                new DemoUserDefinition("sara.elalami@client.ma", "Sara", "El Alami", "0673456789", "Quartier Najd", "Beni Mellal", CLIENT_PASSWORD, Set.of(RoleCode.CLIENT), true, at(7, 9, 11, 10)),
                new DemoUserDefinition("mehdi.cherkaoui@client.ma", "Mehdi", "Cherkaoui", "0667349821", "Hay Mohammadi", "Casablanca", CLIENT_PASSWORD, Set.of(RoleCode.CLIENT), false, at(7, 12, 9, 15)),
                new DemoUserDefinition("imane.filali@client.ma", "Imane", "Filali", "0662783411", "Quartier Anza", "Agadir", CLIENT_PASSWORD, Set.of(RoleCode.CLIENT), true, at(7, 18, 15, 0))
        );
    }

    private List<DemoCategoryDefinition> categoryDefinitions() {
        return List.of(
                new DemoCategoryDefinition("Semences cereales", "Ble tendre, ble dur, orge et mais pour les grandes cultures.", at(6, 1, 8, 0)),
                new DemoCategoryDefinition("Semences fourrageres", "Luzerne, trefle et autres fourrages pour l elevage.", at(6, 1, 8, 5)),
                new DemoCategoryDefinition("Semences oleagineuses", "Tournesol et colza pour les rotations de culture.", at(6, 1, 8, 10)),
                new DemoCategoryDefinition("Semences legumineuses", "Pois chiche, feve, lentille et feverole.", at(6, 1, 8, 15)),
                new DemoCategoryDefinition("Pomme de terre", "Semences certifiees pour la pomme de terre.", at(6, 1, 8, 20)),
                new DemoCategoryDefinition("Betterave a sucre", "Semences destinees a la betterave a sucre.", at(6, 1, 8, 25)),
                new DemoCategoryDefinition("Engrais de fond", "Engrais utilises lors de la preparation du sol.", at(6, 1, 8, 30)),
                new DemoCategoryDefinition("Engrais de couverture", "Engrais pour le suivi et la croissance vegetative.", at(6, 1, 8, 35)),
                new DemoCategoryDefinition("Traitements", "Produits de traitement et protection des semences.", at(6, 1, 8, 40))
        );
    }

    private List<DemoProductDefinition> productDefinitions() {
        return List.of(
                new DemoProductDefinition("ble-tendre-anza", "BT-ANZ-001", "Ble tendre Anza", "Semence de ble tendre certifiee pour campagnes cerealiere.", "Variete de ble tendre adaptee aux zones de production du Gharb et du Saiss.", new BigDecimal("295.00"), "Sac 100 kg", "/internet-products/wheat-field.jpg", 52, 20, true, true, "Semences cereales", at(6, 2, 9, 0)),
                new DemoProductDefinition("ble-tendre-amal", "BT-AML-002", "Ble tendre Amal", "Reference de ble tendre pour rendement regulier.", "Semence cerealiere destinee aux exploitations recherchant regularite et bon rendement.", new BigDecimal("305.00"), "Sac 100 kg", "/internet-products/wheat-field.jpg", 85, 20, true, true, "Semences cereales", at(6, 2, 9, 10)),
                new DemoProductDefinition("ble-dur-karim", "BD-KRM-014", "Ble dur Karim", "Ble dur selectionne pour le marche national.", "Variete de ble dur orientee vers les besoins de transformation et de stockage regional.", new BigDecimal("325.00"), "Sac 100 kg", "/internet-products/wheat-field.jpg", 34, 15, true, false, "Semences cereales", at(6, 2, 9, 20)),
                new DemoProductDefinition("ble-dur-marzak", "BD-MRZ-018", "Ble dur Marzak", "Ble dur pour exploitation cerealiere structuree.", "Reference de ble dur adaptee aux surfaces cerealieres et a la conduite semi intensive.", new BigDecimal("335.00"), "Sac 100 kg", "/internet-products/wheat-field.jpg", 18, 15, true, false, "Semences cereales", at(6, 2, 9, 30)),
                new DemoProductDefinition("orge-amira", "OR-AMR-021", "Orge Amira", "Orge certifiee pour conduite de campagne.", "Semence d orge pour les parcelles orientee alimentation animale et rendement stable.", new BigDecimal("255.00"), "Sac 100 kg", "/internet-products/barley-field.jpg", 15, 10, true, true, "Semences cereales", at(6, 2, 9, 40)),
                new DemoProductDefinition("orge-massine", "OR-MSN-022", "Orge Massine", "Orge de campagne avec stock limite.", "Reference cerealiere encore disponible mais proche d une rupture operationnelle.", new BigDecimal("265.00"), "Sac 100 kg", "/internet-products/barley-field.jpg", 6, 10, true, false, "Semences cereales", at(6, 2, 9, 50)),
                new DemoProductDefinition("mais-hybride-atlas", "MA-ATL-031", "Mais hybride Atlas", "Mais hybride pour zones irriguees.", "Semence hybride adaptee aux zones irriguees et aux besoins de production de fourrage.", new BigDecimal("465.50"), "Unite de semence", "/internet-products/wheat-field.jpg", 26, 12, true, true, "Semences cereales", at(6, 2, 10, 0)),
                new DemoProductDefinition("luzerne-atlas", "FR-LUZ-041", "Luzerne Atlas", "Semence fourragere a bonne couverture.", "Luzerne pour implantation fourragere durable et coupe reguliere.", new BigDecimal("340.00"), "Sac 25 kg", "/internet-products/field-beans.jpg", 41, 12, true, false, "Semences fourrageres", at(6, 2, 10, 10)),
                new DemoProductDefinition("trefle-berkan", "FR-TRF-042", "Trefle Berkan", "Trefle fourrager pour rotation et couverture.", "Semence fourragere adaptee a l alimentation animale et a l amelioration des sols.", new BigDecimal("315.00"), "Sac 25 kg", "/internet-products/field-beans.jpg", 28, 10, true, false, "Semences fourrageres", at(6, 2, 10, 20)),
                new DemoProductDefinition("tournesol-chams", "OL-CHM-051", "Tournesol Chams", "Semence oleagineuse pour rotation estivale.", "Tournesol regulier adapte aux exploitations recherchant une rotation diversifiee.", new BigDecimal("420.00"), "Sac 15 kg", "/internet-products/wheat-field.jpg", 17, 10, true, true, "Semences oleagineuses", at(6, 2, 10, 30)),
                new DemoProductDefinition("colza-noura", "OL-NRA-052", "Colza Noura", "Colza a implantation precoce.", "Reference oleagineuse pour parcelles bien preparees et campagnes organisees.", new BigDecimal("445.00"), "Sac 15 kg", "/internet-products/wheat-field.jpg", 11, 10, true, false, "Semences oleagineuses", at(6, 2, 10, 40)),
                new DemoProductDefinition("feve-selection", "LEG-FEV-034", "Feve Saiss", "Feve selectionnee pour legumes secs.", "Semence de feve destinee aux rotations et a la vente de legumes secs.", new BigDecimal("410.00"), "Sac 100 kg", "/internet-products/field-beans.jpg", 13, 8, true, false, "Semences legumineuses", at(6, 2, 10, 50)),
                new DemoProductDefinition("pois-chiche-zahra", "LEG-PCZ-035", "Pois chiche Zahra", "Pois chiche de campagne pour zones seches.", "Reference de pois chiche pour exploitations recherchant une culture legumineuse maitrisee.", new BigDecimal("430.00"), "Sac 100 kg", "/internet-products/field-beans.jpg", 22, 8, true, true, "Semences legumineuses", at(6, 2, 11, 0)),
                new DemoProductDefinition("lentille-tafilalet", "LEG-LNT-036", "Lentille Tafilalet", "Lentille selectionnee pour semis d automne.", "Semence legumineuse a stock faible utilisee pour tests de filtres et alertes.", new BigDecimal("390.00"), "Sac 50 kg", "/internet-products/field-beans.jpg", 9, 8, true, false, "Semences legumineuses", at(6, 2, 11, 10)),
                new DemoProductDefinition("feverole-select", "LEG-FRL-040", "Feverole Select", "Feverole pour rotation et amelioration du sol.", "Produit destine aux rotations longues et a la structuration du calendrier cultural.", new BigDecimal("420.00"), "Sac 100 kg", "/internet-products/field-beans.jpg", 16, 8, true, false, "Semences legumineuses", at(6, 2, 11, 20)),
                new DemoProductDefinition("pomme-de-terre-certifiee", "PDT-CER-052", "Pomme de terre Desiree", "Pomme de terre certifiee pour plantation.", "Reference certifiee orientee vers la plantation de campagne et la vente locale.", new BigDecimal("185.00"), "Sac 25 kg", "/internet-products/potato-field.jpg", 31, 10, true, true, "Pomme de terre", at(6, 2, 11, 30)),
                new DemoProductDefinition("pomme-de-terre-spunta", "PDT-SPN-053", "Pomme de terre Spunta", "Semence de pomme de terre a stock controle.", "Reference de pomme de terre encore disponible avec volume limite avant reappprovisionnement.", new BigDecimal("195.00"), "Sac 25 kg", "/internet-products/potato-field.jpg", 14, 10, true, false, "Pomme de terre", at(6, 2, 11, 40)),
                new DemoProductDefinition("betterave-a-sucre-monogerme", "BTS-MON-061", "Betterave monogerme Nabila", "Betterave a sucre monogerme pour culture encadree.", "Semence de betterave a sucre pour zones irriguees et contrats de culture suivis.", new BigDecimal("540.00"), "Unite de semence", "/internet-products/sugar-beet-field.jpg", 49, 12, true, true, "Betterave a sucre", at(6, 2, 11, 50)),
                new DemoProductDefinition("engrais-npk-16-16-20", "ENF-NPK-1620", "Engrais NPK 16-16-20", "Engrais de fond pour preparation du sol.", "Formule de fond utilisee avant implantation de cereales et cultures de saison.", new BigDecimal("430.00"), "Sac 50 kg", "/internet-products/fertilizer-granules.jpg", 27, 10, true, true, "Engrais de fond", at(6, 2, 12, 0)),
                new DemoProductDefinition("engrais-npk-15-15-15", "ENF-NPK-1515", "Engrais NPK 15-15-15", "Engrais equilibre pour plusieurs cultures.", "Formule polyvalente utilisee pour maintenir un bon niveau de fertilisation de fond.", new BigDecimal("420.00"), "Sac 50 kg", "/internet-products/fertilizer-granules.jpg", 12, 10, true, true, "Engrais de fond", at(6, 2, 12, 10)),
                new DemoProductDefinition("engrais-npk-10-30-10", "ENF-NPK-1030", "Engrais NPK 10-30-10", "Formule phosphatee pour preparation technique.", "Engrais de fond a dominante phosphoree utilise sur plusieurs parcelles de legumes et cereales.", new BigDecimal("465.50"), "Sac 50 kg", "/internet-products/fertilizer-granules.jpg", 24, 10, true, false, "Engrais de fond", at(6, 2, 12, 20)),
                new DemoProductDefinition("engrais-map-11-52-00", "ENF-MAP-1152", "Engrais MAP 11-52-00", "Reference MAP pour implantation et enracinement.", "Engrais technique pour accompagner les semis et le bon depart des cultures.", new BigDecimal("455.00"), "Sac 50 kg", "/internet-products/fertilizer-granules.jpg", 16, 8, true, false, "Engrais de fond", at(6, 2, 12, 30)),
                new DemoProductDefinition("dap-18-46-00", "ENF-DAP-1846", "Engrais DAP 18-46-00", "DAP pour les besoins phosphores des sols.", "Reference DAP suivie dans les centres de distribution pour campagnes cerealieres.", new BigDecimal("470.00"), "Sac 50 kg", "/internet-products/fertilizer-granules.jpg", 21, 8, true, false, "Engrais de fond", at(6, 2, 12, 40)),
                new DemoProductDefinition("uree-46", "ENC-URE-4600", "Uree 46%", "Engrais de couverture azote.", "Engrais de couverture utilise pour l accompagnement vegetatif et les relances de culture.", new BigDecimal("395.00"), "Sac 50 kg", "/internet-products/fertilizer-granules.jpg", 38, 10, true, true, "Engrais de couverture", at(6, 2, 12, 50)),
                new DemoProductDefinition("ammonitrate-33-5", "ENC-AMN-3350", "Ammonitrate 33.5%", "Ammonitrate pour apport azote rapide.", "Reference azotee a stock faible utile pour tester les alertes dans l espace gestionnaire.", new BigDecimal("405.00"), "Sac 50 kg", "/internet-products/fertilizer-granules.jpg", 8, 10, true, false, "Engrais de couverture", at(6, 2, 13, 0)),
                new DemoProductDefinition("sulfate-ammoniaque-21", "ENC-SUL-2100", "Sulfate d ammoniaque 21%", "Sulfate azote pour couverture et correction.", "Produit de couverture destine aux besoins d apport azote dans les parcelles specialises.", new BigDecimal("385.00"), "Sac 50 kg", "/internet-products/fertilizer-granules.jpg", 19, 8, true, false, "Engrais de couverture", at(6, 2, 13, 10)),
                new DemoProductDefinition("traitement-semence-cerealis-guard", "TRT-CGD-001", "Cerealis Guard", "Traitement de semences pour cereales.", "Solution de traitement avant semis pour renforcer la protection initiale des semences cerealieres.", new BigDecimal("225.00"), "Bidon 5 L", "/internet-products/fertilizer-granules.jpg", 7, 6, true, false, "Traitements", at(6, 2, 13, 20)),
                new DemoProductDefinition("traitement-sol-protect", "TRT-SPR-002", "Sol Protect", "Traitement fongicide d accompagnement.", "Produit de traitement utilise sur certains lots de semences et petites campagnes maraicheres.", new BigDecimal("275.00"), "Bidon 5 L", "/internet-products/fertilizer-granules.jpg", 19, 6, true, false, "Traitements", at(6, 2, 13, 30))
        );
    }

    private List<DemoOrderDefinition> orderDefinitions() {
        return List.of(
                new DemoOrderDefinition("CMD-2026-0001", "client@sonacos.ma", OrderStatus.LIVREE, ReceptionMode.LIVRAISON, "Maarif, Casablanca", PaymentMode.VIREMENT, PaymentStatus.VALIDE, at(6, 12, 10, 15), at(6, 12, 11, 5), "gestionnaire@sonacos.ma", at(6, 12, 11, 20), "Commande livree pour la campagne cerealiere de debut saison.", List.of(new DemoOrderItem("BT-ANZ-001", 2), new DemoOrderItem("ENF-NPK-1620", 3))),
                new DemoOrderDefinition("CMD-2026-0002", "omar.alaoui@client.ma", OrderStatus.CONFIRMEE, ReceptionMode.RETRAIT_CENTRE, "Point de retrait Settat", PaymentMode.PAIEMENT_SUR_PLACE, PaymentStatus.EN_ATTENTE, at(6, 15, 15, 0), null, null, at(6, 15, 15, 25), "Commande confirmee en attente de reglement au retrait centre.", List.of(new DemoOrderItem("OR-AMR-021", 2), new DemoOrderItem("ENC-URE-4600", 2))),
                new DemoOrderDefinition("CMD-2026-0003", "fatima.bennani@client.ma", OrderStatus.EN_PREPARATION, ReceptionMode.LIVRAISON, "Lotissement Al Qods, Meknes", PaymentMode.CARTE_SIMULEE, PaymentStatus.VALIDE, at(6, 18, 11, 30), at(6, 18, 11, 50), "hamza.el.fassi@sonacos.ma", at(6, 18, 12, 5), "Commande en preparation avec paiement deja confirme.", List.of(new DemoOrderItem("PDT-CER-052", 4), new DemoOrderItem("ENF-MAP-1152", 1))),
                new DemoOrderDefinition("CMD-2026-0004", "khadija.ouahbi@client.ma", OrderStatus.EN_ATTENTE, ReceptionMode.LIVRAISON, "Route de Safi, Marrakech", PaymentMode.VIREMENT, PaymentStatus.EN_ATTENTE, at(6, 21, 9, 0), null, null, null, "Commande client en attente de validation commerciale.", List.of(new DemoOrderItem("BT-AML-002", 1), new DemoOrderItem("TRT-CGD-001", 1))),
                new DemoOrderDefinition("CMD-2026-0005", "mohamed.alaoui@client.ma", OrderStatus.PRETE, ReceptionMode.RETRAIT_CENTRE, "Agence SONACOS Rabat", PaymentMode.CARTE_SIMULEE, PaymentStatus.VALIDE, at(6, 24, 16, 10), at(6, 24, 16, 35), "gestionnaire@sonacos.ma", at(6, 24, 16, 45), "Commande prete pour retrait avec reglement deja confirme.", List.of(new DemoOrderItem("BT-AML-002", 3), new DemoOrderItem("ENF-NPK-1515", 2))),
                new DemoOrderDefinition("CMD-2026-0006", "salma.rafik@client.ma", OrderStatus.EXPEDIEE, ReceptionMode.LIVRAISON, "Quartier Tilila, Agadir", PaymentMode.VIREMENT, PaymentStatus.VALIDE, at(6, 27, 13, 20), at(6, 27, 14, 5), "hamza.el.fassi@sonacos.ma", at(6, 27, 14, 15), "Commande regionale expediée vers Agadir.", List.of(new DemoOrderItem("BTS-MON-061", 1), new DemoOrderItem("ENC-SUL-2100", 2))),
                new DemoOrderDefinition("CMD-2026-0007", "client@sonacos.ma", OrderStatus.CONFIRMEE, ReceptionMode.RETRAIT_CENTRE, "Agence SONACOS Casablanca", PaymentMode.PAIEMENT_SUR_PLACE, PaymentStatus.VALIDE, at(7, 1, 10, 45), at(7, 1, 11, 5), "imane.berrada@sonacos.ma", at(7, 1, 11, 20), "Commande confirmee pour retrait sur place.", List.of(new DemoOrderItem("MA-ATL-031", 1), new DemoOrderItem("ENF-DAP-1846", 2))),
                new DemoOrderDefinition("CMD-2026-0008", "omar.alaoui@client.ma", OrderStatus.CONFIRMEE, ReceptionMode.LIVRAISON, "Hay Salam, Settat", PaymentMode.VIREMENT, PaymentStatus.EN_ATTENTE, at(7, 3, 12, 30), null, null, at(7, 3, 12, 55), "Commande confirmee en attente de transfert bancaire.", List.of(new DemoOrderItem("BT-ANZ-001", 2), new DemoOrderItem("ENF-NPK-1030", 1))),
                new DemoOrderDefinition("CMD-2026-0009", "khadija.ouahbi@client.ma", OrderStatus.EN_PREPARATION, ReceptionMode.LIVRAISON, "Targa, Marrakech", PaymentMode.CARTE_SIMULEE, PaymentStatus.VALIDE, at(7, 5, 14, 15), at(7, 5, 14, 35), "gestionnaire@sonacos.ma", at(7, 5, 14, 50), "Preparation d une commande mixte semences et engrais.", List.of(new DemoOrderItem("FR-LUZ-041", 2), new DemoOrderItem("ENC-URE-4600", 3))),
                new DemoOrderDefinition("CMD-2026-0010", "mohamed.alaoui@client.ma", OrderStatus.LIVREE, ReceptionMode.LIVRAISON, "Hay Riad, Rabat", PaymentMode.VIREMENT, PaymentStatus.VALIDE, at(7, 7, 9, 40), at(7, 7, 10, 5), "gestionnaire@sonacos.ma", at(7, 7, 10, 20), "Commande livree sur Rabat pour exploitation cerealier.", List.of(new DemoOrderItem("BD-KRM-014", 2), new DemoOrderItem("ENF-NPK-1620", 2))),
                new DemoOrderDefinition("CMD-2026-0011", "sara.elalami@client.ma", OrderStatus.EN_ATTENTE, ReceptionMode.LIVRAISON, "Quartier Najd, Beni Mellal", PaymentMode.PAIEMENT_SUR_PLACE, PaymentStatus.EN_ATTENTE, at(7, 9, 11, 20), null, null, null, "Premiere commande encore en attente de confirmation.", List.of(new DemoOrderItem("LEG-PCZ-035", 1), new DemoOrderItem("TRT-SPR-002", 1))),
                new DemoOrderDefinition("CMD-2026-0012", "fatima.bennani@client.ma", OrderStatus.PRETE, ReceptionMode.RETRAIT_CENTRE, "Centre SONACOS Meknes", PaymentMode.VIREMENT, PaymentStatus.VALIDE, at(7, 12, 17, 0), at(7, 12, 17, 20), "imane.berrada@sonacos.ma", at(7, 12, 17, 35), "Commande prete a etre remise au client au centre Meknes.", List.of(new DemoOrderItem("OR-MSN-022", 2), new DemoOrderItem("ENC-AMN-3350", 2))),
                new DemoOrderDefinition("CMD-2026-0013", "imane.filali@client.ma", OrderStatus.LIVREE, ReceptionMode.LIVRAISON, "Quartier Anza, Agadir", PaymentMode.CARTE_SIMULEE, PaymentStatus.VALIDE, at(7, 15, 10, 10), at(7, 15, 10, 25), "hamza.el.fassi@sonacos.ma", at(7, 15, 10, 40), "Commande livree avec facture deja disponible.", List.of(new DemoOrderItem("PDT-SPN-053", 3), new DemoOrderItem("ENF-DAP-1846", 1))),
                new DemoOrderDefinition("CMD-2026-0014", "mehdi.cherkaoui@client.ma", OrderStatus.REFUSEE, ReceptionMode.LIVRAISON, "Hay Mohammadi, Casablanca", PaymentMode.VIREMENT, PaymentStatus.REFUSE, at(7, 18, 15, 25), at(7, 18, 18, 0), "gestionnaire@sonacos.ma", null, "Commande refusee apres impossibilite de confirmer le besoin logistique.", List.of(new DemoOrderItem("TRT-CGD-001", 2), new DemoOrderItem("BT-ANZ-001", 1))),
                new DemoOrderDefinition("CMD-2026-0015", "client@sonacos.ma", OrderStatus.EN_PREPARATION, ReceptionMode.RETRAIT_CENTRE, "Agence SONACOS Casablanca", PaymentMode.CARTE_SIMULEE, PaymentStatus.VALIDE, at(7, 20, 8, 50), at(7, 20, 9, 10), "gestionnaire@sonacos.ma", at(7, 20, 9, 20), "Commande interne du client principal en cours de preparation.", List.of(new DemoOrderItem("BT-AML-002", 2), new DemoOrderItem("ENF-NPK-1515", 1))),
                new DemoOrderDefinition("CMD-2026-0016", "mohamed.alaoui@client.ma", OrderStatus.LIVREE, ReceptionMode.LIVRAISON, "Hay Riad, Rabat", PaymentMode.VIREMENT, PaymentStatus.VALIDE, at(7, 22, 13, 5), at(7, 22, 13, 25), "gestionnaire@sonacos.ma", at(7, 22, 13, 35), "Commande livree avec plusieurs articles cerealiers.", List.of(new DemoOrderItem("BD-MRZ-018", 2), new DemoOrderItem("ENF-MAP-1152", 2), new DemoOrderItem("TRT-SPR-002", 1))),
                new DemoOrderDefinition("CMD-2026-0017", "khadija.ouahbi@client.ma", OrderStatus.EN_ATTENTE, ReceptionMode.LIVRAISON, "Route de Safi, Marrakech", PaymentMode.CARTE_SIMULEE, PaymentStatus.EN_ATTENTE, at(7, 24, 16, 35), null, null, at(7, 24, 16, 50), "Commande saisie et en attente de confirmation commerciale.", List.of(new DemoOrderItem("OL-CHM-051", 1), new DemoOrderItem("ENC-AMN-3350", 1))),
                new DemoOrderDefinition("CMD-2026-0018", "omar.alaoui@client.ma", OrderStatus.EXPEDIEE, ReceptionMode.LIVRAISON, "Hay Salam, Settat", PaymentMode.VIREMENT, PaymentStatus.VALIDE, at(7, 27, 9, 55), at(7, 27, 10, 15), "hamza.el.fassi@sonacos.ma", at(7, 27, 10, 25), "Commande expediée a destination de Settat.", List.of(new DemoOrderItem("BT-ANZ-001", 1), new DemoOrderItem("ENC-URE-4600", 4))),
                new DemoOrderDefinition("CMD-2026-0019", "fatima.bennani@client.ma", OrderStatus.LIVREE, ReceptionMode.RETRAIT_CENTRE, "Centre SONACOS Meknes", PaymentMode.PAIEMENT_SUR_PLACE, PaymentStatus.VALIDE, at(7, 29, 12, 10), at(7, 29, 12, 40), "imane.berrada@sonacos.ma", at(7, 29, 12, 50), "Commande retiree et cloturee avec facture disponible.", List.of(new DemoOrderItem("LEG-FEV-034", 2), new DemoOrderItem("ENF-NPK-1030", 1))),
                new DemoOrderDefinition("CMD-2026-0020", "salma.rafik@client.ma", OrderStatus.ANNULEE, ReceptionMode.LIVRAISON, "Quartier Tilila, Agadir", PaymentMode.VIREMENT, PaymentStatus.EN_ATTENTE, at(7, 31, 18, 0), null, null, null, "Commande annulee avant preparation faute de confirmation finale.", List.of(new DemoOrderItem("BTS-MON-061", 1), new DemoOrderItem("TRT-SPR-002", 1))),
                new DemoOrderDefinition("CMD-2026-0021", "mohamed.alaoui@client.ma", OrderStatus.CONFIRMEE, ReceptionMode.LIVRAISON, "Hay Riad, Rabat", PaymentMode.CARTE_SIMULEE, PaymentStatus.VALIDE, at(8, 2, 10, 30), at(8, 2, 10, 50), "gestionnaire@sonacos.ma", at(8, 2, 11, 5), "Commande confirmee avec paiement valide pour livraison planifiee.", List.of(new DemoOrderItem("FR-TRF-042", 2), new DemoOrderItem("ENF-DAP-1846", 2))),
                new DemoOrderDefinition("CMD-2026-0022", "sara.elalami@client.ma", OrderStatus.EN_PREPARATION, ReceptionMode.LIVRAISON, "Quartier Najd, Beni Mellal", PaymentMode.VIREMENT, PaymentStatus.EN_ATTENTE, at(8, 4, 11, 15), null, null, at(8, 4, 11, 40), "Commande en preparation avec virement encore en attente.", List.of(new DemoOrderItem("LEG-LNT-036", 2), new DemoOrderItem("ENC-SUL-2100", 2))),
                new DemoOrderDefinition("CMD-2026-0023", "client@sonacos.ma", OrderStatus.EN_ATTENTE, ReceptionMode.LIVRAISON, "Maarif, Casablanca", PaymentMode.VIREMENT, PaymentStatus.EN_ATTENTE, at(8, 5, 14, 40), null, null, at(8, 5, 15, 0), "Nouvelle commande du client principal encore en attente.", List.of(new DemoOrderItem("PDT-CER-052", 2), new DemoOrderItem("ENF-NPK-1515", 1))),
                new DemoOrderDefinition("CMD-2026-0024", "omar.alaoui@client.ma", OrderStatus.PRETE, ReceptionMode.RETRAIT_CENTRE, "Point de retrait Settat", PaymentMode.PAIEMENT_SUR_PLACE, PaymentStatus.VALIDE, at(8, 7, 9, 20), at(8, 7, 9, 45), "imane.berrada@sonacos.ma", at(8, 7, 10, 0), "Commande prete pour retrait prioritaire du client.", List.of(new DemoOrderItem("ENF-NPK-1515", 3), new DemoOrderItem("BT-AML-002", 1))),
                new DemoOrderDefinition("CMD-2026-0025", "khadija.ouahbi@client.ma", OrderStatus.LIVREE, ReceptionMode.LIVRAISON, "Targa, Marrakech", PaymentMode.VIREMENT, PaymentStatus.VALIDE, at(8, 7, 16, 10), at(8, 7, 16, 30), "hamza.el.fassi@sonacos.ma", at(8, 7, 16, 40), "Commande livree avec combinaison semences et traitement.", List.of(new DemoOrderItem("OL-NRA-052", 1), new DemoOrderItem("TRT-CGD-001", 1), new DemoOrderItem("ENC-URE-4600", 2))),
                new DemoOrderDefinition("CMD-2026-0026", "imane.filali@client.ma", OrderStatus.EXPEDIEE, ReceptionMode.LIVRAISON, "Quartier Anza, Agadir", PaymentMode.CARTE_SIMULEE, PaymentStatus.VALIDE, at(8, 8, 8, 45), at(8, 8, 9, 5), "gestionnaire@sonacos.ma", at(8, 8, 9, 15), "Commande expediée la veille de la soutenance.", List.of(new DemoOrderItem("MA-ATL-031", 1), new DemoOrderItem("ENF-NPK-1030", 2))),
                new DemoOrderDefinition("CMD-2026-0027", "fatima.bennani@client.ma", OrderStatus.ANNULEE, ReceptionMode.RETRAIT_CENTRE, "Centre SONACOS Meknes", PaymentMode.PAIEMENT_SUR_PLACE, PaymentStatus.REFUSE, at(8, 8, 13, 30), at(8, 8, 14, 10), "imane.berrada@sonacos.ma", null, "Commande annulee apres absence de retrait et refus de regularisation.", List.of(new DemoOrderItem("PDT-SPN-053", 2), new DemoOrderItem("ENC-AMN-3350", 1))),
                new DemoOrderDefinition("CMD-2026-0028", "mohamed.alaoui@client.ma", OrderStatus.CONFIRMEE, ReceptionMode.LIVRAISON, "Hay Riad, Rabat", PaymentMode.VIREMENT, PaymentStatus.EN_ATTENTE, at(8, 8, 17, 20), null, null, at(8, 8, 17, 45), "Commande confirmee a suivre en priorite pour client recurrent.", List.of(new DemoOrderItem("ENF-NPK-1515", 3), new DemoOrderItem("BT-ANZ-001", 2))),
                new DemoOrderDefinition("CMD-2026-0029", "client@sonacos.ma", OrderStatus.EN_PREPARATION, ReceptionMode.RETRAIT_CENTRE, "Agence SONACOS Casablanca", PaymentMode.CARTE_SIMULEE, PaymentStatus.VALIDE, at(8, 9, 9, 10), at(8, 9, 9, 25), "gestionnaire@sonacos.ma", at(8, 9, 9, 35), "Commande du jour deja passee en preparation.", List.of(new DemoOrderItem("LEG-PCZ-035", 1), new DemoOrderItem("ENF-DAP-1846", 2))),
                new DemoOrderDefinition("CMD-2026-0030", "omar.alaoui@client.ma", OrderStatus.EN_ATTENTE, ReceptionMode.RETRAIT_CENTRE, "Point de retrait Settat", PaymentMode.PAIEMENT_SUR_PLACE, PaymentStatus.EN_ATTENTE, at(8, 9, 16, 45), null, null, null, "Derniere commande en attente de validation et de paiement sur place.", List.of(new DemoOrderItem("OR-MSN-022", 1), new DemoOrderItem("ENC-SUL-2100", 1)))
        );
    }

    private List<DemoCartDefinition> cartDefinitions() {
        return List.of(
                new DemoCartDefinition("client@sonacos.ma", at(8, 9, 18, 5), List.of(
                        new DemoOrderItem("TRT-CGD-001", 1),
                        new DemoOrderItem("LEG-PCZ-035", 1)
                )),
                new DemoCartDefinition("mohamed.alaoui@client.ma", at(8, 8, 12, 30), List.of(
                        new DemoOrderItem("BT-AML-002", 1),
                        new DemoOrderItem("ENF-NPK-1620", 2),
                        new DemoOrderItem("TRT-SPR-002", 1)
                )),
                new DemoCartDefinition("khadija.ouahbi@client.ma", at(8, 7, 11, 45), List.of(
                        new DemoOrderItem("OL-CHM-051", 1)
                ))
        );
    }

    private List<DemoValidationDefinition> validationDefinitions() {
        return List.of(
                new DemoValidationDefinition("VAL-2026-0001", ValidationOperationType.STOCK, "Sortie exceptionnelle de 20 sacs sur ENF-NPK-1515 pour servir CMD-2026-0028. Stock actuel 32, stock projete 12, seuil 10.", "gestionnaire@sonacos.ma", "responsable@sonacos.ma", ValidationStatus.EN_ATTENTE, ValidationPriority.HAUTE, null, at(8, 9, 8, 30), null),
                new DemoValidationDefinition("VAL-2026-0002", ValidationOperationType.PAIEMENT, "Confirmation manuelle du paiement PAY-2026-0023 avant preparation de CMD-2026-0023.", "hamza.el.fassi@sonacos.ma", "responsable@sonacos.ma", ValidationStatus.EN_ATTENTE, ValidationPriority.HAUTE, null, at(8, 9, 9, 15), null),
                new DemoValidationDefinition("VAL-2026-0003", ValidationOperationType.COMMANDE, "Validation d un retrait prioritaire pour CMD-2026-0030 avec preparation anticipee du lot.", "imane.berrada@sonacos.ma", "mehdi.tazi@sonacos.ma", ValidationStatus.EN_ATTENTE, ValidationPriority.MOYENNE, null, at(8, 8, 17, 10), null),
                new DemoValidationDefinition("VAL-2026-0004", ValidationOperationType.STOCK, "Ajustement demande sur OR-MSN-022 apres ecart d inventaire. Stock actuel 18, correction souhaitee 18 vers 12.", "gestionnaire@sonacos.ma", "mehdi.tazi@sonacos.ma", ValidationStatus.EN_ATTENTE, ValidationPriority.MOYENNE, null, at(8, 8, 11, 40), null),
                new DemoValidationDefinition("VAL-2026-0005", ValidationOperationType.AUTRE, "Derogation sur le planning de retrait de CMD-2026-0024 a la demande du client Omar Alaoui.", "hamza.el.fassi@sonacos.ma", "responsable@sonacos.ma", ValidationStatus.EN_ATTENTE, ValidationPriority.MOYENNE, null, at(8, 7, 15, 20), null),
                new DemoValidationDefinition("VAL-2026-0006", ValidationOperationType.STOCK, "Sortie limitee de 4 bidons sur TRT-CGD-001. Stock actuel 7, stock projete 3, seuil 6.", "imane.berrada@sonacos.ma", "mehdi.tazi@sonacos.ma", ValidationStatus.EN_ATTENTE, ValidationPriority.NORMALE, null, at(8, 7, 10, 5), null),
                new DemoValidationDefinition("VAL-2026-0007", ValidationOperationType.PAIEMENT, "Validation du paiement PAY-2026-0024 apres verification du dossier retrait Settat.", "gestionnaire@sonacos.ma", "responsable@sonacos.ma", ValidationStatus.VALIDEE, ValidationPriority.MOYENNE, null, at(8, 8, 8, 45), at(8, 10, 9, 20)),
                new DemoValidationDefinition("VAL-2026-0008", ValidationOperationType.STOCK, "Regularisation acceptee sur BT-AML-002 apres verification physique du lot. Ecart 85 vers 82 deja justifie.", "hamza.el.fassi@sonacos.ma", "mehdi.tazi@sonacos.ma", ValidationStatus.VALIDEE, ValidationPriority.HAUTE, null, at(8, 8, 9, 35), at(8, 10, 10, 10)),
                new DemoValidationDefinition("VAL-2026-0009", ValidationOperationType.COMMANDE, "Validation exceptionnelle de remise anticipee pour CMD-2026-0029.", "imane.berrada@sonacos.ma", "responsable@sonacos.ma", ValidationStatus.VALIDEE, ValidationPriority.MOYENNE, null, at(8, 9, 9, 5), at(8, 9, 14, 15)),
                new DemoValidationDefinition("VAL-2026-0010", ValidationOperationType.STOCK, "Refus d une sortie de 12 sacs sur OR-MSN-022 car le stock tomberait de 18 a 6 sous le seuil 10.", "gestionnaire@sonacos.ma", "responsable@sonacos.ma", ValidationStatus.REFUSEE, ValidationPriority.HAUTE, "Le stock restant serait insuffisant pour couvrir les commandes deja confirmees.", at(8, 8, 13, 10), at(8, 10, 11, 25)),
                new DemoValidationDefinition("VAL-2026-0011", ValidationOperationType.AUTRE, "Refus d une derogation de paiement sur place pour CMD-2026-0028 sans justificatif.", "hamza.el.fassi@sonacos.ma", "mehdi.tazi@sonacos.ma", ValidationStatus.REFUSEE, ValidationPriority.MOYENNE, "La demande ne comporte pas de justificatif client ni de validation commerciale.", at(8, 8, 16, 45), at(8, 9, 16, 30)),
                new DemoValidationDefinition("VAL-2026-0012", ValidationOperationType.PAIEMENT, "Validation historique du paiement PAY-2026-0019 avant remise de la commande.", "imane.berrada@sonacos.ma", "responsable@sonacos.ma", ValidationStatus.VALIDEE, ValidationPriority.NORMALE, null, at(7, 29, 12, 15), at(7, 29, 12, 35)),
                new DemoValidationDefinition("VAL-2026-0013", ValidationOperationType.COMMANDE, "Validation historique de la preparation de CMD-2026-0012.", "gestionnaire@sonacos.ma", "responsable@sonacos.ma", ValidationStatus.VALIDEE, ValidationPriority.NORMALE, null, at(7, 12, 16, 50), at(7, 12, 17, 10)),
                new DemoValidationDefinition("VAL-2026-0014", ValidationOperationType.STOCK, "Refus historique d une sortie supplementaire sur ENC-AMN-3350, stock insuffisant.", "hamza.el.fassi@sonacos.ma", "mehdi.tazi@sonacos.ma", ValidationStatus.REFUSEE, ValidationPriority.MOYENNE, "Le seuil d alerte aurait ete franchi sans solution immediate de remplacement.", at(7, 24, 10, 25), at(7, 24, 12, 5))
        );
    }

    private List<DemoArchiveDefinition> archiveDefinitions() {
        return List.of(
                new DemoArchiveDefinition("FAC-2026-0001", at(7, 18, 9, 15), "archiviste@sonacos.ma"),
                new DemoArchiveDefinition("FAC-2026-0003", at(7, 25, 10, 30), "archiviste@sonacos.ma"),
                new DemoArchiveDefinition("FAC-2026-0005", at(8, 3, 9, 45), "salma.amrani@sonacos.ma"),
                new DemoArchiveDefinition("FAC-2026-0006", at(8, 7, 11, 10), "archiviste@sonacos.ma"),
                new DemoArchiveDefinition("FAC-2026-0010", at(8, 7, 16, 0), "salma.amrani@sonacos.ma"),
                new DemoArchiveDefinition("FAC-2026-0012", at(8, 8, 9, 35), "archiviste@sonacos.ma"),
                new DemoArchiveDefinition("FAC-2026-0013", at(8, 8, 15, 20), "salma.amrani@sonacos.ma"),
                new DemoArchiveDefinition("FAC-2026-0016", at(8, 8, 17, 5), "archiviste@sonacos.ma"),
                new DemoArchiveDefinition("FAC-2026-0019", at(8, 10, 8, 55), "archiviste@sonacos.ma"),
                new DemoArchiveDefinition("FAC-2026-0024", at(8, 10, 10, 45), "salma.amrani@sonacos.ma"),
                new DemoArchiveDefinition("FAC-2026-0025", at(8, 9, 14, 5), "archiviste@sonacos.ma"),
                new DemoArchiveDefinition("FAC-2026-0026", at(8, 9, 17, 20), "salma.amrani@sonacos.ma")
        );
    }

    private List<DemoHistoryDefinition> buildAuditHistory() {
        List<DemoHistoryDefinition> entries = new ArrayList<>();

        entries.add(new DemoHistoryDefinition("CREATE_USER", "USER", "fatima.bennani@client.ma", "Creation du compte client Fatima Bennani.", "admin@sonacos.ma", at(6, 23, 11, 15), null, "CLIENT"));
        entries.add(new DemoHistoryDefinition("CREATE_USER", "USER", "mohamed.alaoui@client.ma", "Creation du compte client Mohamed Alaoui.", "admin@sonacos.ma", at(7, 3, 13, 5), null, "CLIENT"));
        entries.add(new DemoHistoryDefinition("CREATE_USER", "USER", "sara.elalami@client.ma", "Creation du compte client Sara El Alami.", "nabil.ouazzani@sonacos.ma", at(7, 9, 11, 10), null, "CLIENT"));
        entries.add(new DemoHistoryDefinition("UPDATE_USER", "USER", "client@sonacos.ma", "Profil utilisateur modifie par l administration.", "admin@sonacos.ma", at(8, 10, 9, 40), "Casablanca", "Casablanca"));
        entries.add(new DemoHistoryDefinition("UPDATE_USER", "USER", "mohamed.alaoui@client.ma", "Adresse client mise a jour.", "nabil.ouazzani@sonacos.ma", at(8, 7, 15, 15), "Rabat", "Rabat"));
        entries.add(new DemoHistoryDefinition("UPDATE_USER_ROLES", "USER", "hamza.el.fassi@sonacos.ma", "Roles utilisateur mis a jour par l administration.", "admin@sonacos.ma", at(7, 20, 12, 0), "GESTIONNAIRE", "GESTIONNAIRE"));
        entries.add(new DemoHistoryDefinition("DEACTIVATE_USER", "USER", "yassine.tazi@client.ma", "Statut du compte utilisateur modifie.", "admin@sonacos.ma", at(8, 1, 9, 30), "ACTIF", "INACTIF"));
        entries.add(new DemoHistoryDefinition("DEACTIVATE_USER", "USER", "mehdi.cherkaoui@client.ma", "Statut du compte utilisateur modifie.", "nabil.ouazzani@sonacos.ma", at(8, 5, 16, 0), "ACTIF", "INACTIF"));
        entries.add(new DemoHistoryDefinition("ACTIVATE_USER", "USER", "hamza.el.fassi@sonacos.ma", "Statut du compte utilisateur verifie.", "admin@sonacos.ma", at(8, 10, 9, 15), "ACTIF", "ACTIF"));

        for (DemoOrderDefinition order : orderDefinitions()) {
            entries.add(new DemoHistoryDefinition(
                    "CREATE_ORDER",
                    "ORDER",
                    order.orderNumber(),
                    "Commande client creee.",
                    order.clientEmail(),
                    order.createdAt(),
                    null,
                    order.status().name()
            ));

            if (order.paymentDate() != null) {
                entries.add(new DemoHistoryDefinition(
                        "UPDATE_PAYMENT_STATUS",
                        "PAYMENT",
                        siblingReference(order.orderNumber(), "PAY"),
                        "Statut de paiement mis a jour pour " + order.orderNumber() + ".",
                        order.validatedByEmail(),
                        order.paymentDate(),
                        "EN_ATTENTE",
                        order.paymentStatus().name()
                ));
            }
        }

        for (DemoValidationDefinition validation : validationDefinitions()) {
            if (validation.decidedAt() == null) {
                continue;
            }
            entries.add(new DemoHistoryDefinition(
                    validation.status() == ValidationStatus.VALIDEE ? "VALIDATE_OPERATION" : "REFUSE_OPERATION",
                    "VALIDATION",
                    validation.reference(),
                    validation.status() == ValidationStatus.VALIDEE ? "Demande validee." : "Demande refusee.",
                    validation.responsibleEmail(),
                    validation.decidedAt(),
                    "EN_ATTENTE",
                    validation.status().name()
            ));
        }

        for (DemoArchiveDefinition archive : archiveDefinitions()) {
            entries.add(new DemoHistoryDefinition(
                    "ARCHIVE_DOCUMENT",
                    "INVOICE",
                    archive.invoiceNumber(),
                    "Facture archivee dans l espace documentaire.",
                    archive.archivedByEmail(),
                    archive.archivedAt(),
                    "A_ARCHIVER",
                    "ARCHIVE"
            ));
        }

        List<Product> trackedProducts = productRepository.findAll().stream()
                .sorted(java.util.Comparator.comparing(Product::getReference))
                .limit(12)
                .toList();
        List<String> stockActors = List.of("gestionnaire@sonacos.ma", "hamza.el.fassi@sonacos.ma", "imane.berrada@sonacos.ma");
        for (int index = 0; index < trackedProducts.size(); index++) {
            Product product = trackedProducts.get(index);
            int oldValue = product.getStockQuantity() + 8 + index;
            int newValue = product.getStockQuantity();
            entries.add(new DemoHistoryDefinition(
                    "UPDATE_STOCK",
                    "STOCK",
                    product.getReference(),
                    "Mouvement de stock enregistre sur " + product.getReference() + ".",
                    stockActors.get(index % stockActors.size()),
                    at(8, 7 + index % 3, 10 + index % 5, 12 + index),
                    String.valueOf(oldValue),
                    String.valueOf(newValue)
            ));
        }

        return entries;
    }

    private record DemoUserDefinition(
            String email,
            String firstName,
            String lastName,
            String phone,
            String address,
            String city,
            String password,
            Set<RoleCode> roleCodes,
            boolean active,
            LocalDateTime createdAt
    ) {
    }

    private record DemoCategoryDefinition(
            String name,
            String description,
            LocalDateTime createdAt
    ) {
    }

    private record DemoProductDefinition(
            String slug,
            String reference,
            String name,
            String shortDescription,
            String fullDescription,
            BigDecimal price,
            String unit,
            String imageUrl,
            int stockQuantity,
            int alertThreshold,
            boolean active,
            boolean featured,
            String categoryName,
            LocalDateTime createdAt
    ) {
    }

    private record DemoOrderDefinition(
            String orderNumber,
            String clientEmail,
            OrderStatus status,
            ReceptionMode receptionMode,
            String deliveryAddress,
            PaymentMode paymentMode,
            PaymentStatus paymentStatus,
            LocalDateTime createdAt,
            LocalDateTime paymentDate,
            String validatedByEmail,
            LocalDateTime invoiceGeneratedAt,
            String comment,
            List<DemoOrderItem> items
    ) {
    }

    private record DemoCartDefinition(
            String clientEmail,
            LocalDateTime createdAt,
            List<DemoOrderItem> items
    ) {
    }

    private record DemoValidationDefinition(
            String reference,
            ValidationOperationType operationType,
            String description,
            String requesterEmail,
            String responsibleEmail,
            ValidationStatus status,
            ValidationPriority priority,
            String rejectionReason,
            LocalDateTime requestedAt,
            LocalDateTime decidedAt
    ) {
    }

    private record DemoArchiveDefinition(
            String invoiceNumber,
            LocalDateTime archivedAt,
            String archivedByEmail
    ) {
    }

    private record DemoHistoryDefinition(
            String actionType,
            String objectType,
            String objectIdentifier,
            String description,
            String userEmail,
            LocalDateTime createdAt,
            String oldValue,
            String newValue
    ) {
    }

    private record DemoOrderItem(
            String reference,
            int quantity
    ) {
    }
}
