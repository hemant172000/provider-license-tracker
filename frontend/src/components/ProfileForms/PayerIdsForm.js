import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const PayerIdsForm = ({ onComplete, onNext, initialData, loading: isLoading }) => {
  const [payerList, setPayerList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [state, setState] = useState('');
  const [medicarePtan, setMedicarePtan] = useState('');
  const [medicarePin, setMedicarePin] = useState('');
  const [medicaidId, setMedicaidId] = useState('');
  const [medicaidProviderNumber, setMedicaidProviderNumber] = useState('');
  const [commercialIds, setCommercialIds] = useState('');
  const [status, setStatus] = useState('Active');
  const [loading, setLoading] = useState(false);
  const [payerType, setPayerType] = useState('');
const [otherPayerType, setOtherPayerType] = useState('');

  const statesList = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

  useEffect(() => {
    if (initialData && Array.isArray(initialData) && !isLoading) setPayerList(initialData);
  }, [initialData, isLoading]);

  const resetForm = () => {
    setState(''); setMedicarePtan(''); setMedicarePin('');
    setMedicaidId(''); setMedicaidProviderNumber(''); setCommercialIds(''); setStatus('Active');setPayerType('');
setOtherPayerType('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
  state,
  medicarePtan,
  medicarePin,
  medicaidId,
  medicaidProviderNumber,
  commercialIds,
  status,
  payerType: payerType === 'OTHER' ? otherPayerType : payerType
};
    try {
      const res = await API.post('/provider-profile/payer-id', payload);
      setPayerList([...payerList, res.data.payerId]);
      setShowForm(false);
      resetForm();
      alert('Payer ID added');
      if (onComplete) await onComplete();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete payer ID entry?')) {
      try {
        await API.delete(`/provider-profile/payer-id/${id}`);
        setPayerList(payerList.filter(p => p.id !== id));
        alert('Deleted');
        if (onComplete) await onComplete();
      } catch (err) {
        alert('Delete failed');
      }
    }
  };

  if (isLoading) return <div className="loading-spinner">Loading...</div>;

  return (
    <div className="profile-form">
      <h3><i className="fas fa-credit-card"></i> Payer IDs</h3>
      {payerList.map(payer => (
        <div key={payer.id} className="list-item">
          <div>
            <strong>{payer.state}</strong><br/>
            <small>Medicare PTAN: {payer.medicarePtan || 'N/A'}</small><br/>
            <small>Medicaid ID: {payer.medicaidId || 'N/A'}</small><br/>
            <small>Status: {payer.status}</small>
          </div>
          <button className="delete-btn" onClick={() => handleDelete(payer.id)}><i className="fas fa-trash-alt"></i></button>
        </div>
      ))}
      {!showForm ? (
        <button className="add-btn" onClick={()=>setShowForm(true)}><i className="fas fa-plus"></i> Add Payer ID</button>
      ) : (
        <form onSubmit={handleSubmit} className="inline-form">
          <div className="form-group"><label>State *</label><select value={state} onChange={e=>setState(e.target.value)} required><option value="">Select</option>{statesList.map(s=><option key={s}>{s}</option>)}</select></div>
          <div className="form-row"><div className="form-group"><label>Medicare PTAN</label><input value={medicarePtan} onChange={e=>setMedicarePtan(e.target.value)} /></div>
          <div className="form-group"><label>Medicare PIN</label><input value={medicarePin} onChange={e=>setMedicarePin(e.target.value)} /></div></div>
          <div className="form-row"><div className="form-group"><label>Medicaid ID</label><input value={medicaidId} onChange={e=>setMedicaidId(e.target.value)} /></div>
          <div className="form-group"><label>Medicaid Provider Number</label><input value={medicaidProviderNumber} onChange={e=>setMedicaidProviderNumber(e.target.value)} /></div></div>
          <div className="form-group"><label>Commercial Payer IDs</label><input value={commercialIds} onChange={e=>setCommercialIds(e.target.value)} placeholder="Blue Cross: BC123, Aetna: AE456" /></div>
          <div className="form-group"><label>Status</label><select value={status} onChange={e=>setStatus(e.target.value)}><option>Active</option><option>Pending</option><option>Inactive</option></select></div>
          <div className="form-actions"><button type="button" className="cancel-btn" onClick={()=>setShowForm(false)}>Cancel</button><button type="submit" className="save-btn" disabled={loading}>{loading ? 'Saving...' : 'Save Payer ID'}</button></div>
          <div className="form-group">
  <label>Type *</label>
  <select value={payerType} onChange={(e) => setPayerType(e.target.value)} required>
    <option value="">Select Type</option>
    <option value="MEDICARE">Medicare</option>
    <option value="MEDICAID">Medicaid</option>
    <option value="COMMERCIAL">Commercial</option>
    <option value="OTHER">Other</option>
  </select>
</div>

{payerType === 'OTHER' && (
  <div className="form-group">
    <label>Please specify payer type *</label>
    <input 
      type="text" 
      value={otherPayerType} 
      onChange={(e) => setOtherPayerType(e.target.value)} 
      placeholder="e.g., Tricare, Workers Comp, etc."
      required
    />
  </div>
)}
        </form>
      )}
      <button className="continue-btn" onClick={onNext}>Save & Continue</button>
    </div>
  );
};

export default PayerIdsForm;