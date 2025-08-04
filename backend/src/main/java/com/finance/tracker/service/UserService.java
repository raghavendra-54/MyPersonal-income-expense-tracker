package com.finance.tracker.service;

import com.finance.tracker.model.User;
import com.finance.tracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // Method to get user by ID (for profile lookup by frontend using userId)
    public User getUserById(Long id) { 
        return userRepository.findById(id) 
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id)); 
    }

    // Method to update user profile
    public User updateProfile(Long id, User updatedUser) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));

        existingUser.setFirstName(updatedUser.getFirstName());
        existingUser.setLastName(updatedUser.getLastName());
        existingUser.setEmail(updatedUser.getEmail()); // Email can be updated
        existingUser.setPhone(updatedUser.getPhone());
        existingUser.setPosition(updatedUser.getPosition());
        existingUser.setAddress(updatedUser.getAddress());

        // Only update password if a new one is provided and not empty
        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }

        return userRepository.save(existingUser);
    }
}