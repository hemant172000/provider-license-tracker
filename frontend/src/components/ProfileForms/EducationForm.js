import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const EducationForm = ({ onComplete, onNext, initialData, loading: isLoading }) => {
  // Medical School
  const [schoolName, setSchoolName] = useState('');
  const [degree, setDegree] = useState('');
  const [graduationDate, setGraduationDate] = useState('');
  
  // Undergraduate Education
  const [undergradSchoolName, setUndergradSchoolName] = useState('');
  const [undergradDegree, setUndergradDegree] = useState('');
  const [undergradGraduationDate, setUndergradGraduationDate] = useState('');
  const [undergradAddress, setUndergradAddress] = useState('');
  const [undergradDiplomaFile, setUndergradDiplomaFile] = useState(null);
  
  // Residency
  const [residencyFacility, setResidencyFacility] = useState('');
  const [residencySpecialty, setResidencySpecialty] = useState('');
  const [residencyStartDate, setResidencyStartDate] = useState('');
  const [residencyEndDate, setResidencyEndDate] = useState('');
  const [residencyCertFile, setResidencyCertFile] = useState(null);
  
  // Fellowship
  const [fellowshipFacility, setFellowshipFacility] = useState('');
  const [fellowshipSpecialty, setFellowshipSpecialty] = useState('');
  const [fellowshipStartDate, setFellowshipStartDate] = useState('');
  const [fellowshipEndDate, setFellowshipEndDate] = useState('');
  const [fellowshipCertFile, setFellowshipCertFile] = useState(null);
  
  // Internship
  const [internshipFacility, setInternshipFacility] = useState('');
  const [internshipSpecialty, setInternshipSpecialty] = useState('');
  const [internshipStartDate, setInternshipStartDate] = useState('');
  const [internshipEndDate, setInternshipEndDate] = useState('');
  const [internshipFile, setInternshipFile] = useState(null);
  
  // Attending
  const [attendingFacility, setAttendingFacility] = useState('');
  const [attendingSpecialty, setAttendingSpecialty] = useState('');
  const [attendingStartDate, setAttendingStartDate] = useState('');
  const [attendingEndDate, setAttendingEndDate] = useState('');
  const [isCurrentAttending, setIsCurrentAttending] = useState(false);
  const [attendingFile, setAttendingFile] = useState(null);
  
  // Diploma file
  const [diplomaFile, setDiplomaFile] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [medicalSchoolAddress, setMedicalSchoolAddress] = useState('');

  // ECFMG (for international medical graduates)
const [hasEcfmg, setHasEcfmg] = useState(false);
const [ecfmgNumber, setEcfmgNumber] = useState('');
const [ecfmgCertificationDate, setEcfmgCertificationDate] = useState('');
const [ecfmgExpirationDate, setEcfmgExpirationDate] = useState('');
const [ecfmgFile, setEcfmgFile] = useState(null);


  useEffect(() => {
    if (initialData && !isLoading) {
      // Medical School
      setSchoolName(initialData.schoolName || '');
      setDegree(initialData.degree || '');
      setGraduationDate(initialData.graduationDate || '');
      setMedicalSchoolAddress(initialData.medicalSchoolAddress || '');
      
      // Undergraduate
      setUndergradSchoolName(initialData.undergradSchoolName || '');
      setUndergradDegree(initialData.undergradDegree || '');
      setUndergradGraduationDate(initialData.undergradGraduationDate || '');
      setUndergradAddress(initialData.undergradAddress || '');
      
      // Residency
      setResidencyFacility(initialData.residencyFacility || '');
      setResidencySpecialty(initialData.residencySpecialty || '');
      setResidencyStartDate(initialData.residencyStartDate || '');
      setResidencyEndDate(initialData.residencyEndDate || '');
      
      // Fellowship
      setFellowshipFacility(initialData.fellowshipFacility || '');
      setFellowshipSpecialty(initialData.fellowshipSpecialty || '');
      setFellowshipStartDate(initialData.fellowshipStartDate || '');
      setFellowshipEndDate(initialData.fellowshipEndDate || '');
      
      // Internship
      setInternshipFacility(initialData.internshipFacility || '');
      setInternshipSpecialty(initialData.internshipSpecialty || '');
      setInternshipStartDate(initialData.internshipStartDate || '');
      setInternshipEndDate(initialData.internshipEndDate || '');
      
      // Attending
      setAttendingFacility(initialData.attendingFacility || '');
      setAttendingSpecialty(initialData.attendingSpecialty || '');
      setAttendingStartDate(initialData.attendingStartDate || '');
      setAttendingEndDate(initialData.attendingEndDate || '');
      setIsCurrentAttending(initialData.isCurrentAttending || false);

      setHasEcfmg(initialData.hasEcfmg || false);
setEcfmgNumber(initialData.ecfmgNumber || '');
setEcfmgCertificationDate(initialData.ecfmgCertificationDate || '');
setEcfmgExpirationDate(initialData.ecfmgExpirationDate || '');
    }
  }, [initialData, isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const fd = new FormData();
    
    // Medical School
    fd.append('schoolName', schoolName);
    fd.append('degree', degree);
    fd.append('graduationDate', graduationDate);
    fd.append('medicalSchoolAddress', medicalSchoolAddress);
    // Undergraduate
    fd.append('undergradSchoolName', undergradSchoolName);
    fd.append('undergradDegree', undergradDegree);
    fd.append('undergradGraduationDate', undergradGraduationDate);
    fd.append('undergradAddress', undergradAddress);
    
    // Residency
    fd.append('residencyFacility', residencyFacility);
    fd.append('residencySpecialty', residencySpecialty);
    fd.append('residencyStartDate', residencyStartDate);
    fd.append('residencyEndDate', residencyEndDate);
    
    // Fellowship
    fd.append('fellowshipFacility', fellowshipFacility);
    fd.append('fellowshipSpecialty', fellowshipSpecialty);
    fd.append('fellowshipStartDate', fellowshipStartDate);
    fd.append('fellowshipEndDate', fellowshipEndDate);
    
    // Internship
    fd.append('internshipFacility', internshipFacility);
    fd.append('internshipSpecialty', internshipSpecialty);
    fd.append('internshipStartDate', internshipStartDate);
    fd.append('internshipEndDate', internshipEndDate);
    
    // Attending
    fd.append('attendingFacility', attendingFacility);
    fd.append('attendingSpecialty', attendingSpecialty);
    fd.append('attendingStartDate', attendingStartDate);
    fd.append('attendingEndDate', attendingEndDate);
    fd.append('isCurrentAttending', isCurrentAttending);

    fd.append('hasEcfmg', hasEcfmg);
fd.append('ecfmgNumber', ecfmgNumber);
fd.append('ecfmgCertificationDate', ecfmgCertificationDate);
fd.append('ecfmgExpirationDate', ecfmgExpirationDate);
if (ecfmgFile) fd.append('ecfmgFile', ecfmgFile);
    
    // Files
    if (diplomaFile) fd.append('diploma', diplomaFile);
    if (undergradDiplomaFile) fd.append('undergradDiploma', undergradDiplomaFile);
    if (residencyCertFile) fd.append('residencyCert', residencyCertFile);
    if (fellowshipCertFile) fd.append('fellowshipCert', fellowshipCertFile);
    if (internshipFile) fd.append('internshipCert', internshipFile);
    if (attendingFile) fd.append('attendingCert', attendingFile);
    
    try {
      await API.post('/provider-profile/education', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Education saved successfully!');
      if (onComplete) await onComplete();
      if (onNext) onNext();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) return <div className="loading-spinner">Loading...</div>;

  return (
    <form onSubmit={handleSubmit} className="profile-form">
      <h3><i className="fas fa-graduation-cap"></i> Education & Training</h3>
      
      {/* Undergraduate Education */}
      <h4>Undergraduate Education</h4>
      <div className="form-row">
        <div className="form-group">
          <label>School Name</label>
          <input 
            type="text" 
            value={undergradSchoolName} 
            onChange={e => setUndergradSchoolName(e.target.value)} 
            placeholder="e.g., University of California"
          />
        </div>
        <div className="form-group">
          <label>Degree</label>
          <input 
            type="text" 
            value={undergradDegree} 
            onChange={e => setUndergradDegree(e.target.value)} 
            placeholder="e.g., Bachelor of Science"
          />
        </div>
      </div>

      

      <div className="form-row">
        <div className="form-group">
          <label>Graduation Date</label>
          <input 
            type="month" 
            value={undergradGraduationDate} 
            onChange={e => setUndergradGraduationDate(e.target.value)} 
          />
          <small>Format: YYYY-MM</small>
        </div>
        <div className="form-group">
          <label>School Address</label>
          <input 
            type="text" 
            value={undergradAddress} 
            onChange={e => setUndergradAddress(e.target.value)} 
            placeholder="City, State"
          />
        </div>
        <div className="form-group">
          <label>Diploma</label>
          <input 
            type="file" 
            onChange={e => setUndergradDiplomaFile(e.target.files[0])} 
            accept=".pdf,.jpg,.png" 
          />
        </div>
      </div>

      {/* Medical School */}
<h4>Medical School</h4>
<div className="form-row">
  <div className="form-group">
    <label>School Name *</label>
    <input value={schoolName} onChange={e => setSchoolName(e.target.value)} required />
  </div>
  <div className="form-group">
    <label>Degree *</label>
    <input value={degree} onChange={e => setDegree(e.target.value)} placeholder="MD, DO" required />
  </div>
</div>

<div className="form-row">
  <div className="form-group">
    <label>Graduation Date *</label>
    <input type="month" value={graduationDate} onChange={e => setGraduationDate(e.target.value)} required />
    <small>Format: YYYY-MM</small>
  </div>
  <div className="form-group">
    <label>School Address</label>
    <input 
      type="text" 
      value={medicalSchoolAddress} 
      onChange={e => setMedicalSchoolAddress(e.target.value)} 
      placeholder="City, State"
    />
  </div>
  <div className="form-group">
    <label>Diploma</label>
    <input type="file" onChange={e => setDiplomaFile(e.target.files[0])} accept=".pdf,.jpg,.png" />
  </div>
</div>

{/* ECFMG Certification (for International Medical Graduates) */}
<div className="form-group checkbox-group" style={{ marginBottom: '16px', padding: '12px', background: '#f0f0f0', borderRadius: '8px' }}>
  <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
    <input 
      type="checkbox" 
      checked={hasEcfmg} 
      onChange={(e) => setHasEcfmg(e.target.checked)} 
    />
    <span><strong>I am an International Medical Graduate (IMG) with ECFMG Certification</strong></span>
  </label>
</div>

{hasEcfmg && (
  <div style={{ marginBottom: '20px', padding: '16px', background: '#e8f4f8', borderRadius: '8px', border: '1px solid #b8d4e3' }}>
    <h4>ECFMG Certification Details</h4>
    <div className="form-row">
      <div className="form-group">
        <label>ECFMG Number *</label>
        <input 
          type="text" 
          value={ecfmgNumber} 
          onChange={e => setEcfmgNumber(e.target.value)} 
          placeholder="e.g., 0XXXXXX"
          required={hasEcfmg}
        />
        <small>Standard format: 6-7 digits starting with 0</small>
      </div>
      <div className="form-group">
        <label>Certification Date *</label>
        <input 
          type="date" 
          value={ecfmgCertificationDate} 
          onChange={e => setEcfmgCertificationDate(e.target.value)} 
          required={hasEcfmg}
        />
      </div>
    </div>
    
    <div className="form-row">
      <div className="form-group">
        <label>Expiration Date</label>
        <input 
          type="date" 
          value={ecfmgExpirationDate} 
          onChange={e => setEcfmgExpirationDate(e.target.value)} 
        />
        <small>ECFMG certification typically does not expire, but some programs may require a current validation period</small>
      </div>
      <div className="form-group">
        <label>Upload ECFMG Certificate</label>
        <input 
          type="file" 
          onChange={e => setEcfmgFile(e.target.files[0])} 
          accept=".pdf,.jpg,.png" 
        />
        <small>Upload your ECFMG certificate or USMLE transcript</small>
      </div>
    </div>
  </div>
)}

      {/* Residency */}
      <h4>Residency</h4>
      <div className="form-row">
        <div className="form-group">
          <label>Facility</label>
          <input value={residencyFacility} onChange={e => setResidencyFacility(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Specialty</label>
          <input value={residencySpecialty} onChange={e => setResidencySpecialty(e.target.value)} />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>Start Date</label>
          <input type="month" value={residencyStartDate} onChange={e => setResidencyStartDate(e.target.value)} />
        </div>
        <div className="form-group">
          <label>End Date</label>
          <input type="month" value={residencyEndDate} onChange={e => setResidencyEndDate(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Certificate</label>
          <input type="file" onChange={e => setResidencyCertFile(e.target.files[0])} accept=".pdf,.jpg,.png" />
        </div>
      </div>

      {/* Fellowship */}
      <h4>Fellowship (optional)</h4>
      <div className="form-row">
        <div className="form-group">
          <label>Facility</label>
          <input value={fellowshipFacility} onChange={e => setFellowshipFacility(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Specialty</label>
          <input value={fellowshipSpecialty} onChange={e => setFellowshipSpecialty(e.target.value)} />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>Start Date</label>
          <input type="month" value={fellowshipStartDate} onChange={e => setFellowshipStartDate(e.target.value)} />
        </div>
        <div className="form-group">
          <label>End Date</label>
          <input type="month" value={fellowshipEndDate} onChange={e => setFellowshipEndDate(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Certificate</label>
          <input type="file" onChange={e => setFellowshipCertFile(e.target.files[0])} accept=".pdf,.jpg,.png" />
        </div>
      </div>

      {/* Internship */}
      <h4>Internship <span style={{ fontSize: '12px', fontWeight: 'normal', color: '#666' }}>(for Doctors)</span></h4>
      <div className="form-row">
        <div className="form-group">
          <label>Facility/Hospital</label>
          <input type="text" value={internshipFacility} onChange={(e) => setInternshipFacility(e.target.value)} placeholder="e.g., City General Hospital" />
        </div>
        <div className="form-group">
          <label>Specialty</label>
          <input type="text" value={internshipSpecialty} onChange={(e) => setInternshipSpecialty(e.target.value)} placeholder="e.g., Internal Medicine" />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>Start Date</label>
          <input type="month" value={internshipStartDate} onChange={(e) => setInternshipStartDate(e.target.value)} />
        </div>
        <div className="form-group">
          <label>End Date</label>
          <input type="month" value={internshipEndDate} onChange={(e) => setInternshipEndDate(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Completion Certificate</label>
          <input type="file" onChange={(e) => setInternshipFile(e.target.files[0])} accept=".pdf,.jpg,.png" />
        </div>
      </div>

      {/* Attending */}
      <h4>Attending / Post-Fellowship Experience <span style={{ fontSize: '12px', fontWeight: 'normal', color: '#666' }}>(optional)</span></h4>
      <div className="form-row">
        <div className="form-group">
          <label>Facility/Hospital Name</label>
          <input type="text" value={attendingFacility} onChange={(e) => setAttendingFacility(e.target.value)} placeholder="e.g., City Medical Center" />
        </div>
        <div className="form-group">
          <label>Specialty / Department</label>
          <input type="text" value={attendingSpecialty} onChange={(e) => setAttendingSpecialty(e.target.value)} placeholder="e.g., Cardiology" />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>Start Date</label>
          <input type="month" value={attendingStartDate} onChange={(e) => setAttendingStartDate(e.target.value)} />
        </div>
        <div className="form-group">
          <label>End Date</label>
          <input type="month" value={attendingEndDate} onChange={(e) => setAttendingEndDate(e.target.value)} disabled={isCurrentAttending} />
        </div>
        <div className="checkbox-group">
          <label>
            <input type="checkbox" checked={isCurrentAttending} onChange={(e) => setIsCurrentAttending(e.target.checked)} /> 
            I currently work here
          </label>
        </div>
        <div className="form-group">
          <label>Certificate/Verification</label>
          <input type="file" onChange={(e) => setAttendingFile(e.target.files[0])} accept=".pdf,.jpg,.png" />
        </div>
      </div>

      <button type="submit" className="save-btn" disabled={loading}>
        {loading ? 'Saving...' : 'Save & Continue'}
      </button>
    </form>
  );
};

export default EducationForm;