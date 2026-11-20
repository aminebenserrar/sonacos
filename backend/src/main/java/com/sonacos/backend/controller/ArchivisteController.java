package com.sonacos.backend.controller;

import com.sonacos.backend.dto.archive.ArchiveDocumentFile;
import com.sonacos.backend.dto.archive.ArchiveDocumentResponse;
import com.sonacos.backend.service.ArchivisteService;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/archiviste")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ARCHIVISTE')")
@Tag(name = "Archiviste")
public class ArchivisteController {

    private final ArchivisteService archivisteService;

    @GetMapping("/documents")
    public List<ArchiveDocumentResponse> getDocuments() {
        return archivisteService.getDocuments();
    }

    @GetMapping(value = "/documents/{invoiceId}/download", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> downloadDocument(@PathVariable Long invoiceId) {
        ArchiveDocumentFile file = archivisteService.downloadInvoice(invoiceId);

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(file.fileName()).build().toString()
                )
                .contentType(MediaType.APPLICATION_PDF)
                .body(file.content());
    }

    @PatchMapping("/documents/{invoiceId}/archive")
    public ArchiveDocumentResponse archiveDocument(@PathVariable Long invoiceId) {
        return archivisteService.archiveInvoice(invoiceId);
    }
}
