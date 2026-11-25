package com.example.provider_license_tracker.controller;

import com.example.provider_license_tracker.model.AppUser;
import com.example.provider_license_tracker.model.Group;
import com.example.provider_license_tracker.model.Provider;
import com.example.provider_license_tracker.model.ProviderFile;
import com.example.provider_license_tracker.repository.GroupRepository;
import com.example.provider_license_tracker.repository.ProviderFileRepository;
import com.example.provider_license_tracker.repository.ProviderRepository;
import com.example.provider_license_tracker.repository.UserRepository;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
@RequestMapping("/files")
public class FileController {

    private final ProviderFileRepository fileRepo;
    private final ProviderRepository providerRepo;
    private final UserRepository userRepo;
    private final GroupRepository groupRepo;
    private final String UPLOAD_DIR = System.getProperty("user.dir") + File.separator + "uploads" + File.separator;

    // Document type configuration
    private static final Set<String> SINGLE_DOCUMENT_TYPES = Set.of(
            "MEDICAL_LICENSE", "DEA_CERTIFICATE", "BOARD_CERTIFICATION",
            "W9_FORM", "CAQH_ATTESTATION", "DRIVERS_LICENSE", "MALPRACTICE_INSURANCE"
    );

    private boolean isSingleDocumentType(String fileType) {
        if (SINGLE_DOCUMENT_TYPES.contains(fileType)) return true;
        return fileType != null && fileType.startsWith("LICENSE_");
    }

    public FileController(ProviderFileRepository fileRepo,
                          ProviderRepository providerRepo,
                          UserRepository userRepo,
                          GroupRepository groupRepo) {
        this.fileRepo = fileRepo;
        this.providerRepo = providerRepo;
        this.userRepo = userRepo;
        this.groupRepo = groupRepo;
    }

