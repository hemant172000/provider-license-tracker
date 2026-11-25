import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const LicensesForm = ({ onComplete, onNext, initialData, loading: isLoading }) => {
  const [licenseList, setLicenseList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [state, setState] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseType, setLicenseType] = useState('Medical');
  const [issueDate, setIssueDate] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [status, setStatus] = useState('Active');
  const [notes, setNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const statesList = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

  useEffect(() => {
    if (initialData && Array.isArray(initialData) && !isLoading) {
      setLicenseList(initialData);
    }
  }, [initialData, isLoading]);

  const resetForm = () => { setState(''); setLicenseNumber(''); setLicenseType('Medical'); setIssueDate(''); setExpirationDate(''); setStatus('Active'); setNotes(''); setSelectedFile(null); };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append('state', state);
    formData.append('licenseNumber', licenseNumber);
    formData.append('licenseType', licenseType);
    formData.append('issueDate', issueDate);
    formData.append('expirationDate', expirationDate);
    formData.append('status', status);
    formData.append('notes', notes);
    if (selectedFile) formData.append('file', selectedFile);
    try {
      const response = await API.post('/provider-profile/license', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setLicenseList([...licenseList, response.data.license]);
      setShowForm(false);
      resetForm();
      alert('License added');
      if (onComplete) await onComplete();
    } catch (err) { alert('Error: ' + (err.response?.data?.error || err.message)); } finally { setLoading(false); }
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('Delete license?')) {
      try {
        await API.delete(`/provider-profile/license/${id}`);
        setLicenseList(licenseList.filter(l => l.id !== id));
        alert('License deleted');
        if (onComplete) await onComplete();
      } catch (err) { alert('Delete failed'); }
    }
  };
  
  if (isLoading) return <div className="loading-spinner">Loading...</div>;

  return (
    <div className="profile-form">
      <h3><i className="fas fa-id-card"></i> State Licenses</h3>
      {licenseList.map(lic => (
        <div key={lic.id} className="list-item">
          <div><strong>{lic.state}</strong> - {lic.licenseNumber}<br/><small>Expires: {new Date(lic.expirationDate).toLocaleDateString()}</small></div>
          <button className="delete-btn" onClick={() => handleDelete(lic.id)}><i className="fas fa-trash-alt"></i></button>
        </div>
      ))}
      {!showForm ? <button className="add-btn" onClick={() => setShowForm(true)}><i className="fas fa-plus"></i> Add License</button> : (
        <form onSubmit={handleSubmit} className="inline-form">
          <div className="form-row">
            <div className="form-group">
              <label>State *</label>
              <select value={state} onChange={e=>setState(e.target.value)} required>
                <option value="">Select</option>
                {statesList.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>License Number *</label>
              <input value={licenseNumber} onChange={e=>setLicenseNumber(e.target.value)} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>License Type</label>
              <select value={licenseType} onChange={e=>setLicenseType(e.target.value)}>
                <option key="Medical" value="Medical">Medical</option>
                <option key="Osteopathic" value="Osteopathic">Osteopathic</option>
                <option key="Podiatric" value="Podiatric">Podiatric</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={status} onChange={e=>setStatus(e.target.value)}>
                <option key="Active" value="Active">Active</option>
                <option key="Inactive" value="Inactive">Inactive</option>
                <option key="Pending" value="Pending">Pending</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Issue Date</label><input type="date" value={issueDate} onChange={e=>setIssueDate(e.target.value)} /></div>
            <div className="form-group"><label>Expiration Date *</label><input type="date" value={expirationDate} onChange={e=>setExpirationDate(e.target.value)} required /></div>
          </div>
          <div className="form-group"><label>Upload Document</label><input type="file" onChange={e=>setSelectedFile(e.target.files[0])} accept=".pdf,.jpg,.png" /></div>
          <div className="form-group"><label>Notes</label><textarea value={notes} onChange={e=>setNotes(e.target.value)} rows="2" /></div>
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={()=>setShowForm(false)}>Cancel</button>
            <button type="submit" className="save-btn" disabled={loading}>{loading ? 'Saving...' : 'Save License'}</button>
          </div>
        </form>
      )}
      <button className="continue-btn" onClick={onNext}><i className="fas fa-save"></i> Save & Continue</button>
    </div>
  );
};

export default LicensesForm;