package com.example.provider_license_tracker.service;

import com.example.provider_license_tracker.model.*;
import com.example.provider_license_tracker.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectAssigneeRepository assigneeRepository;
    private final ProjectTaskRepository taskRepository;
    private final UserRepository userRepository;
    private final GroupRepository groupRepository;
    private final ProviderRepository providerRepository;

    public ProjectService(ProjectRepository projectRepository,
                          ProjectAssigneeRepository assigneeRepository,
                          ProjectTaskRepository taskRepository,
                          UserRepository userRepository,
                          GroupRepository groupRepository,
                          ProviderRepository providerRepository) {
        this.projectRepository = projectRepository;
        this.assigneeRepository = assigneeRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.groupRepository = groupRepository;
        this.providerRepository = providerRepository;
    }

    @Transactional
    public Project createProject(Project project, List<Long> assigneeIds) {
        project.setCreatedAt(LocalDateTime.now());
        project.setUpdatedAt(LocalDateTime.now());
        project.setStatus("PLANNING");
        project.setCompletionPercentage(0);

        Project savedProject = projectRepository.save(project);

        if (assigneeIds != null) {
            for (Long userId : assigneeIds) {
                ProjectAssignee assignee = new ProjectAssignee();
                assignee.setProjectId(savedProject.getId());
                assignee.setUserId(userId);
                assignee.setRole("MEMBER");
                assignee.setAssignedAt(LocalDateTime.now());
                assigneeRepository.save(assignee);
            }
        }

        return enrichProject(savedProject);
    }

    public List<Project> getProjectsForTeamLeader(Long teamLeaderId, List<Long> groupIds, List<Long> providerIds) {
        List<Project> projects = new ArrayList<>();

        // Projects related to groups or providers
        if (!groupIds.isEmpty() || !providerIds.isEmpty()) {
            projects.addAll(projectRepository.findByGroupIdsOrProviderIds(
                    groupIds.isEmpty() ? List.of(-1L) : groupIds,
                    providerIds.isEmpty() ? List.of(-1L) : providerIds
            ));
        }

        // Projects created by this team leader
        projects.addAll(projectRepository.findByCreatedBy(teamLeaderId));

        // Projects where this team leader is an assignee
        List<ProjectAssignee> assignments = assigneeRepository.findByUserId(teamLeaderId);
        List<Long> assignedProjectIds = assignments.stream()
                .map(ProjectAssignee::getProjectId)
                .collect(Collectors.toList());
        if (!assignedProjectIds.isEmpty()) {
            projects.addAll(projectRepository.findAllById(assignedProjectIds));
        }

        // Remove duplicates
        return projects.stream()
                .distinct()
                .map(this::enrichProject)
                .collect(Collectors.toList());
    }

    public Project getProjectDetails(Long projectId) {
        Project project = projectRepository.findById(projectId).orElse(null);
        return enrichProject(project);
    }

    @Transactional
    public Project updateProject(Long projectId, Project updatedData) {
        Project project = projectRepository.findById(projectId).orElse(null);
        if (project == null) return null;

        // All updatable fields — description, dates, name, status, priority, completion
        if (updatedData.getProjectName() != null && !updatedData.getProjectName().isEmpty()) {
            project.setProjectName(updatedData.getProjectName());
        }
        if (updatedData.getDescription() != null) {
            project.setDescription(updatedData.getDescription());
        }
        if (updatedData.getStatus() != null) {
            project.setStatus(updatedData.getStatus());
        }
        if (updatedData.getPriority() != null) {
            project.setPriority(updatedData.getPriority());
        }
        if (updatedData.getStartDate() != null) {
            project.setStartDate(updatedData.getStartDate());
        }
        if (updatedData.getTargetEndDate() != null) {
            project.setTargetEndDate(updatedData.getTargetEndDate());
        }
        if (updatedData.getActualEndDate() != null) {
            project.setActualEndDate(updatedData.getActualEndDate());
        }
        if (updatedData.getCompletionPercentage() != null) {
            project.setCompletionPercentage(updatedData.getCompletionPercentage());
        }

        project.setUpdatedAt(LocalDateTime.now());
        return enrichProject(projectRepository.save(project));
    }

    @Transactional
    public ProjectTask addTaskToProject(Long projectId, ProjectTask task) {
        task.setProjectId(projectId);
        task.setStatus("TODO");
        task.setCreatedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());

        ProjectTask savedTask = taskRepository.save(task);
        updateProjectCompletion(projectId);
        return savedTask;
    }

    @Transactional
    public ProjectTask updateTaskStatus(Long taskId, String newStatus) {
        ProjectTask task = taskRepository.findById(taskId).orElse(null);
        if (task == null) return null;

        task.setStatus(newStatus);
        task.setUpdatedAt(LocalDateTime.now());

        if ("COMPLETED".equals(newStatus)) {
            task.setCompletedAt(LocalDateTime.now());
        }

        ProjectTask updatedTask = taskRepository.save(task);
        updateProjectCompletion(task.getProjectId());
        return updatedTask;
    }

    @Transactional
    public void addAssigneeToProject(Long projectId, Long userId, String role) {
        // Avoid duplicate assignees
        List<ProjectAssignee> existing = assigneeRepository.findByProjectId(projectId);
        boolean alreadyAssigned = existing.stream()
                .anyMatch(a -> a.getUserId().equals(userId));

        if (!alreadyAssigned) {
            ProjectAssignee assignee = new ProjectAssignee();
            assignee.setProjectId(projectId);
            assignee.setUserId(userId);
            assignee.setRole(role != null ? role : "MEMBER");
            assignee.setAssignedAt(LocalDateTime.now());
            assigneeRepository.save(assignee);
        }
    }

    @Transactional
    public void removeAssigneeFromProject(Long projectId, Long userId) {
        List<ProjectAssignee> assignees = assigneeRepository.findByProjectId(projectId);
        assignees.stream()
                .filter(a -> a.getUserId().equals(userId))
                .findFirst()
                .ifPresent(assigneeRepository::delete);
    }

    public List<Project> findAllProjects() {
        return projectRepository.findAll().stream()
                .map(this::enrichProject)
                .collect(Collectors.toList());
    }

    @Transactional
    public Project updateProjectStatus(Long projectId, String status) {
        Project project = projectRepository.findById(projectId).orElse(null);
        if (project == null) return null;

        project.setStatus(status);
        project.setUpdatedAt(LocalDateTime.now());

        if ("COMPLETED".equals(status) && project.getActualEndDate() == null) {
            project.setActualEndDate(java.time.LocalDate.now());
        }

        return enrichProject(projectRepository.save(project));
    }

    /**
     * Get all assignable users for a project — includes Team Members AND Team Leaders.
     * This enables cross-assignment between team leaders (item #2 in requirements).
     */
    public List<Map<String, Object>> getAssignableUsersForProject(Long requestingUserId) {
        List<AppUser> teamMembers = userRepository.findByRole("TEAM_MEMBER");
        List<AppUser> teamLeaders = userRepository.findByRole("TEAM_LEADER");

        List<Map<String, Object>> result = new ArrayList<>();

        for (AppUser u : teamLeaders) {
            Map<String, Object> m = new HashMap<>();
            m.put("id", u.getId());
            m.put("fullName", u.getFullName());
            m.put("email", u.getEmail());
            m.put("role", u.getRole());
            m.put("roleLabel", "Team Leader");
            m.put("leadingDepartment", u.getLeadingDepartment());
            result.add(m);
        }

        for (AppUser u : teamMembers) {
            Map<String, Object> m = new HashMap<>();
            m.put("id", u.getId());
            m.put("fullName", u.getFullName());
            m.put("email", u.getEmail());
            m.put("role", u.getRole());
            m.put("roleLabel", "Team Member");
            m.put("department", u.getDepartment());
            result.add(m);
        }

        return result;
    }

    private void updateProjectCompletion(Long projectId) {
        List<ProjectTask> tasks = taskRepository.findByProjectId(projectId);
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
                project.setActualEndDate(java.time.LocalDate.now());
            }

            projectRepository.save(project);
        }
    }

    private Project enrichProject(Project project) {
        if (project == null) return null;

        List<ProjectAssignee> assignees = assigneeRepository.findByProjectId(project.getId());
        for (ProjectAssignee assignee : assignees) {
            userRepository.findById(assignee.getUserId()).ifPresent(user -> {
                assignee.setUserName(user.getFullName());
                assignee.setUserEmail(user.getEmail());
            });
        }
        project.setAssignees(assignees);

        List<ProjectTask> tasks = taskRepository.findByProjectId(project.getId());
        for (ProjectTask task : tasks) {
            if (task.getAssignedTo() != null) {
                userRepository.findById(task.getAssignedTo()).ifPresent(user ->
                        task.setAssignedToName(user.getFullName())
                );
            }
        }
        project.setTasks(tasks);

        if (project.getGroupId() != null) {
            groupRepository.findById(project.getGroupId()).ifPresent(group ->
                    project.setGroupName(group.getName())
            );
        }

        if (project.getProviderId() != null) {
            providerRepository.findById(project.getProviderId()).ifPresent(provider ->
                    project.setProviderName(provider.getName())
            );
        }

        if (project.getCreatedBy() != null) {
            userRepository.findById(project.getCreatedBy()).ifPresent(user ->
                    project.setCreatedByName(user.getFullName())
            );
        }

        return project;
    }
}