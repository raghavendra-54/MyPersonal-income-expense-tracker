package com.finance.tracker.controller;

import com.finance.tracker.model.User;
import com.finance.tracker.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // Get user profile by ID
    @GetMapping("/{id}") 
    public ResponseEntity<User> getUserById(@PathVariable Long id) { 
        User user = userService.getUserById(id); 
        // IMPORTANT: Mask password before sending to frontend
        user.setPassword(null); 
        return ResponseEntity.ok(user);
    }

    // Update user profile by ID
    @PutMapping("/{id}")
    public ResponseEntity<User> updateProfile(@PathVariable Long id, @Valid @RequestBody User updatedUser) {
        User user = userService.updateProfile(id, updatedUser);
        // Mask password before sending to frontend
        user.setPassword(null); 
        return ResponseEntity.ok(user);
    }
}