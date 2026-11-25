package com.example.provider_license_tracker.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "provider_practice_locations")
public class ProviderPracticeLocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long providerId;
    private String practiceName;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String zipCode;
    private String phone;
    private String fax;
    private Boolean isPrimary = false;
    private Boolean acceptingPatients = true;
    private String hospitalAffiliations;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean isHospitalist = false;
    private String startDateWithGroup;
    private String cvFilePath;

    public ProviderPracticeLocation() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProviderId() { return providerId; }
    public void setProviderId(Long providerId) { this.providerId = providerId; }

    public String getPracticeName() { return practiceName; }
    public void setPracticeName(String practiceName) { this.practiceName = practiceName; }

    public String getAddressLine1() { return addressLine1; }
    public void setAddressLine1(String addressLine1) { this.addressLine1 = addressLine1; }

    public String getAddressLine2() { return addressLine2; }
    public void setAddressLine2(String addressLine2) { this.addressLine2 = addressLine2; }

    public Boolean getIsHospitalist() { return isHospitalist; }
    public void setIsHospitalist(Boolean isHospitalist) { this.isHospitalist = isHospitalist; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getZipCode() { return zipCode; }
    public void setZipCode(String zipCode) { this.zipCode = zipCode; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getFax() { return fax; }
    public void setFax(String fax) { this.fax = fax; }

    public Boolean getIsPrimary() { return isPrimary; }
    public void setIsPrimary(Boolean isPrimary) { this.isPrimary = isPrimary; }

    public Boolean getAcceptingPatients() { return acceptingPatients; }
    public void setAcceptingPatients(Boolean acceptingPatients) { this.acceptingPatients = acceptingPatients; }

    public String getHospitalAffiliations() { return hospitalAffiliations; }
    public void setHospitalAffiliations(String hospitalAffiliations) { this.hospitalAffiliations = hospitalAffiliations; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getStartDateWithGroup() { return startDateWithGroup; }
    public void setStartDateWithGroup(String startDateWithGroup) { this.startDateWithGroup = startDateWithGroup; }

    public String getCvFilePath() { return cvFilePath; }
    public void setCvFilePath(String cvFilePath) { this.cvFilePath = cvFilePath; }

    public boolean isPrimary() {
        return isPrimary;
    }

    public void setPrimary(boolean primary) {
        isPrimary = primary;
    }

    public boolean isAcceptingPatients() {
        return acceptingPatients;
    }

    public void setAcceptingPatients(boolean acceptingPatients) {
        this.acceptingPatients = acceptingPatients;
    }
}