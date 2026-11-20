package com.sonacos.backend.repository;

import com.sonacos.backend.entity.OperationHistory;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OperationHistoryRepository extends JpaRepository<OperationHistory, Long>, JpaSpecificationExecutor<OperationHistory> {
    boolean existsByActionTypeAndObjectIdentifier(String actionType, String objectIdentifier);
}
