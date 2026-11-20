package com.sonacos.backend.repository;

import com.sonacos.backend.entity.Invoice;
import com.sonacos.backend.entity.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    boolean existsByInvoiceNumber(String invoiceNumber);

    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);

    @EntityGraph(attributePaths = {"order"})
    List<Invoice> findByOrderClientOrderByGeneratedAtDesc(User client);

    @EntityGraph(attributePaths = {"order", "order.client", "order.items"})
    Optional<Invoice> findDetailedById(Long id);

    @Override
    @EntityGraph(attributePaths = {"order", "order.client", "archivedBy"})
    List<Invoice> findAll(Sort sort);
}
