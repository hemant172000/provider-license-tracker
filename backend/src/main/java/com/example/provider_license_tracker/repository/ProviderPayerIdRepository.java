// ProviderPayerIdRepository.java
package com.example.provider_license_tracker.repository;

import com.example.provider_license_tracker.model.ProviderPayerId;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProviderPayerIdRepository extends JpaRepository<ProviderPayerId, Long> {
    List<ProviderPayerId> findByProviderId(Long providerId);
    void deleteByProviderId(Long providerId);
}