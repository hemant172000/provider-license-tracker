package com.example.provider_license_tracker.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "project_task_time_logs")
public class ProjectTaskTimeLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "task_id", nullable = false)
    private Long taskId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "hours_spent", nullable = false)
    private Integer hoursSpent;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "logged_at")
    private LocalDateTime loggedAt;

    // Transient fields for response
    @Transient
    private String userName;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getTaskId() { return taskId; }
    public void setTaskId(Long taskId) { this.taskId = taskId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Integer getHoursSpent() { return hoursSpent; }
    public void setHoursSpent(Integer hoursSpent) { this.hoursSpent = hoursSpent; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getLoggedAt() { return loggedAt; }
    public void setLoggedAt(LocalDateTime loggedAt) { this.loggedAt = loggedAt; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
}