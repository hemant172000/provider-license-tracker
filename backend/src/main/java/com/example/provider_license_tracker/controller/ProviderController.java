package com.example.provider_license_tracker.controller;

import com.example.provider_license_tracker.dto.ProviderDTO;
import com.example.provider_license_tracker.model.AppUser;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/providers")
public class ProviderController {

    private final ProviderRepository providerRepo;
    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final GroupRepository groupRepo;
    private final ProviderFileRepository fileRepo;

    public ProviderController(ProviderRepository providerRepo,
                              UserRepository userRepo,
                              PasswordEncoder passwordEncoder,
                              GroupRepository groupRepo,
                              ProviderFileRepository fileRepo) {
        this.providerRepo = providerRepo;
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.groupRepo = groupRepo;
        this.fileRepo = fileRepo;
    }

    // ── Get all providers (ADMIN only) ──
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ProviderDTO>> getAllProviders() {
        List<ProviderDTO> providers = providerRepo.findAll().stream()
                .map(provider -> {
                    AppUser user = userRepo.findById(provider.getAppUserId()).orElse(null);
                    if (user == null) return null;
                    return new ProviderDTO(provider.getId(), user.getFullName(), user.getEmail());
                })
                .filter(dto -> dto != null)
                .collect(Collectors.toList());
        return ResponseEntity.ok(providers);
    }

    // ── Get raw providers list (ADMIN only) ──
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Provider>> getProviders() {
        return ResponseEntity.ok(providerRepo.findAll());
    }