    @PostMapping("/upload")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_MEMBER', 'TEAM_LEADER', 'GROUP_MGR', 'PROVIDER')")
    public ResponseEntity<?> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("providerId") Long providerId,
            @RequestParam("fileType") String fileType,
            @RequestParam(value = "replacementReason", required = false) String replacementReason,
            @RequestParam(value = "expiryDate", required = false) String expiryDate,
            @RequestParam(value = "licenseNumber", required = false) String licenseNumber,
            Principal principal) {
        try {
            Provider provider = providerRepo.findById(providerId)
                    .orElseThrow(() -> new RuntimeException("Provider not found"));

            AppUser uploader = userRepo.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Check if this document type already exists for this provider
            List<ProviderFile> existingDocs = fileRepo.findByProviderIdAndFileType(providerId, fileType);

            // For single document types, handle replacement
            if (isSingleDocumentType(fileType) && !existingDocs.isEmpty()) {
                ProviderFile currentDoc = existingDocs.stream()
                        .filter(doc -> "CURRENT".equals(doc.getStatus()) || doc.isCurrent())
                        .findFirst()
                        .orElse(existingDocs.get(0));

                currentDoc.setCurrent(false);
                currentDoc.setStatus("REPLACED");
                currentDoc.setUpdatedAt(LocalDateTime.now());
                fileRepo.save(currentDoc);
            }

            // Create upload directory
            File uploadDir = new File(UPLOAD_DIR + providerId + "/");
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }

            // Generate unique filename
            String timestamp = String.valueOf(System.currentTimeMillis());
            String originalFileName = file.getOriginalFilename();
            String nameWithoutExt = originalFileName.substring(0, originalFileName.lastIndexOf('.'));
            String extension = originalFileName.substring(originalFileName.lastIndexOf('.'));
            String uniqueFileName = nameWithoutExt + "_" + timestamp + extension;
            String filePath = UPLOAD_DIR + providerId + "/" + uniqueFileName;

            // Normalize path (fix mixed slashes)
            String normalizedPath = filePath.replace('\\', '/');
            Files.write(Paths.get(normalizedPath), file.getBytes());

            int nextVersion = existingDocs.size() + 1;

            ProviderFile providerFile = new ProviderFile();
            providerFile.setProviderId(providerId);
            providerFile.setUploadedByUserId(uploader.getId());
            providerFile.setFileName(originalFileName);
            providerFile.setFileType(fileType);
            providerFile.setFilePath(normalizedPath);
            providerFile.setUploadedAt(LocalDateTime.now());
            providerFile.setUpdatedAt(LocalDateTime.now());
            providerFile.setCurrent(true);
            providerFile.setVersion(nextVersion);
            providerFile.setStatus("CURRENT");
            providerFile.setReplacementReason(replacementReason);

            if (expiryDate != null && !expiryDate.isEmpty()) {
                providerFile.setExpiryDate(LocalDateTime.parse(expiryDate + "T23:59:59"));
            }

            String documentId = fileType + "_" + providerId;
            providerFile.setDocumentId(documentId);

            // Update provider's license info if this is a license document
            if (fileType.equals("MEDICAL_LICENSE") || fileType.equals("DEA_CERTIFICATE") ||
                    fileType.equals("BOARD_CERTIFICATION") || fileType.equals("MALPRACTICE_INSURANCE")) {

                Provider updateProvider = providerRepo.findById(providerId).orElse(null);
                if (updateProvider != null) {
                    boolean updated = false;
                    if (expiryDate != null && !expiryDate.isEmpty()) {
                        LocalDate newExpiryDate = LocalDate.parse(expiryDate);
                        updateProvider.setLicenseExpiry(newExpiryDate);
                        updated = true;
                    }
                    if (licenseNumber != null && !licenseNumber.isEmpty()) {
                        updateProvider.setLicenseNumber(licenseNumber);
                        updated = true;
                    }
                    if (updated) {
                        providerRepo.save(updateProvider);
                        System.out.println("Updated provider " + providerId + " - Expiry: " + expiryDate + ", License #: " + licenseNumber);
                    }
                }
            }

            ProviderFile savedFile = fileRepo.save(providerFile);
            return ResponseEntity.ok(Map.of(
                    "message", "File uploaded successfully",
                    "fileName", originalFileName,
                    "providerId", providerId,
                    "fileId", savedFile.getId(),
                    "isReplacement", !existingDocs.isEmpty(),
                    "version", nextVersion
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Upload failed: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{fileId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_MEMBER', 'TEAM_LEADER', 'GROUP_MGR')")
    public ResponseEntity<?> deleteFile(@PathVariable Long fileId, Principal principal) {
        try {
            ProviderFile file = fileRepo.findById(fileId)
                    .orElseThrow(() -> new RuntimeException("File not found"));

            // Delete physical file first
            try {
                java.nio.file.Path path = java.nio.file.Paths.get(file.getFilePath());
                if (java.nio.file.Files.exists(path)) {
                    java.nio.file.Files.deleteIfExists(path);
                }
            } catch (Exception e) {
                System.out.println("Could not delete physical file: " + e.getMessage());
            }

            // Then delete database record
            fileRepo.delete(file);

            return ResponseEntity.ok(Map.of("message", "File deleted successfully"));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/download/{fileId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROVIDER', 'TEAM_MEMBER', 'TEAM_LEADER', 'GROUP_MGR')")
    public ResponseEntity<?> downloadFile(@PathVariable Long fileId) {
        try {
            ProviderFile providerFile = fileRepo.findById(fileId)
                    .orElseThrow(() -> new RuntimeException("File not found with id: " + fileId));

            // Normalize the file path
            String filePath = providerFile.getFilePath().replace('\\', '/');
            java.nio.file.Path path = java.nio.file.Paths.get(filePath);

            if (!java.nio.file.Files.exists(path)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "File does not exist on disk: " + filePath));
            }

            org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(path.toUri());

            String contentType = Files.probeContentType(path);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            // URL encode the filename to handle spaces
            String encodedFileName = java.net.URLEncoder.encode(providerFile.getFileName(), "UTF-8")
                    .replace("+", "%20");

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + encodedFileName + "\"")
                    .body(resource);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/provider/{providerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROVIDER', 'TEAM_MEMBER', 'TEAM_LEADER', 'GROUP_MGR')")
    public ResponseEntity<?> getFilesForProvider(@PathVariable Long providerId, Principal principal) {
        try {
            // Permission checks
            AppUser currentUser = userRepo.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Provider provider = providerRepo.findById(providerId)
                    .orElseThrow(() -> new RuntimeException("Provider not found"));

            String role = currentUser.getRole();

            if (!"ADMIN".equals(role)) {
                if ("PROVIDER".equals(role)) {
                    if (!provider.getAppUserId().equals(currentUser.getId())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(Map.of("error", "You can only access your own files"));
                    }
                } else if ("TEAM_MEMBER".equals(role)) {
                    if (provider.getAssignedTeamMember() == null ||
                            !provider.getAssignedTeamMember().getId().equals(currentUser.getId())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(Map.of("error", "You can only access files for providers assigned to you"));
                    }
                } else if ("GROUP_MGR".equals(role)) {
                    Group group = groupRepo.findByManagerUserId(currentUser.getId())
                            .or(() -> groupRepo.findByManagerUserIdsContaining(currentUser.getId()))
                            .orElse(null);
                    if (group == null || !group.getId().equals(provider.getGroupId())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(Map.of("error", "You can only access files for providers in your group"));
                    }
                }
            }

            // ONLY get files from database - NO directory scanning to avoid duplicates
            List<ProviderFile> dbFiles = fileRepo.findByProviderId(providerId);

            return buildFileResponse(dbFiles);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    private ResponseEntity<?> buildFileResponse(List<ProviderFile> files) {
        List<Map<String, Object>> enrichedFiles = files.stream().map(file -> {
            Map<String, Object> enriched = new HashMap<>();
            enriched.put("id", file.getId());
            enriched.put("fileName", file.getFileName());
            enriched.put("fileType", file.getFileType());
            enriched.put("uploadedAt", file.getUploadedAt());
            enriched.put("providerId", file.getProviderId());
            enriched.put("isCurrent", file.isCurrent());
            enriched.put("version", file.getVersion());
            enriched.put("status", file.getStatus());

            // Get uploader info
            if (file.getUploadedByUserId() != null) {
                AppUser uploader = userRepo.findById(file.getUploadedByUserId()).orElse(null);
                if (uploader != null) {
                    enriched.put("uploadedBy", uploader.getFullName());
                    enriched.put("uploaderRole", uploader.getRole());
                } else {
                    enriched.put("uploadedBy", "Unknown");
                    enriched.put("uploaderRole", "");
                }
            } else {
                enriched.put("uploadedBy", "Unknown");
                enriched.put("uploaderRole", "");
            }

            return enriched;
        }).collect(Collectors.toList());

        // Also return current versions grouped by type
        Map<String, Object> currentVersions = new HashMap<>();
        System.out.println("=== buildFileResponse ===");
        for (ProviderFile file : files) {
            if (file.isCurrent()) {
                Map<String, Object> current = new HashMap<>();
                current.put("id", file.getId());
                current.put("fileName", file.getFileName());
                current.put("uploadedAt", file.getUploadedAt());
                current.put("version", file.getVersion());

                if (file.getUploadedByUserId() != null) {
                    AppUser uploader = userRepo.findById(file.getUploadedByUserId()).orElse(null);
                    if (uploader != null) {
                        current.put("uploadedBy", uploader.getFullName());
                        current.put("uploaderRole", uploader.getRole());
                    }
                }
                currentVersions.put(file.getFileType(), current);
            }
        }

        return ResponseEntity.ok(Map.of(
                "files", enrichedFiles,
                "currentVersions", currentVersions,
                "count", enrichedFiles.size()
        ));
    }

    @GetMapping("/document-history/{providerId}/{fileType}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_MEMBER', 'TEAM_LEADER', 'GROUP_MGR')")
    public ResponseEntity<?> getDocumentHistory(@PathVariable Long providerId, @PathVariable String fileType) {
        try {
            List<ProviderFile> documents = fileRepo.findByProviderIdAndFileType(providerId, fileType);

            List<Map<String, Object>> history = documents.stream()
                    .sorted((a, b) -> Integer.compare(b.getVersion(), a.getVersion()))
                    .map(doc -> {
                        AppUser uploader = userRepo.findById(doc.getUploadedByUserId()).orElse(null);
                        Map<String, Object> version = new HashMap<>();
                        version.put("id", doc.getId());
                        version.put("version", doc.getVersion());
                        version.put("fileName", doc.getFileName());
                        version.put("uploadedAt", doc.getUploadedAt());
                        version.put("isCurrent", doc.isCurrent());
                        version.put("status", doc.getStatus());
                        version.put("replacementReason", doc.getReplacementReason());
                        version.put("expiryDate", doc.getExpiryDate());
                        version.put("uploadedBy", uploader != null ? uploader.getFullName() : "Unknown");
                        version.put("uploaderRole", uploader != null ? uploader.getRole() : "");
                        return version;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(Map.of(
                    "history", history,
                    "documentType", fileType,
                    "totalVersions", history.size()
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}