import React, { useState, useEffect } from 'react';
import API from '../services/api';
import './GroupManagerDashboard.css';

const GroupManagerDashboard = () => {
  const [groupData, setGroupData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadType, setUploadType] = useState("");
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState({ text: "", type: "" });

  const BASE_URL = "http://localhost:8080";
  const token = () => localStorage.getItem("token");
  const fullName = localStorage.getItem("fullName") || "Group Manager";

  const showToastMessage = (text, type = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast({ text: "", type: "" }), 4000);
  };

  useEffect(() => {
    fetchGroupData();
  }, []);

  const fetchGroupData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await API.get('/groups/my-group');
      console.log('Group data:', response.data);
      setGroupData(response.data);
    } catch (error) {
      console.error('Error fetching group data:', error);
      if (error.response?.status === 403) {
        const errorMsg = "You don't have permission to access group data. Please contact your administrator.";
        setError(errorMsg);
        showToastMessage(errorMsg, "error");
      } else if (error.response?.status === 404) {
        setError("No group assigned to you. Please contact your administrator.");
        showToastMessage("No group assigned to you", "error");
      } else {
        setError("Failed to load group data. Please try again.");
        showToastMessage("Failed to load group data", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile || !uploadType || !selectedProvider) {
      showToastMessage("Please select a provider, file type, and file", "error");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("providerId", selectedProvider.providerId);
      formData.append("fileType", uploadType);

      const response = await API.post('/files/upload', formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      showToastMessage("File uploaded successfully");
      setUploadFile(null);
      setUploadType("");
      
      await fetchGroupData();
      
      const fileInput = document.getElementById("file-upload");
      if (fileInput) fileInput.value = "";
    } catch (error) {
      console.error("Upload error:", error);
      showToastMessage(error.response?.data?.error || "Failed to upload file", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      const response = await API.get(`/files/download/${fileId}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToastMessage("Download started", "success");
    } catch (error) {
      console.error("Download error:", error);
      showToastMessage("Failed to download file", "error");
    }
  };

  const handleDeleteFile = async (fileId, fileName) => {
    if (!window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return;
    }
    
    try {
      await API.delete(`/files/${fileId}`);
      showToastMessage("File deleted successfully");
      await fetchGroupData();
    } catch (error) {
      console.error("Delete error:", error);
      showToastMessage("Failed to delete file", "error");
    }
  };

  const isExpiringSoon = (dateStr) => {
    if (!dateStr) return false;
    const days = (new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24);
    return days >= 0 && days <= 90;
  };

  const isExpired = (dateStr) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const getFileIconClass = (fileName) => {
    const extension = fileName?.split(".").pop()?.toLowerCase();
    switch(extension) {
      case 'pdf': return 'fa-file-pdf';
      case 'doc':
      case 'docx': return 'fa-file-word';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return 'fa-file-image';
      case 'xls':
      case 'xlsx': return 'fa-file-excel';
      default: return 'fa-file-alt';
    }
  };

  const filteredProviders = groupData?.providers?.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return p.name?.toLowerCase().includes(q) ||
           p.specialty?.toLowerCase().includes(q) ||
           p.email?.toLowerCase().includes(q);
  }) ?? [];

  if (loading) {
    return (
      <div className="gm-loading">
        <i className="fas fa-spinner fa-spin fa-2x"></i>
        <span>Loading your group...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gm-error">
        <i className="fas fa-exclamation-triangle fa-3x"></i>
        <p>{error}</p>
        <button className="gm-retry-btn" onClick={fetchGroupData}>
          <i className="fas fa-redo-alt"></i> Retry
        </button>
      </div>
    );
  }

  if (!groupData) {
    return (
      <div className="gm-error">
        <i className="fas fa-exclamation-triangle fa-3x"></i>
        <p>No group data available</p>
        <button className="gm-retry-btn" onClick={fetchGroupData}>
          <i className="fas fa-redo-alt"></i> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="gm-container">
      {/* Top bar */}
      <header className="gm-topbar">
        <div className="gm-topbar-left">
          <i className="fas fa-hospital gm-logo"></i>
          <div>
            <h1 className="gm-group-name">{groupData?.groupName || "Group Management"}</h1>
            <span className="gm-subtitle">Group Manager Portal</span>
          </div>
        </div>
        <div className="gm-topbar-right">
          <div className="gm-user-pill">
            <div className="gm-user-avatar">
              <i className="fas fa-user"></i>
            </div>
            <span className="gm-user-name">{fullName}</span>
          </div>
          <button className="gm-logout-btn" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i> Sign out
          </button>
        </div>
      </header>

      <div className="gm-body">
        {/* Left: provider list */}
        <aside className="gm-sidebar">
          <div className="gm-sidebar-header">
            <div className="gm-sidebar-title">
              <i className="fas fa-users"></i>
              <span className="gm-count">{filteredProviders.length} Providers</span>
            </div>
            <div className="gm-search-wrapper">
              <i className="fas fa-search gm-search-icon"></i>
              <input
                className="gm-search"
                placeholder="Search providers by name, specialty, or email..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="gm-provider-list">
            {filteredProviders.length === 0 && (
              <div className="gm-empty">
                <i className="fas fa-folder-open fa-3x"></i>
                <p>No providers found</p>
              </div>
            )}
            {filteredProviders.map(provider => {
              const expired = isExpired(provider.licenseExpiry);
              const expiring = isExpiringSoon(provider.licenseExpiry);
              return (
                <button
                  key={provider.providerId}
                  className={`gm-provider-card ${selectedProvider?.providerId === provider.providerId ? "selected" : ""}`}
                  onClick={() => setSelectedProvider(provider)}
                >
                  <div className="gm-pcard-avatar">
                    {provider.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div className="gm-pcard-info">
                    <span className="gm-pcard-name">{provider.name || "Unnamed"}</span>
                    <span className="gm-pcard-specialty">{provider.specialty || "—"}</span>
                  </div>
                  {expired && <span className="gm-badge expired">Expired</span>}
                  {!expired && expiring && <span className="gm-badge expiring">Soon</span>}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right: detail panel */}
        <main className="gm-detail">
          {!selectedProvider ? (
            <div className="gm-detail-empty">
              <i className="fas fa-chevron-left gm-empty-icon"></i>
              <p>Select a provider to view details and manage documents</p>
            </div>
          ) : (
            <div className="gm-detail-content">
              {/* Header */}
              <div className="gm-detail-header">
                <div className="gm-detail-avatar">
                  {selectedProvider.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div>
                  <h2 className="gm-detail-name">{selectedProvider.name}</h2>
                  <span className="gm-detail-spec">{selectedProvider.specialty || "No specialty listed"}</span>
                </div>
                <button className="gm-close-btn" onClick={() => setSelectedProvider(null)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>

              {/* Info grid */}
              <div className="gm-info-grid">
                <InfoCard icon="fa-envelope" label="Email" value={selectedProvider.email || "—"} />
                <InfoCard icon="fa-phone" label="Phone" value={selectedProvider.phoneNumber || "—"} />
                <InfoCard icon="fa-id-card" label="License #" value={selectedProvider.licenseNumber || "—"} />
                <InfoCard
                  icon="fa-calendar-alt"
                  label="License Expiry"
                  value={selectedProvider.licenseExpiry || "—"}
                  status={
                    isExpired(selectedProvider.licenseExpiry) ? "expired" :
                    isExpiringSoon(selectedProvider.licenseExpiry) ? "expiring" : "ok"
                  }
                />
                <InfoCard 
                  icon="fa-user-check"
                  label="Assigned To" 
                  value={selectedProvider.assignedTo || "Not assigned"} 
                />
              </div>

              {/* Upload Section */}
              <div className="gm-upload-section">
                <h4>
                  <i className="fas fa-upload"></i>
                  Upload Document
                </h4>
                <div className="gm-upload-form">
                  <select 
                    value={uploadType} 
                    onChange={e => setUploadType(e.target.value)}
                    className="gm-select"
                  >
                    <option value="">Select Document Type</option>
                    <option value="LICENSE">License</option>
                    <option value="RENEWALS">Renewal</option>
                    <option value="CONTRACTS">Contract</option>
                    <option value="PAYORS">Payor Document</option>
                    <option value="MEDICAL_LICENSE">Medical License</option>
                    <option value="BOARD_CERTIFICATION">Board Certification</option>
                    <option value="MALPRACTICE_INSURANCE">Malpractice Insurance</option>
                  </select>
                  <div className="gm-file-input-wrapper">
                    <input
                      id="file-upload"
                      type="file"
                      onChange={e => setUploadFile(e.target.files[0])}
                      className="gm-file-input"
                    />
                    {uploadFile && <span className="gm-file-name-display">{uploadFile.name}</span>}
                  </div>
                  <button 
                    onClick={handleUpload} 
                    disabled={uploading || !uploadFile || !uploadType}
                    className="gm-upload-btn"
                  >
                    {uploading ? <><i className="fas fa-spinner fa-spin"></i> Uploading...</> : <><i className="fas fa-upload"></i> Upload</>}
                  </button>
                </div>
              </div>

              {/* Files section */}
              <div className="gm-files-section">
                <div className="gm-files-title">
                  <i className="fas fa-file-contract"></i>
                  <h3>Documents</h3>
                  <span className="gm-files-count">{selectedProvider.files?.length ?? 0}</span>
                </div>
                {(!selectedProvider.files || selectedProvider.files.length === 0) ? (
                  <div className="gm-files-empty">
                    <i className="fas fa-folder-open fa-3x"></i>
                    <p>No documents uploaded yet</p>
                  </div>
                ) : (
                  <div className="gm-files-list">
                    {selectedProvider.files.map(file => (
                      <div key={file.id} className="gm-file-row">
                        <div className="gm-file-icon">
                          <i className={`fas ${getFileIconClass(file.fileName)}`}></i>
                        </div>
                        <div className="gm-file-info">
                          <span className="gm-file-name">{file.fileName}</span>
                          <span className="gm-file-meta">
                            {file.fileType && <span className="gm-file-type">{file.fileType}</span>}
                            {file.uploadedAt && (
                              <span>
                                <i className="fas fa-calendar-alt"></i>
                                {new Date(file.uploadedAt).toLocaleDateString()}
                              </span>
                            )}
                            <span className="gm-uploader-info">
                              <i className="fas fa-user"></i>
                              Uploaded by: {file.uploadedBy || "Unknown"}
                            </span>
                          </span>
                        </div>
                        <div className="gm-file-actions">
                          <button
                            className="gm-download-btn"
                            onClick={() => handleDownload(file.id, file.fileName)}
                            title="Download"
                          >
                            <i className="fas fa-download"></i>
                          </button>
                          <button
                            className="gm-delete-btn"
                            onClick={() => handleDeleteFile(file.id, file.fileName)}
                            title="Delete"
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Footer summary bar */}
      <footer className="gm-footer">
        <SummaryChip icon="fa-users" label="Total Providers" value={groupData?.providers?.length ?? 0} />
        <SummaryChip
          icon="fa-exclamation-triangle"
          label="Expired Licenses"
          value={groupData?.providers?.filter(p => isExpired(p.licenseExpiry)).length ?? 0}
          warn
        />
        <SummaryChip
          icon="fa-clock"
          label="Expiring (90 days)"
          value={groupData?.providers?.filter(p => !isExpired(p.licenseExpiry) && isExpiringSoon(p.licenseExpiry)).length ?? 0}
          soft
        />
        <SummaryChip
          icon="fa-file-contract"
          label="Total Documents"
          value={groupData?.providers?.reduce((acc, p) => acc + (p.files?.length ?? 0), 0) ?? 0}
        />
      </footer>

      {/* Toast */}
      {toast.text && (
        <div className={`gm-toast ${toast.type === "error" ? "gm-toast-error" : "gm-toast-success"}`}>
          {toast.type === "error" ? 
            <i className="fas fa-exclamation-triangle"></i> : 
            <i className="fas fa-check-circle"></i>
          }
          {toast.text}
        </div>
      )}
    </div>
  );
};

function InfoCard({ icon, label, value, status }) {
  return (
    <div className="gm-info-card">
      <span className="gm-info-label">
        <i className={`fas ${icon}`}></i>
        {label}
      </span>
      <span className={`gm-info-value ${status === "expired" ? "txt-expired" : status === "expiring" ? "txt-expiring" : ""}`}>
        {value}
        {status === "expired" && <span className="gm-badge expired">Expired</span>}
        {status === "expiring" && <span className="gm-badge expiring">Expiring soon</span>}
      </span>
    </div>
  );
}

function SummaryChip({ icon, label, value, warn, soft }) {
  return (
    <div className={`gm-chip ${warn ? "gm-chip-warn" : soft ? "gm-chip-soft" : ""}`}>
      <i className={`fas ${icon} gm-chip-icon`}></i>
      <div>
        <div className="gm-chip-value">{value}</div>
        <div className="gm-chip-label">{label}</div>
      </div>
    </div>
  );
}

export default GroupManagerDashboard;