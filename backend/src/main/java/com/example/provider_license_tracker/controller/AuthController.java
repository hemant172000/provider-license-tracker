package com.example.provider_license_tracker.controller;

import com.example.provider_license_tracker.model.AppUser;
import com.example.provider_license_tracker.repository.UserRepository;
import com.example.provider_license_tracker.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/auth")
public class AuthController {
    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthController(UserRepository userRepo, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public AppUser register(@RequestBody AppUser user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepo.save(user);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AppUser user) {
        // Find by username case-insensitively
        Optional<AppUser> existingUser = userRepo.findAll().stream()
                .filter(u -> u.getUsername().equalsIgnoreCase(user.getUsername()))
                .findFirst();

        if (existingUser.isPresent()) {
            AppUser dbUser = existingUser.get();
            if (passwordEncoder.matches(user.getPassword(), dbUser.getPassword())) {
                String token = jwtUtil.generateToken(dbUser.getUsername(), dbUser.getRole());
                return ResponseEntity.ok(Map.of(
                        "token", token,
                        "role", dbUser.getRole(),
                        "fullName", dbUser.getFullName() != null ? dbUser.getFullName() : dbUser.getUsername()
                ));
            }
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Invalid credentials"));
    }
}
