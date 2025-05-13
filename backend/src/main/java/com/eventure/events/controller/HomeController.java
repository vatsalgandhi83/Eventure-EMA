package com.eventure.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;


@RestController
public class HomeController {

    @GetMapping("/")
    public String home() {
        return "Eventure backend is running successfully on AWS!";
    }

    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("Eventure backend is up!");
    }
}
