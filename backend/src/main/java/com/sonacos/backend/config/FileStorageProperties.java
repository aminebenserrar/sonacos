package com.sonacos.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.files")
public record FileStorageProperties(
        String invoiceDir
) {
}
