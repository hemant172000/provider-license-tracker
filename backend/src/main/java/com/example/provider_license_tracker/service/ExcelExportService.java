// service/ExcelExportService.java
package com.example.provider_license_tracker.service;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.io.ByteArrayInputStream;
import java.util.*;

@Service
public class ExcelExportService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public byte[] exportProviderToExcel(Map<String, Object> profileData, String providerName) throws Exception {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            // Create sheets matching team's Excel format
            createPersonalInfoSheet(workbook, profileData);
            createLicensesSheet(workbook, profileData);
            createCdsSheet(workbook, profileData);
            createBoardCertificationsSheet(workbook, profileData);
            createEducationSheet(workbook, profileData);
            createPracticeLocationsSheet(workbook, profileData);
            createWorkHistorySheet(workbook, profileData);
            createMalpracticeSheet(workbook, profileData);
            createPayerIdsSheet(workbook, profileData);
            createHospitalPrivilegesSheet(workbook, profileData);
            createPeerReferencesSheet(workbook, profileData);
            createCaqhSheet(workbook, profileData);

            workbook.write(out);
            return out.toByteArray();
        }
    }

    private void createPersonalInfoSheet(Workbook workbook, Map<String, Object> data) {
        Sheet sheet = workbook.createSheet("Personal Information");
        Row headerRow = sheet.createRow(0);

        String[] headers = {"Provider ID", "Provider Name", "NPI Number", "DOB", "SSN", "Gender",
                "Address Line 1", "Address Line 2", "City", "State", "ZIP", "Phone", "Email"};
        for (int i = 0; i < headers.length; i++) {
            headerRow.createCell(i).setCellValue(headers[i]);
            sheet.setColumnWidth(i, 5000);
        }

        Map<String, Object> personalInfo = (Map<String, Object>) data.getOrDefault("personalInfo", new HashMap<>());
        Row row = sheet.createRow(1);
        row.createCell(0).setCellValue((Long) data.getOrDefault("providerId", 0L));
        row.createCell(1).setCellValue((String) personalInfo.getOrDefault("fullName", ""));
        row.createCell(2).setCellValue((String) personalInfo.getOrDefault("npiNumber", ""));
        row.createCell(3).setCellValue(personalInfo.get("dateOfBirth") != null ? personalInfo.get("dateOfBirth").toString() : "");
        row.createCell(4).setCellValue((String) personalInfo.getOrDefault("ssn", ""));
        row.createCell(5).setCellValue((String) personalInfo.getOrDefault("gender", ""));
        row.createCell(6).setCellValue((String) personalInfo.getOrDefault("addressLine1", ""));
        row.createCell(7).setCellValue((String) personalInfo.getOrDefault("addressLine2", ""));
        row.createCell(8).setCellValue((String) personalInfo.getOrDefault("city", ""));
        row.createCell(9).setCellValue((String) personalInfo.getOrDefault("state", ""));
        row.createCell(10).setCellValue((String) personalInfo.getOrDefault("zipCode", ""));
        row.createCell(11).setCellValue((String) personalInfo.getOrDefault("phone", ""));
        row.createCell(12).setCellValue((String) personalInfo.getOrDefault("email", ""));
    }

    private void createLicensesSheet(Workbook workbook, Map<String, Object> data) {
        Sheet sheet = workbook.createSheet("State Licenses");
        Row headerRow = sheet.createRow(0);

        String[] headers = {"Provider ID", "State", "License Number", "License Type", "Issue Date", "Expiration Date", "Status", "Notes"};
        for (int i = 0; i < headers.length; i++) {
            headerRow.createCell(i).setCellValue(headers[i]);
            sheet.setColumnWidth(i, 5000);
        }

        List<Map<String, Object>> licenses = (List<Map<String, Object>>) data.getOrDefault("licenses", new ArrayList<>());
        int rowNum = 1;
        for (Map<String, Object> license : licenses) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue((Long) data.getOrDefault("providerId", 0L));
            row.createCell(1).setCellValue((String) license.getOrDefault("state", ""));
            row.createCell(2).setCellValue((String) license.getOrDefault("licenseNumber", ""));
            row.createCell(3).setCellValue((String) license.getOrDefault("licenseType", ""));
            row.createCell(4).setCellValue(license.get("issueDate") != null ? license.get("issueDate").toString() : "");
            row.createCell(5).setCellValue(license.get("expirationDate") != null ? license.get("expirationDate").toString() : "");
            row.createCell(6).setCellValue((String) license.getOrDefault("status", ""));
            row.createCell(7).setCellValue((String) license.getOrDefault("notes", ""));
        }
    }

    private void createCdsSheet(Workbook workbook, Map<String, Object> data) {
        Sheet sheet = workbook.createSheet("DEA & CDS");
        Row headerRow = sheet.createRow(0);

        String[] headers = {"Provider ID", "DEA Number", "DEA Issue Date", "DEA Expiration Date",
                "CDS Number", "CDS State", "CDS Issue Date", "CDS Expiration Date"};
        for (int i = 0; i < headers.length; i++) {
            headerRow.createCell(i).setCellValue(headers[i]);
            sheet.setColumnWidth(i, 5000);
        }

        Map<String, Object> cdsData = (Map<String, Object>) data.getOrDefault("cdsLicenses", new HashMap<>());
        Row row = sheet.createRow(1);
        row.createCell(0).setCellValue((Long) data.getOrDefault("providerId", 0L));
        row.createCell(1).setCellValue((String) cdsData.getOrDefault("deaNumber", ""));
        row.createCell(2).setCellValue(cdsData.get("deaIssueDate") != null ? cdsData.get("deaIssueDate").toString() : "");
        row.createCell(3).setCellValue(cdsData.get("deaExpirationDate") != null ? cdsData.get("deaExpirationDate").toString() : "");
        row.createCell(4).setCellValue((String) cdsData.getOrDefault("cdsNumber", ""));
        row.createCell(5).setCellValue((String) cdsData.getOrDefault("cdsState", ""));
        row.createCell(6).setCellValue(cdsData.get("cdsIssueDate") != null ? cdsData.get("cdsIssueDate").toString() : "");
        row.createCell(7).setCellValue(cdsData.get("cdsExpirationDate") != null ? cdsData.get("cdsExpirationDate").toString() : "");
    }

    private void createBoardCertificationsSheet(Workbook workbook, Map<String, Object> data) {
        Sheet sheet = workbook.createSheet("Board Certifications");
        Row headerRow = sheet.createRow(0);

        String[] headers = {"Provider ID", "Specialty", "Certifying Board", "Certification Number", "Issue Date", "Expiration Date"};
        for (int i = 0; i < headers.length; i++) {
            headerRow.createCell(i).setCellValue(headers[i]);
            sheet.setColumnWidth(i, 5000);
        }

        List<Map<String, Object>> certifications = (List<Map<String, Object>>) data.getOrDefault("boardCertifications", new ArrayList<>());
        int rowNum = 1;
        for (Map<String, Object> cert : certifications) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue((Long) data.getOrDefault("providerId", 0L));
            row.createCell(1).setCellValue((String) cert.getOrDefault("specialty", ""));
            row.createCell(2).setCellValue((String) cert.getOrDefault("certifyingBoard", ""));
            row.createCell(3).setCellValue((String) cert.getOrDefault("certificationNumber", ""));
            row.createCell(4).setCellValue(cert.get("issueDate") != null ? cert.get("issueDate").toString() : "");
            row.createCell(5).setCellValue(cert.get("expirationDate") != null ? cert.get("expirationDate").toString() : "");
        }
    }

    private void createEducationSheet(Workbook workbook, Map<String, Object> data) {
        Sheet sheet = workbook.createSheet("Education & Training");
        Row headerRow = sheet.createRow(0);

        String[] headers = {"Provider ID", "Medical School", "Degree", "Graduation Date",
                "Residency Facility", "Residency Specialty", "Residency Start", "Residency End",
                "Fellowship Facility", "Fellowship Specialty", "Fellowship Start", "Fellowship End"};
        for (int i = 0; i < headers.length; i++) {
            headerRow.createCell(i).setCellValue(headers[i]);
            sheet.setColumnWidth(i, 5000);
        }

        Map<String, Object> education = (Map<String, Object>) data.getOrDefault("education", new HashMap<>());
        Row row = sheet.createRow(1);
        row.createCell(0).setCellValue((Long) data.getOrDefault("providerId", 0L));
        row.createCell(1).setCellValue((String) education.getOrDefault("schoolName", ""));
        row.createCell(2).setCellValue((String) education.getOrDefault("degree", ""));
        row.createCell(3).setCellValue(education.get("graduationDate") != null ? education.get("graduationDate").toString() : "");
        row.createCell(4).setCellValue((String) education.getOrDefault("residencyFacility", ""));
        row.createCell(5).setCellValue((String) education.getOrDefault("residencySpecialty", ""));
        row.createCell(6).setCellValue(education.get("residencyStartDate") != null ? education.get("residencyStartDate").toString() : "");
        row.createCell(7).setCellValue(education.get("residencyEndDate") != null ? education.get("residencyEndDate").toString() : "");
        row.createCell(8).setCellValue((String) education.getOrDefault("fellowshipFacility", ""));
        row.createCell(9).setCellValue((String) education.getOrDefault("fellowshipSpecialty", ""));
        row.createCell(10).setCellValue(education.get("fellowshipStartDate") != null ? education.get("fellowshipStartDate").toString() : "");
        row.createCell(11).setCellValue(education.get("fellowshipEndDate") != null ? education.get("fellowshipEndDate").toString() : "");
    }

    private void createPracticeLocationsSheet(Workbook workbook, Map<String, Object> data) {
        Sheet sheet = workbook.createSheet("Practice Locations");
        Row headerRow = sheet.createRow(0);

        String[] headers = {"Provider ID", "Practice Name", "Address", "City", "State", "ZIP", "Phone", "Fax", "Primary?", "Accepting Patients?", "Hospital Affiliations"};
        for (int i = 0; i < headers.length; i++) {
            headerRow.createCell(i).setCellValue(headers[i]);
            sheet.setColumnWidth(i, 5000);
        }

        List<Map<String, Object>> locations = (List<Map<String, Object>>) data.getOrDefault("practiceLocations", new ArrayList<>());
        int rowNum = 1;
        for (Map<String, Object> location : locations) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue((Long) data.getOrDefault("providerId", 0L));
            row.createCell(1).setCellValue((String) location.getOrDefault("practiceName", ""));
            row.createCell(2).setCellValue((String) location.getOrDefault("addressLine1", ""));
            row.createCell(3).setCellValue((String) location.getOrDefault("city", ""));
            row.createCell(4).setCellValue((String) location.getOrDefault("state", ""));
            row.createCell(5).setCellValue((String) location.getOrDefault("zipCode", ""));
            row.createCell(6).setCellValue((String) location.getOrDefault("phone", ""));
            row.createCell(7).setCellValue((String) location.getOrDefault("fax", ""));
            row.createCell(8).setCellValue((Boolean) location.getOrDefault("isPrimary", false) ? "Yes" : "No");
            row.createCell(9).setCellValue((Boolean) location.getOrDefault("acceptingPatients", false) ? "Yes" : "No");
            row.createCell(10).setCellValue((String) location.getOrDefault("hospitalAffiliations", ""));
        }
    }

    private void createWorkHistorySheet(Workbook workbook, Map<String, Object> data) {
        Sheet sheet = workbook.createSheet("Work History");
        Row headerRow = sheet.createRow(0);

        String[] headers = {"Provider ID", "Facility Name", "Position", "Start Date", "End Date", "Current?", "Address", "Supervisor Name", "Description"};
        for (int i = 0; i < headers.length; i++) {
            headerRow.createCell(i).setCellValue(headers[i]);
            sheet.setColumnWidth(i, 5000);
        }

        List<Map<String, Object>> workHistory = (List<Map<String, Object>>) data.getOrDefault("workHistory", new ArrayList<>());
        int rowNum = 1;
        for (Map<String, Object> work : workHistory) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue((Long) data.getOrDefault("providerId", 0L));
            row.createCell(1).setCellValue((String) work.getOrDefault("facilityName", ""));
            row.createCell(2).setCellValue((String) work.getOrDefault("position", ""));
            row.createCell(3).setCellValue(work.get("startDate") != null ? work.get("startDate").toString() : "");
            row.createCell(4).setCellValue(work.get("endDate") != null ? work.get("endDate").toString() : "");
            row.createCell(5).setCellValue((Boolean) work.getOrDefault("isCurrent", false) ? "Yes" : "No");
            row.createCell(6).setCellValue((String) work.getOrDefault("address", ""));
            row.createCell(7).setCellValue((String) work.getOrDefault("supervisorName", ""));
            row.createCell(8).setCellValue((String) work.getOrDefault("description", ""));
        }
    }

    private void createMalpracticeSheet(Workbook workbook, Map<String, Object> data) {
        Sheet sheet = workbook.createSheet("Malpractice Insurance");
        Row headerRow = sheet.createRow(0);

        String[] headers = {"Provider ID", "Carrier Name", "Policy Number", "Coverage Limit", "Effective Date", "Expiration Date", "Policy Type", "Tail Coverage?"};
        for (int i = 0; i < headers.length; i++) {
            headerRow.createCell(i).setCellValue(headers[i]);
            sheet.setColumnWidth(i, 5000);
        }

        Map<String, Object> malpractice = (Map<String, Object>) data.getOrDefault("malpractice", new HashMap<>());
        Row row = sheet.createRow(1);
        row.createCell(0).setCellValue((Long) data.getOrDefault("providerId", 0L));
        row.createCell(1).setCellValue((String) malpractice.getOrDefault("carrierName", ""));
        row.createCell(2).setCellValue((String) malpractice.getOrDefault("policyNumber", ""));
        row.createCell(3).setCellValue((String) malpractice.getOrDefault("coverageLimit", ""));
        row.createCell(4).setCellValue(malpractice.get("effectiveDate") != null ? malpractice.get("effectiveDate").toString() : "");
        row.createCell(5).setCellValue(malpractice.get("expirationDate") != null ? malpractice.get("expirationDate").toString() : "");
        row.createCell(6).setCellValue((String) malpractice.getOrDefault("policyType", ""));
        row.createCell(7).setCellValue((Boolean) malpractice.getOrDefault("tailCoverage", false) ? "Yes" : "No");
    }

    private void createPayerIdsSheet(Workbook workbook, Map<String, Object> data) {
        Sheet sheet = workbook.createSheet("Payer IDs");
        Row headerRow = sheet.createRow(0);

        String[] headers = {"Provider ID", "State", "Medicare PTAN", "Medicare PIN", "Medicaid ID", "Medicaid Provider #", "Commercial IDs", "Status"};
        for (int i = 0; i < headers.length; i++) {
            headerRow.createCell(i).setCellValue(headers[i]);
            sheet.setColumnWidth(i, 5000);
        }

        List<Map<String, Object>> payerIds = (List<Map<String, Object>>) data.getOrDefault("payerIds", new ArrayList<>());
        int rowNum = 1;
        for (Map<String, Object> payer : payerIds) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue((Long) data.getOrDefault("providerId", 0L));
            row.createCell(1).setCellValue((String) payer.getOrDefault("state", ""));
            row.createCell(2).setCellValue((String) payer.getOrDefault("medicarePtan", ""));
            row.createCell(3).setCellValue((String) payer.getOrDefault("medicarePin", ""));
            row.createCell(4).setCellValue((String) payer.getOrDefault("medicaidId", ""));
            row.createCell(5).setCellValue((String) payer.getOrDefault("medicaidProviderNumber", ""));
            row.createCell(6).setCellValue((String) payer.getOrDefault("commercialIds", ""));
            row.createCell(7).setCellValue((String) payer.getOrDefault("status", ""));
        }
    }

    private void createHospitalPrivilegesSheet(Workbook workbook, Map<String, Object> data) {
        Sheet sheet = workbook.createSheet("Hospital Privileges");
        Row headerRow = sheet.createRow(0);

        String[] headers = {"Provider ID", "Hospital Name", "Privilege Type", "Department", "Start Date", "End Date", "Current?"};
        for (int i = 0; i < headers.length; i++) {
            headerRow.createCell(i).setCellValue(headers[i]);
            sheet.setColumnWidth(i, 5000);
        }

        List<Map<String, Object>> privileges = (List<Map<String, Object>>) data.getOrDefault("privileges", new ArrayList<>());
        int rowNum = 1;
        for (Map<String, Object> privilege : privileges) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue((Long) data.getOrDefault("providerId", 0L));
            row.createCell(1).setCellValue((String) privilege.getOrDefault("hospitalName", ""));
            row.createCell(2).setCellValue((String) privilege.getOrDefault("privilegeType", ""));
            row.createCell(3).setCellValue((String) privilege.getOrDefault("department", ""));
            row.createCell(4).setCellValue(privilege.get("startDate") != null ? privilege.get("startDate").toString() : "");
            row.createCell(5).setCellValue(privilege.get("endDate") != null ? privilege.get("endDate").toString() : "");
            row.createCell(6).setCellValue((Boolean) privilege.getOrDefault("isCurrent", false) ? "Yes" : "No");
        }
    }

    private void createPeerReferencesSheet(Workbook workbook, Map<String, Object> data) {
        Sheet sheet = workbook.createSheet("Peer References");
        Row headerRow = sheet.createRow(0);

        String[] headers = {"Provider ID", "Reference Name", "Title", "Institution", "Email", "Phone"};
        for (int i = 0; i < headers.length; i++) {
            headerRow.createCell(i).setCellValue(headers[i]);
            sheet.setColumnWidth(i, 5000);
        }

        List<Map<String, Object>> references = (List<Map<String, Object>>) data.getOrDefault("references", new ArrayList<>());
        int rowNum = 1;
        for (Map<String, Object> ref : references) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue((Long) data.getOrDefault("providerId", 0L));
            row.createCell(1).setCellValue((String) ref.getOrDefault("referenceName", ""));
            row.createCell(2).setCellValue((String) ref.getOrDefault("title", ""));
            row.createCell(3).setCellValue((String) ref.getOrDefault("institution", ""));
            row.createCell(4).setCellValue((String) ref.getOrDefault("email", ""));
            row.createCell(5).setCellValue((String) ref.getOrDefault("phone", ""));
        }
    }

    private void createCaqhSheet(Workbook workbook, Map<String, Object> data) {
        Sheet sheet = workbook.createSheet("CAQH Information");
        Row headerRow = sheet.createRow(0);

        String[] headers = {"Provider ID", "CAQH ID", "CAQH Username", "CAQH Password", "Last Attestation Date"};
        for (int i = 0; i < headers.length; i++) {
            headerRow.createCell(i).setCellValue(headers[i]);
            sheet.setColumnWidth(i, 5000);
        }

        Map<String, Object> caqh = (Map<String, Object>) data.getOrDefault("caqh", new HashMap<>());
        Row row = sheet.createRow(1);
        row.createCell(0).setCellValue((Long) data.getOrDefault("providerId", 0L));
        row.createCell(1).setCellValue((String) caqh.getOrDefault("caqhId", ""));
        row.createCell(2).setCellValue((String) caqh.getOrDefault("caqhUsername", ""));
        row.createCell(3).setCellValue((String) caqh.getOrDefault("caqhPassword", ""));
        row.createCell(4).setCellValue(caqh.get("lastAttestationDate") != null ? caqh.get("lastAttestationDate").toString() : "");
    }

    public void createProviderDataSheet(Workbook workbook, String sheetName, Map<String, Object> profileData, String providerName) {
        // Instead of creating a new format, we use the existing exportProviderToExcel logic
        // But we need to write directly to the workbook instead of creating a new file

        try {
            // Create a temporary workbook using your existing export method
            byte[] providerExcelData = exportProviderToExcel(profileData, providerName);

            // Open the temporary workbook
            Workbook providerWorkbook = new XSSFWorkbook(new java.io.ByteArrayInputStream(providerExcelData));

            // Copy all sheets from providerWorkbook to the main workbook
            int numberOfSheets = providerWorkbook.getNumberOfSheets();
            for (int i = 0; i < numberOfSheets; i++) {
                Sheet sourceSheet = providerWorkbook.getSheetAt(i);
                Sheet destSheet = workbook.createSheet(sheetName + " - " + sourceSheet.getSheetName());

                // Copy rows
                copySheet(sourceSheet, destSheet);
            }

            providerWorkbook.close();

        } catch (Exception e) {
            e.printStackTrace();
            // Fallback to simple format if something goes wrong
            createSimpleProviderSheet(workbook, sheetName, profileData, providerName);
        }
    }

    private void copySheet(Sheet sourceSheet, Sheet destSheet) {
        int rowCount = sourceSheet.getLastRowNum();

        // Copy column widths
        for (int i = 0; i < sourceSheet.getRow(0).getLastCellNum(); i++) {
            destSheet.setColumnWidth(i, sourceSheet.getColumnWidth(i));
        }

        // Copy rows
        for (int i = 0; i <= rowCount; i++) {
            Row sourceRow = sourceSheet.getRow(i);
            if (sourceRow != null) {
                Row destRow = destSheet.createRow(i);
                copyRow(sourceRow, destRow);
            }
        }
    }

    private void copyRow(Row sourceRow, Row destRow) {
        int cellCount = sourceRow.getLastCellNum();
        for (int i = 0; i < cellCount; i++) {
            Cell sourceCell = sourceRow.getCell(i);
            if (sourceCell != null) {
                Cell destCell = destRow.createCell(i);
                copyCell(sourceCell, destCell);
            }
        }
    }

    private void copyCell(Cell sourceCell, Cell destCell) {
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
        CellStyle newStyle = destCell.getSheet().getWorkbook().createCellStyle();
        newStyle.cloneStyleFrom(sourceCell.getCellStyle());
        destCell.setCellStyle(newStyle);
    }

    private String getStringValue(Object value) {
        if (value == null) {
            return "";
        }
        return value.toString();
    }

    private void addDataRow(Sheet sheet, int rowNum, String field, String value) {
        Row row = sheet.createRow(rowNum);
        row.createCell(1).setCellValue(field);
        row.createCell(2).setCellValue(value);
    }

    private int addSectionSeparator(Sheet sheet, int rowNum, String sectionName, CellStyle headerStyle) {
        Row sectionRow = sheet.createRow(rowNum);
        Cell sectionCell = sectionRow.createCell(0);
        sectionCell.setCellValue(sectionName);
        sectionCell.setCellStyle(headerStyle);
        return rowNum + 1;
    }

    private void createSimpleProviderSheet(Workbook workbook, String sheetName, Map<String, Object> profileData, String providerName) {
        // Fallback simple format if copying fails
        Sheet sheet = workbook.createSheet(sheetName);

        Map<String, Object> personalInfo = (Map<String, Object>) profileData.getOrDefault("personalInfo", new HashMap<>());

        Row headerRow = sheet.createRow(0);
        headerRow.createCell(0).setCellValue("Field");
        headerRow.createCell(1).setCellValue("Value");

        int rowNum = 1;
        addSimpleRow(sheet, rowNum++, "Provider Name", providerName);
        addSimpleRow(sheet, rowNum++, "NPI Number", getStringValue(personalInfo.get("npiNumber")));
        addSimpleRow(sheet, rowNum++, "Email", getStringValue(personalInfo.get("email")));
        addSimpleRow(sheet, rowNum++, "Phone", getStringValue(personalInfo.get("phone")));
    }

    private void addSimpleRow(Sheet sheet, int rowNum, String field, String value) {
        Row row = sheet.createRow(rowNum);
        row.createCell(0).setCellValue(field);
        row.createCell(1).setCellValue(value);
    }

    public byte[] exportProviderToExcelFlattened(Map<String, Object> profileData, String providerName) throws Exception {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Provider Data");

            // Create header row
            Row headerRow = sheet.createRow(0);
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // Define all column headers
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

            // Create header row
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
                sheet.setColumnWidth(i, 5000);
            }

            // Create data row (row 1)
            Row dataRow = sheet.createRow(1);
            int col = 0;

            // Basic Info
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

            workbook.write(out);
            return out.toByteArray();
        }
    }

    // Helper method for Long values
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
}