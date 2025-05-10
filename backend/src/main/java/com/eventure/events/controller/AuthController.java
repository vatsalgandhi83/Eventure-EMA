package com.eventure.events.controller;

import com.eventure.events.model.Users;
import com.eventure.events.repository.UserRepo;
import com.eventure.events.security.JwtTokenProvider;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private UserRepo userRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthenticationManager authenticationManager, JwtTokenProvider tokenProvider, PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                loginRequest.getUsername(),
                loginRequest.getPassword()
            )
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);
        return ResponseEntity.ok(new JwtResponse(jwt));
    }

    @GetMapping("/success")
    public ResponseEntity<?> oauth2Success(@AuthenticationPrincipal OAuth2User oauth2User) {
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
            // Create authentication token for OAuth2 user
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                oauth2User.getAttribute("email"),
                null,
                oauth2User.getAuthorities()
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = tokenProvider.generateToken(authentication);
            return ResponseEntity.ok(new JwtResponse(jwt));
        }
        return ResponseEntity.badRequest().body("OAuth2 authentication failed");
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

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody SignupRequest signupRequest) {
        if (userRepository.findByEmail(signupRequest.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email is already registered.");
        }
        Users user = Users.builder()
                .firstName(signupRequest.getFirstName())
                .lastName(signupRequest.getLastName())
                .email(signupRequest.getEmail())
                .userId(signupRequest.getUsername())
                .usertype(signupRequest.getRole())
                .password(passwordEncoder.encode(signupRequest.getPassword()))
                .build();
        // Optionally hash password and store (if you have a password field in Users)
        // user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
        userRepository.save(user);
        return ResponseEntity.ok("User registered successfully");
    }

    @Data
    public static class LoginRequest {
        private String username;
        private String password;
    }

    @Data
    public static class JwtResponse {
        private String token;
        private String type = "Bearer";
        public JwtResponse(String token) {
            this.token = token;
        }
    }

    @Data
    public static class SignupRequest {
        private String firstName;
        private String lastName;
        private String username;
        private String email;
        private String password;
        private String role;
    }
} 