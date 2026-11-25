// ProviderPracticeLocationRepository.java
package com.example.provider_license_tracker.repository;

import com.example.provider_license_tracker.model.ProviderPracticeLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProviderPracticeLocationRepository extends JpaRepository<ProviderPracticeLocation, Long> {
    List<ProviderPracticeLocation> findByProviderId(Long providerId);
    void deleteByProviderId(Long providerId);
}