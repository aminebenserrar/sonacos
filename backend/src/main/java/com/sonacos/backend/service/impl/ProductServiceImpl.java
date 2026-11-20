package com.sonacos.backend.service.impl;

import com.sonacos.backend.dto.common.PageResponse;
import com.sonacos.backend.dto.product.ProductRequest;
import com.sonacos.backend.dto.product.ProductResponse;
import com.sonacos.backend.dto.product.ProductStatusRequest;
import com.sonacos.backend.entity.Category;
import com.sonacos.backend.entity.Product;
import com.sonacos.backend.exception.ConflictException;
import com.sonacos.backend.exception.ResourceNotFoundException;
import com.sonacos.backend.mapper.ProductMapper;
import com.sonacos.backend.repository.CategoryRepository;
import com.sonacos.backend.repository.ProductRepository;
import com.sonacos.backend.service.AuditLogService;
import com.sonacos.backend.service.ProductImageStorageService;
import com.sonacos.backend.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductMapper productMapper;
    private final ProductImageStorageService productImageStorageService;
    private final AuditLogService auditLogService;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> getAll(int page, int size) {
        Page<Product> products = productRepository.findAll(PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return new PageResponse<>(
                products.getContent().stream().map(productMapper::toResponse).toList(),
                products.getNumber(),
                products.getSize(),
                products.getTotalElements(),
                products.getTotalPages(),
                products.isFirst(),
                products.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getById(Long id) {
        return productMapper.toResponse(productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produit introuvable")));
    }

    @Override
    @Transactional
    public ProductResponse create(ProductRequest request) {
        if (productRepository.existsByReferenceIgnoreCase(request.reference())) {
            throw new ConflictException("La reference produit existe deja");
        }
        if (productRepository.existsBySlugIgnoreCase(request.slug())) {
            throw new ConflictException("Le slug produit existe deja");
        }

        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Categorie introuvable"));

        Product product = Product.builder()
                .slug(request.slug().trim())
                .reference(request.reference().trim())
                .name(request.name().trim())
                .shortDescription(request.shortDescription().trim())
                .fullDescription(request.fullDescription().trim())
                .price(request.price())
                .unit(request.unit().trim())
                .imageUrl(request.imageUrl())
                .stockQuantity(request.stockQuantity())
                .alertThreshold(request.alertThreshold())
                .active(request.active())
                .featured(request.featured())
                .category(category)
                .build();

        Product savedProduct = productRepository.save(product);
        auditLogService.log(
                "CREATE_PRODUCT",
                "PRODUCT",
                savedProduct.getReference(),
                "Produit cree dans le catalogue",
                null,
                savedProduct.getName() + " | " + savedProduct.getStockQuantity()
        );
        return productMapper.toResponse(savedProduct);
    }

    @Override
    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produit introuvable"));
        String oldValue = product.getName() + " | " + product.getPrice() + " | " + product.getStockQuantity();

        if (productRepository.existsByReferenceIgnoreCaseAndIdNot(request.reference(), id)) {
            throw new ConflictException("La reference produit existe deja");
        }
        if (productRepository.existsBySlugIgnoreCaseAndIdNot(request.slug(), id)) {
            throw new ConflictException("Le slug produit existe deja");
        }

        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Categorie introuvable"));

        product.setSlug(request.slug().trim());
        product.setReference(request.reference().trim());
        product.setName(request.name().trim());
        product.setShortDescription(request.shortDescription().trim());
        product.setFullDescription(request.fullDescription().trim());
        product.setPrice(request.price());
        product.setUnit(request.unit().trim());
        product.setStockQuantity(request.stockQuantity());
        product.setAlertThreshold(request.alertThreshold());
        product.setActive(request.active());
        product.setFeatured(request.featured());
        product.setCategory(category);

        Product savedProduct = productRepository.save(product);
        auditLogService.log(
                "UPDATE_PRODUCT",
                "PRODUCT",
                savedProduct.getReference(),
                "Produit mis a jour",
                oldValue,
                savedProduct.getName() + " | " + savedProduct.getPrice() + " | " + savedProduct.getStockQuantity()
        );
        return productMapper.toResponse(savedProduct);
    }

    @Override
    @Transactional
    public ProductResponse uploadImage(Long id, MultipartFile file) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produit introuvable"));

        if (product.getImageUrl() != null && !product.getImageUrl().isBlank()) {
            productImageStorageService.deleteProductImage(product.getImageUrl());
        }

        product.setImageUrl(productImageStorageService.storeProductImage(file));
        Product savedProduct = productRepository.save(product);
        auditLogService.log(
                "UPLOAD_PRODUCT_IMAGE",
                "PRODUCT",
                savedProduct.getReference(),
                "Image produit mise a jour"
        );
        return productMapper.toResponse(savedProduct);
    }

    @Override
    @Transactional
    public ProductResponse deleteImage(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produit introuvable"));

        if (product.getImageUrl() != null && !product.getImageUrl().isBlank()) {
            productImageStorageService.deleteProductImage(product.getImageUrl());
        }

        product.setImageUrl(null);
        Product savedProduct = productRepository.save(product);
        auditLogService.log(
                "DELETE_PRODUCT_IMAGE",
                "PRODUCT",
                savedProduct.getReference(),
                "Image produit supprimee"
        );
        return productMapper.toResponse(savedProduct);
    }

    @Override
    @Transactional
    public ProductResponse updateStatus(Long id, ProductStatusRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produit introuvable"));
        String oldFlags = (product.isActive() ? "ACTIF" : "INACTIF") + " | " + (product.isFeatured() ? "FEATURED" : "STANDARD");
        product.setActive(request.active());
        product.setFeatured(request.featured());
        Product savedProduct = productRepository.save(product);
        auditLogService.log(
                "UPDATE_PRODUCT_STATUS",
                "PRODUCT",
                savedProduct.getReference(),
                "Statut produit mis a jour",
                oldFlags,
                (savedProduct.isActive() ? "ACTIF" : "INACTIF") + " | " + (savedProduct.isFeatured() ? "FEATURED" : "STANDARD")
        );
        return productMapper.toResponse(savedProduct);
    }
}
