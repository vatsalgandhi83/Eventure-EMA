package com.eventure.events.Services;

import com.eventure.events.model.Users;
import com.eventure.events.repository.UserRepo;
import com.eventure.events.security.UserDetailsImpl;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepo userRepo;

    public CustomUserDetailsService(UserRepo userRepo) {
        this.userRepo = userRepo;
    }

    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        Users user = userRepo.findByEmail(identifier)
            .orElseGet(() -> userRepo.findByUserId(identifier)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email or username: " + identifier)));
        return new UserDetailsImpl(user);
    }
} 