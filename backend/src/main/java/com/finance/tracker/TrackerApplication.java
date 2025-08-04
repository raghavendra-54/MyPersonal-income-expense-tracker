package com.finance.tracker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
// import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration; // This import is no longer needed

@SpringBootApplication // REMOVED (exclude = {SecurityAutoConfiguration.class})
public class TrackerApplication {
    public static void main(String[] args) {
        SpringApplication.run(TrackerApplication.class, args);
    }
}