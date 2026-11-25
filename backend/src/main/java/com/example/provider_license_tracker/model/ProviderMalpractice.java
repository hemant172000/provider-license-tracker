package com.example.provider_license_tracker.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "provider_malpractice")
public class ProviderMalpractice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long providerId;
    private String carrierName;
    private String policyNumber;
    private String coverageLimit;
    private LocalDate effectiveDate;
    private LocalDate expirationDate;
    private String policyType;
    private Boolean tailCoverage = false;
    private String filePath;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @Column(name = "per_occurrence_limit")
    private String perOccurrenceLimit;

    @Column(name = "aggregate_limit")
    private String aggregateLimit;

    public ProviderMalpractice() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPerOccurrenceLimit() { return perOccurrenceLimit; }
    public void setPerOccurrenceLimit(String perOccurrenceLimit) { this.perOccurrenceLimit = perOccurrenceLimit; }

    public String getAggregateLimit() { return aggregateLimit; }
    public void setAggregateLimit(String aggregateLimit) { this.aggregateLimit = aggregateLimit; }

    public Long getProviderId() { return providerId; }
    public void setProviderId(Long providerId) { this.providerId = providerId; }

    public String getCarrierName() { return carrierName; }
    public void setCarrierName(String carrierName) { this.carrierName = carrierName; }

    public String getPolicyNumber() { return policyNumber; }
    public void setPolicyNumber(String policyNumber) { this.policyNumber = policyNumber; }

    public String getCoverageLimit() { return coverageLimit; }
    public void setCoverageLimit(String coverageLimit) { this.coverageLimit = coverageLimit; }

    public LocalDate getEffectiveDate() { return effectiveDate; }
    public void setEffectiveDate(LocalDate effectiveDate) { this.effectiveDate = effectiveDate; }

    public LocalDate getExpirationDate() { return expirationDate; }
    public void setExpirationDate(LocalDate expirationDate) { this.expirationDate = expirationDate; }

    public String getPolicyType() { return policyType; }
    public void setPolicyType(String policyType) { this.policyType = policyType; }

    public Boolean getTailCoverage() { return tailCoverage; }
    public void setTailCoverage(Boolean tailCoverage) { this.tailCoverage = tailCoverage; }

    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public boolean isTailCoverage() {
        return tailCoverage;
    }
}