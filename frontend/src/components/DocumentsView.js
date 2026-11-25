import React, { useEffect, useState } from 'react';

const BASE_URL = "http://localhost:8080";

const FILE_TYPE_LABELS = {
  GROUP_BY_PRACTICE: "Group by Practice",
  RENEWALS: "Renewals",
  CONTRACTS: "Contracts",
  PAYORS: "Payors",
  OTHER: "Other",
};

const DocumentsView = ({ providers }) => {
  const [selectedProviderId, setSelectedProviderId] = useState(null);
  const [selectedProviderName, setSelectedProviderName] = useState("");
  const [files, setFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [previewFile, setPreviewFile] = useState(null); // { id, fileName, url }
  const [uploadingFor, setUploadingFor] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");



  const token = localStorage.getItem("token");

  const fetchFiles = async (providerId) => {
    setLoadingFiles(true);
    setFiles([]);
    try {
      const res = await fetch(`${BASE_URL}/files/provider/${providerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch files");
      const data = await res.json();
      setFiles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleProviderSelect = (provider) => {
    if (selectedProviderId === provider.id) {
      setSelectedProviderId(null);
      setSelectedProviderName("");
      setFiles([]);
      setPreviewFile(null);
      return;
    }
    setSelectedProviderId(provider.id);
    setSelectedProviderName(provider.name);
    setPreviewFile(null);
    setUploadingFor(null);
    setUploadMsg("");
    fetchFiles(provider.id);
  };

  const handleDownload = (fileId, fileName) => {
    const url = `${BASE_URL}/files/download/${fileId}`;
    const a = document.createElement("a");
    a.href = url;
    a.setAttribute("download", fileName);
    // attach auth header via fetch + blob URL
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.blob())
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(blobUrl);
      })
      .catch((err) => console.error("Download error", err));
  };

  const handlePreview = (fileId, fileName) => {
    if (previewFile && previewFile.id === fileId) {
      setPreviewFile(null);
      return;
    }
    const url = `${BASE_URL}/files/download/${fileId}`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        const contentType = res.headers.get("Content-Type") || "";
        return res.blob().then((blob) => ({ blob, contentType }));
      })
      .then(({ blob, contentType }) => {
        const blobUrl = URL.createObjectURL(blob);
        setPreviewFile({ id: fileId, fileName, url: blobUrl, type: contentType });
      })
      .catch((err) => console.error("Preview error", err));
  };

  const handleUpload = async () => {
    if (!selectedFile) { setUploadMsg("Please select a file."); return; }
    try {
      setUploading(true);
      setUploadMsg("");
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("providerId", uploadingFor);
      formData.append("fileType", "OTHER");

      const res = await fetch(`${BASE_URL}/files/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        let errMsg = "Upload failed";
        try { const err = await res.json(); errMsg = err.error || errMsg; } catch {}
        setUploadMsg(errMsg);
        return;
      }

      setUploadMsg("Uploaded successfully!");
      setSelectedFile(null);

      const inp = document.getElementById(`doc-file-input-${uploadingFor}`);
      if (inp) inp.value = "";
      fetchFiles(selectedProviderId);
    } catch (err) {
      setUploadMsg("Error: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const isImage = (type) => type && type.startsWith("image/");
  const isPdf = (type) => type === "application/pdf";

  return (
    <div style={{ display: 'flex', gap: '1.5rem', padding: '1rem', height: '100%' }}>
      {/* Left: provider list */}
      <div style={{
        width: '240px',
        flexShrink: 0,
        border: '1px solid #dde',
        borderRadius: '8px',
        background: '#fafbfc',
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '0.75rem 1rem',
          borderBottom: '1px solid #dde',
          fontWeight: '600',
          color: '#34495e',
          fontSize: '0.95rem',
        }}>
          Providers
        </div>
        {providers.length === 0 && (
          <p style={{ padding: '1rem', color: '#999', fontSize: '0.9rem' }}>No providers assigned.</p>
        )}
        {providers.map((p) => (
          <div
            key={p.id}
            onClick={() => handleProviderSelect(p)}
            style={{
              padding: '0.65rem 1rem',
              cursor: 'pointer',
              background: selectedProviderId === p.id ? '#e8f4fd' : 'transparent',
              borderLeft: selectedProviderId === p.id ? '3px solid #2980b9' : '3px solid transparent',
              color: selectedProviderId === p.id ? '#2980b9' : '#34495e',
              fontSize: '0.9rem',
              transition: 'background 0.15s',
            }}
          >
            {p.name}
          </div>
        ))}
      </div>

      {/* Right: file area */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {!selectedProviderId ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '200px',
            color: '#aaa',
            fontSize: '0.95rem',
            border: '1px dashed #dde',
            borderRadius: '8px',
          }}>
            Select a provider to view documents
          </div>
        ) : (
          <>
            {/* Header row */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
            }}>
              <h2 style={{ margin: 0, color: '#34495e', fontSize: '1.1rem' }}>
                {selectedProviderName}
              </h2>
              <button
                onClick={() => {
                  setUploadingFor(uploadingFor === selectedProviderId ? null : selectedProviderId);
                  setUploadMsg("");
                  setSelectedFile(null);
                }}
                style={{
                  padding: '0.4rem 1rem',
                  background: '#2980b9',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                }}
              >
                {uploadingFor === selectedProviderId ? "Cancel Upload" : "+ Upload File"}
              </button>
            </div>

            {/* Upload panel */}
            {uploadingFor === selectedProviderId && (
              <div style={{
                marginBottom: '1rem',
                padding: '1rem',
                border: '1px solid #dde',
                borderRadius: '8px',
                background: '#f0f8ff',
              }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    id={`doc-file-input-${uploadingFor}`}
                    type="file"
                    accept=".xlsx,.xls,.csv,.pdf,.doc,.docx"
                    onChange={(e) => { setSelectedFile(e.target.files[0]); setUploadMsg(""); }}
                    style={{ flex: 1, minWidth: '180px' }}
                  />

                  <button
                    onClick={handleUpload}
                    disabled={uploading || !selectedFile}
                    style={{
                      padding: '0.4rem 1rem',
                      background: uploading || !selectedFile ? '#aaa' : '#27ae60',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: uploading || !selectedFile ? 'not-allowed' : 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                    }}
                  >
                    {uploading ? "Uploading..." : "Upload"}
                  </button>
                </div>
                {uploadMsg && (
                  <p style={{
                    marginTop: '0.5rem',
                    color: uploadMsg.includes("success") ? '#27ae60' : '#c0392b',
                    fontSize: '0.875rem',
                  }}>
                    {uploadMsg}
                  </p>
                )}
              </div>
            )}

            {/* Files table */}
            {loadingFiles ? (
              <p style={{ color: '#999', fontSize: '0.9rem' }}>Loading files...</p>
            ) : files.length === 0 ? (
              <p style={{ color: '#999', fontSize: '0.9rem' }}>No files uploaded yet for this provider.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: '#f0f4f8' }}>
                    <th style={thStyle}>File Name</th>
                    <th style={thStyle}>Type</th>
                    <th style={thStyle}>Uploaded At</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((f) => (
                    <React.Fragment key={f.id}>
                      <tr style={{ borderBottom: '1px solid #eef' }}>
                        <td style={tdStyle}>📄 {f.fileName}</td>
                        <td style={tdStyle}>
                          <span style={{
                            background: '#e8f4fd',
                            color: '#2980b9',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            fontWeight: '500',
                          }}>
                            {FILE_TYPE_LABELS[f.fileType] || f.fileType || "Other"}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          {f.uploadedAt ? new Date(f.uploadedAt).toLocaleString() : "—"}
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                          <button
                            onClick={() => handlePreview(f.id, f.fileName)}
                            style={actionBtnStyle('#7f8c8d')}
                          >
                            {previewFile && previewFile.id === f.id ? "Close Preview" : "Preview"}
                          </button>
                          <button
                            onClick={() => handleDownload(f.id, f.fileName)}
                            style={actionBtnStyle('#2980b9')}
                          >
                            Download
                          </button>
                        </td>
                      </tr>
                      {/* Inline preview row */}
                      {previewFile && previewFile.id === f.id && (
                        <tr>
                          <td colSpan={4} style={{ padding: '0.75rem', background: '#f8f9fa', border: '1px solid #dde' }}>
                            <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', color: '#555', fontWeight: '500' }}>
                              Preview: {previewFile.fileName}
                            </p>
                            {isImage(previewFile.type) && (
                              <img
                                src={previewFile.url}
                                alt={previewFile.fileName}
                                style={{ maxWidth: '100%', maxHeight: '500px', borderRadius: '4px' }}
                              />
                            )}
                            {isPdf(previewFile.type) && (
                              <iframe
                                src={previewFile.url}
                                title={previewFile.fileName}
                                style={{ width: '100%', height: '500px', border: 'none', borderRadius: '4px' }}
                              />
                            )}
                            {!isImage(previewFile.type) && !isPdf(previewFile.type) && (
                              <div style={{ color: '#666', fontSize: '0.875rem' }}>
                                <p style={{ margin: '0 0 0.75rem' }}>
                                  This file type cannot be previewed in the browser.
                                </p>
                                <button
                                  onClick={() => handleDownload(previewFile.id, previewFile.fileName)}
                                  style={actionBtnStyle('#2980b9')}
                                >
                                  Download to view
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const thStyle = {
  padding: '0.5rem 0.75rem',
  textAlign: 'left',
  border: '1px solid #dde',
  fontWeight: '600',
  color: '#34495e',
};

const tdStyle = {
  padding: '0.5rem 0.75rem',
  border: '1px solid #eef',
  color: '#34495e',
  verticalAlign: 'middle',
};

const actionBtnStyle = (color) => ({
  marginRight: '0.4rem',
  padding: '0.3rem 0.7rem',
  background: color,
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '0.8rem',
  fontWeight: '500',
});

export default DocumentsView;