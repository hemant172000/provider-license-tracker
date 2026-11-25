// ProviderBoardCertificationRepository.java
package com.example.provider_license_tracker.repository;

import com.example.provider_license_tracker.model.ProviderBoardCertification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProviderBoardCertificationRepository extends JpaRepository<ProviderBoardCertification, Long> {
    List<ProviderBoardCertification> findByProviderId(Long providerId);
    void deleteByProviderId(Long providerId);
}