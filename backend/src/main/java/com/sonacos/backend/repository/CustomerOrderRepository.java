package com.sonacos.backend.repository;

import com.sonacos.backend.entity.CustomerOrder;
import com.sonacos.backend.entity.User;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, Long> {
    boolean existsByOrderNumber(String orderNumber);

    @EntityGraph(attributePaths = {"items", "items.product", "payment", "invoice"})
    List<CustomerOrder> findByClientOrderByCreatedAtDesc(User client);

    @Override
    @EntityGraph(attributePaths = {"client", "payment"})
    List<CustomerOrder> findAll(Sort sort);
}
