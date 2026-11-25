package com.example.provider_license_tracker.controller;

import com.example.provider_license_tracker.model.*;
import com.example.provider_license_tracker.repository.*;
import com.example.provider_license_tracker.service.ProviderProfileService;
import com.example.provider_license_tracker.service.ExcelExportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.security.Principal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.IndexedColors;
import java.io.ByteArrayOutputStream;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/provider-profile")
public class ProviderProfileController {

    private final ProviderProfileService profileService;
    private final ProviderRepository providerRepository;
    private final UserRepository userRepository;
    private final ExcelExportService excelExportService;
    private final ProviderCdsLicenseRepository cdsLicenseRepository;
    private final ProviderBoardCertificationRepository boardCertificationRepository;
    private final ProviderFileRepository providerFileRepository;

    @Autowired
    public ProviderProfileController(ProviderProfileService profileService,
                                     ProviderRepository providerRepository,
                                     UserRepository userRepository,
                                     ExcelExportService excelExportService,
                                     ProviderCdsLicenseRepository cdsLicenseRepository,
                                     ProviderBoardCertificationRepository boardCertificationRepository,
                                     ProviderFileRepository providerFileRepository) {
        this.profileService = profileService;
        this.providerRepository = providerRepository;
        this.userRepository = userRepository;
        this.excelExportService = excelExportService;
        this.cdsLicenseRepository = cdsLicenseRepository;
        this.boardCertificationRepository = boardCertificationRepository;
        this.providerFileRepository = providerFileRepository;
    }

