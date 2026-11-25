package com.example.provider_license_tracker.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "provider_caqh_info")
public class ProviderCaqhInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "provider_id", nullable = false)
    private Long providerId;

    @Column(name = "caqh_id", length = 50)
    private String caqhId;

    @Column(name = "caqh_username", length = 100)
    private String caqhUsername;

    @Column(name = "caqh_password", length = 255)
    private String caqhPassword;

    @Column(name = "last_attestation_date")
    private LocalDate lastAttestationDate;

    // Default constructor
    public ProviderCaqhInfo() {}

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

    public String getCaqhId() {
        return caqhId;
    }

    public void setCaqhId(String caqhId) {
        this.caqhId = caqhId;
    }

    public String getCaqhUsername() {
        return caqhUsername;
    }

    public void setCaqhUsername(String caqhUsername) {
        this.caqhUsername = caqhUsername;
    }

    public String getCaqhPassword() {
        return caqhPassword;
    }

    public void setCaqhPassword(String caqhPassword) {
        this.caqhPassword = caqhPassword;
    }

    public LocalDate getLastAttestationDate() {
        return lastAttestationDate;
    }

    public void setLastAttestationDate(LocalDate lastAttestationDate) {
        this.lastAttestationDate = lastAttestationDate;
    }
}