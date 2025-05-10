package com.eventure.events.dto;

import com.eventure.events.model.Users;

public class AuthResponse {
    private String token;
    private Users user;

    public AuthResponse(String token, Users user) {
        this.token = token;
        this.user = user;
    }

    // Getters
    public String getToken() { return token; }
    public Users getUser() { return user; }
}

