package com.example.provider_license_tracker.controller;

import com.example.provider_license_tracker.model.AppUser;
import com.example.provider_license_tracker.model.UserActivity;
import com.example.provider_license_tracker.model.UserDailySummary;
import com.example.provider_license_tracker.repository.UserRepository;
import com.example.provider_license_tracker.service.UserActivityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/activity")
public class UserActivityController {

    @Autowired
    private UserActivityService userActivityService;

    @Autowired
    private UserRepository userRepository;

    // Update user's current activity status (called from frontend every minute)
    @PostMapping("/update")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEADER', 'TEAM_MEMBER')")
    public ResponseEntity<?> updateActivity(@RequestBody Map<String, String> request, Principal principal) {
        try {
            AppUser user = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String status = request.get("status");
            if (status == null || status.isEmpty()) {
                status = "ACTIVE";
            }

            String sessionId = userActivityService.getOrCreateSessionId(user.getId());
            userActivityService.recordActivity(user.getId(), status, sessionId);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "status", status,
                    "timestamp", LocalDate.now().toString()
            ));

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Get my activity for today
    @GetMapping("/my-today")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEADER', 'TEAM_MEMBER')")
    public ResponseEntity<?> getMyTodayActivity(Principal principal) {
        try {
            AppUser user = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Map<String, Object> result = userActivityService.getActivityTimeline(user.getId(), LocalDate.now());

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Get my activity for a specific date
    @GetMapping("/my-activity")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEADER', 'TEAM_MEMBER')")
    public ResponseEntity<?> getMyActivity(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
                                           Principal principal) {
        try {
            AppUser user = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Map<String, Object> result = userActivityService.getActivityTimeline(user.getId(), date);

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Get all users activity for a date (Admin only)
    @GetMapping("/admin/all-users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsersActivity(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            List<UserDailySummary> summaries = userActivityService.getAllUsersSummary(date);

            // Enrich with user names
            List<Map<String, Object>> enriched = summaries.stream().map(summary -> {
                AppUser user = userRepository.findById(summary.getUserId()).orElse(null);
                Map<String, Object> item = new HashMap<>();
                item.put("userId", summary.getUserId());
                item.put("userName", user != null ? user.getFullName() : "Unknown");
                item.put("userRole", user != null ? user.getRole() : "Unknown");
                item.put("activeMinutes", summary.getTotalActiveMinutes());
                item.put("idleMinutes", summary.getTotalIdleMinutes());
                item.put("awayMinutes", summary.getTotalAwayMinutes());
                item.put("breakMinutes", summary.getTotalBreakMinutes());
                item.put("totalMinutes", summary.getTotalActiveMinutes() + summary.getTotalIdleMinutes() +
                        summary.getTotalAwayMinutes() + summary.getTotalBreakMinutes());
                item.put("remainingMinutes", userActivityService.getRemainingMinutes(summary.getUserId(), date));
                return item;
            }).toList();

            return ResponseEntity.ok(Map.of(
                    "date", date,
                    "users", enriched,
                    "totalUsers", enriched.size()
            ));

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Get team members activity (Team Leader only)
    @GetMapping("/leader/team")
    @PreAuthorize("hasRole('TEAM_LEADER')")
    public ResponseEntity<?> getTeamMembersActivity(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
                                                    Principal principal) {
        try {
            AppUser teamLeader = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("Team Leader not found"));

            // Get team members reporting to this leader
            List<AppUser> teamMembers = userRepository.findByReportsTo(teamLeader.getId());
            List<Long> teamMemberIds = teamMembers.stream().map(AppUser::getId).toList();

            List<UserDailySummary> summaries = userActivityService.getTeamMembersSummary(teamMemberIds, date);

            List<Map<String, Object>> enriched = summaries.stream().map(summary -> {
                AppUser member = teamMembers.stream()
                        .filter(m -> m.getId().equals(summary.getUserId()))
                        .findFirst()
                        .orElse(null);
                Map<String, Object> item = new HashMap<>();
                item.put("userId", summary.getUserId());
                item.put("userName", member != null ? member.getFullName() : "Unknown");
                item.put("activeMinutes", summary.getTotalActiveMinutes());
                item.put("idleMinutes", summary.getTotalIdleMinutes());
                item.put("awayMinutes", summary.getTotalAwayMinutes());
                item.put("breakMinutes", summary.getTotalBreakMinutes());
                item.put("remainingMinutes", userActivityService.getRemainingMinutes(summary.getUserId(), date));
                return item;
            }).toList();

            return ResponseEntity.ok(Map.of(
                    "date", date,
                    "teamMembers", enriched,
                    "totalTeamMembers", enriched.size()
            ));

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Get activity timeline for a specific user (Admin only)
    @GetMapping("/admin/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getUserActivityTimeline(@PathVariable Long userId,
                                                     @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            Map<String, Object> result = userActivityService.getActivityTimeline(userId, date);

            AppUser user = userRepository.findById(userId).orElse(null);
            result.put("userName", user != null ? user.getFullName() : "Unknown");
            result.put("userRole", user != null ? user.getRole() : "Unknown");

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }
}