    // ── Create provider (ADMIN only) ──
    @PostMapping("/create")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createProvider(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String password = request.get("password");
            String fullName = request.get("fullName");
            String email = request.get("email");
            String phoneNumber = request.get("phoneNumber");
            String specialty = request.get("specialty");

            if (userRepo.findByUsername(username).isPresent()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Username already exists"));
            }

            AppUser appUser = new AppUser();
            appUser.setUsername(username);
            appUser.setPassword(passwordEncoder.encode(password));
            appUser.setRole("PROVIDER");
            appUser.setFullName(fullName);
            appUser.setEmail(email);
            appUser.setPhoneNumber(phoneNumber);
            appUser.setSpecialty(specialty);
            appUser.setStatus("Active");
            appUser.setCreatedAt(LocalDateTime.now());
            AppUser savedUser = userRepo.save(appUser);

            Provider provider = new Provider();
            provider.setName(fullName);
            provider.setEmail(email);
            provider.setPhoneNumber(phoneNumber);
            provider.setSpecialty(specialty);
            provider.setAppUserId(savedUser.getId());
            Provider savedProvider = providerRepo.save(provider);

            return ResponseEntity.ok(Map.of(
                    "message", "Provider created successfully",
                    "providerId", savedProvider.getId(),
                    "userId", savedUser.getId(),
                    "username", savedUser.getUsername(),
                    "name", savedProvider.getName()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ── Get provider profile (PROVIDER only) ──
    @GetMapping("/my-profile")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> getMyProfile(Principal principal) {
        try {
            AppUser user = userRepo.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Provider provider = providerRepo.findByAppUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("Provider record not found"));

            Map<String, Object> profile = new HashMap<>();
            profile.put("id", provider.getId());
            profile.put("name", provider.getName());
            profile.put("email", provider.getEmail());
            profile.put("phoneNumber", provider.getPhoneNumber());
            profile.put("specialty", provider.getSpecialty());
            profile.put("licenseNumber", provider.getLicenseNumber());
            profile.put("licenseExpiry", provider.getLicenseExpiry());

            AtomicReference<String> groupName = new AtomicReference<>();
            if (provider.getGroupId() != null) {
                groupRepo.findById(provider.getGroupId())
                        .ifPresent(group -> groupName.set(group.getName()));
            }
            profile.put("groupName", groupName);

            String teamMemberName = null;
            if (provider.getAssignedTeamMember() != null) {
                teamMemberName = provider.getAssignedTeamMember().getFullName();
            }
            profile.put("assignedTeamMemberName", teamMemberName);

            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ── Get provider's files (PROVIDER only) ──
    @GetMapping("/my-files")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> getMyFiles(Principal principal) {
        try {
            AppUser user = userRepo.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Provider provider = providerRepo.findByAppUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("Provider record not found"));

            List<ProviderFile> files = fileRepo.findByProviderId(provider.getId());

            List<Map<String, Object>> enrichedFiles = files.stream().map(f -> {
                AppUser uploader = f.getUploadedByUserId() != null
                        ? userRepo.findById(f.getUploadedByUserId()).orElse(null)
                        : null;
                Map<String, Object> map = new HashMap<>();
                map.put("id", f.getId());
                map.put("fileName", f.getFileName());
                map.put("fileType", f.getFileType());
                map.put("uploadedAt", f.getUploadedAt());
                map.put("uploadedBy", uploader != null ? uploader.getFullName() : "Unknown");
                map.put("uploaderRole", uploader != null ? uploader.getRole() : "");
                return map;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(enrichedFiles);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Get providers not assigned to any group (or all providers for group assignment)
    @GetMapping("/unassigned")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEADER', 'GROUP_MGR')")
    public ResponseEntity<?> getUnassignedProviders(Principal principal) {
        try {
            List<Provider> allProviders = providerRepo.findAll();

            // For Credentialing Team Leader, filter providers under their team
            AppUser user = userRepo.findByUsername(principal.getName()).orElse(null);
            if (user != null && "TEAM_LEADER".equals(user.getRole()) && "Credentialing".equals(user.getLeadingDepartment())) {
                // Get team members under this leader
                List<AppUser> teamMembers = userRepo.findByReportsTo(user.getId());
                List<Long> teamMemberIds = teamMembers.stream()
                        .map(AppUser::getId)
                        .collect(Collectors.toList());

                // Filter providers assigned to these team members
                allProviders = allProviders.stream()
                        .filter(p -> p.getAssignedTeamMember() != null &&
                                teamMemberIds.contains(p.getAssignedTeamMember().getId()))
                        .collect(Collectors.toList());
            }

            // Return providers with their group info
            List<Map<String, Object>> result = allProviders.stream().map(provider -> {
                Map<String, Object> p = new HashMap<>();
                p.put("id", provider.getId());
                p.put("name", provider.getName());
                p.put("email", provider.getEmail());
                p.put("specialty", provider.getSpecialty());
                p.put("licenseNumber", provider.getLicenseNumber());
                p.put("groupId", provider.getGroupId());

                // Get group name if assigned
                if (provider.getGroupId() != null) {
                    groupRepo.findById(provider.getGroupId()).ifPresent(group ->
                            p.put("groupName", group.getName())
                    );
                }
                return p;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ── Upload file for provider (PROVIDER only) ──
    @PostMapping("/upload-my-file")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> uploadMyFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("fileType") String fileType,
            Principal principal) {
        try {
            AppUser user = userRepo.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Provider provider = providerRepo.findByAppUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("Provider record not found"));

            File uploadDir = new File("uploads/" + provider.getId() + "/");
            if (!uploadDir.exists()) uploadDir.mkdirs();

            String originalFileName = file.getOriginalFilename();
            String filePath = "uploads/" + provider.getId() + "/" + originalFileName;
            Files.write(Paths.get(filePath), file.getBytes());

            ProviderFile providerFile = new ProviderFile();
            providerFile.setProviderId(provider.getId());
            providerFile.setUploadedByUserId(user.getId());
            providerFile.setFileName(originalFileName);
            providerFile.setFileType(fileType);
            providerFile.setFilePath(filePath);
            providerFile.setUploadedAt(LocalDateTime.now());
            fileRepo.save(providerFile);

            return ResponseEntity.ok(Map.of(
                    "message", "File uploaded successfully",
                    "fileName", originalFileName,
                    "providerId", provider.getId()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Upload failed: " + e.getMessage()));
        }
    }

    // ── Get providers for team leader ──
    @GetMapping("/team-providers")
    @PreAuthorize("hasRole('TEAM_LEADER')")
    public ResponseEntity<?> getTeamProviders(Principal principal) {
        try {
            // Return ALL providers, not just those under team
            List<Provider> allProviders = providerRepo.findAll();

            List<Map<String, Object>> enrichedProviders = allProviders.stream().map(provider -> {
                Map<String, Object> p = new HashMap<>();
                p.put("id", provider.getId());
                p.put("name", provider.getName());
                p.put("email", provider.getEmail());
                p.put("phoneNumber", provider.getPhoneNumber());
                p.put("specialty", provider.getSpecialty());
                p.put("licenseNumber", provider.getLicenseNumber());
                p.put("licenseExpiry", provider.getLicenseExpiry());
                p.put("assignedTeamMemberName", provider.getAssignedTeamMember() != null ?
                        provider.getAssignedTeamMember().getFullName() : null);
                return p;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(Map.of(
                    "providers", enrichedProviders,
                    "count", enrichedProviders.size()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    private String getLicenseStatus(LocalDate licenseExpiry) {
        if (licenseExpiry == null) return "Unknown";
        LocalDate today = LocalDate.now();
        if (licenseExpiry.isBefore(today)) return "Expired";
        if (licenseExpiry.isBefore(today.plusDays(90))) return "Expiring Soon";
        return "Active";
    }
}