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
        // First try to find by email
        Users user = userRepo.findByEmail(identifier)
            .orElseGet(() -> {
                // If not found by email, try to find by userId
                return userRepo.findByUserId(identifier)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found with email or username: " + identifier));
            });

        // Ensure the user has a MongoDB ID
        if (user.getId() == null) {
            throw new UsernameNotFoundException("User found but missing MongoDB ID");
        }

        return new UserDetailsImpl(user);
    }
} 