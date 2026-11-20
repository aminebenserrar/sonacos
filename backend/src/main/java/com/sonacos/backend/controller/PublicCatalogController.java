package com.sonacos.backend.controller;

import com.sonacos.backend.dto.category.CategoryResponse;
import com.sonacos.backend.dto.common.PageResponse;
import com.sonacos.backend.dto.product.ProductResponse;
import com.sonacos.backend.service.PublicCatalogService;
import com.sonacos.backend.util.PaginationUtils;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.math.BigDecimal;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
@Tag(name = "Catalogue public")
public class PublicCatalogController {

    private final PublicCatalogService publicCatalogService;

    @GetMapping("/categories")
    public List<CategoryResponse> getCategories() {
        return publicCatalogService.getActiveCategories();
    }

    @GetMapping("/products")
    public PageResponse<ProductResponse> getProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Boolean available,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return publicCatalogService.getProducts(
                search,
                categoryId,
                available,
                minPrice,
                maxPrice,
                sortBy,
                sortDirection,
                PaginationUtils.normalizePage(page),
                PaginationUtils.normalizeSize(size)
        );
    }

    @GetMapping("/products/featured")
    public List<ProductResponse> getFeaturedProducts() {
        return publicCatalogService.getFeaturedProducts();
    }

    @GetMapping("/products/{slug}")
    public ProductResponse getProductBySlug(@PathVariable String slug) {
        return publicCatalogService.getProductBySlug(slug);
    }
}
