import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const HospitalPrivilegesForm = ({ onComplete, onNext, initialData, loading: isLoading }) => {
  const [privilegeList, setPrivilegeList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [hospitalName, setHospitalName] = useState('');
  const [privilegeType, setPrivilegeType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCurrent, setIsCurrent] = useState(true);
  const [department, setDepartment] = useState('');
  const [isPrimaryHospital, setIsPrimaryHospital] = useState(false);
  const [privilegeLevel, setPrivilegeLevel] = useState('');
  const [privilegeDescription, setPrivilegeDescription] = useState('');
  const [patientPercentage, setPatientPercentage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [noPrivileges, setNoPrivileges] = useState(false);
  const [noPrivilegesReason, setNoPrivilegesReason] = useState('');
  const [privilegeStatus, setPrivilegeStatus] = useState('Active');
  const [hasNonAdmittingAffiliation, setHasNonAdmittingAffiliation] = useState(false);
const [nonAdmittingDescription, setNonAdmittingDescription] = useState('');

  const privilegeTypes = [
    'Active Staff', 'Courtesy Staff', 'Consulting Staff', 'Affiliate Staff',
    'Telemedicine Privileges', 'Surgical Privileges', 'Admitting Privileges'
  ];

  useEffect(() => {
    if (initialData && !isLoading) {
      // Check if initialData has noPrivileges flag (for single record) or is an array
      if (initialData.noPrivileges !== undefined) {
        setNoPrivileges(initialData.noPrivileges);
        setNoPrivilegesReason(initialData.noPrivilegesReason || '');
      }
      if (initialData.privileges && Array.isArray(initialData.privileges)) {
        setPrivilegeList(initialData.privileges);
        setPrivilegeStatus(initialData.privilegeStatus || 'Active');
      } else if (Array.isArray(initialData)) {
        setPrivilegeList(initialData);
      }
    }
  }, [initialData, isLoading]);

  const resetForm = () => {
    setHospitalName('');
    setPrivilegeType('');
    setStartDate('');
    setEndDate('');
    setIsCurrent(true);
    setDepartment('');
    setIsPrimaryHospital(false);
    setPrivilegeLevel('');
    setPrivilegeDescription('');
    setPatientPercentage('');
    setSelectedFile(null);
    setPrivilegeStatus('Active');
    setHasNonAdmittingAffiliation(false);
setNonAdmittingDescription('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const fd = new FormData();
    fd.append('hospitalName', hospitalName);
    fd.append('privilegeType', privilegeType);
    fd.append('startDate', startDate);
    fd.append('endDate', endDate);
    fd.append('isCurrent', isCurrent);
    fd.append('department', department);
    fd.append('isPrimaryHospital', isPrimaryHospital);
    fd.append('privilegeLevel', privilegeLevel);
    fd.append('privilegeStatus', privilegeStatus);
    fd.append('hasNonAdmittingAffiliation', hasNonAdmittingAffiliation);
fd.append('nonAdmittingDescription', nonAdmittingDescription);
    if (privilegeDescription) fd.append('privilegeDescription', privilegeDescription);
    if (patientPercentage) fd.append('patientPercentage', patientPercentage);
    if (selectedFile) fd.append('file', selectedFile);

    try {
      const response = await API.post('/provider-profile/hospital-privilege', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPrivilegeList([...privilegeList, response.data.privilege]);
      setShowForm(false);
      resetForm();
      alert('Hospital privilege added successfully!');
      if (onComplete) await onComplete();
    } catch (error) {
      alert('Error adding privilege: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this hospital privilege?')) {
      try {
        await API.delete(`/provider-profile/hospital-privilege/${id}`);
        setPrivilegeList(privilegeList.filter(p => p.id !== id));
        alert('Privilege deleted successfully');
        if (onComplete) await onComplete();
      } catch (error) {
        alert('Error deleting privilege');
      }
    }
  };

  const handleNoPrivilegesSave = async () => {
    setLoading(true);
    try {
      await API.post('/provider-profile/hospital-privilege/no-privileges', {
        noPrivileges: true,
        noPrivilegesReason: noPrivilegesReason
      });
      alert('No hospital privileges option saved');
      if (onComplete) await onComplete();
      if (onNext) onNext();
    } catch (error) {
      alert('Error saving: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Helper to get privilege level display text
  const getPrivilegeLevelText = (level) => {
    switch(level) {
      case 'FULL_AND_UNRESTRICTED': return 'Full and Unrestricted';
      case 'TEMPORARY': return 'Temporary';
      case 'LIMITED': return 'Limited';
      default: return level;
    }
  };

  if (isLoading) return <div className="loading-spinner">Loading...</div>;

  return (
    <div className="profile-form">
      <h3><i className="fas fa-hospital"></i> Hospital Privileges</h3>
      <p>Add hospitals where you have privileges to practice.</p>

      {/* "No Hospital Privileges" Checkbox - at the TOP */}
      <div className="form-group checkbox-group" style={{ marginBottom: '20px', padding: '12px', background: '#f0f0f0', borderRadius: '8px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input 
            type="checkbox" 
            checked={noPrivileges} 
            onChange={(e) => setNoPrivileges(e.target.checked)}
          />
          <span><strong>I have no hospital privileges or affiliation with no intention of applying for any within the next 6 months.</strong></span>
        </label>
        {noPrivileges && (
          <div className="form-group" style={{ marginTop: '12px' }}>
            <label>Please explain why you have no hospital affiliations:</label>
            <textarea 
              value={noPrivilegesReason} 
              onChange={(e) => setNoPrivilegesReason(e.target.value)} 
              rows="3" 
              placeholder="Explain why you have no hospital privileges or affiliations..."
              required
            />
          </div>
        )}
      </div>

      {/* Non-Admitting Affiliation */}
<div className="form-group checkbox-group" style={{ marginBottom: '16px', padding: '12px', background: '#f9f9f9', borderRadius: '8px' }}>
  <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
    <input 
      type="checkbox" 
      checked={hasNonAdmittingAffiliation} 
      onChange={(e) => setHasNonAdmittingAffiliation(e.target.checked)} 
    />
    <span><strong>I have a non-admitting affiliation</strong></span>
  </label>
</div>

{hasNonAdmittingAffiliation && (
  <div className="form-group">
    <label>Description of Non-Admitting Affiliation *</label>
    <textarea 
      value={nonAdmittingDescription} 
      onChange={(e) => setNonAdmittingDescription(e.target.value)} 
      rows="3" 
      placeholder="Describe your non-admitting affiliation..."
      required
    />
  </div>
)}

      {/* If "No Privileges" is checked, show a different UI */}
      {noPrivileges ? (
        <div className="no-privileges-notice" style={{ marginBottom: '20px', padding: '16px', background: '#e0f7fa', borderRadius: '8px' }}>
          <i className="fas fa-info-circle"></i> You have indicated no hospital privileges or affiliations.
          {noPrivilegesReason && (
            <><br /><strong>Reason provided:</strong> {noPrivilegesReason}</>
          )}
        </div>
      ) : (
        <>
          {/* Existing privileges list */}
          {privilegeList.length > 0 && (
            <div className="items-list">
              {privilegeList.map(privilege => (
                <div key={privilege.id} className="list-item">
                  <div className="item-info">
                    <strong>{privilege.hospitalName}</strong>
                    {privilege.isCurrent && <span className="current-badge">Current</span>}
                    {privilege.isPrimaryHospital && <span className="primary-badge">Primary Hospital</span>}
                    <br />
                    <small>Privilege Type: {privilege.privilegeType}</small>
                    <br />
                    <small>Department: {privilege.department || 'N/A'}</small>
                    <br />
                    <small>Privilege Level: {getPrivilegeLevelText(privilege.privilegeLevel)}</small>
                    {privilege.privilegeDescription && (
                      <><br /><small>Description: {privilege.privilegeDescription}</small></>
                    )}
                    {privilege.patientPercentage && (
                      <><br /><small>Patient %: {privilege.patientPercentage}%</small></>
                    )}
                    {privilege.hasNonAdmittingAffiliation && (
  <><br /><small>Non-Admitting Affiliation: {privilege.nonAdmittingDescription}</small></>
)}
                    <br />
                    <small>Dates: {new Date(privilege.startDate).toLocaleDateString()} - {privilege.isCurrent ? 'Present' : new Date(privilege.endDate).toLocaleDateString()}</small>
                  </div>
                  <button className="delete-btn" onClick={() => handleDelete(privilege.id)}>
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add Privilege Button and Form */}
          {!showForm ? (
            <button className="add-btn" onClick={() => setShowForm(true)}>
              <i className="fas fa-plus"></i> Add Hospital Privilege
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="inline-form">
              {/* ... existing form fields ... */}
              <div className="form-group">
                <label>Hospital Name *</label>
                <input type="text" value={hospitalName} onChange={(e) => setHospitalName(e.target.value)} required />
              </div>

              <div className="form-group">
                <label>Privilege Type *</label>
                <select value={privilegeType} onChange={(e) => setPrivilegeType(e.target.value)} required>
                  <option value="">Select Type</option>
                  {privilegeTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Department</label>
                <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} />
              </div>

              {/* Primary Hospital Checkbox */}
              <div className="checkbox-group" style={{ marginBottom: '12px' }}>
                <label>
                  <input type="checkbox" checked={isPrimaryHospital} onChange={(e) => setIsPrimaryHospital(e.target.checked)} />
                  Is this your primary hospital?
                </label>
              </div>

              {/* Level of Privilege */}
              <div className="form-group">
                <label>Level of Hospital Privilege *</label>
                <select value={privilegeLevel} onChange={(e) => setPrivilegeLevel(e.target.value)} required>
                  <option value="">Select Level</option>
                  <option value="FULL_AND_UNRESTRICTED">Full and Unrestricted</option>
                  <option value="TEMPORARY">Temporary</option>
                  <option value="LIMITED">Limited</option>
                </select>
              </div>

              {/* Conditional fields based on privilege level */}
              {privilegeLevel === 'TEMPORARY' && (
                <div className="form-group">
                  <label>Description of Scope (Temporary Privileges) *</label>
                  <textarea 
                    value={privilegeDescription} 
                    onChange={(e) => setPrivilegeDescription(e.target.value)} 
                    rows="3" 
                    placeholder="Describe the scope of temporary privileges..."
                    required
                  />
                </div>
              )}

              {privilegeLevel === 'LIMITED' && (
                <div className="form-group">
                  <label>Description of Scope (Limited Privileges) *</label>
                  <textarea 
                    value={privilegeDescription} 
                    onChange={(e) => setPrivilegeDescription(e.target.value)} 
                    rows="3" 
                    placeholder="Describe the scope of limited privileges..."
                    required
                  />
                </div>
              )}

              {privilegeLevel === 'FULL_AND_UNRESTRICTED' && (
                <div className="form-group">
                  <label>What percentage of patients admitted here?</label>
                  <input 
                    type="number" 
                    value={patientPercentage} 
                    onChange={(e) => setPatientPercentage(e.target.value)} 
                    placeholder="e.g., 50"
                    min="0"
                    max="100"
                  />
                  <small>Percentage of your patients admitted at this hospital</small>
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date *</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} disabled={isCurrent} />
                </div>
                <div className="checkbox-group">
                  <label>
                    <input type="checkbox" checked={isCurrent} onChange={(e) => setIsCurrent(e.target.checked)} />
                    Current Privileges
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Upload Privileges Letter</label>
                <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} accept=".pdf,.jpg,.jpeg,.png" />
                <small>Required if hospital information is listed above</small>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="save-btn" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Privilege'}
                </button>
              </div>
            </form>
          )}
        </>
      )}

      {/* Save & Continue button */}
      <button 
        className="continue-btn" 
        onClick={noPrivileges ? handleNoPrivilegesSave : onNext}
        style={{ marginTop: '20px' }}
      >
        <i className="fas fa-save"></i> Save & Continue
      </button>
    </div>
  );
};

export default HospitalPrivilegesForm;