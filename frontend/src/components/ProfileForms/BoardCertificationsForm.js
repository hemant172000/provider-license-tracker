import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const BoardCertificationsForm = ({ onComplete, onNext, initialData, loading: isLoading }) => {
  const [certList, setCertList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  
  // Certification fields
  const [certType, setCertType] = useState('BOARD_CERTIFICATION');
  const [specialty, setSpecialty] = useState('');
  const [certifyingBoard, setCertifyingBoard] = useState('');
  const [certificationNumber, setCertificationNumber] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const certificationTypes = [
    { value: 'BOARD_CERTIFICATION', label: 'Board Certification', required: true },
    { value: 'BLS_CERT', label: 'BLS Certification', required: true },
    { value: 'ACLS_CERT', label: 'ACLS Certification', required: false },
    { value: 'PALS_CERT', label: 'PALS Certification', required: false },
    { value: 'ATLS_CERT', label: 'ATLS Certification', required: false }
  ];

  const specialties = [
    'Internal Medicine', 'Family Medicine', 'Pediatrics', 'Cardiology',
    'Neurology', 'Orthopedic Surgery', 'General Surgery', 'Obstetrics & Gynecology',
    'Psychiatry', 'Radiology', 'Anesthesiology', 'Emergency Medicine',
    'Dermatology', 'Ophthalmology', 'Urology', 'Gastroenterology',
    'Pulmonology', 'Nephrology', 'Endocrinology', 'Hematology/Oncology'
  ];

  const boards = [
    'American Board of Internal Medicine',
    'American Board of Family Medicine',
    'American Board of Pediatrics',
    'American Board of Surgery',
    'American Board of Psychiatry and Neurology',
    'American Board of Radiology',
    'American Board of Anesthesiology',
    'American Board of Emergency Medicine',
    'American Board of Dermatology',
    'American Board of Ophthalmology'
  ];

  useEffect(() => {
    if (initialData && Array.isArray(initialData) && !isLoading) {
      setCertList(initialData);
    }
  }, [initialData, isLoading]);

  const resetForm = () => {
    setCertType('BOARD_CERTIFICATION');
    setSpecialty('');
    setCertifyingBoard('');
    setCertificationNumber('');
    setIssueDate('');
    setExpirationDate('');
    setSelectedFile(null);
  };

  const getRequiredForType = () => {
    const type = certificationTypes.find(t => t.value === certType);
    return type?.required || false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append('certType', certType);
    formData.append('specialty', specialty);
    formData.append('certifyingBoard', certifyingBoard);
    formData.append('certificationNumber', certificationNumber);
    formData.append('issueDate', issueDate);
    formData.append('expirationDate', expirationDate);
    if (selectedFile) formData.append('file', selectedFile);

    try {
      const response = await API.post('/provider-profile/board-certification', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setCertList([...certList, response.data.certification]);
      setShowForm(false);
      resetForm();
      alert('Certification added successfully!');
      if (onComplete) await onComplete();
    } catch (error) {
      alert('Error adding certification: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this certification?')) {
      try {
        await API.delete(`/provider-profile/board-certification/${id}`);
        setCertList(certList.filter(c => c.id !== id));
        alert('Certification deleted');
        if (onComplete) await onComplete();
      } catch (error) {
        alert('Error deleting certification');
      }
    }
  };

  const getCertTypeLabel = (type) => {
    const found = certificationTypes.find(t => t.value === type);
    return found ? found.label : type;
  };

  if (isLoading) return <div className="loading-spinner">Loading...</div>;

  return (
    <div className="profile-form">
      <h3><i className="fas fa-certificate"></i> Certifications & Licenses</h3>
      <p>Add your board certifications, BLS, ACLS, PALS, and ATLS certifications.</p>

      {certList.length > 0 && (
        <div className="items-list">
          {certList.map(cert => (
            <div key={cert.id} className="list-item">
              <div className="item-info">
                <strong>{getCertTypeLabel(cert.certType || cert.fileType)}</strong>
                {cert.specialty && <span> - {cert.specialty}</span>}
                {cert.certifyingBoard && <span> ({cert.certifyingBoard})</span>}
                <br />
                <small>Cert #: {cert.certificationNumber || 'N/A'} | Expires: {cert.expirationDate ? new Date(cert.expirationDate).toLocaleDateString() : 'N/A'}</small>
              </div>
              <button className="delete-btn" onClick={() => handleDelete(cert.id)}>
                <i className="fas fa-trash-alt"></i>
              </button>
            </div>
          ))}
        </div>
      )}

      {!showForm ? (
        <button className="add-btn" onClick={() => setShowForm(true)}>
          <i className="fas fa-plus"></i> Add Certification
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="inline-form">
          <div className="form-group">
            <label>Certification Type *</label>
            <select value={certType} onChange={(e) => setCertType(e.target.value)} required>
              {certificationTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label} {type.required ? '(Required)' : '(Optional)'}
                </option>
              ))}
            </select>
          </div>

          {/* Show specialty and board only for BOARD_CERTIFICATION */}
          {certType === 'BOARD_CERTIFICATION' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>Specialty *</label>
                  <select value={specialty} onChange={(e) => setSpecialty(e.target.value)} required>
                    <option value="">Select Specialty</option>
                    {specialties.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Certifying Board *</label>
                  <select value={certifyingBoard} onChange={(e) => setCertifyingBoard(e.target.value)} required>
                    <option value="">Select Board</option>
                    {boards.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Certification Number</label>
                <input type="text" value={certificationNumber} onChange={(e) => setCertificationNumber(e.target.value)} />
              </div>
            </>
          )}

          {/* For BLS/ACLS/PALS/ATLS, show issuing organization */}
          {certType !== 'BOARD_CERTIFICATION' && (
            <div className="form-group">
              <label>Issuing Organization</label>
              <input 
                type="text" 
                value={certifyingBoard} 
                onChange={(e) => setCertifyingBoard(e.target.value)} 
                placeholder="e.g., American Heart Association, Red Cross"
              />
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Issue Date</label>
              <input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Expiration Date {getRequiredForType() && '*'}</label>
              <input type="date" value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)} required={getRequiredForType()} />
            </div>
          </div>

          <div className="form-group">
            <label>Upload Certificate</label>
            <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} accept=".pdf,.jpg,.jpeg,.png" />
            <small>Upload your certification document</small>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? 'Saving...' : 'Save Certification'}
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

export default BoardCertificationsForm;