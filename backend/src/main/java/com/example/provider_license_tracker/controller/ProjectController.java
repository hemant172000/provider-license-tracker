package com.example.provider_license_tracker.controller;

import com.example.provider_license_tracker.model.*;
import com.example.provider_license_tracker.repository.*;
import com.example.provider_license_tracker.service.ProjectService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.*;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/team-leader/projects")
@PreAuthorize("hasRole('TEAM_LEADER')")
public class ProjectController {

    private final ProjectService projectService;
    private final UserRepository userRepository;
    private final GroupRepository groupRepository;
    private final ProviderRepository providerRepository;

    public ProjectController(ProjectService projectService,
                             UserRepository userRepository,
                             GroupRepository groupRepository,
                             ProviderRepository providerRepository) {
        this.projectService = projectService;
        this.userRepository = userRepository;
        this.groupRepository = groupRepository;
        this.providerRepository = providerRepository;
    }

    // Get all projects for team leader (includes projects they are assigned to)
    @GetMapping
    public ResponseEntity<?> getProjects(Principal principal) {
        try {
            AppUser teamLeader = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("Team Leader not found"));

            List<AppUser> teamMembers = userRepository.findByReportsTo(teamLeader.getId());
            List<Provider> providers = providerRepository.findByAssignedTeamMemberIn(teamMembers);
            List<Long> providerIds = providers.stream().map(Provider::getId).collect(Collectors.toList());
            List<Long> groupIds = providers.stream()
                    .map(Provider::getGroupId)
                    .filter(Objects::nonNull)
                    .distinct()
                    .collect(Collectors.toList());

            List<Project> projects = projectService.getProjectsForTeamLeader(
                    teamLeader.getId(), groupIds, providerIds
            );

            return ResponseEntity.ok(Map.of("projects", projects, "total", projects.size()));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{projectId}")
    public ResponseEntity<?> getProject(@PathVariable Long projectId) {
        try {
            Project project = projectService.getProjectDetails(projectId);
            if (project == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Project not found"));
            }
            return ResponseEntity.ok(project);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createProject(@RequestBody Map<String, Object> request, Principal principal) {
        try {
            AppUser teamLeader = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("Team Leader not found"));

            Project project = new Project();
            project.setProjectName((String) request.get("projectName"));
            project.setDescription((String) request.get("description"));
            project.setProjectType((String) request.get("projectType"));

            if ("GROUP".equals(request.get("projectType")) && request.get("groupId") != null) {
                project.setGroupId(Long.valueOf(request.get("groupId").toString()));
            } else if (request.get("providerId") != null) {
                project.setProviderId(Long.valueOf(request.get("providerId").toString()));
            }

            project.setCreatedBy(teamLeader.getId());
            project.setPriority((String) request.get("priority"));

            if (request.get("startDate") != null && !request.get("startDate").toString().isEmpty()) {
                project.setStartDate(java.time.LocalDate.parse(request.get("startDate").toString()));
            }
            if (request.get("targetEndDate") != null && !request.get("targetEndDate").toString().isEmpty()) {
                project.setTargetEndDate(java.time.LocalDate.parse(request.get("targetEndDate").toString()));
            }

            List<Long> assigneeIds = request.get("assigneeIds") != null ?
                    ((List<?>) request.get("assigneeIds")).stream()
                            .map(id -> Long.valueOf(id.toString()))
                            .collect(Collectors.toList()) : new ArrayList<>();

            Project created = projectService.createProject(project, assigneeIds);

            return ResponseEntity.ok(Map.of("message", "Project created successfully", "project", created));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Full project update — supports editing description, start date, target end date,
     * project name, priority, and status. Satisfies requirement #4.
     */
    @PutMapping("/{projectId}")
    public ResponseEntity<?> updateProject(@PathVariable Long projectId,
                                           @RequestBody Map<String, Object> request) {
        try {
            Project updatedData = new Project();

            if (request.containsKey("projectName") && request.get("projectName") != null) {
                updatedData.setProjectName((String) request.get("projectName"));
            }
            if (request.containsKey("description")) {
                updatedData.setDescription((String) request.get("description"));
            }
            if (request.containsKey("status")) {
                updatedData.setStatus((String) request.get("status"));
            }
            if (request.containsKey("priority")) {
                updatedData.setPriority((String) request.get("priority"));
            }
            if (request.containsKey("startDate") && request.get("startDate") != null
                    && !request.get("startDate").toString().isEmpty()) {
                updatedData.setStartDate(java.time.LocalDate.parse(request.get("startDate").toString()));
            }
            if (request.containsKey("targetEndDate") && request.get("targetEndDate") != null
                    && !request.get("targetEndDate").toString().isEmpty()) {
                updatedData.setTargetEndDate(java.time.LocalDate.parse(request.get("targetEndDate").toString()));
            }
            if (request.containsKey("completionPercentage") && request.get("completionPercentage") != null) {
                updatedData.setCompletionPercentage((Integer) request.get("completionPercentage"));
            }

            Project updated = projectService.updateProject(projectId, updatedData);
            if (updated == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Project not found"));
            }

            return ResponseEntity.ok(Map.of("message", "Project updated successfully", "project", updated));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{projectId}/tasks")
    public ResponseEntity<?> addTask(@PathVariable Long projectId,
                                     @RequestBody Map<String, Object> request) {
        try {
            ProjectTask task = new ProjectTask();
            task.setTitle((String) request.get("title"));
            task.setDescription((String) request.get("description"));

            if (request.get("assignedTo") != null && !request.get("assignedTo").toString().isEmpty()) {
                task.setAssignedTo(Long.valueOf(request.get("assignedTo").toString()));
            }

            task.setPriority((String) request.get("priority"));

            if (request.get("dueDate") != null && !request.get("dueDate").toString().isEmpty()) {
                task.setDueDate(java.time.LocalDate.parse(request.get("dueDate").toString()));
            }

            ProjectTask created = projectService.addTaskToProject(projectId, task);
            return ResponseEntity.ok(Map.of("message", "Task added successfully", "task", created));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/tasks/{taskId}/status")
    public ResponseEntity<?> updateTaskStatus(@PathVariable Long taskId,
                                              @RequestParam String status) {
        try {
            ProjectTask updated = projectService.updateTaskStatus(taskId, status);
            return ResponseEntity.ok(Map.of("message", "Task status updated", "task", updated));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{projectId}/assignees")
    public ResponseEntity<?> addAssignee(@PathVariable Long projectId,
                                         @RequestBody Map<String, Object> request) {
        try {
            Long userId = Long.valueOf(request.get("userId").toString());
            String role = (String) request.get("role");
            projectService.addAssigneeToProject(projectId, userId, role);
            return ResponseEntity.ok(Map.of("message", "Assignee added successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{projectId}/assignees/{userId}")
    public ResponseEntity<?> removeAssignee(@PathVariable Long projectId,
                                            @PathVariable Long userId) {
        try {
            projectService.removeAssigneeFromProject(projectId, userId);
            return ResponseEntity.ok(Map.of("message", "Assignee removed successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Returns ALL team members AND all team leaders as assignable users.
     * Satisfies requirement #1 (team leads as assignable) and #2 (leads assign each other).
     */
    @GetMapping("/available-team-members")
    public ResponseEntity<?> getAvailableTeamMembers(Principal principal) {
        try {
            AppUser currentLeader = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("Team Leader not found"));

            List<Map<String, Object>> assignableUsers =
                    projectService.getAssignableUsersForProject(currentLeader.getId());

            return ResponseEntity.ok(Map.of(
                    "teamMembers", assignableUsers,
                    "count", assignableUsers.size()
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/statistics")
    public ResponseEntity<?> getProjectStatistics(Principal principal) {
        try {
            AppUser teamLeader = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("Team Leader not found"));

            List<AppUser> teamMembers = userRepository.findByReportsTo(teamLeader.getId());
            List<Provider> providers = providerRepository.findByAssignedTeamMemberIn(teamMembers);
            List<Long> providerIds = providers.stream().map(Provider::getId).collect(Collectors.toList());
            List<Long> groupIds = providers.stream()
                    .map(Provider::getGroupId)
                    .filter(Objects::nonNull)
                    .distinct()
                    .collect(Collectors.toList());

            List<Project> projects = projectService.getProjectsForTeamLeader(
                    teamLeader.getId(), groupIds, providerIds
            );

            long activeProjects = projects.stream().filter(p -> "IN_PROGRESS".equals(p.getStatus())).count();
            long completedProjects = projects.stream().filter(p -> "COMPLETED".equals(p.getStatus())).count();
            long planningProjects = projects.stream().filter(p -> "PLANNING".equals(p.getStatus())).count();
            double avgCompletion = projects.stream()
                    .mapToInt(p -> p.getCompletionPercentage() != null ? p.getCompletionPercentage() : 0)
                    .average().orElse(0);

            return ResponseEntity.ok(Map.of(
                    "totalProjects", projects.size(),
                    "activeProjects", activeProjects,
                    "completedProjects", completedProjects,
                    "planningProjects", planningProjects,
                    "averageCompletion", Math.round(avgCompletion),
                    "projects", projects
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }
}