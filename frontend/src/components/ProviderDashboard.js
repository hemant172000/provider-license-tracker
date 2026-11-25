import React, { useEffect, useState } from 'react';
import API from '../services/api';
import ProfileCompletionModal from './ProfileCompletionModal';
import './ProviderDashboard.css';

const BASE_URL = "http://localhost:8080";

// ── Helpers ───────────────────────────────────────────────────────────────────
const today      = new Date();
const in90Days   = new Date(today); in90Days.setDate(today.getDate() + 90);
const isExpired  = (d) => d && new Date(d) < today;
const isExpiring = (d) => { if (!d) return false; const e = new Date(d); return e >= today && e <= in90Days; };
const daysUntil  = (d) => { if (!d) return null; return Math.ceil((new Date(d) - today) / 86400000); };
const fmtDate    = (d) => { if (!d) return "—"; return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); };

const TOKEN = () => localStorage.getItem("token");

// ── Component ─────────────────────────────────────────────────────────────────
const ProviderDashboard = () => {
  const storedName = localStorage.getItem("fullName") || "Provider";

  const [activeView, setActiveView]   = useState("DASHBOARD");
  const [profile, setProfile]         = useState(null);
  const [files, setFiles]             = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingFiles, setLoadingFiles]     = useState(true);
  const [toast, setToast]             = useState({ text: "", type: "" });
  const [uploadFile, setUploadFile]   = useState(null);
  const [uploadType, setUploadType]   = useState("");
  const [uploading, setUploading]     = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [profileCompletion, setProfileCompletion] = useState(null);
  const [submittingProfile, setSubmittingProfile] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [profileId, setProfileId] = useState(null);
  const [completionFormData, setCompletionFormData] = useState({
    npiNumber: '',
    medicaidId: '',
    medicareNumber: '',
    caqhId: '',
    deaNumber: '',
    medicalSchool: '',
    residencyProgram: '',
    boardCertification: '',
    malpracticeCarrier: '',
    malpracticePolicyNumber: '',
    malpracticeExpiryDate: ''
  });

  // ── Fetch profile ─────────────────────────────────────────────────────────
  const fetchProfile = async () => {
    setLoadingProfile(true);
    try {
      const response = await API.get('/providers/my-profile');
      if (response.data) {
        setProfile(response.data);
        setProfileId(response.data.id);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // ── Profile completion check ──────────────────────────────────────────────
  const checkProfileCompletion = async () => {
    try {
      const response = await API.get('/provider-profile/completion-status');
      if (!response.data.profileCompleted && response.data.profileStatus !== 'SUBMITTED') {
        setShowProfileModal(true);
      } else {
        setProfileCompleted(true);
      }
    } catch (error) {
      console.error('Error checking profile completion:', error);
      setProfileCompleted(true);
    }
  };

  useEffect(() => {
    checkProfileCompletion();
  }, []);

  // ── Handle profile form input changes ─────────────────────────────────────
  const handleCompletionFormChange = (e) => {
    setCompletionFormData({
      ...completionFormData,
      [e.target.name]: e.target.value
    });
  };

  // ── Handle profile submission ────────────────────────────────────────────
  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setSubmittingProfile(true);
    
    const requiredFields = [
      { field: 'npiNumber', name: 'NPI Number' },
      { field: 'medicalSchool', name: 'Medical School' },
      { field: 'boardCertification', name: 'Board Certification' },
      { field: 'malpracticeCarrier', name: 'Malpractice Carrier' },
      { field: 'malpracticePolicyNumber', name: 'Malpractice Policy Number' },
      { field: 'malpracticeExpiryDate', name: 'Malpractice Expiry Date' }
    ];
    
    const missingFields = requiredFields.filter(f => 
      !completionFormData[f.field] || completionFormData[f.field].trim() === ''
    );
    
    if (missingFields.length > 0) {
      const fieldNames = missingFields.map(f => f.name).join(', ');
      showToast(`Please fill in required fields: ${fieldNames}`, "error");
      setSubmittingProfile(false);
      return;
    }
    
    try {
      const response = await API.post('/provider-profile/complete', completionFormData);
      
      if (response.data.success) {
        showToast("Profile completed successfully!", "success");
        setShowProfileModal(false);
        setProfileCompleted(true);
        fetchProfile();
      }
    } catch (error) {
      console.error("Profile submission error:", error);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || "Error saving profile";
      showToast(errorMsg, "error");
    } finally {
      setSubmittingProfile(false);
    }
  };

  // ── Fetch files from the unified provider_file table ─────────────────────
  const fetchFiles = async () => {
    if (!profileId) return;
    
    setLoadingFiles(true);
    try {
      const response = await API.get(`/files/provider/${profileId}`);
      let filesList = [];
      if (response.data && response.data.files) {
        filesList = response.data.files;
      } else if (Array.isArray(response.data)) {
        filesList = response.data;
      } else if (response.data && response.data.currentVersions) {
        filesList = Object.values(response.data.currentVersions);
      }
      // Filter only current documents
      const currentFiles = filesList.filter(f => f.isCurrent === true);
      setFiles(currentFiles);
    } catch (error) {
      console.error('Error fetching files:', error);
      setFiles([]);
    } finally {
      setLoadingFiles(false);
    }
  };

  // Fetch files when profileId is available
  useEffect(() => {
    if (profileId) {
      fetchFiles();
    }
  }, [profileId]);

  // ── Build notifications from profile data ─────────────────────────────────
  useEffect(() => {
    if (!profile) return;
    const notifs = [];
    const days = daysUntil(profile.licenseExpiry);
    if (days !== null && days < 0)
      notifs.push({ type: "error", msg: "Your license has expired. Please renew immediately." });
    else if (days !== null && days <= 30)
      notifs.push({ type: "warn", msg: `License expiring in ${days} day${days === 1 ? "" : "s"} — action required.` });
    else if (days !== null && days <= 90)
      notifs.push({ type: "info", msg: `License expiring in ${days} days. Start renewal process soon.` });
    if (files.length === 0)
      notifs.push({ type: "info", msg: "No documents uploaded yet. Upload your credentials to get started." });
    setNotifications(notifs);
  }, [profile, files]);

  const showToast = (text, type = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast({ text: "", type: "" }), 4000);
  };

  // ── Upload handler ────────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!uploadFile || !uploadType) { 
      showToast("Please select a file and document type.", "error"); 
      return; 
    }
    if (!profileId) {
      showToast("Provider profile not loaded. Please refresh.", "error");
      return;
    }
    
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", uploadFile);
      form.append("fileType", uploadType);
      form.append("providerId", profileId);
      
      const res = await fetch(`${BASE_URL}/files/upload`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${TOKEN()}` },
        body: form,
      });
      if (!res.ok) throw new Error(`${res.status}`);
      
      showToast("Document uploaded successfully.");
      setUploadFile(null); 
      setUploadType("");
      fetchFiles(); // Refresh file list from provider_file table
    } catch (err) {
      console.error("Upload error:", err);
      showToast("Upload failed. Please try again.", "error");
    } finally {
      setUploading(false);
    }
  };

  // ── Download handler ──────────────────────────────────────────────────────
  const handleDownload = async (file) => {
    try {
      const res = await fetch(`${BASE_URL}/files/download/${file.id}`, { headers: { "Authorization": `Bearer ${TOKEN()}` } });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = file.fileName; a.click();
      URL.revokeObjectURL(url);
    } catch {
      showToast("Download failed.", "error");
    }
  };

  // ── Delete handler ────────────────────────────────────────────────────────
  const handleDelete = async (file) => {
    if (!window.confirm(`Are you sure you want to delete "${file.fileName}"?`)) return;
    
    try {
      const res = await fetch(`${BASE_URL}/files/${file.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${TOKEN()}` }
      });
      if (!res.ok) throw new Error(`${res.status}`);
      
      showToast("Document deleted successfully.");
      fetchFiles(); // Refresh file list
    } catch (err) {
      console.error("Delete error:", err);
      showToast("Delete failed. Please try again.", "error");
    }
  };

  // ── License status helpers ────────────────────────────────────────────────
  const licenseStatus = () => {
    if (!profile?.licenseExpiry) return { label: "Unknown", cls: "sc-inactive", color: "var(--muted)" };
    if (isExpired(profile.licenseExpiry))  return { label: "Expired",  cls: "sc-inactive", color: "var(--red)"   };
    if (isExpiring(profile.licenseExpiry)) return { label: "Expiring", cls: "",             color: "var(--amber)" };
    return { label: "Active", cls: "sc-active", color: "var(--green)" };
  };

  const days = daysUntil(profile?.licenseExpiry);
  const status = licenseStatus();

  // ── File type options ─────────────────────────────────────────────────────
  const fileTypes = [
    "Current license certificate uploaded",
    "Medical License (Issue/Exp Date)",
    "Board Certificate (Issue/Exp Date)",
    "Collaborative Agreement (Issue date)",
    "Curriculum Vitae / Resume (neither)",
    "DEA/CDS (Issue/Exp date)",
    "Drivers License (Issue/Exp date)",
    "Education Document (Diploma, ECMFG, etc) - issue date",
    "Hospital Arrangement Letter - Issue/Exp Date",
    "Malpractice Certificate of Insurance - Issue / Exp date",
    "Prescription Arrangement Letter",
  ];

  const fileTypeLabel = (t) => t?.replace(/_/g, " ") || t;

  // ── Group files by type ───────────────────────────────────────────────────
  const filesByType = files.reduce((acc, f) => {
    const k = f.fileType || "OTHER";
    if (!acc[k]) acc[k] = [];
    acc[k].push(f);
    return acc;
  }, {});

  const pageMeta = {
    DASHBOARD:    { title: "My Dashboard",    sub: "Your credentials and license overview" },
    DOCUMENTS:    { title: "My Documents",    sub: "Upload and manage your credential files" },
    PROFILE:      { title: "My Profile",      sub: "Your account and practice details" },
    NOTIFICATIONS:{ title: "Notifications",   sub: "Alerts and reminders" },
  };

  const navItems = [
    { key: "DASHBOARD",     label: "Dashboard"     },
    { key: "DOCUMENTS",     label: "My Documents"  },
    { key: "PROFILE",       label: "My Profile"    },
    { key: "NOTIFICATIONS", label: "Notifications" },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="ad-root">

      {/* Profile Completion Modal - shows first if not completed */}
      {showProfileModal && (
        <ProfileCompletionModal 
          isOpen={showProfileModal} 
          onClose={() => setShowProfileModal(false)}
          onComplete={() => {
            setProfileCompleted(true);
            setShowProfileModal(false);
          }}
        />
      )}

      {/* Sidebar */}
      <aside className="ad-sidebar">
        <div className="ad-logo-row">
          <div className="ad-logo-mark">{storedName.charAt(0).toUpperCase()}</div>
          <span className="ad-logo-text">{storedName.charAt(0).toUpperCase()+storedName.slice(1)}</span>
        </div>

        <nav className="ad-nav">
          <div className="ad-nav-section">
            <span className="ad-nav-section-label">Provider Portal</span>
            {navItems.map(item => (
              <button
                key={item.key}
                className={`ad-nav-btn ${activeView === item.key ? "ad-nav-active" : ""}`}
                onClick={() => setActiveView(item.key)}
              >
                <span className="ad-nav-dot" />
                {item.label}
                {item.key === "NOTIFICATIONS" && notifications.length > 0 && (
                  <span style={{
                    marginLeft: "auto", background: "var(--red)", color: "#fff",
                    borderRadius: 20, fontSize: 10, fontWeight: 700,
                    padding: "1px 7px", minWidth: 18, textAlign: "center"
                  }}>
                    {notifications.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </nav>

        <div className="ad-sidebar-bottom">
          <div className="ad-user-row">
            <div className="ad-user-ava">{storedName.charAt(0).toUpperCase()}</div>
            <div className="ad-user-info">
              <span className="ad-user-name">{storedName.charAt(0).toUpperCase()+storedName.slice(1)}</span>
              <span className="ad-user-role">Provider</span>
            </div>
          </div>
          <button className="ad-signout" onClick={() => { localStorage.clear(); window.location.href = "/login"; }}>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="ad-main-wrap">
        <header className="ad-header">
          <div>
            <h1 className="ad-header-title">{pageMeta[activeView]?.title}</h1>
            <p className="ad-header-sub">{pageMeta[activeView]?.sub}</p>
          </div>
          {notifications.length > 0 && activeView !== "NOTIFICATIONS" && (
            <button
              className="ad-btn"
              style={{ background: "var(--red-lt)", border: "1px solid var(--red)", color: "var(--red)", fontSize: 12, padding: "7px 16px" }}
              onClick={() => setActiveView("NOTIFICATIONS")}
            >
              {notifications.length} alert{notifications.length > 1 ? "s" : ""} need attention
            </button>
          )}
        </header>

        <div className="ad-content-area">

          {/* ── DASHBOARD ── */}
          {activeView === "DASHBOARD" && (
            <div>
              {/* Stat cards */}
              <div className="ad-stats-row">
                <div className="ad-stat ad-stat-blue">
                  <span className="ad-stat-num">{files.length}</span>
                  <span className="ad-stat-lbl">Documents Uploaded</span>
                </div>
                <div className="ad-stat ad-stat-sky" style={{ borderTopColor: status.color }}>
                  <span className="ad-stat-num" style={{ color: status.color, fontSize: 20 }}>{status.label}</span>
                  <span className="ad-stat-lbl">License Status</span>
                </div>
                <div className="ad-stat ad-stat-indigo" style={{ borderTopColor: days !== null && days < 0 ? "var(--red)" : days !== null && days <= 90 ? "var(--amber)" : "var(--indigo)" }}>
                  <span className="ad-stat-num" style={{ fontSize: 22 }}>
                    {days === null ? "—" : days < 0 ? `${Math.abs(days)}d ago` : `${days}d`}
                  </span>
                  <span className="ad-stat-lbl">Days Until Expiry</span>
                </div>
                <div className="ad-stat ad-stat-violet">
                  <span className="ad-stat-num">{Object.keys(filesByType).length}</span>
                  <span className="ad-stat-lbl">Document Types</span>
                </div>
              </div>

              {/* License card + quick info */}
              <div className="ad-dash-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>

                {/* License info */}
                <div className="ad-dash-card">
                  <h3 className="ad-dash-card-title">License Information</h3>
                  {loadingProfile ? (
                    <p className="ad-empty-note">Loading...</p>
                  ) : !profile ? (
                    <p className="ad-empty-note">Profile not available.</p>
                  ) : (
                    <div>
                      {[
                        { label: "License Number", value: profile.licenseNumber },
                        { label: "Expiry Date",    value: fmtDate(profile.licenseExpiry) },
                        { label: "Specialty",      value: profile.specialty },
                        { label: "Status",         value: (
                          <span className={`ad-status-chip ${status.cls}`}
                            style={status.label === "Expiring" ? { background: "var(--amber-lt)", color: "var(--amber)" } : {}}>
                            <span className="sc-dot" style={status.label === "Expiring" ? { background: "var(--amber)" } : {}} />
                            {status.label}
                          </span>
                        )},
                      ].map(row => (
                        <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                          <span style={{ fontSize: 13, color: "var(--muted)" }}>{row.label}</span>
                          <span style={{ fontSize: 13, fontWeight: 600 }}>{row.value || "—"}</span>
                        </div>
                      ))}

                      {/* Expiry progress bar */}
                      {profile.licenseExpiry && (
                        <div style={{ marginTop: 16 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>
                            <span>Time remaining</span>
                            <span style={{ color: status.color, fontWeight: 600 }}>
                              {days < 0 ? "Expired" : `${days} days`}
                            </span>
                          </div>
                          <div style={{ height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                            <div style={{
                              height: "100%",
                              borderRadius: 3,
                              background: days < 0 ? "var(--red)" : days <= 30 ? "var(--red)" : days <= 90 ? "var(--amber)" : "var(--green)",
                              width: `${Math.max(0, Math.min(100, (days / 365) * 100))}%`,
                              transition: "width 0.4s"
                            }} />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Contact / practice info */}
                <div className="ad-dash-card">
                  <h3 className="ad-dash-card-title">My Information</h3>
                  {loadingProfile ? (
                    <p className="ad-empty-note">Loading...</p>
                  ) : !profile ? (
                    <p className="ad-empty-note">Profile not available.</p>
                  ) : (
                    <div>
                      {[
                        { label: "Full Name",    value: profile.name },
                        { label: "Email",        value: profile.email },
                        { label: "Phone",        value: profile.phoneNumber },
                        { label: "Specialty",    value: profile.specialty },
                        { label: "Practice Group", value: profile.groupName || "Not assigned" },
                        { label: "Team Member",  value: profile.assignedTeamMemberName || "Not assigned" },
                      ].map(row => (
                        <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                          <span style={{ fontSize: 13, color: "var(--muted)" }}>{row.label}</span>
                          <span style={{ fontSize: 13, fontWeight: 600, maxWidth: 200, textAlign: "right" }}>{row.value || "—"}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Recent documents */}
              <div className="ad-dash-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 className="ad-dash-card-title" style={{ margin: 0 }}>Recent Documents</h3>
                  <button
                    className="ad-btn ad-btn-blue"
                    style={{ fontSize: 12, padding: "6px 16px" }}
                    onClick={() => setActiveView("DOCUMENTS")}
                  >
                    View all →
                  </button>
                </div>
                {loadingFiles ? (
                  <p className="ad-empty-note">Loading...</p>
                ) : files.length === 0 ? (
                  <p className="ad-empty-note">No documents uploaded yet. Go to My Documents to upload.</p>
                ) : (
                  <div className="ad-table-wrap">
                    <table className="ad-table ad-main-table">
                      <thead>
                        <tr><th>File Name</th><th>Type</th><th>Uploaded</th><th>Action</th></tr>
                      </thead>
                      <tbody>
                        {files.slice(0, 5).map(f => (
                          <tr key={f.id}>
                            <td><span style={{ fontWeight: 500 }}>{f.fileName}</span></td>
                            <td><span className="ad-role-chip rc-provider">{fileTypeLabel(f.fileType)}</span></td>
                            <td className="td-muted">{fmtDate(f.uploadedAt)}</td>
                            <td className="td-muted">
                              <button className="td-action-btn" onClick={() => handleDownload(f)}>↓</button>
                              <button className="td-action-btn" onClick={() => handleDelete(f)} style={{ marginLeft: '8px', color: 'var(--red)' }}>🗑️</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── DOCUMENTS ── */}
          {activeView === "DOCUMENTS" && (
            <div>
              {/* Upload card */}
              <div className="ad-form-card" style={{ marginBottom: 24 }}>
                <div className="ad-form-head">
                  <span className="ad-form-chip fc-teal">Upload New Document</span>
                  <p className="ad-form-desc">Upload your credentials, certificates, or any required document.</p>
                </div>
                <div className="ad-form-grid">
                  <div className="ad-field">
                    <label className="ad-field-lbl">Document Type</label>
                    <select
                      className="ad-field-inp ad-sel"
                      value={uploadType}
                      onChange={e => setUploadType(e.target.value)}
                    >
                      <option value="">Select type…</option>
                      {fileTypes.map(t => (
                        <option key={t} value={t}>{fileTypeLabel(t)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="ad-field">
                    <label className="ad-field-lbl">File</label>
                    <input
                      className="ad-field-inp"
                      type="file"
                      onChange={e => setUploadFile(e.target.files[0])}
                      style={{ paddingTop: 7 }}
                    />
                  </div>
                </div>
                <button
                  className="ad-btn ad-btn-teal"
                  onClick={handleUpload}
                  disabled={uploading || !uploadFile || !uploadType}
                >
                  {uploading ? <span className="ad-spin" /> : "Upload Document"}
                </button>
              </div>

              {/* Documents grouped by type */}
              {loadingFiles ? (
                <p className="ad-empty-note">Loading...</p>
              ) : files.length === 0 ? (
                <div className="ad-dash-card">
                  <p className="ad-empty-note">No documents uploaded yet.</p>
                </div>
              ) : (
                Object.entries(filesByType).map(([type, typeFiles]) => (
                  <div key={type} className="ad-dash-card" style={{ marginBottom: 16 }}>
                    <h3 className="ad-dash-card-title" style={{ marginBottom: 12 }}>
                      {fileTypeLabel(type)}
                      <span className="ad-num-badge" style={{ marginLeft: 10 }}>{typeFiles.length}</span>
                    </h3>
                    <div className="ad-table-wrap">
                      <table className="ad-table">
                        <thead>
                          <tr><th>File Name</th><th>Uploaded</th><th>Uploaded By</th><th>Download</th><th>Delete</th></tr>
                        </thead>
                        <tbody>
                          {typeFiles.map(f => (
                            <tr key={f.id}>
                              <td style={{ fontWeight: 500 }}>{f.fileName}</td>
                              <td className="td-muted">{fmtDate(f.uploadedAt)}</td>
                              <td>
                                <span style={{
                                  fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20,
                                  background: f.uploaderRole === "TEAM_MEMBER" ? "var(--blue-light)" :
                                    f.uploaderRole === "PROVIDER" ? "var(--green-lt)" : "var(--border)",
                                  color: f.uploaderRole === "TEAM_MEMBER" ? "var(--blue)" :
                                    f.uploaderRole === "PROVIDER" ? "var(--green)" : "var(--muted)",
                                }}>
                                  {f.uploadedBy || "—"} ({(f.uploaderRole || "").replace("_", " ")})
                                </span>
                              </td>
                              <td>
                                <button className="td-action-btn" onClick={() => handleDownload(f)}>↓ Download</button>
                              </td>
                              <td>
                                <button className="td-action-btn" onClick={() => handleDelete(f)} style={{ color: 'var(--red)' }}>🗑️ Delete</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── PROFILE ── */}
          {activeView === "PROFILE" && (
            <div style={{ maxWidth: 680 }}>
              <div className="ad-form-card">
                <div className="ad-form-head">
                  <span className="ad-form-chip fc-blue">Account Details</span>
                  <p className="ad-form-desc">Your profile as registered in the system. Contact your admin to update details.</p>
                </div>

                {/* Avatar row */}
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28, paddingBottom: 24, borderBottom: "1px solid var(--border)" }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: "50%",
                    background: "var(--blue-light)", border: "2px solid var(--blue-mid)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 24, fontWeight: 700, color: "var(--blue)"
                  }}>
                    {storedName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>{profile?.name || storedName}</div>
                    <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>{profile?.specialty || "Provider"}</div>
                    <span className={`ad-status-chip ${status.cls}`}
                      style={status.label === "Expiring" ? { background: "var(--amber-lt)", color: "var(--amber)", marginTop: 6, display: "inline-flex" } : { marginTop: 6, display: "inline-flex" }}>
                      <span className="sc-dot" style={status.label === "Expiring" ? { background: "var(--amber)" } : {}} />
                      License {status.label}
                    </span>
                  </div>
                </div>

                <div style={{ padding: "16px", background: "var(--blue-light)", borderRadius: "var(--radius)", marginTop: 8, fontSize: 13, color: "var(--blue)" }}>
                  To update your profile information, contact your credentialing specialist or administrator.
                </div>
              </div>
            </div>
          )}

          {/* ── NOTIFICATIONS ── */}
          {activeView === "NOTIFICATIONS" && (
            <div style={{ maxWidth: 680 }}>
              {notifications.length === 0 ? (
                <div className="ad-dash-card">
                  <div style={{ textAlign: "center", padding: "40px 0", color: "var(--muted)" }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>All clear — no alerts right now.</div>
                  </div>
                </div>
              ) : (
                notifications.map((n, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "flex-start", gap: 14,
                    padding: "16px 20px", borderRadius: "var(--radius-lg)",
                    marginBottom: 12,
                    background: n.type === "error" ? "var(--red-lt)" : n.type === "warn" ? "var(--amber-lt)" : "var(--blue-light)",
                    border: `1px solid ${n.type === "error" ? "var(--red)" : n.type === "warn" ? "var(--amber)" : "var(--blue-mid)"}`,
                  }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: "50%", marginTop: 5, flexShrink: 0,
                      background: n.type === "error" ? "var(--red)" : n.type === "warn" ? "var(--amber)" : "var(--blue)"
                    }} />
                    <div style={{
                      fontSize: 13, fontWeight: 500,
                      color: n.type === "error" ? "var(--red)" : n.type === "warn" ? "var(--amber)" : "var(--blue)"
                    }}>
                      {n.msg}
                    </div>
                  </div>
                ))
              )}

              {/* License renewal checklist */}
              <div className="ad-dash-card" style={{ marginTop: 8 }}>
                <h3 className="ad-dash-card-title">License Renewal Checklist</h3>
                <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>
                  Keep track of what you need for your next renewal.
                </p>
                {[
                  "Current license certificate uploaded",
                  "Medical License (Issue/Exp Date)",
                  "Board Certificate (Issue/Exp Date)",
                  "Collaborative Agreement (Issue date)",
                  "Curriculum Vitae / Resume (neither)",
                  "DEA/CDS (Issue/Exp date)",
                  "Drivers License (Issue/Exp date)",
                  "Education Document (Diploma, ECMFG, etc) - issue date",
                  "Hospital Arrangement Letter - Issue/Exp Date",
                  "Malpractice Certificate of Insurance - Issue / Exp date",
                  "Prescription Arrangement Letter",
                  "Renewal application submitted",
                ].map((item, i) => {
                  const fileTypesList = files.map(f => f.fileType);
                  const done = fileTypesList.includes(item);
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: 4, flexShrink: 0,
                        background: done ? "var(--green-lt)" : "var(--border)",
                        border: `1px solid ${done ? "var(--green)" : "var(--border2)"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, color: "var(--green)", fontWeight: 700
                      }}>
                        {done ? "✓" : ""}
                      </div>
                      <span style={{ fontSize: 13, color: done ? "var(--text)" : "var(--muted)", textDecoration: done ? "none" : "none", fontWeight: done ? 500 : 400 }}>
                        {item}
                      </span>
                      {!done && (
                        <button
                          className="ad-btn"
                          style={{ marginLeft: "auto", background: "none", border: "1px solid var(--border2)", color: "var(--muted)", fontSize: 11, padding: "3px 12px" }}
                          onClick={() => setActiveView("DOCUMENTS")}
                        >
                          Upload →
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Toast */}
      {toast.text && (
        <div className={`ad-toast ${toast.type === "error" ? "t-err" : "t-ok"}`}>
          <span className="t-icon">{toast.type === "error" ? "✕" : "✓"}</span>
          {toast.text}
        </div>
      )}
    </div>
    
  );
};

export default ProviderDashboard;