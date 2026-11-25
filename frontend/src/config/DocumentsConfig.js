// Document Type Configuration
export const DOCUMENT_RULES = {
  AFFILIATE_ARRANGEMENT: {
    type: "multiple",
    behavior: "append",
    maxVersions: 10,
    label: "Affiliate Arrangements",
    icon: "🤝",
    required: false
},
  DIPLOMA: {
    type: "single",
    behavior: "replace",
    trackExpiry: false,
    label: "Medical School Diploma",
    icon: "🎓",
    required: true
  },
  LICENSE: { 
    type: "single", 
    behavior: "replace", 
    trackExpiry: true,
    label: "State Medical License",
    icon: "📜",
    required: true,
    isDynamic: true,
    matches: (fileType) => fileType.startsWith("LICENSE_")
  },
  MEDICAL_LICENSE: { 
    type: "single", 
    behavior: "replace", 
    trackExpiry: true,
    label: "Medical License",
    icon: "🩺",
    required: true
  },
  DEA_CERTIFICATE: { 
    type: "single", 
    behavior: "replace", 
    trackExpiry: true,
    label: "DEA Certificate",
    icon: "📋",
    required: true
  },
  BOARD_CERTIFICATION: { 
    type: "single", 
    behavior: "replace", 
    trackExpiry: true,
    label: "Board Certification",
    icon: "🎓",
    required: true
  },
  W9_FORM: { 
    type: "single", 
    behavior: "replace", 
    trackExpiry: false,
    label: "W-9 Form",
    icon: "📄",
    required: true
  },
  CAQH_ATTESTATION: { 
    type: "single", 
    behavior: "replace", 
    trackExpiry: true,
    label: "CAQH Attestation",
    icon: "✅",
    required: true
  },
  DRIVERS_LICENSE: { 
    type: "single", 
    behavior: "replace", 
    trackExpiry: true,
    label: "Driver's License",
    icon: "🪪",
    required: true
  },
  MALPRACTICE_INSURANCE: { 
    type: "single", 
    behavior: "replace", 
    trackExpiry: true,
    label: "Malpractice Insurance",
    icon: "🛡️",
    required: true
  },
  CURRICULUM_VITAE: { 
    type: "multiple", 
    behavior: "append", 
    maxVersions: 10,
    label: "Curriculum Vitae",
    icon: "📝",
    required: true
  },
  PEER_REFERENCES: { 
    type: "multiple", 
    behavior: "append", 
    maxVersions: 5,
    label: "Peer References",
    icon: "👥",
    required: false
  },
  CONTRACTS: { 
    type: "multiple", 
    behavior: "append", 
    maxVersions: 20,
    label: "Contracts",
    icon: "📑",
    required: false
  },
  HOSPITAL_PRIVILEGES: { 
    type: "multiple", 
    behavior: "append", 
    maxVersions: 10,
    label: "Hospital Privileges",
    icon: "🏥",
    required: false
  },
  COLLABORATIVE_AGREEMENT: { 
    type: "multiple", 
    behavior: "append", 
    maxVersions: 5,
    label: "Collaborative Agreement",
    icon: "🤝",
    required: false
  },
  EDUCATION_DOCUMENTS: { 
    type: "multiple", 
    behavior: "append", 
    maxVersions: 10,
    label: "Education Documents",
    icon: "🎓",
    required: true
  },
  PASSPORT: { 
    type: "single", 
    behavior: "replace", 
    trackExpiry: true,
    label: "Passport",
    icon: "🛂",
    required: false
  },
  STATE_ID: { 
    type: "single", 
    behavior: "replace", 
    trackExpiry: true,
    label: "State ID",
    icon: "🆔",
    required: false
  },
  VISA: { 
    type: "single", 
    behavior: "replace", 
    trackExpiry: true,
    label: "Visa",
    icon: "✈️",
    required: false
  },
  BACKGROUND_CHECK: { 
    type: "single", 
    behavior: "replace", 
    trackExpiry: false,
    label: "Background Check",
    icon: "🔍",
    required: false
  },
  RESIDENCY_CERT: { 
    type: "single", 
    behavior: "replace", 
    trackExpiry: false,
    label: "Residency Certificate",
    icon: "📜",
    required: false
  },
  FELLOWSHIP_CERT: { 
    type: "single", 
    behavior: "replace", 
    trackExpiry: false,
    label: "Fellowship Certificate",
    icon: "📜",
    required: false
  },
  INTERNSHIP_CERT: {
    type: "single",
    behavior: "replace",
    trackExpiry: false,
    label: "Internship Certificate",
    icon: "📜",
    required: false
  },
  ATTENDING_CERT: {
    type: "single",
    behavior: "replace",
    trackExpiry: false,
    label: "Attending Certificate",
    icon: "📜",
    required: false
  },
  BLS_CERT: { 
    type: "single", 
    behavior: "replace", 
    trackExpiry: true,
    label: "BLS Certification",
    icon: "❤️",
    required: true
  },
  ACLS_CERT: { 
    type: "single", 
    behavior: "replace", 
    trackExpiry: true,
    label: "ACLS Certification",
    icon: "🫀",
    required: false
  },
  PALS_CERT: { 
    type: "single", 
    behavior: "replace", 
    trackExpiry: true,
    label: "PALS Certification",
    icon: "👶",
    required: false
  },
  ATLS_CERT: { 
    type: "single", 
    behavior: "replace", 
    trackExpiry: true,
    label: "ATLS Certification",
    icon: "🚑",
    required: false
  },
  CMS_855I: { 
    type: "single", 
    behavior: "replace", 
    trackExpiry: false,
    label: "CMS-855I",
    icon: "📋",
    required: false
  },
  CMS_855R: { 
    type: "single", 
    behavior: "replace", 
    trackExpiry: false,
    label: "CMS-855R",
    icon: "📋",
    required: false
  },
  VOIDED_CHECK: { 
    type: "single", 
    behavior: "replace", 
    trackExpiry: false,
    label: "Voided Check",
    icon: "💳",
    required: false
  },
  PECOS_ENROLLMENT: { 
    type: "single", 
    behavior: "replace", 
    trackExpiry: true,
    label: "PECOS Enrollment",
    icon: "📝",
    required: false
  },
  MEDICAID_APPLICATION: { 
    type: "single", 
    behavior: "replace", 
    trackExpiry: true,
    label: "Medicaid Application",
    icon: "📝",
    required: false
  },
  COMMERCIAL_PAYOR: { 
    type: "single", 
    behavior: "replace", 
    trackExpiry: true,
    label: "Commercial Payor App",
    icon: "🏢",
    required: false
  }
};

