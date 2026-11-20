package com.sonacos.backend.config;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    private final Path productImageDirectory;

    public WebMvcConfig(@Value("${app.files.product-image-dir}") String productImageDirectory) {
        this.productImageDirectory = Path.of(productImageDirectory).toAbsolutePath().normalize();
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        try {
            Files.createDirectories(productImageDirectory);
        } catch (IOException exception) {
            throw new IllegalStateException("Impossible de preparer le dossier des images produit", exception);
        }

        registry.addResourceHandler("/uploads/products/**")
                .addResourceLocations(productImageDirectory.toUri().toString());
    }
}
