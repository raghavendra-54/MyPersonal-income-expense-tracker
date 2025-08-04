package com.finance.tracker.controller;

import com.finance.tracker.dto.AuthResponse;
import com.finance.tracker.dto.LoginRequest;
import com.finance.tracker.dto.RegisterRequest;
import com.finance.tracker.dto.ResetPasswordRequest; 
import com.finance.tracker.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> registerUser(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> loginUser(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok()
            .header("X-Auth-Token", response.getToken()) 
            .body(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<AuthResponse> forgotPassword(@Valid @RequestBody ResetPasswordRequest request) {
        AuthResponse response = authService.forgotPassword(request.getEmail(), request.getNewPassword(), request.getConfirmPassword());
        return ResponseEntity.ok(response);
    }

    // This endpoint is used by app.js for session verification, but no longer makes a user profile lookup
    @GetMapping("/verify") // Corrected path to be relative to @RequestMapping("/api/auth")
    public ResponseEntity<Void> verifyToken(@RequestHeader("X-Auth-Token") String token) {
        // Simple verification logic - actual validation happens in SecurityConfig's filter
        // If the request reaches here, it means the token was processed by SecurityConfig
        // and the user is authenticated (SecurityContextHolder contains userDetails).
        // If the token was invalid or missing, SecurityConfig would have prevented access
        // or set the authentication as null.
        if (token == null || token.isEmpty()) { // No need for token.contains("|") here
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok().build();
    }
}