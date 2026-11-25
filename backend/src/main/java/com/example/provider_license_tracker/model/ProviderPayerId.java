package com.example.provider_license_tracker.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "provider_payer_ids")
public class ProviderPayerId {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long providerId;
    private String state;
    private String medicarePtan;
    private String medicarePin;
    private String medicaidId;
    private String medicaidProviderNumber;
    private String commercialIds;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String payerType;

    public ProviderPayerId() {}
    public String getPayerType() { return payerType; }
    public void setPayerType(String payerType) { this.payerType = payerType; }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProviderId() { return providerId; }
    public void setProviderId(Long providerId) { this.providerId = providerId; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getMedicarePtan() { return medicarePtan; }
    public void setMedicarePtan(String medicarePtan) { this.medicarePtan = medicarePtan; }

    public String getMedicarePin() { return medicarePin; }
    public void setMedicarePin(String medicarePin) { this.medicarePin = medicarePin; }

    public String getMedicaidId() { return medicaidId; }
    public void setMedicaidId(String medicaidId) { this.medicaidId = medicaidId; }

    public String getMedicaidProviderNumber() { return medicaidProviderNumber; }
    public void setMedicaidProviderNumber(String medicaidProviderNumber) { this.medicaidProviderNumber = medicaidProviderNumber; }

    public String getCommercialIds() { return commercialIds; }
    public void setCommercialIds(String commercialIds) { this.commercialIds = commercialIds; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}