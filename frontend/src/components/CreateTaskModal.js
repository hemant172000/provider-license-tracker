import React, { useState, useEffect } from 'react';
import API from '../services/api';
import '../components/CreateTaskModal.css';

/**
 * Shared standalone task creation modal.
 * Used by Admin, Team Leader, and Team Member dashboards.
 *
 * Props:
 *   isOpen        - boolean
 *   onClose       - () => void
 *   onSuccess     - (task) => void  — called after successful creation
 *   assignableUsers - array of { id, fullName, role, roleLabel } — who can be assigned
 *                     if empty, task is self-assigned
 *   currentUserId - Long — to pre-select "assign to self" option
 *   providers     - array of { id, name } — optional related provider list
 */
const CreateTaskModal = ({
  isOpen,
  onClose,
  onSuccess,
  assignableUsers = [],
  currentUserId = null,
  providers = [],
}) => {
  const [insuranceNames, setInsuranceNames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    insuranceName: '',
    description: '',
    assignedToId: '',
    priority: 'MEDIUM',
    startDate: '',
    dueDate: '',
    status: 'PENDING',
    relatedProviderId: '',
  });
  const [errors, setErrors] = useState({});

  // Load insurance list once when modal opens
  useEffect(() => {
    if (isOpen && insuranceNames.length === 0) {
      API.get('/tasks/insurance-list')
        .then(res => setInsuranceNames(res.data.insuranceNames || []))
        .catch(() => setInsuranceNames([]));
    }
  }, [isOpen]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setForm({
        title: '',
        insuranceName: '',
        description: '',
        assignedToId: currentUserId ? String(currentUserId) : '',
        priority: 'MEDIUM',
        startDate: '',
        dueDate: '',
        status: 'PENDING',
        relatedProviderId: '',
      });
      setErrors({});
    }
  }, [isOpen, currentUserId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Task title is required';
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      const payload = {
        title: form.title.trim(),
        insuranceName: form.insuranceName || null,
        description: form.description.trim() || null,
        priority: form.priority,
        status: form.status,
        startDate: form.startDate || null,
        dueDate: form.dueDate || null,
        assignedToId: form.assignedToId ? Number(form.assignedToId) : null,
        relatedProviderId: form.relatedProviderId ? Number(form.relatedProviderId) : null,
      };

      const res = await API.post('/tasks/create', payload);
      if (onSuccess) onSuccess(res.data);
      onClose();
    } catch (err) {
      setErrors({ submit: err.response?.data?.error || 'Failed to create task' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const STATUS_OPTIONS = [
    { value: 'PENDING', label: 'Pending' },
    { value: 'TODO', label: 'To Do' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'IN_REVIEW', label: 'In Review' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'BLOCKED', label: 'Blocked' },
  ];

  const PRIORITY_OPTIONS = [
    { value: 'HIGH', label: '🔴 High' },
    { value: 'MEDIUM', label: '🟡 Medium' },
    { value: 'LOW', label: '🟢 Low' },
  ];

  return (
    <div className="ctm-overlay" onClick={onClose}>
      <div className="ctm-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="ctm-header">
          <div className="ctm-header-left">
            <div className="ctm-icon">
              <i className="fas fa-plus-circle"></i>
            </div>
            <div>
              <h2 className="ctm-title">Create New Task</h2>
              <p className="ctm-subtitle">Fill in the details below to create a standalone task</p>
            </div>
          </div>
          <button className="ctm-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Body */}
        <div className="ctm-body">
          {errors.submit && (
            <div className="ctm-error-banner">
              <i className="fas fa-exclamation-circle"></i> {errors.submit}
            </div>
          )}

          <div className="ctm-grid">
            {/* 1. Task Title */}
            <div className="ctm-field ctm-full">
              <label className="ctm-label">
                Task Title <span className="ctm-required">*</span>
              </label>
              <input
                type="text"
                name="title"
                className={`ctm-input ${errors.title ? 'ctm-input-error' : ''}`}
                placeholder="e.g. Submit W9 to payer"
                value={form.title}
                onChange={handleChange}
              />
              {errors.title && <span className="ctm-field-error">{errors.title}</span>}
            </div>

            {/* 2. Insurance / Payer Name dropdown */}
            <div className="ctm-field ctm-full">
              <label className="ctm-label">
                <i className="fas fa-hospital"></i> Insurance / Payer Name
              </label>
              <select
                name="insuranceName"
                className="ctm-input"
                value={form.insuranceName}
                onChange={handleChange}
              >
                <option value="">— Select insurance (optional) —</option>
                {insuranceNames.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            {/* 3. Description */}
            <div className="ctm-field ctm-full">
              <label className="ctm-label">
                <i className="fas fa-align-left"></i> Description
              </label>
              <textarea
                name="description"
                className="ctm-input ctm-textarea"
                placeholder="Describe the task in detail..."
                value={form.description}
                onChange={handleChange}
                rows={3}
              />
            </div>

            {/* 4. Assign To */}
            {assignableUsers.length > 0 && (
              <div className="ctm-field">
                <label className="ctm-label">
                  <i className="fas fa-user-check"></i> Assign To
                </label>
                <select
                  name="assignedToId"
                  className="ctm-input"
                  value={form.assignedToId}
                  onChange={handleChange}
                >
                  <option value="">— Assign to self —</option>
                  {assignableUsers.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.fullName}
                      {u.roleLabel ? ` (${u.roleLabel})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 5. Priority */}
            <div className="ctm-field">
              <label className="ctm-label">
                <i className="fas fa-flag"></i> Priority
              </label>
              <select
                name="priority"
                className="ctm-input"
                value={form.priority}
                onChange={handleChange}
              >
                {PRIORITY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* 6. Start Date */}
            <div className="ctm-field">
              <label className="ctm-label">
                <i className="fas fa-calendar-plus"></i> Start Date
              </label>
              <input
                type="date"
                name="startDate"
                className="ctm-input"
                value={form.startDate}
                onChange={handleChange}
              />
            </div>

            {/* 7. Status */}
            <div className="ctm-field">
              <label className="ctm-label">
                <i className="fas fa-tasks"></i> Status
              </label>
              <select
                name="status"
                className="ctm-input"
                value={form.status}
                onChange={handleChange}
              >
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div className="ctm-field">
              <label className="ctm-label">
                <i className="fas fa-calendar-times"></i> Due Date
              </label>
              <input
                type="date"
                name="dueDate"
                className="ctm-input"
                value={form.dueDate}
                onChange={handleChange}
              />
            </div>

            {/* Related Provider (optional) */}
            {providers.length > 0 && (
              <div className="ctm-field ctm-full">
                <label className="ctm-label">
                  <i className="fas fa-user-md"></i> Related Provider (optional)
                </label>
                <select
                  name="relatedProviderId"
                  className="ctm-input"
                  value={form.relatedProviderId}
                  onChange={handleChange}
                >
                  <option value="">— None —</option>
                  {providers.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="ctm-footer">
          <button className="ctm-btn ctm-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="ctm-btn ctm-btn-create"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? <><i className="fas fa-spinner fa-spin"></i> Creating...</>
              : <><i className="fas fa-plus"></i> Create Task</>
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTaskModal;