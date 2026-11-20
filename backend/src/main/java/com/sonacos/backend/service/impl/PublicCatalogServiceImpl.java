package com.sonacos.backend.service.impl;

import com.sonacos.backend.dto.category.CategoryResponse;
import com.sonacos.backend.dto.common.PageResponse;
import com.sonacos.backend.dto.product.ProductResponse;
import com.sonacos.backend.entity.Category;
import com.sonacos.backend.entity.Product;
import com.sonacos.backend.exception.ResourceNotFoundException;
import com.sonacos.backend.mapper.CategoryMapper;
import com.sonacos.backend.mapper.ProductMapper;
import com.sonacos.backend.repository.CategoryRepository;
import com.sonacos.backend.repository.ProductRepository;
import com.sonacos.backend.service.PublicCatalogService;
import jakarta.persistence.criteria.Predicate;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PublicCatalogServiceImpl implements PublicCatalogService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final CategoryMapper categoryMapper;
    private final ProductMapper productMapper;

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getActiveCategories() {
        return categoryRepository.findAll().stream()
                .filter(Category::isActive)
                .map(categoryMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> getProducts(
            String search,
            Long categoryId,
            Boolean available,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String sortBy,
            String sortDirection,
            int page,
            int size
    ) {
        Sort.Direction direction = "desc".equalsIgnoreCase(sortDirection) ? Sort.Direction.DESC : Sort.Direction.ASC;
        String mappedSort = switch (sortBy == null ? "" : sortBy) {
            case "price" -> "price";
            case "date" -> "createdAt";
            default -> "name";
        };

        Page<Product> productPage = productRepository.findAll(buildSpecification(search, categoryId, available, minPrice, maxPrice),
                PageRequest.of(page, size, Sort.by(direction, mappedSort)));

        return new PageResponse<>(
                productPage.getContent().stream().map(productMapper::toResponse).toList(),
                productPage.getNumber(),
                productPage.getSize(),
                productPage.getTotalElements(),
                productPage.getTotalPages(),
                productPage.isFirst(),
                productPage.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductBySlug(String slug) {
        Product product = productRepository.findBySlugAndActiveTrue(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Produit introuvable"));
        return productMapper.toResponse(product);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getFeaturedProducts() {
        return productRepository.findTop6ByActiveTrueAndFeaturedTrueOrderByCreatedAtDesc().stream()
                .map(productMapper::toResponse)
                .toList();
    }

    private Specification<Product> buildSpecification(
            String search,
            Long categoryId,
            Boolean available,
            BigDecimal minPrice,
            BigDecimal maxPrice
    ) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(criteriaBuilder.isTrue(root.get("active")));

            if (search != null && !search.isBlank()) {
                String like = "%" + search.trim().toLowerCase() + "%";
                predicates.add(criteriaBuilder.or(
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), like),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("reference")), like)
                ));
            }

            if (categoryId != null) {
                predicates.add(criteriaBuilder.equal(root.get("category").get("id"), categoryId));
            }

            if (available != null && available) {
                predicates.add(criteriaBuilder.greaterThan(root.get("stockQuantity"), 0));
            }

            if (minPrice != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("price"), minPrice));
            }

            if (maxPrice != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("price"), maxPrice));
            }

            return criteriaBuilder.and(predicates.toArray(Predicate[]::new));
        };
    }
}
