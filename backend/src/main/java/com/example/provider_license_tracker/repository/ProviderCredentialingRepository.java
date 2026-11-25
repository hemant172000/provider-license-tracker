package com.example.provider_license_tracker.repository;

import com.example.provider_license_tracker.model.ProviderCredentialing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProviderCredentialingRepository extends JpaRepository<ProviderCredentialing, Long> {

    // Add this method to ProviderCredentialingRepository.java

    /**
     * Find all credentialing records for a specific group and payer name
     */
    List<ProviderCredentialing> findByGroupIdAndPayerName(Long groupId, String payerName);

    /**
     * Get distinct payer names for a group (for the summary list)
     */
    @Query("SELECT DISTINCT p.payerName FROM ProviderCredentialing p WHERE p.groupId = :groupId ORDER BY p.payerName")
    List<String> findDistinctPayerNamesByGroupId(@Param("groupId") Long groupId);

    /**
     * Get summary counts for a group grouped by payer name
     */
    @Query("SELECT p.payerName, COUNT(p), " +
            "SUM(CASE WHEN LOWER(p.status) = 'active' THEN 1 ELSE 0 END), " +
            "SUM(CASE WHEN LOWER(p.status) = 'pending' THEN 1 ELSE 0 END), " +
            "SUM(CASE WHEN LOWER(p.status) = 'expired' THEN 1 ELSE 0 END) " +
            "FROM ProviderCredentialing p WHERE p.groupId = :groupId GROUP BY p.payerName")
    List<Object[]> findSummaryByGroupId(@Param("groupId") Long groupId);

    /**
     * Find all credentialing records for a specific provider
     */
    List<ProviderCredentialing> findByProviderId(Long providerId);

    /**
     * Find all credentialing records for a specific group
     */
    List<ProviderCredentialing> findByGroupId(Long groupId);

    /**
     * Find all credentialing records for a provider in a specific group
     */
    List<ProviderCredentialing> findByProviderIdAndGroupId(Long providerId, Long groupId);

    /**
     * Find a specific credentialing record by ID
     */
    Optional<ProviderCredentialing> findById(Long id);

    /**
     * Find all credentialing records by status
     */
    List<ProviderCredentialing> findByStatus(String status);

    /**
     * Find all credentialing records by payer name
     */
    List<ProviderCredentialing> findByPayerName(String payerName);

    /**
     * Find credentialing records expiring soon (recredentialing date within next X days)
     */
    List<ProviderCredentialing> findByRecredentialingDateBetween(java.time.LocalDate startDate, java.time.LocalDate endDate);

    /**
     * Find credentialing records with termination date before a given date
     */
    List<ProviderCredentialing> findByTerminationDateBefore(java.time.LocalDate date);

    /**
     * Delete all credentialing records for a specific provider
     */
    void deleteByProviderId(Long providerId);

    /**
     * Delete all credentialing records for a specific group
     */
    void deleteByGroupId(Long groupId);

    /**
     * Count credentialing records for a provider
     */
    long countByProviderId(Long providerId);

    /**
     * Count credentialing records by status for a provider
     */
    long countByProviderIdAndStatus(Long providerId, String status);

    /**
     * Find all credentialing records for a provider, ordered by payer name
     */
    List<ProviderCredentialing> findByProviderIdOrderByPayerNameAsc(Long providerId);

    /**
     * Find all credentialing records for a provider, ordered by effective date (newest first)
     */
    List<ProviderCredentialing> findByProviderIdOrderByCredentialingEffectiveDateDesc(Long providerId);

    /**
     * Check if a credentialing record exists for a provider with a specific payer name
     */
    boolean existsByProviderIdAndPayerName(Long providerId, String payerName);

// Add this method to ProviderCredentialingRepository.java

    /**
     * Check if a credentialing record already exists for a specific combination
     * This prevents duplicate entries of the same hierarchy
     */
    boolean existsByGroupIdAndPayerNameAndLobAndNetworkAndProductAndPlan(
            Long groupId,
            String payerName,
            String lob,
            String network,
            String product,
            String plan
    );

    /**
     * Find existing record by group and hierarchy combination
     * Returns the record if it exists, so we can check before inserting
     */
    Optional<ProviderCredentialing> findByGroupIdAndPayerNameAndLobAndNetworkAndProductAndPlan(
            Long groupId,
            String payerName,
            String lob,
            String network,
            String product,
            String plan
    );

    // Add this method to ProviderCredentialingRepository.java

    /**
     * Get all credentialing records with group names for export
     * Returns: [groupName, payerName, lob, network, product, plan, status,
     *           managingEntity, applicationDate, credentialingEffectiveDate,
     *           linkEffectiveDate, recredentialingDate, terminationDate,
     *           providerRep, contractingRep]
     */
    @Query("SELECT g.name, p.payerName, p.lob, p.network, p.product, p.plan, " +
            "p.status, p.managingEntity, p.applicationDate, p.credentialingEffectiveDate, " +
            "p.linkEffectiveDate, p.recredentialingDate, p.terminationDate, " +
            "p.providerRep, p.contractingRep " +
            "FROM ProviderCredentialing p " +
            "LEFT JOIN Group g ON p.groupId = g.id " +
            "ORDER BY g.name, p.payerName")
    List<Object[]> findAllWithGroupNames();
}