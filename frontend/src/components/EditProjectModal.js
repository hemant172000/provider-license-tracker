import React, { useState, useEffect } from 'react';
import API from '../services/api';
import '../components/EditProjectModal.css';

/**
 * Edit Project Modal — allows Admin and Team Leaders to update
 * project name, description, start date, target end date, and priority.
 * Satisfies requirement #4.
 *
 * Props:
 *   isOpen      - boolean
 *   onClose     - () => void
 *   onSuccess   - (updatedProject) => void
 *   project     - the project object to edit
 *   apiBase     - '/admin/projects' | '/team-leader/projects'  (role-specific path)
 */
const EditProjectModal = ({ isOpen, onClose, onSuccess, project, apiBase = '/team-leader/projects' }) => {
  const [form, setForm] = useState({
    projectName: '',
    description: '',
    startDate: '',
    targetEndDate: '',
    priority: 'MEDIUM',
    status: 'PLANNING',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Populate form when project changes or modal opens
  useEffect(() => {
    if (isOpen && project) {
      setForm({
        projectName: project.projectName || '',
        description: project.description || '',
        startDate: project.startDate
          ? (typeof project.startDate === 'string' ? project.startDate.split('T')[0] : project.startDate)
          : '',
        targetEndDate: project.targetEndDate
          ? (typeof project.targetEndDate === 'string' ? project.targetEndDate.split('T')[0] : project.targetEndDate)
          : '',
        priority: project.priority || 'MEDIUM',
        status: project.status || 'PLANNING',
      });
      setError('');
    }
  }, [isOpen, project]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!form.projectName.trim()) {
      setError('Project name is required');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const payload = {
        projectName: form.projectName.trim(),
        description: form.description,
        startDate: form.startDate || null,
        targetEndDate: form.targetEndDate || null,
        priority: form.priority,
        status: form.status,
      };

      const res = await API.put(`${apiBase}/${project.id}`, payload);
      if (onSuccess) onSuccess(res.data.project || res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update project');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !project) return null;

  const STATUS_OPTIONS = [
    { value: 'PLANNING',    label: '📋 Planning' },
    { value: 'IN_PROGRESS', label: '▶ In Progress' },
    { value: 'ON_HOLD',     label: '⏸ On Hold' },
    { value: 'COMPLETED',   label: '✅ Completed' },
    { value: 'CANCELLED',   label: '✕ Cancelled' },
  ];

  const PRIORITY_OPTIONS = [
    { value: 'HIGH',   label: '🔴 High' },
    { value: 'MEDIUM', label: '🟡 Medium' },
    { value: 'LOW',    label: '🟢 Low' },
  ];

  return (
    <div className="epm-overlay" onClick={onClose}>
      <div className="epm-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="epm-header">
          <div className="epm-header-left">
            <div className="epm-icon"><i className="fas fa-edit"></i></div>
            <div>
              <h2 className="epm-title">Edit Project</h2>
              <p className="epm-subtitle">Update project details below</p>
            </div>
          </div>
          <button className="epm-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Body */}
        <div className="epm-body">
          {error && (
            <div className="epm-error">
              <i className="fas fa-exclamation-circle"></i> {error}
            </div>
          )}

          <div className="epm-grid">
            {/* Project Name */}
            <div className="epm-field epm-full">
              <label className="epm-label">
                Project Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                name="projectName"
                className="epm-input"
                value={form.projectName}
                onChange={handleChange}
                placeholder="Enter project name"
              />
            </div>

            {/* Description */}
            <div className="epm-field epm-full">
              <label className="epm-label">
                <i className="fas fa-align-left"></i> Description
              </label>
              <textarea
                name="description"
                className="epm-input epm-textarea"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the project goals and requirements..."
                rows={4}
              />
            </div>

            {/* Start Date */}
            <div className="epm-field">
              <label className="epm-label">
                <i className="fas fa-calendar-plus"></i> Start Date
              </label>
              <input
                type="date"
                name="startDate"
                className="epm-input"
                value={form.startDate}
                onChange={handleChange}
              />
            </div>

            {/* Target End Date */}
            <div className="epm-field">
              <label className="epm-label">
                <i className="fas fa-calendar-check"></i> Target End Date
              </label>
              <input
                type="date"
                name="targetEndDate"
                className="epm-input"
                value={form.targetEndDate}
                onChange={handleChange}
              />
            </div>

            {/* Priority */}
            <div className="epm-field">
              <label className="epm-label">
                <i className="fas fa-flag"></i> Priority
              </label>
              <select name="priority" className="epm-input" value={form.priority} onChange={handleChange}>
                {PRIORITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {/* Status */}
            <div className="epm-field">
              <label className="epm-label">
                <i className="fas fa-info-circle"></i> Status
              </label>
              <select name="status" className="epm-input" value={form.status} onChange={handleChange}>
                {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="epm-footer">
          <button className="epm-btn epm-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="epm-btn epm-btn-save" onClick={handleSave} disabled={loading}>
            {loading
              ? <><i className="fas fa-spinner fa-spin"></i> Saving...</>
              : <><i className="fas fa-save"></i> Save Changes</>
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProjectModal;