package com.example.provider_license_tracker.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "provider_credentialing")
public class ProviderCredentialing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "provider_id", nullable = false)
    private Long providerId;

    @Column(name = "group_id")
    private Long groupId;

    @Column(name = "payer_name", nullable = false)
    private String payerName;

    @Column(name = "lob")
    private String lob;  // Line of Business

    @Column(name = "network")
    private String network;

    @Column(name = "product")
    private String product;

    @Column(name = "plan")
    private String plan;

    @Column(name = "status")
    private String status;

    @Column(name = "managing_entity")
    private String managingEntity;

    @Column(name = "application_date")
    private LocalDate applicationDate;

    @Column(name = "credentialing_effective_date")
    private LocalDate credentialingEffectiveDate;

    @Column(name = "link_effective_date")
    private LocalDate linkEffectiveDate;

    @Column(name = "recredentialing_date")
    private LocalDate recredentialingDate;

    @Column(name = "termination_date")
    private LocalDate terminationDate;

    @Column(name = "provider_rep")
    private String providerRep;

    @Column(name = "contracting_rep")
    private String contractingRep;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by")
    private Long createdBy;

    // ==================== CONSTRUCTORS ====================

    public ProviderCredentialing() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // ==================== GETTERS AND SETTERS ====================

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

    public Long getGroupId() {
        return groupId;
    }

    public void setGroupId(Long groupId) {
        this.groupId = groupId;
    }

    public String getPayerName() {
        return payerName;
    }

    public void setPayerName(String payerName) {
        this.payerName = payerName;
    }

    public String getLob() {
        return lob;
    }

    public void setLob(String lob) {
        this.lob = lob;
    }

    public String getNetwork() {
        return network;
    }

    public void setNetwork(String network) {
        this.network = network;
    }

    public String getProduct() {
        return product;
    }

    public void setProduct(String product) {
        this.product = product;
    }

    public String getPlan() {
        return plan;
    }

    public void setPlan(String plan) {
        this.plan = plan;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getManagingEntity() {
        return managingEntity;
    }

    public void setManagingEntity(String managingEntity) {
        this.managingEntity = managingEntity;
    }

    public LocalDate getApplicationDate() {
        return applicationDate;
    }

    public void setApplicationDate(LocalDate applicationDate) {
        this.applicationDate = applicationDate;
    }

    public LocalDate getCredentialingEffectiveDate() {
        return credentialingEffectiveDate;
    }

    public void setCredentialingEffectiveDate(LocalDate credentialingEffectiveDate) {
        this.credentialingEffectiveDate = credentialingEffectiveDate;
    }

    public LocalDate getLinkEffectiveDate() {
        return linkEffectiveDate;
    }

    public void setLinkEffectiveDate(LocalDate linkEffectiveDate) {
        this.linkEffectiveDate = linkEffectiveDate;
    }

    public LocalDate getRecredentialingDate() {
        return recredentialingDate;
    }

    public void setRecredentialingDate(LocalDate recredentialingDate) {
        this.recredentialingDate = recredentialingDate;
    }

    public LocalDate getTerminationDate() {
        return terminationDate;
    }

    public void setTerminationDate(LocalDate terminationDate) {
        this.terminationDate = terminationDate;
    }

    public String getProviderRep() {
        return providerRep;
    }

    public void setProviderRep(String providerRep) {
        this.providerRep = providerRep;
    }

    public String getContractingRep() {
        return contractingRep;
    }

    public void setContractingRep(String contractingRep) {
        this.contractingRep = contractingRep;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Long getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Long createdBy) {
        this.createdBy = createdBy;
    }

    // ==================== TO STRING ====================

    @Override
    public String toString() {
        return "ProviderCredentialing{" +
                "id=" + id +
                ", providerId=" + providerId +
                ", groupId=" + groupId +
                ", payerName='" + payerName + '\'' +
                ", status='" + status + '\'' +
                '}';
    }
}