// Get document rule by type
export const getDocumentRule = (fileType) => {
  // First check exact match
  if (DOCUMENT_RULES[fileType]) {
    return DOCUMENT_RULES[fileType];
  }
  
  // Check dynamic rules
  for (const key of Object.keys(DOCUMENT_RULES)) {
    const rule = DOCUMENT_RULES[key];
    if (rule.isDynamic && rule.matches && rule.matches(fileType)) {
      return { 
        ...rule, 
        label: `${rule.label} (${fileType.replace("LICENSE_", "")})`,
        originalType: key
      };
    }
  }
  
  // Default fallback
  return { type: "single", behavior: "replace", label: fileType };
};

// Check if document type is single (replace only)
export const isSingleDocumentType = (fileType) => {
  const rule = getDocumentRule(fileType);
  return rule.type === "single";
};

// Get all document categories
export const getDocumentCategories = () => {
  return {
    IDENTITY_LEGAL: {
      name: "Identity & Legal Documents",
      icon: "🆔",
      order: 1,
      documents: [
        { id: "DRIVERS_LICENSE", name: "Driver's License", required: true },
        { id: "PASSPORT", name: "Passport", required: false },
        { id: "STATE_ID", name: "State ID", required: false },
        { id: "VISA", name: "Visa / Work Authorization", required: false },
        { id: "BACKGROUND_CHECK", name: "Background Check Consent", required: false }
      ]
    },
    LICENSES_CERTIFICATIONS: {
  name: "Licenses & Certifications",
  icon: "🩺",
  order: 2,
  documents: [
    { id: "MEDICAL_LICENSE", name: "Medical License", required: true },
    { id: "DEA_CERTIFICATE", name: "DEA Certificate", required: true },
    { id: "BOARD_CERTIFICATION", name: "Board Certification", required: true },
    { id: "DIPLOMA", name: "Medical School Diploma", required: true },  // ← Changed from MEDICAL_DIPLOMA to DIPLOMA
    { id: "RESIDENCY_CERT", name: "Residency Certificate", required: false },
    { id: "FELLOWSHIP_CERT", name: "Fellowship Certificate", required: false },
    { id: "INTERNSHIP_CERT", name: "Internship Certificate", required: false },
    { id: "ATTENDING_CERT", name: "Attending Certificate", required: false },
    { id: "BLS_CERT", name: "BLS Certification", required: true },
    { id: "ACLS_CERT", name: "ACLS Certification", required: false },
    { id: "PALS_CERT", name: "PALS Certification", required: false },
    { id: "ATLS_CERT", name: "ATLS Certification", required: false }
  ]
},
    INSURANCE_FINANCIAL: {
      name: "Insurance & Financial",
      icon: "💰",
      order: 3,
      documents: [
        { id: "MALPRACTICE_INSURANCE", name: "Malpractice Insurance", required: true },
        { id: "W9_FORM", name: "W-9 Form", required: true },
        { id: "CMS_855I", name: "CMS-855I", required: false },
        { id: "CMS_855R", name: "CMS-855R", required: false },
        { id: "CAQH_ATTESTATION", name: "CAQH Attestation", required: true },
        { id: "VOIDED_CHECK", name: "Voided Check / EFT", required: false }
      ]
    },
    PRACTICE_AFFILIATIONS: {
      name: "Practice & Affiliations",
      icon: "🏥",
      order: 4,
      documents: [
        { id: "CURRICULUM_VITAE", name: "Curriculum Vitae (CV)", required: true },
        { id: "HOSPITAL_PRIVILEGES", name: "Hospital Privileges", required: false },
        { id: "COLLABORATIVE_AGREEMENT", name: "Collaborative Agreement", required: false },
        { id: "PEER_REFERENCES", name: "Peer References", required: false },
        { id: "EMPLOYMENT_CONTRACT", name: "Employment Contract", required: false },
        { id: "AFFILIATE_ARRANGEMENT", name: "Affiliate Arrangements", required: false }
      ]
    },
    ENROLLMENT_APPLICATIONS: {
      name: "Enrollment Applications",
      icon: "📝",
      order: 5,
      documents: [
        { id: "PECOS_ENROLLMENT", name: "PECOS Enrollment", required: false },
        { id: "MEDICAID_APPLICATION", name: "Medicaid Application", required: false },
        { id: "COMMERCIAL_PAYOR", name: "Commercial Payor App", required: false }
      ]
    }
  };
};
