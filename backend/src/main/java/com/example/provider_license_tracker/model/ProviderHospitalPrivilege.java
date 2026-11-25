package com.example.provider_license_tracker.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "provider_hospital_privileges")
public class ProviderHospitalPrivilege {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long providerId;
    private String hospitalName;
    private String privilegeType;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean isCurrent = true;
    private String department;
    private String filePath;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean isPrimaryHospital = false;
    private String privilegeLevel;
    private String privilegeDescription;
    private String patientPercentage;
    private Boolean noPrivileges = false;
    private String noPrivilegesReason;
    @Column(name = "privilege_status")
    private String privilegeStatus = "Active";

    @Column(name = "has_non_admitting_affiliation")
    private Boolean hasNonAdmittingAffiliation = false;

    @Column(name = "non_admitting_description")
    private String nonAdmittingDescription;

    public ProviderHospitalPrivilege() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProviderId() { return providerId; }
    public void setProviderId(Long providerId) { this.providerId = providerId; }

    public String getHospitalName() { return hospitalName; }
    public void setHospitalName(String hospitalName) { this.hospitalName = hospitalName; }

    public String getPrivilegeType() { return privilegeType; }
    public void setPrivilegeType(String privilegeType) { this.privilegeType = privilegeType; }

    public Boolean getHasNonAdmittingAffiliation() { return hasNonAdmittingAffiliation; }
    public void setHasNonAdmittingAffiliation(Boolean hasNonAdmittingAffiliation) { this.hasNonAdmittingAffiliation = hasNonAdmittingAffiliation; }

    public String getNonAdmittingDescription() { return nonAdmittingDescription; }
    public void setNonAdmittingDescription(String nonAdmittingDescription) { this.nonAdmittingDescription = nonAdmittingDescription; }

    public String getPrivilegeStatus() { return privilegeStatus; }
    public void setPrivilegeStatus(String privilegeStatus) { this.privilegeStatus = privilegeStatus; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public Boolean getIsCurrent() { return isCurrent; }
    public void setIsCurrent(Boolean isCurrent) { this.isCurrent = isCurrent; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Boolean getIsPrimaryHospital() { return isPrimaryHospital; }
    public void setIsPrimaryHospital(Boolean isPrimaryHospital) { this.isPrimaryHospital = isPrimaryHospital; }

    public String getPrivilegeLevel() { return privilegeLevel; }
    public void setPrivilegeLevel(String privilegeLevel) { this.privilegeLevel = privilegeLevel; }

    public String getPrivilegeDescription() { return privilegeDescription; }
    public void setPrivilegeDescription(String privilegeDescription) { this.privilegeDescription = privilegeDescription; }

    public String getPatientPercentage() { return patientPercentage; }
    public void setPatientPercentage(String patientPercentage) { this.patientPercentage = patientPercentage; }

    public Boolean getNoPrivileges() { return noPrivileges; }
    public void setNoPrivileges(Boolean noPrivileges) { this.noPrivileges = noPrivileges; }

    public String getNoPrivilegesReason() { return noPrivilegesReason; }
    public void setNoPrivilegesReason(String noPrivilegesReason) { this.noPrivilegesReason = noPrivilegesReason; }

    public Boolean isCurrent() { return isCurrent; }
    public void setCurrent(Boolean isCurrent) { this.isCurrent = isCurrent; }

}