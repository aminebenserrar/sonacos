package com.sonacos.backend.service.impl;

import com.sonacos.backend.entity.User;
import com.sonacos.backend.exception.BusinessException;
import com.sonacos.backend.repository.UserRepository;
import com.sonacos.backend.security.UserPrincipal;
import com.sonacos.backend.service.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CurrentUserServiceImpl implements CurrentUserService {

    private final UserRepository userRepository;

    @Override
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            throw new BusinessException("Utilisateur non authentifie");
        }

        return userRepository.findById(principal.getId())
                .orElseThrow(() -> new BusinessException("Utilisateur introuvable"));
    }
}
