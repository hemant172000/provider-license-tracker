package com.example.provider_license_tracker.repository;

import com.example.provider_license_tracker.model.ProviderGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProviderGroupRepository extends JpaRepository<ProviderGroup, Long> {

    List<ProviderGroup> findByProviderId(Long providerId);

    List<ProviderGroup> findByGroupId(Long groupId);

    Optional<ProviderGroup> findByProviderIdAndGroupId(Long providerId, Long groupId);

    boolean existsByProviderIdAndGroupId(Long providerId, Long groupId);

    void deleteByProviderIdAndGroupId(Long providerId, Long groupId);

    List<ProviderGroup> findByProviderIdOrderByPrimaryDesc(Long providerId);
}