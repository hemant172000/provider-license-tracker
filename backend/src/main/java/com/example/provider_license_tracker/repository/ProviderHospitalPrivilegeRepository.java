// ProviderHospitalPrivilegeRepository.java
package com.example.provider_license_tracker.repository;

import com.example.provider_license_tracker.model.ProviderHospitalPrivilege;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProviderHospitalPrivilegeRepository extends JpaRepository<ProviderHospitalPrivilege, Long> {
    List<ProviderHospitalPrivilege> findByProviderId(Long providerId);
    void deleteByProviderId(Long providerId);
}