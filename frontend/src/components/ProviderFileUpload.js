import React, { useState } from 'react';

const BASE_URL = "http://localhost:8080";

const ProviderFileUpload = ({ providerId, providerName, onFileUploaded }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
    if (!selectedFile) { setMessage("Please select a file."); return; }

    try {
      setUploading(true);
      setMessage("");
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("providerId", providerId);
      formData.append("fileType", "OTHER");

      const res = await fetch(`${BASE_URL}/files/upload`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        let errMsg = "Upload failed";
        try {
          const err = await res.json();
          errMsg = err.error || errMsg;
        } catch {
          errMsg = `Upload failed with status: ${res.status}`;
        }
        setMessage(errMsg);
        return;
      }

      setMessage("File uploaded successfully!");
      setSelectedFile(null);
      const input = document.getElementById(`file-input-${providerId}`);
      if (input) input.value = "";
      if (onFileUploaded) onFileUploaded();
    } catch (err) {
      setMessage("Error: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{
      marginTop: '1.5rem',
      padding: '1rem 1.5rem',
      border: '1px solid #dde',
      borderRadius: '8px',
      background: '#fafbfc',
    }}>
      <h3 style={{ marginBottom: '1rem', color: '#34495e' }}>
        Upload File — {providerName}
      </h3>

      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
        <input
          id={`file-input-${providerId}`}
          type="file"
          accept=".xlsx,.xls,.csv,.pdf,.doc,.docx"
          onChange={(e) => { setSelectedFile(e.target.files[0]); setMessage(""); }}
          style={{ flex: 1, minWidth: '200px' }}
        />
        <button
          onClick={handleUpload}
          disabled={uploading || !selectedFile}
          style={{
            padding: '0.45rem 1.2rem',
            background: uploading || !selectedFile ? '#aaa' : '#2980b9',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: uploading || !selectedFile ? 'not-allowed' : 'pointer',
            fontWeight: '500',
          }}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {message && (
        <p style={{
          color: message.includes("success") ? '#27ae60' : '#c0392b',
          fontSize: '0.9rem',
          margin: 0,
        }}>
          {message}
        </p>
      )}
    </div>
  );
};

export default ProviderFileUpload;