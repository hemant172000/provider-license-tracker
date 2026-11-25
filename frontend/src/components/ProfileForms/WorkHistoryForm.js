import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const WorkHistoryForm = ({ onComplete, onNext, initialData, loading: isLoading }) => {
  const [workList, setWorkList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [facilityName, setFacilityName] = useState('');
  const [position, setPosition] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);
  const [address, setAddress] = useState('');
  const [supervisorName, setSupervisorName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [startDateWithGroup, setStartDateWithGroup] = useState('');
  const [cvFile, setCvFile] = useState(null);
  const [cvConfirmation, setCvConfirmation] = useState(false);
  const [cvError, setCvError] = useState('');

  useEffect(() => {
    if (initialData && Array.isArray(initialData) && !isLoading) {
      setWorkList(initialData);
      if (initialData.length > 0 && initialData[0].startDateWithGroup) {
        setStartDateWithGroup(initialData[0].startDateWithGroup);
      }
    }
  }, [initialData, isLoading]);

  const resetForm = () => {
    setFacilityName(''); 
    setPosition(''); 
    setStartDate(''); 
    setEndDate('');
    setIsCurrent(false); 
    setAddress(''); 
    setSupervisorName(''); 
    setDescription('');
    setStartDateWithGroup('');
    setCvFile(null);
    setCvConfirmation(false);
    setCvError('');
  };

  const validateForm = () => {
    // If start date with group is provided, CV and confirmation are required
    if (startDateWithGroup && startDateWithGroup.trim() !== '') {
      if (!cvFile) {
        setCvError('CV file is required when start date is provided');
        return false;
      }
      if (!cvConfirmation) {
        setCvError('Please confirm that your CV includes your start date with the group');
        return false;
      }
    }
    setCvError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    const formData = new FormData();
    formData.append('facilityName', facilityName);
    formData.append('position', position);
    formData.append('startDate', startDate);
    if (!isCurrent && endDate) formData.append('endDate', endDate);
    formData.append('isCurrent', isCurrent);
    formData.append('address', address);
    formData.append('supervisorName', supervisorName);
    formData.append('description', description);
    formData.append('startDateWithGroup', startDateWithGroup || '');
    if (cvFile) formData.append('cvFile', cvFile);
    
    try {
      const res = await API.post('/provider-profile/work-history', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setWorkList([...workList, res.data.work]);
      setShowForm(false);
      resetForm();
      alert('Work history added successfully!');
      if (onComplete) await onComplete();
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      alert('Error: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete work history entry?')) {
      try {
        await API.delete(`/provider-profile/work-history/${id}`);
        setWorkList(workList.filter(w => w.id !== id));
        alert('Work history entry deleted');
        if (onComplete) await onComplete();
      } catch (err) {
        alert('Delete failed');
      }
    }
  };

  if (isLoading) return <div className="loading-spinner">Loading...</div>;

  return (
    <div className="profile-form">
      <h3><i className="fas fa-briefcase"></i> Work History</h3>
      <p>Add your professional work experience. The first entry should be your current position with the group.</p>
      
      {workList.length > 0 && (
        <div className="items-list">
          {workList.map(work => (
            <div key={work.id} className="list-item">
              <div>
                <strong>{work.position}</strong> at {work.facilityName}
                {work.isCurrent && <span className="current-badge">Current</span>}<br />
                <small>{new Date(work.startDate).toLocaleDateString()} – {work.isCurrent ? 'Present' : new Date(work.endDate).toLocaleDateString()}</small><br />
                <small>Supervisor: {work.supervisorName || 'N/A'}</small>
                {work.startDateWithGroup && (
                  <><br /><small>Start date with group: {work.startDateWithGroup}</small></>
                )}
              </div>
              <button className="delete-btn" onClick={() => handleDelete(work.id)}>
                <i className="fas fa-trash-alt"></i>
              </button>
            </div>
          ))}
        </div>
      )}
      
      {!showForm ? (
        <button className="add-btn" onClick={() => setShowForm(true)}>
          <i className="fas fa-plus"></i> Add Work History
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="inline-form">
          <div className="form-row">
            <div className="form-group">
              <label>Facility/Practice Name *</label>
              <input value={facilityName} onChange={e => setFacilityName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Position/Title *</label>
              <input value={position} onChange={e => setPosition(e.target.value)} required />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Start Date *</label>
              <input type="month" value={startDate} onChange={e => setStartDate(e.target.value)} required />
              <small>Format: YYYY-MM</small>
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input type="month" value={endDate} onChange={e => setEndDate(e.target.value)} disabled={isCurrent} />
              <small>Leave empty if current</small>
            </div>
            <div className="checkbox-group">
              <label>
                <input type="checkbox" checked={isCurrent} onChange={e => setIsCurrent(e.target.checked)} /> 
                I currently work here
              </label>
            </div>
          </div>
          
          <div className="form-group">
            <label>Address</label>
            <input value={address} onChange={e => setAddress(e.target.value)} />
          </div>
          
          <div className="form-group">
            <label>Supervisor Name</label>
            <input value={supervisorName} onChange={e => setSupervisorName(e.target.value)} />
          </div>
          
          <div className="form-group">
            <label>Description of Responsibilities</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows="3" />
          </div>
          
          {/* CV and Start Date with Group Section */}
          <div style={{ 
            marginTop: '16px', 
            padding: '16px', 
            background: startDateWithGroup ? '#fff3e0' : '#f9f9f9', 
            borderRadius: '8px', 
            border: startDateWithGroup ? '2px solid #ff9800' : '1px solid #e0e0e0'
          }}>
            <h4 style={{ color: startDateWithGroup ? '#e65100' : '#333' }}>
              <i className="fas fa-calendar-check"></i> Group Start Date Verification
              {startDateWithGroup && <span style={{ marginLeft: '8px', fontSize: '12px', color: '#ff9800' }}>(Required)</span>}
            </h4>
            
            <div className="form-group">
              <label>What is your start date with the group? <span style={{ color: 'red' }}>*</span></label>
              <input 
                type="month" 
                value={startDateWithGroup} 
                onChange={e => {
                  setStartDateWithGroup(e.target.value);
                  setCvError('');
                }} 
                placeholder="YYYY-MM"
              />
              <small>Format: YYYY-MM (e.g., 2024-01)</small>
            </div>
            
            {/* Show warning if start date is provided */}
            {startDateWithGroup && (
              <div style={{ 
                marginBottom: '16px', 
                padding: '10px', 
                background: '#fff3cd', 
                borderLeft: '4px solid #ffc107',
                borderRadius: '4px'
              }}>
                <i className="fas fa-exclamation-triangle" style={{ color: '#ffc107', marginRight: '8px' }}></i>
                <strong>CV Required:</strong> Since you entered a start date, you must upload your CV and confirm it includes this date.
              </div>
            )}
            
            <div className="form-group" style={{ opacity: startDateWithGroup ? 1 : 0.6 }}>
              <label>Upload CV (must include start date) {startDateWithGroup && <span style={{ color: 'red' }}>*</span>}</label>
              <input 
                type="file" 
                onChange={e => {
                  setCvFile(e.target.files[0]);
                  setCvError('');
                }} 
                accept=".pdf,.doc,.docx"
                disabled={!startDateWithGroup}
              />
              <small>Please upload your CV/resume. Make sure it includes your start date with the group.</small>
            </div>
            
            <div className="checkbox-group" style={{ opacity: startDateWithGroup ? 1 : 0.6 }}>
              <label>
                <input 
                  type="checkbox" 
                  checked={cvConfirmation} 
                  onChange={e => {
                    setCvConfirmation(e.target.checked);
                    setCvError('');
                  }} 
                  disabled={!startDateWithGroup}
                />
                I confirm that my uploaded CV includes my start date with the group as stated above
                {startDateWithGroup && <span style={{ color: 'red' }}> *</span>}
              </label>
            </div>
            
            {cvError && (
              <div style={{ 
                marginTop: '12px', 
                padding: '10px', 
                background: '#f8d7da', 
                borderLeft: '4px solid #dc3545',
                borderRadius: '4px',
                color: '#721c24'
              }}>
                <i className="fas fa-times-circle" style={{ marginRight: '8px' }}></i>
                {cvError}
              </div>
            )}
          </div>
          
          <div className="form-actions" style={{ marginTop: '20px' }}>
            <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? 'Saving...' : 'Save Work History'}
            </button>
          </div>
        </form>
      )}
      
      <button className="continue-btn" onClick={onNext}>
        <i className="fas fa-save"></i> Save & Continue
      </button>
    </div>
  );
};

export default WorkHistoryForm;