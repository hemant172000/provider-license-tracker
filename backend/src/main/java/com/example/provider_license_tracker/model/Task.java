package com.example.provider_license_tracker.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tasks")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(name = "insurance_name")
    private String insuranceName; // NEW: selected from shared insurance list

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    private TaskStatus status;

    private String priority;

    @ManyToOne
    @JoinColumn(name = "assigned_to_id")
    private AppUser assignedTo;

    @ManyToOne
    @JoinColumn(name = "assigned_by_id")
    private AppUser assignedBy;

    private Long relatedProviderId;

    @Column(name = "start_date")
    private LocalDateTime startDate; // NEW: task start date

    @Column(name = "due_date")
    private LocalDateTime dueDate;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Existing Jira-like fields
    private String storyPoints;
    private String sprint;
    private String epic;

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<TaskComment> comments = new ArrayList<>();

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<TaskTimeLog> timeLogs = new ArrayList<>();

    // NEW: Timestamped notes (editable, not deletable)
    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<TaskNote> notes = new ArrayList<>();

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getInsuranceName() { return insuranceName; }
    public void setInsuranceName(String insuranceName) { this.insuranceName = insuranceName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public TaskStatus getStatus() { return status; }
    public void setStatus(TaskStatus status) { this.status = status; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public AppUser getAssignedTo() { return assignedTo; }
    public void setAssignedTo(AppUser assignedTo) { this.assignedTo = assignedTo; }

    public AppUser getAssignedBy() { return assignedBy; }
    public void setAssignedBy(AppUser assignedBy) { this.assignedBy = assignedBy; }

    public Long getRelatedProviderId() { return relatedProviderId; }
    public void setRelatedProviderId(Long relatedProviderId) { this.relatedProviderId = relatedProviderId; }

    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }

    public LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getStoryPoints() { return storyPoints; }
    public void setStoryPoints(String storyPoints) { this.storyPoints = storyPoints; }

    public String getSprint() { return sprint; }
    public void setSprint(String sprint) { this.sprint = sprint; }

    public String getEpic() { return epic; }
    public void setEpic(String epic) { this.epic = epic; }

    public List<TaskComment> getComments() { return comments; }
    public void setComments(List<TaskComment> comments) { this.comments = comments; }

    public List<TaskTimeLog> getTimeLogs() { return timeLogs; }
    public void setTimeLogs(List<TaskTimeLog> timeLogs) { this.timeLogs = timeLogs; }

    public List<TaskNote> getNotes() { return notes; }
    public void setNotes(List<TaskNote> notes) { this.notes = notes; }
}