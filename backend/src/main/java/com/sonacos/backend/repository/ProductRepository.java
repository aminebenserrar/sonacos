package com.sonacos.backend.repository;

import com.sonacos.backend.entity.Product;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    Optional<Product> findBySlugAndActiveTrue(String slug);
    Optional<Product> findByReferenceIgnoreCase(String reference);
    boolean existsByReferenceIgnoreCase(String reference);
    boolean existsByReferenceIgnoreCaseAndIdNot(String reference, Long id);
    boolean existsBySlugIgnoreCase(String slug);
    boolean existsBySlugIgnoreCaseAndIdNot(String slug, Long id);
    List<Product> findTop6ByActiveTrueAndFeaturedTrueOrderByCreatedAtDesc();
}
