package com.sonacos.backend.service;

import com.sonacos.backend.dto.archive.ArchiveDocumentResponse;
import com.sonacos.backend.dto.archive.ArchiveDocumentFile;
import java.util.List;

public interface ArchivisteService {
    List<ArchiveDocumentResponse> getDocuments();
    ArchiveDocumentResponse archiveInvoice(Long invoiceId);
    ArchiveDocumentFile downloadInvoice(Long invoiceId);
}
