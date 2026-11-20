package com.sonacos.backend.mapper;

import com.sonacos.backend.dto.product.ProductResponse;
import com.sonacos.backend.entity.Product;
import org.springframework.stereotype.Component;

@Component
public class ProductMapper {

    public ProductResponse toResponse(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getSlug(),
                product.getReference(),
                product.getName(),
                product.getShortDescription(),
                product.getFullDescription(),
                product.getPrice(),
                product.getUnit(),
                product.getImageUrl(),
                product.getStockQuantity(),
                product.getAlertThreshold(),
                product.isActive(),
                product.isFeatured(),
                product.getCategory().getId(),
                product.getCategory().getName(),
                product.getCreatedAt(),
                product.getUpdatedAt()
        );
    }
}
