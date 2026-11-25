package com.example.provider_license_tracker.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "provider")
public class Provider {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String licenseNumber;
    private LocalDate licenseExpiry;
    private String email;
    private String phoneNumber;
    private String specialty;

    // Plain foreign keys
    private Long appUserId;
    private Long groupId;

    @ManyToOne
    @JoinColumn(name = "assigned_team_member_id")
    private AppUser assignedTeamMember;

    // New profile fields
    private String npiNumber;
    private LocalDate dateOfBirth;
    private String ssn;
    private String gender;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String zipCode;
    private String primaryLanguage;
    private String otherLanguages;

    private String medicaidId;
    private String medicareNumber;
    private String caqhId;
    private String deaNumber;
    private String medicalSchool;
    private Boolean noHospitalPrivileges = false;
    private String noHospitalPrivilegesReason;

    public String getMedicaidId() {
        return medicaidId;
    }

    public void setMedicaidId(String medicaidId) {
        this.medicaidId = medicaidId;
    }

    public String getMedicareNumber() {
        return medicareNumber;
    }

    public void setMedicareNumber(String medicareNumber) {
        this.medicareNumber = medicareNumber;
    }

    public String getCaqhId() {
        return caqhId;
    }

    public void setCaqhId(String caqhId) {
        this.caqhId = caqhId;
    }

    public String getDeaNumber() {
        return deaNumber;
    }

    public void setDeaNumber(String deaNumber) {
        this.deaNumber = deaNumber;
    }

    public String getMedicalSchool() {
        return medicalSchool;
    }

    public void setMedicalSchool(String medicalSchool) {
        this.medicalSchool = medicalSchool;
    }

    public String getResidencyProgram() {
        return residencyProgram;
    }

    public void setResidencyProgram(String residencyProgram) {
        this.residencyProgram = residencyProgram;
    }

    public String getBoardCertification() {
        return boardCertification;
    }

    public void setBoardCertification(String boardCertification) {
        this.boardCertification = boardCertification;
    }

    public String getMalpracticeCarrier() {
        return malpracticeCarrier;
    }

    public void setMalpracticeCarrier(String malpracticeCarrier) {
        this.malpracticeCarrier = malpracticeCarrier;
    }

    public String getMalpracticePolicyNumber() {
        return malpracticePolicyNumber;
    }

    public void setMalpracticePolicyNumber(String malpracticePolicyNumber) {
        this.malpracticePolicyNumber = malpracticePolicyNumber;
    }

    public Boolean getNoHospitalPrivileges() { return noHospitalPrivileges; }
    public void setNoHospitalPrivileges(Boolean noHospitalPrivileges) { this.noHospitalPrivileges = noHospitalPrivileges; }

    public String getNoHospitalPrivilegesReason() { return noHospitalPrivilegesReason; }
    public void setNoHospitalPrivilegesReason(String noHospitalPrivilegesReason) { this.noHospitalPrivilegesReason = noHospitalPrivilegesReason; }

    public LocalDate getMalpracticeExpiryDate() {
        return malpracticeExpiryDate;
    }

    public void setMalpracticeExpiryDate(LocalDate malpracticeExpiryDate) {
        this.malpracticeExpiryDate = malpracticeExpiryDate;
    }

    private String residencyProgram;
    private String boardCertification;
    private String malpracticeCarrier;
    private String malpracticePolicyNumber;
    private LocalDate malpracticeExpiryDate;

    private Integer profileCompleted;
    private LocalDateTime submittedAt;
    private String signature;

    // Profile status tracking
    @Column(name = "profile_completion")
    private Integer profileCompletion = 0;
    private String profileStatus = "NOT_STARTED"; // NOT    _STARTED, IN_PROGRESS, SUBMITTED, UNDER_REVIEW, CHANGES_REQUESTED, APPROVED, CREDENTIALED
    private LocalDateTime profileSubmittedAt;
    private LocalDateTime profileApprovedAt;
    private LocalDateTime profileAttestedAt;
    private String attestationSignature;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getLicenseNumber() { return licenseNumber; }
    public void setLicenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; }

    public LocalDate getLicenseExpiry() { return licenseExpiry; }
    public void setLicenseExpiry(LocalDate licenseExpiry) { this.licenseExpiry = licenseExpiry; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getSpecialty() { return specialty; }
    public void setSpecialty(String specialty) { this.specialty = specialty; }

    public Long getAppUserId() { return appUserId; }
    public void setAppUserId(Long appUserId) { this.appUserId = appUserId; }

    public Long getGroupId() { return groupId; }
    public void setGroupId(Long groupId) { this.groupId = groupId; }

    public AppUser getAssignedTeamMember() { return assignedTeamMember; }
    public void setAssignedTeamMember(AppUser assignedTeamMember) { this.assignedTeamMember = assignedTeamMember; }
    public Long getAssignedTeamMemberId() {
        return assignedTeamMember != null ? assignedTeamMember.getId() : null;
    }

    public String getNpiNumber() { return npiNumber; }
    public void setNpiNumber(String npiNumber) { this.npiNumber = npiNumber; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getSsn() { return ssn; }
    public void setSsn(String ssn) { this.ssn = ssn; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getAddressLine1() { return addressLine1; }
    public void setAddressLine1(String addressLine1) { this.addressLine1 = addressLine1; }

    public String getAddressLine2() { return addressLine2; }
    public void setAddressLine2(String addressLine2) { this.addressLine2 = addressLine2; }

    public Integer getProfileCompleted() {
        return profileCompleted;
    }

    public void setProfileCompleted(Integer profileCompleted) {
        this.profileCompleted = profileCompleted;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public String getSignature() {
        return signature;
    }

    public void setSignature(String signature) {
        this.signature = signature;
    }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getZipCode() { return zipCode; }
    public void setZipCode(String zipCode) { this.zipCode = zipCode; }

    public String getPrimaryLanguage() { return primaryLanguage; }
    public void setPrimaryLanguage(String primaryLanguage) { this.primaryLanguage = primaryLanguage; }

    public String getOtherLanguages() { return otherLanguages; }
    public void setOtherLanguages(String otherLanguages) { this.otherLanguages = otherLanguages; }

    public Integer getProfileCompletion() { return profileCompletion; }
    public void setProfileCompletion(Integer profileCompletion) { this.profileCompletion = profileCompletion; }

    public String getProfileStatus() { return profileStatus; }
    public void setProfileStatus(String profileStatus) { this.profileStatus = profileStatus; }

    public LocalDateTime getProfileSubmittedAt() { return profileSubmittedAt; }
    public void setProfileSubmittedAt(LocalDateTime profileSubmittedAt) { this.profileSubmittedAt = profileSubmittedAt; }

    public LocalDateTime getProfileApprovedAt() { return profileApprovedAt; }
    public void setProfileApprovedAt(LocalDateTime profileApprovedAt) { this.profileApprovedAt = profileApprovedAt; }

    public LocalDateTime getProfileAttestedAt() { return profileAttestedAt; }
    public void setProfileAttestedAt(LocalDateTime profileAttestedAt) { this.profileAttestedAt = profileAttestedAt; }

    public String getAttestationSignature() { return attestationSignature; }
    public void setAttestationSignature(String attestationSignature) { this.attestationSignature = attestationSignature; }
}