package com.agrichain;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;

@SpringBootApplication
public class AgrichainApplication {
    public static void main(String[] args) {
        SpringApplication.run(AgrichainApplication.class, args);
    }

    @Bean
    ApplicationRunner agentDebugStartupRunner() {
        return args -> {
            // #region agent log
            try {
                Files.writeString(
                        Path.of("debug-4c25e8.log"),
                        "{\"sessionId\":\"4c25e8\",\"runId\":\"pre-fix\",\"hypothesisId\":\"H0\",\"location\":\"AgrichainApplication.java:agentDebugStartupRunner\",\"message\":\"Spring Boot started ApplicationRunner\",\"data\":{\"appClass\":\"com.agrichain.AgrichainApplication\"},\"timestamp\":" + System.currentTimeMillis() + "}\n",
                        StandardOpenOption.CREATE, StandardOpenOption.WRITE, StandardOpenOption.APPEND
                );
            } catch (Exception ignored) {
            }
            // #endregion
        };
    }
}

