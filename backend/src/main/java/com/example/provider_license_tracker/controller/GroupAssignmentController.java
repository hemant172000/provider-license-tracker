package com.example.provider_license_tracker.controller;

import com.example.provider_license_tracker.model.*;
import com.example.provider_license_tracker.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.example.provider_license_tracker.model.AppUser;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Additional group-related endpoints, separate from GroupController to avoid
 * touching the existing large file. Mapped under the same /groups base path —
 * Spring allows multiple controllers to share a base path as long as the
 * specific endpoint paths don't collide.
 *
 * Covers:
 *  #1 Admin assigns a GROUP_MGR to a group        -> already in GroupController (assign-manager)
 *  #2 Team Leaders assign other Team Leaders/Team Members to a group
 *  #3 Providers linked to multiple groups/clients (many-to-many)
 *  #5 Admin group menu: assign a Team Leader and Team Member from one place
 */
@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/groups")
public class GroupAssignmentController {

    private final GroupRepository groupRepo;
    private final UserRepository userRepo;
    private final ProviderRepository providerRepo;
    private final ProviderGroupRepository providerGroupRepo;

    public GroupAssignmentController(GroupRepository groupRepo,
                                     UserRepository userRepo,
                                     ProviderRepository providerRepo,
                                     ProviderGroupRepository providerGroupRepo) {
        this.groupRepo = groupRepo;
        this.userRepo = userRepo;
        this.providerRepo = providerRepo;
        this.providerGroupRepo = providerGroupRepo;
    }

    // ==================== PERMISSION HELPER ====================

    /**
     * Returns true if the current user is allowed to manage group assignments.
     * ADMIN always allowed. TEAM_LEADER allowed only if leading Credentialing
     * (matches existing group-management permission pattern in GroupController).
     */
    private boolean canManageGroupAssignments(Principal principal) {
        if (principal == null) return false;
        AppUser user = userRepo.findByUsername(principal.getName()).orElse(null);
        if (user == null) return false;
        if ("ADMIN".equals(user.getRole())) return true;
        return "TEAM_LEADER".equals(user.getRole()) && "Credentialing".equals(user.getLeadingDepartment());
    }

    // ==================== DROPDOWN SOURCES ====================

