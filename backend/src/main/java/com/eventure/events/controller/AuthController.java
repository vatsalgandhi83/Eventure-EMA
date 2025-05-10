package com.eventure.events.controller;

import com.eventure.events.config.JwtUtil;
import com.eventure.events.dto.AuthRequest;
import com.eventure.events.dto.AuthResponse;
import com.eventure.events.exception.MyException;
import com.eventure.events.model.Users;
import com.eventure.events.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepo userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        Users user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new MyException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new MyException("Invalid password");
        }

        String jwt = jwtUtil.generateToken(request.getEmail());
        return ResponseEntity.ok(new AuthResponse(jwt, user));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> register(@RequestBody Users user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new MyException("User already exists with email: " + user.getEmail());
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
        return ResponseEntity.ok("User registered successfully");
    }
}
