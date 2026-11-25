package com.example.provider_license_tracker.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "groups")
public class Group {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private Long managerUserId;

    @ElementCollection
    private List<Long> managerUserIds = new ArrayList<>();

    private Long teamLeaderId;
    private String teamLeaderName;

    @ElementCollection
    private List<Long> teamLeaderIds = new ArrayList<>();

    @ElementCollection
    private List<Long> teamMemberIds = new ArrayList<>();

    private LocalDateTime createdAt;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Long getManagerUserId() { return managerUserId; }
    public void setManagerUserId(Long managerUserId) { this.managerUserId = managerUserId; }

    public List<Long> getManagerUserIds() { return managerUserIds; }
    public void setManagerUserIds(List<Long> managerUserIds) { this.managerUserIds = managerUserIds; }

    public Long getTeamLeaderId() { return teamLeaderId; }
    public void setTeamLeaderId(Long teamLeaderId) { this.teamLeaderId = teamLeaderId; }

    public String getTeamLeaderName() { return teamLeaderName; }
    public void setTeamLeaderName(String teamLeaderName) { this.teamLeaderName = teamLeaderName; }

    public List<Long> getTeamLeaderIds() { return teamLeaderIds; }
    public void setTeamLeaderIds(List<Long> teamLeaderIds) { this.teamLeaderIds = teamLeaderIds; }

    public List<Long> getTeamMemberIds() { return teamMemberIds; }
    public void setTeamMemberIds(List<Long> teamMemberIds) { this.teamMemberIds = teamMemberIds; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}