    /** All Team Leaders, for assignment dropdowns. */
    @GetMapping("/assignable-team-leaders")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEADER')")
    public ResponseEntity<?> getAssignableTeamLeaders(Principal principal) {
        if (!canManageGroupAssignments(principal)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You don't have permission to manage group assignments"));
        }
        List<AppUser> leaders = userRepo.findByRole("TEAM_LEADER");
        List<Map<String, Object>> result = leaders.stream().map(u -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", u.getId());
            m.put("fullName", u.getFullName());
            m.put("email", u.getEmail());
            m.put("leadingDepartment", u.getLeadingDepartment());
            return m;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    /** All Team Members, for assignment dropdowns. */
    @GetMapping("/assignable-team-members")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEADER')")
    public ResponseEntity<?> getAssignableTeamMembers(Principal principal) {
        if (!canManageGroupAssignments(principal)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You don't have permission to manage group assignments"));
        }
        List<AppUser> members = userRepo.findByRole("TEAM_MEMBER");
        List<Map<String, Object>> result = members.stream().map(u -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", u.getId());
            m.put("fullName", u.getFullName());
            m.put("email", u.getEmail());
            m.put("department", u.getDepartment());
            return m;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    // ==================== VIEW CURRENT ASSIGNMENTS ====================

    /** Returns the Team Leaders and Team Members currently assigned to a group. */
    @GetMapping("/{groupId}/team-assignments")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEADER')")
    public ResponseEntity<?> getTeamAssignments(@PathVariable Long groupId, Principal principal) {
        try {
            Group group = groupRepo.findById(groupId)
                    .orElseThrow(() -> new RuntimeException("Group not found"));

            List<Map<String, Object>> teamLeaders = group.getTeamLeaderIds().stream()
                    .map(id -> userRepo.findById(id).orElse(null))
                    .filter(Objects::nonNull)
                    .map(u -> {
                        Map<String, Object> m = new HashMap<>();
                        m.put("id", u.getId());
                        m.put("fullName", u.getFullName());
                        m.put("email", u.getEmail());
                        m.put("leadingDepartment", u.getLeadingDepartment());
                        m.put("isPrimary", u.getId().equals(group.getTeamLeaderId()));
                        return m;
                    }).collect(Collectors.toList());

            List<Map<String, Object>> teamMembers = group.getTeamMemberIds().stream()
                    .map(id -> userRepo.findById(id).orElse(null))
                    .filter(Objects::nonNull)
                    .map(u -> {
                        Map<String, Object> m = new HashMap<>();
                        m.put("id", u.getId());
                        m.put("fullName", u.getFullName());
                        m.put("email", u.getEmail());
                        m.put("department", u.getDepartment());
                        return m;
                    }).collect(Collectors.toList());

            return ResponseEntity.ok(Map.of(
                    "groupId", groupId,
                    "groupName", group.getName(),
                    "teamLeaders", teamLeaders,
                    "teamMembers", teamMembers
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== ASSIGN / REMOVE TEAM LEADER ====================

    /**
     * Assign a Team Leader to a group. Used by:
     *  - Admin's group menu (#5)
     *  - Team Leaders assigning OTHER team leaders to a group (#2)
     */
    @PostMapping("/{groupId}/assign-team-leader-to-group")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEADER')")
    public ResponseEntity<?> assignTeamLeaderToGroup(@PathVariable Long groupId,
                                                     @RequestParam Long userId,
                                                     @RequestParam(required = false, defaultValue = "false") boolean primary,
                                                     Principal principal) {
        try {
            if (!canManageGroupAssignments(principal)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "You don't have permission to assign team leaders to groups"));
            }

            Group group = groupRepo.findById(groupId)
                    .orElseThrow(() -> new RuntimeException("Group not found"));

            AppUser leader = userRepo.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (!"TEAM_LEADER".equals(leader.getRole())) {
                return ResponseEntity.badRequest().body(Map.of("error", "User is not a Team Leader"));
            }

            if (!group.getTeamLeaderIds().contains(userId)) {
                group.getTeamLeaderIds().add(userId);
            }

            if (primary || group.getTeamLeaderId() == null) {
                group.setTeamLeaderId(userId);
                group.setTeamLeaderName(leader.getFullName());
            }

            groupRepo.save(group);

            return ResponseEntity.ok(Map.of(
                    "message", "Team Leader assigned to group successfully",
                    "groupId", groupId,
                    "userId", userId,
                    "fullName", leader.getFullName()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{groupId}/remove-team-leader-from-group/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEADER')")
    public ResponseEntity<?> removeTeamLeaderFromGroup(@PathVariable Long groupId,
                                                       @PathVariable Long userId,
                                                       Principal principal) {
        try {
            if (!canManageGroupAssignments(principal)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "You don't have permission to remove team leaders from groups"));
            }

            Group group = groupRepo.findById(groupId)
                    .orElseThrow(() -> new RuntimeException("Group not found"));

            group.getTeamLeaderIds().remove(userId);

            if (group.getTeamLeaderId() != null && group.getTeamLeaderId().equals(userId)) {
                // Promote another assigned leader to primary, if any remain
                Long newPrimary = group.getTeamLeaderIds().isEmpty() ? null : group.getTeamLeaderIds().get(0);
                group.setTeamLeaderId(newPrimary);
                group.setTeamLeaderName(newPrimary != null
                        ? userRepo.findById(newPrimary).map(AppUser::getFullName).orElse(null)
                        : null);
            }

            groupRepo.save(group);

            return ResponseEntity.ok(Map.of(
                    "message", "Team Leader removed from group successfully",
                    "groupId", groupId,
                    "userId", userId
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== ASSIGN / REMOVE TEAM MEMBER ====================

    /**
     * Assign a Team Member directly to a group/client. Used by:
     *  - Admin's group menu (#5)
     *  - Team Leaders assigning their team members to a group (#2)
     */
    @PostMapping("/{groupId}/assign-team-member-to-group")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEADER')")
    public ResponseEntity<?> assignTeamMemberToGroup(@PathVariable Long groupId,
                                                     @RequestParam Long userId,
                                                     Principal principal) {
        try {
            if (!canManageGroupAssignments(principal)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "You don't have permission to assign team members to groups"));
            }

            Group group = groupRepo.findById(groupId)
                    .orElseThrow(() -> new RuntimeException("Group not found"));

            AppUser member = userRepo.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (!"TEAM_MEMBER".equals(member.getRole())) {
                return ResponseEntity.badRequest().body(Map.of("error", "User is not a Team Member"));
            }

            if (!group.getTeamMemberIds().contains(userId)) {
                group.getTeamMemberIds().add(userId);
                groupRepo.save(group);
            }

            return ResponseEntity.ok(Map.of(
                    "message", "Team Member assigned to group successfully",
                    "groupId", groupId,
                    "userId", userId,
                    "fullName", member.getFullName()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{groupId}/remove-team-member-from-group/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEADER')")
    public ResponseEntity<?> removeTeamMemberFromGroup(@PathVariable Long groupId,
                                                       @PathVariable Long userId,
                                                       Principal principal) {
        try {
            if (!canManageGroupAssignments(principal)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "You don't have permission to remove team members from groups"));
            }

            Group group = groupRepo.findById(groupId)
                    .orElseThrow(() -> new RuntimeException("Group not found"));

            group.getTeamMemberIds().remove(userId);
            groupRepo.save(group);

            return ResponseEntity.ok(Map.of(
                    "message", "Team Member removed from group successfully",
                    "groupId", groupId,
                    "userId", userId
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== PROVIDER <-> MULTIPLE GROUPS (item #3) ====================

    /**
     * Link a provider to a group WITHOUT removing existing links — enables
     * providers to belong to multiple groups/clients simultaneously.
     * If the provider has no primary group yet (legacy `groupId` field),
     * this link also becomes the primary.
     */
    @PostMapping("/{groupId}/link-provider")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEADER', 'GROUP_MGR')")
    public ResponseEntity<?> linkProviderToGroup(@PathVariable Long groupId,
                                                 @RequestParam Long providerId,
                                                 Principal principal) {
        try {
            groupRepo.findById(groupId).orElseThrow(() -> new RuntimeException("Group not found"));
            Provider provider = providerRepo.findById(providerId)
                    .orElseThrow(() -> new RuntimeException("Provider not found"));

            if (providerGroupRepo.existsByProviderIdAndGroupId(providerId, groupId)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Provider is already linked to this group"));
            }

            ProviderGroup link = new ProviderGroup();
            link.setProviderId(providerId);
            link.setGroupId(groupId);
            link.setLinkedAt(LocalDateTime.now());

            boolean hasPrimary = providerGroupRepo.findByProviderId(providerId).stream()
                    .anyMatch(ProviderGroup::isPrimary);

            if (!hasPrimary && provider.getGroupId() == null) {
                link.setPrimary(true);
                provider.setGroupId(groupId);
                providerRepo.save(provider);
            }

            providerGroupRepo.save(link);

            return ResponseEntity.ok(Map.of(
                    "message", "Provider linked to group successfully",
                    "providerId", providerId,
                    "groupId", groupId,
                    "isPrimary", link.isPrimary()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Unlink a provider from a group. If the unlinked group was the provider's
     * primary group, promote another linked group to primary (if any remain).
     */
    @DeleteMapping("/{groupId}/unlink-provider/{providerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEADER', 'GROUP_MGR')")
    public ResponseEntity<?> unlinkProviderFromGroup(@PathVariable Long groupId,
                                                     @PathVariable Long providerId,
                                                     Principal principal) {
        try {
            ProviderGroup link = providerGroupRepo.findByProviderIdAndGroupId(providerId, groupId)
                    .orElseThrow(() -> new RuntimeException("Provider is not linked to this group"));

            boolean wasPrimary = link.isPrimary();
            providerGroupRepo.delete(link);

            Provider provider = providerRepo.findById(providerId).orElse(null);
            if (provider != null && wasPrimary) {
                List<ProviderGroup> remaining = providerGroupRepo.findByProviderId(providerId);
                if (!remaining.isEmpty()) {
                    ProviderGroup newPrimary = remaining.get(0);
                    newPrimary.setPrimary(true);
                    providerGroupRepo.save(newPrimary);
                    provider.setGroupId(newPrimary.getGroupId());
                } else {
                    provider.setGroupId(null);
                }
                providerRepo.save(provider);
            }

            return ResponseEntity.ok(Map.of(
                    "message", "Provider unlinked from group successfully",
                    "providerId", providerId,
                    "groupId", groupId
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    /** All groups/clients a provider is linked to (their full client list). */
    @GetMapping("/provider/{providerId}/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEADER', 'TEAM_MEMBER', 'GROUP_MGR')")
    public ResponseEntity<?> getGroupsForProvider(@PathVariable Long providerId) {
        try {
            List<ProviderGroup> links = providerGroupRepo.findByProviderId(providerId);

            List<Map<String, Object>> result = links.stream().map(link -> {
                Map<String, Object> m = new HashMap<>();
                m.put("groupId", link.getGroupId());
                m.put("isPrimary", link.isPrimary());
                m.put("linkedAt", link.getLinkedAt());
                groupRepo.findById(link.getGroupId()).ifPresent(g -> m.put("groupName", g.getName()));
                return m;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(Map.of(
                    "providerId", providerId,
                    "groups", result,
                    "total", result.size()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }
}