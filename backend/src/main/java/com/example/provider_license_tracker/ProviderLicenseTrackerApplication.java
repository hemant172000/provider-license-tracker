package com.example.provider_license_tracker;

import com.example.provider_license_tracker.model.AppUser;
import com.example.provider_license_tracker.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class ProviderLicenseTrackerApplication {

    public static void main(String[] args) {
        SpringApplication.run(ProviderLicenseTrackerApplication.class, args);
    }

    // Seeds a default admin user on first run. Demo only: set ADMIN_PASSWORD to override.
    @Bean
    CommandLineRunner init(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.findByUsername("admin").isEmpty()) {
                String adminPassword = System.getenv().getOrDefault("ADMIN_PASSWORD", "admin123");
                AppUser admin = new AppUser();
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode(adminPassword));
                admin.setRole("ADMIN");
                userRepository.save(admin);
            }
        };
    }
}