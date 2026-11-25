import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const MalpracticeForm = ({ onComplete, onNext, initialData, loading: isLoading }) => {
  const [carrierName, setCarrierName] = useState('');
  const [policyNumber, setPolicyNumber] = useState('');
  const [perOccurrenceLimit, setPerOccurrenceLimit] = useState('');
  const [aggregateLimit, setAggregateLimit] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [policyType, setPolicyType] = useState('Claims-Made');
  const [tailCoverage, setTailCoverage] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData && !isLoading) {
      setCarrierName(initialData.carrierName || '');
      setPolicyNumber(initialData.policyNumber || '');
      setPerOccurrenceLimit(initialData.perOccurrenceLimit || '');
      setAggregateLimit(initialData.aggregateLimit || '');
      setEffectiveDate(initialData.effectiveDate || '');
      setExpirationDate(initialData.expirationDate || '');
      setPolicyType(initialData.policyType || 'Claims-Made');
      setTailCoverage(initialData.tailCoverage || false);
    }
  }, [initialData, isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append('carrierName', carrierName);
    formData.append('policyNumber', policyNumber);
    formData.append('perOccurrenceLimit', perOccurrenceLimit);
    formData.append('aggregateLimit', aggregateLimit);
    formData.append('effectiveDate', effectiveDate);
    formData.append('expirationDate', expirationDate);
    formData.append('policyType', policyType);
    formData.append('tailCoverage', tailCoverage);
    if (selectedFile) formData.append('file', selectedFile);

    try {
      await API.post('/provider-profile/malpractice', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      alert('Malpractice insurance saved');
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
      <h3><i className="fas fa-shield-alt"></i> Malpractice Insurance</h3>
      
      <div className="form-row">
        <div className="form-group">
          <label>Carrier Name *</label>
          <input value={carrierName} onChange={e => setCarrierName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Policy Number *</label>
          <input value={policyNumber} onChange={e => setPolicyNumber(e.target.value)} required />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Per Occurrence / Claim Limit *</label>
          <input 
            type="text" 
            value={perOccurrenceLimit} 
            onChange={e => setPerOccurrenceLimit(e.target.value)} 
            placeholder="$1,000,000"
            required
          />
        </div>
        <div className="form-group">
          <label>Aggregate Limit *</label>
          <input 
            type="text" 
            value={aggregateLimit} 
            onChange={e => setAggregateLimit(e.target.value)} 
            placeholder="$3,000,000"
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Effective Date *</label>
          <input type="date" value={effectiveDate} onChange={e => setEffectiveDate(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Expiration Date *</label>
          <input type="date" value={expirationDate} onChange={e => setExpirationDate(e.target.value)} required />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Policy Type</label>
          <select value={policyType} onChange={e => setPolicyType(e.target.value)}>
            <option>Claims-Made</option>
            <option>Occurrence</option>
          </select>
        </div>
        <div className="checkbox-group">
          <label>
            <input type="checkbox" checked={tailCoverage} onChange={e => setTailCoverage(e.target.checked)} /> 
            Tail Coverage Included
          </label>
        </div>
      </div>

      <div className="form-group">
        <label>Upload Certificate of Insurance (COI)</label>
        <input type="file" onChange={e => setSelectedFile(e.target.files[0])} accept=".pdf,.jpg,.png" />
        <small>Upload your malpractice insurance certificate</small>
      </div>

      <button type="submit" className="save-btn" disabled={loading}>
        {loading ? 'Saving...' : 'Save & Continue'}
      </button>
    </form>
  );
};

export default MalpracticeForm;