import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const PeerReferencesForm = ({ onComplete, onNext, initialData, loading: isLoading }) => {
  const [referenceList, setReferenceList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [referenceName, setReferenceName] = useState('');
  const [title, setTitle] = useState('');
  const [institution, setInstitution] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData && Array.isArray(initialData) && !isLoading) setReferenceList(initialData);
  }, [initialData, isLoading]);

  const resetForm = () => {
    setReferenceName(''); setTitle(''); setInstitution('');
    setEmail(''); setPhone(''); setSelectedFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData();
    fd.append('referenceName', referenceName);
    fd.append('title', title);
    fd.append('institution', institution);
    fd.append('email', email);
    fd.append('phone', phone);
    if (selectedFile) fd.append('file', selectedFile);

    try {
      const res = await API.post('/provider-profile/peer-reference', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setReferenceList([...referenceList, res.data.reference]);
      setShowForm(false);
      resetForm();
      alert('Peer reference added');
      if (onComplete) await onComplete();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete reference?')) {
      try {
        await API.delete(`/provider-profile/peer-reference/${id}`);
        setReferenceList(referenceList.filter(r => r.id !== id));
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
      <h3><i className="fas fa-users"></i> Peer References</h3>
      {referenceList.map(ref => (
        <div key={ref.id} className="list-item">
          <div>
            <strong>{ref.referenceName}</strong><br/>
            <small>{ref.title} at {ref.institution}</small><br/>
            <small>{ref.email} | {ref.phone}</small>
          </div>
          <button className="delete-btn" onClick={() => handleDelete(ref.id)}><i className="fas fa-trash-alt"></i></button>
        </div>
      ))}
      {!showForm ? (
        <button className="add-btn" onClick={()=>setShowForm(true)}><i className="fas fa-plus"></i> Add Peer Reference</button>
      ) : (
        <form onSubmit={handleSubmit} className="inline-form">
          <div className="form-row">
            <div className="form-group"><label>Reference Name *</label><input value={referenceName} onChange={e=>setReferenceName(e.target.value)} required /></div>
            <div className="form-group"><label>Title/Position *</label><input value={title} onChange={e=>setTitle(e.target.value)} required /></div>
          </div>
          <div className="form-group"><label>Institution/Practice</label><input value={institution} onChange={e=>setInstitution(e.target.value)} /></div>
          <div className="form-row">
            <div className="form-group"><label>Email *</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required /></div>
            <div className="form-group"><label>Phone</label><input value={phone} onChange={e=>setPhone(e.target.value)} /></div>
          </div>
          <div className="form-group"><label>Upload Reference Letter</label><input type="file" onChange={e=>setSelectedFile(e.target.files[0])} accept=".pdf,.jpg,.png" /></div>
          <div className="form-actions"><button type="button" className="cancel-btn" onClick={()=>setShowForm(false)}>Cancel</button><button type="submit" className="save-btn" disabled={loading}>{loading ? 'Saving...' : 'Save Reference'}</button></div>
        </form>
      )}
      <button className="continue-btn" onClick={onNext}>Save & Continue</button>
    </div>
  );
};

export default PeerReferencesForm;