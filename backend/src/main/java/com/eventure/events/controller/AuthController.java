package com.eventure.events.controller;

import com.eventure.events.model.Users;
import com.eventure.events.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepo userRepository;

    @GetMapping("/login")
    public String login() {
        return "Please login with Google";
    }

    @GetMapping("/success")
    public ResponseEntity<?> success(@AuthenticationPrincipal OAuth2User oauth2User) {
        if (oauth2User != null) {
            // Check if user already exists
            Users existingUser = userRepository.findByEmail(oauth2User.getAttribute("email"))
                .orElse(new Users());

            // Update or set user information
            existingUser.setEmail(oauth2User.getAttribute("email"));
            existingUser.setFirstName(oauth2User.getAttribute("given_name"));
            existingUser.setLastName(oauth2User.getAttribute("family_name"));
            existingUser.setUsertype("USER"); // Default user type
            existingUser.setUserId(oauth2User.getAttribute("sub")); // Google's unique ID

            // Save user to database
            Users savedUser = userRepository.save(existingUser);
            
            return ResponseEntity.ok(savedUser);
        }
        return ResponseEntity.badRequest().body("Authentication failed");
    }

    @GetMapping("/user")
    public ResponseEntity<?> getUser(@AuthenticationPrincipal OAuth2User oauth2User) {
        if (oauth2User != null) {
            Users user = userRepository.findByEmail(oauth2User.getAttribute("email"))
                .orElse(null);
            if (user != null) {
                return ResponseEntity.ok(user);
            }
        }
        return ResponseEntity.badRequest().body("Not authenticated");
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok("Logged out successfully");
    }
} 