package com.sonacos.backend.repository;

import com.sonacos.backend.entity.ValidationOperation;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ValidationOperationRepository extends JpaRepository<ValidationOperation, Long> {
    boolean existsByTargetReferenceIgnoreCase(String targetReference);

    @Override
    @EntityGraph(attributePaths = {"requester", "requester.roles", "responsible", "responsible.roles"})
    List<ValidationOperation> findAll(Sort sort);
}
