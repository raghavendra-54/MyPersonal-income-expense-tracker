package com.finance.tracker;

import org.h2.tools.Server;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.context.annotation.Bean;


@SpringBootApplication
public class TrackerApplication {

    private static Server h2Server;

    public static void main(String[] args) {
        startH2Server();
        SpringApplication.run(TrackerApplication.class, args);
    }

    private static void startH2Server() {
            h2Server = Server.createTcpServer(
                "-tcp",
                "-tcpAllowOthers",
                "-tcpPort", "8080",
                "-baseDir", "./data", 
                "-ifNotExists"    
            ).start()
```
