package com.example.provider_license_tracker.controller;

import com.example.provider_license_tracker.dto.TaskDTO;
import com.example.provider_license_tracker.model.AppUser;
import com.example.provider_license_tracker.model.Task;
import com.example.provider_license_tracker.model.TaskStatus;
import com.example.provider_license_tracker.model.TaskTimeLog;
import com.example.provider_license_tracker.model.TaskComment;
import com.example.provider_license_tracker.repository.TaskRepository;
import com.example.provider_license_tracker.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/tasks")
public class TaskController {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public TaskController(TaskRepository taskRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    // ── Assign a new task to a team member (Admin or Team Leader only) ──
    @PostMapping("/assign")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEADER')")
    public ResponseEntity<?> assignTask(@RequestBody TaskDTO taskDTO, Principal principal) {
        try {
            AppUser assignedBy = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            AppUser assignedTo = userRepository.findById(taskDTO.getAssignedToUserId())
                    .orElseThrow(() -> new RuntimeException("Team member not found"));

            if (!"TEAM_MEMBER".equals(assignedTo.getRole())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Tasks can only be assigned to TEAM_MEMBER users"));
            }

            Task task = new Task();
            task.setTitle(taskDTO.getTitle());
            task.setDescription(taskDTO.getDescription());
            task.setStatus(TaskStatus.TODO);
            task.setPriority(taskDTO.getPriority());
            task.setAssignedTo(assignedTo);
            task.setAssignedBy(assignedBy);
            task.setDueDate(taskDTO.getDueDate());
            task.setCreatedAt(LocalDateTime.now());
            task.setUpdatedAt(LocalDateTime.now());

            if (taskDTO.getRelatedProviderId() != null) {
                task.setRelatedProviderId(taskDTO.getRelatedProviderId());
            }

            Task savedTask = taskRepository.save(task);
            return ResponseEntity.ok(savedTask);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to assign task: " + e.getMessage()));
        }
    }

    // ── Update task status (Assignee, Admin, or Team Leader) ──
    @PutMapping("/{taskId}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEADER', 'TEAM_MEMBER')")
    public ResponseEntity<?> updateTaskStatus(@PathVariable Long taskId,
                                              @RequestParam String status,
                                              Principal principal) {
        try {
            AppUser currentUser = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Task task = taskRepository.findById(taskId)
                    .orElseThrow(() -> new RuntimeException("Task not found"));

            boolean isAssignedToUser = task.getAssignedTo().getId().equals(currentUser.getId());
            boolean isAdmin = "ADMIN".equals(currentUser.getRole());
            boolean isTeamLeader = "TEAM_LEADER".equals(currentUser.getRole());

            if (!isAssignedToUser && !isAdmin && !isTeamLeader) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "You don't have permission to update this task"));
            }

            // Validate status
            try {
                TaskStatus newStatus = TaskStatus.valueOf(status.toUpperCase());
                task.setStatus(newStatus);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Invalid status. Allowed: TODO, IN_PROGRESS, IN_REVIEW, COMPLETED, BLOCKED"));
            }

            task.setUpdatedAt(LocalDateTime.now());
            Task updatedTask = taskRepository.save(task);

