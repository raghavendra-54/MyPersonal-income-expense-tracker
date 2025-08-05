package com.finance.tracker.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns(
                    "http://localhost:*", 
                    "http://127.0.0.1:*", 
                    "https://*.github.dev", 
                    "https://*.codespaces.githubusercontent.com",
                    "https://mypersonal-income-expense-tracker.com",
                    "https://mypersonal-income-expense-tracker.onrender.com"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowCredentials(true)
                .maxAge(3600); 
    }
}