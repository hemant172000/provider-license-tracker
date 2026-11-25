// ProviderCdsLicenseRepository.java
package com.example.provider_license_tracker.repository;

import com.example.provider_license_tracker.model.ProviderCdsLicense;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProviderCdsLicenseRepository extends JpaRepository<ProviderCdsLicense, Long> {
    List<ProviderCdsLicense> findByProviderId(Long providerId);
    void deleteByProviderId(Long providerId);
}