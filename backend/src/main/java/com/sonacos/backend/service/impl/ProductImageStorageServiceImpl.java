package com.sonacos.backend.service.impl;

import com.sonacos.backend.exception.BusinessException;
import com.sonacos.backend.service.ProductImageStorageService;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ProductImageStorageServiceImpl implements ProductImageStorageService {

    private static final long MAX_FILE_SIZE = 5L * 1024L * 1024L;
    private static final String PRODUCT_IMAGE_PREFIX = "/uploads/products/";
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    private final Path productImageDirectory;

    public ProductImageStorageServiceImpl(@Value("${app.files.product-image-dir}") String productImageDirectory) {
        this.productImageDirectory = Path.of(productImageDirectory).toAbsolutePath().normalize();
    }

    @Override
    public String storeProductImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("Veuillez selectionner une image produit valide.");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BusinessException("L image ne doit pas depasser 5 Mo.");
        }

        String contentType = file.getContentType();
        if (StringUtils.hasText(contentType) && !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new BusinessException("Le fichier doit etre une image JPG, PNG ou WEBP.");
        }

        byte[] signature = readSignature(file);
        String extension = detectExtension(signature);
        if (extension == null) {
            throw new BusinessException("Le fichier doit etre une image JPG, PNG ou WEBP.");
        }

        try {
            Files.createDirectories(productImageDirectory);
            String filename = UUID.randomUUID() + "." + extension;
            Path target = productImageDirectory.resolve(filename).normalize();
            if (!target.startsWith(productImageDirectory)) {
                throw new BusinessException("Chemin d image invalide.");
            }

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, target, StandardCopyOption.REPLACE_EXISTING);
            }

            return PRODUCT_IMAGE_PREFIX + filename;
        } catch (IOException exception) {
            throw new IllegalStateException("Impossible d enregistrer l image produit", exception);
        }
    }

    @Override
    public void deleteProductImage(String imageUrl) {
        if (!StringUtils.hasText(imageUrl) || !imageUrl.startsWith(PRODUCT_IMAGE_PREFIX)) {
            return;
        }

        String filename = imageUrl.substring(PRODUCT_IMAGE_PREFIX.length());
        filename = Path.of(filename).getFileName().toString();
        Path target = productImageDirectory.resolve(filename).normalize();

        if (!target.startsWith(productImageDirectory)) {
            return;
        }

        try {
            Files.deleteIfExists(target);
        } catch (IOException exception) {
            throw new IllegalStateException("Impossible de supprimer l image produit", exception);
        }
    }

    private byte[] readSignature(MultipartFile file) {
        try (InputStream inputStream = file.getInputStream()) {
            return inputStream.readNBytes(16);
        } catch (IOException exception) {
            throw new IllegalStateException("Impossible de verifier le fichier image", exception);
        }
    }

    private String detectExtension(byte[] signature) {
        if (signature.length >= 8
                && (signature[0] & 0xFF) == 0x89
                && signature[1] == 0x50
                && signature[2] == 0x4E
                && signature[3] == 0x47
                && signature[4] == 0x0D
                && signature[5] == 0x0A
                && signature[6] == 0x1A
                && signature[7] == 0x0A) {
            return "png";
        }

        if (signature.length >= 3
                && (signature[0] & 0xFF) == 0xFF
                && (signature[1] & 0xFF) == 0xD8
                && (signature[2] & 0xFF) == 0xFF) {
            return "jpg";
        }

        if (signature.length >= 12
                && signature[0] == 'R'
                && signature[1] == 'I'
                && signature[2] == 'F'
                && signature[3] == 'F'
                && signature[8] == 'W'
                && signature[9] == 'E'
                && signature[10] == 'B'
                && signature[11] == 'P') {
            return "webp";
        }

        return null;
    }
}