    @GetMapping("/completion-status")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> getCompletionStatus(Principal principal) {
        try {
            AppUser user = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Provider provider = providerRepository.findByAppUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("Provider not found"));

            int completionPercentage = provider.getProfileCompletion() != null ? provider.getProfileCompletion() : 0;
            String profileStatus = provider.getProfileStatus() != null ? provider.getProfileStatus() : "NOT_STARTED";
            boolean isCompleted = completionPercentage == 100 || "SUBMITTED".equals(profileStatus);

            return ResponseEntity.ok(Map.of(
                    "profileCompleted", isCompleted,
                    "completionPercentage", completionPercentage,
                    "profileStatus", profileStatus
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/export/{providerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEADER', 'TEAM_MEMBER')")
    public ResponseEntity<?> exportProviderToExcel(@PathVariable Long providerId, Principal principal) {
        try {
            Provider provider = providerRepository.findById(providerId)
                    .orElseThrow(() -> new RuntimeException("Provider not found"));

            Map<String, Object> profileData = new HashMap<>();
            profileData.put("providerId", provider.getId());
            profileData.put("personalInfo", profileService.getPersonalInfo(providerId));
            profileData.put("licenses", profileService.getLicenses(providerId));
            profileData.put("cdsLicenses", profileService.getCdsLicenses(providerId));
            profileData.put("boardCertifications", profileService.getBoardCertifications(providerId));
            profileData.put("education", profileService.getEducation(providerId));
            profileData.put("practiceLocations", profileService.getPracticeLocations(providerId));
            profileData.put("workHistory", profileService.getWorkHistory(providerId));
            profileData.put("malpractice", profileService.getMalpractice(providerId));
            profileData.put("payerIds", profileService.getPayerIds(providerId));
            profileData.put("hospitalPrivileges", profileService.getHospitalPrivileges(providerId));
            profileData.put("caqh", profileService.getCaqhInfo(providerId));
            profileData.put("affiliateArrangements", profileService.getAffiliateArrangements(providerId));

            // Use the new flattened format
            byte[] excelData = excelExportService.exportProviderToExcelFlattened(profileData, provider.getName());

            String filename = provider.getName().replaceAll("\\s+", "_") + "_credentialing_data.xlsx";

            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(excelData);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Export failed: " + e.getMessage()));
        }
    }

    @PostMapping("/education")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> saveEducation(
            @RequestParam Map<String, String> eduData,
            @RequestParam(value = "diploma", required = false) MultipartFile diploma,
            @RequestParam(value = "residencyCert", required = false) MultipartFile residencyCert,
            @RequestParam(value = "fellowshipCert", required = false) MultipartFile fellowshipCert,
            @RequestParam(value = "internshipCert", required = false) MultipartFile internshipCert,
            @RequestParam(value = "attendingCert", required = false) MultipartFile attendingCert,
            @RequestParam(value = "undergradDiploma", required = false) MultipartFile undergradDiploma,
            @RequestParam(value = "ecfmgFile", required = false) MultipartFile ecfmgFile,
            Principal principal) {
        try {
            AppUser user = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Provider provider = providerRepository.findByAppUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("Provider not found"));

            MultipartFile[] files = {diploma, residencyCert, fellowshipCert, internshipCert, attendingCert, undergradDiploma, ecfmgFile};
            ProviderEducation saved = profileService.saveEducation(provider.getId(), eduData, files, user.getId());

            return ResponseEntity.ok(Map.of(
                    "message", "Education information saved successfully",
                    "education", saved
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/education")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> getEducation(Principal principal) {
        try {
            AppUser user = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Provider provider = providerRepository.findByAppUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("Provider not found"));

            Map<String, Object> education = profileService.getEducation(provider.getId());
            return ResponseEntity.ok(education);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/hospital-privileges")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> getHospitalPrivileges(Principal principal) {
        try {
            AppUser user = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Provider provider = providerRepository.findByAppUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("Provider not found"));

            List<Map<String, Object>> privileges = profileService.getHospitalPrivileges(provider.getId());
            return ResponseEntity.ok(privileges);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/practice-location")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> addPracticeLocation(@RequestBody Map<String, Object> locationData, Principal principal) {
        try {
            AppUser user = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Provider provider = providerRepository.findByAppUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("Provider not found"));

            ProviderPracticeLocation saved = profileService.savePracticeLocation(provider.getId(), locationData);
            return ResponseEntity.ok(Map.of("message", "Practice location added successfully", "location", saved));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/practice-location/{locationId}")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> updatePracticeLocation(@PathVariable Long locationId, @RequestBody Map<String, Object> locationData) {
        try {
            ProviderPracticeLocation updated = profileService.updatePracticeLocation(locationId, locationData);
            return ResponseEntity.ok(Map.of("message", "Practice location updated successfully", "location", updated));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/practice-location/{locationId}")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> deletePracticeLocation(@PathVariable Long locationId) {
        try {
            profileService.deletePracticeLocation(locationId);
            return ResponseEntity.ok(Map.of("message", "Practice location deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== AFFILIATE ARRANGEMENTS ====================

    @GetMapping("/affiliate-arrangements")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> getAffiliateArrangements(Principal principal) {
        try {
            AppUser user = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Provider provider = providerRepository.findByAppUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("Provider not found"));

            List<Map<String, Object>> arrangements = profileService.getAffiliateArrangements(provider.getId());
            return ResponseEntity.ok(arrangements);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/affiliate-arrangement")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> addAffiliateArrangement(
            @RequestParam("arrangementType") String arrangementType,
            @RequestParam(value = "firstName", required = false) String firstName,
            @RequestParam(value = "lastName", required = false) String lastName,
            @RequestParam(value = "specialty", required = false) String specialty,
            @RequestParam(value = "phone", required = false) String phone,
            @RequestParam(value = "email", required = false) String email,
            @RequestParam(value = "npiNumber", required = false) String npiNumber,
            @RequestParam(value = "groupName", required = false) String groupName,
            @RequestParam(value = "organizationNpi", required = false) String organizationNpi,
            @RequestParam(value = "groupPhone", required = false) String groupPhone,
            @RequestParam(value = "groupEmail", required = false) String groupEmail,
            @RequestParam("arrangementDescription") String arrangementDescription,
            @RequestParam(value = "file", required = false) MultipartFile file,
            Principal principal) {
        try {
            AppUser user = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Provider provider = providerRepository.findByAppUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("Provider not found"));

            Map<String, Object> arrangementData = new HashMap<>();
            arrangementData.put("arrangementType", arrangementType);
            arrangementData.put("firstName", firstName);
            arrangementData.put("lastName", lastName);
            arrangementData.put("specialty", specialty);
            arrangementData.put("phone", phone);
            arrangementData.put("email", email);
            arrangementData.put("npiNumber", npiNumber);
            arrangementData.put("groupName", groupName);
            arrangementData.put("organizationNpi", organizationNpi);
            arrangementData.put("groupPhone", groupPhone);
            arrangementData.put("groupEmail", groupEmail);
            arrangementData.put("arrangementDescription", arrangementDescription);

            ProviderAffiliateArrangement saved = profileService.saveAffiliateArrangement(provider.getId(), arrangementData, file, user.getId());
            return ResponseEntity.ok(Map.of("message", "Affiliate arrangement added successfully", "arrangement", saved));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/affiliate-arrangement/{arrangementId}")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> deleteAffiliateArrangement(@PathVariable Long arrangementId) {
        try {
            profileService.deleteAffiliateArrangement(arrangementId);
            return ResponseEntity.ok(Map.of("message", "Affiliate arrangement deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    //payer-ids

    @GetMapping("/payer-ids")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> getPayerIds(Principal principal) {
        try {
            AppUser user = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Provider provider = providerRepository.findByAppUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("Provider not found"));

            List<Map<String, Object>> payerIds = profileService.getPayerIds(provider.getId());
            return ResponseEntity.ok(payerIds);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/payer-id")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> addPayerId(@RequestBody Map<String, Object> payerData, Principal principal) {
        try {
            AppUser user = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Provider provider = providerRepository.findByAppUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("Provider not found"));

            ProviderPayerId saved = profileService.savePayerId(provider.getId(), payerData);
            return ResponseEntity.ok(Map.of("message", "Payer ID added successfully", "payerId", saved));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/payer-id/{payerId}")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> deletePayerId(@PathVariable Long payerId) {
        try {
            profileService.deletePayerId(payerId);
            return ResponseEntity.ok(Map.of("message", "Payer ID deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/practice-locations")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> getPracticeLocations(Principal principal) {
        try {
            AppUser user = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Provider provider = providerRepository.findByAppUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("Provider not found"));

            List<Map<String, Object>> locations = profileService.getPracticeLocations(provider.getId());
            return ResponseEntity.ok(locations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/my-profile")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> getMyProfile(Principal principal) {
        try {
            AppUser user = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Provider provider = providerRepository.findByAppUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("Provider not found"));

            Map<String, Object> response = new HashMap<>();

            Map<String, Object> personalInfo = new HashMap<>();
            personalInfo.put("npiNumber", provider.getNpiNumber());
            personalInfo.put("medicaidId", provider.getMedicaidId());
            personalInfo.put("medicareNumber", provider.getMedicareNumber());
            personalInfo.put("caqhId", provider.getCaqhId());
            personalInfo.put("deaNumber", provider.getDeaNumber());
            personalInfo.put("medicalSchool", provider.getMedicalSchool());
            personalInfo.put("residencyProgram", provider.getResidencyProgram());
            personalInfo.put("boardCertification", provider.getBoardCertification());
            personalInfo.put("malpracticeCarrier", provider.getMalpracticeCarrier());
            personalInfo.put("malpracticePolicyNumber", provider.getMalpracticePolicyNumber());
            personalInfo.put("malpracticeExpiryDate", provider.getMalpracticeExpiryDate());

            response.put("personalInfo", personalInfo);
            response.put("completionPercentage", provider.getProfileCompletion());
            response.put("profileStatus", provider.getProfileStatus());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/cds-licenses")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> saveCdsLicenses(
            @RequestParam Map<String, String> cdsData,
            @RequestParam(value = "deaFile", required = false) MultipartFile deaFile,
            Principal principal) {
        try {
            AppUser user = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Provider provider = providerRepository.findByAppUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("Provider not found"));

            if (deaFile != null && !deaFile.isEmpty()) {
                String UPLOAD_DIR = System.getProperty("user.dir") + File.separator + "uploads" + File.separator;
                java.io.File uploadDir = new java.io.File(UPLOAD_DIR + provider.getId() + "/");
                if (!uploadDir.exists()) uploadDir.mkdirs();

                String timestamp = String.valueOf(System.currentTimeMillis());
                String originalFileName = deaFile.getOriginalFilename();
                String nameWithoutExt = originalFileName.substring(0, originalFileName.lastIndexOf('.'));
                String extension = originalFileName.substring(originalFileName.lastIndexOf('.'));
                String uniqueFileName = nameWithoutExt + "_" + timestamp + extension;
                String filePath = UPLOAD_DIR + provider.getId() + "/" + uniqueFileName;
                String normalizedPath = filePath.replace('\\', '/');
                java.nio.file.Files.write(java.nio.file.Paths.get(normalizedPath), deaFile.getBytes());

                ProviderFile providerFile = new ProviderFile();
                providerFile.setProviderId(provider.getId());
                providerFile.setUploadedByUserId(user.getId());
                providerFile.setFileName(originalFileName);
                providerFile.setFileType("DEA_CERTIFICATE");
                providerFile.setFilePath(normalizedPath);
                providerFile.setUploadedAt(java.time.LocalDateTime.now());
                providerFile.setUpdatedAt(java.time.LocalDateTime.now());
                providerFile.setCurrent(true);
                providerFile.setVersion(1);
                providerFile.setStatus("CURRENT");
                providerFile.setDocumentId("DEA_CERTIFICATE_" + provider.getId());
                providerFileRepository.save(providerFile);
            }

            List<ProviderCdsLicense> existingCds = cdsLicenseRepository.findByProviderId(provider.getId());
            ProviderCdsLicense cdsLicense;

            if (existingCds.isEmpty()) {
                cdsLicense = new ProviderCdsLicense();
                cdsLicense.setProviderId(provider.getId());
            } else {
                cdsLicense = existingCds.get(0);
            }

            Boolean doNotPrescribe = Boolean.parseBoolean(cdsData.get("doNotPrescribe"));
            if (doNotPrescribe) {
                cdsLicense.setDoNotPrescribe(true);
                cdsLicense.setDeaNumber(null);
                cdsLicense.setDeaIssueDate(null);
                cdsLicense.setDeaExpirationDate(null);
                cdsLicense.setCdsNumber(null);
                cdsLicense.setCdsState(null);
                cdsLicense.setCdsIssueDate(null);
                cdsLicense.setCdsExpirationDate(null);
            } else {
                cdsLicense.setDoNotPrescribe(false);
                cdsLicense.setDeaNumber(cdsData.get("deaNumber"));
                if (cdsData.containsKey("deaIssueDate") && cdsData.get("deaIssueDate") != null && !cdsData.get("deaIssueDate").isEmpty()) {
                    cdsLicense.setDeaIssueDate(LocalDate.parse(cdsData.get("deaIssueDate")));
                }
                if (cdsData.containsKey("deaExpirationDate") && cdsData.get("deaExpirationDate") != null && !cdsData.get("deaExpirationDate").isEmpty()) {
                    cdsLicense.setDeaExpirationDate(LocalDate.parse(cdsData.get("deaExpirationDate")));
                }
                cdsLicense.setCdsNumber(cdsData.get("cdsNumber"));
                cdsLicense.setCdsState(cdsData.get("cdsState"));
                if (cdsData.containsKey("cdsIssueDate") && cdsData.get("cdsIssueDate") != null && !cdsData.get("cdsIssueDate").isEmpty()) {
                    cdsLicense.setCdsIssueDate(LocalDate.parse(cdsData.get("cdsIssueDate")));
                }
                if (cdsData.containsKey("cdsExpirationDate") && cdsData.get("cdsExpirationDate") != null && !cdsData.get("cdsExpirationDate").isEmpty()) {
                    cdsLicense.setCdsExpirationDate(LocalDate.parse(cdsData.get("cdsExpirationDate")));
                }
            }

            cdsLicenseRepository.save(cdsLicense);
            profileService.recalculateCompletion(provider.getId());

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", doNotPrescribe ? "I do not prescribe option saved" : "CDS information saved successfully"
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/cds-licenses")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> getCdsLicenses(Principal principal) {
        try {
            AppUser user = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Provider provider = providerRepository.findByAppUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("Provider not found"));

            List<ProviderCdsLicense> cdsList = cdsLicenseRepository.findByProviderId(provider.getId());

            if (cdsList.isEmpty()) {
                return ResponseEntity.ok(Map.of());
            }

            ProviderCdsLicense license = cdsList.get(0);
            Map<String, Object> response = new HashMap<>();
            response.put("deaNumber", license.getDeaNumber());
            response.put("deaIssueDate", license.getDeaIssueDate());
            response.put("deaExpirationDate", license.getDeaExpirationDate());
            response.put("cdsNumber", license.getCdsNumber());
            response.put("cdsState", license.getCdsState());
            response.put("cdsIssueDate", license.getCdsIssueDate());
            response.put("cdsExpirationDate", license.getCdsExpirationDate());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/complete")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> completeProfile(@RequestBody Map<String, String> profileData, Principal principal) {
        try {
            AppUser user = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Provider provider = providerRepository.findByAppUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("Provider not found"));

            List<String> missingFields = new ArrayList<>();

            if (profileData.get("npiNumber") == null || profileData.get("npiNumber").trim().isEmpty()) {
                missingFields.add("NPI Number");
            }
            if (profileData.get("medicalSchool") == null || profileData.get("medicalSchool").trim().isEmpty()) {
                missingFields.add("Medical School");
            }
            if (profileData.get("boardCertification") == null || profileData.get("boardCertification").trim().isEmpty()) {
                missingFields.add("Board Certification");
            }
            if (profileData.get("malpracticeCarrier") == null || profileData.get("malpracticeCarrier").trim().isEmpty()) {
                missingFields.add("Malpractice Insurance Carrier");
            }
            if (profileData.get("malpracticePolicyNumber") == null || profileData.get("malpracticePolicyNumber").trim().isEmpty()) {
                missingFields.add("Malpractice Policy Number");
            }
            if (profileData.get("malpracticeExpiryDate") == null || profileData.get("malpracticeExpiryDate").trim().isEmpty()) {
                missingFields.add("Malpractice Expiry Date");
            }

            if (!missingFields.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of(
                                "success", false,
                                "error", "Please complete all required fields",
                                "missingFields", missingFields,
                                "message", "Missing fields: " + String.join(", ", missingFields)
                        ));
            }

            Map<String, Object> personalInfo = new HashMap<>();
            personalInfo.put("npiNumber", profileData.get("npiNumber"));
            personalInfo.put("medicaidId", profileData.get("medicaidId"));
            personalInfo.put("medicareNumber", profileData.get("medicareNumber"));
            personalInfo.put("caqhId", profileData.get("caqhId"));
            personalInfo.put("deaNumber", profileData.get("deaNumber"));
            personalInfo.put("medicalSchool", profileData.get("medicalSchool"));
            personalInfo.put("residencyProgram", profileData.get("residencyProgram"));
            personalInfo.put("boardCertification", profileData.get("boardCertification"));
            personalInfo.put("malpracticeCarrier", profileData.get("malpracticeCarrier"));
            personalInfo.put("malpracticePolicyNumber", profileData.get("malpracticePolicyNumber"));
            personalInfo.put("malpracticeExpiryDate", profileData.get("malpracticeExpiryDate"));

            Provider updated = profileService.savePersonalInfo(provider.getId(), personalInfo);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Profile completed successfully",
                    "completionPercentage", updated.getProfileCompletion()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

//    //peer-references
//
//    @GetMapping("/peer-references")
//    @PreAuthorize("hasRole('PROVIDER')")
//    public ResponseEntity<?> getPeerReferences(Principal principal) {
//        try {
//            AppUser user = userRepository.findByUsername(principal.getName())
//                    .orElseThrow(() -> new RuntimeException("User not found"));
//            Provider provider = providerRepository.findByAppUserId(user.getId())
//                    .orElseThrow(() -> new RuntimeException("Provider not found"));
//
//            List<Map<String, Object>> references = profileService.getPeerReferences(provider.getId());
//            return ResponseEntity.ok(references);
//        } catch (Exception e) {
//            e.printStackTrace();
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                    .body(Map.of("error", e.getMessage()));
//        }
//    }
//
//    @PostMapping("/peer-reference")
//    @PreAuthorize("hasRole('PROVIDER')")
//    public ResponseEntity<?> addPeerReference(
//            @RequestParam("referenceName") String referenceName,
//            @RequestParam("title") String title,
//            @RequestParam(value = "institution", required = false) String institution,
//            @RequestParam("email") String email,
//            @RequestParam(value = "phone", required = false) String phone,
//            @RequestParam(value = "file", required = false) MultipartFile file,
//            Principal principal) {
//        try {
//            AppUser user = userRepository.findByUsername(principal.getName())
//                    .orElseThrow(() -> new RuntimeException("User not found"));
//            Provider provider = providerRepository.findByAppUserId(user.getId())
//                    .orElseThrow(() -> new RuntimeException("Provider not found"));
//
//            Map<String, Object> refData = new HashMap<>();
//            refData.put("referenceName", referenceName);
//            refData.put("title", title);
//            refData.put("institution", institution);
//            refData.put("email", email);
//            refData.put("phone", phone);
//
//            ProviderPeerReference saved = profileService.savePeerReference(provider.getId(), refData, file);
//            return ResponseEntity.ok(Map.of("message", "Peer reference added successfully", "reference", saved));
//        } catch (Exception e) {
//            e.printStackTrace();
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                    .body(Map.of("error", e.getMessage()));
//        }
//    }
//
//    @DeleteMapping("/peer-reference/{referenceId}")
//    @PreAuthorize("hasRole('PROVIDER')")
//    public ResponseEntity<?> deletePeerReference(@PathVariable Long referenceId) {
//        try {
//            profileService.deletePeerReference(referenceId);
//            return ResponseEntity.ok(Map.of("message", "Peer reference deleted successfully"));
//        } catch (Exception e) {
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                    .body(Map.of("error", e.getMessage()));
//        }
//    }
//


    @GetMapping("/personal-info")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> getPersonalInfo(Principal principal) {
        try {
            AppUser user = userRepository.findByUsername(principal.getName()).orElseThrow();
            Provider provider = providerRepository.findByAppUserId(user.getId()).orElseThrow();
            Map<String, Object> personalInfo = Map.of(
                    "npiNumber", provider.getNpiNumber() != null ? provider.getNpiNumber() : "",
                    "dateOfBirth", provider.getDateOfBirth() != null ? provider.getDateOfBirth().toString() : "",
                    "ssn", provider.getSsn() != null ? provider.getSsn() : "",
                    "gender", provider.getGender() != null ? provider.getGender() : "",
                    "addressLine1", provider.getAddressLine1() != null ? provider.getAddressLine1() : "",
                    "addressLine2", provider.getAddressLine2() != null ? provider.getAddressLine2() : "",
                    "city", provider.getCity() != null ? provider.getCity() : "",
                    "state", provider.getState() != null ? provider.getState() : "",
                    "zipCode", provider.getZipCode() != null ? provider.getZipCode() : ""
            );
            return ResponseEntity.ok(personalInfo);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/personal-info")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> savePersonalInfo(@RequestBody Map<String, Object> personalInfo, Principal principal) {
        try {
            AppUser user = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Provider provider = providerRepository.findByAppUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("Provider not found"));

            Provider updated = profileService.savePersonalInfo(provider.getId(), personalInfo);
            return ResponseEntity.ok(Map.of("message", "Personal information saved", "provider", updated));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/license")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> addLicense(
            @RequestParam("state") String state,
            @RequestParam("licenseNumber") String licenseNumber,
            @RequestParam("licenseType") String licenseType,
            @RequestParam("issueDate") String issueDate,
            @RequestParam("expirationDate") String expirationDate,
            @RequestParam("status") String status,
            @RequestParam(value = "notes", required = false) String notes,
            @RequestParam(value = "file", required = false) MultipartFile file,
            Principal principal) {
        try {
            AppUser user = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Provider provider = providerRepository.findByAppUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("Provider not found"));

            Map<String, Object> licenseData = new HashMap<>();
            licenseData.put("state", state);
            licenseData.put("licenseNumber", licenseNumber);
            licenseData.put("licenseType", licenseType);
            licenseData.put("issueDate", issueDate);
            licenseData.put("expirationDate", expirationDate);
            licenseData.put("status", status);
            licenseData.put("notes", notes);

            ProviderLicense license = profileService.addLicense(provider.getId(), licenseData, file, user.getId());
            return ResponseEntity.ok(Map.of("message", "License added successfully", "license", license));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/licenses")
    public ResponseEntity<?> getLicenses(Principal principal) {
        try {
            AppUser user = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Provider provider = providerRepository.findByAppUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("Provider not found"));

            List<Map<String, Object>> licenses = profileService.getLicenses(provider.getId());
            return ResponseEntity.ok(licenses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/board-certification/{certId}")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> deleteBoardCertification(@PathVariable Long certId, Principal principal) {
        try {
            AppUser user = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Provider provider = providerRepository.findByAppUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("Provider not found"));

            ProviderBoardCertification cert = boardCertificationRepository.findById(certId)
                    .orElseThrow(() -> new RuntimeException("Certification not found"));

            if (!cert.getProviderId().equals(provider.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "You don't own this certification"));
            }

            // Also delete from provider_file table
            List<ProviderFile> files = providerFileRepository.findByProviderIdAndFileType(provider.getId(), cert.getCertType());
            for (ProviderFile file : files) {
                providerFileRepository.delete(file);
            }

            boardCertificationRepository.deleteById(certId);
            profileService.recalculateCompletion(provider.getId());

            return ResponseEntity.ok(Map.of("message", "Certification deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
    @DeleteMapping("/license/{licenseId}")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> deleteLicense(@PathVariable Long licenseId) {
        try {
            profileService.deleteLicense(licenseId);
            return ResponseEntity.ok(Map.of("message", "License deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/malpractice")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> saveMalpractice(
            @RequestParam("carrierName") String carrierName,
            @RequestParam("policyNumber") String policyNumber,
            @RequestParam(value = "coverageLimit", required = false) String coverageLimit,
            @RequestParam("effectiveDate") String effectiveDate,
            @RequestParam("expirationDate") String expirationDate,
            @RequestParam(value = "policyType", required = false) String policyType,
            @RequestParam(value = "tailCoverage", required = false) Boolean tailCoverage,
            @RequestParam(value = "file", required = false) MultipartFile file,
            Principal principal) {
        try {
            AppUser user = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Provider provider = providerRepository.findByAppUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("Provider not found"));

            Map<String, Object> malData = new HashMap<>();
            malData.put("carrierName", carrierName);
            malData.put("policyNumber", policyNumber);
            malData.put("coverageLimit", coverageLimit);
            malData.put("effectiveDate", effectiveDate);
            malData.put("expirationDate", expirationDate);
            malData.put("policyType", policyType != null ? policyType : "Claims-Made");
            malData.put("tailCoverage", tailCoverage != null ? tailCoverage : false);

            ProviderMalpractice saved = profileService.saveMalpractice(provider.getId(), malData, file);
            return ResponseEntity.ok(Map.of("message", "Malpractice insurance saved successfully", "malpractice", saved));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/malpractice")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> getMalpractice(Principal principal) {
        try {
            AppUser user = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Provider provider = providerRepository.findByAppUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("Provider not found"));

            Map<String, Object> malpractice = profileService.getMalpractice(provider.getId());
            return ResponseEntity.ok(malpractice);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/board-certifications")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> getBoardCertifications(Principal principal) {
        try {
            AppUser user = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Provider provider = providerRepository.findByAppUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("Provider not found"));

            List<ProviderBoardCertification> certifications = boardCertificationRepository.findByProviderId(provider.getId());

            List<Map<String, Object>> result = new ArrayList<>();
            for (ProviderBoardCertification cert : certifications) {
                Map<String, Object> certMap = new HashMap<>();
                certMap.put("id", cert.getId());
                certMap.put("specialty", cert.getSpecialty());
                certMap.put("certifyingBoard", cert.getCertifyingBoard());
                certMap.put("certificationNumber", cert.getCertificationNumber());
                certMap.put("issueDate", cert.getIssueDate());
                certMap.put("expirationDate", cert.getExpirationDate());
                result.add(certMap);
            }

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/board-certification")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> addBoardCertification(
            @RequestParam("certType") String certType,
            @RequestParam(value = "specialty", required = false) String specialty,
            @RequestParam(value = "certifyingBoard", required = false) String certifyingBoard,
            @RequestParam(value = "certificationNumber", required = false) String certificationNumber,
            @RequestParam("issueDate") String issueDate,
            @RequestParam("expirationDate") String expirationDate,
            @RequestParam(value = "file", required = false) MultipartFile file,
            Principal principal) {
        try {
            AppUser user = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Provider provider = providerRepository.findByAppUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("Provider not found"));

            Map<String, Object> certData = new HashMap<>();
            certData.put("certType", certType);
            certData.put("specialty", specialty);
            certData.put("certifyingBoard", certifyingBoard);
            certData.put("certificationNumber", certificationNumber);
            certData.put("issueDate", issueDate);
            certData.put("expirationDate", expirationDate);

            ProviderBoardCertification cert = profileService.addBoardCertification(provider.getId(), certData, file);

            // ===== ADD THIS SECTION TO SAVE TO provider_file =====
            if (file != null && !file.isEmpty()) {
                String UPLOAD_DIR = System.getProperty("user.dir") + File.separator + "uploads" + File.separator;
                java.io.File uploadDir = new java.io.File(UPLOAD_DIR + provider.getId() + "/");
                if (!uploadDir.exists()) uploadDir.mkdirs();

                String timestamp = String.valueOf(System.currentTimeMillis());
                String originalFileName = file.getOriginalFilename();
                String nameWithoutExt = originalFileName.substring(0, originalFileName.lastIndexOf('.'));
                String extension = originalFileName.substring(originalFileName.lastIndexOf('.'));
                String uniqueFileName = nameWithoutExt + "_" + timestamp + extension;
                String filePath = UPLOAD_DIR + provider.getId() + "/" + uniqueFileName;
                String normalizedPath = filePath.replace('\\', '/');
                java.nio.file.Files.write(java.nio.file.Paths.get(normalizedPath), file.getBytes());

                ProviderFile providerFile = new ProviderFile();
                providerFile.setProviderId(provider.getId());
                providerFile.setUploadedByUserId(user.getId());
                providerFile.setFileName(originalFileName);
                providerFile.setFileType(certType);  // BOARD_CERTIFICATION, BLS_CERT, etc.
                providerFile.setFilePath(normalizedPath);
                providerFile.setUploadedAt(LocalDateTime.now());
                providerFile.setUpdatedAt(LocalDateTime.now());
                providerFile.setCurrent(true);
                providerFile.setVersion(1);
                providerFile.setStatus("CURRENT");
                providerFile.setDocumentId(certType + "_" + provider.getId());
                providerFileRepository.save(providerFile);

                System.out.println("Saved to provider_file: " + certType + " for provider " + provider.getId());
            }
            // ===== END OF ADDED SECTION =====

            return ResponseEntity.ok(Map.of("message", "Certification added", "certification", cert));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }


    @GetMapping("/work-history")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> getWorkHistory(Principal principal) {
        try {
            AppUser user = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Provider provider = providerRepository.findByAppUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("Provider not found"));

            List<Map<String, Object>> workHistory = profileService.getWorkHistory(provider.getId());
            return ResponseEntity.ok(workHistory);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/work-history")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> addWorkHistory(
            @RequestParam("facilityName") String facilityName,
            @RequestParam("position") String position,
            @RequestParam("startDate") String startDate,
            @RequestParam(value = "endDate", required = false) String endDate,
            @RequestParam(value = "isCurrent", required = false) Boolean isCurrent,
            @RequestParam(value = "address", required = false) String address,
            @RequestParam(value = "supervisorName", required = false) String supervisorName,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "startDateWithGroup", required = false) String startDateWithGroup,
            @RequestParam(value = "cvFile", required = false) MultipartFile cvFile,
            Principal principal) {

        try {
            if (startDateWithGroup != null && !startDateWithGroup.isEmpty()) {
                if (cvFile == null || cvFile.isEmpty()) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("error", "CV file is required when start date is provided"));
                }
            }

            AppUser user = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Provider provider = providerRepository.findByAppUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("Provider not found"));

            Map<String, Object> workData = new HashMap<>();
            workData.put("facilityName", facilityName);
            workData.put("position", position);
            workData.put("startDate", startDate);
            workData.put("endDate", endDate);
            workData.put("isCurrent", isCurrent != null ? isCurrent : false);
            workData.put("address", address);
            workData.put("supervisorName", supervisorName);
            workData.put("description", description);
            workData.put("startDateWithGroup", startDateWithGroup);

            ProviderWorkHistory saved = profileService.saveWorkHistory(provider.getId(), workData, cvFile, user.getId());

            return ResponseEntity.ok(Map.of("message", "Work history added successfully", "work", saved));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/work-history/{workId}")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> deleteWorkHistory(@PathVariable Long workId) {
        try {
            profileService.deleteWorkHistory(workId);
            return ResponseEntity.ok(Map.of("message", "Work history entry deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/hospital-privilege")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> addHospitalPrivilege(
            @RequestParam("hospitalName") String hospitalName,
            @RequestParam("privilegeType") String privilegeType,
            @RequestParam("startDate") String startDate,
            @RequestParam(value = "endDate", required = false) String endDate,
            @RequestParam(value = "isCurrent", required = false) Boolean isCurrent,
            @RequestParam(value = "department", required = false) String department,
            @RequestParam(value = "isPrimaryHospital", required = false) Boolean isPrimaryHospital,
            @RequestParam(value = "privilegeLevel", required = false) String privilegeLevel,
            @RequestParam(value = "privilegeDescription", required = false) String privilegeDescription,
            @RequestParam(value = "patientPercentage", required = false) String patientPercentage,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "noPrivileges", required = false) Boolean noPrivileges,
            @RequestParam(value = "noPrivilegesReason", required = false) String noPrivilegesReason,
            Principal principal) {
        try {
            AppUser user = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Provider provider = providerRepository.findByAppUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("Provider not found"));

            Map<String, Object> privilegeData = new HashMap<>();
            privilegeData.put("hospitalName", hospitalName);
            privilegeData.put("privilegeType", privilegeType);
            privilegeData.put("startDate", startDate);
            privilegeData.put("endDate", endDate);
            privilegeData.put("isCurrent", isCurrent != null ? isCurrent : true);
            privilegeData.put("department", department);
            privilegeData.put("isPrimaryHospital", isPrimaryHospital != null ? isPrimaryHospital : false);
            privilegeData.put("privilegeLevel", privilegeLevel);
            privilegeData.put("privilegeDescription", privilegeDescription);
            privilegeData.put("patientPercentage", patientPercentage);
            privilegeData.put("noPrivileges", noPrivileges != null ? noPrivileges : false);
            privilegeData.put("noPrivilegesReason", noPrivilegesReason);

            ProviderHospitalPrivilege saved = profileService.saveHospitalPrivilege(provider.getId(), privilegeData, file);
            return ResponseEntity.ok(Map.of("message", "Hospital privilege added", "privilege", saved));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/hospital-privilege/{privilegeId}")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> deleteHospitalPrivilege(@PathVariable Long privilegeId) {
        try {
            profileService.deleteHospitalPrivilege(privilegeId);
            return ResponseEntity.ok(Map.of("message", "Hospital privilege deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/hospital-privilege/no-privileges")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> saveNoPrivileges(@RequestBody Map<String, Object> request, Principal principal) {
        try {
            AppUser user = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Provider provider = providerRepository.findByAppUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("Provider not found"));

            Boolean noPrivileges = (Boolean) request.get("noPrivileges");
            String noPrivilegesReason = (String) request.get("noPrivilegesReason");

            provider.setNoHospitalPrivileges(noPrivileges);
            provider.setNoHospitalPrivilegesReason(noPrivilegesReason);
            providerRepository.save(provider);

            profileService.recalculateCompletion(provider.getId());

            return ResponseEntity.ok(Map.of("message", "No hospital privileges option saved"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/upload-file")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> uploadProviderFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("fileType") String fileType,
            Principal principal) {
        try {
            AppUser user = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Provider provider = providerRepository.findByAppUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("Provider not found"));

            String UPLOAD_DIR = System.getProperty("user.dir") + File.separator + "uploads" + File.separator;
            java.io.File uploadDir = new java.io.File(UPLOAD_DIR + provider.getId() + "/");
            if (!uploadDir.exists()) uploadDir.mkdirs();

            String timestamp = String.valueOf(System.currentTimeMillis());
            String originalFileName = file.getOriginalFilename();
            String nameWithoutExt = originalFileName.substring(0, originalFileName.lastIndexOf('.'));
            String extension = originalFileName.substring(originalFileName.lastIndexOf('.'));
            String uniqueFileName = nameWithoutExt + "_" + timestamp + extension;
            String filePath = UPLOAD_DIR + provider.getId() + "/" + uniqueFileName;

            String normalizedPath = filePath.replace('\\', '/');
            java.nio.file.Files.write(java.nio.file.Paths.get(normalizedPath), file.getBytes());

            ProviderFile providerFile = new ProviderFile();
            providerFile.setProviderId(provider.getId());
            providerFile.setUploadedByUserId(user.getId());
            providerFile.setFileName(originalFileName);
            providerFile.setFileType(fileType);
            providerFile.setFilePath(normalizedPath);
            providerFile.setUploadedAt(java.time.LocalDateTime.now());
            providerFile.setUpdatedAt(java.time.LocalDateTime.now());
            providerFile.setCurrent(true);
            providerFile.setVersion(1);
            providerFile.setStatus("CURRENT");
            providerFile.setDocumentId(fileType + "_" + provider.getId());

            providerFileRepository.save(providerFile);

            return ResponseEntity.ok(Map.of(
                    "message", "File uploaded successfully",
                    "fileName", originalFileName,
                    "fileId", providerFile.getId()
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/submit")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> submitProfile(@RequestBody Map<String, String> request, Principal principal) {
        try {
            AppUser user = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Provider provider = providerRepository.findByAppUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("Provider not found"));

            String signature = request.get("signature");
            Provider submitted = profileService.submitProfile(provider.getId(), signature);

            return ResponseEntity.ok(Map.of(
                    "message", "Profile submitted for review",
                    "profileStatus", submitted.getProfileStatus(),
                    "completionPercentage", submitted.getProfileCompletion()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/export-all")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEADER')")
    public ResponseEntity<?> exportAllProviders(Principal principal) {
        try {
            List<Provider> providers = providerRepository.findAll();

            if (providers.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "No providers found to export"));
            }

            // Use the same flattened format, but with multiple rows
            try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {

                Sheet sheet = workbook.createSheet("All Providers");

                // Create header row (same as flattened format)
                Row headerRow = sheet.createRow(0);
                CellStyle headerStyle = workbook.createCellStyle();
                Font headerFont = workbook.createFont();
                headerFont.setBold(true);
                headerStyle.setFont(headerFont);
                headerStyle.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
                headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

                // Define headers (same as the flattened format)
                String[] headers = {
                        "Provider ID", "Provider Name", "NPI Number", "Date of Birth", "SSN", "Gender",
                        "Email", "Phone Number", "Address Line 1", "Address Line 2", "City", "State", "Zip Code",
                        "Specialty", "Primary Language", "Other Languages",
                        "License 1 State", "License 1 Number", "License 1 Type", "License 1 Exp Date",
                        "License 2 State", "License 2 Number", "License 2 Type", "License 2 Exp Date",
                        "DEA Number", "DEA Issue Date", "DEA Exp Date",
                        "CDS Number", "CDS State", "CDS Issue Date", "CDS Exp Date",
                        "Board Cert 1", "Board Cert 1 Exp Date",
                        "Board Cert 2", "Board Cert 2 Exp Date",
                        "Medical School", "Graduation Date", "Residency Facility", "Residency Specialty",
                        "Fellowship Facility", "Fellowship Specialty",
                        "Malpractice Carrier", "Malpractice Policy Number", "Malpractice Effective Date", "Malpractice Exp Date",
                        "Medicare Number", "Medicaid ID", "CAQH ID",
                        "Primary Practice Location", "Practice Address", "Practice Phone", "Accepting Patients",
                        "Work History 1 - Facility", "Work History 1 - Position", "Work History 1 - Start Date",
                        "Work History 2 - Facility", "Work History 2 - Position", "Work History 2 - Start Date",
                        "Hospital Privilege 1 - Hospital", "Hospital Privilege 1 - Type", "Hospital Privilege 1 - Start Date",
                        "Payer ID 1 - State", "Payer ID 1 - Medicare PTAN", "Payer ID 1 - Medicaid ID"
                };

                for (int i = 0; i < headers.length; i++) {
                    Cell cell = headerRow.createCell(i);
                    cell.setCellValue(headers[i]);
                    cell.setCellStyle(headerStyle);
                    sheet.setColumnWidth(i, 5000);
                }

                // Add data for each provider
                int rowNum = 1;
                for (Provider provider : providers) {
                    Row dataRow = sheet.createRow(rowNum++);
                    int col = 0;

                    // Get profile data for this provider
                    Map<String, Object> profileData = new HashMap<>();
                    profileData.put("providerId", provider.getId());
                    profileData.put("personalInfo", profileService.getPersonalInfo(provider.getId()));
                    profileData.put("licenses", profileService.getLicenses(provider.getId()));
                    profileData.put("cdsLicenses", profileService.getCdsLicenses(provider.getId()));
                    profileData.put("boardCertifications", profileService.getBoardCertifications(provider.getId()));
                    profileData.put("education", profileService.getEducation(provider.getId()));
                    profileData.put("practiceLocations", profileService.getPracticeLocations(provider.getId()));
                    profileData.put("workHistory", profileService.getWorkHistory(provider.getId()));
                    profileData.put("malpractice", profileService.getMalpractice(provider.getId()));
                    profileData.put("payerIds", profileService.getPayerIds(provider.getId()));
                    profileData.put("hospitalPrivileges", profileService.getHospitalPrivileges(provider.getId()));
                    profileData.put("caqh", profileService.getCaqhInfo(provider.getId()));
                    profileData.put("affiliateArrangements", profileService.getAffiliateArrangements(provider.getId()));

                    // Use the same flattening logic
                    fillDataRow(dataRow, profileData);
                }

                workbook.write(out);
                byte[] excelData = out.toByteArray();
                String filename = "All_Providers_Credentialing_Data.xlsx";

                return ResponseEntity.ok()
                        .header("Content-Disposition", "attachment; filename=\"" + filename + "\"")
                        .contentType(MediaType.APPLICATION_OCTET_STREAM)
                        .body(excelData);
            }

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Export failed: " + e.getMessage()));
        }
    }

    // Helper method to fill a row with provider data (reuse the same logic)
    private void fillDataRow(Row dataRow, Map<String, Object> profileData) {
        int col = 0;

        Map<String, Object> personalInfo = (Map<String, Object>) profileData.getOrDefault("personalInfo", new HashMap<>());
        dataRow.createCell(col++).setCellValue(getLongValue(profileData.get("providerId")));
        dataRow.createCell(col++).setCellValue(getStringValue(personalInfo.get("fullName")));
        dataRow.createCell(col++).setCellValue(getStringValue(personalInfo.get("npiNumber")));
        dataRow.createCell(col++).setCellValue(getStringValue(personalInfo.get("dateOfBirth")));
        dataRow.createCell(col++).setCellValue(getStringValue(personalInfo.get("ssn")));
        dataRow.createCell(col++).setCellValue(getStringValue(personalInfo.get("gender")));
        dataRow.createCell(col++).setCellValue(getStringValue(personalInfo.get("email")));
        dataRow.createCell(col++).setCellValue(getStringValue(personalInfo.get("phone")));
        dataRow.createCell(col++).setCellValue(getStringValue(personalInfo.get("addressLine1")));
        dataRow.createCell(col++).setCellValue(getStringValue(personalInfo.get("addressLine2")));
        dataRow.createCell(col++).setCellValue(getStringValue(personalInfo.get("city")));
        dataRow.createCell(col++).setCellValue(getStringValue(personalInfo.get("state")));
        dataRow.createCell(col++).setCellValue(getStringValue(personalInfo.get("zipCode")));
        dataRow.createCell(col++).setCellValue(getStringValue(personalInfo.get("specialty")));
        dataRow.createCell(col++).setCellValue(getStringValue(personalInfo.get("primaryLanguage")));
        dataRow.createCell(col++).setCellValue(getStringValue(personalInfo.get("otherLanguages")));

        // Licenses (up to 2)
        List<Map<String, Object>> licenses = (List<Map<String, Object>>) profileData.getOrDefault("licenses", new ArrayList<>());
        for (int i = 0; i < 2; i++) {
            if (i < licenses.size()) {
                Map<String, Object> license = licenses.get(i);
                dataRow.createCell(col++).setCellValue(getStringValue(license.get("state")));
                dataRow.createCell(col++).setCellValue(getStringValue(license.get("licenseNumber")));
                dataRow.createCell(col++).setCellValue(getStringValue(license.get("licenseType")));
                dataRow.createCell(col++).setCellValue(getStringValue(license.get("expirationDate")));
            } else {
                col += 4;
            }
        }

        // DEA/CDS
        Map<String, Object> cds = (Map<String, Object>) profileData.getOrDefault("cdsLicenses", new HashMap<>());
        dataRow.createCell(col++).setCellValue(getStringValue(cds.get("deaNumber")));
        dataRow.createCell(col++).setCellValue(getStringValue(cds.get("deaIssueDate")));
        dataRow.createCell(col++).setCellValue(getStringValue(cds.get("deaExpirationDate")));
        dataRow.createCell(col++).setCellValue(getStringValue(cds.get("cdsNumber")));
        dataRow.createCell(col++).setCellValue(getStringValue(cds.get("cdsState")));
        dataRow.createCell(col++).setCellValue(getStringValue(cds.get("cdsIssueDate")));
        dataRow.createCell(col++).setCellValue(getStringValue(cds.get("cdsExpirationDate")));

        // Board Certifications (up to 2)
        List<Map<String, Object>> certifications = (List<Map<String, Object>>) profileData.getOrDefault("boardCertifications", new ArrayList<>());
        for (int i = 0; i < 2; i++) {
            if (i < certifications.size()) {
                Map<String, Object> cert = certifications.get(i);
                dataRow.createCell(col++).setCellValue(getStringValue(cert.get("specialty")));
                dataRow.createCell(col++).setCellValue(getStringValue(cert.get("expirationDate")));
            } else {
                col += 2;
            }
        }

        // Education
        Map<String, Object> education = (Map<String, Object>) profileData.getOrDefault("education", new HashMap<>());
        dataRow.createCell(col++).setCellValue(getStringValue(education.get("schoolName")));
        dataRow.createCell(col++).setCellValue(getStringValue(education.get("graduationDate")));
        dataRow.createCell(col++).setCellValue(getStringValue(education.get("residencyFacility")));
        dataRow.createCell(col++).setCellValue(getStringValue(education.get("residencySpecialty")));
        dataRow.createCell(col++).setCellValue(getStringValue(education.get("fellowshipFacility")));
        dataRow.createCell(col++).setCellValue(getStringValue(education.get("fellowshipSpecialty")));

        // Malpractice
        Map<String, Object> malpractice = (Map<String, Object>) profileData.getOrDefault("malpractice", new HashMap<>());
        dataRow.createCell(col++).setCellValue(getStringValue(malpractice.get("carrierName")));
        dataRow.createCell(col++).setCellValue(getStringValue(malpractice.get("policyNumber")));
        dataRow.createCell(col++).setCellValue(getStringValue(malpractice.get("effectiveDate")));
        dataRow.createCell(col++).setCellValue(getStringValue(malpractice.get("expirationDate")));

        // Medicare/Medicaid/CAQH
        dataRow.createCell(col++).setCellValue(getStringValue(personalInfo.get("medicareNumber")));
        dataRow.createCell(col++).setCellValue(getStringValue(personalInfo.get("medicaidId")));
        dataRow.createCell(col++).setCellValue(getStringValue(personalInfo.get("caqhId")));

        // Practice Locations (first one)
        List<Map<String, Object>> locations = (List<Map<String, Object>>) profileData.getOrDefault("practiceLocations", new ArrayList<>());
        if (!locations.isEmpty()) {
            Map<String, Object> loc = locations.get(0);
            dataRow.createCell(col++).setCellValue(getStringValue(loc.get("practiceName")));
            dataRow.createCell(col++).setCellValue(getStringValue(loc.get("addressLine1")));
            dataRow.createCell(col++).setCellValue(getStringValue(loc.get("phone")));
            dataRow.createCell(col++).setCellValue(getStringValue(loc.get("acceptingPatients")));
        } else {
            col += 4;
        }

        // Work History (up to 2)
        List<Map<String, Object>> workHistory = (List<Map<String, Object>>) profileData.getOrDefault("workHistory", new ArrayList<>());
        for (int i = 0; i < 2; i++) {
            if (i < workHistory.size()) {
                Map<String, Object> work = workHistory.get(i);
                dataRow.createCell(col++).setCellValue(getStringValue(work.get("facilityName")));
                dataRow.createCell(col++).setCellValue(getStringValue(work.get("position")));
                dataRow.createCell(col++).setCellValue(getStringValue(work.get("startDate")));
            } else {
                col += 3;
            }
        }

        // Hospital Privileges (first one)
        List<Map<String, Object>> privileges = (List<Map<String, Object>>) profileData.getOrDefault("hospitalPrivileges", new ArrayList<>());
        if (!privileges.isEmpty()) {
            Map<String, Object> priv = privileges.get(0);
            dataRow.createCell(col++).setCellValue(getStringValue(priv.get("hospitalName")));
            dataRow.createCell(col++).setCellValue(getStringValue(priv.get("privilegeType")));
            dataRow.createCell(col++).setCellValue(getStringValue(priv.get("startDate")));
        } else {
            col += 3;
        }

        // Payer IDs (first one)
        List<Map<String, Object>> payerIds = (List<Map<String, Object>>) profileData.getOrDefault("payerIds", new ArrayList<>());
        if (!payerIds.isEmpty()) {
            Map<String, Object> payer = payerIds.get(0);
            dataRow.createCell(col++).setCellValue(getStringValue(payer.get("state")));
            dataRow.createCell(col++).setCellValue(getStringValue(payer.get("medicarePtan")));
            dataRow.createCell(col++).setCellValue(getStringValue(payer.get("medicaidId")));
        } else {
            col += 3;
        }
    }

    private String getStringValue(Object value) {
        if (value == null) {
            return "";
        }
        return value.toString();
    }

    private Long getLongValue(Object value) {
        if (value == null) {
            return 0L;
        }
        if (value instanceof Long) {
            return (Long) value;
        }
        try {
            return Long.parseLong(value.toString());
        } catch (NumberFormatException e) {
            return 0L;
        }
    }
    // Helper method to copy sheets
    private void copySheet(org.apache.poi.ss.usermodel.Sheet sourceSheet, org.apache.poi.ss.usermodel.Sheet destSheet) {
        int rowCount = sourceSheet.getLastRowNum();

        // Copy column widths
        if (sourceSheet.getRow(0) != null) {
            for (int i = 0; i < sourceSheet.getRow(0).getLastCellNum(); i++) {
                destSheet.setColumnWidth(i, sourceSheet.getColumnWidth(i));
            }
        }

        // Copy rows
        for (int i = 0; i <= rowCount; i++) {
            org.apache.poi.ss.usermodel.Row sourceRow = sourceSheet.getRow(i);
            if (sourceRow != null) {
                org.apache.poi.ss.usermodel.Row destRow = destSheet.createRow(i);
                copyRow(sourceRow, destRow);
            }
        }
    }

    private void copyRow(org.apache.poi.ss.usermodel.Row sourceRow, org.apache.poi.ss.usermodel.Row destRow) {
        int cellCount = sourceRow.getLastCellNum();
        for (int i = 0; i < cellCount; i++) {
            org.apache.poi.ss.usermodel.Cell sourceCell = sourceRow.getCell(i);
            if (sourceCell != null) {
                org.apache.poi.ss.usermodel.Cell destCell = destRow.createCell(i);
                switch (sourceCell.getCellType()) {
                    case STRING:
                        destCell.setCellValue(sourceCell.getStringCellValue());
                        break;
                    case NUMERIC:
                        destCell.setCellValue(sourceCell.getNumericCellValue());
                        break;
                    case BOOLEAN:
                        destCell.setCellValue(sourceCell.getBooleanCellValue());
                        break;
                    case FORMULA:
                        destCell.setCellFormula(sourceCell.getCellFormula());
                        break;
                    default:
                        destCell.setCellValue("");
                }

                // Copy style
                org.apache.poi.ss.usermodel.CellStyle newStyle = destRow.getSheet().getWorkbook().createCellStyle();
                newStyle.cloneStyleFrom(sourceCell.getCellStyle());
                destCell.setCellStyle(newStyle);
            }
        }
    }
}