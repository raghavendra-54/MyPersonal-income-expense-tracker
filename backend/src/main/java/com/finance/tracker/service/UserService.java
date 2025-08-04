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

    public User getUserById(Long id) { 
        return userRepository.findById(id) 
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id)); 
    }

    public User updateProfile(Long id, User updatedUser) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));

        existingUser.setFirstName(updatedUser.getFirstName());
        existingUser.setLastName(updatedUser.getLastName());
        existingUser.setEmail(updatedUser.getEmail()); 
        existingUser.setPhone(updatedUser.getPhone());
        existingUser.setPosition(updatedUser.getPosition());
        existingUser.setAddress(updatedUser.getAddress());

        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }

        return userRepository.save(existingUser);
    }
}