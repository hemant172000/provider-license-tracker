package com.example.provider_license_tracker.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "provider_group")
public class ProviderGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "provider_id", nullable = false)
    private Long providerId;

    @Column(name = "group_id", nullable = false)
    private Long groupId;

    @Column(name = "is_primary")
    private boolean isPrimary = false;

    @Column(name = "linked_at")
    private LocalDateTime linkedAt;

    @Column(name = "unlinked_at")
    private LocalDateTime unlinkedAt;

    // Constructors
    public ProviderGroup() {
        this.linkedAt = LocalDateTime.now();
    }

    public ProviderGroup(Long providerId, Long groupId) {
        this.providerId = providerId;
        this.groupId = groupId;
        this.linkedAt = LocalDateTime.now();
        this.isPrimary = false;
    }

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

    public Long getGroupId() {
        return groupId;
    }

    public void setGroupId(Long groupId) {
        this.groupId = groupId;
    }

    public boolean isPrimary() {
        return isPrimary;
    }

    public void setPrimary(boolean primary) {
        isPrimary = primary;
    }

    public LocalDateTime getLinkedAt() {
        return linkedAt;
    }

    public void setLinkedAt(LocalDateTime linkedAt) {
        this.linkedAt = linkedAt;
    }

    public LocalDateTime getUnlinkedAt() {
        return unlinkedAt;
    }

    public void setUnlinkedAt(LocalDateTime unlinkedAt) {
        this.unlinkedAt = unlinkedAt;
    }

    @Override
    public String toString() {
        return "ProviderGroup{" +
                "id=" + id +
                ", providerId=" + providerId +
                ", groupId=" + groupId +
                ", isPrimary=" + isPrimary +
                ", linkedAt=" + linkedAt +
                '}';
    }
}