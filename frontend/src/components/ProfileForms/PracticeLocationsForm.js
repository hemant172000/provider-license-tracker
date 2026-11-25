import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const PracticeLocationsForm = ({ onComplete, onNext, initialData, loading: isLoading }) => {
  const [locationList, setLocationList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [practiceName, setPracticeName] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [phone, setPhone] = useState('');
  const [fax, setFax] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [acceptingPatients, setAcceptingPatients] = useState(true);
  const [hospitalAffiliations, setHospitalAffiliations] = useState('');
  const [isHospitalist, setIsHospitalist] = useState(false);
  const [loading, setLoading] = useState(false);

  const statesList = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

  useEffect(() => {
    if (initialData && Array.isArray(initialData) && !isLoading) {
      setLocationList(initialData);
    }
  }, [initialData, isLoading]);

  const resetForm = () => { 
    setPracticeName(''); 
    setAddressLine1(''); 
    setAddressLine2(''); 
    setCity(''); 
    setState(''); 
    setZipCode(''); 
    setPhone(''); 
    setFax(''); 
    setIsPrimary(false); 
    setAcceptingPatients(true); 
    setHospitalAffiliations('');
    setIsHospitalist(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setLoading(true);
    const payload = { 
      practiceName, 
      addressLine1, 
      addressLine2, 
      city, 
      state, 
      zipCode, 
      phone, 
      fax, 
      isPrimary, 
      acceptingPatients, 
      hospitalAffiliations,
      isHospitalist
    };
    try {
      const res = await API.post('/provider-profile/practice-location', payload);
      setLocationList([...locationList, res.data.location]);
      setShowForm(false); 
      resetForm(); 
      alert('Location added');
      if (onComplete) await onComplete();
    } catch (err) { 
      alert('Error: ' + (err.response?.data?.error || err.message));
    } finally { 
      setLoading(false); 
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete location?')) {
      try {
        await API.delete(`/provider-profile/practice-location/${id}`);
        setLocationList(locationList.filter(l => l.id !== id));
        if (onComplete) await onComplete();
      } catch (err) { 
        alert('Delete failed'); 
      }
    }
  };

  if (isLoading) return <div className="loading-spinner">Loading...</div>;

  return (
    <div className="profile-form">
      <h3><i className="fas fa-map-marker-alt"></i> Practice Locations</h3>
      <p>Add all locations where you practice or see patients.</p>
      
      {locationList.length > 0 && (
        <div className="items-list">
          {locationList.map(loc => (
            <div key={loc.id} className="list-item">
              <div>
                <strong>{loc.practiceName}</strong> 
                {loc.isPrimary && <span className="primary-badge">Primary</span>}
                {loc.isHospitalist && <span className="hospitalist-badge">Hospitalist</span>}
                <br/>
                {loc.addressLine1}, {loc.city}, {loc.state} {loc.zipCode}
                <br/>
                Phone: {loc.phone} | Accepting: {loc.acceptingPatients ? 'Yes' : 'No'}
              </div>
              <button className="delete-btn" onClick={() => handleDelete(loc.id)}>
                <i className="fas fa-trash-alt"></i>
              </button>
            </div>
          ))}
        </div>
      )}
      
      {!showForm ? (
        <button className="add-btn" onClick={() => setShowForm(true)}>
          <i className="fas fa-plus"></i> Add Practice Location
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="inline-form">
          <div className="form-group">
            <label>Practice Name *</label>
            <input value={practiceName} onChange={e => setPracticeName(e.target.value)} required />
          </div>
          
          <div className="form-group">
            <label>Address Line 1 *</label>
            <input value={addressLine1} onChange={e => setAddressLine1(e.target.value)} required />
          </div>
          
          <div className="form-group">
            <label>Address Line 2</label>
            <input value={addressLine2} onChange={e => setAddressLine2(e.target.value)} />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>City *</label>
              <input value={city} onChange={e => setCity(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>State *</label>
              <select value={state} onChange={e => setState(e.target.value)} required>
                <option value="">Select</option>
                {statesList.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>ZIP *</label>
              <input value={zipCode} onChange={e => setZipCode(e.target.value)} required />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Phone</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Fax</label>
              <input value={fax} onChange={e => setFax(e.target.value)} />
            </div>
          </div>
          
          <div className="form-row">
            <div className="checkbox-group">
              <label>
                <input type="checkbox" checked={isPrimary} onChange={e => setIsPrimary(e.target.checked)} /> 
                Primary Practice Location
              </label>
            </div>
            <div className="checkbox-group">
              <label>
                <input type="checkbox" checked={acceptingPatients} onChange={e => setAcceptingPatients(e.target.checked)} /> 
                Accepting New Patients
              </label>
            </div>
          </div>
          
          <div className="checkbox-group" style={{ marginBottom: '12px' }}>
            <label>
              <input type="checkbox" checked={isHospitalist} onChange={e => setIsHospitalist(e.target.checked)} /> 
              Are you a hospitalist at this location?
            </label>
          </div>
          
          <div className="form-group">
            <label>Hospital Affiliations</label>
            <textarea value={hospitalAffiliations} onChange={e => setHospitalAffiliations(e.target.value)} rows="2" placeholder="List affiliated hospitals" />
          </div>
          
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? 'Saving...' : 'Save Location'}
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

export default PracticeLocationsForm;