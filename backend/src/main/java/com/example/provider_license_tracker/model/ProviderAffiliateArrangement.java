package com.example.provider_license_tracker.model;


import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "provider_affiliate_arrangements")
public class ProviderAffiliateArrangement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "provider_id", nullable = false)
    private Long providerId;

    @Column(name = "arrangement_type", nullable = false)
    private String arrangementType; // INDIVIDUAL or GROUP

    // Individual Provider fields
    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    private String specialty;
    private String phone;
    private String email;

    @Column(name = "npi_number")
    private String npiNumber;

    // Group fields
    @Column(name = "group_name")
    private String groupName;

    @Column(name = "organization_npi")
    private String organizationNpi;

    @Column(name = "group_phone")
    private String groupPhone;

    @Column(name = "group_email")
    private String groupEmail;

    @Column(name = "arrangement_description", nullable = false, columnDefinition = "TEXT")
    private String arrangementDescription;

    @Column(name = "file_path")
    private String filePath;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProviderId() { return providerId; }
    public void setProviderId(Long providerId) { this.providerId = providerId; }

    public String getArrangementType() { return arrangementType; }
    public void setArrangementType(String arrangementType) { this.arrangementType = arrangementType; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getSpecialty() { return specialty; }
    public void setSpecialty(String specialty) { this.specialty = specialty; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getNpiNumber() { return npiNumber; }
    public void setNpiNumber(String npiNumber) { this.npiNumber = npiNumber; }

    public String getGroupName() { return groupName; }
    public void setGroupName(String groupName) { this.groupName = groupName; }

    public String getOrganizationNpi() { return organizationNpi; }
    public void setOrganizationNpi(String organizationNpi) { this.organizationNpi = organizationNpi; }

    public String getGroupPhone() { return groupPhone; }
    public void setGroupPhone(String groupPhone) { this.groupPhone = groupPhone; }

    public String getGroupEmail() { return groupEmail; }
    public void setGroupEmail(String groupEmail) { this.groupEmail = groupEmail; }

    public String getArrangementDescription() { return arrangementDescription; }
    public void setArrangementDescription(String arrangementDescription) { this.arrangementDescription = arrangementDescription; }

    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
