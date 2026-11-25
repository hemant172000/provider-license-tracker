package com.example.provider_license_tracker.controller;

import com.example.provider_license_tracker.model.AppUser;
import com.example.provider_license_tracker.model.Group;
import com.example.provider_license_tracker.model.ProviderCredentialing;
import com.example.provider_license_tracker.repository.GroupRepository;
import com.example.provider_license_tracker.repository.ProviderCredentialingRepository;
import com.example.provider_license_tracker.repository.UserRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.util.Comparator;
import java.security.Principal;
import java.time.LocalDateTime;
import java.util.*;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/credentialing")
public class ProviderCredentialingController {

    private final ProviderCredentialingRepository credentialingRepository;
    private final UserRepository userRepository;
    private final GroupRepository groupRepo;

    public ProviderCredentialingController(ProviderCredentialingRepository credentialingRepository,
                                           UserRepository userRepository,
                                           GroupRepository groupRepo) {
        this.credentialingRepository = credentialingRepository;
        this.userRepository = userRepository;
        this.groupRepo = groupRepo;
    }
    // ==================== EXPORT TO EXCEL ====================

    @GetMapping("/export/group/{groupId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEADER', 'GROUP_MGR')")
    public ResponseEntity<?> exportGroupCredentialing(@PathVariable Long groupId) {
        try {
            // Get the group name
            Group group = groupRepo.findById(groupId)
                    .orElseThrow(() -> new RuntimeException("Group not found"));

            // Get credentialing records for this group
            List<ProviderCredentialing> records = credentialingRepository.findByGroupId(groupId);

            if (records.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "No credentialing records found for this group"));
            }

            // Generate Excel file
            byte[] excelData = generateExcelForGroup(records, group.getName());

            // Set headers for file download
            String filename = group.getName().replaceAll("[^a-zA-Z0-9]", "_") + "_Credentialing_Data.xlsx";

            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=\"" + filename + "\"")
                    .header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                    .body(excelData);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to export data: " + e.getMessage()));
        }
    }

    @GetMapping("/export/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEADER')")
    public ResponseEntity<?> exportAllCredentialing() {
        try {
            // Get all credentialing records with group names
            List<Object[]> records = credentialingRepository.findAllWithGroupNames();

            if (records.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "No credentialing records found"));
            }

            // Generate Excel file
            byte[] excelData = generateExcelForAllGroups(records);

            // Set headers for file download
            String filename = "All_Groups_Credentialing_Data.xlsx";

            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=\"" + filename + "\"")
                    .header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                    .body(excelData);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to export data: " + e.getMessage()));
        }
    }

