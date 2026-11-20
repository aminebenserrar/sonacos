package com.sonacos.backend.repository;

import com.sonacos.backend.entity.Role;
import com.sonacos.backend.enums.RoleCode;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByCode(RoleCode code);
}
