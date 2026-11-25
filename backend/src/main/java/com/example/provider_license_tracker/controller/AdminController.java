package com.example.provider_license_tracker.controller;

import com.example.provider_license_tracker.model.*;
import com.example.provider_license_tracker.repository.ProviderRepository;
import com.example.provider_license_tracker.repository.TaskRepository;
import com.example.provider_license_tracker.repository.UserRepository;
import com.example.provider_license_tracker.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProviderRepository providerRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ProjectService projectService;

    // ==================== USER MANAGEMENT ====================

    // Get all users
    @GetMapping("/all-users")
    public ResponseEntity<List<Map<String, Object>>> getAllUsers(@RequestParam(required = false) String role) {
        List<AppUser> users;
        if (role != null && !role.equals("ALL")) {
            users = userRepository.findByRole(role);
        } else {
            users = userRepository.findAll();
        }

        List<Map<String, Object>> response = users.stream().map(user -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", user.getId());
            map.put("username", user.getUsername());
            map.put("fullName", user.getFullName());
            map.put("email", user.getEmail());
            map.put("phoneNumber", user.getPhoneNumber());
            map.put("role", user.getRole());
            map.put("department", user.getDepartment());
            map.put("leadingDepartment", user.getLeadingDepartment());
            map.put("specialty", user.getSpecialty());
            map.put("status", user.getStatus());
            map.put("createdAt", user.getCreatedAt());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    // Update user
    @PutMapping("/update-user/{userId}")
    public ResponseEntity<?> updateUser(@PathVariable Long userId, @RequestBody Map<String, Object> userData) {
        try {
            AppUser user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

            if (userData.containsKey("fullName")) {
                user.setFullName((String) userData.get("fullName"));
            }
            if (userData.containsKey("email")) {
                user.setEmail((String) userData.get("email"));
            }
            if (userData.containsKey("phoneNumber")) {
                user.setPhoneNumber((String) userData.get("phoneNumber"));
            }
            if (userData.containsKey("department")) {
                user.setDepartment((String) userData.get("department"));
            }
            if (userData.containsKey("leadingDepartment")) {
                user.setLeadingDepartment((String) userData.get("leadingDepartment"));
            }
            if (userData.containsKey("specialty")) {
                user.setSpecialty((String) userData.get("specialty"));
            }

            userRepository.save(user);

            if ("PROVIDER".equals(user.getRole())) {
                Optional<Provider> providerOpt = providerRepository.findByAppUserId(user.getId());
                if (providerOpt.isPresent()) {
                    Provider provider = providerOpt.get();
                    if (userData.containsKey("fullName")) {
                        provider.setName((String) userData.get("fullName"));
                    }
                    if (userData.containsKey("email")) {
                        provider.setEmail((String) userData.get("email"));
                    }
                    if (userData.containsKey("phoneNumber")) {
                        provider.setPhoneNumber((String) userData.get("phoneNumber"));
                    }
                    if (userData.containsKey("specialty")) {
                        provider.setSpecialty((String) userData.get("specialty"));
                    }
                    providerRepository.save(provider);
                }
            }

            return ResponseEntity.ok(Map.of(
                    "message", "User updated successfully",
                    "userId", userId
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Delete user
    @DeleteMapping("/delete-user/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        try {
            AppUser user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

            String userRole = user.getRole();

            if ("PROVIDER".equals(userRole)) {
                Optional<Provider> providerOpt = providerRepository.findByAppUserId(userId);
                providerOpt.ifPresent(providerRepository::delete);
            }

            userRepository.delete(user);

            return ResponseEntity.ok(Map.of(
                    "message", "User deleted successfully",
                    "userId", userId,
                    "username", user.getUsername()
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Reset user password
    @PostMapping("/reset-password/{userId}")
    public ResponseEntity<?> resetPassword(@PathVariable Long userId, @RequestBody Map<String, String> request) {
        try {
            AppUser user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

            String newPassword = request.get("password");
            if (newPassword == null || newPassword.length() < 4) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Password must be at least 4 characters"));
            }

            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);

            return ResponseEntity.ok(Map.of(
                    "message", "Password reset successfully",
                    "userId", userId,
                    "username", user.getUsername()
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Create team leader
    @PostMapping("/create-team-leader")
    public ResponseEntity<?> createTeamLeader(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String password = request.get("password");
            String fullName = request.get("fullName");
            String email = request.get("email");
            String phoneNumber = request.get("phoneNumber");
            String department = request.get("department");
            String leadingDepartment = request.get("leadingDepartment");

            if (userRepository.findByUsername(username).isPresent()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Username already exists"));
            }

            AppUser user = new AppUser();
            user.setUsername(username);
            user.setPassword(passwordEncoder.encode(password));
            user.setRole("TEAM_LEADER");
            user.setFullName(fullName);
            user.setEmail(email);
            user.setPhoneNumber(phoneNumber);
            user.setDepartment(department);
            user.setLeadingDepartment(leadingDepartment);
            user.setStatus("Active");
            user.setCreatedAt(LocalDateTime.now());

            AppUser savedUser = userRepository.save(user);

            return ResponseEntity.ok(Map.of(
                    "message", "Team Leader created successfully",
                    "id", savedUser.getId(),
                    "username", savedUser.getUsername(),
                    "fullName", savedUser.getFullName(),
                    "leadingDepartment", leadingDepartment
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Create team member
    @PostMapping("/create-user")
    public ResponseEntity<?> createTeamMember(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String password = request.get("password");
            String role = request.get("role");
            String fullName = request.get("fullName");
            String email = request.get("email");
            String phoneNumber = request.get("phoneNumber");
            String department = request.get("department");
            String specialty = request.get("specialty");

            if (userRepository.findByUsername(username).isPresent()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Username already exists"));
            }

            AppUser user = new AppUser();
            user.setUsername(username);
            user.setPassword(passwordEncoder.encode(password));
            user.setRole(role != null ? role : "TEAM_MEMBER");
            user.setFullName(fullName);
            user.setEmail(email);
            user.setPhoneNumber(phoneNumber);
            user.setDepartment(department);
            user.setSpecialty(specialty);
            user.setStatus("Active");
            user.setCreatedAt(LocalDateTime.now());

            AppUser savedUser = userRepository.save(user);

            return ResponseEntity.ok(Map.of(
                    "message", "User created successfully",
                    "id", savedUser.getId(),
                    "username", savedUser.getUsername(),
                    "role", savedUser.getRole()
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Assign team member to team leader
    @PostMapping("/assign-team-member-to-leader")
    public ResponseEntity<?> assignTeamMemberToLeader(@RequestBody Map<String, Long> request) {
        try {
            Long teamLeaderId = request.get("teamLeaderId");
            Long teamMemberId = request.get("teamMemberId");

            AppUser teamLeader = userRepository.findById(teamLeaderId)
                    .orElseThrow(() -> new RuntimeException("Team Leader not found"));

            AppUser teamMember = userRepository.findById(teamMemberId)
                    .orElseThrow(() -> new RuntimeException("Team Member not found"));

            teamMember.setReportsTo(teamLeader);
            userRepository.save(teamMember);

            return ResponseEntity.ok(Map.of(
                    "message", "Team member assigned to leader successfully",
                    "teamLeaderId", teamLeaderId,
                    "teamMemberId", teamMemberId
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Get unassigned team members
    @GetMapping("/unassigned-team-members")
    public ResponseEntity<List<Map<String, Object>>> getUnassignedTeamMembers() {
        List<AppUser> allTeamMembers = userRepository.findByRole("TEAM_MEMBER");

        List<Map<String, Object>> unassigned = allTeamMembers.stream()
                .filter(member -> member.getReportsTo() == null)
                .map(member -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", member.getId());
                    map.put("fullName", member.getFullName());
                    map.put("email", member.getEmail());
                    map.put("department", member.getDepartment());
                    return map;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(unassigned);
    }

    @PostMapping("/assign-task")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> assignTaskToUser(@RequestBody Map<String, Object> request) {
        try {
            Long userId = Long.valueOf(request.get("userId").toString());
            String title = (String) request.get("title");
            String description = (String) request.get("description");
            String priority = (String) request.get("priority");
            String dueDate = (String) request.get("dueDate");
            Long relatedProviderId = request.get("relatedProviderId") != null ?
                    Long.valueOf(request.get("relatedProviderId").toString()) : null;

            AppUser assignee = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

            Task task = new Task();
            task.setTitle(title);
            task.setDescription(description);
            task.setPriority(priority);
            task.setStatus(TaskStatus.TODO);
            task.setAssignedTo(assignee);
            task.setAssignedBy(null);
            task.setRelatedProviderId(relatedProviderId);
            if (dueDate != null && !dueDate.isEmpty()) {
                task.setDueDate(LocalDateTime.parse(dueDate + "T00:00:00"));
            }
            task.setCreatedAt(LocalDateTime.now());

            Task savedTask = taskRepository.save(task);

            return ResponseEntity.ok(Map.of(
                    "message", "Task assigned successfully",
                    "taskId", savedTask.getId(),
                    "assignedTo", assignee.getFullName()
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Assign task to team leader
    @PostMapping("/assign-task-to-leader")
    public ResponseEntity<?> assignTaskToLeader(@RequestBody Map<String, Object> request) {
        try {
            Long teamLeaderId = Long.valueOf(request.get("teamLeaderId").toString());
            String title = (String) request.get("title");
            String description = (String) request.get("description");
            String priority = (String) request.get("priority");
            String dueDate = (String) request.get("dueDate");
            Long relatedProviderId = request.get("relatedProviderId") != null ?
                    Long.valueOf(request.get("relatedProviderId").toString()) : null;

            AppUser teamLeader = userRepository.findById(teamLeaderId)
                    .orElseThrow(() -> new RuntimeException("Team Leader not found"));

            Task task = new Task();
            task.setTitle(title);
            task.setDescription(description);
            task.setPriority(priority);
            task.setStatus(com.example.provider_license_tracker.model.TaskStatus.TODO);
            task.setAssignedTo(teamLeader);
            task.setAssignedBy(null);
            task.setRelatedProviderId(relatedProviderId);
            if (dueDate != null && !dueDate.isEmpty()) {
                task.setDueDate(java.time.LocalDateTime.parse(dueDate + "T00:00:00"));
            }
            task.setCreatedAt(LocalDateTime.now());

            Task savedTask = taskRepository.save(task);

            return ResponseEntity.ok(Map.of(
                    "message", "Task assigned successfully",
                    "taskId", savedTask.getId(),
                    "assignedTo", teamLeader.getFullName()
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Get team leader task statistics
    @GetMapping("/team-leader-task-stats")
    public ResponseEntity<List<Map<String, Object>>> getTeamLeaderTaskStats() {
        List<AppUser> teamLeaders = userRepository.findByRole("TEAM_LEADER");

        List<Map<String, Object>> stats = teamLeaders.stream().map(leader -> {
            Map<String, Object> stat = new HashMap<>();
            stat.put("id", leader.getId());
            stat.put("fullName", leader.getFullName());
            stat.put("email", leader.getEmail());
            stat.put("leadingDepartment", leader.getLeadingDepartment());

            List<Task> tasks = taskRepository.findByAssignedTo(leader);

            long todoTasks = tasks.stream().filter(t -> t.getStatus() == com.example.provider_license_tracker.model.TaskStatus.TODO).count();
            long inProgressTasks = tasks.stream().filter(t -> t.getStatus() == com.example.provider_license_tracker.model.TaskStatus.IN_PROGRESS).count();
            long inReviewTasks = tasks.stream().filter(t -> t.getStatus() == com.example.provider_license_tracker.model.TaskStatus.IN_REVIEW).count();
            long completedTasks = tasks.stream().filter(t -> t.getStatus() == com.example.provider_license_tracker.model.TaskStatus.COMPLETED).count();
            long blockedTasks = tasks.stream().filter(t -> t.getStatus() == com.example.provider_license_tracker.model.TaskStatus.BLOCKED).count();

            stat.put("myTodoTasks", todoTasks);
            stat.put("myInProgressTasks", inProgressTasks);
            stat.put("myInReviewTasks", inReviewTasks);
            stat.put("myCompletedTasks", completedTasks);
            stat.put("myBlockedTasks", blockedTasks);
            stat.put("myTotalTasks", tasks.size());
            stat.put("myPendingTasks", todoTasks + inProgressTasks + inReviewTasks);

            double completionRate = tasks.size() > 0 ? (completedTasks * 100.0 / tasks.size()) : 0;
            stat.put("completionRate", Math.round(completionRate));

            return stat;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(stats);
    }

    // Get all tasks
    @GetMapping("/all-tasks")
    public ResponseEntity<Map<String, Object>> getAllTasks() {
        List<Task> allTasks = taskRepository.findAll();

        List<Map<String, Object>> enrichedTasks = allTasks.stream().map(task -> {
            Map<String, Object> t = new HashMap<>();
            t.put("id", task.getId());
            t.put("title", task.getTitle());
            t.put("description", task.getDescription());
            t.put("status", task.getStatus() != null ? task.getStatus().toString() : "TODO");
            t.put("priority", task.getPriority());
            t.put("dueDate", task.getDueDate());
            t.put("createdAt", task.getCreatedAt());

            if (task.getAssignedTo() != null) {
                t.put("assignedTo", task.getAssignedTo().getFullName());
                t.put("assignedToId", task.getAssignedTo().getId());
                t.put("assignedToRole", task.getAssignedTo().getRole());
            }

            if (task.getAssignedBy() != null) {
                t.put("assignedBy", task.getAssignedBy().getFullName());
            }

            List<Map<String, Object>> comments = task.getComments().stream().map(comment -> {
                Map<String, Object> c = new HashMap<>();
                c.put("id", comment.getId());
                c.put("comment", comment.getComment());
                c.put("userName", comment.getUser() != null ? comment.getUser().getFullName() : "Unknown");
                c.put("createdAt", comment.getCreatedAt());
                return c;
            }).collect(Collectors.toList());
            t.put("comments", comments);

            List<Map<String, Object>> timeLogs = task.getTimeLogs().stream().map(log -> {
                Map<String, Object> tl = new HashMap<>();
                tl.put("id", log.getId());
                tl.put("hoursSpent", log.getHoursSpent());
                tl.put("description", log.getDescription());
                tl.put("loggedAt", log.getLoggedAt());
                return tl;
            }).collect(Collectors.toList());
            t.put("timeLogs", timeLogs);

            return t;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(Map.of(
                "tasks", enrichedTasks,
                "total", enrichedTasks.size()
        ));
    }

    // Get all assignable users (Team Members and Team Leaders for task/project assignment)
    @GetMapping("/assignable-users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAssignableUsers() {
        try {
            List<AppUser> assignableUsers = userRepository.findAssignableUsers();

            List<Map<String, Object>> result = assignableUsers.stream().map(user -> {
                Map<String, Object> u = new HashMap<>();
                u.put("id", user.getId());
                u.put("fullName", user.getFullName());
                u.put("email", user.getEmail());
                u.put("role", user.getRole());
                u.put("roleLabel", "TEAM_LEADER".equals(user.getRole()) ? "Team Leader" : "Team Member");
                u.put("leadingDepartment", user.getLeadingDepartment());
                u.put("department", user.getDepartment());
                return u;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(Map.of(
                    "users", result,
                    "total", result.size()
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== PROJECT MANAGEMENT ENDPOINTS ====================

    // Get all projects
    @GetMapping("/projects")
    public ResponseEntity<?> getAllProjects() {
        try {
            List<Project> projects = projectService.findAllProjects();

            List<Map<String, Object>> enrichedProjects = projects.stream().map(project -> {
                Map<String, Object> p = new HashMap<>();
                p.put("id", project.getId());
                p.put("projectName", project.getProjectName());
                p.put("description", project.getDescription());
                p.put("projectType", project.getProjectType());
                p.put("priority", project.getPriority());
                p.put("status", project.getStatus());
                p.put("completionPercentage", project.getCompletionPercentage());
                p.put("startDate", project.getStartDate());
                p.put("targetEndDate", project.getTargetEndDate());
                p.put("createdAt", project.getCreatedAt());
                p.put("groupName", project.getGroupName());
                p.put("providerName", project.getProviderName());
                p.put("createdByName", project.getCreatedByName());

                // Add tasks
                List<Map<String, Object>> tasks = new ArrayList<>();
                if (project.getTasks() != null) {
                    tasks = project.getTasks().stream().map(task -> {
                        Map<String, Object> t = new HashMap<>();
                        t.put("id", task.getId());
                        t.put("title", task.getTitle());
                        t.put("status", task.getStatus());
                        t.put("priority", task.getPriority());
                        t.put("assignedToName", task.getAssignedToName());
                        t.put("dueDate", task.getDueDate());
                        return t;
                    }).collect(Collectors.toList());
                }
                p.put("tasks", tasks);

                // Add assignees
                List<Map<String, Object>> assignees = new ArrayList<>();
                if (project.getAssignees() != null) {
                    assignees = project.getAssignees().stream().map(assignee -> {
                        Map<String, Object> a = new HashMap<>();
                        a.put("id", assignee.getId());
                        a.put("userId", assignee.getUserId());
                        a.put("userName", assignee.getUserName());
                        a.put("role", assignee.getRole());
                        return a;
                    }).collect(Collectors.toList());
                }
                p.put("assignees", assignees);

                return p;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(Map.of(
                    "projects", enrichedProjects,
                    "total", enrichedProjects.size()
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Add this method anywhere in the AdminController class
    @PutMapping("/projects/{projectId}")
    public ResponseEntity<?> updateProject(
            @PathVariable Long projectId,
            @RequestBody Map<String, Object> request) {
        try {
            Project existingProject = projectService.getProjectDetails(projectId);
            if (existingProject == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Project not found"));
            }

            if (request.containsKey("projectName") && request.get("projectName") != null) {
                existingProject.setProjectName((String) request.get("projectName"));
            }
            if (request.containsKey("description")) {
                existingProject.setDescription((String) request.get("description"));
            }
            if (request.containsKey("status")) {
                existingProject.setStatus((String) request.get("status"));
            }
            if (request.containsKey("priority")) {
                existingProject.setPriority((String) request.get("priority"));
            }
            if (request.containsKey("startDate") && request.get("startDate") != null
                    && !request.get("startDate").toString().isEmpty()) {
                existingProject.setStartDate(LocalDate.parse(request.get("startDate").toString()));
            }
            if (request.containsKey("targetEndDate") && request.get("targetEndDate") != null
                    && !request.get("targetEndDate").toString().isEmpty()) {
                existingProject.setTargetEndDate(LocalDate.parse(request.get("targetEndDate").toString()));
            }

            Project updated = projectService.updateProject(projectId, existingProject);

            return ResponseEntity.ok(Map.of(
                    "message", "Project updated successfully",
                    "project", updated
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Update project status
    @PutMapping("/projects/{projectId}/status")
    public ResponseEntity<?> updateProjectStatus(
            @PathVariable Long projectId,
            @RequestBody Map<String, String> request) {
        try {
            String status = request.get("status");
            if (status == null || status.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Status is required"));
            }

            Project updatedProject = projectService.updateProjectStatus(projectId, status);

            if (updatedProject == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Project not found"));
            }

            return ResponseEntity.ok(Map.of(
                    "message", "Project status updated successfully",
                    "projectId", projectId,
                    "status", status,
                    "completionPercentage", updatedProject.getCompletionPercentage()
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Get single project details
    @GetMapping("/projects/{projectId}")
    public ResponseEntity<?> getProjectById(@PathVariable Long projectId) {
        try {
            Project project = projectService.getProjectDetails(projectId);
            if (project == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Project not found"));
            }

            Map<String, Object> result = new HashMap<>();
            result.put("id", project.getId());
            result.put("projectName", project.getProjectName());
            result.put("description", project.getDescription());
            result.put("projectType", project.getProjectType());
            result.put("priority", project.getPriority());
            result.put("status", project.getStatus());
            result.put("completionPercentage", project.getCompletionPercentage());
            result.put("startDate", project.getStartDate());
            result.put("targetEndDate", project.getTargetEndDate());
            result.put("createdAt", project.getCreatedAt());
            result.put("groupName", project.getGroupName());
            result.put("providerName", project.getProviderName());
            result.put("createdByName", project.getCreatedByName());

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}