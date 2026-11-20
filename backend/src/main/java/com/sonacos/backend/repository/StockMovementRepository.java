package com.sonacos.backend.repository;

import com.sonacos.backend.entity.StockMovement;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {

    @Override
    @EntityGraph(attributePaths = {"product"})
    List<StockMovement> findAll(Sort sort);
}
