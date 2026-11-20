package com.sonacos.backend.mapper;

import com.sonacos.backend.dto.invoice.InvoiceResponse;
import com.sonacos.backend.dto.order.OrderItemResponse;
import com.sonacos.backend.dto.order.OrderResponse;
import com.sonacos.backend.entity.Invoice;
import com.sonacos.backend.entity.OrderItem;
import com.sonacos.backend.entity.CustomerOrder;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class OrderMapper {

    public OrderResponse toResponse(CustomerOrder order) {
        List<OrderItemResponse> items = order.getItems().stream()
                .map(this::toItemResponse)
                .toList();

        return new OrderResponse(
                order.getId(),
                order.getOrderNumber(),
                order.getTotalAmount(),
                order.getStatus(),
                order.getReceptionMode(),
                order.getDeliveryAddress(),
                order.getPaymentMode(),
                order.getPayment() != null ? order.getPayment().getStatus() : null,
                order.getComment(),
                order.getCreatedAt(),
                items,
                order.getInvoice() != null ? order.getInvoice().getId() : null,
                order.getInvoice() != null ? order.getInvoice().getInvoiceNumber() : null,
                order.getInvoice() != null ? order.getInvoice().getPdfPath() : null
        );
    }

    public InvoiceResponse toInvoiceResponse(Invoice invoice) {
        return new InvoiceResponse(
                invoice.getId(),
                invoice.getInvoiceNumber(),
                invoice.getOrder().getOrderNumber(),
                invoice.getAmountExcludingTax(),
                invoice.getTaxAmount(),
                invoice.getTotalAmount(),
                invoice.getPdfPath(),
                invoice.getGeneratedAt()
        );
    }

    private OrderItemResponse toItemResponse(OrderItem item) {
        return new OrderItemResponse(
                item.getId(),
                item.getProduct().getId(),
                item.getProductNameSnapshot(),
                item.getProductReferenceSnapshot(),
                item.getQuantity(),
                item.getUnitPrice(),
                item.getSubtotal()
        );
    }
}
