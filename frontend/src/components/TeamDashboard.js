import React, { useState, useEffect } from 'react';
import API from '../services/api';
import SummaryCards from '../components/SummaryCards.js';
import ReplaceDocumentModal from '../components/ReplaceDocumentModal';
import DocumentHistoryModal from '../components/DocumentHistoryModal';
import { DOCUMENT_RULES, getDocumentRule, getDocumentCategories } from '../config/DocumentsConfig';
import '../components/TeamDashboard.css';
import CreateTaskModal from '../components/CreateTaskModal';

const BASE_URL = "http://localhost:8080";


// ==================== HELPER COMPONENTS ====================

const ProjectCard = ({ project, onViewDetails }) => (
  <div className="project-card" onClick={onViewDetails}>
    <div className="project-card-header">
      <div className="project-type-badge">
        {project.projectType === 'GROUP' ? 
          <i className="fas fa-layer-group"></i> : 
          <i className="fas fa-user-md"></i>
        }
        {project.projectType === 'GROUP' ? ' Group Project' : ' Provider Project'}
      </div>
      <div className={`project-priority priority-${project.priority?.toLowerCase()}`}>
        {project.priority === 'HIGH' && <i className="fas fa-arrow-up"></i>}
        {project.priority === 'MEDIUM' && <i className="fas fa-minus"></i>}
        {project.priority === 'LOW' && <i className="fas fa-arrow-down"></i>}
        {project.priority}
      </div>
    </div>
    
    <h3 className="project-title">{project.projectName}</h3>
    <p className="project-description">{project.description?.substring(0, 100)}</p>
    
    <div className="project-progress">
      <div className="progress-label">
        <span>Completion</span>
        <span>{project.completionPercentage}%</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${project.completionPercentage}%` }}></div>
      </div>
    </div>
    
    <div className="project-meta">
      <div className="meta-item">
        <i className="fas fa-calendar"></i> Due: {project.targetEndDate ? new Date(project.targetEndDate).toLocaleDateString() : 'No due date'}
      </div>
      <div className="meta-item">
        <i className="fas fa-tasks"></i> My Tasks: {project.myTasksCount || 0}
      </div>
    </div>
  </div>
);

const TaskActionButtons = ({ task, projectId, onUpdate, showToastMessage }) => {
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [showTimeInput, setShowTimeInput] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [hoursSpent, setHoursSpent] = useState('');
  const [timeDescription, setTimeDescription] = useState('');
  const [addingComment, setAddingComment] = useState(false);
  const [loggingTime, setLoggingTime] = useState(false);

  const handleAddComment = async () => {
    if (!commentText.trim()) {
      showToastMessage("Please enter a comment", "error");
      return;
    }
    setAddingComment(true);
    try {
      // Use the correct endpoint
      await API.post(`/team/projects/tasks/${task.id}/comments`, { comment: commentText });
      setCommentText('');
      setShowCommentInput(false);
      if (onUpdate) onUpdate();
      showToastMessage("Comment added successfully");
    } catch (error) {
      showToastMessage("Failed to add comment", "error");
    } finally {
      setAddingComment(false);
    }
  };

  const handleLogTime = async () => {
    if (!hoursSpent || parseInt(hoursSpent) <= 0) {
      showToastMessage("Please enter valid hours", "error");
      return;
    }
    setLoggingTime(true);
    try {
      await API.post(`/team/projects/tasks/${task.id}/time-logs`, {
        hoursSpent: parseInt(hoursSpent),
        description: timeDescription
      });
      setHoursSpent('');
      setTimeDescription('');
      setShowTimeInput(false);
      if (onUpdate) onUpdate();
      showToastMessage(`Logged ${hoursSpent} hours`);
    } catch (error) {
      showToastMessage("Failed to log time", "error");
    } finally {
      setLoggingTime(false);
    }
  };

  return (
    <div className="task-actions">
      <button className="action-btn-small" onClick={() => setShowCommentInput(!showCommentInput)}>
        <i className="fas fa-comment"></i> Add Comment
      </button>
      <button className="action-btn-small" onClick={() => setShowTimeInput(!showTimeInput)}>
        <i className="fas fa-clock"></i> Log Time
      </button>

      {showCommentInput && (
        <div className="comment-input-area">
          <textarea 
            placeholder="Add a comment..." 
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows="2"
          />
          <button onClick={handleAddComment} disabled={addingComment}>
            {addingComment ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-paper-plane"></i>} Post Comment
          </button>
        </div>
      )}

      {showTimeInput && (
        <div className="time-input-area">
          <input 
            type="number" 
            placeholder="Hours spent" 
            value={hoursSpent}
            onChange={(e) => setHoursSpent(e.target.value)}
          />
          <input 
            type="text" 
            placeholder="Description" 
            value={timeDescription}
            onChange={(e) => setTimeDescription(e.target.value)}
          />
          <button onClick={handleLogTime} disabled={loggingTime}>
            {loggingTime ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>} Log Time
          </button>
        </div>
      )}
    </div>
  );
};

// ==================== MAIN COMPONENT ====================

const TeamDashboard = () => {
  const [providers, setProviders] = useState([]);
  const [providerFiles, setProviderFiles] = useState({});
  const [teamMemberName, setTeamMemberName] = useState("");
  const [error, setError] = useState("");
  const [activeView, setActiveView] = useState("DASHBOARD");
  const [selectedProviderId, setSelectedProviderId] = useState(null);
  const [selectedProviderName, setSelectedProviderName] = useState("");
  const [filteredView, setFilteredView] = useState(null);
  
  // Document upload states
  const [uploadFile, setUploadFile] = useState(null);
  const [selectedDocId, setSelectedDocId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [uploadedDocs, setUploadedDocs] = useState({});
  const [loadingDocs, setLoadingDocs] = useState(false);
  
  // Replacement modal states
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [pendingUpload, setPendingUpload] = useState(null);
  const [existingDocument, setExistingDocument] = useState(null);
  
  // Document history modal states
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historyDocType, setHistoryDocType] = useState("");
  
  // Documents view states
  const [allDocuments, setAllDocuments] = useState([]);
  const [docSearchTerm, setDocSearchTerm] = useState("");
  const [docTypeFilter, setDocTypeFilter] = useState("ALL");
  const [docPage, setDocPage] = useState(1);
  const [docsPerPage] = useState(10);
  const [loadingDocsList, setLoadingDocsList] = useState(false);
  
  // Provider directory states
  const [providerSearch, setProviderSearch] = useState("");
  const [providerSpecialtyFilter, setProviderSpecialtyFilter] = useState("ALL");
  const [providerPage, setProviderPage] = useState(1);
  const [providersPerPage] = useState(10);
  
  // Provider stats
  const [providerStats, setProviderStats] = useState({
    total: 0,
    expiring: 0,
    expired: 0,
    documentsUploaded: 0,
    completionRate: 0
  });
  
  // Task states
  const [myTasks, setMyTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskComment, setTaskComment] = useState('');
  const [timeSpent, setTimeSpent] = useState('');
  const [timeDescription, setTimeDescription] = useState('');
  const [showTimeLog, setShowTimeLog] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [addingComment, setAddingComment] = useState(false);
  const [loggingTime, setLoggingTime] = useState(false);

  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);

  // Project states
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectDetailModal, setShowProjectDetailModal] = useState(false);
  const [projectLoading, setProjectLoading] = useState(false);
  
  // Tasks view states
  const [taskViewMode, setTaskViewMode] = useState("KANBAN");
  const [taskFilter, setTaskFilter] = useState("ALL");
  const [taskPage, setTaskPage] = useState(1);
  const [tasksPerPage] = useState(10);
  
  // Profile state
  const [profile, setProfile] = useState(null);
  
  // Task statistics
  const [taskStats, setTaskStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    inProgress: 0,
    overdue: 0
  });

  const storedName = localStorage.getItem("fullName") || "Team Member";
  const token = () => localStorage.getItem("token");

  const showToastMessage = (text, type = "success") => {
    const toastDiv = document.createElement('div');
    toastDiv.className = `ad-toast ${type === "error" ? "t-err" : "t-ok"}`;
    toastDiv.innerHTML = `<span class="t-icon">${type === "error" ? "✕" : "✓"}</span>${text}`;
    document.body.appendChild(toastDiv);
    setTimeout(() => toastDiv.remove(), 4000);
  };

  // Date helpers
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);
  const ninetyDaysFromNow = new Date();
  ninetyDaysFromNow.setDate(today.getDate() + 90);

  const isExpired = (d) => d && new Date(d) < today;
  const isExpiring30 = (d) => { 
    if (!d) return false; 
    const e = new Date(d); 
    return e >= today && e <= thirtyDaysFromNow; 
  };
  const isExpiringSoon = (d) => { 
    if (!d) return false; 
    const e = new Date(d); 
    return e >= today && e <= ninetyDaysFromNow; 
  };
  const isOverdue = (dueDate) => dueDate && new Date(dueDate) < today;
  
  // ==================== PROVIDER STATS ====================
  
  const calculateProviderStats = (providersList) => {
    const total = providersList.length;
    const expiring = providersList.filter(p => isExpiring30(p.licenseExpiry)).length;
    const expired = providersList.filter(p => isExpired(p.licenseExpiry)).length;
    
    let documentsUploaded = 0;
    providersList.forEach(p => {
      if (p.files) documentsUploaded += p.files.length;
    });
    
    const requiredDocs = 15;
    const completedProviders = providersList.filter(p => p.files && p.files.length >= requiredDocs).length;
    const completionRate = total > 0 ? Math.round((completedProviders / total) * 100) : 0;
    
    setProviderStats({ total, expiring, expired, documentsUploaded, completionRate });
  };

  useEffect(() => {
    if (providers.length > 0) {
      calculateProviderStats(providers);
    }
  }, [providers]);

  // ==================== DOCUMENT MANAGEMENT FUNCTIONS ====================
  
  const getDocumentTypeLabel = (type) => {
    const rule = getDocumentRule(type);
    return rule.label || type;
  };

  const checkDocumentExists = async (providerId, fileType) => {
    try {
      const response = await API.get(`/files/provider/${providerId}`);
      const existing = response.data.find(doc => doc.fileType === fileType && doc.isCurrent);
      return existing || null;
    } catch (error) {
      console.error("Error checking document:", error);
      return null;
    }
  };

  const uploadDocument = async (file, providerId, fileType, replacementReason = "", expiryDate = "") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("providerId", providerId);
    formData.append("fileType", fileType);
    if (replacementReason) formData.append("replacementReason", replacementReason);
    if (expiryDate) formData.append("expiryDate", expiryDate);
    
    const response = await fetch(`${BASE_URL}/files/upload`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token()}` },
      body: formData
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }
    
    return await response.json();
  };

  const handleFileSelection = async (file, docId) => {
    if (!selectedProviderId) {
      showToastMessage("Please select a provider first", "error");
      return;
    }
    
    setSelectedDocId(docId);
    setUploadFile(file);
    
    const existingDoc = await checkDocumentExists(selectedProviderId, docId);
    
    if (existingDoc && getDocumentRule(docId).type === "single") {
      setPendingUpload({ file, docId });
      setExistingDocument(existingDoc);
      setShowReplaceModal(true);
    } else {
      await performUpload(file, docId);
    }
  };

  const performUpload = async (file, docId, replacementReason = "", expiryDate = "") => {
    setUploading(true);
    try {
      await uploadDocument(file, selectedProviderId, docId, replacementReason, expiryDate);
      showToastMessage(`Successfully uploaded ${file.name}`);
      setUploadFile(null);
      setSelectedDocId("");
      
      const fileInput = document.getElementById("file-upload");
      if (fileInput) fileInput.value = "";
      
      await fetchUploadedDocuments(selectedProviderId);
      await fetchAllDocuments();
      await fetchProviders();
      
    } catch (error) {
      showToastMessage("Failed to upload file", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleReplaceConfirm = async (replacementReason, expiryDate) => {
    setShowReplaceModal(false);
    if (pendingUpload) {
      await performUpload(pendingUpload.file, pendingUpload.docId, replacementReason, expiryDate);
      setPendingUpload(null);
      setExistingDocument(null);
    }
  };

  const viewDocumentHistory = async (providerId, fileType, providerName) => {
    try {
      const response = await API.get(`/files/document-history/${providerId}/${fileType}`);
      setHistoryData(response.data.history || []);
      setHistoryDocType(fileType);
      setSelectedProviderName(providerName);
      setShowHistoryModal(true);
    } catch (error) {
      console.error("Error fetching history:", error);
      showToastMessage("Failed to load document history", "error");
    }
  };

  const handleDeleteDocument = async (docId, fileId, fileName) => {
    if (!window.confirm(`Are you sure you want to delete "${fileName}"? This action cannot be undone.`)) {
      return;
    }
    setLoadingDocs(true);
    try {
      await API.delete(`/files/${fileId}`);
      showToastMessage(`"${fileName}" deleted successfully`);
      if (selectedProviderId) {
        await fetchUploadedDocuments(selectedProviderId);
      }
      await fetchAllDocuments();
      await fetchProviders();
    } catch (error) {
      console.error("Error deleting document:", error);
      showToastMessage(error.response?.data?.error || "Failed to delete document", "error");
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      const response = await API.get(`/files/download/${fileId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      showToastMessage("Failed to download file", "error");
    }
  };

  // ==================== FETCH FUNCTIONS ====================

  const fetchProviders = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) { setError("No auth token found. Please log in again."); return; }
      const res = await fetch(`${BASE_URL}/team/my-providers`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      const list = data.providers || [];
      setProviders(list);
      setTeamMemberName(data.teamMemberName || storedName);
      
      const filesMap = {};
      list.forEach(p => { if (p.files) filesMap[p.id] = p.files; });
      setProviderFiles(filesMap);
    } catch (err) {
      setError("Could not load providers. Please try again.");
    }
  };

  const fetchUploadedDocuments = async (providerId) => {
    setLoadingDocs(true);
    try {
      const response = await API.get(`/files/provider/${providerId}`);
      const docs = {};
      if (Array.isArray(response.data)) {
        response.data.forEach(file => {
          if (file.isCurrent) {
            docs[file.fileType] = file;
          }
        });
      } else if (response.data.currentVersions) {
        Object.entries(response.data.currentVersions).forEach(([type, doc]) => {
          docs[type] = doc;
        });
      }
      setUploadedDocs(docs);
    } catch (error) {
      console.error("Error fetching documents:", error);
      setUploadedDocs({});
    } finally {
      setLoadingDocs(false);
    }
  };

  const fetchAllDocuments = async () => {
    setLoadingDocsList(true);
    try {
      const allDocs = [];
      for (const provider of providers) {
        const response = await API.get(`/files/provider/${provider.id}`);
        let providerFiles = [];
        if (Array.isArray(response.data)) {
          providerFiles = response.data;
        } else if (response.data.files) {
          providerFiles = response.data.files;
        }
        const docsWithProvider = providerFiles.map(doc => ({
          ...doc,
          providerName: provider.name,
          providerId: provider.id
        }));
        allDocs.push(...docsWithProvider);
      }
      allDocs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
      setAllDocuments(allDocs);
    } catch (error) {
      console.error("Error fetching all documents:", error);
      setAllDocuments([]);
    } finally {
      setLoadingDocsList(false);
    }
  };

  const fetchMyTasks = async () => {
    setLoadingTasks(true);
    try {
      const response = await API.get('/tasks/my-tasks');
      const tasksList = response.data.tasks || [];
      setMyTasks(tasksList);
      
      const stats = {
        total: tasksList.length,
        completed: tasksList.filter(t => t.status === 'COMPLETED').length,
        pending: tasksList.filter(t => t.status === 'TODO').length,
        inProgress: tasksList.filter(t => t.status === 'IN_PROGRESS').length,
        overdue: tasksList.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'COMPLETED').length
      };
      setTaskStats(stats);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setMyTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  };

  const fetchMyProjects = async () => {
    setProjectLoading(true);
    try {
     const response = await API.get('/team/my-projects');
      setProjects(response.data.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    } finally {
      setProjectLoading(false);
    }
  };

  const updateProjectTaskStatus = async (taskId, newStatus, projectId) => {
    try {
      await API.put(`/team/projects/tasks/${taskId}/status?status=${newStatus}`);
      showToastMessage(`Task status updated to ${newStatus}`);
      await fetchMyProjects();
      
      if (selectedProject && selectedProject.id === projectId) {
        const updatedProject = projects.find(p => p.id === projectId);
        if (updatedProject) {
          setSelectedProject(updatedProject);
        }
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      showToastMessage('Failed to update task status', 'error');
    }
  };

  // Add this function after updateProjectTaskStatus
const addProjectTaskComment = async (taskId, comment, projectId) => {
  if (!comment.trim()) {
    showToastMessage("Please enter a comment", "error");
    return;
  }
  
  try {
    await API.post(`/team/projects/tasks/${taskId}/comments`, { comment });
    showToastMessage("Comment added successfully");
    await fetchMyProjects();
    
    if (selectedProject && selectedProject.id === projectId) {
      const updatedProject = projects.find(p => p.id === projectId);
      if (updatedProject) {
        setSelectedProject(updatedProject);
      }
    }
  } catch (error) {
    console.error('Error adding comment:', error);
    showToastMessage('Failed to add comment', 'error');
  }
};

// Add this function after addProjectTaskComment
const logProjectTaskTime = async (taskId, hoursSpent, description, projectId) => {
  if (!hoursSpent || parseInt(hoursSpent) <= 0) {
    showToastMessage("Please enter valid hours", "error");
    return;
  }
  
  try {
    await API.post(`/team/projects/tasks/${taskId}/time-logs`, {
      hoursSpent: parseInt(hoursSpent),
      description: description
    });
    showToastMessage(`Logged ${hoursSpent} hours`);
    await fetchMyProjects();
    
    if (selectedProject && selectedProject.id === projectId) {
      const updatedProject = projects.find(p => p.id === projectId);
      if (updatedProject) {
        setSelectedProject(updatedProject);
      }
    }
  } catch (error) {
    console.error('Error logging time:', error);
    showToastMessage('Failed to log time', 'error');
  }
};

  const fetchProfile = async () => {
    try {
      const response = await API.get('/users/my-profile');
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  // ==================== HANDLER FUNCTIONS ====================

  const handleProviderSelect = async (provider) => {
    setSelectedProviderId(provider.id);
    setSelectedProviderName(provider.name);
    setSelectedDocId("");
    setUploadFile(null);
    await fetchUploadedDocuments(provider.id);
  };

  const getCompletionPercentage = () => {
    const categories = getDocumentCategories();
    let requiredTotal = 0;
    let uploadedRequired = 0;
    
    Object.values(categories).forEach(category => {
      category.documents.forEach(doc => {
        if (doc.required) {
          requiredTotal++;
          if (uploadedDocs[doc.id]) uploadedRequired++;
        }
      });
    });
    
    return Math.round((uploadedRequired / requiredTotal) * 100);
  };

  const toggleCategory = (categoryKey) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryKey]: !prev[categoryKey]
    }));
  };

  // ==================== TASKS FUNCTIONS ====================

  const getFilteredTasks = () => {
    if (taskFilter === "ALL") return myTasks;
    return myTasks.filter(t => t.status === taskFilter);
  };

  const filteredTasksForView = getFilteredTasks();
  const totalFilteredPages = Math.ceil(filteredTasksForView.length / tasksPerPage);
  const paginatedTasks = filteredTasksForView.slice(
    (taskPage - 1) * tasksPerPage,
    taskPage * tasksPerPage
  );

  const taskStatusCounts = {
    ALL: myTasks.length,
    TODO: myTasks.filter(t => t.status === 'TODO').length,
    IN_PROGRESS: myTasks.filter(t => t.status === 'IN_PROGRESS').length,
    IN_REVIEW: myTasks.filter(t => t.status === 'IN_REVIEW').length,
    COMPLETED: myTasks.filter(t => t.status === 'COMPLETED').length,
    BLOCKED: myTasks.filter(t => t.status === 'BLOCKED').length,
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    setUpdatingStatus(true);
    try {
      await API.put(`/tasks/${taskId}/status?status=${newStatus}`);
      showToastMessage(`Task status updated to ${newStatus}`);
      fetchMyTasks();
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask({ ...selectedTask, status: newStatus });
      }
    } catch (error) {
      showToastMessage("Failed to update task status", "error");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const addComment = async () => {
    if (!taskComment.trim()) {
      showToastMessage("Please enter a comment", "error");
      return;
    }
    setAddingComment(true);
    try {
      await API.post(`/tasks/${selectedTask.id}/comments`, { comment: taskComment });
      showToastMessage("Comment added successfully");
      setTaskComment('');
      fetchMyTasks();
      if (selectedTask) {
        const newComment = {
          id: Date.now(),
          userName: profile?.fullName || teamMemberName,
          comment: taskComment,
          createdAt: new Date().toISOString()
        };
        setSelectedTask({
          ...selectedTask,
          comments: [...(selectedTask.comments || []), newComment]
        });
      }
    } catch (error) {
      console.error("Add comment error:", error);
      showToastMessage(error.response?.data?.error || "Failed to add comment", "error");
    } finally {
      setAddingComment(false);
    }
  };

  const logTime = async () => {
    if (!timeSpent || parseInt(timeSpent) <= 0) {
      showToastMessage("Please enter valid hours", "error");
      return;
    }
    setLoggingTime(true);
    try {
      await API.post(`/tasks/${selectedTask.id}/time-logs`, { 
        hoursSpent: parseInt(timeSpent), 
        description: timeDescription 
      });
      showToastMessage(`Logged ${timeSpent} hours`);
      setTimeSpent('');
      setTimeDescription('');
      setShowTimeLog(false);
      fetchMyTasks();
    } catch (error) {
      console.error("Log time error:", error);
      showToastMessage(error.response?.data?.error || "Failed to log time", "error");
    } finally {
      setLoggingTime(false);
    }
  };

  // ==================== SUMMARY CARDS HANDLERS ====================

  const handleAssignedProvidersClick = () => {
    setFilteredView({ label: "All Providers", providers: providers, filterType: "ALL" });
    setActiveView("FILTERED");
    setSelectedProviderId(null);
  };

  const handleExpiringClick = () => {
    const filtered = providers.filter(p => isExpiring30(p.licenseExpiry));
    setFilteredView({ label: "Expiring Licenses", providers: filtered, filterType: "EXPIRING" });
    setActiveView("FILTERED");
    setSelectedProviderId(null);
  };

  const handleExpiredClick = () => {
    const filtered = providers.filter(p => isExpired(p.licenseExpiry));
    setFilteredView({ label: "Expired Licenses", providers: filtered, filterType: "EXPIRED" });
    setActiveView("FILTERED");
    setSelectedProviderId(null);
  };

  const handleGroupByPracticeClick = () => {
    const allFiles = Object.values(providerFiles || {}).flat();
    const providerIdsWithDocs = allFiles.filter(f => f.fileType === "GROUP_BY_PRACTICE").map(f => f.providerId);
    const filtered = providers.filter(p => providerIdsWithDocs.includes(p.id));
    setFilteredView({ label: "Group By Practice Documents", providers: filtered, filterType: "GROUP_BY_PRACTICE" });
    setActiveView("FILTERED");
    setSelectedProviderId(null);
  };

  const handleRenewalsClick = () => {
    const allFiles = Object.values(providerFiles || {}).flat();
    const providerIdsWithDocs = allFiles.filter(f => f.fileType === "RENEWALS").map(f => f.providerId);
    const filtered = providers.filter(p => providerIdsWithDocs.includes(p.id));
    setFilteredView({ label: "Upcoming Renewals Documents", providers: filtered, filterType: "RENEWALS" });
    setActiveView("FILTERED");
    setSelectedProviderId(null);
  };

  const handleRecredentialingClick = () => {
    const allFiles = Object.values(providerFiles || {}).flat();
    const providerIdsWithDocs = allFiles.filter(f => f.fileType === "RECREDENTIALING").map(f => f.providerId);
    const filtered = providers.filter(p => providerIdsWithDocs.includes(p.id));
    setFilteredView({ label: "Recredentialing Documents", providers: filtered, filterType: "RECREDENTIALING" });
    setActiveView("FILTERED");
    setSelectedProviderId(null);
  };

  const handleContractsClick = () => {
    const allFiles = Object.values(providerFiles || {}).flat();
    const providerIdsWithDocs = allFiles.filter(f => f.fileType === "CONTRACTS").map(f => f.providerId);
    const filtered = providers.filter(p => providerIdsWithDocs.includes(p.id));
    setFilteredView({ label: "Contracts Documents", providers: filtered, filterType: "CONTRACTS" });
    setActiveView("FILTERED");
    setSelectedProviderId(null);
  };

  const handlePayorsClick = () => {
    const allFiles = Object.values(providerFiles || {}).flat();
    const providerIdsWithDocs = allFiles.filter(f => f.fileType === "PAYORS").map(f => f.providerId);
    const filtered = providers.filter(p => providerIdsWithDocs.includes(p.id));
    setFilteredView({ label: "Payors Documents", providers: filtered, filterType: "PAYORS" });
    setActiveView("FILTERED");
    setSelectedProviderId(null);
  };

  // ==================== UI HELPER FUNCTIONS ====================

  const getStatusColor = (status) => {
    switch(status) {
      case 'TODO': return '#95a5a6';
      case 'IN_PROGRESS': return '#3498db';
      case 'IN_REVIEW': return '#f39c12';
      case 'COMPLETED': return '#27ae60';
      case 'BLOCKED': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const getPriorityIcon = (priority) => {
    switch(priority) {
      case 'HIGH': return '🔴';
      case 'MEDIUM': return '🟡';
      case 'LOW': return '🟢';
      default: return '⚪';
    }
  };

  const getStatusColorLight = (status) => {
    switch(status) {
      case 'TODO': return '#e0e0e0';
      case 'IN_PROGRESS': return '#3498db';
      case 'IN_REVIEW': return '#f39c12';
      case 'COMPLETED': return '#27ae60';
      case 'BLOCKED': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  // Reset pagination
  useEffect(() => {
    setTaskPage(1);
  }, [taskFilter]);

  useEffect(() => {
    setDocPage(1);
  }, [docSearchTerm, docTypeFilter]);

  useEffect(() => {
    setProviderPage(1);
  }, [providerSearch, providerSpecialtyFilter]);

  useEffect(() => {
    fetchProviders();
    fetchMyTasks();
    fetchProfile();
    fetchMyProjects();
  }, []);

  useEffect(() => {
    if (providers.length > 0 && activeView === "DOCUMENTS") {
      fetchAllDocuments();
    }
  }, [providers, activeView]);

  useEffect(() => {
    const userRole = localStorage.getItem("role");
    console.log("Current user role:", userRole);
    
    if (userRole !== "TEAM_MEMBER") {
        console.warn("User is not a TEAM_MEMBER, role is:", userRole);
    }
}, []);

  // ==================== PROVIDER DIRECTORY ====================

  const filteredProvidersList = providers.filter(provider => {
    if (providerSearch && !provider.name?.toLowerCase().includes(providerSearch.toLowerCase()) &&
        !provider.specialty?.toLowerCase().includes(providerSearch.toLowerCase())) {
      return false;
    }
    if (providerSpecialtyFilter !== "ALL" && provider.specialty !== providerSpecialtyFilter) {
      return false;
    }
    return true;
  });

  const totalProviderPages = Math.ceil(filteredProvidersList.length / providersPerPage);
  const paginatedProviders = filteredProvidersList.slice(
    (providerPage - 1) * providersPerPage,
    providerPage * providersPerPage
  );

  // ==================== FILTERED DOCUMENTS ====================

  const filteredDocuments = allDocuments.filter(doc => {
    if (docSearchTerm && !doc.providerName?.toLowerCase().includes(docSearchTerm.toLowerCase()) && 
        !doc.fileName?.toLowerCase().includes(docSearchTerm.toLowerCase())) {
      return false;
    }
    if (docTypeFilter !== "ALL" && doc.fileType !== docTypeFilter) {
      return false;
    }
    return true;
  });

  const totalDocPages = Math.ceil(filteredDocuments.length / docsPerPage);
  const paginatedDocuments = filteredDocuments.slice(
    (docPage - 1) * docsPerPage,
    docPage * docsPerPage
  );

  // ==================== TASK LIST VIEW COMPONENT ====================

  const TaskListView = () => (
    <div className="task-list-view">
      <div className="task-list-header">
        <div className="task-list-col" style={{ width: '30%' }}>Title</div>
        <div className="task-list-col" style={{ width: '35%' }}>Description</div>
        <div className="task-list-col" style={{ width: '15%' }}>Priority</div>
        <div className="task-list-col" style={{ width: '20%' }}>Due Date</div>
      </div>
      <div className="task-list-body">
        {paginatedTasks.map(task => (
          <div key={task.id} className="task-list-row" onClick={() => { setSelectedTask(task); setShowTaskModal(true); }}>
            <div className="task-list-col" style={{ width: '30%' }}>
              <div className="task-title-cell">
                <span className="task-status-dot" style={{ background: getStatusColorLight(task.status) }}></span>
                <span>{task.title}</span>
              </div>
            </div>
            <div className="task-list-col" style={{ width: '35%' }}>
              <span className="task-description-preview">{task.description?.length > 60 ? task.description.substring(0, 60) + '...' : task.description || '—'}</span>
            </div>
            <div className="task-list-col" style={{ width: '15%' }}>
              <span className={`priority-badge priority-${task.priority?.toLowerCase()}`}>{getPriorityIcon(task.priority)} {task.priority}</span>
            </div>
            <div className="task-list-col" style={{ width: '20%' }}>
              <span className={`due-date ${isOverdue(task.dueDate) ? 'overdue' : ''}`}>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</span>
            </div>
          </div>
        ))}
      </div>
      {totalFilteredPages > 1 && (
        <div className="pagination-container">
          <button className="pagination-btn" onClick={() => setTaskPage(p => Math.max(1, p - 1))} disabled={taskPage === 1}>← Previous</button>
          <div className="pagination-pages">
            {Array.from({ length: Math.min(5, totalFilteredPages) }, (_, i) => {
              let pageNum;
              if (totalFilteredPages <= 5) pageNum = i + 1;
              else if (taskPage <= 3) pageNum = i + 1;
              else if (taskPage >= totalFilteredPages - 2) pageNum = totalFilteredPages - 4 + i;
              else pageNum = taskPage - 2 + i;
              return (<button key={pageNum} className={`pagination-page ${taskPage === pageNum ? "active" : ""}`} onClick={() => setTaskPage(pageNum)}>{pageNum}</button>);
            })}
          </div>
          <button className="pagination-btn" onClick={() => setTaskPage(p => Math.min(totalFilteredPages, p + 1))} disabled={taskPage === totalFilteredPages}>Next →</button>
        </div>
      )}
      <div className="pagination-info">Showing {((taskPage - 1) * tasksPerPage) + 1} to {Math.min(taskPage * tasksPerPage, filteredTasksForView.length)} of {filteredTasksForView.length} tasks</div>
    </div>
  );

  // ==================== PROVIDER ROWS COMPONENT ====================

  const ProviderRows = ({ list, showUpload }) => (
    <div className="ad-table-wrap">
      <table className="ad-table ad-main-table">
        <thead>
          <tr>
            <th>Provider</th>
            <th>Specialty</th>
            <th>License #</th>
            <th>Expiry</th>
            <th>Status</th>
            {showUpload && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {list.length === 0 ? (
            <tr><td colSpan={showUpload ? 6 : 5} className="td-empty">No providers found</td></tr>
          ) : list.map(p => {
            const expired = isExpired(p.licenseExpiry);
            const expiring = isExpiring30(p.licenseExpiry);
            const selected = selectedProviderId === p.id;
            return (
              <tr key={p.id} style={{ background: selected ? "var(--blue-light)" : undefined }}>
                <td><div className="td-name-wrap"><div className="td-avatar">{p.name?.charAt(0)?.toUpperCase() || "?"}</div><div><div className="td-name">{p.name || "—"}</div><div className="td-sub">{p.email || "—"}</div></div></div></td>
                <td className="td-muted">{p.specialty || "—"}</td>
                <td className="td-muted">{p.licenseNumber || "—"}</td>
                <td className="td-muted">{p.licenseExpiry || "—"}</td>
                <td>{expired ? <span className="ad-status-chip sc-inactive"><span className="sc-dot" />Expired</span> : expiring ? <span className="ad-status-chip" style={{ background: "var(--amber-lt)", color: "var(--amber)" }}><span className="sc-dot" style={{ background: "var(--amber)" }} />Expiring</span> : <span className="ad-status-chip sc-active"><span className="sc-dot" />Active</span>}</td>
                {showUpload && (<td><button onClick={() => handleProviderSelect(p)} className={`ad-btn ${selected ? "ad-btn-blue" : ""}`} style={!selected ? { background: "var(--page-bg)", border: "1px solid var(--border2)", color: "var(--muted)", fontSize: 12, padding: "6px 14px" } : { fontSize: 12, padding: "6px 14px" }}>{selected ? "Selected ✓" : "Select"}</button></td>)}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  // ==================== DOCUMENT UPLOAD SECTION ====================

  const DocumentUploadSection = () => {
    const completionPercentage = getCompletionPercentage();
    const categories = getDocumentCategories();
    const sortedCategories = Object.entries(categories).sort((a, b) => a[1].order - b[1].order);

    return (
      <div className="document-upload-section">
        <div className="upload-header">
          <div className="upload-header-title">
            <h3>Upload Documents for {selectedProviderName}</h3>
            <button className="close-selection-btn" onClick={() => { setSelectedProviderId(null); setSelectedProviderName(""); setSelectedDocId(""); setUploadFile(null); setUploadedDocs({}); }}>✕</button>
          </div>
          <p className="upload-subtitle">Upload required credentialing documents. Required documents are marked with <span className="required-star">*</span></p>
        </div>

        <div className="completion-progress-container">
          <div className="progress-header"><span className="progress-title">Credentialing Completion</span><span className="progress-percentage">{completionPercentage}%</span></div>
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${completionPercentage}%` }} /></div>
          <div className="progress-stats"><span>✅ {Object.values(uploadedDocs).length} documents uploaded</span>{completionPercentage === 100 && <span className="complete-badge">🎉 Ready for Review!</span>}</div>
        </div>

        <div className="categories-container">
          {sortedCategories.map(([categoryKey, category]) => {
            const isExpanded = expandedCategories[categoryKey];
            const uploadedCount = category.documents.filter(doc => uploadedDocs[doc.id]).length;
            const totalCount = category.documents.length;
            
            return (
              <div key={categoryKey} className="category-card">
                <div className="category-header" onClick={() => toggleCategory(categoryKey)}>
                  <div className="category-title"><span className="category-icon">{category.icon}</span><span className="category-name">{category.name}</span></div>
                  <div className="category-stats"><span className="upload-count">{uploadedCount}/{totalCount} uploaded</span><span className="category-toggle">{isExpanded ? "▼" : "▶"}</span></div>
                </div>
                {isExpanded && (
                  <div className="category-documents">
                    {category.documents.map(doc => {
                      const isUploaded = !!uploadedDocs[doc.id];
                      const uploadedDoc = uploadedDocs[doc.id];
                      const docRule = getDocumentRule(doc.id);
                      
                      return (
                        <div key={doc.id} className={`document-row ${isUploaded ? 'uploaded' : ''}`}>
                          <div className="document-info">
                            <div className="document-name">{doc.name}{doc.required && <span className="required-badge">Required</span>}</div>
                            {doc.helpText && <div className="document-help">{doc.helpText}</div>}
                            {docRule.type === "multiple" && <div className="doc-type-badge-small">Multiple versions allowed</div>}
                          </div>
                          {isUploaded ? (
                            <div className="document-actions">
                              <div className="document-status"><span className="uploaded-check">✓</span><span className="uploaded-text">Uploaded</span><span className="uploaded-date">{new Date(uploadedDoc?.uploadedAt).toLocaleDateString()}</span></div>
                              <div className="action-buttons">
                                <button className="action-btn history-btn" onClick={() => viewDocumentHistory(selectedProviderId, doc.id, selectedProviderName)}>📜 History</button>
                                <button className="action-btn reupload-btn" onClick={() => { const input = document.getElementById('file-upload'); input.dataset.docId = doc.id; input.click(); }}>🔄 Replace</button>
                                <button className="action-btn delete-btn" onClick={() => handleDeleteDocument(doc.id, uploadedDoc.id, uploadedDoc.fileName)}>🗑️ Delete</button>
                              </div>
                            </div>
                          ) : (
                            <button className="upload-doc-btn" onClick={() => { const input = document.getElementById('file-upload'); input.dataset.docId = doc.id; input.click(); }}>+ Upload</button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <input id="file-upload" type="file" style={{ display: 'none' }} onChange={e => { const docId = e.target.dataset.docId; if (e.target.files[0] && docId) { handleFileSelection(e.target.files[0], docId); e.target.value = ''; } }} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
        {uploading && (<div className="uploading-indicator"><div className="spinner"></div><span>Uploading document...</span></div>)}
      </div>
    );
  };

  // ==================== PAGE META & NAVIGATION ====================

  const pageMeta = {
    DASHBOARD: { title: "Dashboard", sub: "Overview of your assigned providers and tasks" },
    MY_PROVIDERS: { title: "My Providers", sub: "Select a provider to upload documents" },
    PROVIDER_DIRECTORY: { title: "Provider Directory", sub: "View all your assigned providers" },
    DOCUMENTS: { title: "Documents", sub: "Browse all provider documents" },
    MY_TASKS: { title: "My Tasks", sub: "View and manage your assigned tasks" },
    MY_PROJECTS: { title: "My Projects", sub: "View projects you're assigned to" },
    PROFILE: { title: "My Profile", sub: "Your account information" },
    FILTERED: { title: filteredView?.label || "", sub: `${filteredView?.providers?.length ?? 0} provider(s)` },
  };

  const navItems = [
    { key: "DASHBOARD", label: "Dashboard" },
    { key: "MY_PROVIDERS", label: "My Providers" },
    { key: "PROVIDER_DIRECTORY", label: "Provider Directory" },
    { key: "DOCUMENTS", label: "Documents" },
    { key: "MY_TASKS", label: "My Tasks" },
    { key: "MY_PROJECTS", label: "My Projects" },
    { key: "PROFILE", label: "My Profile" },
  ];

  const userInitial = teamMemberName?.charAt(0)?.toUpperCase() || "T";

  return (
    <div className="ad-root">
      {/* Sidebar */}
      <aside className="ad-sidebar">
        <div className="ad-logo-row">
          <div className="ad-logo-mark">{userInitial}</div>
          <div><span className="ad-logo-text">{teamMemberName}</span><div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>Credentialing Specialist</div></div>
        </div>
        <nav className="ad-nav">
          <div className="ad-nav-section">
            <span className="ad-nav-section-label">Main Menu</span>
            {navItems.map(item => (
              <button key={item.key} className={`ad-nav-btn ${activeView === item.key ? "ad-nav-active" : ""}`} onClick={() => { setActiveView(item.key); setFilteredView(null); setSelectedProviderId(null); setSelectedProviderName(""); }}>
                <span className="ad-nav-dot" />{item.label}
                {item.key === "MY_TASKS" && taskStats.pending > 0 && <span style={{ marginLeft: "auto", background: "var(--red)", color: "#fff", borderRadius: 20, fontSize: 10, fontWeight: 700, padding: "1px 7px" }}>{taskStats.pending}</span>}
              </button>
            ))}
            {navItems.map(item => (
  <button key={item.key} className={`ad-nav-btn ${activeView === item.key ? "ad-nav-active" : ""}`} onClick={() => { setActiveView(item.key); setFilteredView(null); setSelectedProviderId(null); setSelectedProviderName(""); }}>
    <span className="ad-nav-dot" />{item.label}
    {item.key === "MY_TASKS" && taskStats.pending > 0 && <span style={{ marginLeft: "auto", background: "var(--red)", color: "#fff", borderRadius: 20, fontSize: 10, fontWeight: 700, padding: "1px 7px" }}>{taskStats.pending}</span>}
  </button>
))}
<button 
  className="ad-nav-btn"
  onClick={() => setShowCreateTaskModal(true)}
>
  <span className="ad-nav-dot" /> Create Task
</button>
          </div>
        </nav>
        <div className="ad-sidebar-bottom">
          <div className="ad-user-row"><div className="ad-user-ava">{userInitial}</div><div className="ad-user-info"><span className="ad-user-name">{teamMemberName}</span><span className="ad-user-role">Credentialing Specialist</span></div></div>
          <button className="ad-signout" onClick={() => { localStorage.clear(); window.location.href = "/login"; }}>Sign out</button>
        </div>
      </aside>

      <div className="ad-main-wrap">
        <header className="ad-header">
          <div><h1 className="ad-header-title">{pageMeta[activeView]?.title}</h1><p className="ad-header-sub">{pageMeta[activeView]?.sub}</p></div>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>Welcome back, <strong>{teamMemberName}</strong></div>
        </header>

        <div className="ad-content-area">
          {error && <div style={{ background: "var(--red-lt)", border: "1px solid var(--red)", borderRadius: "var(--radius)", padding: "12px 16px", marginBottom: 20, color: "var(--red)", fontSize: 13 }}>{error}</div>}

          {/* DASHBOARD VIEW */}
          {activeView === "DASHBOARD" && (
            <div>
              <SummaryCards 
                providers={providers}
                providerFiles={providerFiles}
                onAssignedProvidersClick={handleAssignedProvidersClick}
                onExpiringClick={handleExpiringClick}
                onExpiredClick={handleExpiredClick}
                onGroupByPracticeClick={handleGroupByPracticeClick}
                onRenewalsClick={handleRenewalsClick}
                onRecredentialingClick={handleRecredentialingClick}
                onContractsClick={handleContractsClick}
                onPayorsClick={handlePayorsClick}
              />
              
              <div className="ad-dash-card" style={{ marginBottom: 20 }}>
                <h3 className="ad-dash-card-title">My Task Summary</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, textAlign: 'center' }}>
                  <div><div style={{ fontSize: 24, fontWeight: 'bold', color: 'var(--blue)' }}>{taskStats.total}</div><div style={{ fontSize: 12, color: 'var(--muted)' }}>Total Tasks</div></div>
                  <div><div style={{ fontSize: 24, fontWeight: 'bold', color: 'var(--amber)' }}>{taskStats.pending}</div><div style={{ fontSize: 12, color: 'var(--muted)' }}>To Do</div></div>
                  <div><div style={{ fontSize: 24, fontWeight: 'bold', color: 'var(--sky)' }}>{taskStats.inProgress}</div><div style={{ fontSize: 12, color: 'var(--muted)' }}>In Progress</div></div>
                  <div><div style={{ fontSize: 24, fontWeight: 'bold', color: 'var(--green)' }}>{taskStats.completed}</div><div style={{ fontSize: 12, color: 'var(--muted)' }}>Completed</div></div>
                  <div><div style={{ fontSize: 24, fontWeight: 'bold', color: 'var(--red)' }}>{taskStats.overdue}</div><div style={{ fontSize: 12, color: 'var(--muted)' }}>Overdue</div></div>
                </div>
              </div>

              <div className="ad-dash-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 className="ad-dash-card-title" style={{ margin: 0 }}>Recent Tasks</h3>
                  <button className="ad-btn ad-btn-blue" style={{ fontSize: 12, padding: "6px 16px" }} onClick={() => setActiveView("MY_TASKS")}>View all →</button>
                </div>
                {myTasks.slice(0, 5).map(task => (
                  <div key={task.id} style={{ padding: 12, borderBottom: "1px solid var(--border)", cursor: "pointer" }} onClick={() => { setSelectedTask(task); setShowTaskModal(true); }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div><strong>{task.title}</strong> <span style={{ fontSize: 11, padding: '2px 6px', borderRadius: 12, background: getStatusColor(task.status), color: '#fff' }}>{task.status?.replace('_', ' ')}</span></div>
                      <span>{getPriorityIcon(task.priority)}</span>
                    </div>
                    {task.dueDate && <div style={{ fontSize: 11, color: isOverdue(task.dueDate) ? 'var(--red)' : 'var(--muted)', marginTop: 4 }}>Due: {new Date(task.dueDate).toLocaleDateString()}</div>}
                  </div>
                ))}
                {myTasks.length === 0 && <p className="ad-empty-note">No tasks assigned yet.</p>}
              </div>

              <div className="ad-dash-card">
                <h3 className="ad-dash-card-title">All Assigned Providers</h3>
                <ProviderRows list={providers} showUpload={false} />
              </div>
            </div>
          )}
          
          {/* MY PROVIDERS VIEW */}
          {activeView === "MY_PROVIDERS" && (
            <div>
              <div className="ad-dash-card" style={{ marginBottom: 0 }}><h3 className="ad-dash-card-title">My Providers ({providers.length})</h3><ProviderRows list={providers} showUpload={true} /></div>
              {selectedProviderId && <DocumentUploadSection />}
              {!selectedProviderId && (<div className="ad-dash-card" style={{ marginTop: 20, textAlign: 'center', padding: 40 }}><p className="ad-empty-note">Select a provider from above to upload documents</p></div>)}
            </div>
          )}

          {/* PROVIDER DIRECTORY VIEW */}
          {activeView === "PROVIDER_DIRECTORY" && (
            <div className="ad-dash-card">
              <h3>Provider Directory ({providers.length})</h3>
              <div className="provider-directory-filters">
                <div className="search-box"><input type="text" placeholder="Search by name or specialty..." className="ad-field-inp" value={providerSearch} onChange={(e) => setProviderSearch(e.target.value)} /></div>
                <select className="ad-field-inp" value={providerSpecialtyFilter} onChange={(e) => setProviderSpecialtyFilter(e.target.value)} style={{ width: '180px' }}>
                  <option value="ALL">All Specialties</option>
                  {[...new Set(providers.map(p => p.specialty).filter(Boolean))].map(specialty => <option key={specialty} value={specialty}>{specialty}</option>)}
                </select>
              </div>
              <div className="ad-table-wrap">
                <table className="ad-table">
                  <thead>
                    <tr><th>Name</th><th>Specialty</th><th>License #</th><th>License Status</th><th>Documents</th></tr>
                  </thead>
                  <tbody>
                    {paginatedProviders.map(provider => (
                      <tr key={provider.id}>
                        <td>{provider.name}</td>
                        <td className="td-muted">{provider.specialty || '—'}</td>
                        <td className="td-muted">{provider.licenseNumber || '—'}</td>
                        <td className="td-muted">
                          <span className={`status-badge ${isExpired(provider.licenseExpiry) ? 'expired' : isExpiring30(provider.licenseExpiry) ? 'expiring' : 'active'}`}>
                            {isExpired(provider.licenseExpiry) ? 'Expired' : isExpiring30(provider.licenseExpiry) ? 'Expiring Soon' : 'Active'}
                          </span>
                        </td>
                        <td className="td-muted">
                          <button className="td-action-btn" onClick={() => { handleProviderSelect(provider); setActiveView('MY_PROVIDERS'); }}>📄 Manage Docs</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalProviderPages > 1 && (
                <div className="pagination-container">
                  <button className="pagination-btn" onClick={() => setProviderPage(p => Math.max(1, p - 1))} disabled={providerPage === 1}>← Previous</button>
                  <div className="pagination-pages">
                    {Array.from({ length: Math.min(5, totalProviderPages) }, (_, i) => {
                      let pageNum;
                      if (totalProviderPages <= 5) pageNum = i + 1;
                      else if (providerPage <= 3) pageNum = i + 1;
                      else if (providerPage >= totalProviderPages - 2) pageNum = totalProviderPages - 4 + i;
                      else pageNum = providerPage - 2 + i;
                      return (<button key={pageNum} className={`pagination-page ${providerPage === pageNum ? "active" : ""}`} onClick={() => setProviderPage(pageNum)}>{pageNum}</button>);
                    })}
                  </div>
                  <button className="pagination-btn" onClick={() => setProviderPage(p => Math.min(totalProviderPages, p + 1))} disabled={providerPage === totalProviderPages}>Next →</button>
                </div>
              )}
              <div className="pagination-info">Showing {((providerPage - 1) * providersPerPage) + 1} to {Math.min(providerPage * providersPerPage, filteredProvidersList.length)} of {filteredProvidersList.length} providers</div>
            </div>
          )}

          {/* DOCUMENTS VIEW */}
          {activeView === "DOCUMENTS" && (
            <div className="documents-container">
              <div className="documents-header">
                <h3>All Documents</h3>
                <div className="documents-filters">
                  <div className="search-box"><input type="text" placeholder="Search by provider or file name..." className="ad-field-inp" value={docSearchTerm} onChange={(e) => setDocSearchTerm(e.target.value)} /></div>
                  <select className="ad-field-inp" value={docTypeFilter} onChange={(e) => setDocTypeFilter(e.target.value)} style={{ width: '180px' }}>
                    <option value="ALL">All Document Types</option>
                    {Object.entries(DOCUMENT_RULES).map(([key, rule]) => <option key={key} value={key}>{rule.icon} {rule.label}</option>)}
                  </select>
                  <button className="refresh-btn" onClick={() => fetchAllDocuments()} title="Refresh documents">🔄</button>
                </div>
              </div>
              {loadingDocsList ? (<div className="loading-state">Loading documents...</div>) : paginatedDocuments.length === 0 ? (
                <div className="empty-documents"><div className="empty-icon">📄</div><p>No documents found</p><p className="empty-sub">Upload documents from the My Providers section</p></div>
              ) : (
                <>
                  <div className="documents-table-wrapper">
                    <table className="documents-table">
                      <thead>
                        <tr><th>Provider</th><th>Document Type</th><th>File Name</th><th>Version</th><th>Uploaded By</th><th>Uploaded Date</th><th>Actions</th></tr>
                      </thead>
                      <tbody>
                        {paginatedDocuments.map(doc => (
                          <tr key={doc.id}>
                            <td><div className="provider-cell"><div className="provider-avatar">{doc.providerName?.charAt(0) || "?"}</div><span>{doc.providerName}</span></div></td>
                            <td><span className="doc-type-badge">{getDocumentTypeLabel(doc.fileType)}</span></td>
                            <td>{doc.fileName}</td>
                            <td><span className="version-badge">v{doc.version}</span>{doc.isCurrent && <span className="current-badge">Current</span>}</td>
                            <td><div className="uploader-cell"><span className="uploader-name">{doc.uploadedBy}</span><span className="uploader-role">{doc.uploaderRole?.replace('_', ' ')}</span></div></td>
                            <td>{new Date(doc.uploadedAt).toLocaleDateString()}</td>
                            <td><div className="doc-actions">
                              <button className="doc-action-btn history-btn" onClick={() => viewDocumentHistory(doc.providerId, doc.fileType, doc.providerName)} title="View History">📜</button>
                              <button className="doc-action-btn view-btn" onClick={() => handleDownload(doc.id, doc.fileName)} title="Download">📥</button>
                              <button className="doc-action-btn delete-btn" onClick={() => handleDeleteDocument(doc.id, doc.id, doc.fileName)} title="Delete">🗑️</button>
                            </div></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {totalDocPages > 1 && (
                    <div className="pagination-container">
                      <button className="pagination-btn" onClick={() => setDocPage(p => Math.max(1, p - 1))} disabled={docPage === 1}>← Previous</button>
                      <div className="pagination-pages">
                        {Array.from({ length: Math.min(5, totalDocPages) }, (_, i) => {
                          let pageNum;
                          if (totalDocPages <= 5) pageNum = i + 1;
                          else if (docPage <= 3) pageNum = i + 1;
                          else if (docPage >= totalDocPages - 2) pageNum = totalDocPages - 4 + i;
                          else pageNum = docPage - 2 + i;
                          return (<button key={pageNum} className={`pagination-page ${docPage === pageNum ? "active" : ""}`} onClick={() => setDocPage(pageNum)}>{pageNum}</button>);
                        })}
                      </div>
                      <button className="pagination-btn" onClick={() => setDocPage(p => Math.min(totalDocPages, p + 1))} disabled={docPage === totalDocPages}>Next →</button>
                    </div>
                  )}
                  <div className="documents-summary">Showing {((docPage - 1) * docsPerPage) + 1} to {Math.min(docPage * docsPerPage, filteredDocuments.length)} of {filteredDocuments.length} documents</div>
                </>
              )}
            </div>
          )}

          {/* MY TASKS VIEW */}
          {activeView === "MY_TASKS" && (
            <div className="my-tasks-container">
              <div className="tasks-header">
                <div className="tasks-title-section">
                  <h2>My Tasks</h2>
                  <div className="view-toggle">
                    <button className={`view-btn ${taskViewMode === "KANBAN" ? "active" : ""}`} onClick={() => setTaskViewMode("KANBAN")}>📊 Kanban</button>
                    <button className={`view-btn ${taskViewMode === "LIST" ? "active" : ""}`} onClick={() => setTaskViewMode("LIST")}>📋 List View</button>
                  </div>
                </div>
                <button 
    className="ad-btn ad-btn-blue" 
    style={{ fontSize: 12, padding: "6px 16px", marginLeft: "auto" }}
    onClick={() => setShowCreateTaskModal(true)}
  >
    + New Task
  </button>
                <div className="filter-pills">
                  {[{ key: "ALL", label: "All", icon: "📋" }, { key: "TODO", label: "To Do", icon: "📋" }, { key: "IN_PROGRESS", label: "In Progress", icon: "🔄" }, { key: "IN_REVIEW", label: "In Review", icon: "👀" }, { key: "COMPLETED", label: "Completed", icon: "✅" }, { key: "BLOCKED", label: "Blocked", icon: "🔴" }].map(filter => (
                    <button key={filter.key} className={`filter-pill ${taskFilter === filter.key ? "active" : ""}`} onClick={() => setTaskFilter(filter.key)}>{filter.icon} {filter.label}<span className="filter-count">{taskStatusCounts[filter.key]}</span></button>
                  ))}
                </div>
              </div>
              {filteredTasksForView.length === 0 ? (
                <div className="empty-tasks-state"><div className="empty-icon">✅</div><p>No tasks found</p><p className="empty-sub">You're all caught up!</p></div>
              ) : taskViewMode === "KANBAN" ? (
                <div className="kanban-board">
                  {['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED'].map(status => {
                    const columnTasks = filteredTasksForView.filter(t => t.status === status);
                    const displayedTasks = columnTasks.slice(0, 10);
                    const hasMore = columnTasks.length > 10;
                    return (
                      <div key={status} className="kanban-column">
                        <div className="kanban-header"><h3>{status === 'TODO' && '📋 To Do'}{status === 'IN_PROGRESS' && '🔄 In Progress'}{status === 'IN_REVIEW' && '👀 In Review'}{status === 'COMPLETED' && '✅ Completed'}</h3><span className="task-count">{columnTasks.length}</span></div>
                        <div className="kanban-tasks">
                          {displayedTasks.map(task => (<div key={task.id} className="kanban-task" onClick={() => { setSelectedTask(task); setShowTaskModal(true); }}><div className="kanban-task-title">{task.title}</div><div className="kanban-task-priority">{getPriorityIcon(task.priority)} {task.priority}</div>{task.dueDate && <div className="kanban-task-due">📅 {new Date(task.dueDate).toLocaleDateString()}</div>}</div>))}
                          {hasMore && <div className="more-tasks-indicator">+{columnTasks.length - 10} more tasks</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (<TaskListView />)}
              <div className="task-summary-footer"><span>Total: {myTasks.length} tasks</span><span>Completed: {myTasks.filter(t => t.status === 'COMPLETED').length}</span><span>Pending: {myTasks.filter(t => t.status !== 'COMPLETED').length}</span></div>
            </div>
          )}

          {/* MY PROJECTS VIEW */}
          {activeView === "MY_PROJECTS" && (
            <div className="my-projects-container">
              <div className="projects-header">
                <h2><i className="fas fa-project-diagram"></i> My Projects</h2>
                <p>Projects you're assigned to</p>
              </div>

              {projectLoading ? (
                <div className="loading-state"><i className="fas fa-spinner fa-spin"></i> Loading projects...</div>
              ) : projects.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon"><i className="fas fa-project-diagram"></i></div>
                  <p>No projects assigned yet</p>
                  <p className="empty-sub">When you're assigned to a project, it will appear here</p>
                </div>
              ) : (
                <div className="projects-grid">
                  {projects.map(project => (
                    <ProjectCard 
                      key={project.id} 
                      project={project} 
                      onViewDetails={() => { setSelectedProject(project); setShowProjectDetailModal(true); }}
                    />
                  ))}
                </div>
              )}

              {/* Project Detail Modal */}
              {showProjectDetailModal && selectedProject && (
                <div className="modal-overlay" onClick={() => setShowProjectDetailModal(false)}>
                  <div className="project-detail-modal" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                      <h2>{selectedProject.projectName}</h2>
                      <button className="modal-close" onClick={() => setShowProjectDetailModal(false)}>×</button>
                    </div>
                    
                    <div className="modal-body">
                      <div className="project-info-section">
                        <div className="info-row">
                          <span className="label"><i className="fas fa-info-circle"></i> Description:</span>
                          <span className="value">{selectedProject.description || 'No description'}</span>
                        </div>
                        <div className="info-row">
                          <span className="label"><i className="fas fa-calendar"></i> Due Date:</span>
                          <span className="value">{selectedProject.targetEndDate ? new Date(selectedProject.targetEndDate).toLocaleDateString() : 'Not set'}</span>
                        </div>
                        <div className="info-row">
                          <span className="label"><i className="fas fa-chart-line"></i> Progress:</span>
                          <div className="value">
                            <div className="progress-bar" style={{ width: '200px', display: 'inline-block', marginLeft: '10px' }}>
                              <div className="progress-fill" style={{ width: `${selectedProject.completionPercentage}%` }}></div>
                            </div>
                            <span style={{ marginLeft: '10px' }}>{selectedProject.completionPercentage}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="project-tasks-section">
                        <h4><i className="fas fa-tasks"></i> My Tasks</h4>
                        
                        {(selectedProject.myTasks || []).length === 0 ? (
                          <p className="no-data">No tasks assigned to you in this project</p>
                        ) : (
                          <div className="tasks-list">
                            {(selectedProject.myTasks || []).map(task => (
                              <div key={task.id} className="task-item">
                                <div className="task-header">
                                  <span className="task-title">{task.title}</span>
                                  <select 
                                    value={task.status} 
                                    onChange={(e) => updateProjectTaskStatus(task.id, e.target.value, selectedProject.id)}
                                    className="task-status-select"
                                  >
                                    <option value="TODO">To Do</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="IN_REVIEW">In Review</option>
                                    <option value="COMPLETED">Completed</option>
                                    <option value="BLOCKED">Blocked</option>
                                  </select>
                                </div>
                                <p className="task-description">{task.description}</p>
                                <div className="task-meta">
                                  <span><i className="fas fa-flag"></i> {task.priority}</span>
                                  {task.dueDate && <span><i className="fas fa-calendar"></i> Due: {new Date(task.dueDate).toLocaleDateString()}</span>}
                                </div>
                                
                                {task.comments && task.comments.length > 0 && (
                                  <div className="task-comments-preview">
                                    <i className="fas fa-comment"></i> {task.comments.length} comments
                                  </div>
                                )}
                                
                                <TaskActionButtons 
                                  task={task} 
                                  projectId={selectedProject.id} 
                                  onUpdate={fetchMyProjects}
                                  showToastMessage={showToastMessage}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="modal-footer">
                      <button className="ad-btn" onClick={() => setShowProjectDetailModal(false)}>Close</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PROFILE VIEW */}
          {activeView === "PROFILE" && profile && (
            <div className="profile-container">
              <div className="profile-card">
                <div className="profile-header">
                  <div className="profile-avatar">
                    <i className="fas fa-user-md"></i>
                  </div>
                  <h2 className="profile-name">{profile.fullName || teamMemberName}</h2>
                  <div className="profile-role">
                    <i className="fas fa-briefcase"></i> {profile.role?.replace('_', ' ') || 'Credentialing Specialist'}
                  </div>
                </div>

                <div className="profile-stats-bar">
                  <div className="profile-stat-item">
                    <span className="profile-stat-value">{providers.length}</span>
                    <span className="profile-stat-label"><i className="fas fa-user-md"></i> Assigned Providers</span>
                  </div>
                  <div className="profile-stat-item">
                    <span className="profile-stat-value">{taskStats.total}</span>
                    <span className="profile-stat-label"><i className="fas fa-tasks"></i> Total Tasks</span>
                  </div>
                  <div className="profile-stat-item">
                    <span className="profile-stat-value">{taskStats.completed}</span>
                    <span className="profile-stat-label"><i className="fas fa-check-circle"></i> Completed</span>
                  </div>
                  <div className="profile-stat-item">
                    <span className="profile-stat-value">{taskStats.pending}</span>
                    <span className="profile-stat-label"><i className="fas fa-hourglass-half"></i> Pending</span>
                  </div>
                </div>

                <div className="profile-body">
                  <div className="profile-section">
                    <h3 className="profile-section-title"><i className="fas fa-user-circle"></i> Personal Information</h3>
                    <div className="profile-info-grid">
                      <div className="profile-info-item">
                        <div className="profile-info-icon"><i className="fas fa-user"></i></div>
                        <div className="profile-info-content">
                          <span className="profile-info-label">Full Name</span>
                          <span className="profile-info-value">{profile.fullName || '—'}</span>
                        </div>
                      </div>
                      <div className="profile-info-item">
                        <div className="profile-info-icon"><i className="fas fa-envelope"></i></div>
                        <div className="profile-info-content">
                          <span className="profile-info-label">Email Address</span>
                          <span className="profile-info-value"><a href={`mailto:${profile.email}`}>{profile.email || '—'}</a></span>
                        </div>
                      </div>
                      <div className="profile-info-item">
                        <div className="profile-info-icon"><i className="fas fa-phone"></i></div>
                        <div className="profile-info-content">
                          <span className="profile-info-label">Phone Number</span>
                          <span className="profile-info-value">{profile.phoneNumber || '—'}</span>
                        </div>
                      </div>
                      <div className="profile-info-item">
                        <div className="profile-info-icon"><i className="fas fa-building"></i></div>
                        <div className="profile-info-content">
                          <span className="profile-info-label">Department</span>
                          <span className="profile-info-value">{profile.department || 'Credentialing'}</span>
                        </div>
                      </div>
                      <div className="profile-info-item">
                        <div className="profile-info-icon"><i className="fas fa-chart-line"></i></div>
                        <div className="profile-info-content">
                          <span className="profile-info-label">Role</span>
                          <span className="profile-info-value">{profile.role?.replace('_', ' ') || 'Team Member'}</span>
                        </div>
                      </div>
                      <div className="profile-info-item">
                        <div className="profile-info-icon"><i className="fas fa-calendar-alt"></i></div>
                        <div className="profile-info-content">
                          <span className="profile-info-label">Member Since</span>
                          <span className="profile-info-value">{profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '—'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="profile-section">
                    <h3 className="profile-section-title"><i className="fas fa-chart-bar"></i> Performance Statistics</h3>
                    <div className="profile-stats-row">
                      <div className="profile-stat-card">
                        <div className="profile-stat-icon"><i className="fas fa-tasks"></i></div>
                        <div className="profile-stat-info">
                          <span className="profile-stat-number">{taskStats.completed}/{taskStats.total}</span>
                          <span className="profile-stat-text">Tasks Completed</span>
                        </div>
                      </div>
                      <div className="profile-stat-card">
                        <div className="profile-stat-icon"><i className="fas fa-check-circle"></i></div>
                        <div className="profile-stat-info">
                          <span className="profile-stat-number">{taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0}%</span>
                          <span className="profile-stat-text">Completion Rate</span>
                        </div>
                      </div>
                      <div className="profile-stat-card">
                        <div className="profile-stat-icon"><i className="fas fa-file-alt"></i></div>
                        <div className="profile-stat-info">
                          <span className="profile-stat-number">{providerStats.documentsUploaded}</span>
                          <span className="profile-stat-text">Documents Uploaded</span>
                        </div>
                      </div>
                      <div className="profile-stat-card">
                        <div className="profile-stat-icon"><i className="fas fa-chart-line"></i></div>
                        <div className="profile-stat-info">
                          <span className="profile-stat-number">{providerStats.completionRate}%</span>
                          <span className="profile-stat-text">Credentialing Progress</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="profile-section">
                    <h3 className="profile-section-title"><i className="fas fa-history"></i> Recent Activity</h3>
                    <div className="profile-activity-timeline">
                      {myTasks.slice(0, 5).map(task => (
                        <div key={task.id} className="timeline-item" onClick={() => { setSelectedTask(task); setShowTaskModal(true); }} style={{ cursor: 'pointer' }}>
                          <div className="timeline-icon">
                            <i className={`fas ${task.status === 'COMPLETED' ? 'fa-check-circle' : task.status === 'IN_PROGRESS' ? 'fa-sync-alt' : 'fa-tasks'}`}></i>
                          </div>
                          <div className="timeline-content">
                            <div className="timeline-title">{task.title}</div>
                            <div className="timeline-date">{task.updatedAt ? new Date(task.updatedAt).toLocaleDateString() : new Date(task.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                      ))}
                      {myTasks.length === 0 && (
                        <div className="timeline-item">
                          <div className="timeline-icon"><i className="fas fa-info-circle"></i></div>
                          <div className="timeline-content">
                            <div className="timeline-title">No recent activity</div>
                            <div className="timeline-date">Tasks will appear here</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FILTERED VIEW */}
          {activeView === "FILTERED" && filteredView && (
            <div>
              <button className="ad-btn" style={{ background: "var(--page-bg)", border: "1px solid var(--border2)", color: "var(--muted)", fontSize: 12, padding: "6px 16px", marginBottom: 20 }} onClick={() => { setActiveView("DASHBOARD"); setFilteredView(null); setSelectedProviderId(null); }}>← Back to Dashboard</button>
              <div className="ad-dash-card" style={{ marginBottom: 0 }}><h3 className="ad-dash-card-title">{filteredView.label} ({filteredView.providers.length})</h3><ProviderRows list={filteredView.providers} showUpload={false} /></div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ReplaceDocumentModal
        isOpen={showReplaceModal}
        onClose={() => { setShowReplaceModal(false); setPendingUpload(null); setExistingDocument(null); }}
        onConfirm={handleReplaceConfirm}
        documentType={pendingUpload?.docId}
        currentDocument={existingDocument}
        providerName={selectedProviderName}
      />

      {/* Create Task Modal */}
<CreateTaskModal
  isOpen={showCreateTaskModal}
  onClose={() => setShowCreateTaskModal(false)}
  onSuccess={(task) => {
    showToastMessage(`Task "${task.title}" created successfully`);
    fetchMyTasks();
  }}
  assignableUsers={[]}
  providers={providers}
/>

      <DocumentHistoryModal
        isOpen={showHistoryModal}
        onClose={() => { setShowHistoryModal(false); setHistoryData([]); }}
        history={historyData}
        documentType={historyDocType}
        providerName={selectedProviderName}
      />

      {/* Task Detail Modal */}
      {showTaskModal && selectedTask && (
        <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="task-modal" onClick={e => e.stopPropagation()}>
            <div className="task-modal-header"><h2>{selectedTask.title}</h2><button className="modal-close" onClick={() => setShowTaskModal(false)}>×</button></div>
            <div className="task-modal-body">
              <div className="task-info-section">
                <div className="task-info-row"><span className="info-label">Status:</span><select value={selectedTask.status} onChange={(e) => updateTaskStatus(selectedTask.id, e.target.value)} className="status-select-large" disabled={updatingStatus}><option value="TODO">📋 To Do</option><option value="IN_PROGRESS">🔄 In Progress</option><option value="IN_REVIEW">👀 In Review</option><option value="COMPLETED">✅ Completed</option><option value="BLOCKED">🔴 Blocked</option></select></div>
                <div className="task-info-row"><span className="info-label">Priority:</span><span className="info-value">{getPriorityIcon(selectedTask.priority)} {selectedTask.priority}</span></div>
                <div className="task-info-row"><span className="info-label">Due Date:</span><span className="info-value">{selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString() : 'No due date'}</span></div>
                <div className="task-info-row"><span className="info-label">Assigned By:</span><span className="info-value">{selectedTask.assignedBy}</span></div>
                <div className="task-info-row"><span className="info-label">Description:</span><p className="info-value description">{selectedTask.description}</p></div>
              </div>
              <div className="task-comments-section"><h4>Comments</h4><div className="comments-list">{selectedTask.comments?.map((comment, idx) => (<div key={idx} className="comment-item"><strong>{comment.userName}</strong><span className="comment-time">{new Date(comment.createdAt).toLocaleString()}</span><p>{comment.comment}</p></div>))}{(!selectedTask.comments || selectedTask.comments.length === 0) && <p className="no-comments">No comments yet</p>}</div><div className="add-comment"><textarea placeholder="Add a comment..." value={taskComment} onChange={(e) => setTaskComment(e.target.value)} rows="3" /><button onClick={addComment} disabled={addingComment}>{addingComment ? "Adding..." : "Add Comment"}</button></div></div>
              <div className="task-time-section"><h4>Time Tracking</h4>{showTimeLog ? (<div className="time-log-form"><input type="number" placeholder="Hours spent" value={timeSpent} onChange={(e) => setTimeSpent(e.target.value)} /><input type="text" placeholder="What did you work on?" value={timeDescription} onChange={(e) => setTimeDescription(e.target.value)} /><button onClick={logTime} disabled={loggingTime}>{loggingTime ? "Logging..." : "Log Time"}</button><button onClick={() => { setShowTimeLog(false); setTimeSpent(''); setTimeDescription(''); }}>Cancel</button></div>) : (<button className="log-time-btn" onClick={() => setShowTimeLog(true)}>⏱️ Log Time</button>)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamDashboard;