package com.example.provider_license_tracker.controller;

import com.example.provider_license_tracker.model.AppUser;
import com.example.provider_license_tracker.model.Group;
import com.example.provider_license_tracker.model.Provider;
import com.example.provider_license_tracker.model.ProviderFile;
import com.example.provider_license_tracker.repository.GroupRepository;
import com.example.provider_license_tracker.repository.ProviderFileRepository;
import com.example.provider_license_tracker.repository.ProviderRepository;
import com.example.provider_license_tracker.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.Principal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/groups")
public class GroupController {

    private final GroupRepository groupRepo;
    private final ProviderRepository providerRepo;
    private final UserRepository userRepo;
    private final ProviderFileRepository fileRepo;
    private final PasswordEncoder passwordEncoder;

    public GroupController(GroupRepository groupRepo,
                           ProviderRepository providerRepo,
                           UserRepository userRepo,
                           ProviderFileRepository fileRepo,
                           PasswordEncoder passwordEncoder) {
        this.groupRepo = groupRepo;
        this.providerRepo = providerRepo;
        this.userRepo = userRepo;
        this.fileRepo = fileRepo;
        this.passwordEncoder = passwordEncoder;
    }

    // ==================== ASSIGN TEAM LEADER TO GROUP ====================

    @PostMapping("/{groupId}/assign-team-leader")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> assignTeamLeaderToGroup(
            @PathVariable Long groupId,
            @RequestParam Long teamLeaderId) {
        try {
            Group group = groupRepo.findById(groupId)
                    .orElseThrow(() -> new RuntimeException("Group not found with id: " + groupId));

            AppUser teamLeader = userRepo.findById(teamLeaderId)
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + teamLeaderId));

