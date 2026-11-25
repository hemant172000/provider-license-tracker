package com.example.provider_license_tracker.repository;

import com.example.provider_license_tracker.model.AppUser;
import com.example.provider_license_tracker.model.Provider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface ProviderRepository extends JpaRepository<Provider, Long> {

    List<Provider> findByAssignedTeamMember(AppUser teamMember);


    Optional<Provider> findByAppUserId(Long appUserId);

    List<Provider> findByGroupId(Long groupId);

    // Add this method for counting providers in a group
    long countByGroupId(Long groupId);

    // Add this method for team leader providers
    List<Provider> findByAssignedTeamMemberIn(List<AppUser> teamMembers);

    // Optional: Get providers with their assigned team member
    @Query("SELECT p FROM Provider p LEFT JOIN FETCH p.assignedTeamMember WHERE p.groupId = :groupId")
    List<Provider> findByGroupIdWithTeamMember(@Param("groupId") Long groupId);
}