import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const CdsLicensesForm = ({ onComplete, onNext, initialData, loading: isLoading }) => {
  const [deaNumber, setDeaNumber] = useState('');
  const [deaIssueDate, setDeaIssueDate] = useState('');
  const [deaExpirationDate, setDeaExpirationDate] = useState('');
  const [cdsNumber, setCdsNumber] = useState('');
  const [cdsState, setCdsState] = useState('');
  const [cdsIssueDate, setCdsIssueDate] = useState('');
  const [cdsExpirationDate, setCdsExpirationDate] = useState('');
  const [doNotPrescribe, setDoNotPrescribe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deaFile, setDeaFile] = useState(null);

  const states = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

  useEffect(() => {
    if (initialData && !isLoading) {
      setDeaNumber(initialData.deaNumber || '');
      setDeaIssueDate(initialData.deaIssueDate || '');
      setDeaExpirationDate(initialData.deaExpirationDate || '');
      setCdsNumber(initialData.cdsNumber || '');
      setCdsState(initialData.cdsState || '');
      setCdsIssueDate(initialData.cdsIssueDate || '');
      setCdsExpirationDate(initialData.cdsExpirationDate || '');
      setDoNotPrescribe(initialData.doNotPrescribe || false);
    }
  }, [initialData, isLoading]);

  const handleSaveAndContinue = async () => {
    setLoading(true);
    
    const formData = new FormData();
    formData.append('deaNumber', doNotPrescribe ? '' : deaNumber);
    formData.append('deaIssueDate', doNotPrescribe ? '' : deaIssueDate || '');
    formData.append('deaExpirationDate', doNotPrescribe ? '' : deaExpirationDate || '');
    formData.append('cdsNumber', doNotPrescribe ? '' : cdsNumber || '');
    formData.append('cdsState', doNotPrescribe ? '' : cdsState || '');
    formData.append('cdsIssueDate', doNotPrescribe ? '' : cdsIssueDate || '');
    formData.append('cdsExpirationDate', doNotPrescribe ? '' : cdsExpirationDate || '');
    formData.append('doNotPrescribe', doNotPrescribe);
    if (deaFile) formData.append('deaFile', deaFile);
    
    try {
      await API.post('/provider-profile/cds-licenses', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert(doNotPrescribe ? 'I do not prescribe option saved' : 'DEA/CDS information saved');
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
    <div className="profile-form">
      <h3><i className="fas fa-prescription-bottle"></i> DEA & Controlled Substance</h3>
      
      <div className="form-group checkbox-group" style={{ marginBottom: '20px', padding: '12px', background: '#f0f0f0', borderRadius: '8px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input 
            type="checkbox" 
            checked={doNotPrescribe} 
            onChange={(e) => setDoNotPrescribe(e.target.checked)}
          />
          <span><strong>I do not prescribe controlled substances</strong> (Skip DEA/CDS requirements)</span>
        </label>
        <p style={{ fontSize: '12px', color: '#666', marginTop: '8px', marginLeft: '24px' }}>
          Check this box if you do not prescribe any controlled substances. This will exempt you from DEA/CDS requirements.
        </p>
      </div>
      
      {!doNotPrescribe && (
        <>
          <h4>DEA Registration</h4>
          <div className="form-group">
            <label>DEA Number *</label>
            <input 
              type="text" 
              value={deaNumber} 
              onChange={e => setDeaNumber(e.target.value.toUpperCase())} 
              placeholder="e.g., BS1234567" 
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Issue Date</label>
              <input type="date" value={deaIssueDate} onChange={e => setDeaIssueDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Expiration Date</label>
              <input type="date" value={deaExpirationDate} onChange={e => setDeaExpirationDate(e.target.value)} />
            </div>
          </div>
          
          {/* DEA Certificate Upload */}
          <div className="form-group">
            <label>Upload DEA Certificate</label>
            <input 
              type="file" 
              onChange={e => setDeaFile(e.target.files[0])} 
              accept=".pdf,.jpg,.jpeg,.png" 
            />
            <small>Upload your DEA certificate (required)</small>
          </div>
          
          <h4>Controlled Substance License (CDS) – if applicable</h4>
          <div className="form-row">
            <div className="form-group">
              <label>CDS Number</label>
              <input value={cdsNumber} onChange={e => setCdsNumber(e.target.value)} />
            </div>
            <div className="form-group">
              <label>State</label>
              <select value={cdsState} onChange={e => setCdsState(e.target.value)}>
                <option value="">Select State</option>
                {states.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Issue Date</label>
              <input type="date" value={cdsIssueDate} onChange={e => setCdsIssueDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Expiration Date</label>
              <input type="date" value={cdsExpirationDate} onChange={e => setCdsExpirationDate(e.target.value)} />
            </div>
          </div>
        </>
      )}
      
      <div style={{ display: 'flex', gap: '12px', marginTop: 20 }}>
        <button className="save-btn" onClick={handleSaveAndContinue} disabled={loading}>
          <i className="fas fa-save"></i> {loading ? 'Saving...' : 'Save & Continue'}
        </button>
        <button className="skip-btn" onClick={onNext} type="button" style={{ flex: 1, background: '#f0f0f0' }}>
          Skip (I'll add later)
        </button>
      </div>
    </div>
  );
};

export default CdsLicensesForm;