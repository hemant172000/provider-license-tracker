package com.example.provider_license_tracker.repository;

import com.example.provider_license_tracker.model.ProviderFile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProviderFileRepository extends JpaRepository<ProviderFile, Long> {
    List<ProviderFile> findByProviderId(Long providerId);
    List<ProviderFile> findByProviderIdAndFileType(Long providerId, String fileType);
    Optional<ProviderFile> findByFilePath(String filePath);
    Optional<ProviderFile> findByProviderIdAndFileTypeAndIsCurrentTrue(Long providerId, String fileType);
    List<ProviderFile> findByDocumentIdOrderByVersionDesc(String documentId);
}