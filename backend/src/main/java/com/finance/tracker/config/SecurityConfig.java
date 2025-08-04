package com.finance.tracker.config;

import com.finance.tracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import java.io.IOException;
import java.util.Arrays;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;


@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final UserRepository userRepository;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return email -> userRepository.findByEmail(email)
                .map(user -> org.springframework.security.core.userdetails.User.withUsername(user.getEmail())
                        .password(user.getPassword())
                        .roles("USER")
                        .build())
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService());
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public OncePerRequestFilter authenticationTokenFilter() {
        return new OncePerRequestFilter() {
            @Override
            protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
                // System.out.println("SecurityConfig: X-Auth-Token Filter processing request."); // DEBUG
                String authToken = request.getHeader("X-Auth-Token");
                if (authToken != null && !authToken.isEmpty()) {
                    try {
                        // System.out.println("SecurityConfig: Found X-Auth-Token: " + authToken); // DEBUG
                        // Use the email part of the token as username for UserDetailsService
                        String userEmail = authToken.split("\\|")[0]; 
                        var userDetails = userDetailsService().loadUserByUsername(userEmail);
                        var authentication = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        // System.out.println("SecurityConfig: Successfully authenticated user: " + userEmail); // DEBUG
                    } catch (UsernameNotFoundException e) {
                        System.err.println("SecurityConfig: User not found from token: " + e.getMessage()); // DEBUG
                        SecurityContextHolder.clearContext();
                    } catch (Exception e) {
                        System.err.println("SecurityConfig: Error processing X-Auth-Token: " + e.getMessage()); // DEBUG
                        SecurityContextHolder.clearContext();
                    }
                } else {
                    // System.out.println("SecurityConfig: No X-Auth-Token found or it's empty."); // DEBUG
                }
                filterChain.doFilter(request, response);
            }
        };
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers("/favicon.ico").permitAll()
                .requestMatchers("/api/auth/**").permitAll() // Allow all /api/auth endpoints
                .requestMatchers("/", "/index.html", "/app.js", "/css/**", "/js/**", "/auth/**", "/assets/**").permitAll() // Allow static frontend resources
                .requestMatchers("/h2-console/**").permitAll() // Allow H2 console
                .anyRequest().authenticated() // All other requests require authentication
            )
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // Use stateless sessions
            .httpBasic(AbstractHttpConfigurer::disable) // Disable HTTP Basic auth
            .formLogin(AbstractHttpConfigurer::disable) // Disable form login
            .addFilterBefore(authenticationTokenFilter(), org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class); // Add custom token filter

        http.headers(headers -> headers.frameOptions(frameOptions -> frameOptions.sameOrigin())); // For H2 console

        return http.build();
    }

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        // Ensure allowed origin patterns correctly cover Codespaces and localhost development environments
        config.setAllowedOriginPatterns(Arrays.asList("http://localhost:*", "http://127.0.0.1:*", "https://*.github.dev", "https://*.codespaces.githubusercontent.com"));
        config.setAllowedHeaders(Arrays.asList(HttpHeaders.AUTHORIZATION, HttpHeaders.CONTENT_TYPE, "X-Auth-Token"));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setMaxAge(3600L);
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}