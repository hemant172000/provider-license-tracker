package com.example.provider_license_tracker.controller;

import com.example.provider_license_tracker.model.*;
import com.example.provider_license_tracker.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/team")
public class TeamController {

    private final UserRepository userRepo;
    private final ProviderRepository providerRepo;
    private final ProjectRepository projectRepository;
    private final ProjectAssigneeRepository assigneeRepository;
    private final ProjectTaskRepository projectTaskRepository;
    private final GroupRepository groupRepository;

    public TeamController(UserRepository userRepo,
                          ProviderRepository providerRepo,
                          ProjectRepository projectRepository,
                          ProjectAssigneeRepository assigneeRepository,
                          ProjectTaskRepository projectTaskRepository,
                          GroupRepository groupRepository) {
        this.userRepo = userRepo;
        this.providerRepo = providerRepo;
        this.projectRepository = projectRepository;
        this.assigneeRepository = assigneeRepository;
        this.projectTaskRepository = projectTaskRepository;
        this.groupRepository = groupRepository;
    }

    @GetMapping("/my-providers")
    @PreAuthorize("hasAnyRole('TEAM_MEMBER', 'TEAM_LEADER')")
    public ResponseEntity<Map<String, Object>> getMyProviders(Principal principal) {
        AppUser teamMember = userRepo.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Provider> providers = providerRepo.findByAssignedTeamMember(teamMember);

        return ResponseEntity.ok(Map.of(
                "teamMemberName", teamMember.getFullName() != null ? teamMember.getFullName() : teamMember.getUsername(),
                "role", teamMember.getRole() != null ? teamMember.getRole() : "Credentialing Specialist",
                "providers", providers
        ));
    }

    // ==================== PROJECT ENDPOINTS ====================

