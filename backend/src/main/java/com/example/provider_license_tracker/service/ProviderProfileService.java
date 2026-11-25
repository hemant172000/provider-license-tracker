package com.example.provider_license_tracker.service;

import com.example.provider_license_tracker.model.*;
import com.example.provider_license_tracker.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class ProviderProfileService {

    private final ProviderRepository providerRepository;
    private final ProviderLicenseRepository licenseRepository;
    private final ProviderBoardCertificationRepository boardCertificationRepository;
    private final ProviderEducationRepository educationRepository;
    private final ProviderPracticeLocationRepository practiceLocationRepository;
    private final ProviderWorkHistoryRepository workHistoryRepository;
    private final ProviderMalpracticeRepository malpracticeRepository;
    private final ProviderPayerIdRepository payerIdRepository;
    private final ProviderHospitalPrivilegeRepository hospitalPrivilegeRepository;

    private final ProviderCdsLicenseRepository cdsLicenseRepository;
    private final ProviderCaqhInfoRepository caqhInfoRepository;
    private final ProviderFileRepository providerFileRepository;
    private final ProviderAffiliateArrangementRepository affiliateArrangementRepository;

    public ProviderProfileService(
            ProviderRepository providerRepository,
            ProviderLicenseRepository licenseRepository,
            ProviderBoardCertificationRepository boardCertificationRepository,
            ProviderEducationRepository educationRepository,
            ProviderPracticeLocationRepository practiceLocationRepository,
            ProviderWorkHistoryRepository workHistoryRepository,
            ProviderMalpracticeRepository malpracticeRepository,
            ProviderPayerIdRepository payerIdRepository,
            ProviderHospitalPrivilegeRepository hospitalPrivilegeRepository,

            ProviderCdsLicenseRepository cdsLicenseRepository,
            ProviderCaqhInfoRepository caqhInfoRepository,
            ProviderFileRepository providerFileRepository,
            ProviderAffiliateArrangementRepository affiliateArrangementRepository) {
        this.providerRepository = providerRepository;
        this.licenseRepository = licenseRepository;
        this.boardCertificationRepository = boardCertificationRepository;
        this.educationRepository = educationRepository;
        this.practiceLocationRepository = practiceLocationRepository;
        this.workHistoryRepository = workHistoryRepository;
        this.malpracticeRepository = malpracticeRepository;
        this.payerIdRepository = payerIdRepository;
        this.hospitalPrivilegeRepository = hospitalPrivilegeRepository;

        this.cdsLicenseRepository = cdsLicenseRepository;
        this.caqhInfoRepository = caqhInfoRepository;
        this.providerFileRepository = providerFileRepository;
        this.affiliateArrangementRepository = affiliateArrangementRepository;
    }

    // ==================== COMPLETION CALCULATION ====================

    public int recalculateCompletion(Long providerId) {
        Provider provider = providerRepository.findById(providerId).orElse(null);
        if (provider == null) return 0;

        final int TOTAL_SECTIONS = 10;
        int completedSections = 0;

        boolean personalInfoComplete = provider.getNpiNumber() != null && !provider.getNpiNumber().isEmpty() &&
                provider.getDateOfBirth() != null;
        if (personalInfoComplete) completedSections++;

        if (!licenseRepository.findByProviderId(providerId).isEmpty()) completedSections++;
        if (!cdsLicenseRepository.findByProviderId(providerId).isEmpty()) completedSections++;
        if (!boardCertificationRepository.findByProviderId(providerId).isEmpty()) completedSections++;

        boolean educationComplete = (provider.getMedicalSchool() != null && !provider.getMedicalSchool().isEmpty()) ||
                !educationRepository.findByProviderId(providerId).isEmpty();
        if (educationComplete) completedSections++;

        if (!practiceLocationRepository.findByProviderId(providerId).isEmpty()) completedSections++;
        if (!workHistoryRepository.findByProviderId(providerId).isEmpty()) completedSections++;

        boolean malpracticeComplete = (provider.getMalpracticeCarrier() != null && !provider.getMalpracticeCarrier().isEmpty()) ||
                !malpracticeRepository.findByProviderId(providerId).isEmpty();
        if (malpracticeComplete) completedSections++;

        if (!payerIdRepository.findByProviderId(providerId).isEmpty()) completedSections++;
        if (!hospitalPrivilegeRepository.findByProviderId(providerId).isEmpty()) completedSections++;


        int percentage = (completedSections * 100) / TOTAL_SECTIONS;
        provider.setProfileCompletion(percentage);
        providerRepository.save(provider);
        return percentage;
    }

    // ==================== PERSONAL INFO ====================

    public Map<String, Object> getPersonalInfo(Long providerId) {
        Optional<Provider> provider = providerRepository.findById(providerId);
        if (provider.isEmpty()) return new HashMap<>();

        Provider p = provider.get();
        Map<String, Object> personalInfo = new HashMap<>();
        personalInfo.put("fullName", p.getName());
        personalInfo.put("npiNumber", p.getNpiNumber());
        personalInfo.put("dateOfBirth", p.getDateOfBirth());
        personalInfo.put("ssn", p.getSsn());
        personalInfo.put("gender", p.getGender());
        personalInfo.put("addressLine1", p.getAddressLine1());
        personalInfo.put("addressLine2", p.getAddressLine2());
        personalInfo.put("city", p.getCity());
        personalInfo.put("state", p.getState());
        personalInfo.put("zipCode", p.getZipCode());
        personalInfo.put("phone", p.getPhoneNumber());
        personalInfo.put("email", p.getEmail());
        return personalInfo;
    }

    public Provider savePersonalInfo(Long providerId, Map<String, Object> personalInfo) {
        Provider provider = providerRepository.findById(providerId).orElseThrow();

        if (personalInfo.containsKey("npiNumber")) provider.setNpiNumber((String) personalInfo.get("npiNumber"));
        if (personalInfo.containsKey("dateOfBirth") && personalInfo.get("dateOfBirth") != null) {
            provider.setDateOfBirth(LocalDate.parse((String) personalInfo.get("dateOfBirth")));
        }
        if (personalInfo.containsKey("ssn")) provider.setSsn((String) personalInfo.get("ssn"));
        if (personalInfo.containsKey("gender")) provider.setGender((String) personalInfo.get("gender"));
        if (personalInfo.containsKey("addressLine1")) provider.setAddressLine1((String) personalInfo.get("addressLine1"));
        if (personalInfo.containsKey("addressLine2")) provider.setAddressLine2((String) personalInfo.get("addressLine2"));
        if (personalInfo.containsKey("city")) provider.setCity((String) personalInfo.get("city"));
        if (personalInfo.containsKey("state")) provider.setState((String) personalInfo.get("state"));
        if (personalInfo.containsKey("zipCode")) provider.setZipCode((String) personalInfo.get("zipCode"));
        if (personalInfo.containsKey("phone")) provider.setPhoneNumber((String) personalInfo.get("phone"));
        if (personalInfo.containsKey("email")) provider.setEmail((String) personalInfo.get("email"));
        if (personalInfo.containsKey("primaryLanguage")) provider.setPrimaryLanguage((String) personalInfo.get("primaryLanguage"));
        if (personalInfo.containsKey("otherLanguages")) provider.setOtherLanguages((String) personalInfo.get("otherLanguages"));
        if (personalInfo.containsKey("medicalSchool")) provider.setMedicalSchool((String) personalInfo.get("medicalSchool"));
        if (personalInfo.containsKey("residencyProgram")) provider.setResidencyProgram((String) personalInfo.get("residencyProgram"));
        if (personalInfo.containsKey("boardCertification")) provider.setBoardCertification((String) personalInfo.get("boardCertification"));
        if (personalInfo.containsKey("malpracticeCarrier")) provider.setMalpracticeCarrier((String) personalInfo.get("malpracticeCarrier"));
        if (personalInfo.containsKey("malpracticePolicyNumber")) provider.setMalpracticePolicyNumber((String) personalInfo.get("malpracticePolicyNumber"));
        if (personalInfo.containsKey("malpracticeExpiryDate") && personalInfo.get("malpracticeExpiryDate") != null) {
            provider.setMalpracticeExpiryDate(LocalDate.parse((String) personalInfo.get("malpracticeExpiryDate")));
        }

        provider.setProfileStatus("IN_PROGRESS");
        Provider saved = providerRepository.save(provider);
        recalculateCompletion(providerId);
        return saved;
    }

    // ==================== LICENSES ====================

    public List<Map<String, Object>> getLicenses(Long providerId) {
        List<ProviderLicense> licenses = licenseRepository.findByProviderId(providerId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (ProviderLicense license : licenses) {
            Map<String, Object> licenseMap = new HashMap<>();
            licenseMap.put("id", license.getId());
            licenseMap.put("state", license.getState());
            licenseMap.put("licenseNumber", license.getLicenseNumber());
            licenseMap.put("licenseType", license.getLicenseType());
            licenseMap.put("issueDate", license.getIssueDate());
            licenseMap.put("expirationDate", license.getExpirationDate());
            licenseMap.put("status", license.getStatus());
            licenseMap.put("notes", license.getNotes());
            result.add(licenseMap);
        }
        return result;
    }

    public ProviderLicense addLicense(Long providerId, Map<String, Object> licenseData, MultipartFile file, Long uploadedByUserId) {
        ProviderLicense license = new ProviderLicense();
        license.setProviderId(providerId);
        license.setState((String) licenseData.get("state"));
        license.setLicenseNumber((String) licenseData.get("licenseNumber"));
        license.setLicenseType((String) licenseData.get("licenseType"));
        if (licenseData.get("issueDate") != null && !licenseData.get("issueDate").toString().isEmpty()) {
            license.setIssueDate(LocalDate.parse((String) licenseData.get("issueDate")));
        }
        if (licenseData.get("expirationDate") != null && !licenseData.get("expirationDate").toString().isEmpty()) {
            license.setExpirationDate(LocalDate.parse((String) licenseData.get("expirationDate")));
        }
        license.setStatus((String) licenseData.get("status"));
        license.setNotes((String) licenseData.get("notes"));

        if (file != null && !file.isEmpty()) {
            String filePath = saveLicenseFile(file, providerId);
            license.setFilePath(filePath);

            ProviderFile providerFile = new ProviderFile();
            providerFile.setProviderId(providerId);
            providerFile.setUploadedByUserId(uploadedByUserId);
            providerFile.setFileName(file.getOriginalFilename());
            providerFile.setFileType("LICENSE_" + licenseData.get("state"));
            providerFile.setFilePath(filePath);
            providerFile.setUploadedAt(LocalDateTime.now());
            providerFile.setCurrent(true);
            providerFile.setVersion(1);
            providerFileRepository.save(providerFile);
        }

        ProviderLicense saved = licenseRepository.save(license);

        // UPDATE THE PROVIDER'S LICENSE EXPIRY FIELD
        updateProviderLicenseExpiry(providerId);

        recalculateCompletion(providerId);
        return saved;
    }

    private void updateProviderLicenseExpiry(Long providerId) {
        Provider provider = providerRepository.findById(providerId).orElse(null);
        if (provider == null) return;

        // Get all licenses for this provider
        List<ProviderLicense> licenses = licenseRepository.findByProviderId(providerId);

        // Find the latest expiry date (non-null)
        LocalDate latestExpiry = licenses.stream()
                .map(ProviderLicense::getExpirationDate)
                .filter(Objects::nonNull)
                .max(LocalDate::compareTo)
                .orElse(null);

        // Update the provider's licenseExpiry field
        provider.setLicenseExpiry(latestExpiry);
        providerRepository.save(provider);

        System.out.println("Updated provider " + providerId + " licenseExpiry to: " + latestExpiry);
    }

    public void deleteLicense(Long licenseId) {
        ProviderLicense license = licenseRepository.findById(licenseId).orElse(null);
        if (license != null) {
            Long providerId = license.getProviderId();
            licenseRepository.deleteById(licenseId);
            updateProviderLicenseExpiry(providerId);
            recalculateCompletion(providerId);
        }
    }

    // ==================== CDS LICENSES ====================

    public Map<String, Object> getCdsLicenses(Long providerId) {
        List<ProviderCdsLicense> cdsList = cdsLicenseRepository.findByProviderId(providerId);
        if (cdsList.isEmpty()) return new HashMap<>();

        ProviderCdsLicense license = cdsList.get(0);
        Map<String, Object> cdsData = new HashMap<>();
        cdsData.put("deaNumber", license.getDeaNumber());
        cdsData.put("deaIssueDate", license.getDeaIssueDate());
        cdsData.put("deaExpirationDate", license.getDeaExpirationDate());
        cdsData.put("cdsNumber", license.getCdsNumber());
        cdsData.put("cdsState", license.getCdsState());
        cdsData.put("cdsIssueDate", license.getCdsIssueDate());
        cdsData.put("cdsExpirationDate", license.getCdsExpirationDate());
        cdsData.put("doNotPrescribe", license.getDoNotPrescribe());
        return cdsData;
    }

    public ProviderCdsLicense saveCdsLicenses(Long providerId, Map<String, String> cdsData) {
        List<ProviderCdsLicense> existing = cdsLicenseRepository.findByProviderId(providerId);
        ProviderCdsLicense cdsLicense;
        if (existing.isEmpty()) {
            cdsLicense = new ProviderCdsLicense();
            cdsLicense.setProviderId(providerId);
        } else {
            cdsLicense = existing.get(0);
        }

        if (cdsData.containsKey("deaNumber")) cdsLicense.setDeaNumber(cdsData.get("deaNumber"));
        if (cdsData.containsKey("deaIssueDate") && cdsData.get("deaIssueDate") != null && !cdsData.get("deaIssueDate").isEmpty()) {
            cdsLicense.setDeaIssueDate(LocalDate.parse(cdsData.get("deaIssueDate")));
        }
        if (cdsData.containsKey("deaExpirationDate") && cdsData.get("deaExpirationDate") != null && !cdsData.get("deaExpirationDate").isEmpty()) {
            cdsLicense.setDeaExpirationDate(LocalDate.parse(cdsData.get("deaExpirationDate")));
        }
        if (cdsData.containsKey("cdsNumber")) cdsLicense.setCdsNumber(cdsData.get("cdsNumber"));
        if (cdsData.containsKey("cdsState")) cdsLicense.setCdsState(cdsData.get("cdsState"));
        if (cdsData.containsKey("cdsIssueDate") && cdsData.get("cdsIssueDate") != null && !cdsData.get("cdsIssueDate").isEmpty()) {
            cdsLicense.setCdsIssueDate(LocalDate.parse(cdsData.get("cdsIssueDate")));
        }
        if (cdsData.containsKey("cdsExpirationDate") && cdsData.get("cdsExpirationDate") != null && !cdsData.get("cdsExpirationDate").isEmpty()) {
            cdsLicense.setCdsExpirationDate(LocalDate.parse(cdsData.get("cdsExpirationDate")));
        }
        if (cdsData.containsKey("doNotPrescribe")) {
            cdsLicense.setDoNotPrescribe(Boolean.parseBoolean(cdsData.get("doNotPrescribe")));
        }
        ProviderCdsLicense saved = cdsLicenseRepository.save(cdsLicense);
        recalculateCompletion(providerId);
        return saved;
    }

    // ==================== BOARD CERTIFICATIONS ====================

    public List<Map<String, Object>> getBoardCertifications(Long providerId) {
        List<ProviderBoardCertification> certifications = boardCertificationRepository.findByProviderId(providerId);
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
        return result;
    }

    public ProviderBoardCertification addBoardCertification(Long providerId, Map<String, Object> certData, MultipartFile file) {
        ProviderBoardCertification certification = new ProviderBoardCertification();
        certification.setProviderId(providerId);
        certification.setSpecialty((String) certData.get("specialty"));
        certification.setCertifyingBoard((String) certData.get("certifyingBoard"));
        certification.setCertificationNumber((String) certData.get("certificationNumber"));

        if (certData.get("issueDate") != null && !certData.get("issueDate").toString().isEmpty()) {
            certification.setIssueDate(LocalDate.parse((String) certData.get("issueDate")));
        }
        if (certData.get("expirationDate") != null && !certData.get("expirationDate").toString().isEmpty()) {
            certification.setExpirationDate(LocalDate.parse((String) certData.get("expirationDate")));
        }

        if (file != null && !file.isEmpty()) {
            String filePath = saveCertFile(file, providerId);
            certification.setFilePath(filePath);
        }

        ProviderBoardCertification saved = boardCertificationRepository.save(certification);
        recalculateCompletion(providerId);
        return saved;
    }

    public void deleteBoardCertification(Long certId) {
        ProviderBoardCertification cert = boardCertificationRepository.findById(certId).orElse(null);
        if (cert != null) {
            Long providerId = cert.getProviderId();
            boardCertificationRepository.deleteById(certId);
            recalculateCompletion(providerId);
        }
    }

    // ==================== EDUCATION ====================

    public Map<String, Object> getEducation(Long providerId) {
        List<ProviderEducation> educationList = educationRepository.findByProviderId(providerId);
        if (educationList.isEmpty()) return new HashMap<>();

        ProviderEducation edu = educationList.get(0);
        Map<String, Object> eduData = new HashMap<>();
        eduData.put("schoolName", edu.getSchoolName());
        eduData.put("degree", edu.getDegree());
        eduData.put("graduationDate", edu.getGraduationDate());
        eduData.put("residencyFacility", edu.getResidencyFacility());
        eduData.put("residencySpecialty", edu.getResidencySpecialty());
        eduData.put("residencyStartDate", edu.getResidencyStartDate());
        eduData.put("residencyEndDate", edu.getResidencyEndDate());
        eduData.put("fellowshipFacility", edu.getFellowshipFacility());
        eduData.put("fellowshipSpecialty", edu.getFellowshipSpecialty());
        eduData.put("fellowshipStartDate", edu.getFellowshipStartDate());
        eduData.put("fellowshipEndDate", edu.getFellowshipEndDate());
        eduData.put("internshipFacility", edu.getInternshipFacility());
        eduData.put("internshipSpecialty", edu.getInternshipSpecialty());
        eduData.put("internshipStartDate", edu.getInternshipStartDate());
        eduData.put("internshipEndDate", edu.getInternshipEndDate());
        eduData.put("attendingFacility", edu.getAttendingFacility());
        eduData.put("attendingSpecialty", edu.getAttendingSpecialty());
        eduData.put("attendingStartDate", edu.getAttendingStartDate());
        eduData.put("attendingEndDate", edu.getAttendingEndDate());
        eduData.put("isCurrentAttending", edu.getIsCurrentAttending());
        // Undergraduate
        eduData.put("undergradSchoolName", edu.getUndergradSchoolName());
        eduData.put("undergradDegree", edu.getUndergradDegree());
        eduData.put("undergradGraduationDate", edu.getUndergradGraduationDate());
        eduData.put("undergradAddress", edu.getUndergradAddress());

        eduData.put("hasEcfmg", edu.getHasEcfmg());
        eduData.put("ecfmgNumber", edu.getEcfmgNumber());
        eduData.put("ecfmgCertificationDate", edu.getEcfmgCertificationDate());
        eduData.put("ecfmgExpirationDate", edu.getEcfmgExpirationDate());

        eduData.put("medicalSchoolAddress", edu.getMedicalSchoolAddress());
        return eduData;
    }

    public ProviderEducation saveEducation(Long providerId, Map<String, String> eduData, MultipartFile[] files, Long uploadedByUserId) {
        List<ProviderEducation> existingList = educationRepository.findByProviderId(providerId);
        ProviderEducation education;

        if (existingList.isEmpty()) {
            education = new ProviderEducation();
            education.setProviderId(providerId);
        } else {
            education = existingList.get(0);
        }

        // Medical School
        if (eduData.containsKey("schoolName")) education.setSchoolName(eduData.get("schoolName"));
        if (eduData.containsKey("degree")) education.setDegree(eduData.get("degree"));
        if (eduData.containsKey("graduationDate") && eduData.get("graduationDate") != null && !eduData.get("graduationDate").isEmpty()) {
            education.setGraduationDate(LocalDate.parse(eduData.get("graduationDate") + "-01"));
        }

        // Residency
        if (eduData.containsKey("residencyFacility")) education.setResidencyFacility(eduData.get("residencyFacility"));
        if (eduData.containsKey("residencySpecialty")) education.setResidencySpecialty(eduData.get("residencySpecialty"));
        if (eduData.containsKey("residencyStartDate") && eduData.get("residencyStartDate") != null && !eduData.get("residencyStartDate").isEmpty()) {
            education.setResidencyStartDate(LocalDate.parse(eduData.get("residencyStartDate") + "-01"));
        }
        if (eduData.containsKey("residencyEndDate") && eduData.get("residencyEndDate") != null && !eduData.get("residencyEndDate").isEmpty()) {
            education.setResidencyEndDate(LocalDate.parse(eduData.get("residencyEndDate") + "-01"));
        }

        // Fellowship
        if (eduData.containsKey("fellowshipFacility")) education.setFellowshipFacility(eduData.get("fellowshipFacility"));
        if (eduData.containsKey("fellowshipSpecialty")) education.setFellowshipSpecialty(eduData.get("fellowshipSpecialty"));
        if (eduData.containsKey("fellowshipStartDate") && eduData.get("fellowshipStartDate") != null && !eduData.get("fellowshipStartDate").isEmpty()) {
            education.setFellowshipStartDate(LocalDate.parse(eduData.get("fellowshipStartDate") + "-01"));
        }
        if (eduData.containsKey("fellowshipEndDate") && eduData.get("fellowshipEndDate") != null && !eduData.get("fellowshipEndDate").isEmpty()) {
            education.setFellowshipEndDate(LocalDate.parse(eduData.get("fellowshipEndDate") + "-01"));
        }

        // Internship
        if (eduData.containsKey("internshipFacility")) education.setInternshipFacility(eduData.get("internshipFacility"));
        if (eduData.containsKey("internshipSpecialty")) education.setInternshipSpecialty(eduData.get("internshipSpecialty"));
        if (eduData.containsKey("internshipStartDate") && eduData.get("internshipStartDate") != null && !eduData.get("internshipStartDate").isEmpty()) {
            education.setInternshipStartDate(LocalDate.parse(eduData.get("internshipStartDate") + "-01"));
        }
        if (eduData.containsKey("internshipEndDate") && eduData.get("internshipEndDate") != null && !eduData.get("internshipEndDate").isEmpty()) {
            education.setInternshipEndDate(LocalDate.parse(eduData.get("internshipEndDate") + "-01"));
        }

        // Undergraduate Education
        if (eduData.containsKey("undergradSchoolName")) {
            education.setUndergradSchoolName(eduData.get("undergradSchoolName"));
        }
        if (eduData.containsKey("undergradDegree")) {
            education.setUndergradDegree(eduData.get("undergradDegree"));
        }
        if (eduData.containsKey("undergradGraduationDate") && eduData.get("undergradGraduationDate") != null && !eduData.get("undergradGraduationDate").isEmpty()) {
            education.setUndergradGraduationDate(LocalDate.parse(eduData.get("undergradGraduationDate") + "-01"));
        }
        if (eduData.containsKey("undergradAddress")) {
            education.setUndergradAddress(eduData.get("undergradAddress"));
        }

        if (eduData.containsKey("medicalSchoolAddress")) {
            education.setMedicalSchoolAddress(eduData.get("medicalSchoolAddress"));
        }

        // Attending
        if (eduData.containsKey("attendingFacility")) education.setAttendingFacility(eduData.get("attendingFacility"));
        if (eduData.containsKey("attendingSpecialty")) education.setAttendingSpecialty(eduData.get("attendingSpecialty"));
        if (eduData.containsKey("attendingStartDate") && eduData.get("attendingStartDate") != null && !eduData.get("attendingStartDate").isEmpty()) {
            education.setAttendingStartDate(LocalDate.parse(eduData.get("attendingStartDate") + "-01"));
        }
        if (eduData.containsKey("attendingEndDate") && eduData.get("attendingEndDate") != null && !eduData.get("attendingEndDate").isEmpty()) {
            education.setAttendingEndDate(LocalDate.parse(eduData.get("attendingEndDate") + "-01"));
        }
        if (eduData.containsKey("isCurrentAttending")) {
            education.setIsCurrentAttending(Boolean.parseBoolean(eduData.get("isCurrentAttending")));
        }

        // ECFMG
        if (eduData.containsKey("hasEcfmg")) {
            education.setHasEcfmg(Boolean.parseBoolean(eduData.get("hasEcfmg")));
        }
        if (eduData.containsKey("ecfmgNumber")) {
            education.setEcfmgNumber(eduData.get("ecfmgNumber"));
        }
        if (eduData.containsKey("ecfmgCertificationDate") && eduData.get("ecfmgCertificationDate") != null && !eduData.get("ecfmgCertificationDate").isEmpty()) {
            education.setEcfmgCertificationDate(LocalDate.parse(eduData.get("ecfmgCertificationDate")));
        }
        if (eduData.containsKey("ecfmgExpirationDate") && eduData.get("ecfmgExpirationDate") != null && !eduData.get("ecfmgExpirationDate").isEmpty()) {
            education.setEcfmgExpirationDate(LocalDate.parse(eduData.get("ecfmgExpirationDate")));
        }

        // Create upload directory
        String uploadDir = System.getProperty("user.dir") + File.separator + "uploads" + File.separator + "education" + File.separator + providerId + File.separator;
        File dir = new File(uploadDir);
        if (!dir.exists()) dir.mkdirs();

        // Helper method to save file and create ProviderFile record
        // Index mapping: 0=diploma, 1=residency, 2=fellowship, 3=internship, 4=attending
        if (files != null && files.length > 0) {
            // Diploma (index 0)
            if (files.length > 5 && files[5] != null && !files[5].isEmpty()) {
                String filePath = saveEducationFile(files[5], uploadDir);
                education.setUndergradDiplomaPath(filePath);

                // Save to provider_file table
                if (uploadedByUserId != null) {
                    saveToProviderFile(providerId, uploadedByUserId, files[5], filePath, "UNDERGRAD_DIPLOMA");
                }
            }

            // Residency Certificate (index 1)
            if (files.length > 1 && files[1] != null && !files[1].isEmpty()) {
                String filePath = saveEducationFile(files[1], uploadDir);
                education.setResidencyCertFilePath(filePath);
                saveToProviderFile(providerId, uploadedByUserId, files[1], filePath, "RESIDENCY_CERT");
            }

            // Fellowship Certificate (index 2)
            if (files.length > 2 && files[2] != null && !files[2].isEmpty()) {
                String filePath = saveEducationFile(files[2], uploadDir);
                education.setFellowshipCertFilePath(filePath);
                saveToProviderFile(providerId, uploadedByUserId, files[2], filePath, "FELLOWSHIP_CERT");
            }

            // Internship Certificate (index 3)
            if (files.length > 3 && files[3] != null && !files[3].isEmpty()) {
                String filePath = saveEducationFile(files[3], uploadDir);
                education.setInternshipFilePath(filePath);
                saveToProviderFile(providerId, uploadedByUserId, files[3], filePath, "INTERNSHIP_CERT");
            }

            // Attending Certificate (index 4)
            if (files.length > 4 && files[4] != null && !files[4].isEmpty()) {
                String filePath = saveEducationFile(files[4], uploadDir);
                education.setAttendingFilePath(filePath);
                saveToProviderFile(providerId, uploadedByUserId, files[4], filePath, "ATTENDING_CERT");
            }

            // ECFMG Certificate (index 6 in files array)
            if (files.length > 6 && files[6] != null && !files[6].isEmpty()) {
                String filePath = saveEducationFile(files[6], uploadDir);
                education.setEcfmgFilePath(filePath);

                if (uploadedByUserId != null) {
                    saveToProviderFile(providerId, uploadedByUserId, files[6], filePath, "ECFMG_CERTIFICATE");
                }
            }
        }

        ProviderEducation saved = educationRepository.save(education);
        recalculateCompletion(providerId);
        return saved;
    }

    // Helper method to save file to provider_file table
    private void saveToProviderFile(Long providerId, Long uploadedByUserId, MultipartFile file, String filePath, String fileType) {
        try {
            ProviderFile providerFile = new ProviderFile();
            providerFile.setProviderId(providerId);
            providerFile.setUploadedByUserId(uploadedByUserId);
            providerFile.setFileName(file.getOriginalFilename());
            providerFile.setFileType(fileType);
            providerFile.setFilePath(filePath);
            providerFile.setUploadedAt(LocalDateTime.now());
            providerFile.setUpdatedAt(LocalDateTime.now());
            providerFile.setCurrent(true);
            providerFile.setVersion(1);
            providerFile.setStatus("CURRENT");
            providerFile.setDocumentId(fileType + "_" + providerId);
            providerFileRepository.save(providerFile);
            System.out.println("Saved to provider_file: " + fileType + " for provider " + providerId);
        } catch (Exception e) {
            System.err.println("Failed to save to provider_file: " + e.getMessage());
        }
    }

    private String saveEducationFile(MultipartFile file, String uploadDir) {
        try {
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            String filePath = uploadDir + fileName;
            Files.write(Paths.get(filePath), file.getBytes());
            return filePath;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    // ==================== AFFILIATE ARRANGEMENTS ====================

    public List<Map<String, Object>> getAffiliateArrangements(Long providerId) {
        List<ProviderAffiliateArrangement> arrangements = affiliateArrangementRepository.findByProviderId(providerId);
        List<Map<String, Object>> result = new ArrayList<>();

        for (ProviderAffiliateArrangement arrangement : arrangements) {
            Map<String, Object> arrMap = new HashMap<>();
            arrMap.put("id", arrangement.getId());
            arrMap.put("arrangementType", arrangement.getArrangementType());

            // Individual Provider fields
            arrMap.put("firstName", arrangement.getFirstName());
            arrMap.put("lastName", arrangement.getLastName());
            arrMap.put("specialty", arrangement.getSpecialty());
            arrMap.put("phone", arrangement.getPhone());
            arrMap.put("email", arrangement.getEmail());
            arrMap.put("npiNumber", arrangement.getNpiNumber());

            // Group fields
            arrMap.put("groupName", arrangement.getGroupName());
            arrMap.put("organizationNpi", arrangement.getOrganizationNpi());
            arrMap.put("groupPhone", arrangement.getGroupPhone());
            arrMap.put("groupEmail", arrangement.getGroupEmail());

            // Common fields
            arrMap.put("arrangementDescription", arrangement.getArrangementDescription());
            arrMap.put("filePath", arrangement.getFilePath());

            result.add(arrMap);
        }
        return result;
    }

    public ProviderAffiliateArrangement saveAffiliateArrangement(Long providerId, Map<String, Object> arrangementData, MultipartFile file, Long uploadedByUserId) {
        ProviderAffiliateArrangement arrangement = new ProviderAffiliateArrangement();
        arrangement.setProviderId(providerId);
        arrangement.setArrangementType((String) arrangementData.get("arrangementType"));

        if ("INDIVIDUAL".equals(arrangementData.get("arrangementType"))) {
            arrangement.setFirstName((String) arrangementData.get("firstName"));
            arrangement.setLastName((String) arrangementData.get("lastName"));
            arrangement.setSpecialty((String) arrangementData.get("specialty"));
            arrangement.setPhone((String) arrangementData.get("phone"));
            arrangement.setEmail((String) arrangementData.get("email"));
            arrangement.setNpiNumber((String) arrangementData.get("npiNumber"));
        } else if ("GROUP".equals(arrangementData.get("arrangementType"))) {
            arrangement.setGroupName((String) arrangementData.get("groupName"));
            arrangement.setOrganizationNpi((String) arrangementData.get("organizationNpi"));
            arrangement.setGroupPhone((String) arrangementData.get("groupPhone"));
            arrangement.setGroupEmail((String) arrangementData.get("groupEmail"));
        }

        arrangement.setArrangementDescription((String) arrangementData.get("arrangementDescription"));

        // Handle file upload
        if (file != null && !file.isEmpty()) {
            String filePath = saveAffiliateFile(file, providerId);
            arrangement.setFilePath(filePath);
            saveToProviderFile(providerId, uploadedByUserId, file, filePath, "AFFILIATE_ARRANGEMENT");
        }

        ProviderAffiliateArrangement saved = affiliateArrangementRepository.save(arrangement);
        recalculateCompletion(providerId);
        return saved;
    }

    public void deleteAffiliateArrangement(Long arrangementId) {
        ProviderAffiliateArrangement arrangement = affiliateArrangementRepository.findById(arrangementId)
                .orElseThrow(() -> new RuntimeException("Affiliate arrangement not found"));
        Long providerId = arrangement.getProviderId();
        affiliateArrangementRepository.deleteById(arrangementId);
        recalculateCompletion(providerId);
    }

    private String saveAffiliateFile(MultipartFile file, Long providerId) {
        try {
            String uploadDir = System.getProperty("user.dir") + File.separator + "uploads" + File.separator + "affiliates" + File.separator + providerId + File.separator;
            File dir = new File(uploadDir);
            if (!dir.exists()) dir.mkdirs();

            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            String filePath = uploadDir + fileName;
            Files.write(Paths.get(filePath), file.getBytes());
            return filePath;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    // ==================== PRACTICE LOCATIONS ====================

    public List<Map<String, Object>> getPracticeLocations(Long providerId) {
        List<ProviderPracticeLocation> locations = practiceLocationRepository.findByProviderId(providerId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (ProviderPracticeLocation location : locations) {
            Map<String, Object> locMap = new HashMap<>();
            locMap.put("id", location.getId());
            locMap.put("practiceName", location.getPracticeName());
            locMap.put("addressLine1", location.getAddressLine1());
            locMap.put("addressLine2", location.getAddressLine2());
            locMap.put("city", location.getCity());
            locMap.put("state", location.getState());
            locMap.put("zipCode", location.getZipCode());
            locMap.put("phone", location.getPhone());
            locMap.put("fax", location.getFax());
            locMap.put("isPrimary", location.isPrimary());
            locMap.put("acceptingPatients", location.isAcceptingPatients());
            locMap.put("hospitalAffiliations", location.getHospitalAffiliations());
            locMap.put("isHospitalist", location.getIsHospitalist());
            locMap.put("startDateWithGroup", location.getStartDateWithGroup());

            result.add(locMap);
        }
        return result;
    }

    public ProviderPracticeLocation savePracticeLocation(Long providerId, Map<String, Object> locationData) {
        ProviderPracticeLocation location = new ProviderPracticeLocation();
        location.setProviderId(providerId);
        location.setPracticeName((String) locationData.get("practiceName"));
        location.setAddressLine1((String) locationData.get("addressLine1"));
        location.setAddressLine2((String) locationData.get("addressLine2"));
        location.setCity((String) locationData.get("city"));
        location.setState((String) locationData.get("state"));
        location.setZipCode((String) locationData.get("zipCode"));
        location.setPhone((String) locationData.get("phone"));
        location.setFax((String) locationData.get("fax"));
        location.setPrimary(Boolean.parseBoolean(String.valueOf(locationData.getOrDefault("isPrimary", false))));
        location.setAcceptingPatients(Boolean.parseBoolean(String.valueOf(locationData.getOrDefault("acceptingPatients", true))));
        location.setIsHospitalist(Boolean.parseBoolean(String.valueOf(locationData.getOrDefault("isHospitalist", false))));
        location.setStartDateWithGroup((String) locationData.get("startDateWithGroup"));
        location.setHospitalAffiliations((String) locationData.get("hospitalAffiliations"));

        ProviderPracticeLocation saved = practiceLocationRepository.save(location);
        recalculateCompletion(providerId);
        return saved;
    }

    public ProviderPracticeLocation updatePracticeLocation(Long locationId, Map<String, Object> locationData) {
        ProviderPracticeLocation location = practiceLocationRepository.findById(locationId)
                .orElseThrow(() -> new RuntimeException("Practice location not found"));

        if (locationData.containsKey("practiceName")) location.setPracticeName((String) locationData.get("practiceName"));
        if (locationData.containsKey("addressLine1")) location.setAddressLine1((String) locationData.get("addressLine1"));
        if (locationData.containsKey("addressLine2")) location.setAddressLine2((String) locationData.get("addressLine2"));
        if (locationData.containsKey("city")) location.setCity((String) locationData.get("city"));
        if (locationData.containsKey("state")) location.setState((String) locationData.get("state"));
        if (locationData.containsKey("zipCode")) location.setZipCode((String) locationData.get("zipCode"));
        if (locationData.containsKey("phone")) location.setPhone((String) locationData.get("phone"));
        if (locationData.containsKey("fax")) location.setFax((String) locationData.get("fax"));
        if (locationData.containsKey("isPrimary")) location.setPrimary(Boolean.parseBoolean(String.valueOf(locationData.get("isPrimary"))));
        if (locationData.containsKey("acceptingPatients")) location.setAcceptingPatients(Boolean.parseBoolean(String.valueOf(locationData.get("acceptingPatients"))));
        if (locationData.containsKey("isHospitalist")) location.setIsHospitalist(Boolean.parseBoolean(String.valueOf(locationData.get("isHospitalist"))));
        if (locationData.containsKey("startDateWithGroup")) location.setStartDateWithGroup((String) locationData.get("startDateWithGroup"));
        if (locationData.containsKey("hospitalAffiliations")) location.setHospitalAffiliations((String) locationData.get("hospitalAffiliations"));

        ProviderPracticeLocation saved = practiceLocationRepository.save(location);
        recalculateCompletion(location.getProviderId());
        return saved;
    }

    public void deletePracticeLocation(Long locationId) {
        ProviderPracticeLocation location = practiceLocationRepository.findById(locationId)
                .orElseThrow(() -> new RuntimeException("Practice location not found"));
        Long providerId = location.getProviderId();
        practiceLocationRepository.deleteById(locationId);
        recalculateCompletion(providerId);
    }

    // ==================== WORK HISTORY ====================

    public List<Map<String, Object>> getWorkHistory(Long providerId) {
        List<ProviderWorkHistory> workHistory = workHistoryRepository.findByProviderId(providerId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (ProviderWorkHistory work : workHistory) {
            Map<String, Object> workMap = new HashMap<>();
            workMap.put("id", work.getId());
            workMap.put("facilityName", work.getFacilityName());
            workMap.put("position", work.getPosition());
            workMap.put("startDate", work.getStartDate() != null ? work.getStartDate().toString().substring(0, 7) : null);
            workMap.put("endDate", work.getEndDate() != null ? work.getEndDate().toString().substring(0, 7) : null);
            workMap.put("isCurrent", work.isCurrent());
            workMap.put("address", work.getAddress());
            workMap.put("supervisorName", work.getSupervisorName());
            workMap.put("description", work.getDescription());
            workMap.put("startDateWithGroup", work.getStartDateWithGroup());
            result.add(workMap);
        }
        return result;
    }

    public ProviderWorkHistory saveWorkHistory(Long providerId, Map<String, Object> workData, MultipartFile cvFile, Long uploadedByUserId) {
        ProviderWorkHistory work = new ProviderWorkHistory();
        work.setProviderId(providerId);
        work.setFacilityName((String) workData.get("facilityName"));
        work.setPosition((String) workData.get("position"));

        // Handle start date (supports YYYY-MM or YYYY-MM-DD)
        if (workData.containsKey("startDate") && workData.get("startDate") != null) {
            String dateStr = (String) workData.get("startDate");
            work.setStartDate(parseDate(dateStr));
        }

        // Handle end date
        if (workData.containsKey("endDate") && workData.get("endDate") != null && !((String) workData.get("endDate")).isEmpty()) {
            String dateStr = (String) workData.get("endDate");
            work.setEndDate(parseDate(dateStr));
        }

        work.setCurrent((Boolean) workData.getOrDefault("isCurrent", false));
        work.setAddress((String) workData.get("address"));
        work.setSupervisorName((String) workData.get("supervisorName"));
        work.setDescription((String) workData.get("description"));
        work.setStartDateWithGroup((String) workData.get("startDateWithGroup"));

        // Handle CV file upload - SAVE TO BOTH tables
        if (cvFile != null && !cvFile.isEmpty()) {
            String filePath = saveWorkHistoryFile(cvFile, providerId);
            work.setCvFilePath(filePath);

            // ALSO SAVE TO PROVIDER_FILE TABLE
            saveToProviderFile(providerId, uploadedByUserId, cvFile, filePath, "CURRICULUM_VITAE");
        }

        ProviderWorkHistory saved = workHistoryRepository.save(work);
        recalculateCompletion(providerId);
        return saved;
    }

    // Helper method to parse date (supports YYYY-MM or YYYY-MM-DD)
    private LocalDate parseDate(String dateStr) {
        if (dateStr == null || dateStr.isEmpty()) return null;

        // If format is YYYY-MM (month only), append -01 for first day of month
        if (dateStr.length() == 7 && dateStr.charAt(4) == '-') {
            dateStr = dateStr + "-01";
        }

        return LocalDate.parse(dateStr);
    }

    public void deleteWorkHistory(Long workId) {
        ProviderWorkHistory work = workHistoryRepository.findById(workId)
                .orElseThrow(() -> new RuntimeException("Work history entry not found"));
        Long providerId = work.getProviderId();
        workHistoryRepository.deleteById(workId);
        recalculateCompletion(providerId);
    }

    private String saveWorkHistoryFile(MultipartFile file, Long providerId) {
        try {
            String uploadDir = System.getProperty("user.dir") + File.separator + "uploads" + File.separator + "work" + File.separator + providerId + File.separator;
            File dir = new File(uploadDir);
            if (!dir.exists()) dir.mkdirs();

            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            String filePath = uploadDir + fileName;
            Files.write(Paths.get(filePath), file.getBytes());
            return filePath;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    // ==================== MALPRACTICE ====================

    public Map<String, Object> getMalpractice(Long providerId) {
        List<ProviderMalpractice> malpracticeList = malpracticeRepository.findByProviderId(providerId);
        if (malpracticeList.isEmpty()) return new HashMap<>();

        ProviderMalpractice mal = malpracticeList.get(0);
        Map<String, Object> malData = new HashMap<>();
        malData.put("carrierName", mal.getCarrierName());
        malData.put("policyNumber", mal.getPolicyNumber());
        malData.put("coverageLimit", mal.getCoverageLimit());
        malData.put("effectiveDate", mal.getEffectiveDate());
        malData.put("expirationDate", mal.getExpirationDate());
        malData.put("policyType", mal.getPolicyType());
        malData.put("tailCoverage", mal.isTailCoverage());
        malData.put("perOccurrenceLimit", mal.getPerOccurrenceLimit());
        malData.put("aggregateLimit", mal.getAggregateLimit());
        return malData;
    }

    public ProviderMalpractice saveMalpractice(Long providerId, Map<String, Object> malData, MultipartFile file) {
        List<ProviderMalpractice> existing = malpracticeRepository.findByProviderId(providerId);
        ProviderMalpractice malpractice;

        if (existing.isEmpty()) {
            malpractice = new ProviderMalpractice();
            malpractice.setProviderId(providerId);
        } else {
            malpractice = existing.get(0);
        }

        malpractice.setCarrierName((String) malData.get("carrierName"));
        malpractice.setPolicyNumber((String) malData.get("policyNumber"));
        malpractice.setCoverageLimit((String) malData.get("coverageLimit"));
        malpractice.setPerOccurrenceLimit((String) malData.get("perOccurrenceLimit"));
        malpractice.setAggregateLimit((String) malData.get("aggregateLimit"));

        if (malData.containsKey("effectiveDate") && malData.get("effectiveDate") != null) {
            malpractice.setEffectiveDate(LocalDate.parse((String) malData.get("effectiveDate")));
        }
        if (malData.containsKey("expirationDate") && malData.get("expirationDate") != null) {
            malpractice.setExpirationDate(LocalDate.parse((String) malData.get("expirationDate")));
        }

        malpractice.setPolicyType((String) malData.get("policyType"));
        malpractice.setTailCoverage(Boolean.parseBoolean(String.valueOf(malData.get("tailCoverage"))));

        // Handle file upload - SAVE TO PROVIDER_FILE TABLE
        if (file != null && !file.isEmpty()) {
            String filePath = saveMalpracticeFile(file, providerId);
            malpractice.setFilePath(filePath);

            // Get uploadedByUserId from provider
            Long uploadedByUserId = null;
            Provider provider = providerRepository.findById(providerId).orElse(null);
            if (provider != null && provider.getAppUserId() != null) {
                uploadedByUserId = provider.getAppUserId();
            }

            // Save to provider_file table
            if (uploadedByUserId != null) {
                saveToProviderFile(providerId, uploadedByUserId, file, filePath, "MALPRACTICE_INSURANCE");
            }
        }

        ProviderMalpractice saved = malpracticeRepository.save(malpractice);
        recalculateCompletion(providerId);
        return saved;
    }

    private String saveMalpracticeFile(MultipartFile file, Long providerId) {
        try {
            String uploadDir = System.getProperty("user.dir") + File.separator + "uploads" + File.separator + "malpractice" + File.separator + providerId + File.separator;
            File dir = new File(uploadDir);
            if (!dir.exists()) dir.mkdirs();

            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            String filePath = uploadDir + fileName;
            Files.write(Paths.get(filePath), file.getBytes());
            return filePath;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    // ==================== PAYER IDS ====================

    public List<Map<String, Object>> getPayerIds(Long providerId) {
        List<ProviderPayerId> payerIds = payerIdRepository.findByProviderId(providerId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (ProviderPayerId payer : payerIds) {
            Map<String, Object> payerMap = new HashMap<>();
            payerMap.put("id", payer.getId());
            payerMap.put("state", payer.getState());
            payerMap.put("medicarePtan", payer.getMedicarePtan());
            payerMap.put("medicarePin", payer.getMedicarePin());
            payerMap.put("medicaidId", payer.getMedicaidId());
            payerMap.put("medicaidProviderNumber", payer.getMedicaidProviderNumber());
            payerMap.put("commercialIds", payer.getCommercialIds());
            payerMap.put("status", payer.getStatus());
            payerMap.put("payerType", payer.getPayerType());
            result.add(payerMap);
        }
        return result;
    }

    public ProviderPayerId savePayerId(Long providerId, Map<String, Object> payerData) {
        ProviderPayerId payer = new ProviderPayerId();
        payer.setProviderId(providerId);
        payer.setState((String) payerData.get("state"));
        payer.setMedicarePtan((String) payerData.get("medicarePtan"));
        payer.setMedicarePin((String) payerData.get("medicarePin"));
        payer.setMedicaidId((String) payerData.get("medicaidId"));
        payer.setMedicaidProviderNumber((String) payerData.get("medicaidProviderNumber"));
        payer.setCommercialIds((String) payerData.get("commercialIds"));
        payer.setStatus((String) payerData.get("status"));

        if (payerData.containsKey("payerType")) {
            payer.setPayerType((String) payerData.get("payerType"));
        }

        ProviderPayerId saved = payerIdRepository.save(payer);
        recalculateCompletion(providerId);
        return saved;
    }

    public void deletePayerId(Long payerId) {
        ProviderPayerId payer = payerIdRepository.findById(payerId)
                .orElseThrow(() -> new RuntimeException("Payer ID not found"));
        Long providerId = payer.getProviderId();
        payerIdRepository.deleteById(payerId);
        recalculateCompletion(providerId);
    }

    // ==================== HOSPITAL PRIVILEGES ====================

    public List<Map<String, Object>> getHospitalPrivileges(Long providerId) {
        List<ProviderHospitalPrivilege> privileges = hospitalPrivilegeRepository.findByProviderId(providerId);
        List<Map<String, Object>> result = new ArrayList<>();

        for (ProviderHospitalPrivilege privilege : privileges) {
            Map<String, Object> privMap = new HashMap<>();
            privMap.put("id", privilege.getId());
            privMap.put("hospitalName", privilege.getHospitalName());
            privMap.put("privilegeType", privilege.getPrivilegeType());
            privMap.put("department", privilege.getDepartment());
            privMap.put("startDate", privilege.getStartDate());
            privMap.put("endDate", privilege.getEndDate());
            privMap.put("isCurrent", privilege.isCurrent());
            privMap.put("isPrimaryHospital", privilege.getIsPrimaryHospital());
            privMap.put("privilegeLevel", privilege.getPrivilegeLevel());
            privMap.put("privilegeDescription", privilege.getPrivilegeDescription());
            privMap.put("patientPercentage", privilege.getPatientPercentage());
            privMap.put("noPrivileges", privilege.getNoPrivileges());
            privMap.put("noPrivilegesReason", privilege.getNoPrivilegesReason());
            privMap.put("privilegeStatus", privilege.getPrivilegeStatus());
            privMap.put("hasNonAdmittingAffiliation", privilege.getHasNonAdmittingAffiliation());
            privMap.put("nonAdmittingDescription", privilege.getNonAdmittingDescription());
            result.add(privMap);
        }
        return result;
    }

    public ProviderHospitalPrivilege saveHospitalPrivilege(Long providerId, Map<String, Object> privilegeData, MultipartFile file) {
        ProviderHospitalPrivilege privilege = new ProviderHospitalPrivilege();
        privilege.setProviderId(providerId);
        privilege.setHospitalName((String) privilegeData.get("hospitalName"));
        privilege.setPrivilegeType((String) privilegeData.get("privilegeType"));
        privilege.setDepartment((String) privilegeData.get("department"));

        if (privilegeData.containsKey("startDate") && privilegeData.get("startDate") != null) {
            privilege.setStartDate(LocalDate.parse((String) privilegeData.get("startDate")));
        }
        if (privilegeData.containsKey("endDate") && privilegeData.get("endDate") != null && !((String) privilegeData.get("endDate")).isEmpty()) {
            privilege.setEndDate(LocalDate.parse((String) privilegeData.get("endDate")));
        }

        if (privilegeData.containsKey("isCurrent")) {
            privilege.setCurrent(Boolean.parseBoolean(String.valueOf(privilegeData.get("isCurrent"))));
        }

        if (privilegeData.containsKey("isPrimaryHospital")) {
            privilege.setIsPrimaryHospital(Boolean.parseBoolean(String.valueOf(privilegeData.get("isPrimaryHospital"))));
        }
        if (privilegeData.containsKey("privilegeLevel")) {
            privilege.setPrivilegeLevel((String) privilegeData.get("privilegeLevel"));
        }
        if (privilegeData.containsKey("privilegeDescription")) {
            privilege.setPrivilegeDescription((String) privilegeData.get("privilegeDescription"));
        }
        if (privilegeData.containsKey("patientPercentage")) {
            privilege.setPatientPercentage((String) privilegeData.get("patientPercentage"));
        }
        if (privilegeData.containsKey("noPrivileges")) {
            privilege.setNoPrivileges(Boolean.parseBoolean(String.valueOf(privilegeData.get("noPrivileges"))));
        }
        if (privilegeData.containsKey("noPrivilegesReason")) {
            privilege.setNoPrivilegesReason((String) privilegeData.get("noPrivilegesReason"));
        }
        if (privilegeData.containsKey("privilegeStatus")) {
            privilege.setPrivilegeStatus((String) privilegeData.get("privilegeStatus"));
        }

        if (privilegeData.containsKey("hasNonAdmittingAffiliation")) {
            privilege.setHasNonAdmittingAffiliation(Boolean.parseBoolean(String.valueOf(privilegeData.get("hasNonAdmittingAffiliation"))));
        }
        if (privilegeData.containsKey("nonAdmittingDescription")) {
            privilege.setNonAdmittingDescription((String) privilegeData.get("nonAdmittingDescription"));
        }

        // Handle file upload - SAVE TO PROVIDER_FILE TABLE
        if (file != null && !file.isEmpty()) {
            String filePath = savePrivilegeFile(file, providerId);
            privilege.setFilePath(filePath);

            // Get uploadedByUserId from provider
            Long uploadedByUserId = null;
            Provider provider = providerRepository.findById(providerId).orElse(null);
            if (provider != null && provider.getAppUserId() != null) {
                uploadedByUserId = provider.getAppUserId();
            }

            // Save to provider_file table
            if (uploadedByUserId != null) {
                saveToProviderFile(providerId, uploadedByUserId, file, filePath, "HOSPITAL_PRIVILEGES");
            }
        }

        ProviderHospitalPrivilege saved = hospitalPrivilegeRepository.save(privilege);
        recalculateCompletion(providerId);
        return saved;
    }


    private String savePrivilegeFile(MultipartFile file, Long providerId) {
        try {
            String uploadDir = System.getProperty("user.dir") + File.separator + "uploads" + File.separator + "privileges" + File.separator + providerId + File.separator;
            File dir = new File(uploadDir);
            if (!dir.exists()) dir.mkdirs();

            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            String filePath = uploadDir + fileName;
            Files.write(Paths.get(filePath), file.getBytes());
            return filePath;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public void deleteHospitalPrivilege(Long privilegeId) {
        ProviderHospitalPrivilege privilege = hospitalPrivilegeRepository.findById(privilegeId)
                .orElseThrow(() -> new RuntimeException("Hospital privilege not found"));
        Long providerId = privilege.getProviderId();
        hospitalPrivilegeRepository.deleteById(privilegeId);
        recalculateCompletion(providerId);
    }


    // ==================== CAQH INFO ====================

    public Map<String, Object> getCaqhInfo(Long providerId) {
        Optional<ProviderCaqhInfo> caqhInfo = caqhInfoRepository.findByProviderId(providerId);
        if (caqhInfo.isEmpty()) return new HashMap<>();

        ProviderCaqhInfo caqh = caqhInfo.get();
        Map<String, Object> caqhMap = new HashMap<>();
        caqhMap.put("caqhId", caqh.getCaqhId());
        caqhMap.put("caqhUsername", caqh.getCaqhUsername());
        caqhMap.put("caqhPassword", caqh.getCaqhPassword());
        caqhMap.put("lastAttestationDate", caqh.getLastAttestationDate());
        return caqhMap;
    }

    public ProviderCaqhInfo saveCaqhInfo(Long providerId, Map<String, Object> caqhData) {
        Optional<ProviderCaqhInfo> existing = caqhInfoRepository.findByProviderId(providerId);
        ProviderCaqhInfo caqh;

        if (existing.isEmpty()) {
            caqh = new ProviderCaqhInfo();
            caqh.setProviderId(providerId);
        } else {
            caqh = existing.get();
        }

        caqh.setCaqhId((String) caqhData.get("caqhId"));
        caqh.setCaqhUsername((String) caqhData.get("caqhUsername"));
        caqh.setCaqhPassword((String) caqhData.get("caqhPassword"));

        if (caqhData.containsKey("lastAttestationDate") && caqhData.get("lastAttestationDate") != null) {
            caqh.setLastAttestationDate(LocalDate.parse((String) caqhData.get("lastAttestationDate")));
        }

        ProviderCaqhInfo saved = caqhInfoRepository.save(caqh);
        recalculateCompletion(providerId);
        return saved;
    }

    // ==================== SUBMIT PROFILE ====================

    public Provider submitProfile(Long providerId, String signature) {
        Provider provider = providerRepository.findById(providerId).orElseThrow();
        provider.setProfileStatus("SUBMITTED");
        recalculateCompletion(providerId);
        provider.setProfileCompletion(provider.getProfileCompletion());
        provider.setProfileSubmittedAt(LocalDateTime.now());
        provider.setAttestationSignature(signature);
        provider.setProfileAttestedAt(LocalDateTime.now());
        return providerRepository.save(provider);
    }

    // ==================== HELPER METHODS FOR FILE SAVING ====================

    private String saveLicenseFile(MultipartFile file, Long providerId) {
        try {
            String uploadDir = System.getProperty("user.dir") + File.separator + "uploads" + File.separator + providerId + File.separator;
            File dir = new File(uploadDir);
            if (!dir.exists()) dir.mkdirs();

            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            String filePath = uploadDir + fileName;
            Files.write(Paths.get(filePath), file.getBytes());
            return filePath;
        } catch (Exception e) {
            return null;
        }
    }

    private String saveCertFile(MultipartFile file, Long providerId) {
        try {
            String uploadDir = "uploads/certifications/" + providerId + "/";
            File dir = new File(uploadDir);
            if (!dir.exists()) dir.mkdirs();

            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            String filePath = uploadDir + fileName;
            Files.write(Paths.get(filePath), file.getBytes());
            return filePath;
        } catch (Exception e) {
            return null;
        }
    }
}