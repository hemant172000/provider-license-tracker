package com.example.provider_license_tracker.repository;

import com.example.provider_license_tracker.model.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<AppUser, Long> {

    Optional<AppUser> findByUsername(String username);

    List<AppUser> findByRole(String role);

    Optional<AppUser> findById(Long id);

    // Get team members reporting to a specific team leader
    @Query("SELECT u FROM AppUser u WHERE u.reportsTo.id = :leaderId")
    List<AppUser> findByReportsTo(@Param("leaderId") Long leaderId);

    // Get team leader by role and leading department
    List<AppUser> findByRoleAndLeadingDepartment(String role, String leadingDepartment);

    // Get unassigned team members (no team leader assigned yet)
    @Query("SELECT u FROM AppUser u WHERE u.role = 'TEAM_MEMBER' AND u.reportsTo IS NULL")
    List<AppUser> findUnassignedTeamMembers();

    // Find team members assigned to a specific team leader
    @Query("SELECT u FROM AppUser u WHERE u.role = 'TEAM_MEMBER' AND u.reportsTo.id = :leaderId")
    List<AppUser> findTeamMembersByLeaderId(@Param("leaderId") Long leaderId);

    // ==================== NEW METHODS FOR STEP 1 ====================

    /**
     * Get all assignable users (TEAM_MEMBER and TEAM_LEADER)
     * Used for task/project assignments
     */
    @Query("SELECT u FROM AppUser u WHERE u.role IN ('TEAM_MEMBER', 'TEAM_LEADER') AND u.status = 'Active'")
    List<AppUser> findAssignableUsers();

    /**
     * Get assignable users excluding a specific user (for self-assignment prevention)
     */
    @Query("SELECT u FROM AppUser u WHERE u.role IN ('TEAM_MEMBER', 'TEAM_LEADER') AND u.status = 'Active' AND u.id != :excludeUserId")
    List<AppUser> findAssignableUsersExcluding(@Param("excludeUserId") Long excludeUserId);

    /**
     * Get all Team Leaders (for cross-assignment between leaders)
     */
    @Query("SELECT u FROM AppUser u WHERE u.role = 'TEAM_LEADER' AND u.status = 'Active'")
    List<AppUser> findAllTeamLeaders();

    /**
     * Get Team Leaders excluding a specific leader (for cross-assignment)
     */
    @Query("SELECT u FROM AppUser u WHERE u.role = 'TEAM_LEADER' AND u.status = 'Active' AND u.id != :excludeLeaderId")
    List<AppUser> findTeamLeadersExcluding(@Param("excludeLeaderId") Long excludeLeaderId);
}