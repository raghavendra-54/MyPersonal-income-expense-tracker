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

    @GetMapping("/{id}") 
    public ResponseEntity<User> getUserById(@PathVariable Long id) { 
        User user = userService.getUserById(id); 
        user.setPassword(null); 
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateProfile(@PathVariable Long id, @Valid @RequestBody User updatedUser) {
        User user = userService.updateProfile(id, updatedUser);
        user.setPassword(null); 
        return ResponseEntity.ok(user);
    }
}