package com.example.provider_license_tracker.controller;

import com.example.provider_license_tracker.model.*;
import com.example.provider_license_tracker.repository.ProviderRepository;
import com.example.provider_license_tracker.repository.TaskRepository;
import com.example.provider_license_tracker.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/team-leader")
@PreAuthorize("hasRole('TEAM_LEADER')")
public class TeamLeaderController {

    private final UserRepository userRepository;
    private final ProviderRepository providerRepository;
    private final TaskRepository taskRepository;
    private final PasswordEncoder passwordEncoder;

    public TeamLeaderController(UserRepository userRepository,
                                ProviderRepository providerRepository,
                                TaskRepository taskRepository,
                                PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.providerRepository = providerRepository;
        this.taskRepository = taskRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Get Team Leader Profile
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Principal principal) {
        try {
            AppUser user = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Map<String, Object> profile = new HashMap<>();
            profile.put("fullName", user.getFullName());
            profile.put("email", user.getEmail());
            profile.put("phoneNumber", user.getPhoneNumber());
            profile.put("leadingDepartment", user.getLeadingDepartment());
            profile.put("role", user.getRole());

            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Get all providers under this Team Leader
    @GetMapping("/providers")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEADER')")
    public ResponseEntity<?> getProviders(Principal principal) {
        try {
            AppUser teamLeader = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("Team Leader not found"));

            // Get all providers (or filter by team)
            List<Provider> providers = providerRepository.findAll();

            List<Map<String, Object>> enrichedProviders = new ArrayList<>();

            for (Provider provider : providers) {
                Map<String, Object> p = new HashMap<>();
                p.put("id", provider.getId());
                p.put("name", provider.getName());
                p.put("email", provider.getEmail());
                p.put("phoneNumber", provider.getPhoneNumber());
                p.put("specialty", provider.getSpecialty());
                p.put("licenseNumber", provider.getLicenseNumber());
                p.put("licenseExpiry", provider.getLicenseExpiry());
                p.put("npiNumber", provider.getNpiNumber());
                p.put("groupId", provider.getGroupId());

                // CRITICAL: Add the assigned team member ID
                if (provider.getAssignedTeamMember() != null) {
                    p.put("assignedTeamMemberId", provider.getAssignedTeamMember().getId());
                    p.put("assignedTeamMemberName", provider.getAssignedTeamMember().getFullName());
                } else {
                    p.put("assignedTeamMemberId", null);
                    p.put("assignedTeamMemberName", null);
                }

                enrichedProviders.add(p);
            }

            return ResponseEntity.ok(Map.of(
                    "providers", enrichedProviders,
                    "count", enrichedProviders.size()
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Get team members under this team leader
    @GetMapping("/team-members")
    public ResponseEntity<?> getTeamMembers(Principal principal) {
        try {
            AppUser teamLeader = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("Team Leader not found"));

            List<AppUser> teamMembers = userRepository.findByReportsTo(teamLeader.getId());

            List<Map<String, Object>> enrichedMembers = teamMembers.stream().map(member -> {
                Map<String, Object> m = new HashMap<>();
                m.put("id", member.getId());
                m.put("fullName", member.getFullName());
                m.put("email", member.getEmail());
                m.put("phoneNumber", member.getPhoneNumber());
                m.put("department", member.getDepartment());
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

    // ==================== GET ASSIGNABLE USERS ====================

    @GetMapping("/assignable-users")
    @PreAuthorize("hasRole('TEAM_LEADER')")
    public ResponseEntity<?> getAssignableUsersForTeamLeader(Principal principal) {
        try {
            AppUser currentLeader = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("Team Leader not found"));

            // Get team members under this leader
            List<AppUser> teamMembers = userRepository.findByReportsTo(currentLeader.getId());

            // Get all Team Leaders (for cross-assignment between leaders)
            List<AppUser> allTeamLeaders = userRepository.findAllTeamLeaders();

            List<Map<String, Object>> assignableUsers = new ArrayList<>();

            // Add team members
            for (AppUser user : teamMembers) {
                Map<String, Object> u = new HashMap<>();
                u.put("id", user.getId());
                u.put("fullName", user.getFullName());
                u.put("email", user.getEmail());
                u.put("role", user.getRole());
                u.put("roleLabel", "Team Member");
                u.put("department", user.getDepartment());
                assignableUsers.add(u);
            }

            // Add other Team Leaders (excluding self)
            for (AppUser user : allTeamLeaders) {
                if (!user.getId().equals(currentLeader.getId())) {
                    Map<String, Object> u = new HashMap<>();
                    u.put("id", user.getId());
                    u.put("fullName", user.getFullName());
                    u.put("email", user.getEmail());
                    u.put("role", user.getRole());
                    u.put("roleLabel", "Team Leader");
                    u.put("leadingDepartment", user.getLeadingDepartment());
                    assignableUsers.add(u);
                }
            }

            return ResponseEntity.ok(Map.of(
                    "users", assignableUsers,
                    "total", assignableUsers.size()
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== ADD PROVIDER ENDPOINT ====================

    @PostMapping("/add-provider")
    @PreAuthorize("hasRole('TEAM_LEADER')")
    public ResponseEntity<?> addProviderByTeamLeader(@RequestBody Map<String, Object> request,
                                                     Principal principal) {
        try {
            // Get the team leader
            AppUser teamLeader = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("Team Leader not found"));

            // Only Credentialing Team Leaders can add providers
            if (!"Credentialing".equals(teamLeader.getLeadingDepartment())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Only Credentialing Team Leaders can add providers"));
            }

            // Extract data from request
            String username = (String) request.get("username");
            String password = (String) request.get("password");
            String fullName = (String) request.get("fullName");
            String email = (String) request.get("email");
            String phoneNumber = (String) request.get("phoneNumber");
            String specialty = (String) request.get("specialty");
            String npiNumber = (String) request.get("npiNumber");
            String licenseNumber = (String) request.get("licenseNumber");
            String licenseExpiryStr = (String) request.get("licenseExpiry");

            // Validate required fields
            if (username == null || username.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Username is required"));
            }
            if (password == null || password.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Password is required"));
            }
            if (fullName == null || fullName.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Full name is required"));
            }

            // Check if username already exists
            if (userRepository.findByUsername(username).isPresent()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Username already exists"));
            }

            // Create the AppUser (for authentication)
            AppUser providerUser = new AppUser();
            providerUser.setUsername(username);
            providerUser.setPassword(passwordEncoder.encode(password));
            providerUser.setFullName(fullName);
            providerUser.setEmail(email);
            providerUser.setPhoneNumber(phoneNumber);
            providerUser.setRole("PROVIDER");
            providerUser.setSpecialty(specialty);
            providerUser.setStatus("Active");
            providerUser.setCreatedAt(LocalDateTime.now());

            AppUser savedUser = userRepository.save(providerUser);

            // Create the Provider entity (for provider details)
            Provider provider = new Provider();
            provider.setAppUserId(savedUser.getId());
            provider.setName(fullName);
            provider.setEmail(email);
            provider.setPhoneNumber(phoneNumber);
            provider.setSpecialty(specialty);
            provider.setNpiNumber(npiNumber);
            provider.setLicenseNumber(licenseNumber);

            // Parse license expiry date if provided
            if (licenseExpiryStr != null && !licenseExpiryStr.isEmpty()) {
                try {
                    LocalDate expiryDate = LocalDate.parse(licenseExpiryStr);
                    provider.setLicenseExpiry(expiryDate);
                } catch (Exception e) {
                    // Ignore parsing error
                }
            }

            providerRepository.save(provider);

            return ResponseEntity.ok(Map.of(
                    "message", "Provider created successfully",
                    "providerId", provider.getId(),
                    "userId", savedUser.getId(),
                    "username", savedUser.getUsername(),
                    "fullName", savedUser.getFullName()
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Add comment to task
    @PostMapping("/add-comment/{taskId}")
    @PreAuthorize("hasRole('TEAM_LEADER')")
    public ResponseEntity<?> addComment(@PathVariable Long taskId,
                                        @RequestBody Map<String, String> request,
                                        Principal principal) {
        try {
            AppUser teamLeader = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("Team Leader not found"));

            Task task = taskRepository.findById(taskId)
                    .orElseThrow(() -> new RuntimeException("Task not found"));

            String commentText = request.get("comment");
            if (commentText == null || commentText.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Comment cannot be empty"));
            }

            // Create new comment
            TaskComment comment = new TaskComment();
            comment.setTask(task);
            comment.setUser(teamLeader);
            comment.setComment(commentText);
            comment.setCreatedAt(LocalDateTime.now());

            task.getComments().add(comment);
            task.setUpdatedAt(LocalDateTime.now());

            Task savedTask = taskRepository.save(task);

            // Safely get the last comment (just added)
            TaskComment savedComment = savedTask.getComments().isEmpty() ? comment :
                    savedTask.getComments().get(savedTask.getComments().size() - 1);

            // Build response with null-safe values
            Map<String, Object> commentMap = new HashMap<>();
            commentMap.put("id", savedComment.getId());
            commentMap.put("comment", savedComment.getComment() != null ? savedComment.getComment() : "");
            commentMap.put("userName", teamLeader.getFullName() != null ? teamLeader.getFullName() : "Unknown");
            commentMap.put("createdAt", savedComment.getCreatedAt() != null ? savedComment.getCreatedAt().toString() : "");

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Comment added successfully");
            response.put("taskId", taskId);
            response.put("comment", commentMap);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Log time on task
    @PostMapping("/log-time/{taskId}")
    @PreAuthorize("hasRole('TEAM_LEADER')")
    public ResponseEntity<?> logTime(@PathVariable Long taskId,
                                     @RequestBody Map<String, Object> request,
                                     Principal principal) {
        try {
            AppUser teamLeader = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("Team Leader not found"));

            Task task = taskRepository.findById(taskId)
                    .orElseThrow(() -> new RuntimeException("Task not found"));

            Integer hoursSpent = (Integer) request.get("hoursSpent");
            if (hoursSpent == null || hoursSpent <= 0) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Valid hours spent is required"));
            }

            String description = (String) request.get("description");

            // Create time log
            TaskTimeLog timeLog = new TaskTimeLog();
            timeLog.setTask(task);
            timeLog.setUser(teamLeader);
            timeLog.setHoursSpent(hoursSpent);
            timeLog.setDescription(description != null ? description : "");
            timeLog.setLoggedAt(LocalDateTime.now());

            task.getTimeLogs().add(timeLog);
            task.setUpdatedAt(LocalDateTime.now());

            taskRepository.save(task);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Time logged successfully");
            response.put("taskId", taskId);
            response.put("hoursSpent", hoursSpent);
            response.put("loggedAt", timeLog.getLoggedAt().toString());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Assign task to team member
    @PostMapping("/assign-task")
    @PreAuthorize("hasRole('TEAM_LEADER')")
    public ResponseEntity<?> assignTask(@RequestBody Map<String, Object> taskData, Principal principal) {
        try {
            System.out.println("Received task data: " + taskData);

            AppUser teamLeader = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("Team Leader not found"));

            Object teamMemberIdObj = taskData.get("teamMemberId");
            if (teamMemberIdObj == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "teamMemberId is required"));
            }

            Long teamMemberId = Long.valueOf(teamMemberIdObj.toString());
            String title = (String) taskData.get("title");

            if (title == null || title.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Task title is required"));
            }

            AppUser teamMember = userRepository.findById(teamMemberId)
                    .orElseThrow(() -> new RuntimeException("Team member not found with id: " + teamMemberId));

            Task task = new Task();
            task.setTitle(title);
            task.setDescription((String) taskData.get("description"));
            task.setPriority((String) taskData.get("priority"));
            task.setStatus(TaskStatus.TODO);
            task.setAssignedTo(teamMember);
            task.setAssignedBy(teamLeader);

            // Fix: Use LocalDate, not LocalDateTime
            if (taskData.get("dueDate") != null && !taskData.get("dueDate").toString().isEmpty()) {
                String dateStr = taskData.get("dueDate").toString();
                LocalDateTime dueDateTime = LocalDateTime.parse(dateStr + "T00:00:00");
                task.setDueDate(dueDateTime);
            }

            if (taskData.get("relatedProviderId") != null) {
                task.setRelatedProviderId(Long.valueOf(taskData.get("relatedProviderId").toString()));
            }

            task.setCreatedAt(LocalDateTime.now());

            Task savedTask = taskRepository.save(task);

            return ResponseEntity.ok(Map.of(
                    "message", "Task assigned successfully",
                    "taskId", savedTask.getId()
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Assign provider to team member
    @PostMapping("/assign-provider")
    @PreAuthorize("hasRole('TEAM_LEADER')")
    public ResponseEntity<?> assignProviderToTeamMember(
            @RequestParam Long providerId,
            @RequestParam Long teamMemberId,
            Principal principal) {
        try {
            AppUser teamLeader = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("Team Leader not found"));

            // Verify teamMember is under this team leader
            List<AppUser> teamMembers = userRepository.findByReportsTo(teamLeader.getId());
            boolean isValidTeamMember = teamMembers.stream().anyMatch(tm -> tm.getId().equals(teamMemberId));

            if (!isValidTeamMember) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Team member not under your supervision"));
            }

            // Assign provider to team member
            Provider provider = providerRepository.findById(providerId)
                    .orElseThrow(() -> new RuntimeException("Provider not found"));

            AppUser teamMember = userRepository.findById(teamMemberId)
                    .orElseThrow(() -> new RuntimeException("Team member not found"));

            provider.setAssignedTeamMember(teamMember);
            providerRepository.save(provider);

            return ResponseEntity.ok(Map.of("message", "Provider assigned successfully"));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Get tasks assigned to the team leader
    @GetMapping("/my-tasks")
    public ResponseEntity<?> getMyTasks(Principal principal) {
        try {
            AppUser teamLeader = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<Task> tasks = taskRepository.findByAssignedToOrderByDueDateAsc(teamLeader);

            List<Map<String, Object>> enrichedTasks = tasks.stream().map(task -> {
                Map<String, Object> t = new HashMap<>();
                t.put("id", task.getId());
                t.put("title", task.getTitle());
                t.put("description", task.getDescription());
                t.put("status", task.getStatus().toString());
                t.put("priority", task.getPriority());
                t.put("dueDate", task.getDueDate());
                t.put("createdAt", task.getCreatedAt());
                if (task.getAssignedBy() != null) {
                    t.put("assignedBy", task.getAssignedBy().getFullName());
                }
                return t;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(Map.of(
                    "tasks", enrichedTasks,
                    "total", enrichedTasks.size()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Get team tasks (tasks assigned to team members)
    @GetMapping("/team-tasks")
    public ResponseEntity<?> getTeamTasks(Principal principal) {
        try {
            AppUser teamLeader = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("Team Leader not found"));

            List<AppUser> teamMembers = userRepository.findByReportsTo(teamLeader.getId());

            List<Task> allTeamTasks = taskRepository.findByAssignedToIn(teamMembers);

            List<Map<String, Object>> enrichedTasks = allTeamTasks.stream().map(task -> {
                Map<String, Object> t = new HashMap<>();
                t.put("id", task.getId());
                t.put("title", task.getTitle());
                t.put("description", task.getDescription());
                t.put("status", task.getStatus().toString());
                t.put("priority", task.getPriority());
                t.put("dueDate", task.getDueDate());
                if (task.getAssignedTo() != null) {
                    t.put("assignedToName", task.getAssignedTo().getFullName());
                    t.put("assignedToId", task.getAssignedTo().getId());
                }
                return t;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(Map.of(
                    "tasks", enrichedTasks,
                    "totalTasks", allTeamTasks.size()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Update task status
    @PutMapping("/update-task-status/{taskId}")
    @PreAuthorize("hasRole('TEAM_LEADER')")
    public ResponseEntity<?> updateTaskStatus(@PathVariable Long taskId,
                                              @RequestParam String status,
                                              Principal principal) {
        try {
            Task task = taskRepository.findById(taskId)
                    .orElseThrow(() -> new RuntimeException("Task not found"));

            TaskStatus newStatus = TaskStatus.valueOf(status.toUpperCase());
            task.setStatus(newStatus);
            task.setUpdatedAt(LocalDateTime.now());

            taskRepository.save(task);

            return ResponseEntity.ok(Map.of(
                    "message", "Task status updated successfully",
                    "taskId", taskId,
                    "newStatus", newStatus.toString()
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}