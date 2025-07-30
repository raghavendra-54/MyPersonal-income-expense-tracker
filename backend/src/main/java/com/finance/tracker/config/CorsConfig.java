package com.finance.tracker.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost", "http://127.0.0.1") // Target Apache's common origins
                .allowedMethods("GET", "POST", "PUT", "DELETE") // Ensure all necessary methods are allowed
                .allowCredentials(true); // Allow sending cookies, authorization headers etc.
    }
}