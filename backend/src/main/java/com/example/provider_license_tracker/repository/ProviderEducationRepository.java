// ProviderEducationRepository.java
package com.example.provider_license_tracker.repository;

import com.example.provider_license_tracker.model.ProviderEducation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;


// ProviderEducationRepository.java - add these methods
public interface ProviderEducationRepository extends JpaRepository<ProviderEducation, Long> {
    List<ProviderEducation> findByProviderId(Long providerId);
    void deleteByProviderId(Long providerId);
}