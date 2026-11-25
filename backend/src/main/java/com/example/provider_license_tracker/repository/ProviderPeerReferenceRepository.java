// ProviderPeerReferenceRepository.java
package com.example.provider_license_tracker.repository;

import com.example.provider_license_tracker.model.ProviderPeerReference;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProviderPeerReferenceRepository extends JpaRepository<ProviderPeerReference, Long> {
    List<ProviderPeerReference> findByProviderId(Long providerId);
    void deleteByProviderId(Long providerId);
}