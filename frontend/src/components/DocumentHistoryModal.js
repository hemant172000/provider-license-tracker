import React from 'react';

const DocumentHistoryModal = ({ isOpen, onClose, history, documentType, providerName }) => {
  if (!isOpen) return null;

  const getDocumentLabel = (type) => {
    const labels = {
      MEDICAL_LICENSE: "Medical License",
      DEA_CERTIFICATE: "DEA Certificate",
      BOARD_CERTIFICATION: "Board Certification",
      W9_FORM: "W-9 Form",
      CAQH_ATTESTATION: "CAQH Attestation",
      DRIVERS_LICENSE: "Driver's License",
      MALPRACTICE_INSURANCE: "Malpractice Insurance",
      CURRICULUM_VITAE: "CV/Resume",
      PEER_REFERENCES: "Peer References"
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status, isCurrent) => {
    if (isCurrent) return <span className="status-badge current">✅ CURRENT</span>;
    if (status === "REPLACED") return <span className="status-badge replaced">📦 REPLACED</span>;
    if (status === "EXPIRED") return <span className="status-badge expired">⏰ EXPIRED</span>;
    return <span className="status-badge archived">📁 ARCHIVED</span>;
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8080/files/download/${fileId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="history-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📋 {getDocumentLabel(documentType)} History</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <p className="provider-info">Provider: <strong>{providerName}</strong></p>
          <p className="version-count">Total Versions: {history.length}</p>
          
          <div className="timeline">
            {history.map((version, index) => (
              <div key={version.id} className={`timeline-item ${version.isCurrent ? 'current' : ''}`}>
                <div className="timeline-marker">
                  <div className="marker-dot"></div>
                  {index < history.length - 1 && <div className="marker-line"></div>}
                </div>
                <div className="timeline-content">
                  <div className="version-header">
                    <span className="version-number">Version {version.version}</span>
                    {getStatusBadge(version.status, version.isCurrent)}
                  </div>
                  <div className="version-details">
                    <div className="detail-row">
                      <span className="detail-label">File:</span>
                      <span className="detail-value">{version.fileName}</span>
                      <button 
                        className="download-btn-small"
                        onClick={() => handleDownload(version.id, version.fileName)}
                      >
                        📥 Download
                      </button>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Uploaded:</span>
                      <span className="detail-value">{new Date(version.uploadedAt).toLocaleString()} by {version.uploadedBy}</span>
                    </div>
                    {version.expiryDate && (
                      <div className="detail-row">
                        <span className="detail-label">Expires:</span>
                        <span className="detail-value">{new Date(version.expiryDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {version.replacementReason && (
                      <div className="detail-row">
                        <span className="detail-label">Reason:</span>
                        <span className="detail-value reason-text">{version.replacementReason}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn-close" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default DocumentHistoryModal;