    @GetMapping("/my-projects")
    @PreAuthorize("hasAnyRole('TEAM_MEMBER', 'TEAM_LEADER')")
    public ResponseEntity<?> getMyProjects(Principal principal) {
        try {
            AppUser currentUser = userRepo.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            System.out.println("User: " + currentUser.getUsername() + ", Role: " + currentUser.getRole());

            // Find all project assignments for this user
            List<ProjectAssignee> assignments = assigneeRepository.findByUserId(currentUser.getId());

            System.out.println("Found " + assignments.size() + " project assignments");

            if (assignments.isEmpty()) {
                return ResponseEntity.ok(Map.of(
                        "projects", new ArrayList<>(),
                        "total", 0
                ));
            }

            List<Long> projectIds = assignments.stream()
                    .map(ProjectAssignee::getProjectId)
                    .collect(Collectors.toList());

            List<Project> projects = projectRepository.findAllById(projectIds);

            List<Map<String, Object>> enrichedProjects = projects.stream()
                    .map(project -> enrichProjectForTeamMember(project, currentUser.getId()))
                    .collect(Collectors.toList());

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

    @GetMapping("/my-projects/{projectId}")
    @PreAuthorize("hasAnyRole('TEAM_MEMBER', 'TEAM_LEADER')")
    public ResponseEntity<?> getProjectById(@PathVariable Long projectId, Principal principal) {
        try {
            AppUser currentUser = userRepo.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<ProjectAssignee> assignments = assigneeRepository.findByProjectId(projectId);
            boolean isAssigned = assignments.stream()
                    .anyMatch(a -> a.getUserId().equals(currentUser.getId()));

            if (!isAssigned) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "You are not assigned to this project"));
            }

            Project project = projectRepository.findById(projectId)
                    .orElseThrow(() -> new RuntimeException("Project not found"));

            return ResponseEntity.ok(enrichProjectForTeamMember(project, currentUser.getId()));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/projects/tasks/{taskId}/status")
    @PreAuthorize("hasAnyRole('TEAM_MEMBER', 'TEAM_LEADER')")
    public ResponseEntity<?> updateProjectTaskStatus(
            @PathVariable Long taskId,
            @RequestParam String status,
            Principal principal) {
        try {
            AppUser currentUser = userRepo.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            ProjectTask task = projectTaskRepository.findById(taskId)
                    .orElseThrow(() -> new RuntimeException("Task not found"));

            if (!task.getAssignedTo().equals(currentUser.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "You are not assigned to this task"));
            }

            String validStatus = validateTaskStatus(status);
            task.setStatus(validStatus);
            task.setUpdatedAt(LocalDateTime.now());

            if ("COMPLETED".equals(validStatus)) {
                task.setCompletedAt(LocalDateTime.now());
            }

            projectTaskRepository.save(task);
            updateProjectCompletion(task.getProjectId());

            return ResponseEntity.ok(Map.of(
                    "message", "Task status updated successfully",
                    "taskId", taskId,
                    "status", validStatus
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/projects/tasks/{taskId}/comments")
    @PreAuthorize("hasAnyRole('TEAM_MEMBER', 'TEAM_LEADER')")
    public ResponseEntity<?> addProjectTaskComment(
            @PathVariable Long taskId,
            @RequestBody Map<String, String> request,
            Principal principal) {
        try {
            AppUser currentUser = userRepo.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            ProjectTask task = projectTaskRepository.findById(taskId)
                    .orElseThrow(() -> new RuntimeException("Task not found"));

            if (!task.getAssignedTo().equals(currentUser.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "You are not assigned to this task"));
            }

            String commentText = request.get("comment");
            if (commentText == null || commentText.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Comment cannot be empty"));
            }

            // Store as description update (simpler for now)
            String timestampedComment = String.format("\n[%s] %s: %s",
                    LocalDateTime.now().toString(),
                    currentUser.getFullName(),
                    commentText);

            String existingDesc = task.getDescription() != null ? task.getDescription() : "";
            task.setDescription(existingDesc + timestampedComment);
            task.setUpdatedAt(LocalDateTime.now());
            projectTaskRepository.save(task);

            return ResponseEntity.ok(Map.of(
                    "message", "Comment added successfully",
                    "taskId", taskId,
                    "comment", commentText,
                    "userName", currentUser.getFullName()
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/projects/tasks/{taskId}/time-logs")
    @PreAuthorize("hasAnyRole('TEAM_MEMBER', 'TEAM_LEADER')")
    public ResponseEntity<?> logProjectTaskTime(
            @PathVariable Long taskId,
            @RequestBody Map<String, Object> request,
            Principal principal) {
        try {
            AppUser currentUser = userRepo.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            ProjectTask task = projectTaskRepository.findById(taskId)
                    .orElseThrow(() -> new RuntimeException("Task not found"));

            if (!task.getAssignedTo().equals(currentUser.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "You are not assigned to this task"));
            }

            Integer hoursSpent = (Integer) request.get("hoursSpent");
            if (hoursSpent == null || hoursSpent <= 0) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Valid hours spent is required"));
            }

            String description = (String) request.get("description");

            String timeLogEntry = String.format("\n[TIME %s] %s: %d hours - %s",
                    LocalDateTime.now().toString(),
                    currentUser.getFullName(),
                    hoursSpent,
                    description != null ? description : "");

            String existingDesc = task.getDescription() != null ? task.getDescription() : "";
            task.setDescription(existingDesc + timeLogEntry);
            task.setUpdatedAt(LocalDateTime.now());
            projectTaskRepository.save(task);

            return ResponseEntity.ok(Map.of(
                    "message", "Time logged successfully",
                    "taskId", taskId,
                    "hoursSpent", hoursSpent
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== HELPER METHODS ====================

    private Map<String, Object> enrichProjectForTeamMember(Project project, Long userId) {
        Map<String, Object> enriched = new HashMap<>();

        enriched.put("id", project.getId());
        enriched.put("projectName", project.getProjectName());
        enriched.put("description", project.getDescription());
        enriched.put("projectType", project.getProjectType());
        enriched.put("priority", project.getPriority());
        enriched.put("status", project.getStatus());
        enriched.put("completionPercentage", project.getCompletionPercentage());
        enriched.put("startDate", project.getStartDate());
        enriched.put("targetEndDate", project.getTargetEndDate());

        if (project.getGroupId() != null) {
            groupRepository.findById(project.getGroupId()).ifPresent(group ->
                    enriched.put("groupName", group.getName())
            );
        }

        if (project.getProviderId() != null) {
            providerRepo.findById(project.getProviderId()).ifPresent(provider ->
                    enriched.put("providerName", provider.getName())
            );
        }

        userRepo.findById(project.getCreatedBy()).ifPresent(user ->
                enriched.put("createdByName", user.getFullName())
        );

        List<ProjectTask> allTasks = projectTaskRepository.findByProjectId(project.getId());
        List<Map<String, Object>> myTasks = allTasks.stream()
                .filter(task -> task.getAssignedTo() != null && task.getAssignedTo().equals(userId))
                .map(task -> {
                    Map<String, Object> t = new HashMap<>();
                    t.put("id", task.getId());
                    t.put("title", task.getTitle());
                    t.put("description", task.getDescription());
                    t.put("status", task.getStatus());
                    t.put("priority", task.getPriority());
                    t.put("dueDate", task.getDueDate());
                    t.put("completedAt", task.getCompletedAt());

                    userRepo.findById(task.getAssignedTo()).ifPresent(assignee ->
                            t.put("assignedToName", assignee.getFullName())
                    );

                    return t;
                })
                .collect(Collectors.toList());

        enriched.put("myTasks", myTasks);
        enriched.put("myTasksCount", myTasks.size());

        return enriched;
    }

    private void updateProjectCompletion(Long projectId) {
        List<ProjectTask> tasks = projectTaskRepository.findByProjectId(projectId);
        if (tasks.isEmpty()) return;

        long completedTasks = tasks.stream()
                .filter(t -> "COMPLETED".equals(t.getStatus()))
                .count();

        int completionPercentage = (int) ((completedTasks * 100) / tasks.size());

        Project project = projectRepository.findById(projectId).orElse(null);
        if (project != null) {
            project.setCompletionPercentage(completionPercentage);
            project.setUpdatedAt(LocalDateTime.now());

            if (completionPercentage == 100 && !"COMPLETED".equals(project.getStatus())) {
                project.setStatus("COMPLETED");
                project.setActualEndDate(LocalDate.now());
            }

            projectRepository.save(project);
        }
    }

    private String validateTaskStatus(String status) {
        String upperStatus = status.toUpperCase();
        Set<String> validStatuses = Set.of("TODO", "IN_PROGRESS", "IN_REVIEW", "COMPLETED", "BLOCKED");

        if (validStatuses.contains(upperStatus)) {
            return upperStatus;
        }

        return "TODO";
    }
}