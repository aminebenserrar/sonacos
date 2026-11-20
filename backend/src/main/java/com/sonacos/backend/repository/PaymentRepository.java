package com.sonacos.backend.repository;

import com.sonacos.backend.entity.Payment;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    boolean existsByPaymentReference(String paymentReference);

    @Override
    @EntityGraph(attributePaths = {"order", "order.client"})
    List<Payment> findAll(Sort sort);
}
