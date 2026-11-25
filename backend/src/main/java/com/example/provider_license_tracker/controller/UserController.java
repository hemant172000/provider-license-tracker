package com.example.provider_license_tracker.controller;

import com.example.provider_license_tracker.model.AppUser;
import com.example.provider_license_tracker.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Get current user's profile
    @GetMapping("/my-profile")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEADER', 'TEAM_MEMBER', 'PROVIDER')")
    public ResponseEntity<?> getMyProfile(Principal principal) {
        try {
            AppUser user = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Map<String, Object> profile = new HashMap<>();
            profile.put("id", user.getId());
            profile.put("username", user.getUsername());
            profile.put("fullName", user.getFullName());
            profile.put("email", user.getEmail());
            profile.put("phoneNumber", user.getPhoneNumber());
            profile.put("role", user.getRole());
            profile.put("department", user.getDepartment());
            profile.put("leadingDepartment", user.getLeadingDepartment());
            profile.put("specialty", user.getSpecialty());
            profile.put("status", user.getStatus());
            profile.put("createdAt", user.getCreatedAt());

            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Get team members for a team leader
    @GetMapping("/my-team-members")
    @PreAuthorize("hasRole('TEAM_LEADER')")
    public ResponseEntity<?> getMyTeamMembers(Principal principal) {
        try {
            AppUser teamLeader = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("Team Leader not found"));

            // Find all team members who report to this team leader
            List<AppUser> teamMembers = userRepository.findByReportsTo(teamLeader.getId());

            // Enrich with additional info
            List<Map<String, Object>> enrichedMembers = teamMembers.stream().map(member -> {
                Map<String, Object> m = new HashMap<>();
                m.put("id", member.getId());
                m.put("fullName", member.getFullName());
                m.put("email", member.getEmail());
                m.put("phoneNumber", member.getPhoneNumber());
                m.put("department", member.getDepartment());
                m.put("status", member.getStatus());
                return m;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(Map.of(
                    "teamMembers", enrichedMembers,
                    "count", enrichedMembers.size()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Update user profile
    @PutMapping("/update-profile")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEADER', 'TEAM_MEMBER', 'PROVIDER')")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> updates, Principal principal) {
        try {
            AppUser user = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (updates.containsKey("fullName")) {
                user.setFullName(updates.get("fullName"));
            }
            if (updates.containsKey("phoneNumber")) {
                user.setPhoneNumber(updates.get("phoneNumber"));
            }
            if (updates.containsKey("email")) {
                user.setEmail(updates.get("email"));
            }

            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}