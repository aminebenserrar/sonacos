package com.sonacos.backend.service;

import org.springframework.web.multipart.MultipartFile;

public interface ProductImageStorageService {
    String storeProductImage(MultipartFile file);
    void deleteProductImage(String imageUrl);
}
