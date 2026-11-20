package com.sonacos.backend.service;

import com.sonacos.backend.dto.common.PageResponse;
import com.sonacos.backend.dto.product.ProductRequest;
import com.sonacos.backend.dto.product.ProductResponse;
import com.sonacos.backend.dto.product.ProductStatusRequest;
import org.springframework.web.multipart.MultipartFile;

public interface ProductService {
    PageResponse<ProductResponse> getAll(int page, int size);
    ProductResponse getById(Long id);
    ProductResponse create(ProductRequest request);
    ProductResponse update(Long id, ProductRequest request);
    ProductResponse uploadImage(Long id, MultipartFile file);
    ProductResponse deleteImage(Long id);
    ProductResponse updateStatus(Long id, ProductStatusRequest request);
}
