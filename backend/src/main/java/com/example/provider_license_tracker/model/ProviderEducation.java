package com.example.provider_license_tracker.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "provider_education")
public class ProviderEducation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long providerId;
    private String schoolName;
    private String degree;
    private LocalDate graduationDate;
    private String diplomaPath;
    private String residencyFacility;
    private String residencySpecialty;
    private LocalDate residencyStartDate;
    private LocalDate residencyEndDate;
    private String residencyCertPath;
    private String fellowshipFacility;
    private String fellowshipSpecialty;
    private LocalDate fellowshipStartDate;
    private LocalDate fellowshipEndDate;
    private String fellowshipCertPath;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String internshipFacility;
    private String internshipSpecialty;
    private LocalDate internshipStartDate;
    private String diplomaFilePath;
    private String attendingFacility;
    private String attendingSpecialty;
    private LocalDate attendingStartDate;

    // Undergraduate Education
    @Column(name = "undergrad_school_name")
    private String undergradSchoolName;

    @Column(name = "undergrad_degree")
    private String undergradDegree;

    @Column(name = "undergrad_graduation_date")
    private LocalDate undergradGraduationDate;

    @Column(name = "undergrad_address")
    private String undergradAddress;

    @Column(name = "undergrad_diploma_path")
    private String undergradDiplomaPath;

    @Column(name = "medical_school_address")
    private String medicalSchoolAddress;

    // ECFMG Certification (for International Medical Graduates)
    @Column(name = "has_ecfmg")
    private Boolean hasEcfmg = false;

    @Column(name = "ecfmg_number")
    private String ecfmgNumber;

    @Column(name = "ecfmg_certification_date")
    private LocalDate ecfmgCertificationDate;

    @Column(name = "ecfmg_expiration_date")
    private LocalDate ecfmgExpirationDate;

    @Column(name = "ecfmg_file_path")
    private String ecfmgFilePath;


    public Boolean getHasEcfmg() { return hasEcfmg; }
    public void setHasEcfmg(Boolean hasEcfmg) { this.hasEcfmg = hasEcfmg; }

    public String getEcfmgNumber() { return ecfmgNumber; }
    public void setEcfmgNumber(String ecfmgNumber) { this.ecfmgNumber = ecfmgNumber; }

    public LocalDate getEcfmgCertificationDate() { return ecfmgCertificationDate; }
    public void setEcfmgCertificationDate(LocalDate ecfmgCertificationDate) { this.ecfmgCertificationDate = ecfmgCertificationDate; }

    public LocalDate getEcfmgExpirationDate() { return ecfmgExpirationDate; }
    public void setEcfmgExpirationDate(LocalDate ecfmgExpirationDate) { this.ecfmgExpirationDate = ecfmgExpirationDate; }

    public String getEcfmgFilePath() { return ecfmgFilePath; }
    public void setEcfmgFilePath(String ecfmgFilePath) { this.ecfmgFilePath = ecfmgFilePath; }



    public String getAttendingFilePath() {
        return attendingFilePath;
    }

    public void setAttendingFilePath(String attendingFilePath) {
        this.attendingFilePath = attendingFilePath;
    }


    public String getUndergradSchoolName() { return undergradSchoolName; }
    public void setUndergradSchoolName(String undergradSchoolName) { this.undergradSchoolName = undergradSchoolName; }

    public String getUndergradDegree() { return undergradDegree; }
    public void setUndergradDegree(String undergradDegree) { this.undergradDegree = undergradDegree; }

    public LocalDate getUndergradGraduationDate() { return undergradGraduationDate; }
    public void setUndergradGraduationDate(LocalDate undergradGraduationDate) { this.undergradGraduationDate = undergradGraduationDate; }

    public String getUndergradAddress() { return undergradAddress; }
    public void setUndergradAddress(String undergradAddress) { this.undergradAddress = undergradAddress; }

    public String getUndergradDiplomaPath() { return undergradDiplomaPath; }
    public void setUndergradDiplomaPath(String undergradDiplomaPath) { this.undergradDiplomaPath = undergradDiplomaPath; }

    public String getMedicalSchoolAddress() { return medicalSchoolAddress; }
    public void setMedicalSchoolAddress(String medicalSchoolAddress) { this.medicalSchoolAddress = medicalSchoolAddress; }

    public Boolean getIsCurrentAttending() {
        return isCurrentAttending;
    }

    public void setIsCurrentAttending(Boolean currentAttending) {
        isCurrentAttending = currentAttending;
    }



    public LocalDate getAttendingEndDate() {
        return attendingEndDate;
    }

    public void setAttendingEndDate(LocalDate attendingEndDate) {
        this.attendingEndDate = attendingEndDate;
    }

    public LocalDate getAttendingStartDate() {
        return attendingStartDate;
    }

    public void setAttendingStartDate(LocalDate attendingStartDate) {
        this.attendingStartDate = attendingStartDate;
    }

    public String getAttendingSpecialty() {
        return attendingSpecialty;
    }

    public void setAttendingSpecialty(String attendingSpecialty) {
        this.attendingSpecialty = attendingSpecialty;
    }

    public String getAttendingFacility() {
        return attendingFacility;
    }

    public void setAttendingFacility(String attendingFacility) {
        this.attendingFacility = attendingFacility;
    }

    private LocalDate attendingEndDate;
    private Boolean isCurrentAttending;
    private String attendingFilePath;

    public String getFellowshipCertFilePath() {
        return fellowshipCertFilePath;
    }

    public void setFellowshipCertFilePath(String fellowshipCertFilePath) {
        this.fellowshipCertFilePath = fellowshipCertFilePath;
    }

    public String getResidencyCertFilePath() {
        return residencyCertFilePath;
    }

    public void setResidencyCertFilePath(String residencyCertFilePath) {
        this.residencyCertFilePath = residencyCertFilePath;
    }

    public String getDiplomaFilePath() {
        return diplomaFilePath;
    }

    public void setDiplomaFilePath(String diplomaFilePath) {
        this.diplomaFilePath = diplomaFilePath;
    }

    private String residencyCertFilePath;
    private String fellowshipCertFilePath;


    public String getInternshipFilePath() {
        return internshipFilePath;
    }

    public void setInternshipFilePath(String internshipFilePath) {
        this.internshipFilePath = internshipFilePath;
    }

    public LocalDate getInternshipEndDate() {
        return internshipEndDate;
    }

    public void setInternshipEndDate(LocalDate internshipEndDate) {
        this.internshipEndDate = internshipEndDate;
    }

    public LocalDate getInternshipStartDate() {
        return internshipStartDate;
    }

    public void setInternshipStartDate(LocalDate internshipStartDate) {
        this.internshipStartDate = internshipStartDate;
    }

    public String getInternshipSpecialty() {
        return internshipSpecialty;
    }

    public void setInternshipSpecialty(String internshipSpecialty) {
        this.internshipSpecialty = internshipSpecialty;
    }

    public String getInternshipFacility() {
        return internshipFacility;
    }

    public void setInternshipFacility(String internshipFacility) {
        this.internshipFacility = internshipFacility;
    }

    private LocalDate internshipEndDate;
    private String internshipFilePath;

    public ProviderEducation() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProviderId() { return providerId; }
    public void setProviderId(Long providerId) { this.providerId = providerId; }

    public String getSchoolName() { return schoolName; }
    public void setSchoolName(String schoolName) { this.schoolName = schoolName; }

    public String getDegree() { return degree; }
    public void setDegree(String degree) { this.degree = degree; }

    public LocalDate getGraduationDate() { return graduationDate; }
    public void setGraduationDate(LocalDate graduationDate) { this.graduationDate = graduationDate; }

    public String getDiplomaPath() { return diplomaPath; }
    public void setDiplomaPath(String diplomaPath) { this.diplomaPath = diplomaPath; }

    public String getResidencyFacility() { return residencyFacility; }
    public void setResidencyFacility(String residencyFacility) { this.residencyFacility = residencyFacility; }

    public String getResidencySpecialty() { return residencySpecialty; }
    public void setResidencySpecialty(String residencySpecialty) { this.residencySpecialty = residencySpecialty; }

    public LocalDate getResidencyStartDate() { return residencyStartDate; }
    public void setResidencyStartDate(LocalDate residencyStartDate) { this.residencyStartDate = residencyStartDate; }

    public LocalDate getResidencyEndDate() { return residencyEndDate; }
    public void setResidencyEndDate(LocalDate residencyEndDate) { this.residencyEndDate = residencyEndDate; }

    public String getResidencyCertPath() { return residencyCertPath; }
    public void setResidencyCertPath(String residencyCertPath) { this.residencyCertPath = residencyCertPath; }

    public String getFellowshipFacility() { return fellowshipFacility; }
    public void setFellowshipFacility(String fellowshipFacility) { this.fellowshipFacility = fellowshipFacility; }

    public String getFellowshipSpecialty() { return fellowshipSpecialty; }
    public void setFellowshipSpecialty(String fellowshipSpecialty) { this.fellowshipSpecialty = fellowshipSpecialty; }

    public LocalDate getFellowshipStartDate() { return fellowshipStartDate; }
    public void setFellowshipStartDate(LocalDate fellowshipStartDate) { this.fellowshipStartDate = fellowshipStartDate; }

    public LocalDate getFellowshipEndDate() { return fellowshipEndDate; }
    public void setFellowshipEndDate(LocalDate fellowshipEndDate) { this.fellowshipEndDate = fellowshipEndDate; }

    public String getFellowshipCertPath() { return fellowshipCertPath; }
    public void setFellowshipCertPath(String fellowshipCertPath) { this.fellowshipCertPath = fellowshipCertPath; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}