// ==================== EXCEL GENERATION HELPERS ====================

    private byte[] generateExcelForGroup(List<ProviderCredentialing> records, String groupName) throws Exception {
        // Sort records by payer name
        records.sort(Comparator.comparing(ProviderCredentialing::getPayerName, Comparator.nullsLast(Comparator.naturalOrder())));

        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet(groupName);

        // Create header row
        Row headerRow = sheet.createRow(0);
        String[] columns = {
                "Payer Name", "LOB", "Network", "Product", "Plan", "Status", "Managing Entity",
                "Application Date", "Credentialing Effective Date", "Link Effective Date",
                "Recredentialing Date", "Termination Date", "Provider Rep", "Contracting Rep"
        };

        // Style for header
        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerStyle.setFont(headerFont);
        headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        for (int i = 0; i < columns.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(columns[i]);
            cell.setCellStyle(headerStyle);
            sheet.autoSizeColumn(i);
        }

        // Data rows
        int rowNum = 1;
        for (ProviderCredentialing record : records) {
            Row row = sheet.createRow(rowNum++);

            row.createCell(0).setCellValue(record.getPayerName() != null ? record.getPayerName() : "");
            row.createCell(1).setCellValue(record.getLob() != null ? record.getLob() : "");
            row.createCell(2).setCellValue(record.getNetwork() != null ? record.getNetwork() : "");
            row.createCell(3).setCellValue(record.getProduct() != null ? record.getProduct() : "");
            row.createCell(4).setCellValue(record.getPlan() != null ? record.getPlan() : "");
            row.createCell(5).setCellValue(record.getStatus() != null ? record.getStatus() : "");
            row.createCell(6).setCellValue(record.getManagingEntity() != null ? record.getManagingEntity() : "");

            // Format dates as MM-DD-YYYY
            row.createCell(7).setCellValue(formatDateForExport(record.getApplicationDate()));
            row.createCell(8).setCellValue(formatDateForExport(record.getCredentialingEffectiveDate()));
            row.createCell(9).setCellValue(formatDateForExport(record.getLinkEffectiveDate()));
            row.createCell(10).setCellValue(formatDateForExport(record.getRecredentialingDate()));
            row.createCell(11).setCellValue(formatDateForExport(record.getTerminationDate()));

            row.createCell(12).setCellValue(record.getProviderRep() != null ? record.getProviderRep() : "");
            row.createCell(13).setCellValue(record.getContractingRep() != null ? record.getContractingRep() : "");
        }

        // Auto-size columns
        for (int i = 0; i < columns.length; i++) {
            sheet.autoSizeColumn(i);
        }

        // Write to byte array
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        workbook.write(baos);
        workbook.close();

        return baos.toByteArray();
    }

    private byte[] generateExcelForAllGroups(List<Object[]> records) throws Exception {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("All Groups");

        // Create header row with Group Name column
        Row headerRow = sheet.createRow(0);
        String[] columns = {
                "Group Name", "Payer Name", "LOB", "Network", "Product", "Plan", "Status", "Managing Entity",
                "Application Date", "Credentialing Effective Date", "Link Effective Date",
                "Recredentialing Date", "Termination Date", "Provider Rep", "Contracting Rep"
        };

        // Style for header
        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerStyle.setFont(headerFont);
        headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        for (int i = 0; i < columns.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(columns[i]);
            cell.setCellStyle(headerStyle);
            sheet.autoSizeColumn(i);
        }

        // Data rows
        int rowNum = 1;
        for (Object[] rowData : records) {
            Row row = sheet.createRow(rowNum++);

            row.createCell(0).setCellValue(rowData[0] != null ? rowData[0].toString() : ""); // Group Name
            row.createCell(1).setCellValue(rowData[1] != null ? rowData[1].toString() : ""); // Payer Name
            row.createCell(2).setCellValue(rowData[2] != null ? rowData[2].toString() : ""); // LOB
            row.createCell(3).setCellValue(rowData[3] != null ? rowData[3].toString() : ""); // Network
            row.createCell(4).setCellValue(rowData[4] != null ? rowData[4].toString() : ""); // Product
            row.createCell(5).setCellValue(rowData[5] != null ? rowData[5].toString() : ""); // Plan
            row.createCell(6).setCellValue(rowData[6] != null ? rowData[6].toString() : ""); // Status
            row.createCell(7).setCellValue(rowData[7] != null ? rowData[7].toString() : ""); // Managing Entity
            row.createCell(8).setCellValue(formatDateForExport((LocalDate) rowData[8])); // Application Date
            row.createCell(9).setCellValue(formatDateForExport((LocalDate) rowData[9])); // Credentialing Effective Date
            row.createCell(10).setCellValue(formatDateForExport((LocalDate) rowData[10])); // Link Effective Date
            row.createCell(11).setCellValue(formatDateForExport((LocalDate) rowData[11])); // Recredentialing Date
            row.createCell(12).setCellValue(formatDateForExport((LocalDate) rowData[12])); // Termination Date
            row.createCell(13).setCellValue(rowData[13] != null ? rowData[13].toString() : ""); // Provider Rep
            row.createCell(14).setCellValue(rowData[14] != null ? rowData[14].toString() : ""); // Contracting Rep
        }

        // Auto-size columns
        for (int i = 0; i < columns.length; i++) {
            sheet.autoSizeColumn(i);
        }

        // Write to byte array
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        workbook.write(baos);
        workbook.close();

        return baos.toByteArray();
    }

    private String formatDateForExport(LocalDate date) {
        if (date == null) return "";
        // Format as MM-DD-YYYY
        return String.format("%02d-%02d-%d", date.getMonthValue(), date.getDayOfMonth(), date.getYear());
    }

    // ==================== GET ALL RECORDS FOR A PROVIDER ====================

    @GetMapping("/provider/{providerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEADER', 'GROUP_MGR')")
    public ResponseEntity<?> getCredentialingByProvider(@PathVariable Long providerId) {
        try {
            List<ProviderCredentialing> records = credentialingRepository.findByProviderId(providerId);

            Map<String, Object> response = new HashMap<>();
            response.put("records", records);
            response.put("total", records.size());
            response.put("providerId", providerId);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch credentialing records: " + e.getMessage()));
        }
    }

    // ==================== GET ALL RECORDS FOR A GROUP ====================

    @GetMapping("/group/{groupId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEADER', 'GROUP_MGR')")
    public ResponseEntity<?> getCredentialingByGroup(@PathVariable Long groupId) {
        try {
            List<ProviderCredentialing> records = credentialingRepository.findByGroupId(groupId);

            Map<String, Object> response = new HashMap<>();
            response.put("records", records);
            response.put("total", records.size());
            response.put("groupId", groupId);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch credentialing records: " + e.getMessage()));
        }
    }

    // ==================== GET SINGLE RECORD BY ID ====================

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEADER', 'GROUP_MGR')")
    public ResponseEntity<?> getCredentialingById(@PathVariable Long id) {
        try {
            Optional<ProviderCredentialing> record = credentialingRepository.findById(id);

            if (record.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Credentialing record not found with id: " + id));
            }

            return ResponseEntity.ok(record.get());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch credentialing record: " + e.getMessage()));
        }
    }

    // ==================== CREATE NEW CREDENTIALING RECORD ====================

    // Add this method to ProviderCredentialingController.java

