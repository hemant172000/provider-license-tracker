import React from 'react';

const ProviderTable = ({ providers, onProviderSelect, selectedProviderId }) => {
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  const getLicenseStatus = (licenseExpiry) => {
    if (!licenseExpiry) return { label: 'Unknown', cls: '' };
    const expiry = new Date(licenseExpiry);
    if (expiry < today) return { label: 'Expired', cls: 'status-expired' };
    if (expiry <= thirtyDaysFromNow) return { label: 'Expiring Soon', cls: 'status-expiring' };
    return { label: 'Active', cls: 'status-active' };
  };

  return (
    <div className="provider-table">
      <h3 style={{ padding: '12px 16px', margin: 0, color: '#34495e' }}>My Assigned Providers</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Specialty</th>
            <th>License Status</th>
            <th>Expiry Date</th>
            <th>Documents</th>
          </tr>
        </thead>
        <tbody>
          {providers.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', padding: '1rem', color: '#888' }}>
                No providers assigned yet.
              </td>
            </tr>
          ) : (
            providers.map((p) => {
              const status = getLicenseStatus(p.licenseExpiry);
              const isSelected = selectedProviderId === p.id;
              return (
                <tr
                  key={p.id}
                  style={{
                    background: isSelected ? '#eaf4fd' : '',
                    cursor: 'pointer'
                  }}
                  onClick={() => onProviderSelect && onProviderSelect(p)}
                >
                  <td className="provider-name-link" style={{ fontWeight: isSelected ? 'bold' : 'normal' }}>
                    {p.name}
                  </td>
                  <td>{p.specialty || '—'}</td>
                  <td>
                    <span className={`status-badge ${status.cls}`}>{status.label}</span>
                  </td>
                  <td>{p.licenseExpiry ? new Date(p.licenseExpiry).toLocaleDateString() : '—'}</td>
                  <td>
                    <span
                      className="view-files-link"
                      style={{ color: '#2980b9', cursor: 'pointer', textDecoration: 'underline' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onProviderSelect && onProviderSelect(p);
                      }}
                    >
                      {isSelected ? '▲ Hide Files' : '▼ View Files'}
                    </span>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProviderTable;