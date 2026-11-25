// ProviderMalpracticeRepository.java
package com.example.provider_license_tracker.repository;

import com.example.provider_license_tracker.model.ProviderMalpractice;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProviderMalpracticeRepository extends JpaRepository<ProviderMalpractice, Long> {
    List<ProviderMalpractice> findByProviderId(Long providerId);
    void deleteByProviderId(Long providerId);
}