import React, { useState, useEffect } from 'react';
import API from '../services/api';
import './ProviderGroupsManager.css';

const ProviderGroupsManager = ({ providerId, providerName, onUpdate }) => {
  const [groups, setGroups] = useState([]);
  const [linkedGroups, setLinkedGroups] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState('');

  useEffect(() => {
    if (providerId) {
      fetchLinkedGroups();
      fetchAllGroups();
    }
  }, [providerId]);

  const fetchLinkedGroups = async () => {
    setLoading(true);
    try {
      const response = await API.get(`/groups/provider/${providerId}/all`);
      setLinkedGroups(response.data.groups || []);
    } catch (error) {
      console.error('Error fetching linked groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllGroups = async () => {
    try {
      const response = await API.get('/groups/admin/all');
      setAllGroups(response.data || []);
    } catch (error) {
      console.error('Error fetching all groups:', error);
    }
  };

  const handleLinkGroup = async () => {
    if (!selectedGroupId) {
      alert('Please select a group');
      return;
    }

    setLoading(true);
    try {
      await API.post(`/groups/${selectedGroupId}/link-provider?providerId=${providerId}`);
      await fetchLinkedGroups();
      setShowAddModal(false);
      setSelectedGroupId('');
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error linking group:', error);
      alert(error.response?.data?.error || 'Failed to link group');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlinkGroup = async (groupId, groupName, isPrimary) => {
    const message = isPrimary 
      ? `Warning: "${groupName}" is the primary group. Unlinking will clear the primary association. Continue?`
      : `Are you sure you want to remove "${groupName}" from this provider?`;
    
    if (!window.confirm(message)) return;

    setLoading(true);
    try {
      await API.delete(`/groups/${groupId}/unlink-provider/${providerId}`);
      await fetchLinkedGroups();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error unlinking group:', error);
      alert('Failed to remove group link');
    } finally {
      setLoading(false);
    }
  };

  const availableGroups = allGroups.filter(
    group => !linkedGroups.some(linked => linked.groupId === group.groupId)
  );

  return (
    <div className="provider-groups-container">
      <div className="groups-header">
        <h4>
          <i className="fas fa-layer-group"></i> Linked Groups/Clients
          <span className="groups-count">({linkedGroups.length})</span>
        </h4>
        <button className="add-group-btn" onClick={() => setShowAddModal(true)} disabled={availableGroups.length === 0}>
          <i className="fas fa-plus"></i> Link Group
        </button>
      </div>

      {loading && linkedGroups.length === 0 ? (
        <div className="groups-loading"><i className="fas fa-spinner fa-spin"></i> Loading...</div>
      ) : linkedGroups.length === 0 ? (
        <div className="groups-empty">
          <i className="fas fa-layer-group"></i>
          <p>No groups linked yet</p>
          <button className="btn-outline-sm" onClick={() => setShowAddModal(true)} disabled={availableGroups.length === 0}>
            Link to a group
          </button>
        </div>
      ) : (
        <div className="groups-list">
          {linkedGroups.map(group => (
            <div key={group.groupId} className={`group-item ${group.isPrimary ? 'primary' : ''}`}>
              <div className="group-info">
                <div className="group-name">
                  {group.groupName}
                  {group.isPrimary && <span className="primary-badge">Primary</span>}
                </div>
                <div className="group-linked-date">
                  <i className="fas fa-calendar-alt"></i> Linked: {new Date(group.linkedAt).toLocaleDateString()}
                </div>
              </div>
              <button className="unlink-btn" onClick={() => handleUnlinkGroup(group.groupId, group.groupName, group.isPrimary)}>
                <i className="fas fa-unlink"></i> Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Group Modal */}
      {showAddModal && (
        <div className="group-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="group-modal" onClick={e => e.stopPropagation()}>
            <div className="group-modal-header">
              <h4>Link Provider to Group</h4>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <div className="group-modal-body">
              <p><strong>Provider:</strong> {providerName}</p>
              <div className="form-group">
                <label>Select Group/Client</label>
                <select value={selectedGroupId} onChange={e => setSelectedGroupId(e.target.value)} className="group-select">
                  <option value="">— Select a group —</option>
                  {availableGroups.map(group => (
                    <option key={group.groupId} value={group.groupId}>{group.groupName}</option>
                  ))}
                </select>
              </div>
              {availableGroups.length === 0 && (
                <div className="info-note">
                  <i className="fas fa-info-circle"></i> No groups available. Create a group first.
                </div>
              )}
            </div>
            <div className="group-modal-footer">
              <button className="btn-cancel" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn-link" onClick={handleLinkGroup} disabled={!selectedGroupId || loading}>
                {loading ? <><i className="fas fa-spinner fa-spin"></i> Linking...</> : 'Link Group'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderGroupsManager;