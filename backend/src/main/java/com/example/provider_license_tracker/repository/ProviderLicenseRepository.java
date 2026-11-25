// ProviderLicenseRepository.java
package com.example.provider_license_tracker.repository;

import com.example.provider_license_tracker.model.ProviderLicense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProviderLicenseRepository extends JpaRepository<ProviderLicense, Long> {
    List<ProviderLicense> findByProviderId(Long providerId);
    void deleteByProviderId(Long providerId);
}