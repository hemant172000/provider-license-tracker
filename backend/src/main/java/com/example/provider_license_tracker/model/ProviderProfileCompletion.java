package com.example.provider_license_tracker.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;

import java.time.LocalDateTime;
import java.util.Date;

@Entity
public class ProviderProfileCompletion {
    @Id
    private Long providerId;

    private boolean profileCompleted;
    private LocalDateTime completedAt;

    // UPDS fields
    private String npiNumber;
    private String medicaidId;
    private String medicareNumber;
    private String caqhId;
    private String deaNumber;
    private String upinNumber;
    private String stateLicenseNumber;
    private String taxonomyCode;
    private String boardCertification;
    private String medicalSchool;
    private String residencyProgram;
    private String fellowshipProgram;
    private String malpracticeCarrier;
    private String malpracticePolicyNumber;
    private Date malpracticeExpiryDate;
    private String workHistory;
    private String privilegeRequests;

    @OneToOne
    @MapsId
    private Provider provider;
}
