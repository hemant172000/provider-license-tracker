import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const SummaryReviewForm = ({ onComplete, onNext, initialData, loading: isLoading }) => {
  const [allData, setAllData] = useState({
    personalInfo: null,
    licenses: [],
    cdsLicenses: null,
    boardCertifications: [],
    education: null,
    practiceLocations: [],
    workHistory: [],
    malpractice: null,
    payerIds: [],
    hospitalPrivileges: [],
    affiliateArrangements: [],
    
    uploadedFiles: []
  });
  const [loading, setLoading] = useState(true);

  const getDocumentTypeLabel = (fileType) => {
    const typeMap = {
      'DIPLOMA': 'Medical School Diploma',
      'UNDERGRAD_DIPLOMA': 'Undergraduate Diploma',
      'BOARD_CERTIFICATION': 'Board Certification',
      'BLS_CERT': 'BLS Certification',
      'ACLS_CERT': 'ACLS Certification',
      'PALS_CERT': 'PALS Certification',
      'ATLS_CERT': 'ATLS Certification',
      'DEA_CERTIFICATE': 'DEA Certificate',
      'MALPRACTICE_INSURANCE': 'Malpractice Insurance',
      'CURRICULUM_VITAE': 'CV / Resume',
      'HOSPITAL_PRIVILEGES': 'Hospital Privileges',
      
      'ECFMG_CERTIFICATE': 'ECFMG Certificate',
      'AFFILIATE_ARRANGEMENT': 'Affiliate Arrangement'
    };
    
    if (fileType && fileType.startsWith('LICENSE_')) {
      const stateCode = fileType.replace('LICENSE_', '');
      return `Medical License (${stateCode})`;
    }
    
    return typeMap[fileType] || fileType?.replace(/_/g, ' ') || fileType;
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const profileResponse = await API.get('/providers/my-profile');
      const providerId = profileResponse.data.id;
      
      const [
        personalInfo,
        licenses,
        cdsLicenses,
        boardCertifications,
        education,
        practiceLocations,
        workHistory,
        malpractice,
        payerIds,
        hospitalPrivileges,
        affiliateArrangements,
        peerReferences,
        uploadedFiles
      ] = await Promise.all([
        API.get('/provider-profile/personal-info').catch(() => ({ data: null })),
        API.get('/provider-profile/licenses').catch(() => ({ data: [] })),
        API.get('/provider-profile/cds-licenses').catch(() => ({ data: null })),
        API.get('/provider-profile/board-certifications').catch(() => ({ data: [] })),
        API.get('/provider-profile/education').catch(() => ({ data: null })),
        API.get('/provider-profile/practice-locations').catch(() => ({ data: [] })),
        API.get('/provider-profile/work-history').catch(() => ({ data: [] })),
        API.get('/provider-profile/malpractice').catch(() => ({ data: null })),
        API.get('/provider-profile/payer-ids').catch(() => ({ data: [] })),
        API.get('/provider-profile/hospital-privileges').catch(() => ({ data: [] })),
        API.get('/provider-profile/affiliate-arrangements').catch(() => ({ data: [] })),
      
        API.get(`/files/provider/${providerId}`).catch(() => ({ data: { files: [] } }))
      ]);
      
      setAllData({
        personalInfo: personalInfo.data,
        licenses: licenses.data || [],
        cdsLicenses: cdsLicenses.data,
        boardCertifications: boardCertifications.data || [],
        education: education.data,
        practiceLocations: practiceLocations.data || [],
        workHistory: workHistory.data || [],
        malpractice: malpractice.data,
        payerIds: payerIds.data || [],
        hospitalPrivileges: hospitalPrivileges.data || [],
        affiliateArrangements: affiliateArrangements.data || [],
        
        uploadedFiles: uploadedFiles.data?.files || []
      });
    } catch (error) {
      console.error('Error fetching summary data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString();
  };

  const formatMonth = (date) => {
    if (!date) return '—';
    return date.substring(0, 7);
  };

  if (loading) return <div className="loading-spinner">Loading your profile summary...</div>;

  return (
    <div className="summary-review-form">
      <h3><i className="fas fa-clipboard-list"></i> Profile Summary</h3>
      <p>Please review all your information before signing and submitting.</p>

      {/* Personal Information */}
      <div className="summary-section">
        <h4><i className="fas fa-user"></i> Personal Information</h4>
        <div className="summary-grid">
          <div><strong>NPI Number:</strong> {allData.personalInfo?.npiNumber || '—'}</div>
          <div><strong>Date of Birth:</strong> {formatDate(allData.personalInfo?.dateOfBirth)}</div>
          <div><strong>Gender:</strong> {allData.personalInfo?.gender || '—'}</div>
          <div><strong>Address:</strong> {allData.personalInfo?.addressLine1 || '—'}</div>
          <div><strong>City/State/ZIP:</strong> {allData.personalInfo?.city || '—'}, {allData.personalInfo?.state || '—'} {allData.personalInfo?.zipCode || '—'}</div>
          <div><strong>Email:</strong> {allData.personalInfo?.email || '—'}</div>
          <div><strong>Phone:</strong> {allData.personalInfo?.phone || '—'}</div>
        </div>
      </div>

      {/* State Licenses */}
      <div className="summary-section">
        <h4><i className="fas fa-id-card"></i> State Licenses</h4>
        {allData.licenses.length === 0 ? (
          <p className="no-data">No licenses added</p>
        ) : (
          <table className="summary-table">
            <thead>
              <tr>
                <th>State</th><th>License #</th><th>Type</th><th>Expiration Date</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {allData.licenses.map((lic, idx) => (
                <tr key={idx}>
                  <td>{lic.state}</td>
                  <td>{lic.licenseNumber}</td>
                  <td>{lic.licenseType}</td>
                  <td>{formatDate(lic.expirationDate)}</td>
                  <td>{lic.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* DEA/CDS */}
      <div className="summary-section">
        <h4><i className="fas fa-prescription-bottle"></i> DEA & Controlled Substance</h4>
        {allData.cdsLicenses?.doNotPrescribe ? (
          <p>✓ I do not prescribe controlled substances</p>
        ) : (
          <div className="summary-grid">
            <div><strong>DEA Number:</strong> {allData.cdsLicenses?.deaNumber || '—'}</div>
            <div><strong>DEA Expiration:</strong> {formatDate(allData.cdsLicenses?.deaExpirationDate)}</div>
            <div><strong>CDS Number:</strong> {allData.cdsLicenses?.cdsNumber || '—'}</div>
            <div><strong>CDS State:</strong> {allData.cdsLicenses?.cdsState || '—'}</div>
          </div>
        )}
      </div>

      {/* Board Certifications */}
      <div className="summary-section">
        <h4><i className="fas fa-certificate"></i> Certifications</h4>
        {allData.boardCertifications.length === 0 ? (
          <p className="no-data">No certifications added</p>
        ) : (
          <table className="summary-table">
            <thead>
              <tr>
                <th>Type</th><th>Specialty/Organization</th><th>Cert #</th><th>Expiration</th>
              </tr>
            </thead>
            <tbody>
              {allData.boardCertifications.map((cert, idx) => (
                <tr key={idx}>
                  <td>{cert.certType || 'Board Certification'}</td>
                  <td>{cert.specialty || cert.certifyingBoard}</td>
                  <td>{cert.certificationNumber || '—'}</td>
                  <td>{formatDate(cert.expirationDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Education & Training */}
      <div className="summary-section">
        <h4><i className="fas fa-graduation-cap"></i> Education & Training</h4>
        <div className="summary-grid">
          <div><strong>Medical School:</strong> {allData.education?.schoolName || '—'}</div>
          <div><strong>Degree:</strong> {allData.education?.degree || '—'}</div>
          <div><strong>Graduation Date:</strong> {formatMonth(allData.education?.graduationDate)}</div>
          <div><strong>Medical School Address:</strong> {allData.education?.medicalSchoolAddress || '—'}</div>
        </div>
        {allData.education?.undergradSchoolName && (
          <div className="summary-grid" style={{ marginTop: '8px' }}>
            <div><strong>Undergraduate:</strong> {allData.education.undergradSchoolName}</div>
            <div><strong>Degree:</strong> {allData.education.undergradDegree}</div>
            <div><strong>Undergrad Address:</strong> {allData.education.undergradAddress || '—'}</div>
          </div>
        )}
        {allData.education?.hasEcfmg && (
          <div className="summary-grid" style={{ marginTop: '8px' }}>
            <div><strong>ECFMG Number:</strong> {allData.education.ecfmgNumber}</div>
            <div><strong>ECFMG Certified:</strong> {formatDate(allData.education.ecfmgCertificationDate)}</div>
          </div>
        )}
        {allData.education?.residencyFacility && (
          <div><strong>Residency:</strong> {allData.education.residencyFacility} ({allData.education.residencySpecialty})</div>
        )}
        {allData.education?.fellowshipFacility && (
          <div><strong>Fellowship:</strong> {allData.education.fellowshipFacility} ({allData.education.fellowshipSpecialty})</div>
        )}
        {allData.education?.internshipFacility && (
          <div><strong>Internship:</strong> {allData.education.internshipFacility} ({allData.education.internshipSpecialty})</div>
        )}
        {allData.education?.attendingFacility && (
          <div><strong>Attending:</strong> {allData.education.attendingFacility} ({allData.education.attendingSpecialty})</div>
        )}
      </div>

      {/* Practice Locations */}
      <div className="summary-section">
        <h4><i className="fas fa-map-marker-alt"></i> Practice Locations</h4>
        {allData.practiceLocations.length === 0 ? (
          <p className="no-data">No practice locations added</p>
        ) : (
          <table className="summary-table">
            <thead>
              <tr>
                <th>Practice Name</th><th>Address</th><th>Primary?</th><th>Hospitalist?</th>
              </tr>
            </thead>
            <tbody>
              {allData.practiceLocations.map((loc, idx) => (
                <tr key={idx}>
                  <td>{loc.practiceName}</td>
                  <td>{loc.city}, {loc.state}</td>
                  <td>{loc.isPrimary ? '✓' : '—'}</td>
                  <td>{loc.isHospitalist ? '✓' : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Work History */}
      <div className="summary-section">
        <h4><i className="fas fa-briefcase"></i> Work History</h4>
        {allData.workHistory.length === 0 ? (
          <p className="no-data">No work history added</p>
        ) : (
          <table className="summary-table">
            <thead>
              <tr>
                <th>Facility</th><th>Position</th><th>Start Date</th><th>Current?</th>
              </tr>
            </thead>
            <tbody>
              {allData.workHistory.map((work, idx) => (
                <tr key={idx}>
                  <td>{work.facilityName}</td>
                  <td>{work.position}</td>
                  <td>{formatMonth(work.startDate)}</td>
                  <td>{work.isCurrent ? '✓' : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Malpractice Insurance */}
      <div className="summary-section">
        <h4><i className="fas fa-shield-alt"></i> Malpractice Insurance</h4>
        {allData.malpractice ? (
          <div className="summary-grid">
            <div><strong>Carrier:</strong> {allData.malpractice.carrierName}</div>
            <div><strong>Policy #:</strong> {allData.malpractice.policyNumber}</div>
            <div><strong>Per Occurrence:</strong> {allData.malpractice.perOccurrenceLimit || '—'}</div>
            <div><strong>Aggregate:</strong> {allData.malpractice.aggregateLimit || '—'}</div>
            <div><strong>Effective:</strong> {formatDate(allData.malpractice.effectiveDate)}</div>
            <div><strong>Expires:</strong> {formatDate(allData.malpractice.expirationDate)}</div>
          </div>
        ) : (
          <p className="no-data">No malpractice insurance added</p>
        )}
      </div>

      {/* Payer IDs */}
      <div className="summary-section">
        <h4><i className="fas fa-credit-card"></i> Payer IDs</h4>
        {allData.payerIds.length === 0 ? (
          <p className="no-data">No payer IDs added</p>
        ) : (
          <table className="summary-table">
            <thead>
              <tr>
                <th>State</th><th>Type</th><th>Medicare PTAN</th><th>Medicaid ID</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {allData.payerIds.map((payer, idx) => (
                <tr key={idx}>
                  <td>{payer.state}</td>
                  <td>{payer.payerType || payer.type}</td>
                  <td>{payer.medicarePtan || '—'}</td>
                  <td>{payer.medicaidId || '—'}</td>
                  <td>{payer.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Hospital Privileges */}
      <div className="summary-section">
        <h4><i className="fas fa-hospital"></i> Hospital Privileges</h4>
        {allData.hospitalPrivileges.length === 0 ? (
          <p className="no-data">No hospital privileges added</p>
        ) : (
          <table className="summary-table">
            <thead>
              <tr>
                <th>Hospital</th><th>Privilege Type</th><th>Level</th><th>Status</th><th>Primary?</th>
              </tr>
            </thead>
            <tbody>
              {allData.hospitalPrivileges.map((priv, idx) => (
                <tr key={idx}>
                  <td>{priv.hospitalName}</td>
                  <td>{priv.privilegeType}</td>
                  <td>{priv.privilegeLevel}</td>
                  <td>{priv.privilegeStatus || 'Active'}</td>
                  <td>{priv.isPrimaryHospital ? '✓' : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Affiliate Arrangements */}
      <div className="summary-section">
        <h4><i className="fas fa-handshake"></i> Affiliate Arrangements</h4>
        {allData.affiliateArrangements.length === 0 ? (
          <p className="no-data">No affiliate arrangements added</p>
        ) : (
          allData.affiliateArrangements.map((arr, idx) => (
            <div key={idx} className="arrangement-item">
              <strong>{arr.arrangementType === 'INDIVIDUAL' ? 'Individual Provider' : 'Group'}</strong>
              {arr.arrangementType === 'INDIVIDUAL' ? (
                <span> - {arr.firstName} {arr.lastName} ({arr.specialty})</span>
              ) : (
                <span> - {arr.groupName}</span>
              )}
              <br /><small>Description: {arr.arrangementDescription}</small>
            </div>
          ))
        )}
      </div>

      {/* Uploaded Documents */}
      <div className="summary-section">
        <h4><i className="fas fa-file-upload"></i> Uploaded Documents</h4>
        {allData.uploadedFiles.length === 0 ? (
          <p className="no-data">No documents uploaded yet</p>
        ) : (
          <table className="summary-table">
            <thead>
              <tr>
                <th>Document Type</th>
                <th>File Name</th>
                <th>Uploaded Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {allData.uploadedFiles.filter(file => file.isCurrent).map((file, idx) => (
                <tr key={idx}>
                  <td>{getDocumentTypeLabel(file.fileType)}</td>
                  <td>{file.fileName}</td>
                  <td>{new Date(file.uploadedAt).toLocaleDateString()}</td>
                  <td>{file.isCurrent ? '✅ Current' : `Version ${file.version}`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {allData.uploadedFiles.filter(file => !file.isCurrent).length > 0 && (
          <div style={{ marginTop: '12px' }}>
            <p className="no-data" style={{ fontSize: '12px' }}>
              <i className="fas fa-history"></i> Previous versions: {allData.uploadedFiles.filter(file => !file.isCurrent).length} document(s) replaced
            </p>
          </div>
        )}
      </div>

      <div className="summary-footer">
        <p className="attestation-note">
          <i className="fas fa-check-circle"></i> Please verify all information is correct before proceeding to attestation.
        </p>
      </div>

      <button className="continue-btn" onClick={onNext}>
        <i className="fas fa-arrow-right"></i> Proceed to Attestation
      </button>
    </div>
  );
};

export default SummaryReviewForm;