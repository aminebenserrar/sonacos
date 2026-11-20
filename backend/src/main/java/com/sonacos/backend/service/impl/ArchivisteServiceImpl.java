package com.sonacos.backend.service.impl;

import com.sonacos.backend.dto.archive.ArchiveDocumentFile;
import com.sonacos.backend.dto.archive.ArchiveDocumentResponse;
import com.sonacos.backend.entity.Invoice;
import com.sonacos.backend.entity.OrderItem;
import com.sonacos.backend.entity.User;
import com.sonacos.backend.exception.ResourceNotFoundException;
import com.sonacos.backend.repository.InvoiceRepository;
import com.sonacos.backend.service.ArchivisteService;
import com.sonacos.backend.service.AuditLogService;
import com.sonacos.backend.service.CurrentUserService;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ArchivisteServiceImpl implements ArchivisteService {

    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern("dd/MM/yyyy", Locale.FRANCE);
    private static final DateTimeFormatter DATE_TIME_FORMATTER =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm", Locale.FRANCE);

    private final InvoiceRepository invoiceRepository;
    private final CurrentUserService currentUserService;
    private final AuditLogService auditLogService;

    @Override
    @Transactional(readOnly = true)
    public List<ArchiveDocumentResponse> getDocuments() {
        return invoiceRepository.findAll(Sort.by(Sort.Direction.DESC, "generatedAt")).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public ArchiveDocumentResponse archiveInvoice(Long invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Document introuvable"));

        if (!invoice.isArchived()) {
            User currentUser = currentUserService.getCurrentUser();
            invoice.setArchived(true);
            invoice.setArchivedAt(LocalDateTime.now());
            invoice.setArchivedBy(currentUser);

            auditLogService.log(
                    "ARCHIVE_DOCUMENT",
                    "INVOICE",
                    invoice.getInvoiceNumber(),
                    "Document archive pour la commande " + invoice.getOrder().getOrderNumber(),
                    "A_ARCHIVER",
                    "ARCHIVE"
            );
        }

        return toResponse(invoiceRepository.save(invoice));
    }

    @Override
    @Transactional(readOnly = true)
    public ArchiveDocumentFile downloadInvoice(Long invoiceId) {
        Invoice invoice = invoiceRepository.findDetailedById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Document introuvable"));

        return new ArchiveDocumentFile(
                invoice.getInvoiceNumber() + ".pdf",
                generateInvoicePdf(invoice)
        );
    }

    private ArchiveDocumentResponse toResponse(Invoice invoice) {
        return new ArchiveDocumentResponse(
                invoice.getId(),
                "FACTURE",
                invoice.getInvoiceNumber(),
                invoice.getOrder().getOrderNumber(),
                invoice.getOrder().getClient().getFirstName() + " " + invoice.getOrder().getClient().getLastName(),
                invoice.getTotalAmount(),
                invoice.getPdfPath(),
                invoice.getGeneratedAt(),
                invoice.isArchived(),
                invoice.getArchivedAt(),
                invoice.getArchivedBy() != null
                        ? invoice.getArchivedBy().getFirstName() + " " + invoice.getArchivedBy().getLastName()
                        : null,
                invoice.getOrder().getStatus().name()
        );
    }

    private byte[] generateInvoicePdf(Invoice invoice) {
        try (PDDocument document = new PDDocument();
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);

            try (PDPageContentStream content = new PDPageContentStream(document, page)) {
                float startX = 50f;
                float cursorY = 790f;

                cursorY = writeLine(content, startX, cursorY, "SONACOS", true, 20);
                cursorY = writeLine(content, startX, cursorY, "Facture client", false, 12);
                cursorY -= 8f;

                cursorY = writeLine(content, startX, cursorY,
                        "Facture: " + safe(invoice.getInvoiceNumber()), true, 13);
                cursorY = writeLine(content, startX, cursorY,
                        "Commande: " + safe(invoice.getOrder().getOrderNumber()), false, 12);
                cursorY = writeLine(content, startX, cursorY,
                        "Date de generation: " + DATE_TIME_FORMATTER.format(invoice.getGeneratedAt()), false, 12);
                cursorY -= 10f;

                String clientFullName = invoice.getOrder().getClient().getFirstName()
                        + " " + invoice.getOrder().getClient().getLastName();
                cursorY = writeLine(content, startX, cursorY, "Client", true, 13);
                cursorY = writeLine(content, startX, cursorY, safe(clientFullName), false, 12);
                cursorY = writeLine(content, startX, cursorY,
                        safe(invoice.getOrder().getClient().getEmail()), false, 12);
                cursorY = writeLine(content, startX, cursorY,
                        safe(invoice.getOrder().getClient().getPhone()), false, 12);
                cursorY = writeLine(content, startX, cursorY,
                        safe(invoice.getOrder().getDeliveryAddress()), false, 12);
                cursorY -= 10f;

                cursorY = writeLine(content, startX, cursorY, "Articles", true, 13);
                for (OrderItem item : invoice.getOrder().getItems()) {
                    String line = String.format(
                            Locale.US,
                            "%s | Ref: %s | Qt: %d | PU: %s MAD | Total: %s MAD",
                            safe(item.getProductNameSnapshot()),
                            safe(item.getProductReferenceSnapshot()),
                            item.getQuantity(),
                            formatAmount(item.getUnitPrice()),
                            formatAmount(item.getSubtotal())
                    );
                    cursorY = writeLine(content, startX, cursorY, line, false, 11);
                }

                cursorY -= 10f;
                cursorY = writeLine(content, startX, cursorY,
                        "Montant HT: " + formatAmount(invoice.getAmountExcludingTax()) + " MAD", false, 12);
                cursorY = writeLine(content, startX, cursorY,
                        "TVA: " + formatAmount(invoice.getTaxAmount()) + " MAD", false, 12);
                cursorY = writeLine(content, startX, cursorY,
                        "Total TTC: " + formatAmount(invoice.getTotalAmount()) + " MAD", true, 13);
                cursorY -= 10f;

                writeLine(content, startX, cursorY,
                        "Document genere pour demonstration PFA SONACOS le "
                                + DATE_FORMATTER.format(LocalDateTime.now()),
                        false,
                        10);
            }

            document.save(outputStream);
            return outputStream.toByteArray();
        } catch (IOException exception) {
            throw new IllegalStateException("Impossible de generer la facture PDF", exception);
        }
    }

    private float writeLine(
            PDPageContentStream content,
            float x,
            float y,
            String text,
            boolean bold,
            float size
    ) throws IOException {
        content.beginText();
        content.setFont(
                new PDType1Font(
                        bold
                                ? Standard14Fonts.FontName.HELVETICA_BOLD
                                : Standard14Fonts.FontName.HELVETICA
                ),
                size
        );
        content.newLineAtOffset(x, y);
        content.showText(text);
        content.endText();
        return y - (size + 6f);
    }

    private String formatAmount(BigDecimal amount) {
        return amount.setScale(2, RoundingMode.HALF_UP).toPlainString();
    }

    private String safe(String value) {
        return value == null || value.isBlank() ? "-" : value;
    }
}
