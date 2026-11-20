package com.sonacos.backend.security;

import com.sonacos.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        if (username != null && username.chars().allMatch(Character::isDigit)) {
            return userRepository.findById(Long.valueOf(username))
                    .map(UserPrincipal::new)
                    .orElseThrow(() -> new UsernameNotFoundException("Utilisateur introuvable"));
        }

        return userRepository.findByEmailIgnoreCase(username)
                .map(UserPrincipal::new)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur introuvable"));
    }
}
