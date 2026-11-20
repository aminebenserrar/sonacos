package com.sonacos.backend.controller;

import com.sonacos.backend.dto.archive.ArchiveDocumentFile;
import com.sonacos.backend.dto.invoice.InvoiceResponse;
import com.sonacos.backend.dto.order.CreateOrderRequest;
import com.sonacos.backend.dto.order.OrderResponse;
import com.sonacos.backend.service.CustomerOrderService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/customer")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CLIENT')")
@Tag(name = "Commandes client")
public class CustomerOrderController {

    private final CustomerOrderService customerOrderService;

    @PostMapping("/orders")
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse createOrder(@Valid @RequestBody CreateOrderRequest request) {
        return customerOrderService.createOrder(request);
    }

    @GetMapping("/orders")
    public List<OrderResponse> getOrders() {
        return customerOrderService.getMyOrders();
    }

    @GetMapping("/invoices")
    public List<InvoiceResponse> getInvoices() {
        return customerOrderService.getMyInvoices();
    }

    @GetMapping(value = "/invoices/{invoiceId}/download", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> downloadInvoice(@PathVariable Long invoiceId) {
        ArchiveDocumentFile file = customerOrderService.downloadMyInvoice(invoiceId);

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(file.fileName()).build().toString()
                )
                .contentType(MediaType.APPLICATION_PDF)
                .body(file.content());
    }
}
