package com.example.provider_license_tracker.dto;

import java.time.LocalDateTime;

public class TaskDTO {
    private String title;
    private String description;
    private String priority; // HIGH, MEDIUM, LOW
    private Long assignedToUserId;
    private Long relatedProviderId;
    private LocalDateTime dueDate;

    // Getters and Setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public Long getAssignedToUserId() { return assignedToUserId; }
    public void setAssignedToUserId(Long assignedToUserId) { this.assignedToUserId = assignedToUserId; }

    public Long getRelatedProviderId() { return relatedProviderId; }
    public void setRelatedProviderId(Long relatedProviderId) { this.relatedProviderId = relatedProviderId; }

    public LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }
}