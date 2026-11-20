package com.sonacos.backend.service;

import com.sonacos.backend.dto.archive.ArchiveDocumentFile;
import com.sonacos.backend.dto.invoice.InvoiceResponse;
import com.sonacos.backend.dto.order.CreateOrderRequest;
import com.sonacos.backend.dto.order.OrderResponse;
import java.util.List;

public interface CustomerOrderService {
    OrderResponse createOrder(CreateOrderRequest request);
    List<OrderResponse> getMyOrders();
    List<InvoiceResponse> getMyInvoices();
    ArchiveDocumentFile downloadMyInvoice(Long invoiceId);
}
