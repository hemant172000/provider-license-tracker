package com.example.provider_license_tracker.repository;

import com.example.provider_license_tracker.model.ProviderCaqhInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ProviderCaqhInfoRepository extends JpaRepository<ProviderCaqhInfo, Long> {
    Optional<ProviderCaqhInfo> findByProviderId(Long providerId);
}