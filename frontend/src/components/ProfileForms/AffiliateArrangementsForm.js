import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const AffiliateArrangementsForm = ({ onComplete, onNext, initialData, loading: isLoading }) => {
  const [arrangementList, setArrangementList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [arrangementType, setArrangementType] = useState('INDIVIDUAL');
  
  // Individual Provider fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [npiNumber, setNpiNumber] = useState('');
  
  // Group fields
  const [groupName, setGroupName] = useState('');
  const [organizationNpi, setOrganizationNpi] = useState('');
  const [groupPhone, setGroupPhone] = useState('');
  const [groupEmail, setGroupEmail] = useState('');
  
  const [arrangementDescription, setArrangementDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData && Array.isArray(initialData) && !isLoading) {
      setArrangementList(initialData);
    }
  }, [initialData, isLoading]);

  const resetForm = () => {
    setArrangementType('INDIVIDUAL');
    setFirstName('');
    setLastName('');
    setSpecialty('');
    setPhone('');
    setEmail('');
    setNpiNumber('');
    setGroupName('');
    setOrganizationNpi('');
    setGroupPhone('');
    setGroupEmail('');
    setArrangementDescription('');
    setSelectedFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const fd = new FormData();
    fd.append('arrangementType', arrangementType);
    fd.append('arrangementDescription', arrangementDescription);
    
    if (arrangementType === 'INDIVIDUAL') {
      fd.append('firstName', firstName);
      fd.append('lastName', lastName);
      fd.append('specialty', specialty);
      fd.append('phone', phone);
      fd.append('email', email);
      fd.append('npiNumber', npiNumber);
    } else {
      fd.append('groupName', groupName);
      fd.append('organizationNpi', organizationNpi);
      fd.append('groupPhone', groupPhone);
      fd.append('groupEmail', groupEmail);
    }
    
    if (selectedFile) fd.append('file', selectedFile);
    
    try {
      const response = await API.post('/provider-profile/affiliate-arrangement', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setArrangementList([...arrangementList, response.data.arrangement]);
      setShowForm(false);
      resetForm();
      alert('Affiliate arrangement added successfully!');
      if (onComplete) await onComplete();
    } catch (error) {
      alert('Error adding arrangement: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this affiliate arrangement?')) {
      try {
        await API.delete(`/provider-profile/affiliate-arrangement/${id}`);
        setArrangementList(arrangementList.filter(a => a.id !== id));
        alert('Arrangement deleted successfully');
        if (onComplete) await onComplete();
      } catch (error) {
        alert('Error deleting arrangement');
      }
    }
  };

  if (isLoading) return <div className="loading-spinner">Loading...</div>;

  return (
    <div className="profile-form">
      <h3><i className="fas fa-handshake"></i> Affiliate Arrangements</h3>
      <p>Who admits for you or on your behalf?</p>

      {arrangementList.length > 0 && (
        <div className="items-list">
          {arrangementList.map(arr => (
            <div key={arr.id} className="list-item">
              <div className="item-info">
                <strong>{arr.arrangementType === 'INDIVIDUAL' ? 'Individual Provider' : 'Group'}</strong>
                {arr.arrangementType === 'INDIVIDUAL' ? (
                  <><br /><small>{arr.firstName} {arr.lastName} - {arr.specialty}</small></>
                ) : (
                  <><br /><small>{arr.groupName} - NPI: {arr.organizationNpi}</small></>
                )}
                <br /><small>Description: {arr.arrangementDescription}</small>
              </div>
              <button className="delete-btn" onClick={() => handleDelete(arr.id)}>
                <i className="fas fa-trash-alt"></i>
              </button>
            </div>
          ))}
        </div>
      )}

      {!showForm ? (
        <button className="add-btn" onClick={() => setShowForm(true)}>
          <i className="fas fa-plus"></i> Add Affiliate Arrangement
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="inline-form">
          <div className="form-group">
            <label>Type of Arrangement *</label>
            <select value={arrangementType} onChange={(e) => setArrangementType(e.target.value)} required>
              <option value="INDIVIDUAL">Individual Provider</option>
              <option value="GROUP">Group</option>
            </select>
          </div>

          {arrangementType === 'INDIVIDUAL' ? (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Specialty *</label>
                  <input type="text" value={specialty} onChange={e => setSpecialty(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Phone #</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>NPI #</label>
                  <input type="text" value={npiNumber} onChange={e => setNpiNumber(e.target.value)} />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label>Group Name *</label>
                <input type="text" value={groupName} onChange={e => setGroupName(e.target.value)} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Organization NPI *</label>
                  <input type="text" value={organizationNpi} onChange={e => setOrganizationNpi(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Phone #</label>
                  <input type="tel" value={groupPhone} onChange={e => setGroupPhone(e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" value={groupEmail} onChange={e => setGroupEmail(e.target.value)} />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Description of Arrangement *</label>
            <textarea 
              value={arrangementDescription} 
              onChange={e => setArrangementDescription(e.target.value)} 
              rows="3" 
              placeholder="Describe the arrangement..."
              required
            />
          </div>

          <div className="form-group">
            <label>Upload Document</label>
            <input type="file" onChange={e => setSelectedFile(e.target.files[0])} accept=".pdf,.jpg,.png" />
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? 'Saving...' : 'Save Arrangement'}
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

export default AffiliateArrangementsForm;