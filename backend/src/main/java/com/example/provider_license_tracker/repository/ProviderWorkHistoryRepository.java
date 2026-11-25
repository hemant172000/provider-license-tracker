// ProviderWorkHistoryRepository.java
package com.example.provider_license_tracker.repository;

import com.example.provider_license_tracker.model.ProviderWorkHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProviderWorkHistoryRepository extends JpaRepository<ProviderWorkHistory, Long> {
    List<ProviderWorkHistory> findByProviderId(Long providerId);
    void deleteByProviderId(Long providerId);
}