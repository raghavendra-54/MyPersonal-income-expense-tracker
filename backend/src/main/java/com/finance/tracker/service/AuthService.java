package com.finance.tracker.service;

import com.finance.tracker.dto.LoginRequest;
import com.finance.tracker.dto.RegisterRequest;
import com.finance.tracker.dto.AuthResponse;
import com.finance.tracker.model.User;
import com.finance.tracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PostConstruct
    public void init() {
        if (userRepository.count() == 0) {
            User defaultUser = new User();
            defaultUser.setFirstName("Default");
            defaultUser.setLastName("User");
            defaultUser.setEmail("default@example.com");
            defaultUser.setPhone("1234567890");
            defaultUser.setPosition("Employee");
            defaultUser.setAddress("Default Address");
            defaultUser.setPassword(passwordEncoder.encode("password"));
            userRepository.save(defaultUser);
            System.out.println("Default user 'default@example.com' created with password 'password'.");
        }
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("User with this email already exists");
        }

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Passwords do not match");
        }

        User newUser = new User();
        newUser.setFirstName(request.getFirstName());
        newUser.setLastName(request.getLastName());
        newUser.setEmail(request.getEmail());
        newUser.setPhone(request.getPhone());
        newUser.setPosition(request.getPosition());
        newUser.setAddress(request.getAddress());
        newUser.setPassword(passwordEncoder.encode(request.getPassword()));

        userRepository.save(newUser);

        return new AuthResponse("Registration successful. Please log in.", null, null, null, null); 
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        String token = user.getEmail() + "|" + System.currentTimeMillis();
        
        return new AuthResponse("Login successful", token, user.getId(), user.getFirstName(), user.getLastName()); 
    }
        
    public AuthResponse forgotPassword(String email, String newPassword, String confirmPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User with this email not found"));

        if (!newPassword.equals(confirmPassword)) {
            throw new RuntimeException("New passwords do not match");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return new AuthResponse("Password reset successful. Please log in with your new password.", null, null, null, null);
    }
}