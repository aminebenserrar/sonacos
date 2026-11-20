package com.sonacos.backend.dto.archive;

public record ArchiveDocumentFile(
        String fileName,
        byte[] content
) {
}