// ==================== GET HIERARCHICAL GROUPED DATA ====================

    @GetMapping("/group/{groupId}/hierarchy")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEADER', 'GROUP_MGR')")
    public ResponseEntity<?> getHierarchicalData(@PathVariable Long groupId) {
        try {
            List<ProviderCredentialing> records = credentialingRepository.findByGroupId(groupId);

            if (records.isEmpty()) {
                return ResponseEntity.ok(Map.of(
                        "groupId", groupId,
                        "totalPayors", 0,
                        "totalPlans", 0,
                        "hierarchy", new ArrayList<>()
                ));
            }

            // Sort records: by Payer -> LOB -> Network -> Product -> Plan
            records.sort(Comparator
                    .comparing((ProviderCredentialing r) -> r.getPayerName() != null ? r.getPayerName() : "")
                    .thenComparing(r -> r.getLob() != null ? r.getLob() : "")
                    .thenComparing(r -> r.getNetwork() != null ? r.getNetwork() : "")
                    .thenComparing(r -> r.getProduct() != null ? r.getProduct() : "")
                    .thenComparing(r -> r.getPlan() != null ? r.getPlan() : "")
            );

            // Build hierarchical structure
            List<Map<String, Object>> hierarchy = new ArrayList<>();
            String currentPayer = null;
            String currentLob = null;
            String currentNetwork = null;
            String currentProduct = null;

            Map<String, Object> currentPayerMap = null;
            Map<String, Object> currentLobMap = null;
            Map<String, Object> currentNetworkMap = null;
            Map<String, Object> currentProductMap = null;
            List<Map<String, Object>> currentPlans = null;

            for (ProviderCredentialing record : records) {
                String payer = record.getPayerName() != null ? record.getPayerName() : "";
                String lob = record.getLob() != null ? record.getLob() : "";
                String network = record.getNetwork() != null ? record.getNetwork() : "";
                String product = record.getProduct() != null ? record.getProduct() : "";

                // New payer
                if (!payer.equals(currentPayer)) {
                    currentPayer = payer;
                    currentLob = null;
                    currentNetwork = null;
                    currentProduct = null;

                    currentPayerMap = new LinkedHashMap<>();
                    currentPayerMap.put("payerName", payer);
                    currentPayerMap.put("lobs", new ArrayList<>());
                    hierarchy.add(currentPayerMap);
                }

                // New LOB
                if (!lob.equals(currentLob)) {
                    currentLob = lob;
                    currentNetwork = null;
                    currentProduct = null;

                    currentLobMap = new LinkedHashMap<>();
                    currentLobMap.put("lob", lob);
                    currentLobMap.put("networks", new ArrayList<>());
                    ((List<Map<String, Object>>) currentPayerMap.get("lobs")).add(currentLobMap);
                }

                // New Network
                if (!network.equals(currentNetwork)) {
                    currentNetwork = network;
                    currentProduct = null;

                    currentNetworkMap = new LinkedHashMap<>();
                    currentNetworkMap.put("network", network);
                    currentNetworkMap.put("products", new ArrayList<>());
                    ((List<Map<String, Object>>) currentLobMap.get("networks")).add(currentNetworkMap);
                }

                // New Product
                if (!product.equals(currentProduct)) {
                    currentProduct = product;

                    currentProductMap = new LinkedHashMap<>();
                    currentProductMap.put("product", product);
                    currentProductMap.put("plans", new ArrayList<>());
                    ((List<Map<String, Object>>) currentNetworkMap.get("products")).add(currentProductMap);
                }

                // Add plan
                Map<String, Object> planMap = new LinkedHashMap<>();
                planMap.put("plan", record.getPlan() != null ? record.getPlan() : "");
                planMap.put("id", record.getId());
                planMap.put("status", record.getStatus());
                planMap.put("managingEntity", record.getManagingEntity());
                planMap.put("applicationDate", record.getApplicationDate());
                planMap.put("credentialingEffectiveDate", record.getCredentialingEffectiveDate());
                planMap.put("linkEffectiveDate", record.getLinkEffectiveDate());
                planMap.put("recredentialingDate", record.getRecredentialingDate());
                planMap.put("terminationDate", record.getTerminationDate());
                planMap.put("providerRep", record.getProviderRep());
                planMap.put("contractingRep", record.getContractingRep());

                ((List<Map<String, Object>>) currentProductMap.get("plans")).add(planMap);
            }

            // Calculate totals
            int totalPayors = hierarchy.size();
            int totalPlans = 0;
            for (Map<String, Object> payerMap : hierarchy) {
                List<Map<String, Object>> lobs = (List<Map<String, Object>>) payerMap.get("lobs");
                for (Map<String, Object> lobMap : lobs) {
                    List<Map<String, Object>> networks = (List<Map<String, Object>>) lobMap.get("networks");
                    for (Map<String, Object> networkMap : networks) {
                        List<Map<String, Object>> products = (List<Map<String, Object>>) networkMap.get("products");
                        for (Map<String, Object> productMap : products) {
                            List<Map<String, Object>> plans = (List<Map<String, Object>>) productMap.get("plans");
                            totalPlans += plans.size();
                        }
                    }
                }
            }

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("groupId", groupId);
            response.put("totalPayors", totalPayors);
            response.put("totalPlans", totalPlans);
            response.put("hierarchy", hierarchy);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch hierarchical data: " + e.getMessage()));
        }
    }

    @PostMapping("/create")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEADER')")
    public ResponseEntity<?> createCredentialing(@RequestBody Map<String, Object> request, Principal principal) {
        try {
            // Get the current user
            AppUser currentUser = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Validate required fields
            if (request.get("providerId") == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Provider ID is required"));
            }

            if (request.get("payerName") == null || request.get("payerName").toString().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Payer Name is required"));
            }

            Long groupId = request.get("groupId") != null ? Long.valueOf(request.get("groupId").toString()) : null;
            String payerName = request.get("payerName").toString().trim();
            String lob = request.get("lob") != null ? request.get("lob").toString() : null;
            String network = request.get("network") != null ? request.get("network").toString() : null;
            String product = request.get("product") != null ? request.get("product").toString() : null;
            String plan = request.get("plan") != null ? request.get("plan").toString() : null;

            // ===== DUPLICATE CHECK =====
            // Check if this exact combination already exists
            // We only check for duplicates when creating a new record (not editing)
            if (request.get("id") == null) {
                boolean exists = credentialingRepository.existsByGroupIdAndPayerNameAndLobAndNetworkAndProductAndPlan(
                        groupId,
                        payerName,
                        lob,
                        network,
                        product,
                        plan
                );

                if (exists) {
                    Map<String, Object> errorResponse = new LinkedHashMap<>();
                    errorResponse.put("error", "This combination already exists!");
                    errorResponse.put("message", "A record with the same Payer, LOB, Network, Product, and Plan already exists for this group.");
                    errorResponse.put("duplicate", true);
                    return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
                }
            }

            // Create new record
            ProviderCredentialing record = new ProviderCredentialing();

            // Set required fields
            record.setProviderId(Long.valueOf(request.get("providerId").toString()));
            record.setPayerName(payerName);

            // Set optional fields
            if (groupId != null) {
                record.setGroupId(groupId);
            }

            if (lob != null) {
                record.setLob(lob);
            }

            if (network != null) {
                record.setNetwork(network);
            }

            if (product != null) {
                record.setProduct(product);
            }

            if (plan != null) {
                record.setPlan(plan);
            }

            if (request.get("status") != null && !request.get("status").toString().isEmpty()) {
                record.setStatus(request.get("status").toString());
            }

            if (request.get("managingEntity") != null && !request.get("managingEntity").toString().isEmpty()) {
                record.setManagingEntity(request.get("managingEntity").toString());
            }

            // Set dates
            if (request.get("applicationDate") != null && !request.get("applicationDate").toString().isEmpty()) {
                record.setApplicationDate(java.time.LocalDate.parse(request.get("applicationDate").toString()));
            }

            if (request.get("credentialingEffectiveDate") != null && !request.get("credentialingEffectiveDate").toString().isEmpty()) {
                record.setCredentialingEffectiveDate(java.time.LocalDate.parse(request.get("credentialingEffectiveDate").toString()));
            }

            if (request.get("linkEffectiveDate") != null && !request.get("linkEffectiveDate").toString().isEmpty()) {
                record.setLinkEffectiveDate(java.time.LocalDate.parse(request.get("linkEffectiveDate").toString()));
            }

            if (request.get("recredentialingDate") != null && !request.get("recredentialingDate").toString().isEmpty()) {
                record.setRecredentialingDate(java.time.LocalDate.parse(request.get("recredentialingDate").toString()));
            }

            if (request.get("terminationDate") != null && !request.get("terminationDate").toString().isEmpty()) {
                record.setTerminationDate(java.time.LocalDate.parse(request.get("terminationDate").toString()));
            }

            if (request.get("providerRep") != null && !request.get("providerRep").toString().isEmpty()) {
                record.setProviderRep(request.get("providerRep").toString());
            }

            if (request.get("contractingRep") != null && !request.get("contractingRep").toString().isEmpty()) {
                record.setContractingRep(request.get("contractingRep").toString());
            }

            // Set audit fields
            record.setCreatedAt(LocalDateTime.now());
            record.setUpdatedAt(LocalDateTime.now());
            record.setCreatedBy(currentUser.getId());

            // Save the record
            ProviderCredentialing savedRecord = credentialingRepository.save(record);

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("message", "Credentialing record created successfully");
            response.put("record", savedRecord);
            response.put("id", savedRecord.getId());

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create credentialing record: " + e.getMessage()));
        }
    }

    // ==================== UPDATE CREDENTIALING RECORD ====================

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEADER')")
    public ResponseEntity<?> updateCredentialing(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        try {
            // Find existing record
            Optional<ProviderCredentialing> existingRecordOpt = credentialingRepository.findById(id);

            if (existingRecordOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Credentialing record not found with id: " + id));
            }

            ProviderCredentialing record = existingRecordOpt.get();

            // Update fields if provided
            if (request.get("payerName") != null && !request.get("payerName").toString().isEmpty()) {
                record.setPayerName(request.get("payerName").toString().trim());
            }

            if (request.get("groupId") != null && !request.get("groupId").toString().isEmpty()) {
                record.setGroupId(Long.valueOf(request.get("groupId").toString()));
            }

            if (request.get("lob") != null && !request.get("lob").toString().isEmpty()) {
                record.setLob(request.get("lob").toString());
            }

            if (request.get("network") != null && !request.get("network").toString().isEmpty()) {
                record.setNetwork(request.get("network").toString());
            }

            if (request.get("product") != null && !request.get("product").toString().isEmpty()) {
                record.setProduct(request.get("product").toString());
            }

            if (request.get("plan") != null && !request.get("plan").toString().isEmpty()) {
                record.setPlan(request.get("plan").toString());
            }

            if (request.get("status") != null && !request.get("status").toString().isEmpty()) {
                record.setStatus(request.get("status").toString());
            }

            if (request.get("managingEntity") != null && !request.get("managingEntity").toString().isEmpty()) {
                record.setManagingEntity(request.get("managingEntity").toString());
            }

            // Update dates
            if (request.get("applicationDate") != null && !request.get("applicationDate").toString().isEmpty()) {
                record.setApplicationDate(java.time.LocalDate.parse(request.get("applicationDate").toString()));
            } else if (request.get("applicationDate") != null && request.get("applicationDate").toString().isEmpty()) {
                record.setApplicationDate(null);
            }

            if (request.get("credentialingEffectiveDate") != null && !request.get("credentialingEffectiveDate").toString().isEmpty()) {
                record.setCredentialingEffectiveDate(java.time.LocalDate.parse(request.get("credentialingEffectiveDate").toString()));
            } else if (request.get("credentialingEffectiveDate") != null && request.get("credentialingEffectiveDate").toString().isEmpty()) {
                record.setCredentialingEffectiveDate(null);
            }

            if (request.get("linkEffectiveDate") != null && !request.get("linkEffectiveDate").toString().isEmpty()) {
                record.setLinkEffectiveDate(java.time.LocalDate.parse(request.get("linkEffectiveDate").toString()));
            } else if (request.get("linkEffectiveDate") != null && request.get("linkEffectiveDate").toString().isEmpty()) {
                record.setLinkEffectiveDate(null);
            }

            if (request.get("recredentialingDate") != null && !request.get("recredentialingDate").toString().isEmpty()) {
                record.setRecredentialingDate(java.time.LocalDate.parse(request.get("recredentialingDate").toString()));
            } else if (request.get("recredentialingDate") != null && request.get("recredentialingDate").toString().isEmpty()) {
                record.setRecredentialingDate(null);
            }

            if (request.get("terminationDate") != null && !request.get("terminationDate").toString().isEmpty()) {
                record.setTerminationDate(java.time.LocalDate.parse(request.get("terminationDate").toString()));
            } else if (request.get("terminationDate") != null && request.get("terminationDate").toString().isEmpty()) {
                record.setTerminationDate(null);
            }

            if (request.get("providerRep") != null && !request.get("providerRep").toString().isEmpty()) {
                record.setProviderRep(request.get("providerRep").toString());
            }

            if (request.get("contractingRep") != null && !request.get("contractingRep").toString().isEmpty()) {
                record.setContractingRep(request.get("contractingRep").toString());
            }

            // Update audit field
            record.setUpdatedAt(LocalDateTime.now());

            // Save the updated record
            ProviderCredentialing updatedRecord = credentialingRepository.save(record);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Credentialing record updated successfully");
            response.put("record", updatedRecord);
            response.put("id", updatedRecord.getId());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update credentialing record: " + e.getMessage()));
        }
    }

    // ==================== DELETE CREDENTIALING RECORD ====================

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEADER')")
    public ResponseEntity<?> deleteCredentialing(@PathVariable Long id) {
        try {
            // Check if record exists
            if (!credentialingRepository.existsById(id)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Credentialing record not found with id: " + id));
            }

            // Delete the record
            credentialingRepository.deleteById(id);

            return ResponseEntity.ok(Map.of(
                    "message", "Credentialing record deleted successfully",
                    "id", id
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete credentialing record: " + e.getMessage()));
        }
    }

    // ==================== GET CREDENTIALING STATISTICS ====================

    @GetMapping("/stats/provider/{providerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEADER', 'GROUP_MGR')")
    public ResponseEntity<?> getCredentialingStats(@PathVariable Long providerId) {
        try {
            List<ProviderCredentialing> records = credentialingRepository.findByProviderId(providerId);

            long totalRecords = records.size();
            long activeRecords = records.stream()
                    .filter(r -> "Active".equalsIgnoreCase(r.getStatus()))
                    .count();
            long pendingRecords = records.stream()
                    .filter(r -> "Pending".equalsIgnoreCase(r.getStatus()))
                    .count();
            long expiredRecords = records.stream()
                    .filter(r -> "Expired".equalsIgnoreCase(r.getStatus()))
                    .count();

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalRecords", totalRecords);
            stats.put("activeRecords", activeRecords);
            stats.put("pendingRecords", pendingRecords);
            stats.put("expiredRecords", expiredRecords);
            stats.put("providerId", providerId);

            return ResponseEntity.ok(stats);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch credentialing statistics: " + e.getMessage()));
        }
    }

    // ==================== GET RECORDS BY STATUS ====================

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEADER')")
    public ResponseEntity<?> getCredentialingByStatus(@PathVariable String status) {
        try {
            List<ProviderCredentialing> records = credentialingRepository.findByStatus(status);

            Map<String, Object> response = new HashMap<>();
            response.put("records", records);
            response.put("total", records.size());
            response.put("status", status);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch credentialing records: " + e.getMessage()));
        }
    }

    // Add this method to ProviderCredentialingController.java

// ==================== GET HIERARCHICAL DATA FOR A PAYOR ====================

    @GetMapping("/group/{groupId}/payor/{payerName}/flat")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEADER', 'GROUP_MGR')")
    public ResponseEntity<?> getPayorFlatData(@PathVariable Long groupId, @PathVariable String payerName) {
        try {
            List<ProviderCredentialing> records = credentialingRepository.findByGroupIdAndPayerName(groupId, payerName);

            if (records.isEmpty()) {
                return ResponseEntity.ok(Map.of(
                        "payerName", payerName,
                        "totalPlans", 0,
                        "summary", Map.of("active", 0, "pending", 0, "expired", 0),
                        "records", new ArrayList<>()
                ));
            }

            // Sort by hierarchy: LOB -> Network -> Product -> Plan
            records.sort(Comparator
                    .comparing((ProviderCredentialing r) -> r.getLob() != null ? r.getLob() : "")
                    .thenComparing(r -> r.getNetwork() != null ? r.getNetwork() : "")
                    .thenComparing(r -> r.getProduct() != null ? r.getProduct() : "")
                    .thenComparing(r -> r.getPlan() != null ? r.getPlan() : "")
            );

            int activeCount = 0;
            int pendingCount = 0;
            int expiredCount = 0;

            for (ProviderCredentialing record : records) {
                String status = record.getStatus() != null ? record.getStatus().toLowerCase() : "";
                if ("active".equals(status)) activeCount++;
                else if ("pending".equals(status)) pendingCount++;
                else if ("expired".equals(status)) expiredCount++;
            }

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("payerName", payerName);
            response.put("totalPlans", records.size());
            response.put("summary", Map.of(
                    "active", activeCount,
                    "pending", pendingCount,
                    "expired", expiredCount
            ));
            response.put("records", records);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch payor data: " + e.getMessage()));
        }
    }

    // ==================== GET RECORDS EXPIRING SOON ====================

    @GetMapping("/expiring-soon/{providerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEADER', 'GROUP_MGR')")
    public ResponseEntity<?> getExpiringSoon(@PathVariable Long providerId) {
        try {
            java.time.LocalDate today = java.time.LocalDate.now();
            java.time.LocalDate thirtyDaysFromNow = today.plusDays(30);

            List<ProviderCredentialing> records = credentialingRepository
                    .findByRecredentialingDateBetween(today, thirtyDaysFromNow);

            // Filter by providerId
            records = records.stream()
                    .filter(r -> r.getProviderId().equals(providerId))
                    .toList();

            Map<String, Object> response = new HashMap<>();
            response.put("records", records);
            response.put("total", records.size());
            response.put("providerId", providerId);
            response.put("daysWindow", 30);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch expiring records: " + e.getMessage()));
        }
    }

    // Add this method to ProviderCredentialingController.java

// ==================== GET PAYOR SUMMARY LIST FOR A GROUP ====================

    @GetMapping("/group/{groupId}/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEAM_LEADER', 'GROUP_MGR')")
    public ResponseEntity<?> getPayorSummary(@PathVariable Long groupId) {
        try {
            List<Object[]> results = credentialingRepository.findSummaryByGroupId(groupId);

            List<Map<String, Object>> payorSummaries = new ArrayList<>();

            for (Object[] row : results) {
                String payerName = (String) row[0];
                Long totalPlans = (Long) row[1];
                Long activeCount = (Long) row[2];
                Long pendingCount = (Long) row[3];
                Long expiredCount = (Long) row[4];

                Map<String, Object> summary = new LinkedHashMap<>();
                summary.put("payerName", payerName);
                summary.put("totalPlans", totalPlans);
                summary.put("active", activeCount != null ? activeCount : 0);
                summary.put("pending", pendingCount != null ? pendingCount : 0);
                summary.put("expired", expiredCount != null ? expiredCount : 0);

                payorSummaries.add(summary);
            }

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("groupId", groupId);
            response.put("payors", payorSummaries);
            response.put("totalPayors", payorSummaries.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch payor summary: " + e.getMessage()));
        }
    }
}