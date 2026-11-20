package com.sonacos.backend.service;

import com.sonacos.backend.dto.category.CategoryResponse;
import com.sonacos.backend.dto.common.PageResponse;
import com.sonacos.backend.dto.product.ProductResponse;
import java.math.BigDecimal;
import java.util.List;

public interface PublicCatalogService {
    List<CategoryResponse> getActiveCategories();
    PageResponse<ProductResponse> getProducts(
            String search,
            Long categoryId,
            Boolean available,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String sortBy,
            String sortDirection,
            int page,
            int size
    );
    ProductResponse getProductBySlug(String slug);
    List<ProductResponse> getFeaturedProducts();
}
