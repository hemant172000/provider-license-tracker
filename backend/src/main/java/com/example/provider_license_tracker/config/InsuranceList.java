package com.example.provider_license_tracker.config;

import java.util.Arrays;
import java.util.List;

/**
 * Shared insurance/payer name list used across the application.
 * Single source of truth — add new payers here and they appear everywhere.
 */
public class InsuranceList {

    public static final List<String> INSURANCE_NAMES = Arrays.asList(
            // Major Commercial
            "Aetna",
            "Anthem Blue Cross Blue Shield",
            "Blue Cross Blue Shield (BCBS)",
            "Cigna",
            "Humana",
            "UnitedHealthcare",
            "Kaiser Permanente",

            // Medicare / Medicaid
            "Medicare",
            "Medicaid",
            "Medicare Advantage",
            "Dual Eligible (Medicare/Medicaid)",

            // Marketplace / ACA
            "Ambetter",
            "Bright Health",
            "Centene",
            "Molina Healthcare",
            "Oscar Health",

            // Managed Care / Regional
            "Amerihealth",
            "BCBS Federal Employee Program",
            "Caresource",
            "Community Health Plan",
            "Coventry Health Care",
            "Devoted Health",
            "Friday Health Plans",
            "Geisinger Health Plan",
            "Health Alliance Plan",
            "Highmark",
            "Independence Blue Cross",
            "Magellan Health",
            "MDVIP",
            "Multiplan",
            "Network Health",
            "Point32Health (Tufts / Harvard Pilgrim)",
            "Premera Blue Cross",
            "Priority Health",
            "Regence Blue Shield",
            "Scott & White Health Plan",
            "Sun Life Financial",
            "Tricare",
            "UPMC Health Plan",
            "WellCare",
            "Western Health Advantage",

            // Workers Comp / Auto
            "Workers Compensation",
            "Auto Insurance (PIP)",

            // Other
            "Champva",
            "Indian Health Service",
            "Veterans Affairs (VA)",
            "Self-Pay / Uninsured",
            "Other"
    );

    private InsuranceList() {}
}