            return ResponseEntity.ok(updatedTask);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update task status: " + e.getMessage()));
        }
    }

    @GetMapping("/insurance-list")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEADER', 'TEAM_MEMBER')")
    public ResponseEntity<?> getInsuranceList() {
        List<String> insuranceNames = Arrays.asList(
                "Aetna", "Anthem Blue Cross Blue Shield", "Blue Cross Blue Shield (BCBS)",
                "Cigna", "Humana", "UnitedHealthcare", "Kaiser Permanente",
                "Medicare", "Medicaid", "Medicare Advantage", "Dual Eligible (Medicare/Medicaid)",
                "Ambetter", "Bright Health", "Centene", "Molina Healthcare", "Oscar Health",
                "Amerihealth", "BCBS Federal Employee Program", "Caresource", "Community Health Plan",
                "Coventry Health Care", "Devoted Health", "Friday Health Plans", "Geisinger Health Plan",
                "Health Alliance Plan", "Highmark", "Independence Blue Cross", "Magellan Health",
                "MDVIP", "Multiplan", "Network Health",
                "Point32Health (Tufts / Harvard Pilgrim)", "Premera Blue Cross", "Priority Health",
                "Regence Blue Shield", "Scott & White Health Plan", "Sun Life Financial",
                "Tricare", "UPMC Health Plan", "WellCare", "Western Health Advantage",
                "Workers Compensation", "Auto Insurance (PIP)",
                "Champva", "Indian Health Service", "Veterans Affairs (VA)",
                "Self-Pay / Uninsured", "Other"
        );
        return ResponseEntity.ok(Map.of("insuranceNames", insuranceNames));
    }

    // ── Get tasks assigned to the current user ──
    @GetMapping("/my-tasks")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEADER', 'TEAM_MEMBER')")
    public ResponseEntity<?> getMyTasks(Principal principal) {
        try {
            AppUser currentUser = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<Task> tasks = taskRepository.findByAssignedToOrderByDueDateAsc(currentUser);

            List<Map<String, Object>> enrichedTasks = tasks.stream().map(task -> {
                Map<String, Object> enriched = new HashMap<>();
                enriched.put("id", task.getId());
                enriched.put("title", task.getTitle());
                enriched.put("description", task.getDescription());
                enriched.put("status", task.getStatus().toString());
                enriched.put("priority", task.getPriority());
                enriched.put("dueDate", task.getDueDate());
                enriched.put("createdAt", task.getCreatedAt());

                if (task.getAssignedBy() != null) {
                    enriched.put("assignedBy", task.getAssignedBy().getFullName());
                    enriched.put("assignedById", task.getAssignedBy().getId());
                } else {
                    enriched.put("assignedBy", "System");
                    enriched.put("assignedById", null);
                }

                enriched.put("relatedProviderId", task.getRelatedProviderId());

                // Add comments
                List<Map<String, Object>> comments = task.getComments().stream().map(comment -> {
                    Map<String, Object> c = new HashMap<>();
                    c.put("id", comment.getId());
                    c.put("comment", comment.getComment());
                    c.put("userName", comment.getUser().getFullName());
                    c.put("createdAt", comment.getCreatedAt());
                    return c;
                }).collect(Collectors.toList());
                enriched.put("comments", comments);

                // Add time logs
                List<Map<String, Object>> timeLogs = task.getTimeLogs().stream().map(log -> {
                    Map<String, Object> t = new HashMap<>();
                    t.put("id", log.getId());
                    t.put("hoursSpent", log.getHoursSpent());
                    t.put("description", log.getDescription());
                    t.put("loggedAt", log.getLoggedAt());
                    t.put("userName", log.getUser().getFullName());
                    return t;
                }).collect(Collectors.toList());
                enriched.put("timeLogs", timeLogs);

                return enriched;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(Map.of(
                    "tasks", enrichedTasks,
                    "total", tasks.size(),
                    "todo", tasks.stream().filter(t -> t.getStatus() == TaskStatus.TODO).count(),
                    "inProgress", tasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS).count(),
                    "inReview", tasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_REVIEW).count(),
                    "completed", tasks.stream().filter(t -> t.getStatus() == TaskStatus.COMPLETED).count(),
                    "blocked", tasks.stream().filter(t -> t.getStatus() == TaskStatus.BLOCKED).count()
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch tasks: " + e.getMessage()));
        }
    }

    // ── Get all tasks for team members under a team leader ──
    @GetMapping("/team-tasks")
    @PreAuthorize("hasRole('TEAM_LEADER')")
    public ResponseEntity<?> getTeamTasks(Principal principal) {
        try {
            AppUser teamLeader = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

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
                t.put("createdAt", task.getCreatedAt());
                t.put("updatedAt", task.getUpdatedAt());

                if (task.getAssignedBy() != null) {
                    t.put("assignedBy", task.getAssignedBy().getFullName());
                    t.put("assignedById", task.getAssignedBy().getId());
                } else {
                    t.put("assignedBy", "System");
                    t.put("assignedById", null);
                }

                if (task.getAssignedTo() != null) {
                    t.put("assignedToName", task.getAssignedTo().getFullName());
                    t.put("assignedToId", task.getAssignedTo().getId());
                }

                t.put("relatedProviderId", task.getRelatedProviderId());

                List<Map<String, Object>> comments = task.getComments().stream().map(comment -> {
                    Map<String, Object> c = new HashMap<>();
                    c.put("id", comment.getId());
                    c.put("comment", comment.getComment());
                    c.put("userName", comment.getUser().getFullName());
                    c.put("userId", comment.getUser().getId());
                    c.put("userRole", comment.getUser().getRole());
                    c.put("createdAt", comment.getCreatedAt());
                    return c;
                }).collect(Collectors.toList());
                t.put("comments", comments);

                List<Map<String, Object>> timeLogs = task.getTimeLogs().stream().map(log -> {
                    Map<String, Object> tl = new HashMap<>();
                    tl.put("id", log.getId());
                    tl.put("hoursSpent", log.getHoursSpent());
                    tl.put("description", log.getDescription());
                    tl.put("userName", log.getUser().getFullName());
                    tl.put("userId", log.getUser().getId());
                    tl.put("userRole", log.getUser().getRole());
                    tl.put("loggedAt", log.getLoggedAt());
                    return tl;
                }).collect(Collectors.toList());
                t.put("timeLogs", timeLogs);

                int totalHours = task.getTimeLogs().stream().mapToInt(TaskTimeLog::getHoursSpent).sum();
                t.put("totalHoursSpent", totalHours);

                return t;
            }).collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("tasks", enrichedTasks);
            response.put("totalTasks", allTeamTasks.size());
            response.put("summary", Map.of(
                    "todo", allTeamTasks.stream().filter(t -> t.getStatus() == TaskStatus.TODO).count(),
                    "inProgress", allTeamTasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS).count(),
                    "inReview", allTeamTasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_REVIEW).count(),
                    "completed", allTeamTasks.stream().filter(t -> t.getStatus() == TaskStatus.COMPLETED).count(),
                    "blocked", allTeamTasks.stream().filter(t -> t.getStatus() == TaskStatus.BLOCKED).count()
            ));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch team tasks: " + e.getMessage()));
        }
    }

    // ── Reassign a task to a different team member ──
    @PutMapping("/{taskId}/reassign")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEADER')")
    public ResponseEntity<?> reassignTask(@PathVariable Long taskId,
                                          @RequestParam Long newTeamMemberId,
                                          Principal principal) {
        try {
            AppUser reassignedBy = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Task task = taskRepository.findById(taskId)
                    .orElseThrow(() -> new RuntimeException("Task not found"));

            AppUser newAssignee = userRepository.findById(newTeamMemberId)
                    .orElseThrow(() -> new RuntimeException("New team member not found"));

            if (!"TEAM_MEMBER".equals(newAssignee.getRole())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Tasks can only be reassigned to TEAM_MEMBER users"));
            }

            String oldAssigneeName = task.getAssignedTo().getFullName();

            task.setAssignedTo(newAssignee);
            task.setUpdatedAt(LocalDateTime.now());

            Task updatedTask = taskRepository.save(task);

            return ResponseEntity.ok(Map.of(
                    "message", "Task reassigned successfully",
                    "task", updatedTask,
                    "oldAssignee", oldAssigneeName,
                    "newAssignee", newAssignee.getFullName()
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to reassign task: " + e.getMessage()));
        }
    }

    // ── Add comment to task ──
    @PostMapping("/{taskId}/comments")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEADER', 'TEAM_MEMBER', 'PROVIDER')")
    public ResponseEntity<?> addComment(@PathVariable Long taskId,
                                        @RequestBody Map<String, String> request,
                                        Principal principal) {
        try {
            AppUser currentUser = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Task task = taskRepository.findById(taskId)
                    .orElseThrow(() -> new RuntimeException("Task not found"));

            String commentText = request.get("comment");
            if (commentText == null || commentText.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Comment cannot be empty"));
            }

            TaskComment comment = new TaskComment();
            comment.setTask(task);
            comment.setUser(currentUser);
            comment.setComment(commentText);
            comment.setCreatedAt(LocalDateTime.now());

            task.getComments().add(comment);
            task.setUpdatedAt(LocalDateTime.now());

            Task updatedTask = taskRepository.save(task);

            List<Map<String, Object>> comments = updatedTask.getComments().stream().map(c -> {
                Map<String, Object> cm = new HashMap<>();
                cm.put("id", c.getId());
                cm.put("comment", c.getComment());
                cm.put("userName", c.getUser().getFullName());
                cm.put("createdAt", c.getCreatedAt());
                return cm;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Comment added successfully",
                    "comments", comments
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to add comment: " + e.getMessage()));
        }
    }

    // ── Log time for task ──
    @PostMapping("/{taskId}/time-logs")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEADER', 'TEAM_MEMBER', 'PROVIDER')")
    public ResponseEntity<?> logTime(@PathVariable Long taskId,
                                     @RequestBody Map<String, Object> request,
                                     Principal principal) {
        try {
            AppUser currentUser = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Task task = taskRepository.findById(taskId)
                    .orElseThrow(() -> new RuntimeException("Task not found"));

            Integer hoursSpent = (Integer) request.get("hoursSpent");
            if (hoursSpent == null || hoursSpent <= 0) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Valid hours spent is required"));
            }

            String description = (String) request.get("description");

            TaskTimeLog timeLog = new TaskTimeLog();
            timeLog.setTask(task);
            timeLog.setUser(currentUser);
            timeLog.setHoursSpent(hoursSpent);
            timeLog.setDescription(description);
            timeLog.setLoggedAt(LocalDateTime.now());

            task.getTimeLogs().add(timeLog);
            task.setUpdatedAt(LocalDateTime.now());

            Task updatedTask = taskRepository.save(task);

            List<Map<String, Object>> timeLogs = updatedTask.getTimeLogs().stream().map(log -> {
                Map<String, Object> tl = new HashMap<>();
                tl.put("id", log.getId());
                tl.put("hoursSpent", log.getHoursSpent());
                tl.put("description", log.getDescription());
                tl.put("userName", log.getUser().getFullName());
                tl.put("loggedAt", log.getLoggedAt());
                return tl;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Time logged successfully",
                    "timeLogs", timeLogs
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to log time: " + e.getMessage()));
        }
    }

    // ── Get task statistics for dashboard ──
    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEADER', 'TEAM_MEMBER')")
    public ResponseEntity<?> getTaskStats(Principal principal) {
        try {
            AppUser currentUser = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Map<String, Object> stats = new HashMap<>();

            if ("TEAM_LEADER".equals(currentUser.getRole())) {
                List<AppUser> teamMembers = userRepository.findByReportsTo(currentUser.getId());
                List<Task> allTasks = taskRepository.findByAssignedToIn(teamMembers);

                stats.put("totalTasks", allTasks.size());
                stats.put("completedTasks", allTasks.stream().filter(t -> t.getStatus() == TaskStatus.COMPLETED).count());
                stats.put("todoTasks", allTasks.stream().filter(t -> t.getStatus() == TaskStatus.TODO).count());
                stats.put("inProgressTasks", allTasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS).count());
                stats.put("inReviewTasks", allTasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_REVIEW).count());
                stats.put("blockedTasks", allTasks.stream().filter(t -> t.getStatus() == TaskStatus.BLOCKED).count());
                stats.put("teamMembersCount", teamMembers.size());

            } else if ("TEAM_MEMBER".equals(currentUser.getRole())) {
                List<Task> myTasks = taskRepository.findByAssignedTo(currentUser);

                stats.put("totalTasks", myTasks.size());
                stats.put("completedTasks", myTasks.stream().filter(t -> t.getStatus() == TaskStatus.COMPLETED).count());
                stats.put("todoTasks", myTasks.stream().filter(t -> t.getStatus() == TaskStatus.TODO).count());
                stats.put("inProgressTasks", myTasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS).count());
                stats.put("inReviewTasks", myTasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_REVIEW).count());
                stats.put("blockedTasks", myTasks.stream().filter(t -> t.getStatus() == TaskStatus.BLOCKED).count());
            }

            return ResponseEntity.ok(stats);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch task stats: " + e.getMessage()));
        }
    }
}