            if (!"TEAM_LEADER".equals(teamLeader.getRole())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "User is not a Team Leader"));
            }

            if (group.getTeamLeaderId() != null && group.getTeamLeaderId().equals(teamLeaderId)) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Team Leader is already assigned to this group"));
            }

            group.setTeamLeaderId(teamLeaderId);
            group.setTeamLeaderName(teamLeader.getFullName());
            groupRepo.save(group);

            return ResponseEntity.ok(Map.of(
                    "message", "Team Leader assigned successfully",
                    "groupId", groupId,
                    "teamLeaderId", teamLeaderId,
                    "teamLeaderName", teamLeader.getFullName()
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Remove Team Leader from group
    @DeleteMapping("/{groupId}/remove-team-leader")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> removeTeamLeaderFromGroup(@PathVariable Long groupId) {
        try {
            Group group = groupRepo.findById(groupId)
                    .orElseThrow(() -> new RuntimeException("Group not found with id: " + groupId));

            group.setTeamLeaderId(null);
            group.setTeamLeaderName(null);
            groupRepo.save(group);

            return ResponseEntity.ok(Map.of(
                    "message", "Team Leader removed from group successfully",
                    "groupId", groupId
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Get all Team Leaders (for dropdown)
    @GetMapping("/available-team-leaders")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAvailableTeamLeaders() {
        try {
            List<AppUser> teamLeaders = userRepo.findByRole("TEAM_LEADER");

            List<Map<String, Object>> availableLeaders = teamLeaders.stream().map(leader -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", leader.getId());
                map.put("fullName", leader.getFullName());
                map.put("email", leader.getEmail());
                map.put("leadingDepartment", leader.getLeadingDepartment());
                return map;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(availableLeaders);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllGroupsForAdmin() {
        try {
            List<Map<String, Object>> result = groupRepo.findAll().stream().map(group -> {
                Map<String, Object> g = new HashMap<>();
                g.put("groupId", group.getId());
                g.put("groupName", group.getName());
                g.put("teamLeaderId", group.getTeamLeaderId());
                g.put("teamLeaderName", group.getTeamLeaderName() != null ? group.getTeamLeaderName() : null);

                AppUser primaryManager = null;
                if (group.getManagerUserId() != null) {
                    primaryManager = userRepo.findById(group.getManagerUserId()).orElse(null);
                }
                g.put("managerName", primaryManager != null ? primaryManager.getFullName() : "Unassigned");
                g.put("managerEmail", primaryManager != null ? primaryManager.getEmail() : "");

                List<Map<String, Object>> allManagers = new ArrayList<>();
                if (group.getManagerUserIds() != null) {
                    for (Long mid : group.getManagerUserIds()) {
                        userRepo.findById(mid).ifPresent(m -> {
                            Map<String, Object> mgr = new HashMap<>();
                            mgr.put("id", m.getId());
                            mgr.put("name", m.getFullName() != null ? m.getFullName() : m.getUsername());
                            mgr.put("email", m.getEmail() != null ? m.getEmail() : "");
                            allManagers.add(mgr);
                        });
                    }
                }
                g.put("managers", allManagers);
                g.put("providerCount", providerRepo.findByGroupId(group.getId()).size());

                return g;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ── Admin: list all groups (also accessible by Credentialing Team Leader) ──
    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEADER')")
    public ResponseEntity<?> getAllGroups(Principal principal) {
        try {
            if (principal != null) {
                AppUser user = userRepo.findByUsername(principal.getName()).orElse(null);
                if (user != null && "TEAM_LEADER".equals(user.getRole())) {
                    if (!"Credentialing".equals(user.getLeadingDepartment())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(Map.of("error", "Only Credentialing Team Leader can access groups"));
                    }
                }
            }

            List<Map<String, Object>> result = groupRepo.findAll().stream().map(group -> {
                AppUser primaryManager = userRepo.findById(group.getManagerUserId()).orElse(null);

                List<Map<String, Object>> allManagers = new ArrayList<>();

                if (primaryManager != null) {
                    Map<String, Object> pm = new HashMap<>();
                    pm.put("id", primaryManager.getId());
                    pm.put("name", primaryManager.getFullName() != null ? primaryManager.getFullName() : primaryManager.getUsername());
                    pm.put("email", primaryManager.getEmail() != null ? primaryManager.getEmail() : "");
                    allManagers.add(pm);
                }

                if (group.getManagerUserIds() != null && !group.getManagerUserIds().isEmpty()) {
                    for (Long mid : group.getManagerUserIds()) {
                        if (primaryManager != null && mid.equals(primaryManager.getId())) {
                            continue;
                        }
                        AppUser manager = userRepo.findById(mid).orElse(null);
                        if (manager != null) {
                            Map<String, Object> m = new HashMap<>();
                            m.put("id", manager.getId());
                            m.put("name", manager.getFullName() != null ? manager.getFullName() : manager.getUsername());
                            m.put("email", manager.getEmail() != null ? manager.getEmail() : "");
                            allManagers.add(m);
                        }
                    }
                }

                if (allManagers.isEmpty() && group.getManagerUserId() != null) {
                    AppUser manager = userRepo.findById(group.getManagerUserId()).orElse(null);
                    if (manager != null) {
                        Map<String, Object> m = new HashMap<>();
                        m.put("id", manager.getId());
                        m.put("name", manager.getFullName() != null ? manager.getFullName() : manager.getUsername());
                        m.put("email", manager.getEmail() != null ? manager.getEmail() : "");
                        allManagers.add(m);

                        if (!group.getManagerUserIds().contains(manager.getId())) {
                            group.getManagerUserIds().add(manager.getId());
                            new Thread(() -> groupRepo.save(group)).start();
                        }
                    }
                }

                List<Provider> providers = providerRepo.findByGroupId(group.getId());

                return Map.<String, Object>of(
                        "groupId", group.getId(),
                        "groupName", group.getName(),
                        "managerName", primaryManager != null ? primaryManager.getFullName() : "Unknown",
                        "managerEmail", primaryManager != null ? primaryManager.getEmail() : "",
                        "managers", allManagers,
                        "providerCount", providers.size(),
                        "teamLeaderId", group.getTeamLeaderId(),
                        "teamLeaderName", group.getTeamLeaderName() != null ? group.getTeamLeaderName() : null
                );
            }).collect(Collectors.toList());

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ── Team Leader: get all groups (Credentialing only) ──
    @GetMapping("/team-leader/all")
    @PreAuthorize("hasRole('TEAM_LEADER')")
    public ResponseEntity<?> getGroupsForTeamLeader(Principal principal) {
        try {
            AppUser teamLeader = userRepo.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<Group> groups = groupRepo.findAll();

            List<Map<String, Object>> result = groups.stream().map(group -> {
                Map<String, Object> g = new HashMap<>();
                g.put("groupId", group.getId());
                g.put("groupName", group.getName());
                g.put("providerCount", providerRepo.findByGroupId(group.getId()).size());
                g.put("teamLeaderId", group.getTeamLeaderId());
                g.put("teamLeaderName", group.getTeamLeaderName());

                if (group.getManagerUserId() != null) {
                    AppUser primaryManager = userRepo.findById(group.getManagerUserId()).orElse(null);
                    if (primaryManager != null) {
                        g.put("managerName", primaryManager.getFullName());
                        g.put("managerId", primaryManager.getId());
                    }
                } else {
                    g.put("managerName", "Unassigned");
                    g.put("managerId", null);
                }

                List<Map<String, Object>> managers = new ArrayList<>();
                if (group.getManagerUserIds() != null) {
                    for (Long mid : group.getManagerUserIds()) {
                        userRepo.findById(mid).ifPresent(m -> {
                            Map<String, Object> mgr = new HashMap<>();
                            mgr.put("id", m.getId());
                            mgr.put("name", m.getFullName());
                            managers.add(mgr);
                        });
                    }
                }
                g.put("managers", managers);

                return g;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ── Group Manager: view their group's dashboard ──
    @GetMapping("/my-group")
    @PreAuthorize("hasRole('GROUP_MGR')")
    public ResponseEntity<?> getMyGroup(Principal principal) {
        try {
            AppUser manager = userRepo.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Group group = groupRepo.findByManagerUserId(manager.getId())
                    .or(() -> groupRepo.findByManagerUserIdsContaining(manager.getId()))
                    .orElseThrow(() -> new RuntimeException("No group assigned to this manager"));

            List<Provider> providers = providerRepo.findByGroupId(group.getId());

            List<Map<String, Object>> providerDetails = providers.stream().map(provider -> {
                List<ProviderFile> files = fileRepo.findByProviderId(provider.getId());

                List<Map<String, Object>> enrichedFiles = files.stream().map(f -> {
                    AppUser uploader = f.getUploadedByUserId() != null
                            ? userRepo.findById(f.getUploadedByUserId()).orElse(null)
                            : null;
                    Map<String, Object> fm = new LinkedHashMap<>();
                    fm.put("id", f.getId());
                    fm.put("fileName", f.getFileName());
                    fm.put("fileType", f.getFileType());
                    fm.put("uploadedAt", f.getUploadedAt());
                    fm.put("uploadedBy", uploader != null ? uploader.getFullName() : "Unknown");
                    fm.put("uploaderRole", uploader != null ? uploader.getRole() : "");
                    return fm;
                }).collect(Collectors.toList());

                Map<String, Object> pm = new LinkedHashMap<>();
                pm.put("providerId", provider.getId());
                pm.put("name", provider.getName() != null ? provider.getName() : "");
                pm.put("email", provider.getEmail() != null ? provider.getEmail() : "");
                pm.put("specialty", provider.getSpecialty() != null ? provider.getSpecialty() : "");
                pm.put("phoneNumber", provider.getPhoneNumber() != null ? provider.getPhoneNumber() : "");
                pm.put("licenseNumber", provider.getLicenseNumber() != null ? provider.getLicenseNumber() : "");
                pm.put("licenseExpiry", provider.getLicenseExpiry() != null ? provider.getLicenseExpiry().toString() : "");

                LocalDate expiry = provider.getLicenseExpiry();
                if (expiry == null) {
                    pm.put("licenseStatus", "Unknown");
                } else if (expiry.isBefore(LocalDate.now())) {
                    pm.put("licenseStatus", "Expired");
                } else if (expiry.isBefore(LocalDate.now().plusDays(90))) {
                    pm.put("licenseStatus", "Expiring Soon");
                } else {
                    pm.put("licenseStatus", "Active");
                }

                if (provider.getAssignedTeamMember() != null) {
                    pm.put("assignedTo", provider.getAssignedTeamMember().getFullName());
                    pm.put("assignedToId", provider.getAssignedTeamMember().getId());
                }

                pm.put("files", enrichedFiles);
                pm.put("documentCount", enrichedFiles.size());

                return pm;
            }).collect(Collectors.toList());

            List<Map<String, Object>> managers = new ArrayList<>();
            if (group.getManagerUserId() != null) {
                userRepo.findById(group.getManagerUserId()).ifPresent(m -> {
                    Map<String, Object> mgr = new HashMap<>();
                    mgr.put("id", m.getId());
                    mgr.put("name", m.getFullName());
                    mgr.put("email", m.getEmail());
                    managers.add(mgr);
                });
            }
            for (Long mid : group.getManagerUserIds()) {
                if (group.getManagerUserId() == null || !mid.equals(group.getManagerUserId())) {
                    userRepo.findById(mid).ifPresent(m -> {
                        Map<String, Object> mgr = new HashMap<>();
                        mgr.put("id", m.getId());
                        mgr.put("name", m.getFullName());
                        mgr.put("email", m.getEmail());
                        managers.add(mgr);
                    });
                }
            }

            return ResponseEntity.ok(Map.of(
                    "groupId", group.getId(),
                    "groupName", group.getName(),
                    "managerName", manager.getFullName() != null ? manager.getFullName() : manager.getUsername(),
                    "managers", managers,
                    "providers", providerDetails,
                    "totalProviders", providers.size(),
                    "totalDocuments", providerDetails.stream().mapToInt(p -> (int) p.get("documentCount")).sum()
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{groupId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEADER')")
    public ResponseEntity<?> deleteGroup(@PathVariable Long groupId, Principal principal) {
        try {
            if (principal != null) {
                AppUser user = userRepo.findByUsername(principal.getName()).orElse(null);
                if (user != null && "TEAM_LEADER".equals(user.getRole())) {
                    if (!"Credentialing".equals(user.getLeadingDepartment())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(Map.of("error", "Only Credentialing Team Leader can delete groups"));
                    }
                }
            }

            Group group = groupRepo.findById(groupId)
                    .orElseThrow(() -> new RuntimeException("Group not found with id: " + groupId));

            List<Provider> providers = providerRepo.findByGroupId(groupId);
            for (Provider provider : providers) {
                provider.setGroupId(null);
                providerRepo.save(provider);
            }

            groupRepo.delete(group);

            return ResponseEntity.ok(Map.of(
                    "message", "Group deleted successfully",
                    "groupId", groupId
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{groupId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEADER')")
    public ResponseEntity<?> updateGroup(@PathVariable Long groupId,
                                         @RequestBody Map<String, String> request,
                                         Principal principal) {
        try {
            if (principal != null) {
                AppUser user = userRepo.findByUsername(principal.getName()).orElse(null);
                if (user != null && "TEAM_LEADER".equals(user.getRole())) {
                    if (!"Credentialing".equals(user.getLeadingDepartment())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(Map.of("error", "Only Credentialing Team Leader can update groups"));
                    }
                }
            }

            Group group = groupRepo.findById(groupId)
                    .orElseThrow(() -> new RuntimeException("Group not found with id: " + groupId));

            String newName = request.get("name");
            if (newName != null && !newName.trim().isEmpty()) {
                group.setName(newName.trim());
            }

            groupRepo.save(group);

            return ResponseEntity.ok(Map.of(
                    "message", "Group updated successfully",
                    "groupId", groupId,
                    "groupName", group.getName()
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Get all providers in a specific group
    @GetMapping("/{groupId}/providers")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEADER', 'GROUP_MGR')")
    public ResponseEntity<?> getProvidersInGroup(@PathVariable Long groupId, Principal principal) {
        try {
            AppUser currentUser = userRepo.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Group group = groupRepo.findById(groupId)
                    .orElseThrow(() -> new RuntimeException("Group not found"));

            String role = currentUser.getRole();
            boolean hasAccess = false;

            if ("ADMIN".equals(role)) {
                hasAccess = true;
            } else if ("TEAM_LEADER".equals(role)) {
                if ("Credentialing".equals(currentUser.getLeadingDepartment())) {
                    hasAccess = true;
                }
            } else if ("GROUP_MGR".equals(role)) {
                if (group.getManagerUserIds().contains(currentUser.getId()) ||
                        (group.getManagerUserId() != null && group.getManagerUserId().equals(currentUser.getId()))) {
                    hasAccess = true;
                }
            }

            if (!hasAccess) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "You don't have permission to view providers in this group"));
            }

            List<Provider> providers = providerRepo.findByGroupId(groupId);

            List<Map<String, Object>> result = providers.stream().map(provider -> {
                Map<String, Object> p = new HashMap<>();
                p.put("id", provider.getId());
                p.put("name", provider.getName());
                p.put("email", provider.getEmail());
                p.put("specialty", provider.getSpecialty());
                p.put("licenseNumber", provider.getLicenseNumber());
                p.put("licenseExpiry", provider.getLicenseExpiry());

                LocalDate expiry = provider.getLicenseExpiry();
                if (expiry == null) {
                    p.put("licenseStatus", "Unknown");
                } else if (expiry.isBefore(LocalDate.now())) {
                    p.put("licenseStatus", "Expired");
                } else if (expiry.isBefore(LocalDate.now().plusDays(90))) {
                    p.put("licenseStatus", "Expiring Soon");
                } else {
                    p.put("licenseStatus", "Active");
                }

                if (provider.getAssignedTeamMember() != null) {
                    p.put("assignedTo", provider.getAssignedTeamMember().getFullName());
                }

                List<ProviderFile> files = fileRepo.findByProviderId(provider.getId());
                p.put("documentCount", files.size());

                return p;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(Map.of(
                    "providers", result,
                    "total", result.size(),
                    "groupId", groupId,
                    "groupName", group.getName()
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ── Team Leader: create group (Credentialing only) ──
    @PostMapping("/team-leader/create")
    @PreAuthorize("hasRole('TEAM_LEADER')")
    public ResponseEntity<?> createGroupForTeamLeader(@RequestBody Map<String, String> request, Principal principal) {
        try {
            AppUser user = userRepo.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (!"Credentialing".equals(user.getLeadingDepartment())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Only Credentialing Team Leader can create groups"));
            }

            String groupName = request.get("groupName");
            if (groupName == null || groupName.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Group name is required"));
            }

            Group group = new Group();
            group.setName(groupName);
            group.setCreatedAt(LocalDateTime.now());
            Group savedGroup = groupRepo.save(group);

            return ResponseEntity.ok(Map.of(
                    "message", "Group created successfully",
                    "groupId", savedGroup.getId(),
                    "groupName", savedGroup.getName()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ── Admin: create a group (also accessible by Credentialing Team Leader) ──
    @PostMapping("/create")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEADER')")
    public ResponseEntity<?> createGroup(@RequestBody Map<String, String> request, Principal principal) {
        try {
            if (principal != null) {
                AppUser user = userRepo.findByUsername(principal.getName()).orElse(null);
                if (user != null && "TEAM_LEADER".equals(user.getRole())) {
                    if (!"Credentialing".equals(user.getLeadingDepartment())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(Map.of("error", "Only Credentialing Team Leader can create groups"));
                    }
                }
            }

            String groupName = request.get("groupName");

            if (groupName == null || groupName.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Group name is required"));
            }

            Group group = new Group();
            group.setName(groupName);
            group.setCreatedAt(LocalDateTime.now());
            Group savedGroup = groupRepo.save(group);

            return ResponseEntity.ok(Map.of(
                    "message", "Group created successfully",
                    "groupId", savedGroup.getId(),
                    "groupName", savedGroup.getName()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ── Get all managers for a specific group ──
    @GetMapping("/{groupId}/managers")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEADER', 'GROUP_MGR')")
    public ResponseEntity<?> getGroupManagers(@PathVariable Long groupId, Principal principal) {
        try {
            Group group = groupRepo.findById(groupId)
                    .orElseThrow(() -> new RuntimeException("Group not found"));

            if (principal != null) {
                AppUser user = userRepo.findByUsername(principal.getName()).orElse(null);
                if (user != null && "GROUP_MGR".equals(user.getRole())) {
                    boolean isManager = group.getManagerUserIds().contains(user.getId()) ||
                            (group.getManagerUserId() != null && group.getManagerUserId().equals(user.getId()));
                    if (!isManager) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(Map.of("error", "You can only view managers for your own group"));
                    }
                }
            }

            List<Map<String, Object>> managers = new ArrayList<>();

            if (group.getManagerUserId() != null) {
                AppUser primaryManager = userRepo.findById(group.getManagerUserId()).orElse(null);
                if (primaryManager != null) {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id", primaryManager.getId());
                    m.put("fullName", primaryManager.getFullName());
                    m.put("email", primaryManager.getEmail());
                    m.put("isPrimary", true);
                    managers.add(m);
                }
            }

            if (group.getManagerUserIds() != null) {
                for (Long managerId : group.getManagerUserIds()) {
                    if (group.getManagerUserId() != null && managerId.equals(group.getManagerUserId())) {
                        continue;
                    }
                    AppUser manager = userRepo.findById(managerId).orElse(null);
                    if (manager != null) {
                        Map<String, Object> m = new HashMap<>();
                        m.put("id", manager.getId());
                        m.put("fullName", manager.getFullName());
                        m.put("email", manager.getEmail());
                        m.put("isPrimary", false);
                        managers.add(m);
                    }
                }
            }

            if (managers.isEmpty() && group.getManagerUserId() != null) {
                AppUser manager = userRepo.findById(group.getManagerUserId()).orElse(null);
                if (manager != null) {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id", manager.getId());
                    m.put("fullName", manager.getFullName());
                    m.put("email", manager.getEmail());
                    m.put("isPrimary", true);
                    managers.add(m);

                    if (!group.getManagerUserIds().contains(manager.getId())) {
                        group.getManagerUserIds().add(manager.getId());
                        groupRepo.save(group);
                    }
                }
            }

            return ResponseEntity.ok(managers);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ── Get available managers (GROUP_MGR users not already assigned to this group) ──
    @GetMapping("/{groupId}/available-managers")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEADER')")
    public ResponseEntity<?> getAvailableManagers(@PathVariable Long groupId, Principal principal) {
        try {
            if (principal != null) {
                AppUser user = userRepo.findByUsername(principal.getName()).orElse(null);
                if (user != null && "TEAM_LEADER".equals(user.getRole())) {
                    if (!"Credentialing".equals(user.getLeadingDepartment())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(Map.of("error", "Only Credentialing Team Leader can view available managers"));
                    }
                }
            }

            Group group = groupRepo.findById(groupId)
                    .orElseThrow(() -> new RuntimeException("Group not found"));

            List<AppUser> allGroupManagers = userRepo.findByRole("GROUP_MGR");

            List<Map<String, Object>> availableManagers = allGroupManagers.stream()
                    .filter(manager -> !group.getManagerUserIds().contains(manager.getId()))
                    .map(manager -> {
                        Map<String, Object> m = new HashMap<>();
                        m.put("id", manager.getId());
                        m.put("fullName", manager.getFullName());
                        m.put("email", manager.getEmail());
                        m.put("phoneNumber", manager.getPhoneNumber());
                        return m;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(availableManagers);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ── Assign existing manager to group ──
    @PostMapping("/{groupId}/assign-manager")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEADER')")
    public ResponseEntity<?> assignManagerToGroup(@PathVariable Long groupId,
                                                  @RequestParam Long userId,
                                                  Principal principal) {
        try {
            if (principal != null) {
                AppUser user = userRepo.findByUsername(principal.getName()).orElse(null);
                if (user != null && "TEAM_LEADER".equals(user.getRole())) {
                    if (!"Credentialing".equals(user.getLeadingDepartment())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(Map.of("error", "Only Credentialing Team Leader can assign managers"));
                    }
                }
            }

            Group group = groupRepo.findById(groupId)
                    .orElseThrow(() -> new RuntimeException("Group not found"));

            AppUser manager = userRepo.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Manager not found"));

            if (!"GROUP_MGR".equals(manager.getRole())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "User does not have GROUP_MGR role"));
            }

            if (group.getManagerUserIds().contains(manager.getId())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Manager already assigned to this group"));
            }

            group.getManagerUserIds().add(manager.getId());

            if (group.getManagerUserId() == null) {
                group.setManagerUserId(manager.getId());
            }

            groupRepo.save(group);

            return ResponseEntity.ok(Map.of(
                    "message", "Manager assigned to group successfully",
                    "groupId", groupId,
                    "managerId", manager.getId(),
                    "managerName", manager.getFullName()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ── Remove manager from group ──
    @DeleteMapping("/{groupId}/remove-manager/{managerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEADER')")
    public ResponseEntity<?> removeManagerFromGroup(@PathVariable Long groupId,
                                                    @PathVariable Long managerId,
                                                    Principal principal) {
        try {
            if (principal != null) {
                AppUser user = userRepo.findByUsername(principal.getName()).orElse(null);
                if (user != null && "TEAM_LEADER".equals(user.getRole())) {
                    if (!"Credentialing".equals(user.getLeadingDepartment())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(Map.of("error", "Only Credentialing Team Leader can remove managers"));
                    }
                }
            }

            Group group = groupRepo.findById(groupId)
                    .orElseThrow(() -> new RuntimeException("Group not found"));

            if (!group.getManagerUserIds().contains(managerId)) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Manager is not assigned to this group"));
            }

            if (group.getManagerUserId() != null && group.getManagerUserId().equals(managerId)) {
                if (group.getManagerUserIds().size() <= 1) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("error", "Cannot remove the only manager of the group. Please assign another manager first."));
                }
                Long newPrimaryId = group.getManagerUserIds().stream()
                        .filter(id -> !id.equals(managerId))
                        .findFirst()
                        .orElse(null);
                group.setManagerUserId(newPrimaryId);
            }

            group.getManagerUserIds().remove(managerId);
            groupRepo.save(group);

            return ResponseEntity.ok(Map.of(
                    "message", "Manager removed from group successfully",
                    "groupId", groupId,
                    "managerId", managerId
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ── Add provider to group ──
    @PostMapping("/{groupId}/add-provider")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEADER', 'GROUP_MGR')")
    public ResponseEntity<?> addProviderToGroup(
            @PathVariable Long groupId,
            @RequestParam Long providerId,
            Principal principal) {
        try {
            if (principal != null) {
                AppUser user = userRepo.findByUsername(principal.getName()).orElse(null);
                if (user != null && "GROUP_MGR".equals(user.getRole())) {
                    Group group = groupRepo.findById(groupId).orElse(null);
                    if (group == null || (!group.getManagerUserIds().contains(user.getId()) &&
                            (group.getManagerUserId() == null || !group.getManagerUserId().equals(user.getId())))) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(Map.of("error", "You can only add providers to your own group"));
                    }
                }
            }

            groupRepo.findById(groupId)
                    .orElseThrow(() -> new RuntimeException("Group not found"));

            Provider provider = providerRepo.findById(providerId)
                    .orElseThrow(() -> new RuntimeException("Provider not found"));

            provider.setGroupId(groupId);
            providerRepo.save(provider);

            return ResponseEntity.ok(Map.of(
                    "message", "Provider added to group",
                    "providerId", providerId,
                    "groupId", groupId
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ── Remove provider from group ──
    @PostMapping("/{groupId}/remove-provider")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEADER', 'GROUP_MGR')")
    public ResponseEntity<?> removeProviderFromGroup(
            @PathVariable Long groupId,
            @RequestParam Long providerId,
            Principal principal) {
        try {
            if (principal != null) {
                AppUser user = userRepo.findByUsername(principal.getName()).orElse(null);
                if (user != null && "GROUP_MGR".equals(user.getRole())) {
                    Group group = groupRepo.findById(groupId).orElse(null);
                    if (group == null || (!group.getManagerUserIds().contains(user.getId()) &&
                            (group.getManagerUserId() == null || !group.getManagerUserId().equals(user.getId())))) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(Map.of("error", "You can only remove providers from your own group"));
                    }
                }
            }

            Provider provider = providerRepo.findById(providerId)
                    .orElseThrow(() -> new RuntimeException("Provider not found"));

            if (!groupId.equals(provider.getGroupId())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Provider does not belong to this group"));
            }

            provider.setGroupId(null);
            providerRepo.save(provider);

            return ResponseEntity.ok(Map.of("message", "Provider removed from group"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ── Get group by ID ──
    @GetMapping("/{groupId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEADER', 'GROUP_MGR')")
    public ResponseEntity<?> getGroupById(@PathVariable Long groupId, Principal principal) {
        try {
            Group group = groupRepo.findById(groupId)
                    .orElseThrow(() -> new RuntimeException("Group not found"));

            AppUser primaryManager = userRepo.findById(group.getManagerUserId()).orElse(null);
            List<Provider> providers = providerRepo.findByGroupId(group.getId());

            Map<String, Object> result = new HashMap<>();
            result.put("groupId", group.getId());
            result.put("groupName", group.getName());
            result.put("managerName", primaryManager != null ? primaryManager.getFullName() : "Unknown");
            result.put("providerCount", providers.size());

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}