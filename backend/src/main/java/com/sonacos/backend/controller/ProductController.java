package com.sonacos.backend.controller;

import com.sonacos.backend.dto.common.PageResponse;
import com.sonacos.backend.dto.product.ProductRequest;
import com.sonacos.backend.dto.product.ProductResponse;
import com.sonacos.backend.dto.product.ProductStatusRequest;
import com.sonacos.backend.service.ProductService;
import com.sonacos.backend.util.PaginationUtils;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@PreAuthorize("hasRole('GESTIONNAIRE')")
@Tag(name = "Produits")
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public PageResponse<ProductResponse> getProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return productService.getAll(PaginationUtils.normalizePage(page), PaginationUtils.normalizeSize(size));
    }

    @GetMapping("/{id}")
    public ProductResponse getProduct(@PathVariable Long id) {
        return productService.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductResponse createProduct(@Valid @RequestBody ProductRequest request) {
        return productService.create(request);
    }

    @PutMapping("/{id}")
    public ProductResponse updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request
    ) {
        return productService.update(id, request);
    }

    @PostMapping("/{id}/image")
    public ProductResponse uploadProductImage(
            @PathVariable Long id,
            @RequestPart("image") MultipartFile image
    ) {
        return productService.uploadImage(id, image);
    }

    @DeleteMapping("/{id}/image")
    public ProductResponse deleteProductImage(@PathVariable Long id) {
        return productService.deleteImage(id);
    }

    @PatchMapping("/{id}/status")
    public ProductResponse updateProductStatus(
            @PathVariable Long id,
            @RequestBody ProductStatusRequest request
    ) {
        return productService.updateStatus(id, request);
    }
}
