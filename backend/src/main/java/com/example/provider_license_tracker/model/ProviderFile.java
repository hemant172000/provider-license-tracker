package com.example.provider_license_tracker.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "provider_file")
public class ProviderFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long providerId;
    private Long uploadedByUserId;
    private String fileName;
    private String fileType;
    private String filePath;
    private LocalDateTime uploadedAt;
    private LocalDateTime updatedAt;  // Add this field

    // New fields for version control
    private boolean isCurrent = true;
    private Integer version = 1;
    private Long replacedByFileId;
    private String status; // CURRENT, REPLACED, EXPIRED, ARCHIVED
    private String replacementReason;
    private LocalDateTime expiryDate;
    private String documentId;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProviderId() { return providerId; }
    public void setProviderId(Long providerId) { this.providerId = providerId; }

    public Long getUploadedByUserId() { return uploadedByUserId; }
    public void setUploadedByUserId(Long uploadedByUserId) { this.uploadedByUserId = uploadedByUserId; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }

    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }

    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }  // Add getter
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }  // Add setter

    public boolean isCurrent() { return isCurrent; }
    public void setCurrent(boolean current) { isCurrent = current; }

    public Integer getVersion() { return version; }
    public void setVersion(Integer version) { this.version = version; }

    public Long getReplacedByFileId() { return replacedByFileId; }
    public void setReplacedByFileId(Long replacedByFileId) { this.replacedByFileId = replacedByFileId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getReplacementReason() { return replacementReason; }
    public void setReplacementReason(String replacementReason) { this.replacementReason = replacementReason; }

    public LocalDateTime getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDateTime expiryDate) { this.expiryDate = expiryDate; }

    public String getDocumentId() { return documentId; }
    public void setDocumentId(String documentId) { this.documentId = documentId; }
}