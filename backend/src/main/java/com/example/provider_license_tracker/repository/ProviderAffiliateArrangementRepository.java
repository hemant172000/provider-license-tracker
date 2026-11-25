package com.example.provider_license_tracker.repository;

import com.example.provider_license_tracker.model.ProviderAffiliateArrangement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProviderAffiliateArrangementRepository extends JpaRepository<ProviderAffiliateArrangement, Long> {
    List<ProviderAffiliateArrangement> findByProviderId(Long providerId);
}