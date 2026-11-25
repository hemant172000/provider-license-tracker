import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const PersonalInfoForm = ({ onComplete, onNext, initialData, loading: isLoading }) => {
  const [npiNumber, setNpiNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [ssn, setSsn] = useState('');
  const [gender, setGender] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [primaryLanguage, setPrimaryLanguage] = useState('English');
  const [otherLanguages, setOtherLanguages] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData && !isLoading) {
      setNpiNumber(initialData.npiNumber || '');
      setDateOfBirth(initialData.dateOfBirth || '');
      setSsn(initialData.ssn || '');
      setGender(initialData.gender || '');
      setAddressLine1(initialData.addressLine1 || '');
      setAddressLine2(initialData.addressLine2 || '');
      setCity(initialData.city || '');
      setState(initialData.state || '');
      setZipCode(initialData.zipCode || '');
      setPrimaryLanguage(initialData.primaryLanguage || 'English');
      setOtherLanguages(initialData.otherLanguages || '');
    }
  }, [initialData, isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = { npiNumber, dateOfBirth, ssn, gender, addressLine1, addressLine2, city, state, zipCode, primaryLanguage, otherLanguages };
    try {
      await API.post('/provider-profile/personal-info', formData);
      alert('Personal information saved successfully!');
      if (onComplete) await onComplete();
      if (onNext) onNext();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) return <div className="loading-spinner">Loading...</div>;

  return (
    <form onSubmit={handleSubmit} className="profile-form">
      <h3><i className="fas fa-user"></i> Personal Information</h3>
      <div className="form-row">
        <div className="form-group"><label>NPI Number *</label><input type="text" value={npiNumber} onChange={(e) => setNpiNumber(e.target.value)} required /></div>
        <div className="form-group"><label>Date of Birth *</label><input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} required /></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label>SSN (Last 4)</label><input type="text" value={ssn} onChange={(e) => setSsn(e.target.value)} placeholder="***-**-1234" maxLength="11" /></div>
        <div className="form-group"><label>Gender</label><select value={gender} onChange={(e) => setGender(e.target.value)}><option value="">Select</option><option>Male</option><option>Female</option><option>Other</option></select></div>
      </div>
      <div className="form-group"><label>Address Line 1</label><input type="text" value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} /></div>
      <div className="form-group"><label>Address Line 2</label><input type="text" value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} /></div>
      <div className="form-row">
        <div className="form-group"><label>City</label><input type="text" value={city} onChange={(e) => setCity(e.target.value)} /></div>
        <div className="form-group"><label>State</label><input type="text" value={state} onChange={(e) => setState(e.target.value)} /></div>
        <div className="form-group"><label>ZIP Code</label><input type="text" value={zipCode} onChange={(e) => setZipCode(e.target.value)} /></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label>Primary Language</label><select value={primaryLanguage} onChange={(e) => setPrimaryLanguage(e.target.value)}><option>English</option><option>Spanish</option><option>Mandarin</option><option>Other</option></select></div>
        <div className="form-group"><label>Other Languages</label><input type="text" value={otherLanguages} onChange={(e) => setOtherLanguages(e.target.value)} placeholder="Comma separated" /></div>
      </div>
      <button type="submit" className="save-btn" disabled={loading}>{loading ? 'Saving...' : 'Save & Continue'}</button>
    </form>
  );
};

export default PersonalInfoForm;