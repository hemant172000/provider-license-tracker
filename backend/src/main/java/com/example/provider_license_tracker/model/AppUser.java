package com.example.provider_license_tracker.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import org.hibernate.annotations.Check;

import java.time.LocalDateTime;
import java.util.List;

@Entity
public class AppUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    @JsonProperty("role")
    @Column(nullable = false)
    @Check(constraints = "role IN ('ADMIN', 'PROVIDER', 'TEAM_MEMBER', 'TEAM_LEADER', 'GROUP_MGR')")
    private String role;

    private String fullName;
    private String email;
    private String phoneNumber;
    private String department;  // Charge Entry, Posting, Accounts Receivable, Credentialing
    private String specialty;
    private String status;
    private LocalDateTime createdAt;

    // For TEAM_LEADER - which department they lead
    private String leadingDepartment;

    // For TEAM_MEMBER - which team leader they report to
    @ManyToOne
    @JoinColumn(name = "reports_to_id")
    private AppUser reportsTo;

    @JsonIgnore
    @OneToMany(mappedBy = "reportsTo")
    private List<AppUser> teamMembers;

    @JsonIgnore
    @OneToMany(mappedBy = "assignedTeamMember")
    private List<Provider> assignedProviders;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getSpecialty() { return specialty; }
    public void setSpecialty(String specialty) { this.specialty = specialty; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getLeadingDepartment() { return leadingDepartment; }
    public void setLeadingDepartment(String leadingDepartment) { this.leadingDepartment = leadingDepartment; }

    public AppUser getReportsTo() { return reportsTo; }
    public void setReportsTo(AppUser reportsTo) { this.reportsTo = reportsTo; }

    public List<AppUser> getTeamMembers() { return teamMembers; }
    public void setTeamMembers(List<AppUser> teamMembers) { this.teamMembers = teamMembers; }

    public List<Provider> getAssignedProviders() { return assignedProviders; }
    public void setAssignedProviders(List<Provider> assignedProviders) { this.assignedProviders = assignedProviders; }
}