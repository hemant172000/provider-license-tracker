import React, { useState } from 'react';

const ReplaceDocumentModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  documentType, 
  currentDocument,
  providerName 
}) => {
  const [replacementReason, setReplacementReason] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  if (!isOpen) return null;

  const getDocumentLabel = (type) => {
    const labels = {
      MEDICAL_LICENSE: "Medical License",
      DEA_CERTIFICATE: "DEA Certificate",
      BOARD_CERTIFICATION: "Board Certification",
      W9_FORM: "W-9 Form",
      CAQH_ATTESTATION: "CAQH Attestation",
      DRIVERS_LICENSE: "Driver's License",
      MALPRACTICE_INSURANCE: "Malpractice Insurance"
    };
    return labels[type] || type;
  };

  const handleConfirm = () => {
    onConfirm(replacementReason, expiryDate);
    setReplacementReason("");
    setExpiryDate("");
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="replace-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="warning-icon">⚠️</div>
          <h2>Document Already Exists</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <p className="warning-message">
            A <strong>{getDocumentLabel(documentType)}</strong> is already uploaded for <strong>{providerName}</strong>
          </p>
          
          <div className="current-document-info">
            <div className="info-row">
              <span className="info-label">Current File:</span>
              <span className="info-value">{currentDocument?.fileName}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Uploaded By:</span>
              <span className="info-value">{currentDocument?.uploadedBy} ({currentDocument?.uploaderRole})</span>
            </div>
            <div className="info-row">
              <span className="info-label">Uploaded On:</span>
              <span className="info-value">{new Date(currentDocument?.uploadedAt).toLocaleDateString()}</span>
            </div>
            {currentDocument?.expiryDate && (
              <div className="info-row">
                <span className="info-label">Expires:</span>
                <span className="info-value">{new Date(currentDocument.expiryDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
          
          <div className="action-options">
            <label className="radio-option">
              <input type="radio" name="action" defaultChecked onChange={() => {}} />
              <span>Replace with new file (old will be archived)</span>
            </label>
          </div>
          
          <div className="form-group">
            <label>Reason for replacement (optional):</label>
            <textarea 
              className="reason-input"
              placeholder="e.g., License renewed, correction of information..."
              value={replacementReason}
              onChange={(e) => setReplacementReason(e.target.value)}
              rows="2"
            />
          </div>
          
          <div className="form-group">
            <label>New Expiry Date (if applicable):</label>
            <input 
              type="date" 
              className="date-input"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-confirm" onClick={handleConfirm}>Replace & Upload</button>
        </div>
      </div>
    </div>
  );
};

export default ReplaceDocumentModal;