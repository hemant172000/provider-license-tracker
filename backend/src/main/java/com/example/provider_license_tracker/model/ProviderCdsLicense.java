package com.example.provider_license_tracker.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "provider_cds_license")
public class ProviderCdsLicense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "provider_id", nullable = false)
    private Long providerId;

    @Column(name = "dea_number", length = 20)
    private String deaNumber;

    @Column(name = "dea_issue_date")
    private LocalDate deaIssueDate;

    @Column(name = "dea_expiration_date")
    private LocalDate deaExpirationDate;

    @Column(name = "cds_number", length = 50)
    private String cdsNumber;

    @Column(name = "cds_state", length = 2)
    private String cdsState;

    @Column(name = "cds_issue_date")
    private LocalDate cdsIssueDate;

    @Column(name = "cds_expiration_date")
    private LocalDate cdsExpirationDate;

    @Column(name = "do_not_prescribe")
    private Boolean doNotPrescribe = false;

    // Default constructor
    public ProviderCdsLicense() {}

    public Boolean getDoNotPrescribe() { return doNotPrescribe; }
    public void setDoNotPrescribe(Boolean doNotPrescribe) { this.doNotPrescribe = doNotPrescribe; }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getProviderId() {
        return providerId;
    }

    public void setProviderId(Long providerId) {
        this.providerId = providerId;
    }

    public String getDeaNumber() {
        return deaNumber;
    }

    public void setDeaNumber(String deaNumber) {
        this.deaNumber = deaNumber;
    }

    public LocalDate getDeaIssueDate() {
        return deaIssueDate;
    }

    public void setDeaIssueDate(LocalDate deaIssueDate) {
        this.deaIssueDate = deaIssueDate;
    }

    public LocalDate getDeaExpirationDate() {
        return deaExpirationDate;
    }

    public void setDeaExpirationDate(LocalDate deaExpirationDate) {
        this.deaExpirationDate = deaExpirationDate;
    }

    public String getCdsNumber() {
        return cdsNumber;
    }

    public void setCdsNumber(String cdsNumber) {
        this.cdsNumber = cdsNumber;
    }

    public String getCdsState() {
        return cdsState;
    }

    public void setCdsState(String cdsState) {
        this.cdsState = cdsState;
    }

    public LocalDate getCdsIssueDate() {
        return cdsIssueDate;
    }

    public void setCdsIssueDate(LocalDate cdsIssueDate) {
        this.cdsIssueDate = cdsIssueDate;
    }

    public LocalDate getCdsExpirationDate() {
        return cdsExpirationDate;
    }

    public void setCdsExpirationDate(LocalDate cdsExpirationDate) {
        this.cdsExpirationDate = cdsExpirationDate;
    }
}