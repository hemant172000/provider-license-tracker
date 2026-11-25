import React, { useState, useEffect } from 'react';
  import API from '../services/api';
  import ReplaceDocumentModal from '../components/ReplaceDocumentModal';
  import DocumentHistoryModal from '../components/DocumentHistoryModal';
  import { DOCUMENT_RULES, getDocumentRule, getDocumentCategories } from '../config/DocumentsConfig';
  import './TeamLeaderDashboard.css';
  import CreateTaskModal from '../components/CreateTaskModal';
import EditProjectModal from '../components/EditProjectModal';
import ProviderGroupsManager from '../components/ProviderGroupsManager';

  const BASE_URL = "http://localhost:8080";

  const TeamLeaderDashboard = () => {
    const [activeView, setActiveView] = useState('DASHBOARD');
    const [teamMembers, setTeamMembers] = useState([]);
    const [providers, setProviders] = useState([]);
    const [myTasks, setMyTasks] = useState([]);
    const [teamTasks, setTeamTasks] = useState([]);
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [selectedTeamMember, setSelectedTeamMember] = useState('');
    const [teamLeaderInfo, setTeamLeaderInfo] = useState(null);
    const [groups, setGroups] = useState([]);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [selectedGroup, setSelectedGroup] = useState('');
    const [selectedGroupProvider, setSelectedGroupProvider] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ text: "", type: "" });

    const [taskSearch, setTaskSearch] = useState("");
    const [teamTaskPage, setTeamTaskPage] = useState(1);
    const [showAllTasks, setShowAllTasks] = useState(false);

    // Group Management States
    const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
    const [showCreateManagerModal, setShowCreateManagerModal] = useState(false);
    const [showAssignManagerModal, setShowAssignManagerModal] = useState(false);
    const [showAddProviderModal, setShowAddProviderModal] = useState(false);
    const [showEditGroupModal, setShowEditGroupModal] = useState(false);
    const [selectedGroupId, setSelectedGroupId] = useState(null);
    const [selectedGroupName, setSelectedGroupName] = useState("");
    const [newGroupName, setNewGroupName] = useState("");
    const [newGroupManagerId, setNewGroupManagerId] = useState("");
    const [editGroupName, setEditGroupName] = useState("");
    const [managerFullName, setManagerFullName] = useState("");
    const [managerEmail, setManagerEmail] = useState("");
    const [managerPhone, setManagerPhone] = useState("");
    const [managerUsername, setManagerUsername] = useState("");
    const [managerPassword, setManagerPassword] = useState("");
    const [selectedManagerId, setSelectedManagerId] = useState("");
    const [selectedProviderId, setSelectedProviderId] = useState("");
    const [existingManagers, setExistingManagers] = useState([]);
    const [groupProviders, setGroupProviders] = useState([]);
    const [availableManagers, setAvailableManagers] = useState([]);
    const [availableManagersList, setAvailableManagersList] = useState([]);
    const [unassignedProviders, setUnassignedProviders] = useState([]);

    // Replace License Modal states
const [showReplaceLicenseModal, setShowReplaceLicenseModal] = useState(false);
const [replaceDocumentType, setReplaceDocumentType] = useState('');
const [replaceCurrentDocument, setReplaceCurrentDocument] = useState(null);
const [replaceProvider, setReplaceProvider] = useState(null);
    
    // Task assignment states
    const [taskTitle, setTaskTitle] = useState("");
    const [taskDescription, setTaskDescription] = useState("");
    const [taskPriority, setTaskPriority] = useState("MEDIUM");
    const [taskDueDate, setTaskDueDate] = useState("");
    const [taskRelatedProvider, setTaskRelatedProvider] = useState("");

    // Credentialing Status States
const [credentialingStatus, setCredentialingStatus] = useState([]);
const [showAddPayorModal, setShowAddPayorModal] = useState(false);
const [editingPayor, setEditingPayor] = useState(null);
const [payorFormData, setPayorFormData] = useState({
  payerName: '',
  lob: '',
  network: '',
  product: '',
  plan: '',
  status: '',
  managingEntity: '',
  applicationDate: '',
  credentialingEffectiveDate: '',
  linkEffectiveDate: '',
  recredentialingDate: '',
  terminationDate: '',
  providerRep: '',
  contractingRep: ''
});
const [showCredentialingTab, setShowCredentialingTab] = useState(false);
const [payorSummaryList, setPayorSummaryList] = useState([]);
const [selectedPayor, setSelectedPayor] = useState(null);
const [showPayorDetailsModal, setShowPayorDetailsModal] = useState(false);
const [payorFlatData, setPayorFlatData] = useState(null);
const [expandedPayors, setExpandedPayors] = useState({});
    
    // Document upload states (only for Credentialing)
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

    const [showAssignTeamLeaderModal, setShowAssignTeamLeaderModal] = useState(false);
const [showAssignTeamMemberModal, setShowAssignTeamMemberModal] = useState(false);
const [availableTeamLeadersForGroup, setAvailableTeamLeadersForGroup] = useState([]);
const [availableTeamMembersForGroup, setAvailableTeamMembersForGroup] = useState([]);
const [selectedTeamLeaderForGroup, setSelectedTeamLeaderForGroup] = useState('');
const [selectedTeamMemberForGroup, setSelectedTeamMemberForGroup] = useState('');

    // Document history modal states
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [historyData, setHistoryData] = useState([]);
    const [historyDocType, setHistoryDocType] = useState("");
    
    // Documents view states (only for Credentialing)
    const [allDocuments, setAllDocuments] = useState([]);
    const [docSearchTerm, setDocSearchTerm] = useState("");
    const [docTypeFilter, setDocTypeFilter] = useState("ALL");
    const [docPage, setDocPage] = useState(1);
    const [docsPerPage] = useState(10);
    const [loadingDocsList, setLoadingDocsList] = useState(false);
    
    const [FilteredProviders, setFilteredProviders] = useState([]);
    const [showFilteredProviders, setShowFilteredProviders] = useState(false);

    const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
const [showEditProjectModal, setShowEditProjectModal] = useState(false);
const [editingProject, setEditingProject] = useState(null);
const [assignableUsersForTask, setAssignableUsersForTask] = useState([]);

const [showAddAssigneeModal, setShowAddAssigneeModal] = useState(false);
const [selectedAssigneeId, setSelectedAssigneeId] = useState('');
const [currentProjectForAssignee, setCurrentProjectForAssignee] = useState(null);
const [currentProjectForTasks, setCurrentProjectForTasks] = useState(null);
    
    // Provider directory states (for all departments)
    const [providerSearch, setProviderSearch] = useState("");
    const [providerSpecialtyFilter, setProviderSpecialtyFilter] = useState("ALL");
    const [providerPage, setProviderPage] = useState(1);
    const [providersPerPage] = useState(10);
    
    // Task states
    const [taskViewMode, setTaskViewMode] = useState("KANBAN");
    const [taskFilter, setTaskFilter] = useState("ALL");
    const [taskPage, setTaskPage] = useState(1);
    const [tasksPerPage] = useState(10);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [addingComment, setAddingComment] = useState(false);
    const [loggingTime, setLoggingTime] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [taskComment, setTaskComment] = useState('');
    const [timeSpent, setTimeSpent] = useState('');
    const [timeDescription, setTimeDescription] = useState('');
    const [showTimeLog, setShowTimeLog] = useState(false);

    const [selectedProviderForDetails, setSelectedProviderForDetails] = useState(null);
const [showProviderDetailsModal, setShowProviderDetailsModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);

    //team leader to add provider
    const [showAddProviderForm, setShowAddProviderForm] = useState(false);
    const [newProvider, setNewProvider] = useState({
  username: '',
  password: '',
  fullName: '',
  email: '',
  phoneNumber: '',
  specialty: '',
  npiNumber: '',
  licenseNumber: '',
  licenseExpiry: ''
});


    // Project management states
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showProjectDetailModal, setShowProjectDetailModal] = useState(false);
  const [projectStats, setProjectStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    planningProjects: 0,
    averageCompletion: 0
  });
  const [availableTeamMembers, setAvailableTeamMembers] = useState([]);
  const [projectFormData, setProjectFormData] = useState({
    projectName: '',
    description: '',
    projectType: 'GROUP',
    groupId: '',
    providerId: '',
    priority: 'MEDIUM',
    startDate: '',
    targetEndDate: '',
    assigneeIds: []
  });
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'MEDIUM',
    dueDate: ''
  });
  const [projectTaskList, setProjectTaskList] = useState([]);
  const [selectedProjectForTasks, setSelectedProjectForTasks] = useState(null);


const [assigneeRoleFilter, setAssigneeRoleFilter] = useState('ALL'); 
const [assignableUsersForProject, setAssignableUsersForProject] = useState([]);

    // Department-specific statistics
    const [credentialingStats, setCredentialingStats] = useState({
      totalProviders: 0,
      pendingDocuments: 0,
      expiringLicenses: 0,
      completionRate: 0
    });
    
    const [chargeEntryStats, setChargeEntryStats] = useState({
      claimsProcessed: 0,
      pendingClaims: 0,
      deniedClaims: 0,
      avgTurnaround: 0
    });
    
    const [postingStats, setPostingStats] = useState({
      paymentsPosted: 0,
      unpostedPayments: 0,
      adjustmentsProcessed: 0,
      totalAmount: 0
    });
    
    const [arStats, setArStats] = useState({
      aging30: 0,
      aging60: 0,
      aging90: 0,
      over90Days: 0,
      collectionRate: 0,
      writeoffs: 0
    });

    const [providerStats, setProviderStats] = useState({
      total: 0,
      expiring: 0,
      expired: 0,
      documentsUploaded: 0,
      completionRate: 0
    });

    const calculateProviderStats = (providersList) => {
      const today = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);
      
      const total = providersList.length;
      const expiring = providersList.filter(p => {
        if (!p.licenseExpiry) return false;
        const expiry = new Date(p.licenseExpiry);
        return expiry > today && expiry <= thirtyDaysFromNow;
      }).length;
      
      const expired = providersList.filter(p => {
        if (!p.licenseExpiry) return false;
        return new Date(p.licenseExpiry) < today;
      }).length;
      
      let documentsUploaded = 0;
      providersList.forEach(p => {
        if (p.files) documentsUploaded += p.files.length;
      });
      
      const requiredDocs = 15;
      const completedProviders = providersList.filter(p => p.files && p.files.length >= requiredDocs).length;
      const completionRate = total > 0 ? Math.round((completedProviders / total) * 100) : 0;
      
      setProviderStats({
        total,
        expiring,
        expired,
        documentsUploaded,
        completionRate
      });
    };
  

    useEffect(() => {
      if (providers.length > 0) {
        calculateProviderStats(providers);
      }
    }, [providers]);


    const storedName = localStorage.getItem("fullName") || "Team Leader";
    const storedRole = localStorage.getItem("role") || "";
    const token = () => localStorage.getItem("token");

    const showToastMessage = (text, type = "success") => {
      setToast({ text, type });
      setTimeout(() => setToast({ text: "", type: "" }), 4000);
    };

  // Fetch all projects
  const fetchProjects = async () => {
    try {
      const response = await API.get('/team-leader/projects');
      setProjects(response.data.projects || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
      setProjects([]);
    }
  };

  const fetchAssignableUsersForTask = async () => {
  try {
    const res = await API.get('/team-leader/assignable-users');
    setAssignableUsersForTask(res.data.users || []);
  } catch { setAssignableUsersForTask([]); }
};

const fetchAvailableTeamLeaders = async () => {
  try {
    const response = await API.get('/groups/assignable-team-leaders');
    setAvailableTeamLeadersForGroup(response.data || []);
  } catch (error) {
    console.error("Error fetching team leaders:", error);
    setAvailableTeamLeadersForGroup([]);
  }
};

const fetchAvailableTeamMembersForGroup = async () => {
  try {
    const response = await API.get('/groups/assignable-team-members');
    setAvailableTeamMembersForGroup(response.data || []);
  } catch (error) {
    console.error("Error fetching team members:", error);
    setAvailableTeamMembersForGroup([]);
  }
};

  // Fetch project statistics
  const fetchProjectStats = async () => {
    try {
      const response = await API.get('/team-leader/projects/statistics');
      setProjectStats(response.data);
      setProjects(response.data.projects || []);
    } catch (error) {
      console.error("Error fetching project stats:", error);
    }
  };

  // Fetch available team members
  const fetchAvailableTeamMembers = async () => {
    try {
      const response = await API.get('/team-leader/projects/available-team-members');
      setAvailableTeamMembers(response.data.teamMembers || []);
    } catch (error) {
      console.error("Error fetching team members:", error);
      setAvailableTeamMembers([]);
    }
  };

  // Create project
  const handleCreateProject = async () => {
    if (!projectFormData.projectName) {
      showToastMessage("Please enter a project name", "error");
      return;
    }
    
    if (projectFormData.projectType === 'GROUP' && !projectFormData.groupId) {
      showToastMessage("Please select a group", "error");
      return;
    }
    
    if (projectFormData.projectType === 'PROVIDER' && !projectFormData.providerId) {
      showToastMessage("Please select a provider", "error");
      return;
    }
    
    setLoading(true);
    try {
      await API.post('/team-leader/projects', projectFormData);
      showToastMessage("Project created successfully");
      setShowProjectModal(false);
      resetProjectForm();
      fetchProjectStats();
    } catch (error) {
      console.error("Error creating project:", error);
      showToastMessage("Failed to create project", "error");
    } finally {
      setLoading(false);
    }
  };

  // Reset project form
  const resetProjectForm = () => {
    setProjectFormData({
      projectName: '',
      description: '',
      projectType: 'GROUP',
      groupId: '',
      providerId: '',
      priority: 'MEDIUM',
      startDate: '',
      targetEndDate: '',
      assigneeIds: []
    });
  };

  // Update project status
  const updateProjectStatus = async (projectId, newStatus) => {
    try {
      await API.put(`/team-leader/projects/${projectId}`, { status: newStatus });
      showToastMessage(`Project status updated to ${newStatus}`);
      fetchProjectStats();
    } catch (error) {
      console.error("Error updating project:", error);
      showToastMessage("Failed to update project status", "error");
    }
  };

  // Add task to project
  const handleAddTask = async (projectId) => {
    if (!newTask.title) {
      showToastMessage("Please enter a task title", "error");
      return;
    }
    
    try {
      await API.post(`/team-leader/projects/${projectId}/tasks`, newTask);
      showToastMessage("Task added successfully");
      setNewTask({
        title: '',
        description: '',
        assignedTo: '',
        priority: 'MEDIUM',
        dueDate: ''
      });
      fetchProjectStats();
      // Refresh project details if open
      if (selectedProjectForTasks?.id === projectId) {
        const response = await API.get(`/team-leader/projects/${projectId}`);
        setSelectedProjectForTasks(response.data);
      }
    } catch (error) {
      console.error("Error adding task:", error);
      showToastMessage("Failed to add task", "error");
    }
  };

    // Date helpers
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    const in90Days = new Date(today); in90Days.setDate(today.getDate() + 90);

    const isExpired = (d) => d && new Date(d) < today;
    const isExpiring30 = (d) => { if (!d) return false; const e = new Date(d); return e >= today && e <= thirtyDaysFromNow; };
    const isExpiringSoon = (d) => { 
  if (!d) return false; 
  const e = new Date(d); 
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);
  return e >= today && e <= thirtyDaysFromNow; 
};
    const isOverdue = (dueDate) => dueDate && new Date(dueDate) < today;

    // ==================== ADD PROVIDER FUNCTION ====================

const handleAddProvider = async () => {
  if (!newProvider.username || !newProvider.password || !newProvider.fullName) {
    showToastMessage("Please fill all required fields (Username, Password, Full Name)", "error");
    return;
  }
  
  setLoading(true);
  try {
    const response = await API.post('/team-leader/add-provider', newProvider);
    showToastMessage(`Provider "${newProvider.fullName}" created successfully`);
    setShowAddProviderForm(false);
    setNewProvider({
      username: '', password: '', fullName: '', email: '',
      phoneNumber: '', specialty: '', npiNumber: '', licenseNumber: '', licenseExpiry: ''
    });
    await fetchProviders(); // Refresh the provider list
  } catch (error) {
    console.error("Add provider error:", error);
    showToastMessage(error.response?.data?.error || "Failed to create provider", "error");
  } finally {
    setLoading(false);
  }
};

    // ==================== CREDENTIALING DOCUMENT FUNCTIONS ====================
    
    const getDocumentTypeLabel = (type) => {
  const rule = getDocumentRule(type);
  if (type && type.startsWith('LICENSE_')) {
    const stateCode = type.replace('LICENSE_', '');
    return `Medical License (${stateCode})`;
  }
  if (type === 'DIPLOMA') return 'Medical School Diploma';
  if (type === 'RESIDENCY_CERT') return 'Residency Certificate';
  if (type === 'FELLOWSHIP_CERT') return 'Fellowship Certificate';
  if (type === 'INTERNSHIP_CERT') return 'Internship Certificate';
  if (type === 'ATTENDING_CERT') return 'Attending Certificate';
  return rule.label || type;
};

    const checkDocumentExists = async (providerId, fileType) => {
      if (!providerId) {
        console.error("checkDocumentExists: providerId is missing");
        return null;
      }
      
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

    const handleFileSelection = async (file, docId, provider) => {
      if (!provider || !provider.id) {
        showToastMessage("Invalid provider selected", "error");
        return;
      }
      
      setSelectedProvider(provider);
      setSelectedDocId(docId);
      setUploadFile(file);
      
      const existingDoc = await checkDocumentExists(provider.id, docId);
      
      if (existingDoc && getDocumentRule(docId).type === "single") {
        setPendingUpload({ file, docId, provider });
        setExistingDocument(existingDoc);
        setShowReplaceModal(true);
      } else {
        await performUpload(file, docId, provider);
      }
    };

    const performUpload = async (file, docId, provider, replacementReason = "", expiryDate = "") => {
      if (!provider || !provider.id) {
        showToastMessage("Invalid provider selected", "error");
        return;
      }
      
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("providerId", provider.id);
        formData.append("fileType", docId);
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
        
        const result = await response.json();
        showToastMessage(`Successfully uploaded ${file.name}`);
        
        setUploadFile(null);
        setSelectedDocId("");
        
        const fileInput = document.getElementById("file-upload");
        if (fileInput) fileInput.value = "";
        
        await fetchProviderDocuments(provider.id);
        await fetchAllDocuments();
        await fetchProviders();
        
      } catch (error) {
        console.error("Upload error:", error);
        showToastMessage("Failed to upload file", "error");
      } finally {
        setUploading(false);
      }
    };

    const handleReplaceLicenseUpload = async () => {
  const licenseNumber = document.getElementById('newLicenseNumber')?.value;
  const expiryDate = document.getElementById('newExpiryDate')?.value;
  const fileInput = document.getElementById('replaceLicenseFile');
  const file = fileInput?.files[0];

  if (!expiryDate) {
    showToastMessage("Please enter expiry date", "error");
    return;
  }
  if (!file) {
    showToastMessage("Please select a file", "error");
    return;
  }

  setUploading(true);
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("providerId", replaceProvider.providerId || replaceProvider.id);
    formData.append("fileType", replaceDocumentType);
    formData.append("expiryDate", expiryDate);
    if (licenseNumber) {
      formData.append("licenseNumber", licenseNumber);
    }

    const response = await API.post('/files/upload', formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    showToastMessage("License updated successfully");
    setShowReplaceLicenseModal(false);
    
    // Refresh data
    if (replaceProvider.providerId || replaceProvider.id) {
      await fetchProviderDocuments(replaceProvider.providerId || replaceProvider.id);
    }
    await fetchProviders();
    
  } catch (error) {
    console.error("Upload error:", error);
    showToastMessage(error.response?.data?.error || "Failed to update license", "error");
  } finally {
    setUploading(false);
  }
};
   



// ==================== EXPORT FUNCTIONS ====================

const handleExportGroup = async (groupId, groupName) => {
  if (!groupId) {
    showToastMessage("Please select a group first", "error");
    return;
  }
  
  if (credentialingStatus.length === 0) {
    showToastMessage("No data to export for this group", "error");
    return;
  }
  
  setLoading(true);
  try {
    const response = await API.get(`/credentialing/export/group/${groupId}`, {
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    const fileName = `${groupName || 'Group'}_Credentialing_Data.xlsx`;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    showToastMessage(`Exporting ${groupName} credentialing data...`, "success");
  } catch (error) {
    console.error("Export error:", error);
    showToastMessage("Failed to export group data: " + (error.response?.data?.error || error.message), "error");
  } finally {
    setLoading(false);
  }
};

const handleExportAllGroups = async () => {
  setLoading(true);
  try {
    const response = await API.get('/credentialing/export/all', {
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'All_Groups_Credentialing_Data.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    showToastMessage("Exporting all groups data...", "success");
  } catch (error) {
    console.error("Export error:", error);
    showToastMessage("Failed to export all groups: " + (error.response?.data?.error || error.message), "error");
  } finally {
    setLoading(false);
  }
};
    
    const handleReplaceConfirm = async (replacementReason, expiryDate) => {
      setShowReplaceModal(false);
      if (pendingUpload) {
        await performUpload(pendingUpload.file, pendingUpload.docId, pendingUpload.provider, replacementReason, expiryDate);
        setPendingUpload(null);
        setExistingDocument(null);
      }
    };

    const viewDocumentHistory = async (providerId, fileType, providerName) => {
      try {
        const response = await API.get(`/files/document-history/${providerId}/${fileType}`);
        setHistoryData(response.data.history || []);
        setHistoryDocType(fileType);
        setSelectedProvider({ providerId, name: providerName });
        setShowHistoryModal(true);
      } catch (error) {
        console.error("Error fetching history:", error);
        showToastMessage("Failed to load document history", "error");
      }
    };

    const getPriorityIcon = (priority) => {
      switch(priority) {
        case 'HIGH': return <i className="fas fa-circle" style={{ color: '#ef4444', fontSize: '12px' }}></i>;
        case 'MEDIUM': return <i className="fas fa-circle" style={{ color: '#f59e0b', fontSize: '12px' }}></i>;
        case 'LOW': return <i className="fas fa-circle" style={{ color: '#10b981', fontSize: '12px' }}></i>;
        default: return <i className="fas fa-circle" style={{ color: '#9ca3af', fontSize: '12px' }}></i>;
      }
    };

    const handleDeleteDocument = async (fileId, fileName, providerId, filePath) => {
      console.log("handleDeleteDocument received:", { fileId, fileName, providerId, filePath });
      
      if (!window.confirm(`Are you sure you want to delete "${fileName}"? This action cannot be undone.`)) {
          return;
      }
      
      try {
          if (fileId && fileId !== 'null' && fileId !== null && fileId !== undefined && fileId !== '') {
              console.log("Deleting via ID:", fileId);
              await API.delete(`/files/${fileId}`);
              showToastMessage("Document deleted successfully");
          } 
          else if (filePath && filePath !== 'null' && filePath !== null && filePath !== '') {
              console.log("Deleting physical file:", filePath);
              await API.delete(`/files/physical`, { 
                  data: { filePath: filePath },
                  headers: { 'Content-Type': 'application/json' }
              });
              showToastMessage("File deleted successfully");
          }
          else {
              console.error("No valid identifier found - fileId:", fileId, "filePath:", filePath);
              showToastMessage("Cannot delete: No valid identifier found", "error");
              return;
          }
          
          await fetchAllDocuments();
          await fetchProviders();
          if (selectedProviderId) {
              await fetchProviderDocuments(selectedProviderId);
          }
          
      } catch (error) {
          console.error("Delete error:", error);
          showToastMessage("Failed to delete document: " + (error.response?.data?.error || error.message), "error");
      }
    };

    const handleDownload = async (fileId, fileName, filePath) => {
      console.log("Download params:", { fileId, fileName, filePath });
      
      try {
          if (fileId && fileId !== 'null' && fileId !== null && fileId !== undefined && fileId > 0) {
              console.log("Downloading via ID:", fileId);
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
              showToastMessage("Download started");
          } 
          else if (filePath && filePath !== 'null' && filePath !== null && filePath !== undefined) {
              console.log("Opening physical file:", filePath);
              let downloadUrl = filePath;
              
              if (filePath.includes('\\')) {
                  downloadUrl = filePath.replace(/\\/g, '/');
              }
              
              if (downloadUrl.startsWith('uploads/')) {
                  downloadUrl = downloadUrl.substring(8);
              }
              
              const fullUrl = `${BASE_URL}/uploads/${downloadUrl}`;
              console.log("Full URL for physical file:", fullUrl);
              window.open(fullUrl, '_blank');
              showToastMessage("Opening file...");
          }
          else {
              showToastMessage("Cannot download: No file identifier found", "error");
          }
      } catch (error) {
          console.error("Download error:", error);
          showToastMessage("Failed to download file: " + (error.response?.data?.error || error.message), "error");
      }
    };

    // ==================== FETCH FUNCTIONS ====================

    const fetchTeamLeaderInfo = async () => {
      try {
        const response = await API.get('/team-leader/profile');
        setTeamLeaderInfo(response.data);
      } catch (error) {
        setTeamLeaderInfo({ fullName: storedName, leadingDepartment: 'Credentialing', role: storedRole });
      }
    };

    const fetchTeamMembers = async () => {
      try {
          const response = await API.get('/team-leader/team-members');
          console.log("Team members API response:", JSON.stringify(response.data, null, 2));
          const members = response.data.teamMembers || [];
          setTeamMembers(members);
      } catch (error) {
          console.error("Error fetching team members:", error);
          setTeamMembers([]);
      }
    };

    const fetchProviders = async () => {
      console.log("=== FETCHING PROVIDERS ===");  
      try {
          const response = await API.get('/team-leader/providers');
          console.log("=== RAW API RESPONSE ===", response.data); 
          const providerList = response.data.providers || [];
          console.log("=== PROVIDERS LIST ===", providerList);  
          console.log("=== FIRST PROVIDER ===", providerList[0]);  
          console.log("=== ASSIGNED TEAM MEMBER ID ===", providerList[0]?.assignedTeamMemberId);  
          setProviders(providerList);
      } catch (error) {
          console.error("Error fetching providers:", error);
          setProviders([]);
      }
    };

    const fetchProviderDocuments = async (providerId) => {
  if (!providerId) {
    console.error("fetchProviderDocuments: providerId is missing");
    return;
  }
  
  setLoadingDocs(true);
  try {
    console.log("Fetching documents for provider:", providerId);
    const response = await API.get(`/files/provider/${providerId}`);
    console.log("Documents response:", response.data);
    
    const docs = {};
    
    // Use currentVersions object (already grouped by type)
    if (response.data && response.data.currentVersions) {
      Object.entries(response.data.currentVersions).forEach(([type, doc]) => {
        docs[type] = doc;
      });
    } 
    // Fallback to files array if currentVersions is empty
    else if (response.data && response.data.files) {
      response.data.files.forEach(file => {
        if (file.isCurrent) {
          docs[file.fileType] = file;
        }
      });
    } else if (Array.isArray(response.data)) {
      response.data.forEach(file => {
        if (file.isCurrent) {
          docs[file.fileType] = file;
        }
      });
    }
    
    setUploadedDocs(docs);
    console.log("Processed docs:", docs);
    console.log("Number of docs:", Object.keys(docs).length);
  } catch (error) {
    console.error("Error fetching documents:", error);
    setUploadedDocs({});
  } finally {
    setLoadingDocs(false);
  }
};

const fetchAssignableUsersForProject = async () => {
  try {
    const response = await API.get('/team-leader/assignable-users');
    setAssignableUsersForProject(response.data.users || []);
  } catch (error) {
    console.error("Error fetching assignable users:", error);
    setAssignableUsersForProject([]);
  }
};

const fetchAvailableAssigneesForProject = async (projectId) => {
  try {
    const response = await API.get(`/team-leader/projects/${projectId}/available-assignees`);
    return response.data.assignees || [];
  } catch (error) {
    console.error("Error fetching available assignees:", error);
    return [];
  }
};

    const exportProviderToExcel = async (providerId, providerName) => {
      try {
          const response = await API.get(`/provider-profile/export/${providerId}`, {
              responseType: 'blob'
          });
          
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `${providerName.replace(/\s/g, '_')}_credentialing_data.xlsx`);
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
          
          showToastMessage(`Exported ${providerName}'s data successfully`);
      } catch (error) {
          console.error("Export error:", error);
          showToastMessage("Export failed. Please try again.", "error");
      }
    };

      // Reset credentialing data when selected group changes
useEffect(() => {
  if (selectedGroupId) {
    fetchCredentialingRecords(selectedGroupId);
    fetchPayorSummary(selectedGroupId);
  } else {
    setCredentialingStatus([]);
    setPayorSummaryList([]);
  }
}, [selectedGroupId]);

    const exportAllProviders = async () => {
    if (providers.length === 0) {
        showToastMessage("No providers to export", "error");
        return;
    }

    setLoading(true);
    try {
        const response = await API.get('/provider-profile/export-all', {
            responseType: 'blob'
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'All_Providers_Credentialing_Data.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        showToastMessage("All providers exported successfully!");
    } catch (error) {
        console.error("Export error:", error);
        showToastMessage("Export failed. Please try again.", "error");
    } finally {
        setLoading(false);
    }
};

const openProviderDetails = (provider) => {
    setSelectedProviderForDetails(provider);
    setShowProviderDetailsModal(true);
};

    const fetchAllDocuments = async () => {
      if (teamLeaderInfo?.leadingDepartment !== 'Credentialing') return;
      if (providers.length === 0) return;
      
      setLoadingDocsList(true);
      try {
        const allDocs = [];
        for (const provider of providers) {
          try {
            const response = await API.get(`/files/provider/${provider.id}`);
            let providerFiles = [];
            
            if (response.data && response.data.files) {
              providerFiles = response.data.files; 
            } else if (Array.isArray(response.data)) {
              providerFiles = response.data;
            } else if (response.data && response.data.currentVersions) {
              providerFiles = Object.values(response.data.currentVersions);
            }
            
            const docsWithProvider = providerFiles.map(doc => ({
              ...doc,
              providerName: provider.name,
              providerId: provider.id
            }));
            allDocs.push(...docsWithProvider);
          } catch (err) {
            console.warn(`Cannot fetch docs for provider ${provider.id}: ${err.response?.status} - ${err.response?.data?.error || err.message}`);
            continue;
          }
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
      try {
        const response = await API.get('/team-leader/my-tasks');
        setMyTasks(response.data.tasks || []);
      } catch (error) {
        setMyTasks([]);
      }
    };

    const fetchTeamTasks = async () => {
  try {
    const response = await API.get('/team-leader/team-tasks');
    const tasks = response.data.tasks || [];
    // Filter out any null tasks
    const validTasks = tasks.filter(task => task !== null && task !== undefined);
    setTeamTasks(validTasks);
  } catch (error) {
    console.error("Error fetching team tasks:", error);
    setTeamTasks([]);
  }
};

    const fetchGroups = async () => {
  if (teamLeaderInfo?.leadingDepartment !== 'Credentialing') return;
  try {
    const response = await API.get('/groups/team-leader/all');
    // Ensure each group has default values for missing fields
    const groupsWithDefaults = (response.data || []).map(group => ({
      ...group,
      teamLeaderId: group.teamLeaderId || null,
      teamLeaderName: group.teamLeaderName || null
    }));
    setGroups(groupsWithDefaults);
  } catch (error) {
    console.error("Error fetching groups:", error);
    setGroups([]);
  }
};

// ==================== DATE HELPER FUNCTIONS ====================

const formatDateForDisplay = (isoDate) => {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  const [year, month, day] = parts;
  return `${month}-${day}-${year}`;
};

const formatDateForStorage = (usDate) => {
  if (!usDate) return '';
  const parts = usDate.split('-');
  if (parts.length !== 3) return '';
  const [month, day, year] = parts;
  if (!month || !day || !year || year.length !== 4) return '';
  return `${year}-${month}-${day}`;
};

const handleDateFieldChange = (e) => {
  const { name, value } = e.target;
  const digits = value.replace(/\D/g, '').slice(0, 8);
  let formatted = digits;
  if (digits.length > 2 && digits.length <= 4) {
    formatted = `${digits.slice(0, 2)}-${digits.slice(2)}`;
  } else if (digits.length > 4) {
    formatted = `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`;
  }
  setPayorFormData(prev => ({ ...prev, [name]: formatted }));
};

// ==================== CREDENTIALING STATUS FUNCTIONS ====================

const fetchCredentialingRecords = async (groupId) => {
  if (!groupId) return;
  setLoading(true);
  try {
    const response = await API.get(`/credentialing/group/${groupId}`);
    setCredentialingStatus(response.data.records || []);
  } catch (error) {
    console.error("Error fetching credentialing records:", error);
    setCredentialingStatus([]);
  } finally {
    setLoading(false);
  }
};

const fetchPayorSummary = async (groupId) => {
  if (!groupId) return;
  try {
    const response = await API.get(`/credentialing/group/${groupId}/summary`);
    setPayorSummaryList(response.data.payors || []);
  } catch (error) {
    console.error("Error fetching payor summary:", error);
    setPayorSummaryList([]);
  }
};

const fetchPayorFlatData = async (groupId, payerName) => {
  if (!groupId || !payerName) return;
  setLoading(true);
  try {
    const response = await API.get(`/credentialing/group/${groupId}/payor/${encodeURIComponent(payerName)}/flat`);
    setPayorFlatData(response.data);
  } catch (error) {
    console.error("Error fetching payor data:", error);
    showToastMessage("Failed to load payor details", "error");
  } finally {
    setLoading(false);
  }
};

const handleViewPayorDetails = async (payerName) => {
  setSelectedPayor(payerName);
  await fetchPayorFlatData(selectedGroupId, payerName);
  setShowPayorDetailsModal(true);
};

const handleAddPayor = () => {
  setEditingPayor(null);
  setPayorFormData({
    payerName: '',
    lob: '',
    network: '',
    product: '',
    plan: '',
    status: '',
    managingEntity: '',
    applicationDate: '',
    credentialingEffectiveDate: '',
    linkEffectiveDate: '',
    recredentialingDate: '',
    terminationDate: '',
    providerRep: '',
    contractingRep: ''
  });
  setShowAddPayorModal(true);
};

const handleEditPayor = (payor) => {
  setEditingPayor(payor);
  setPayorFormData({
    payerName: payor.payerName || '',
    lob: payor.lob || '',
    network: payor.network || '',
    product: payor.product || '',
    plan: payor.plan || '',
    status: payor.status || '',
    managingEntity: payor.managingEntity || '',
    applicationDate: formatDateForDisplay(payor.applicationDate),
    credentialingEffectiveDate: formatDateForDisplay(payor.credentialingEffectiveDate),
    linkEffectiveDate: formatDateForDisplay(payor.linkEffectiveDate),
    recredentialingDate: formatDateForDisplay(payor.recredentialingDate),
    terminationDate: formatDateForDisplay(payor.terminationDate),
    providerRep: payor.providerRep || '',
    contractingRep: payor.contractingRep || ''
  });
  setShowAddPayorModal(true);
};

const handlePayorInputChange = (e) => {
  setPayorFormData({
    ...payorFormData,
    [e.target.name]: e.target.value
  });
};

const handleSavePayor = async () => {
  if (!payorFormData.payerName) {
    showToastMessage("Payer Name is required", "error");
    return;
  }

  setLoading(true);
  try {
    if (!editingPayor) {
      try {
        const checkResponse = await API.get('/credentialing/check', {
          params: {
            groupId: selectedGroupId,
            payerName: payorFormData.payerName,
            lob: payorFormData.lob || '',
            network: payorFormData.network || '',
            product: payorFormData.product || '',
            plan: payorFormData.plan || ''
          }
        });
        
        if (checkResponse.data.exists) {
          showToastMessage("This exact combination already exists! Please add a different Plan or Product.", "error");
          setLoading(false);
          return;
        }
      } catch (checkError) {
        console.warn("Duplicate check failed, proceeding with save:", checkError);
      }
    }

    const payload = {
      providerId: selectedGroupId,
      groupId: selectedGroupId,
      payerName: payorFormData.payerName,
      lob: payorFormData.lob || null,
      network: payorFormData.network || null,
      product: payorFormData.product || null,
      plan: payorFormData.plan || null,
      status: payorFormData.status || null,
      managingEntity: payorFormData.managingEntity || null,
      applicationDate: formatDateForStorage(payorFormData.applicationDate) || null,
      credentialingEffectiveDate: formatDateForStorage(payorFormData.credentialingEffectiveDate) || null,
      linkEffectiveDate: formatDateForStorage(payorFormData.linkEffectiveDate) || null,
      recredentialingDate: formatDateForStorage(payorFormData.recredentialingDate) || null,
      terminationDate: formatDateForStorage(payorFormData.terminationDate) || null,
      providerRep: payorFormData.providerRep || null,
      contractingRep: payorFormData.contractingRep || null
    };

    if (editingPayor) {
      await API.put(`/credentialing/${editingPayor.id}`, payload);
      showToastMessage("Payor updated successfully");
    } else {
      await API.post('/credentialing/create', payload);
      showToastMessage("Payor added successfully");
    }

    await fetchCredentialingRecords(selectedGroupId);
    await fetchPayorSummary(selectedGroupId);
    
    setShowAddPayorModal(false);
    setEditingPayor(null);
  } catch (error) {
    console.error("Error saving payor:", error);
    if (error.response?.status === 409 && error.response?.data?.duplicate) {
      showToastMessage(error.response?.data?.message || "This combination already exists!", "error");
    } else {
      showToastMessage(error.response?.data?.error || "Failed to save payor", "error");
    }
  } finally {
    setLoading(false);
  }
};

const handleDeletePayor = async (payorId) => {
  if (!window.confirm("Are you sure you want to delete this payor record?")) return;
  
  setLoading(true);
  try {
    await API.delete(`/credentialing/${payorId}`);
    showToastMessage("Payor deleted successfully");
    await fetchCredentialingRecords(selectedGroupId);
    await fetchPayorSummary(selectedGroupId);
  } catch (error) {
    console.error("Error deleting payor:", error);
    showToastMessage(error.response?.data?.error || "Failed to delete payor", "error");
  } finally {
    setLoading(false);
  }
};


    // ==================== TASK MANAGEMENT FUNCTIONS ====================

    // Update task status for project tasks
  const updateProjectTaskStatus = async (taskId, newStatus) => {
    try {
      await API.put(`/team-leader/projects/tasks/${taskId}/status?status=${newStatus}`);
      showToastMessage(`Task status updated to ${newStatus}`);
      fetchProjectStats();
      // Refresh current project details if modal is open
      if (selectedProjectForTasks) {
        const response = await API.get(`/team-leader/projects/${selectedProjectForTasks.id}`);
        setSelectedProjectForTasks(response.data);
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      showToastMessage("Failed to update task status", "error");
    }
  };

  

    const updateTeamTaskStatus = async (taskId, newStatus) => {
      try {
        await API.put(`/tasks/${taskId}/status?status=${newStatus}`);
        showToastMessage(`Task status updated to ${newStatus}`);
        fetchTeamTasks();
      } catch (error) {
        showToastMessage("Failed to update task status", "error");
      }
    };

    const addComment = async () => {
      if (!taskComment.trim()) {
        showToastMessage("Please enter a comment", "error");
        return;
      }
      setAddingComment(true);
      try {
        await API.post(`/team-leader/add-comment/${selectedTask.id}`, { comment: taskComment });
        showToastMessage("Comment added successfully");
        setTaskComment('');
        fetchMyTasks();
        if (selectedTask) {
          const newComment = {
            id: Date.now(),
            userName: teamLeaderInfo?.fullName || storedName,
            comment: taskComment,
            createdAt: new Date().toISOString()
          };
          setSelectedTask({
            ...selectedTask,
            comments: [...(selectedTask.comments || []), newComment]
          });
        }
      } catch (error) {
        showToastMessage("Failed to add comment", "error");
      } finally {
        setAddingComment(false);
      }
    };

    const handleAddAssigneeToProject = async () => {
  if (!selectedAssigneeId || !currentProjectForAssignee) {
    showToastMessage("Please select a team member", "error");
    return;
  }
  
  setLoading(true);
  try {
    await API.post(`/team-leader/projects/${currentProjectForAssignee.id}/assignees`, {
      userId: parseInt(selectedAssigneeId)
    });
    showToastMessage("Team member added to project successfully");
    setShowAddAssigneeModal(false);
    setSelectedAssigneeId('');
    setCurrentProjectForAssignee(null);
    fetchProjectStats();
    // Refresh project details
    if (selectedProjectForTasks) {
      const response = await API.get(`/team-leader/projects/${selectedProjectForTasks.id}`);
      setSelectedProjectForTasks(response.data);
    }
  } catch (error) {
    console.error("Error adding assignee:", error);
    showToastMessage(error.response?.data?.error || "Failed to add team member", "error");
  } finally {
    setLoading(false);
  }
};

    const handleAssignTeamLeaderToGroup = async () => {
  if (!selectedTeamLeaderForGroup) {
    showToastMessage("Please select a Team Leader", "error");
    return;
  }
  setLoading(true);
  try {
    await API.post(`/groups/${selectedGroupId}/assign-team-leader-to-group?userId=${selectedTeamLeaderForGroup}`);
    showToastMessage("Team Leader assigned successfully");
    setShowAssignTeamLeaderModal(false);
    setSelectedTeamLeaderForGroup('');
    fetchGroups();
    fetchGroupManagers(selectedGroupId);
  } catch (error) {
    showToastMessage(error.response?.data?.error || "Failed to assign Team Leader", "error");
  } finally {
    setLoading(false);
  }
};

const handleAssignTeamMemberToGroup = async () => {
  if (!selectedTeamMemberForGroup) {
    showToastMessage("Please select a Team Member", "error");
    return;
  }
  setLoading(true);
  try {
    await API.post(`/groups/${selectedGroupId}/assign-team-member-to-group?userId=${selectedTeamMemberForGroup}`);
    showToastMessage("Team Member assigned successfully");
    setShowAssignTeamMemberModal(false);
    setSelectedTeamMemberForGroup('');
    fetchGroups();
  } catch (error) {
    showToastMessage(error.response?.data?.error || "Failed to assign Team Member", "error");
  } finally {
    setLoading(false);
  }
};

    const logTime = async () => {
      if (!timeSpent || parseInt(timeSpent) <= 0) {
        showToastMessage("Please enter valid hours", "error");
        return;
      }
      setLoggingTime(true);
      try {
        await API.post(`/team-leader/log-time/${selectedTask.id}`, { 
          hoursSpent: parseInt(timeSpent), 
          description: timeDescription 
        });
        showToastMessage(`Logged ${timeSpent} hours`);
        setTimeSpent('');
        setTimeDescription('');
        setShowTimeLog(false);
        fetchMyTasks();
      } catch (error) {
        showToastMessage("Failed to log time", "error");
      } finally {
        setLoggingTime(false);
      }
    };

    const reassignTask = async (taskId, newTeamMemberId) => {
      if (!newTeamMemberId) return;
      setLoading(true);
      try {
        await API.put(`/team-leader/reassign-task/${taskId}?newTeamMemberId=${newTeamMemberId}`);
        showToastMessage("Task reassigned successfully");
        fetchTeamTasks();
      } catch (error) {
        showToastMessage("Failed to reassign task", "error");
      } finally {
        setLoading(false);
      }
    };

    // ==================== GROUP MANAGEMENT HANDLER FUNCTIONS ====================

    const fetchGroupManagers = async (groupId) => {
      if (!groupId) return;
      
      try {
        const response = await API.get(`/groups/${groupId}/managers`);
        setExistingManagers(response.data || []);
      } catch (error) {
        console.error("Error fetching group managers:", error);
        setExistingManagers([]);
      }
    };

    const fetchGroupProviders = async (groupId) => {
    if (!groupId) return;
    
    try {
        const response = await API.get(`/groups/${groupId}/providers`);
        // ✅ extract the providers array from the response object
        const data = response.data;
        if (Array.isArray(data)) {
            setGroupProviders(data);
        } else if (data && Array.isArray(data.providers)) {
            setGroupProviders(data.providers);
        } else {
            setGroupProviders([]);
        }
    } catch (error) {
        console.error("Error fetching group providers:", error);
        setGroupProviders([]);
    }
};

    const fetchAvailableManagers = async (groupId) => {
      try {
        const response = await API.get(`/groups/${groupId}/available-managers`);
        setAvailableManagers(response.data || []);
        setAvailableManagersList(response.data || []);
      } catch (error) {
        console.error("Error fetching available managers:", error);
        setAvailableManagers([]);
        setAvailableManagersList([]);
      }
    };

    const handleCreateGroupWithManager = async () => {
      if (!newGroupName) {
        showToastMessage("Please enter a group name", "error");
        return;
      }
      setLoading(true);
      try {
        const payload = { groupName: newGroupName };
        if (newGroupManagerId) {
          payload.managerId = newGroupManagerId;
        }
        await API.post('/groups/create', payload);
        showToastMessage(`Group "${newGroupName}" created successfully`);
        setShowCreateGroupModal(false);
        setNewGroupName("");
        setNewGroupManagerId("");
        fetchGroups();
      } catch (error) {
        showToastMessage("Failed to create group", "error");
      } finally {
        setLoading(false);
      }
    };

    const handleCreateGroupManager = async () => {
      if (!managerUsername || !managerPassword || !managerFullName) {
        showToastMessage("Please fill all required fields", "error");
        return;
      }
      setLoading(true);
      try {
        await API.post('/admin/create-user', {
          username: managerUsername,
          password: managerPassword,
          fullName: managerFullName,
          email: managerEmail,
          phoneNumber: managerPhone,
          role: "GROUP_MGR"
        });
        showToastMessage(`Manager "${managerFullName}" created successfully`);
        setShowCreateManagerModal(false);
        setManagerFullName("");
        setManagerEmail("");
        setManagerPhone("");
        setManagerUsername("");
        setManagerPassword("");
        if (selectedGroupId) {
          fetchAvailableManagers(selectedGroupId);
        }
      } catch (error) {
        showToastMessage("Failed to create manager", "error");
      } finally {
        setLoading(false);
      }
    };

    const handleAssignManagerToGroup = async () => {
      if (!selectedManagerId) {
        showToastMessage("Please select a manager", "error");
        return;
      }
      setLoading(true);
      try {
        await API.post(`/groups/${selectedGroupId}/assign-manager?userId=${selectedManagerId}`);
        showToastMessage("Manager assigned successfully");
        setShowAssignManagerModal(false);
        setSelectedManagerId("");
        fetchGroupManagers(selectedGroupId);
        fetchGroups();
      } catch (error) {
        showToastMessage("Failed to assign manager", "error");
      } finally {
        setLoading(false);
      }
    };

    const handleRemoveManager = async (groupId, managerId, managerName) => {
      if (!window.confirm(`Are you sure you want to remove ${managerName} from this group?`)) return;
      setLoading(true);
      try {
        await API.delete(`/groups/${groupId}/remove-manager/${managerId}`);
        showToastMessage(`Removed ${managerName} from group`);
        fetchGroupManagers(groupId);
        fetchGroups();
      } catch (error) {
        showToastMessage("Failed to remove manager", "error");
      } finally {
        setLoading(false);
      }
    };

    const handleRemoveProviderFromGroup = async (groupId, providerId, providerName) => {
      if (!window.confirm(`Are you sure you want to remove ${providerName} from this group?`)) return;
      setLoading(true);
      try {
        await API.post(`/groups/${groupId}/remove-provider?providerId=${providerId}`);
        showToastMessage(`Removed ${providerName} from group`);
        fetchGroupProviders(groupId);
        fetchGroups();
      } catch (error) {
        showToastMessage("Failed to remove provider", "error");
      } finally {
        setLoading(false);
      }
    };

    const handleDeleteGroup = async (groupId, groupName) => {
      if (!window.confirm(`Are you sure you want to delete "${groupName}"? This action cannot be undone.`)) return;
      setLoading(true);
      try {
        await API.delete(`/groups/${groupId}`);
        showToastMessage(`Group "${groupName}" deleted`);
        setSelectedGroupId(null);
        fetchGroups();
      } catch (error) {
        showToastMessage("Failed to delete group", "error");
      } finally {
        setLoading(false);
      }
    };

    const handleUpdateGroup = async () => {
      if (!editGroupName) {
        showToastMessage("Please enter a group name", "error");
        return;
      }
      setLoading(true);
      try {
        await API.put(`/groups/${selectedGroupId}`, { name: editGroupName });
        showToastMessage("Group updated successfully");
        setShowEditGroupModal(false);
        fetchGroups();
      } catch (error) {
        showToastMessage("Failed to update group", "error");
      } finally {
        setLoading(false);
      }
    };

    const handleAddProviderToGroupEnhanced = async () => {
      if (!selectedProviderId) {
        showToastMessage("Please select a provider", "error");
        return;
      }
      setLoading(true);
      try {
        await API.post(`/groups/${selectedGroupId}/add-provider?providerId=${selectedProviderId}`);
        showToastMessage("Provider added to group successfully");
        setShowAddProviderModal(false);
        setSelectedProviderId("");
        fetchGroupProviders(selectedGroupId);
        fetchGroups();
      } catch (error) {
        showToastMessage("Failed to add provider to group", "error");
      } finally {
        setLoading(false);
      }
    };

    const fetchUnassignedProviders = async () => {
      try {
        const response = await API.get('/providers/unassigned');
        console.log("Fetched providers for group assignment:", response.data);
        setUnassignedProviders(response.data || []);
      } catch (error) {
        console.error("Error fetching providers:", error);
        setUnassignedProviders([]);
      }
    };

    const openAddProviderModal = async () => {
      await fetchUnassignedProviders();
      setShowAddProviderModal(true);
    };

    // ==================== TEAM MANAGEMENT ====================

    const assignProviderToTeamMember = async () => {
      if (!selectedProvider || !selectedTeamMember) {
          showToastMessage("Please select both provider and team member", "error");
          return;
      }
      
      setLoading(true);
      try {
          console.log("Assigning provider:", selectedProvider.id, "to team member:", selectedTeamMember);
          
          const response = await API.post(`/team-leader/assign-provider`, null, {
    params: { providerId: selectedProvider.id, teamMemberId: selectedTeamMember }
});
          console.log("Assignment response:", response.data);
          
          showToastMessage("Provider assigned successfully");
          setSelectedProvider(null);
          setSelectedTeamMember('');
          
          await fetchProviders();
          await fetchTeamMembers();
          
      } catch (error) {
          console.error("Assignment error:", error);
          showToastMessage("Failed to assign provider: " + (error.response?.data?.error || error.message), "error");
      } finally {
          setLoading(false);
      }
    };

    const assignTaskToTeamMember = async (e) => {
      e.preventDefault();
      if (!selectedTeamMember) {
        showToastMessage("Please select a team member to assign the task", "error");
        return;
      }
      if (!taskTitle.trim()) {
        showToastMessage("Please enter a task title", "error");
        return;
      }
      setLoading(true);
      try {
        await API.post('/team-leader/assign-task', {
          teamMemberId: selectedTeamMember,
          title: taskTitle,
          description: taskDescription,
          priority: taskPriority,
          dueDate: taskDueDate,
          relatedProviderId: taskRelatedProvider || null
        });
        showToastMessage("Task assigned successfully");
        setTaskTitle('');
        setTaskDescription('');
        setTaskPriority('MEDIUM');
        setTaskDueDate('');
        setTaskRelatedProvider('');
        setSelectedTeamMember('');
        fetchTeamTasks();
      } catch (error) {
        showToastMessage("Failed to assign task", "error");
      } finally {
        setLoading(false);
      }
    };

    const handleCreateGroup = async () => {
      if (!groupName) {
        showToastMessage("Please enter a group name", "error");
        return;
      }
      setLoading(true);
      try {
        await API.post('/groups/team-leader/create', { groupName });
        showToastMessage(`Group "${groupName}" created successfully`);
        setGroupName('');
        setShowGroupModal(false);
        fetchGroups();
      } catch (error) {
        showToastMessage("Failed to create group", "error");
      } finally {
        setLoading(false);
      }
    };

    const handleAddProviderToGroup = async () => {
      if (!selectedGroup || !selectedGroupProvider) {
        showToastMessage("Please select both group and provider", "error");
        return;
      }
      setLoading(true);
      try {
        await API.post(`/groups/${selectedGroup}/add-provider?providerId=${selectedGroupProvider}`);
        showToastMessage("Provider added to group successfully");
        setSelectedGroup('');
        setSelectedGroupProvider('');
        fetchGroups();
        fetchProviders();
      } catch (error) {
        showToastMessage("Failed to add provider to group", "error");
      } finally {
        setLoading(false);
      }
    };

    const exportProviderProfile = async (providerId) => {
      try {
        const response = await API.get(`/provider-profile/export/${providerId}`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `provider_${providerId}_profile.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        showToastMessage("Profile exported successfully");
      } catch (error) {
        showToastMessage("Failed to export profile", "error");
      }
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

    const getCompletionPercentage = (providerId) => {
  const categories = getDocumentCategories();
  let requiredTotal = 0;
  let uploadedRequired = 0;
  
  Object.values(categories).forEach(category => {
    category.documents.forEach(doc => {
      if (doc.required) {
        requiredTotal++;
        // Check exact match
        let isUploaded = !!uploadedDocs[doc.id];
        
        // For MEDICAL_LICENSE, also check any LICENSE_* files
        if (doc.id === 'MEDICAL_LICENSE' && !isUploaded) {
          isUploaded = Object.keys(uploadedDocs).some(key => key.startsWith('LICENSE_'));
        }
        
        // For BOARD_CERTIFICATION
        if (doc.id === 'BOARD_CERTIFICATION' && !!uploadedDocs['BOARD_CERTIFICATION']) {
          isUploaded = true;
        }
        
        if (isUploaded) uploadedRequired++;
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

    // ==================== FILTERED TASKS ====================

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

    // ==================== PROVIDER DIRECTORY ====================

    const filteredProviders = providers.filter(provider => {
      if (providerSearch && !provider.name?.toLowerCase().includes(providerSearch.toLowerCase()) &&
          !provider.specialty?.toLowerCase().includes(providerSearch.toLowerCase()) &&
          !provider.npiNumber?.includes(providerSearch)) {
        return false;
      }
      if (providerSpecialtyFilter !== "ALL" && provider.specialty !== providerSpecialtyFilter) {
        return false;
      }
      return true;
    });


    const totalProviderPages = Math.ceil(filteredProviders.length / providersPerPage);
    const paginatedProviders = filteredProviders.slice(
      (providerPage - 1) * providersPerPage,
      providerPage * providersPerPage
    );

    const filteredTeamTasks = teamTasks.filter(task => {
 
  if (!task) return false;
  
  if (taskSearch && !task.title?.toLowerCase().includes(taskSearch.toLowerCase()) &&
      !task.description?.toLowerCase().includes(taskSearch.toLowerCase()) &&
      !task.assignedToName?.toLowerCase().includes(taskSearch.toLowerCase())) {
    return false;
  }
  if (taskFilter !== "ALL" && task.status !== taskFilter) {
    return false;
  }
  return true;
});

    const totalTeamTaskPages = Math.ceil(filteredTeamTasks.length / tasksPerPage);
    const paginatedTeamTasks = filteredTeamTasks.slice(
      (teamTaskPage - 1) * tasksPerPage,
      teamTaskPage * tasksPerPage
    );

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
      
      fetchTeamLeaderInfo();
      fetchTeamMembers();
      fetchProviders();
      fetchMyTasks();
      fetchTeamTasks();
      fetchProjects();           
    fetchProjectStats();       
    fetchAvailableTeamMembers();
    fetchAssignableUsersForTask();
      
    }, []);

    useEffect(() => {
      if (teamLeaderInfo?.leadingDepartment === 'Credentialing') {
        fetchGroups();
        fetchAllDocuments();
      }
    }, [teamLeaderInfo, providers]);

    const handleProviderSelect = async (provider) => {
      if (teamLeaderInfo?.leadingDepartment !== 'Credentialing') return;
      if (!provider || !provider.id) {
        showToastMessage("Invalid provider selected", "error");
        return;
      }
      setSelectedProvider(provider);
      setSelectedDocId("");
      setUploadFile(null);
      await fetchProviderDocuments(provider.id);
    };

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
                <span className="task-priority">{getPriorityIcon(task.priority)} {task.priority}</span>
              </div>
              <div className="task-list-col" style={{ width: '20%' }}>
                <span className={`due-date ${isOverdue(task.dueDate) ? 'overdue' : ''}`}>
                  <i className="fas fa-calendar"></i> {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                </span>
              </div>
            </div>
          ))}
        </div>
        {totalFilteredPages > 1 && (
          <div className="pagination-container">
            <button className="pagination-btn" onClick={() => setTaskPage(p => Math.max(1, p - 1))} disabled={taskPage === 1}>
              <i className="fas fa-chevron-left"></i> Previous
            </button>
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
            <button className="pagination-btn" onClick={() => setTaskPage(p => Math.min(totalFilteredPages, p + 1))} disabled={taskPage === totalFilteredPages}>
              Next <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        )}
        <div className="pagination-info">Showing {((taskPage - 1) * tasksPerPage) + 1} to {Math.min(taskPage * tasksPerPage, filteredTasksForView.length)} of {filteredTasksForView.length} tasks</div>
      </div>
    );

    // ==================== DEPARTMENT-SPECIFIC SUMMARY CARDS ====================

    const CredentialingSummaryCards = () => {
      const countByFileType = (type) => {
        let count = 0;
        providers.forEach(provider => {
          if (provider.files) {
            count += provider.files.filter(f => f.fileType === type).length;
          }
        });
        return count;
      };

      const cards = [
        { label: "Total Providers", value: providerStats.total, icon: <i className="fas fa-users"></i>, color: "#2980b9", clickable: true, onClick: () => setActiveView('PROVIDER_DIRECTORY') },
        { label: "Expiring Licenses", value: providerStats.expiring, icon: <i className="fas fa-exclamation-triangle"></i>, color: "#f39c12", clickable: true, onClick: () => { 
  const expiringProviders = providers.filter(p => isExpiring30(p.licenseExpiry));
  console.log('Expiring providers:', expiringProviders);
  setFilteredProviders(expiringProviders); 
  setShowFilteredProviders(true); 
} },
        { label: "Expired Licenses", value: providerStats.expired, icon: <i className="fas fa-bell"></i>, color: "#c0392b", clickable: true, onClick: () => { setFilteredProviders(providers.filter(p => isExpired(p.licenseExpiry))); setShowFilteredProviders(true); } },
        { label: "Group By Practice", value: countByFileType("GROUP_BY_PRACTICE"), icon: <i className="fas fa-hospital"></i>, color: "#8e44ad", clickable: true, onClick: () => { setDocTypeFilter("GROUP_BY_PRACTICE"); setActiveView('ALL_DOCUMENTS'); } },
        { label: "Upcoming Renewals", value: countByFileType("RENEWALS"), icon: <i className="fas fa-sync-alt"></i>, color: "#27ae60", clickable: true, onClick: () => { setDocTypeFilter("RENEWALS"); setActiveView('ALL_DOCUMENTS'); } },
        { label: "Recredentialing", value: countByFileType("RECREDENTIALING"), icon: <i className="fas fa-calendar"></i>, color: "#16a085", clickable: true, onClick: () => { setDocTypeFilter("RECREDENTIALING"); setActiveView('ALL_DOCUMENTS'); } },
        { label: "Contracts", value: countByFileType("CONTRACTS"), icon: <i className="fas fa-file-signature"></i>, color: "#d35400", clickable: true, onClick: () => { setDocTypeFilter("CONTRACTS"); setActiveView('ALL_DOCUMENTS'); } },
        { label: "Payors", value: countByFileType("PAYORS"), icon: <i className="fas fa-credit-card"></i>, color: "#2c3e50", clickable: true, onClick: () => { setDocTypeFilter("PAYORS"); setActiveView('ALL_DOCUMENTS'); } },
      ];

      return (
        <div className="summary-cards">
          {cards.map((card) => (
            <div key={card.label} className="card" style={{ borderTop: `3px solid ${card.color}`, cursor: card.clickable ? 'pointer' : 'default', transition: 'transform 0.2s, box-shadow 0.2s' }} onClick={card.clickable && card.onClick ? card.onClick : undefined}>
              <div className="card-icon" style={{ color: card.color }}>{card.icon}</div>
              <h4>{card.label}</h4>
              <p style={{ color: card.value > 0 && card.label !== "Total Providers" ? card.color : 'inherit' }}>{card.value}</p>
              {card.clickable && (<span className="card-click-hint" style={{ fontSize: '0.65rem', color: card.color, marginTop: '4px', display: 'block' }}>Click to view →</span>)}
            </div>
          ))}
        </div>
      );
    };

    const ChargeEntrySummaryCards = () => (
      <div className="stats-cards-row">
        <div className="stat-card stat-card-blue"><div className="stat-value">1,234</div><div className="stat-label">Claims Processed</div><div className="stat-sub">This Month</div></div>
        <div className="stat-card stat-card-amber"><div className="stat-value">56</div><div className="stat-label">Pending Claims</div><div className="stat-sub">Awaiting Processing</div></div>
        <div className="stat-card stat-card-red"><div className="stat-value">23</div><div className="stat-label">Denied Claims</div><div className="stat-sub">Need Review</div></div>
        <div className="stat-card stat-card-green"><div className="stat-value">2.4</div><div className="stat-label">Avg. Turnaround</div><div className="stat-sub">Days to Process</div></div>
      </div>
    );

    const PostingSummaryCards = () => (
      <div className="stats-cards-row">
        <div className="stat-card stat-card-blue"><div className="stat-value">567</div><div className="stat-label">Payments Posted</div><div className="stat-sub">This Month</div></div>
        <div className="stat-card stat-card-amber"><div className="stat-value">12</div><div className="stat-label">Unposted Payments</div><div className="stat-sub">Pending Review</div></div>
        <div className="stat-card stat-card-green"><div className="stat-value">34</div><div className="stat-label">Adjustments</div><div className="stat-sub">Processed</div></div>
        <div className="stat-card stat-card-teal"><div className="stat-value">$45,678</div><div className="stat-label">Total Amount</div><div className="stat-sub">Posted This Month</div></div>
      </div>
    );

    const ARSummaryCards = () => (
      <div className="stats-cards-row">
        <div className="stat-card stat-card-blue"><div className="stat-value">45/32/23</div><div className="stat-label">AR Aging</div><div className="stat-sub">30/60/90 days</div></div>
        <div className="stat-card stat-card-red"><div className="stat-value">23</div><div className="stat-label">Over 90 Days</div><div className="stat-sub">Needs Attention</div></div>
        <div className="stat-card stat-card-green"><div className="stat-value">78%</div><div className="stat-label">Collection Rate</div><div className="stat-sub">YTD Average</div></div>
        <div className="stat-card stat-card-amber"><div className="stat-value">$5,678</div><div className="stat-label">Write-offs</div><div className="stat-sub">This Month</div></div>
      </div>
    );

    // ==================== DOCUMENT UPLOAD SECTION ====================

    const DocumentUploadSection = () => {
      const categories = getDocumentCategories();
      const sortedCategories = Object.entries(categories).sort((a, b) => a[1].order - b[1].order);
      const completionPercentage = getCompletionPercentage();

      return (
        <div className="document-upload-section">
          
          <div className="upload-header">
            <div className="upload-header-title">
              <h3>Upload Documents for {selectedProvider?.name}</h3>
              <button className="close-selection-btn" onClick={() => { setSelectedProvider(null); setSelectedDocId(""); setUploadFile(null); setUploadedDocs({}); }}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <p className="upload-subtitle">Upload required credentialing documents. Required documents are marked with <span className="required-star">*</span></p>
          </div>

          <div className="completion-progress-container">
            <div className="progress-header">
              <span className="progress-title">Credentialing Completion</span>
              <span className="progress-percentage">{completionPercentage}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${completionPercentage}%` }} />
            </div>
            <div className="progress-stats">
              <span><i className="fas fa-check-circle"></i> {Object.values(uploadedDocs).length} documents uploaded</span>
              {completionPercentage === 100 && <span className="complete-badge"><i className="fas fa-trophy"></i> Ready for Review!</span>}
            </div>
          </div>

          <div className="categories-container">
            {sortedCategories.map(([categoryKey, category]) => {
              console.log('Rendering category:', categoryKey, 'Expanded:', expandedCategories[categoryKey]);
              const isExpanded = expandedCategories[categoryKey];
              const uploadedCount = category.documents.filter(doc => {
  if (uploadedDocs[doc.id]) return true;
  // For MEDICAL_LICENSE in Licenses category, count LICENSE_* as uploaded
  if (doc.id === 'MEDICAL_LICENSE' && Object.keys(uploadedDocs).some(key => key.startsWith('LICENSE_'))) return true;
  return false;
}).length;
              const totalCount = category.documents.length;
              
              return (
                <div key={categoryKey} className="category-card">
                  <div className="category-header" onClick={() => toggleCategory(categoryKey)}>
                    <div className="category-title">
                      <span className="category-icon">{category.icon}</span>
                      <span className="category-name">{category.name}</span>
                    </div>
                    <div className="category-stats">
                      <span className="upload-count">{uploadedCount}/{totalCount} uploaded</span>
                      <span className="category-toggle">{isExpanded ? <i className="fas fa-chevron-up"></i> : <i className="fas fa-chevron-down"></i>}</span>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    
                    <div className="category-documents">
                      
                      {category.documents.map(doc => {
                        console.log('Processing document:', doc.id);
  console.log('Is this doc in uploadedDocs?', !!uploadedDocs[doc.id]);
  console.log('All uploadedDocs keys:', Object.keys(uploadedDocs));
  // Handle dynamic license matching
  let isUploaded = !!uploadedDocs[doc.id];
let uploadedDoc = uploadedDocs[doc.id];

// For MEDICAL_LICENSE, also check for any LICENSE_* files
if (doc.id === 'MEDICAL_LICENSE' && !isUploaded) {
  console.log('Looking for LICENSE_* in uploadedDocs keys:', Object.keys(uploadedDocs));
  const licenseKey = Object.keys(uploadedDocs).find(key => key.startsWith('LICENSE_'));
  console.log('Found licenseKey:', licenseKey);
  if (licenseKey) {
    isUploaded = true;
    uploadedDoc = uploadedDocs[licenseKey];
    console.log('Set isUploaded to true for MEDICAL_LICENSE');
  }
}
  
  const docRule = getDocumentRule(doc.id);
                        
                        return (
                          <div key={doc.id} className={`document-row ${isUploaded ? 'uploaded' : ''}`}>
                            <div className="document-info">
  <div className="document-name">
    {doc.name}
    {doc.required && <span className="required-badge">Required</span>}
  </div>
  {/* Add this line to show which state license is uploaded */}
  {doc.id === 'MEDICAL_LICENSE' && uploadedDoc && uploadedDoc.fileType && uploadedDoc.fileType.startsWith('LICENSE_') && (
    <div className="document-help">
      <i className="fas fa-info-circle"></i> License uploaded for: {uploadedDoc.fileType.replace('LICENSE_', '')}
    </div>
  )}
  {doc.helpText && <div className="document-help"><i className="fas fa-info-circle"></i> {doc.helpText}</div>}
  {docRule.type === "multiple" && <div className="doc-type-badge-small"><i className="fas fa-copy"></i> Multiple versions allowed</div>}
</div>
                            {isUploaded ? (
                              <div className="document-actions">
                                <div className="document-status">
                                  <span className="uploaded-check"><i className="fas fa-check-circle"></i></span>
                                  <span className="uploaded-text">Uploaded</span>
                                  <span className="uploaded-date">{new Date(uploadedDoc?.uploadedAt).toLocaleDateString()}</span>
                                </div>
                                <div className="action-buttons">
                                  <button className="action-btn history-btn" onClick={() => viewDocumentHistory(selectedProvider.id, doc.id, selectedProvider.name)}>
                                    <i className="fas fa-history"></i> History
                                  </button>
                                  <button className="action-btn reupload-btn" onClick={() => {
    setReplaceDocumentType(doc.id);
    setReplaceCurrentDocument(uploadedDoc);
    setReplaceProvider(selectedProvider);
    setShowReplaceLicenseModal(true);
}}>
    <i className="fas fa-sync-alt"></i> Replace
</button>
                                  <button className="action-btn delete-btn" onClick={() => handleDeleteDocument(uploadedDoc.id, uploadedDoc.fileName, selectedProvider.id, uploadedDoc.filePath)}>
                                    <i className="fas fa-trash-alt"></i> Delete
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button className="upload-doc-btn" onClick={() => {
    setReplaceDocumentType(doc.id);
    setReplaceCurrentDocument(null);  // No existing document
    setReplaceProvider(selectedProvider);
    setShowReplaceLicenseModal(true);
}}>
    <i className="fas fa-upload"></i> Upload
</button>
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

          <input 
            id="file-upload" 
            type="file" 
            style={{ display: 'none' }} 
            onChange={e => { 
              const docId = e.target.dataset.docId; 
              const providerData = e.target.dataset.provider;
              
              if (e.target.files[0] && docId && providerData) { 
                try {
                  const provider = JSON.parse(providerData);
                  handleFileSelection(e.target.files[0], docId, provider); 
                } catch (err) {
                  console.error("Error parsing provider data:", err);
                }
                e.target.value = ''; 
              } else {
                console.error("Missing data:", { docId, providerData });
              }
            }} 
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" 
          />
          {uploading && (<div className="uploading-indicator"><div className="spinner"></div><span><i className="fas fa-spinner fa-spin"></i> Uploading document...</span></div>)}
        </div>
      );
    };

    const userInitial = teamLeaderInfo?.fullName?.charAt(0)?.toUpperCase() || storedName?.charAt(0)?.toUpperCase() || "T";
    const isCredentialing = teamLeaderInfo?.leadingDepartment === 'Credentialing';
    const isChargeEntry = teamLeaderInfo?.leadingDepartment === 'Charge Entry';
    const isPosting = teamLeaderInfo?.leadingDepartment === 'Posting';
    const isAccountsReceivable = teamLeaderInfo?.leadingDepartment === 'Accounts Receivable';

    return (
      <div className="ad-root">
        {/* Sidebar */}
        <aside className="ad-sidebar">
          <div className="ad-logo-row">
            <div className="ad-logo-mark">{userInitial}</div>
            <div>
              <span className="ad-logo-text">{teamLeaderInfo?.fullName || storedName}</span>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>{teamLeaderInfo?.leadingDepartment || 'Credentialing'} Team Leader</div>
            </div>
          </div>
          <nav className="ad-nav">
            <div className="ad-nav-section">
              <span className="ad-nav-section-label">Main Menu</span>
              <button className={`ad-nav-btn ${activeView === 'DASHBOARD' ? 'ad-nav-active' : ''}`} onClick={() => setActiveView('DASHBOARD')}>
                <i className="fas fa-chart-pie"></i> Dashboard
              </button>
              <button className={`ad-nav-btn ${activeView === 'MY_TASKS' ? 'ad-nav-active' : ''}`} onClick={() => setActiveView('MY_TASKS')}>
                <i className="fas fa-tasks"></i> My Tasks ({myTasks.filter(t => t.status !== 'COMPLETED').length})
              </button>
              <button className={`ad-nav-btn ${activeView === 'TEAM_TASKS' ? 'ad-nav-active' : ''}`} onClick={() => setActiveView('TEAM_TASKS')}>
                <i className="fas fa-users"></i> Team Tasks ({teamTasks.filter(t => t.status !== 'COMPLETED').length})
              </button>
              <button className={`ad-nav-btn ${activeView === 'TEAM_MEMBERS' ? 'ad-nav-active' : ''}`} onClick={() => setActiveView('TEAM_MEMBERS')}>
                <i className="fas fa-user-friends"></i> Team Members
              </button>
              <button className={`ad-nav-btn ${activeView === 'PROVIDER_DIRECTORY' ? 'ad-nav-active' : ''}`} onClick={() => setActiveView('PROVIDER_DIRECTORY')}>
                <i className="fas fa-folder-open"></i> Provider Directory
              </button>
              <button
  className="ad-nav-btn"
  onClick={() => setShowCreateTaskModal(true)}
>
  <i className="fas fa-plus-square"></i> Create Task
</button>
            <button className={`ad-nav-btn ${activeView === 'PROJECTS' ? 'ad-nav-active' : ''}`} onClick={() => setActiveView('PROJECTS')}>
            <i className="fas fa-project-diagram"></i> Projects
            </button>
            <button className={`ad-nav-btn ${activeView === 'CREATE_PROJECT' ? 'ad-nav-active' : ''}`} onClick={() => setActiveView('CREATE_PROJECT')}>
            <i className="fas fa-plus-circle"></i> Create Project
            </button>
              {isCredentialing && (
                <>
                  <button className={`ad-nav-btn ${activeView === 'PROVIDER_DOCS' ? 'ad-nav-active' : ''}`} onClick={() => setActiveView('PROVIDER_DOCS')}>
                    <i className="fas fa-file-alt"></i> Provider Documents
                  </button>
                  <button className={`ad-nav-btn ${activeView === 'ALL_DOCUMENTS' ? 'ad-nav-active' : ''}`} onClick={() => { setActiveView('ALL_DOCUMENTS'); fetchAllDocuments(); }}>
                    <i className="fas fa-folder"></i> All Documents
                  </button>
                  <button className={`ad-nav-btn ${activeView === 'ADD_PROVIDER' ? 'ad-nav-active' : ''}`} onClick={() => setActiveView('ADD_PROVIDER')}>
                  <i className="fas fa-plus-circle"></i> Add Provider
                  </button>
                  <button className={`ad-nav-btn ${activeView === 'GROUPS' ? 'ad-nav-active' : ''}`} onClick={() => setActiveView('GROUPS')}>
                    <i className="fas fa-layer-group"></i> Group Management
                  </button>
                </>
              )}
              <button className={`ad-nav-btn ${activeView === 'PROFILE' ? 'ad-nav-active' : ''}`} onClick={() => setActiveView('PROFILE')}>
                <i className="fas fa-user"></i> My Profile
              </button>
            </div>
          </nav>
          <div className="ad-sidebar-bottom">
            <div className="ad-user-row">
              <div className="ad-user-ava">{userInitial}</div>
              <div className="ad-user-info">
                <span className="ad-user-name">{teamLeaderInfo?.fullName || storedName}</span>
                <span className="ad-user-role">Team Leader</span>
              </div>
            </div>
            <button className="ad-signout" onClick={() => { localStorage.clear(); window.location.href = "/login"; }}>
              <i className="fas fa-sign-out-alt"></i> Sign out
            </button>
          </div>
        </aside>

        <div className="ad-main-wrap">
          <header className="ad-header">
            <div>
              <h1 className="ad-header-title">
                {activeView === 'DASHBOARD' && 'Dashboard'}
                {activeView === 'MY_TASKS' && 'My Tasks'}
                {activeView === 'TEAM_TASKS' && 'Team Tasks'}
                {activeView === 'TEAM_MEMBERS' && 'Team Members'}
                {activeView === 'PROVIDER_DIRECTORY' && 'Provider Directory'}
                {activeView === 'PROVIDER_DOCS' && 'Provider Documents'}
                {activeView === 'ALL_DOCUMENTS' && 'All Documents'}
                {activeView === 'GROUPS' && 'Group Management'}
                {activeView === 'ADD_PROVIDER' && 'Add Provider'}
                {activeView === 'PROFILE' && 'My Profile'}
              </h1>
              <p className="ad-header-sub">
                {activeView === 'DASHBOARD' && 'Overview of your team and tasks'}
                {activeView === 'MY_TASKS' && `Tasks assigned to you (${myTasks.length})`}
                {activeView === 'TEAM_TASKS' && `Tasks assigned to your team (${teamTasks.length})`}
                {activeView === 'TEAM_MEMBERS' && `Manage your ${teamMembers.length} team members`}
                {activeView === 'PROVIDER_DIRECTORY' && `View all ${providers.length} providers`}
                {activeView === 'PROVIDER_DOCS' && 'Upload and manage provider documents'}
                {activeView === 'ALL_DOCUMENTS' && 'Browse all provider documents'}
                {activeView === 'GROUPS' && 'Create and manage practice groups'}
                {activeView === 'ADD_PROVIDER' && 'Create a new provider account'}
                {activeView === 'PROFILE' && 'Your account information'}
                {activeView === 'PROJECTS' && 'Manage and track all your team projects'}       
                {activeView === 'CREATE_PROJECT' && 'Create a new project for a group or provider'}  
              </p>
            </div>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>Welcome back, <strong>{teamLeaderInfo?.fullName || storedName}</strong></div>
          </header>

          <div className="ad-content-area">

            {/* DASHBOARD VIEW */}
            {activeView === 'DASHBOARD' && (
              <div>
                {isCredentialing && <CredentialingSummaryCards />}
                {isChargeEntry && <ChargeEntrySummaryCards />}
                {isPosting && <PostingSummaryCards />}
                {isAccountsReceivable && <ARSummaryCards />}
                
                <div className="ad-dash-card" style={{ marginBottom: 20 }}>
                  <h3 className="ad-dash-card-title"><i className="fas fa-chart-line"></i> Quick Overview</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                    <div style={{ textAlign: 'center', padding: 12, background: 'var(--blue-light)', borderRadius: 'var(--radius)' }}>
                      <div style={{ fontSize: 24, fontWeight: 'bold', color: 'var(--blue)' }}>{myTasks.length}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>My Total Tasks</div>
                      <div style={{ fontSize: 11 }}><i className="fas fa-check-circle"></i> {myTasks.filter(t => t.status === 'COMPLETED').length} completed</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: 12, background: 'var(--green-lt)', borderRadius: 'var(--radius)' }}>
                      <div style={{ fontSize: 24, fontWeight: 'bold', color: 'var(--green)' }}>{teamTasks.length}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>Team Total Tasks</div>
                      <div style={{ fontSize: 11 }}><i className="fas fa-check-circle"></i> {teamTasks.filter(t => t.status === 'COMPLETED').length} completed</div>
                    </div>
                  </div>
                </div>

                <div className="ad-dash-card">
                  <div className="card-header">
                    <h3 className="ad-dash-card-title"><i className="fas fa-clock"></i> Recent Tasks</h3>
                    <button className="view-all-btn" onClick={() => setShowAllTasks(!showAllTasks)}>
                      {showAllTasks ? "Show Less ↑" : "View All →"}
                    </button>
                  </div>
                  <div className="tasks-grid">
                    {[...myTasks, ...teamTasks].slice(0, 6).map(task => (
                      <div key={task.id} className="task-card" onClick={() => { setSelectedTask(task); setShowTaskModal(true); }}>
                        <div className="task-card-header">
                          <div className="task-title-section">
                            <span className="task-priority">{getPriorityIcon(task.priority)}</span>
                            <span className="task-title">{task.title}</span>
                          </div>
                          <span className={`task-status status-${task.status?.toLowerCase().replace('_', '-')}`}>
                            {task.status?.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="task-card-body">
                          <p className="task-description">
                            {task.description?.substring(0, 80) || "No description"}
                            {task.description?.length > 80 && "..."}
                          </p>
                          {task.dueDate && (
                            <div className="task-due-date">
                              <span className="due-icon"><i className="fas fa-calendar"></i></span>
                              <span className={`due-text ${new Date(task.dueDate) < new Date() ? 'overdue' : ''}`}>
                                Due: {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="ad-dash-card">
                  <h3 className="ad-dash-card-title"><i className="fas fa-user-plus"></i> Assign Provider to Team Member</h3>
                  <div className="assign-row">
                    <select className="ad-field-inp" onChange={e => setSelectedProvider(providers.find(p => p.id === parseInt(e.target.value)))} value={selectedProvider?.id || ''}>
                      <option value="">Select Provider</option>
                      {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <select 
                      className="ad-field-inp" 
                      onChange={e => {
                        console.log("Dropdown changed to:", e.target.value);
                        setSelectedTeamMember(e.target.value);
                      }} 
                      value={selectedTeamMember}
                    >
                      <option value="">Select Team Member</option>
                      {teamMembers.map(tm => (
                        <option key={tm.id} value={tm.id}>{tm.fullName}</option>
                      ))}
                    </select>
                    <button onClick={assignProviderToTeamMember} className="ad-btn ad-btn-blue" disabled={loading}>{loading ? "Assigning..." : "Assign"}</button>
                  </div>
                </div>

                <div className="ad-dash-card">
                  <h3 className="ad-dash-card-title"><i className="fas fa-tasks"></i> Assign New Task to Team Member</h3>
                  <div className="task-form-grid">
                    <input type="text" placeholder="Task Title" className="ad-field-inp" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} style={{ gridColumn: 'span 2' }} />
                    <textarea placeholder="Description" className="ad-field-inp" rows="2" value={taskDescription} onChange={e => setTaskDescription(e.target.value)} style={{ gridColumn: 'span 2' }} />
                    <select className="ad-field-inp" value={taskPriority} onChange={e => setTaskPriority(e.target.value)}>
                      <option value="HIGH">{getPriorityIcon('HIGH')} High Priority</option>
                      <option value="MEDIUM">{getPriorityIcon('MEDIUM')} Medium Priority</option>
                      <option value="LOW">{getPriorityIcon('LOW')} Low Priority</option>
                    </select>
                    <input type="date" className="ad-field-inp" value={taskDueDate} onChange={e => setTaskDueDate(e.target.value)} />
                    <select className="ad-field-inp" value={taskRelatedProvider} onChange={e => setTaskRelatedProvider(e.target.value)}>
                      <option value="">Select Related Provider (Optional)</option>
                      {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    {/* UPDATED: Show both Team Members and Team Leaders */}
    <select 
  className="ad-field-inp" 
  onChange={e => setSelectedTeamMember(e.target.value)} 
  value={selectedTeamMember}
  style={{ gridColumn: 'span 2' }}
>
  <option value="">Select Assignee</option>
  {teamMembers.map(tm => (
    <option key={tm.id} value={tm.id}>
      <i className={`fas ${tm.role === 'TEAM_LEADER' ? 'fa-user-tie' : 'fa-user'}`}></i> 
      {tm.fullName} {tm.role === 'TEAM_LEADER' ? `(Team Leader - ${tm.leadingDepartment || ''})` : '(Team Member)'}
    </option>
  ))}
</select>
    
    <button onClick={assignTaskToTeamMember} className="ad-btn ad-btn-teal" disabled={loading || !selectedTeamMember || !taskTitle}>
      {loading ? <><i className="fas fa-spinner fa-spin"></i> Assigning...</> : <><i className="fas fa-paper-plane"></i> Assign Task</>}
    </button>
  </div>
</div></div>
            )}

            

            {/* MY TASKS VIEW */}
            {activeView === 'MY_TASKS' && (
              <div className="my-tasks-container">
                <div className="tasks-header">
                  <div className="tasks-title-section">
                    <h2><i className="fas fa-tasks"></i> My Tasks</h2>
                    <div className="view-toggle">
                      <button className={`view-btn ${taskViewMode === "KANBAN" ? "active" : ""}`} onClick={() => setTaskViewMode("KANBAN")}>
                        <i className="fas fa-chart-bar"></i> Kanban
                      </button>
                      <button className={`view-btn ${taskViewMode === "LIST" ? "active" : ""}`} onClick={() => setTaskViewMode("LIST")}>
                        <i className="fas fa-list"></i> List View
                      </button>
                    </div>
                  </div>
                  <div className="filter-pills">
                    {[
                      { key: "ALL", label: "All", icon: <i className="fas fa-list"></i> },
                      { key: "TODO", label: "To Do", icon: <i className="fas fa-tasks"></i> },
                      { key: "IN_PROGRESS", label: "In Progress", icon: <i className="fas fa-sync-alt"></i> },
                      { key: "IN_REVIEW", label: "In Review", icon: <i className="fas fa-eye"></i> },
                      { key: "COMPLETED", label: "Completed", icon: <i className="fas fa-check-circle"></i> },
                      { key: "BLOCKED", label: "Blocked", icon: <i className="fas fa-ban"></i> }
                    ].map(filter => (
                      <button key={filter.key} className={`filter-pill ${taskFilter === filter.key ? "active" : ""}`} onClick={() => setTaskFilter(filter.key)}>
                        {filter.icon} {filter.label}
                        <span className="filter-count">{taskStatusCounts[filter.key]}</span>
                      </button>
                    ))}
                  </div>
                </div>
                {filteredTasksForView.length === 0 ? (
                  <div className="empty-tasks-state">
                    <div className="empty-icon"><i className="fas fa-check-circle"></i></div>
                    <p>No tasks found</p>
                    <p className="empty-sub">You're all caught up!</p>
                  </div>
                ) : taskViewMode === "KANBAN" ? (
                  <div className="kanban-board">
                    {['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED'].map(status => {
                      const columnTasks = filteredTasksForView.filter(t => t.status === status);
                      const displayedTasks = columnTasks.slice(0, 10);
                      const hasMore = columnTasks.length > 10;
                      return (
                        <div key={status} className="kanban-column">
                          <div className="kanban-header">
                            <h3>
                              {status === 'TODO' && <><i className="fas fa-tasks"></i> To Do</>}
                              {status === 'IN_PROGRESS' && <><i className="fas fa-sync-alt"></i> In Progress</>}
                              {status === 'IN_REVIEW' && <><i className="fas fa-eye"></i> In Review</>}
                              {status === 'COMPLETED' && <><i className="fas fa-check-circle"></i> Completed</>}
                            </h3>
                            <span className="task-count">{columnTasks.length}</span>
                          </div>
                          <div className="kanban-tasks">
                            {displayedTasks.map(task => (
                              <div key={task.id} className="kanban-task" onClick={() => { setSelectedTask(task); setShowTaskModal(true); }}>
                                <div className="kanban-task-title">{task.title}</div>
                                <div className="kanban-task-priority">{getPriorityIcon(task.priority)} {task.priority}</div>
                                {task.dueDate && <div className="kanban-task-due"><i className="fas fa-calendar"></i> {new Date(task.dueDate).toLocaleDateString()}</div>}
                              </div>
                            ))}
                            {hasMore && <div className="more-tasks-indicator">+{columnTasks.length - 10} more tasks</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (<TaskListView />)}
                <div className="task-summary-footer">
                  <span><i className="fas fa-tasks"></i> Total: {myTasks.length} tasks</span>
                  <span><i className="fas fa-check-circle"></i> Completed: {myTasks.filter(t => t.status === 'COMPLETED').length}</span>
                  <span><i className="fas fa-hourglass-half"></i> Pending: {myTasks.filter(t => t.status !== 'COMPLETED').length}</span>
                </div>
              </div>
            )}

            {/* TEAM TASKS VIEW */}
            {activeView === 'TEAM_TASKS' && (
              <div className="team-tasks-container">
                <div className="tasks-header">
                  <div className="tasks-title-section">
                    <h2><i className="fas fa-users"></i> Team Tasks</h2>
                    <div className="task-filters">
                      <select className="task-filter-select" value={taskFilter} onChange={(e) => setTaskFilter(e.target.value)}>
                        <option value="ALL">All Tasks</option>
                        <option value="TODO"><i className="fas fa-tasks"></i> To Do</option>
                        <option value="IN_PROGRESS"><i className="fas fa-sync-alt"></i> In Progress</option>
                        <option value="IN_REVIEW"><i className="fas fa-eye"></i> In Review</option>
                        <option value="COMPLETED"><i className="fas fa-check-circle"></i> Completed</option>
                        <option value="BLOCKED"><i className="fas fa-ban"></i> Blocked</option>
                      </select>
                      <div className="search-tasks">
                        <i className="fas fa-search"></i>
                        <input type="text" placeholder="Search tasks..." className="ad-field-inp" value={taskSearch} onChange={(e) => setTaskSearch(e.target.value)} />
                      </div>
                    </div>
                  </div>
                </div>

                {filteredTeamTasks.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon"><i className="fas fa-tasks"></i></div>
                    <p>No team tasks found</p>
                    <p className="empty-sub">Tasks assigned to team members will appear here</p>
                  </div>
                ) : (
                  <div className="team-tasks-list">
                    {filteredTeamTasks.filter(task => task !== null).map(task => (
  <div key={task?.id || Math.random()} className="team-task-card">
    <div className="task-card-header">
      <div className="task-info">
        <span className="task-priority">{getPriorityIcon(task?.priority)} {task?.priority}</span>
        <span className={`task-status status-${task?.status?.toLowerCase()}`}>
          {task?.status?.replace('_', ' ')}
        </span>
      </div>
      <div className="task-assignee">
        <span className="assignee-avatar">{task?.assignedToName?.charAt(0) || '?'}</span>
        <span className="assignee-name">{task?.assignedToName}</span>
      </div>
    </div>
    <div className="task-card-body">
      <h4 className="task-title">{task?.title}</h4>
      <p className="task-description">{task?.description}</p>
    </div>
    <div className="task-card-footer">
      <div className="task-meta">
        {task?.dueDate && (
          <span className={`task-due ${isOverdue(task?.dueDate) ? 'overdue' : ''}`}>
            <i className="fas fa-calendar"></i> Due: {new Date(task?.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>
      <div className="task-actions">
        <select value={task?.status} onChange={(e) => updateTeamTaskStatus(task?.id, e.target.value)} className="status-select-sm" onClick={(e) => e.stopPropagation()}>
          <option value="TODO"><i className="fas fa-tasks"></i> To Do</option>
          <option value="IN_PROGRESS"><i className="fas fa-sync-alt"></i> In Progress</option>
          <option value="IN_REVIEW"><i className="fas fa-eye"></i> In Review</option>
          <option value="COMPLETED"><i className="fas fa-check-circle"></i> Completed</option>
          <option value="BLOCKED"><i className="fas fa-ban"></i> Blocked</option>
        </select>
        <select onChange={(e) => reassignTask(task?.id, e.target.value)} className="reassign-select-sm" defaultValue="" onClick={(e) => e.stopPropagation()}>
          <option value=""><i className="fas fa-exchange-alt"></i> Reassign</option>
          {teamMembers.map(tm => (
            <option key={tm.id} value={tm.id}>{tm.fullName}</option>
          ))}
        </select>
      </div>
    </div>
  </div>
))}
                  </div>
                )}
                
                {totalTeamTaskPages > 1 && (
                  <div className="pagination-container">
                    <button className="pagination-btn" onClick={() => setTeamTaskPage(p => Math.max(1, p - 1))} disabled={teamTaskPage === 1}>
                      <i className="fas fa-chevron-left"></i> Previous
                    </button>
                    <div className="pagination-pages">
                      {Array.from({ length: Math.min(5, totalTeamTaskPages) }, (_, i) => {
                        let pageNum;
                        if (totalTeamTaskPages <= 5) pageNum = i + 1;
                        else if (teamTaskPage <= 3) pageNum = i + 1;
                        else if (teamTaskPage >= totalTeamTaskPages - 2) pageNum = totalTeamTaskPages - 4 + i;
                        else pageNum = teamTaskPage - 2 + i;
                        return (
                          <button key={pageNum} className={`pagination-page ${teamTaskPage === pageNum ? "active" : ""}`} onClick={() => setTeamTaskPage(pageNum)}>
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <button className="pagination-btn" onClick={() => setTeamTaskPage(p => Math.min(totalTeamTaskPages, p + 1))} disabled={teamTaskPage === totalTeamTaskPages}>
                      Next <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>
                )}
                
                <div className="pagination-info">
                  Showing {((teamTaskPage - 1) * tasksPerPage) + 1} to {Math.min(teamTaskPage * tasksPerPage, filteredTeamTasks.length)} of {filteredTeamTasks.length} tasks
                </div>
              </div>
            )}
            
            {/* TEAM MEMBERS VIEW */}
            {activeView === 'TEAM_MEMBERS' && (
              <div className="ad-dash-card">
                <h3><i className="fas fa-users"></i> Team Members ({teamMembers.length})</h3>
                <div className="ad-table-wrap">
                  <table className="ad-table">
                    <thead>
                      <tr>
                        <th><i className="fas fa-user"></i> Name</th>
                        <th><i className="fas fa-envelope"></i> Email</th>
                        <th><i className="fas fa-building"></i> Department</th>
                        <th><i className="fas fa-user-md"></i> Assigned Providers</th>
                        <th><i className="fas fa-tasks"></i> Tasks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamMembers.map(member => {
                        const assignedCount = providers.filter(p => p.assignedTeamMemberId === member.id).length;
                        return (
                          <tr key={member.id}>
                            <td>{member.fullName}</td>
                            <td className="td-muted">{member.email}</td>
                            <td className="td-muted">{member.department || 'Credentialing'}</td>
                            <td className="td-muted">{assignedCount} provider{assignedCount !== 1 ? 's' : ''}</td>
                            <td className="td-muted">{teamTasks.filter(t => t.assignedToId === member.id).length} tasks</td>
                          </tr>
                        );
                      })}
                      {teamMembers.length === 0 && (
                        <tr><td colSpan="5" className="td-empty">No team members found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* PROVIDER DIRECTORY VIEW */}
            {activeView === 'PROVIDER_DIRECTORY' && (
              <div className="ad-dash-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3><i className="fas fa-folder-open"></i> Provider Directory ({providers.length})</h3>
                  <button className="ad-btn ad-btn-teal" onClick={exportAllProviders} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <i className="fas fa-download"></i> Export All to Excel
                  </button>
                </div>
                <div className="provider-directory-filters">
                  <div className="search-box">
                    <i className="fas fa-search"></i>
                    <input type="text" placeholder="Search by name, specialty, or NPI..." className="ad-field-inp" value={providerSearch} onChange={(e) => setProviderSearch(e.target.value)} />
                  </div>
                  <select className="ad-field-inp" value={providerSpecialtyFilter} onChange={(e) => setProviderSpecialtyFilter(e.target.value)} style={{ width: '180px' }}>
                    <option value="ALL">All Specialties</option>
                    {[...new Set(providers.map(p => p.specialty).filter(Boolean))].map(specialty => <option key={specialty} value={specialty}>{specialty}</option>)}
                  </select>
                </div>
                <div className="ad-table-wrap">
                  <table className="ad-table">
                    <thead>
                      <tr>
                        <th><i className="fas fa-user"></i> Name</th>
                        <th><i className="fas fa-id-card"></i> NPI</th>
                        <th><i className="fas fa-stethoscope"></i> Specialty</th>
                        <th><i className="fas fa-id-card"></i> License #</th>
                        <th><i className="fas fa-chart-line"></i> License Status</th>
                        <th><i className="fas fa-cog"></i> Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedProviders.map(provider => (
                        <tr key={provider.id}>
                          <td>{provider.name}</td>
                          <td className="td-muted">{provider.npiNumber || '—'}</td>
                          <td className="td-muted">{provider.specialty || '—'}</td>
                          <td className="td-muted">{provider.licenseNumber || '—'}</td>
                          <td className="td-muted">
                            <span className={`status-badge ${isExpired(provider.licenseExpiry) ? 'expired' : isExpiringSoon(provider.licenseExpiry) ? 'expiring' : 'active'}`}>
                              {isExpired(provider.licenseExpiry) ? 'Expired' : isExpiringSoon(provider.licenseExpiry) ? 'Expiring Soon' : 'Active'}
                            </span>
                          </td>
                          <td className="td-muted">
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              {isCredentialing && (
                                <button className="td-action-btn" onClick={() => { handleProviderSelect(provider); setActiveView('PROVIDER_DOCS'); }}>
                                  <i className="fas fa-file-alt"></i> Manage Docs
                                </button>
                              )}
                              <button className="td-action-btn" onClick={() => exportProviderToExcel(provider.id, provider.name)} style={{ background: '#27ae60', color: 'white', border: 'none', padding: '6px 8px', borderRadius: '4px', cursor: 'pointer' }}>
                                <i className="fas fa-download"></i> Export
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {totalProviderPages > 1 && (
                  <div className="pagination-container">
                    <button className="pagination-btn" onClick={() => setProviderPage(p => Math.max(1, p - 1))} disabled={providerPage === 1}>
                      <i className="fas fa-chevron-left"></i> Previous
                    </button>
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
                    <button className="pagination-btn" onClick={() => setProviderPage(p => Math.min(totalProviderPages, p + 1))} disabled={providerPage === totalProviderPages}>
                      Next <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>
                )}
                <div className="pagination-info">Showing {((providerPage - 1) * providersPerPage) + 1} to {Math.min(providerPage * providersPerPage, filteredProviders.length)} of {filteredProviders.length} providers</div>
              </div>
            )}

            {/* PROJECTS VIEW */}
  {activeView === "PROJECTS" && (
    <div className="projects-container">
      {/* Statistics Cards */}
      <div className="projects-stats-row">
        <div className="project-stat-card">
          <div className="stat-icon"><i className="fas fa-tasks"></i></div>
          <div className="stat-info">
            <div className="stat-value">{projectStats.totalProjects}</div>
            <div className="stat-label">Total Projects</div>
          </div>
        </div>
        <div className="project-stat-card">
          <div className="stat-icon"><i className="fas fa-play-circle"></i></div>
          <div className="stat-info">
            <div className="stat-value">{projectStats.activeProjects}</div>
            <div className="stat-label">In Progress</div>
          </div>
        </div>
        <div className="project-stat-card">
          <div className="stat-icon"><i className="fas fa-check-circle"></i></div>
          <div className="stat-info">
            <div className="stat-value">{projectStats.completedProjects}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
        <div className="project-stat-card">
          <div className="stat-icon"><i className="fas fa-percent"></i></div>
          <div className="stat-info">
            <div className="stat-value">{projectStats.averageCompletion}%</div>
            <div className="stat-label">Avg Completion</div>
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="projects-grid">
        {projects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><i className="fas fa-project-diagram"></i></div>
            <p>No projects yet</p>
            <p className="empty-sub">Create your first project to get started</p>
            <button className="ad-btn ad-btn-blue" onClick={() => setActiveView("CREATE_PROJECT")}>
              <i className="fas fa-plus"></i> Create Project
            </button>
          </div>
        ) : (
          projects.map(project => (
            <div key={project.id} className="project-card" onClick={() => { setSelectedProjectForTasks(project); setShowProjectDetailModal(true); }}>
              <div className="project-card-header">
                <div className="project-type-badge">
                  {project.projectType === 'GROUP' ? 
                    <i className="fas fa-layer-group"></i> : 
                    <i className="fas fa-user-md"></i>
                  }
                  {project.projectType === 'GROUP' ? ' Group Project' : ' Provider Project'}
                </div>
                <div className={`project-priority priority-${project.priority?.toLowerCase()}`}>
                  {project.priority === 'HIGH' ? <i className="fas fa-arrow-up"></i> : 
                  project.priority === 'MEDIUM' ? <i className="fas fa-minus"></i> : 
                  <i className="fas fa-arrow-down"></i>}
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
                  <i className="fas fa-tasks"></i> {project.tasks?.length || 0} tasks
                </div>
                <div className="meta-item">
                  <i className="fas fa-users"></i> {project.assignees?.length || 0} members
                </div>
              </div>
              
              <div className="project-status">
                <span className={`status-${project.status?.toLowerCase()}`}>
                  {project.status === 'PLANNING' && <><i className="fas fa-clipboard-list"></i> Planning</>}
                  {project.status === 'IN_PROGRESS' && <><i className="fas fa-play"></i> In Progress</>}
                  {project.status === 'ON_HOLD' && <><i className="fas fa-pause"></i> On Hold</>}
                  {project.status === 'COMPLETED' && <><i className="fas fa-check-circle"></i> Completed</>}
                  {project.status === 'CANCELLED' && <><i className="fas fa-times-circle"></i> Cancelled</>}
                </span>
                <button 
  className="status-update-btn"
  onClick={(e) => {
    e.stopPropagation();
    setSelectedProject(project);
    setShowStatusModal(true);
  }}
>
  <i className="fas fa-edit"></i> Update
</button>
<button
  className="edit-project-btn"
  onClick={(e) => {
    e.stopPropagation();
    setEditingProject(project);
    setShowEditProjectModal(true);
  }}
  style={{ background: '#f59e0b', color: '#fff', border: 'none',
           padding: '6px 12px', borderRadius: '6px', cursor: 'pointer',
           fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
>
  <i className="fas fa-edit"></i> Edit
</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Project Detail Modal */}
      {showProjectDetailModal && selectedProjectForTasks && (
        <div className="modal-overlay" onClick={() => setShowProjectDetailModal(false)}>
          <div className="project-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedProjectForTasks.projectName}</h2>
              <button className="modal-close" onClick={() => setShowProjectDetailModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              {/* Project Info */}
              <div className="project-info-section">
                <div className="info-row">
                  <span className="label"><i className="fas fa-info-circle"></i> Description:</span>
                  <span className="value">{selectedProjectForTasks.description || 'No description'}</span>
                </div>
                <div className="info-row">
                  <span className="label"><i className="fas fa-calendar"></i> Start Date:</span>
                  <span className="value">
                    {selectedProjectForTasks.startDate ? new Date(selectedProjectForTasks.startDate).toLocaleDateString() : 'Not set'}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label"><i className="fas fa-calendar-check"></i> Target End Date:</span>
                  <span className="value">
                    {selectedProjectForTasks.targetEndDate ? new Date(selectedProjectForTasks.targetEndDate).toLocaleDateString() : 'Not set'}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label"><i className="fas fa-user"></i> Created By:</span>
                  <span className="value">{selectedProjectForTasks.createdByName}</span>
                </div>
              </div>
              
              {/* Assignees Section */}
              <div className="project-assignees-section">
                <h4><i className="fas fa-users"></i> Team Members ({selectedProjectForTasks.assignees?.length || 0})</h4>
                <div className="assignees-list">
                  {(selectedProjectForTasks.assignees || []).map(assignee => (
                    <div key={assignee.id} className="assignee-chip">
                      <span className="assignee-avatar">{assignee.userName?.charAt(0) || '?'}</span>
                      <span className="assignee-name">{assignee.userName}</span>
                      <span className="assignee-role">{assignee.role}</span>
                    </div>
                  ))}
                  {(!selectedProjectForTasks.assignees || selectedProjectForTasks.assignees.length === 0) && (
                    <div className="no-data">No team members assigned</div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
  <button 
    className="add-assignee-btn"
    style={{ background: '#3b82f6', display: 'flex', alignItems: 'center', gap: '6px', border: 'none', padding: '8px 16px', borderRadius: '6px', color: 'white', cursor: 'pointer', fontSize: '13px' }}
    onClick={() => {
      setAssigneeRoleFilter('TEAM_MEMBER');
      fetchAssignableUsersForProject();
      setShowAddAssigneeModal(true);
    }}
  >
    <i className="fas fa-user"></i> Add Team Member
  </button>
  <button 
    className="add-assignee-btn"
    style={{ background: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '6px', border: 'none', padding: '8px 16px', borderRadius: '6px', color: 'white', cursor: 'pointer', fontSize: '13px' }}
    onClick={() => {
      setAssigneeRoleFilter('TEAM_LEADER');
      fetchAssignableUsersForProject();
      setShowAddAssigneeModal(true);
    }}
  >
    <i className="fas fa-user-tie"></i> Add Team Leader
  </button>
</div>
              </div>
              
              {/* Tasks Section */}
              <div className="project-tasks-section">
                <h4><i className="fas fa-tasks"></i> Tasks ({selectedProjectForTasks.tasks?.length || 0})</h4>
                
                {/* Add Task Form */}
                <div className="add-task-form">
                  <input type="text" placeholder="Task title" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
                  <textarea placeholder="Task description" value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} />
                  <select value={newTask.assignedTo} onChange={e => setNewTask({...newTask, assignedTo: e.target.value})}>
                    <option value="">Assign to...</option>
                    {(selectedProjectForTasks.assignees || []).map(assignee => (
                      <option key={assignee.userId} value={assignee.userId}>{assignee.userName}</option>
                    ))}
                  </select>
                  <select value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})}>
                    <option value="HIGH">High Priority</option>
                    <option value="MEDIUM">Medium Priority</option>
                    <option value="LOW">Low Priority</option>
                  </select>
                  <input type="date" placeholder="Due date" value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} />
                  <button onClick={() => handleAddTask(selectedProjectForTasks.id)} className="add-task-btn">
                    <i className="fas fa-plus"></i> Add Task
                  </button>
                </div>
                
                {/* Tasks List */}
  <div className="tasks-list">
    {(selectedProjectForTasks.tasks || []).map(task => (
      <div key={task.id} className="task-item">
        <div className="task-header">
          <span className="task-title">{task.title}</span>
          <select 
            value={task.status} 
            onChange={(e) => updateProjectTaskStatus(task.id, e.target.value)}
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
          <span><i className="fas fa-user"></i> {task.assignedToName || 'Unassigned'}</span>
          <span><i className="fas fa-flag"></i> {task.priority}</span>
          {task.dueDate && <span><i className="fas fa-calendar"></i> Due: {new Date(task.dueDate).toLocaleDateString()}</span>}
        </div>
      </div>
            ))}
          </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )}

  {/* CREATE PROJECT VIEW */}
  {activeView === "CREATE_PROJECT" && (
    <div className="create-project-container">
      <div className="ad-form-card">
        <div className="ad-form-head">
          <span className="ad-form-chip fc-violet">Create New Project</span>
          <p className="ad-form-desc">Create a project for a practice group or specific provider</p>
        </div>
        
        <div className="ad-form-grid">
          <div className="ad-field">
            <label className="ad-field-lbl">Project Name *</label>
            <input type="text" className="ad-field-inp" value={projectFormData.projectName} onChange={e => setProjectFormData({...projectFormData, projectName: e.target.value})} placeholder="Enter project name" />
          </div>
          
          <div className="ad-field">
            <label className="ad-field-lbl">Project Type *</label>
            <select className="ad-field-inp" value={projectFormData.projectType} onChange={e => setProjectFormData({...projectFormData, projectType: e.target.value})}>
              <option value="GROUP">Practice Group</option>
              <option value="PROVIDER">Individual Provider</option>
            </select>
          </div>
          
          {projectFormData.projectType === 'GROUP' && (
            <div className="ad-field">
              <label className="ad-field-lbl">Select Group *</label>
              <select className="ad-field-inp" value={projectFormData.groupId} onChange={e => setProjectFormData({...projectFormData, groupId: e.target.value})}>
                <option value="">Select a group</option>
                {groups.map(group => (
                  <option key={group.groupId} value={group.groupId}>{group.groupName}</option>
                ))}
              </select>
            </div>
          )}
          
          {projectFormData.projectType === 'PROVIDER' && (
            <div className="ad-field">
              <label className="ad-field-lbl">Select Provider *</label>
              <select className="ad-field-inp" value={projectFormData.providerId} onChange={e => setProjectFormData({...projectFormData, providerId: e.target.value})}>
                <option value="">Select a provider</option>
                {providers.map(provider => (
                  <option key={provider.id} value={provider.id}>{provider.name}</option>
                ))}
              </select>
            </div>
          )}
          
          <div className="ad-field">
            <label className="ad-field-lbl">Priority</label>
            <select className="ad-field-inp" value={projectFormData.priority} onChange={e => setProjectFormData({...projectFormData, priority: e.target.value})}>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>
          
          <div className="ad-field">
            <label className="ad-field-lbl">Start Date</label>
            <input type="date" className="ad-field-inp" value={projectFormData.startDate} onChange={e => setProjectFormData({...projectFormData, startDate: e.target.value})} />
          </div>
          
          <div className="ad-field">
            <label className="ad-field-lbl">Target End Date</label>
            <input type="date" className="ad-field-inp" value={projectFormData.targetEndDate} onChange={e => setProjectFormData({...projectFormData, targetEndDate: e.target.value})} />
          </div>
          
          <div className="ad-field full-width">
            <label className="ad-field-lbl">Description</label>
            <textarea className="ad-field-inp" rows="4" value={projectFormData.description} onChange={e => setProjectFormData({...projectFormData, description: e.target.value})} placeholder="Describe the project goals and requirements..."></textarea>
          </div>
          
          <div className="ad-field full-width">
            <label className="ad-field-lbl">Assign Team Members</label>
            <div className="assignee-picker">
              <select 
                className="ad-field-inp" 
                onChange={e => {
                  const userId = parseInt(e.target.value);
                  if (userId && !projectFormData.assigneeIds.includes(userId)) {
                    setProjectFormData({
                      ...projectFormData,
                      assigneeIds: [...projectFormData.assigneeIds, userId]
                    });
                  }
                }}
                value=""
              >
                <option value="">Select team members to assign...</option>
                {availableTeamMembers.filter(m => !projectFormData.assigneeIds.includes(m.id)).map(member => (
                  <option key={member.id} value={member.id}>{member.fullName} ({member.email})</option>
                ))}
              </select>
              <div className="selected-assignees">
                {projectFormData.assigneeIds.map(assigneeId => {
                  const member = availableTeamMembers.find(m => m.id === assigneeId);
                  return member ? (
                    <span key={member.id} className="assignee-tag">
                      {member.fullName}
                      <button onClick={() => setProjectFormData({
                        ...projectFormData,
                        assigneeIds: projectFormData.assigneeIds.filter(id => id !== member.id)
                      })}><i className="fas fa-times"></i></button>
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          </div>
        </div>
        
        <div className="form-actions">
          <button className="ad-btn" onClick={() => setActiveView("PROJECTS")}>Cancel</button>
          <button className="ad-btn ad-btn-violet" onClick={handleCreateProject} disabled={loading}>
            {loading ? <><i className="fas fa-spinner fa-spin"></i> Creating...</> : <><i className="fas fa-plus"></i> Create Project</>}
          </button>
        </div>
      </div>
    </div>
  )}


  {/* ADD PROVIDER VIEW - Only for Credentialing Team Leaders */}
{activeView === 'ADD_PROVIDER' && isCredentialing && (
  <div className="ad-form-area">
    <div className="ad-form-card">
      <div className="ad-form-head">
        <span className="ad-form-chip fc-teal">Add New Provider</span>
        <p className="ad-form-desc">Create a new provider account for credentialing. Required fields are marked with *</p>
      </div>
      
      <div className="ad-form-grid">
        <div className="ad-field">
          <label className="ad-field-lbl">Full Name *</label>
          <input 
            type="text" 
            className="ad-field-inp" 
            value={newProvider.fullName} 
            onChange={e => setNewProvider({...newProvider, fullName: e.target.value})}
            placeholder="Enter full name" 
          />
        </div>
        
        <div className="ad-field">
          <label className="ad-field-lbl">Email *</label>
          <input 
            type="email" 
            className="ad-field-inp" 
            value={newProvider.email} 
            onChange={e => setNewProvider({...newProvider, email: e.target.value})}
            placeholder="Enter email" 
          />
        </div>
        
        <div className="ad-field">
          <label className="ad-field-lbl">Phone Number</label>
          <input 
            type="text" 
            className="ad-field-inp" 
            value={newProvider.phoneNumber} 
            onChange={e => setNewProvider({...newProvider, phoneNumber: e.target.value})}
            placeholder="Enter phone number" 
          />
        </div>
        
        <div className="ad-field">
          <label className="ad-field-lbl">Specialty</label>
          <input 
            type="text" 
            className="ad-field-inp" 
            value={newProvider.specialty} 
            onChange={e => setNewProvider({...newProvider, specialty: e.target.value})}
            placeholder="Enter specialty" 
          />
        </div>
        
        <div className="ad-field">
          <label className="ad-field-lbl">NPI Number</label>
          <input 
            type="text" 
            className="ad-field-inp" 
            value={newProvider.npiNumber} 
            onChange={e => setNewProvider({...newProvider, npiNumber: e.target.value})}
            placeholder="Enter NPI number" 
          />
        </div>
        
        <div className="ad-field">
          <label className="ad-field-lbl">License Number</label>
          <input 
            type="text" 
            className="ad-field-inp" 
            value={newProvider.licenseNumber} 
            onChange={e => setNewProvider({...newProvider, licenseNumber: e.target.value})}
            placeholder="Enter license number" 
          />
        </div>
        
        <div className="ad-field">
          <label className="ad-field-lbl">License Expiry Date</label>
          <input 
            type="date" 
            className="ad-field-inp" 
            value={newProvider.licenseExpiry} 
            onChange={e => setNewProvider({...newProvider, licenseExpiry: e.target.value})}
          />
        </div>
        
        <div className="ad-field">
          <label className="ad-field-lbl">Username *</label>
          <input 
            type="text" 
            className="ad-field-inp" 
            value={newProvider.username} 
            onChange={e => setNewProvider({...newProvider, username: e.target.value})}
            placeholder="Enter username" 
          />
        </div>
        
        <div className="ad-field">
          <label className="ad-field-lbl">Password *</label>
          <input 
            type="password" 
            className="ad-field-inp" 
            value={newProvider.password} 
            onChange={e => setNewProvider({...newProvider, password: e.target.value})}
            placeholder="Enter password (min 4 characters)" 
          />
        </div>
      </div>
      
      <div className="form-actions">
        <button 
          className="ad-btn" 
          onClick={() => {
            setShowAddProviderForm(false);
            setNewProvider({
              username: '', password: '', fullName: '', email: '',
              phoneNumber: '', specialty: '', npiNumber: '', licenseNumber: '', licenseExpiry: ''
            });
          }}
        >
          Cancel
        </button>
        <button 
          className="ad-btn ad-btn-teal" 
          onClick={handleAddProvider} 
          disabled={loading || !newProvider.username || !newProvider.password || !newProvider.fullName}
        >
          {loading ? <><i className="fas fa-spinner fa-spin"></i> Creating...</> : <><i className="fas fa-plus"></i> Create Provider</>}
        </button>
      </div>
    </div>
  </div>
)}
  

            {/* Filtered Providers View */}
            {showFilteredProviders && FilteredProviders.length > 0 && (
              <div className="ad-dash-card" style={{ marginTop: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 className="ad-dash-card-title" style={{ margin: 0 }}>Filtered Providers</h3>
                  <button className="ad-btn" onClick={() => setShowFilteredProviders(false)}><i className="fas fa-times"></i> Close</button>
                </div>
                <div className="ad-table-wrap">
                  <table className="ad-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Specialty</th>
                        <th>License #</th>
                        <th>License Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {FilteredProviders.map(provider => (
                        <tr key={provider.id}>
                          <td>{provider.name}</td>
                          <td className="td-muted">{provider.specialty || '—'}</td>
                          <td className="td-muted">{provider.licenseNumber || '—'}</td>
                          <td className="td-muted">
                            <span className={`status-badge ${isExpired(provider.licenseExpiry) ? 'expired' : isExpiringSoon(provider.licenseExpiry) ? 'expiring' : 'active'}`}>
                              {isExpired(provider.licenseExpiry) ? 'Expired' : isExpiringSoon(provider.licenseExpiry) ? 'Expiring Soon' : 'Active'}
                            </span>
                          </td>
                          <td className="td-muted">
                            <button className="td-action-btn" onClick={() => { handleProviderSelect(provider); setActiveView('PROVIDER_DOCS'); setShowFilteredProviders(false); }}>
                              <i className="fas fa-file-alt"></i> Manage Docs
                            </button>
                          
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* PROVIDER DOCUMENTS VIEW */}
            {activeView === 'PROVIDER_DOCS' && isCredentialing && selectedProvider && <DocumentUploadSection />}
            {activeView === 'PROVIDER_DOCS' && isCredentialing && !selectedProvider && (
              <div className="ad-dash-card" style={{ textAlign: 'center', padding: 40 }}>
                <p className="ad-empty-note"><i className="fas fa-folder-open"></i> Select a provider from the Provider Directory to manage documents</p>
                <button className="ad-btn ad-btn-blue" onClick={() => setActiveView('PROVIDER_DIRECTORY')}>
                  <i className="fas fa-arrow-right"></i> Go to Provider Directory
                </button>
              </div>
            )}

            {/* ALL DOCUMENTS VIEW */}
            {activeView === 'ALL_DOCUMENTS' && isCredentialing && (
              <div className="documents-container">
                <div className="documents-header">
                  <h3><i className="fas fa-folder"></i> All Documents</h3>
                  <div className="documents-filters">
                    <div className="search-box">
                      <i className="fas fa-search"></i>
                      <input type="text" placeholder="Search by provider or file name..." className="ad-field-inp" value={docSearchTerm} onChange={(e) => setDocSearchTerm(e.target.value)} />
                    </div>
                    <select className="ad-field-inp" value={docTypeFilter} onChange={(e) => setDocTypeFilter(e.target.value)} style={{ width: '180px' }}>
                      <option value="ALL">All Document Types</option>
                      {Object.entries(DOCUMENT_RULES).map(([key, rule]) => <option key={key} value={key}>{rule.icon} {rule.label}</option>)}
                    </select>
                    <button className="refresh-btn" onClick={() => fetchAllDocuments()} title="Refresh documents">
                      <i className="fas fa-sync-alt"></i>
                    </button>
                  </div>
                </div>
                {loadingDocsList ? (
                  <div className="loading-state"><i className="fas fa-spinner fa-spin"></i> Loading documents...</div>
                ) : paginatedDocuments.length === 0 ? (
                  <div className="empty-documents">
                    <div className="empty-icon"><i className="fas fa-file-alt"></i></div>
                    <p>No documents found</p>
                    <p className="empty-sub">Upload documents from the Provider Directory</p>
                  </div>
                ) : (
                  <>
                    <div className="documents-table-wrapper">
                      <table className="documents-table">
                        <thead>
                          <tr>
                            <th><i className="fas fa-user-md"></i> Provider</th>
                            <th><i className="fas fa-tag"></i> Document Type</th>
                            <th><i className="fas fa-file"></i> File Name</th>
                            <th><i className="fas fa-code-branch"></i> Version</th>
                            <th><i className="fas fa-user"></i> Uploaded By</th>
                            <th><i className="fas fa-calendar"></i> Uploaded Date</th>
                            <th><i className="fas fa-cog"></i> Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedDocuments.map((doc, index) => (
                            <tr key={doc.id || index}>
                              <td>
                                <div className="provider-cell">
                                  <div className="provider-avatar">{doc.providerName?.charAt(0) || "?"}</div>
                                  <span>{doc.providerName}</span>
                                </div>
                              </td>
                              <td><span className="doc-type-badge">{getDocumentTypeLabel(doc.fileType)}</span></td>
                              <td>{doc.fileName}</td>
                              <td>
                                <span className="version-badge">v{doc.version}</span>
                                {doc.isCurrent && <span className="current-badge"><i className="fas fa-check"></i> Current</span>}
                              </td>
                              <td>
                                <div className="uploader-cell">
                                  <span className="uploader-name">{doc.uploadedBy}</span>
                                  <span className="uploader-role">{doc.uploaderRole?.replace('_', ' ')}</span>
                                </div>
                              </td>
                              <td>{new Date(doc.uploadedAt).toLocaleDateString()}</td>
                              <td>
                                <div className="doc-actions">
                                  <button className="doc-action-btn view-btn" onClick={() => handleDownload(doc.id, doc.fileName, doc.filePath)} title="Download">
                                    <i className="fas fa-download"></i>
                                  </button>
                                  <button className="doc-action-btn delete-btn" onClick={() => handleDeleteDocument(doc.id, doc.fileName, doc.providerId, doc.filePath)} title="Delete">
                                    <i className="fas fa-trash-alt"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {totalDocPages > 1 && (
                      <div className="pagination-container">
                        <button className="pagination-btn" onClick={() => setDocPage(p => Math.max(1, p - 1))} disabled={docPage === 1}>
                          <i className="fas fa-chevron-left"></i> Previous
                        </button>
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
                        <button className="pagination-btn" onClick={() => setDocPage(p => Math.min(totalDocPages, p + 1))} disabled={docPage === totalDocPages}>
                          Next <i className="fas fa-chevron-right"></i>
                        </button>
                      </div>
                    )}
                    <div className="documents-summary">Showing {((docPage - 1) * docsPerPage) + 1} to {Math.min(docPage * docsPerPage, filteredDocuments.length)} of {filteredDocuments.length} documents</div>
                  </>
                )}
              </div>
            )}

            {/* GROUP MANAGEMENT VIEW */}
{activeView === 'GROUPS' && isCredentialing && (
  <div className="group-management-container">
    <div className="group-action-buttons" style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
  <button className="ad-btn ad-btn-violet" onClick={() => setShowCreateGroupModal(true)}>
    <i className="fas fa-plus"></i> Create New Group
  </button>
  <button className="ad-btn ad-btn-blue" onClick={() => setShowCreateManagerModal(true)}>
    <i className="fas fa-user-tie"></i> Create Group Manager Account
  </button>
  <button className="ad-btn ad-btn-green" onClick={() => handleExportAllGroups()} disabled={loading}>
    <i className="fas fa-file-excel"></i> Export All Groups
  </button>
  <button className="ad-btn ad-btn-teal" onClick={() => { if (selectedGroupId) { setShowAssignManagerModal(true); fetchAvailableManagers(selectedGroupId); } else { showToastMessage("Please select a group first", "error"); } }} disabled={!selectedGroupId}>
    <i className="fas fa-exchange-alt"></i> Assign Manager to Group
  </button>
  <button className="ad-btn ad-btn-red" onClick={() => { if (selectedGroupId) { setShowAddProviderModal(true); } else { showToastMessage("Please select a group first", "error"); } }} disabled={!selectedGroupId}>
    <i className="fas fa-plus-circle"></i> Add Provider to Group
  </button>
  <button 
    className="ad-btn" 
    style={{ background: '#8b5cf6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}
    onClick={() => { 
      if (selectedGroupId) { 
        setShowAssignTeamLeaderModal(true);
        fetchAvailableTeamLeaders(); 
      } else { 
        showToastMessage("Please select a group first", "error"); 
      } 
    }} 
    disabled={!selectedGroupId}
  >
    <i className="fas fa-user-tie"></i> Assign Team Leader to Group
  </button>
  <button 
    className="ad-btn" 
    style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}
    onClick={() => { 
      if (selectedGroupId) { 
        setShowAssignTeamMemberModal(true);
        fetchAvailableTeamMembersForGroup(); 
      } else { 
        showToastMessage("Please select a group first", "error"); 
      } 
    }} 
    disabled={!selectedGroupId}
  >
    <i className="fas fa-user-plus"></i> Assign Team Member to Group
  </button>
</div>

    <div className="ad-dash-card">
      <h3 className="ad-dash-card-title"><i className="fas fa-layer-group"></i> Practice Groups</h3>
      <div className="ad-table-wrap">
        <table className="ad-table">
          <thead>
            <tr>
              <th>Group Name</th>
              <th>Team Leader</th>
              <th>Primary Manager</th>
              <th>All Managers</th>
              <th>Providers</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {groups.map(group => (
              <tr key={group.groupId} className={selectedGroupId === group.groupId ? "selected-row" : ""}>
                <td><strong>{group.groupName}</strong>{selectedGroupId === group.groupId && <span className="selected-badge"> Selected</span>}</td>
                <td className="td-muted">{group.teamLeaderName || "—"}</td>
                <td className="td-muted">{group.managerName || "Unknown"}</td>
                <td>
                  <div className="managers-list">
                    {group.managers && group.managers.length > 0 ? 
                      group.managers.map(manager => (
                        <div key={manager.id} className="manager-chip">{manager.name}</div>
                      )) : <span className="no-managers">No managers assigned</span>
                    }
                  </div>
                </td>
                <td className="td-muted">{group.providerCount || 0} providers</td>
                <td>
                  <button className="td-action-btn" onClick={() => { setSelectedGroupId(group.groupId); setSelectedGroupName(group.groupName); fetchGroupManagers(group.groupId); fetchGroupProviders(group.groupId); }}>
                    <i className="fas fa-check-circle"></i> Select
                  </button>
                  <button className="td-action-btn" onClick={() => setShowEditGroupModal(true)} style={{ marginLeft: '8px' }} disabled={selectedGroupId !== group.groupId}>
                    <i className="fas fa-edit"></i> Edit
                  </button>
                  <button className="td-action-btn delete-btn" onClick={() => handleDeleteGroup(group.groupId, group.groupName)} style={{ marginLeft: '8px', color: 'var(--red)' }} disabled={selectedGroupId !== group.groupId || group.providerCount > 0}>
                    <i className="fas fa-trash-alt"></i> Delete
                  </button>
                </td>
              </tr>
            ))}
            {groups.length === 0 && (
              <tr><td colSpan="6" className="td-empty">No groups found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>

    {selectedGroupId && (
      <div className="selected-group-details">
        {/* Tab Navigation */}
        <div className="group-tabs" style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e5e7eb', marginBottom: '20px' }}>
          <button 
            className={`group-tab ${showCredentialingTab === false ? 'active' : ''}`}
            onClick={() => setShowCredentialingTab(false)}
            style={{ 
              padding: '10px 20px', 
              border: 'none', 
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: showCredentialingTab === false ? '600' : '400',
              color: showCredentialingTab === false ? '#3b82f6' : '#6b7280',
              borderBottom: showCredentialingTab === false ? '2px solid #3b82f6' : 'none'
            }}
          >
            <i className="fas fa-users"></i> Managers
          </button>
          <button 
            className={`group-tab ${showCredentialingTab === false ? '' : 'active'}`}
            onClick={() => setShowCredentialingTab(true)}
            style={{ 
              padding: '10px 20px', 
              border: 'none', 
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: showCredentialingTab === true ? '600' : '400',
              color: showCredentialingTab === true ? '#3b82f6' : '#6b7280',
              borderBottom: showCredentialingTab === true ? '2px solid #3b82f6' : 'none'
            }}
          >
            <i className="fas fa-file-medical"></i> Credentialing Status
          </button>
        </div>

        {/* Managers Tab Content */}
        {!showCredentialingTab && (
          <>
            <div className="ad-dash-card" style={{ marginTop: 0 }}>
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="ad-dash-card-title"><i className="fas fa-users"></i> Managers of {selectedGroupName}</h3>
                <button className="ad-btn-sm ad-btn-teal" onClick={() => { setShowAssignManagerModal(true); fetchAvailableManagers(selectedGroupId); }}>
                  <i className="fas fa-plus"></i> Add Manager
                </button>
              </div>
              <div className="managers-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '12px', marginTop: '16px' }}>
                {existingManagers.length > 0 ? existingManagers.map(manager => (
                  <div key={manager.id} className="manager-card" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '1px solid var(--border)', borderRadius: '8px' }}>
                    <div className="manager-avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                      {manager.fullName?.charAt(0) || "M"}
                    </div>
                    <div className="manager-info" style={{ flex: 1 }}>
                      <div className="manager-name" style={{ fontWeight: 600 }}>{manager.fullName}</div>
                      <div className="manager-email" style={{ fontSize: '12px', color: 'var(--muted)' }}>{manager.email}</div>
                      {manager.isPrimary && <span className="primary-badge" style={{ fontSize: '10px', background: 'var(--primary)', color: 'white', padding: '2px 6px', borderRadius: '10px' }}>Primary Manager</span>}
                    </div>
                    {!manager.isPrimary && (
                      <button className="remove-manager-btn" onClick={() => handleRemoveManager(selectedGroupId, manager.id, manager.fullName)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--red)' }}>
                        <i className="fas fa-times"></i>
                      </button>
                    )}
                  </div>
                )) : (
                  <div className="no-managers-message">No managers assigned to this group</div>
                )}
              </div>
            </div>

            <div className="ad-dash-card" style={{ marginTop: 20 }}>
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="ad-dash-card-title"><i className="fas fa-hospital"></i> Providers in {selectedGroupName}</h3>
                <button className="ad-btn-sm ad-btn-blue" onClick={openAddProviderModal}>
                  <i className="fas fa-plus"></i> Add Provider
                </button>
              </div>
              <div className="ad-table-wrap">
                <table className="ad-table">
                  <thead>
                    <tr><th>Provider Name</th><th>Specialty</th><th>License #</th><th>License Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {groupProviders.map(provider => (
                      <tr key={provider.id}>
                        <td>{provider.name}</td>
                        <td className="td-muted">{provider.specialty || '—'}</td>
                        <td className="td-muted">{provider.licenseNumber || '—'}</td>
                        <td>
                          <span className={`status-badge ${isExpired(provider.licenseExpiry) ? 'expired' : isExpiringSoon(provider.licenseExpiry) ? 'expiring' : 'active'}`}>
                            {isExpired(provider.licenseExpiry) ? 'Expired' : isExpiringSoon(provider.licenseExpiry) ? 'Expiring Soon' : 'Active'}
                          </span>
                        </td>
                        <td>
                          <button className="td-action-btn delete-btn" onClick={() => handleRemoveProviderFromGroup(selectedGroupId, provider.id, provider.name)} style={{ color: 'var(--red)' }}>
                            <i className="fas fa-trash-alt"></i> Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                    {groupProviders.length === 0 && (
                      <tr><td colSpan="5" className="td-empty">No providers in this group</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Credentialing Status Tab Content */}
        {showCredentialingTab && (
          <div className="credentialing-status-container">
            <div className="ad-dash-card" style={{ marginTop: 0 }}>
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 className="ad-dash-card-title">
                  <i className="fas fa-file-medical"></i> Credentialing Status
                </h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="ad-btn ad-btn-blue" onClick={handleAddPayor}>
                    <i className="fas fa-plus"></i> Add Payor
                  </button>
                  <button 
                    className="ad-btn ad-btn-green" 
                    onClick={() => handleExportGroup(selectedGroupId, selectedGroupName)}
                    disabled={credentialingStatus.length === 0 || loading}
                  >
                    <i className="fas fa-file-excel"></i> Export Group Data
                  </button>
                </div>
              </div>

              {credentialingStatus.length === 0 ? (
                <div className="empty-state" style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <div className="empty-icon" style={{ fontSize: '48px', color: '#d1d5db', marginBottom: '16px' }}>
                    <i className="fas fa-file-medical"></i>
                  </div>
                  <p style={{ fontSize: '16px', color: '#6b7280' }}>No payors added yet</p>
                  <p style={{ fontSize: '14px', color: '#9ca3af' }}>Click "Add Payor" to start tracking credentialing status</p>
                </div>
              ) : (
                <div className="payor-summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                  {(() => {
                    // Group records by payer name
                    const payorGroups = {};
                    credentialingStatus.forEach(record => {
                      const payerName = record.payerName || 'Unnamed';
                      if (!payorGroups[payerName]) {
                        payorGroups[payerName] = [];
                      }
                      payorGroups[payerName].push(record);
                    });

                    const sortedPayorNames = Object.keys(payorGroups).sort();

                    return sortedPayorNames.map(payerName => {
                      const records = payorGroups[payerName];
                      
                      const activeCount = records.filter(r => r.status?.toLowerCase() === 'active').length;
                      const pendingCount = records.filter(r => r.status?.toLowerCase() === 'pending').length;
                      const expiredCount = records.filter(r => r.status?.toLowerCase() === 'expired').length;
                      const totalPlans = records.length;

                      const uniqueLobs = [...new Set(records.map(r => r.lob).filter(Boolean))];
                      const uniqueNetworks = [...new Set(records.map(r => r.network).filter(Boolean))];
                      const uniqueProducts = [...new Set(records.map(r => r.product).filter(Boolean))];

                      return (
                        <div
                          key={payerName}
                          className="payor-summary-card"
                          onClick={() => handleViewPayorDetails(payerName)}
                          style={{
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            padding: '16px',
                            cursor: 'pointer',
                            transition: 'box-shadow .15s, border-color .15s, transform .15s',
                            background: '#fff'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)';
                            e.currentTarget.style.borderColor = '#3b82f6';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.boxShadow = 'none';
                            e.currentTarget.style.borderColor = '#e5e7eb';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#1f2937' }}>
                                <i className="fas fa-building" style={{ marginRight: '8px', color: '#3b82f6' }}></i>
                                {payerName}
                              </h4>
                              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                                {uniqueLobs.length > 0 && `LOB: ${uniqueLobs.join(', ')}`}
                                {uniqueNetworks.length > 0 && ` • Network: ${uniqueNetworks.join(', ')}`}
                              </div>
                            </div>
                            <i className="fas fa-chevron-right" style={{ color: '#9ca3af', fontSize: '12px', marginTop: '4px' }}></i>
                          </div>

                          <div style={{ display: 'flex', gap: '16px', marginTop: '12px', flexWrap: 'wrap' }}>
                            <div>
                              <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>{totalPlans}</span>
                              <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: '4px' }}>Plans</span>
                            </div>
                            {activeCount > 0 && (
                              <div>
                                <span style={{ fontSize: '16px', fontWeight: '500', color: '#10b981' }}>{activeCount}</span>
                                <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: '4px' }}>Active</span>
                              </div>
                            )}
                            {pendingCount > 0 && (
                              <div>
                                <span style={{ fontSize: '16px', fontWeight: '500', color: '#f59e0b' }}>{pendingCount}</span>
                                <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: '4px' }}>Pending</span>
                              </div>
                            )}
                            {expiredCount > 0 && (
                              <div>
                                <span style={{ fontSize: '16px', fontWeight: '500', color: '#ef4444' }}>{expiredCount}</span>
                                <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: '4px' }}>Expired</span>
                              </div>
                            )}
                          </div>

                          <div style={{ marginTop: '10px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {uniqueProducts.slice(0, 3).map(product => (
                              <span key={product} style={{ 
                                fontSize: '11px', 
                                background: '#f3f4f6', 
                                padding: '2px 8px', 
                                borderRadius: '12px',
                                color: '#4b5563'
                              }}>
                                {product}
                              </span>
                            ))}
                            {uniqueProducts.length > 3 && (
                              <span style={{ fontSize: '11px', color: '#6b7280' }}>+{uniqueProducts.length - 3} more</span>
                            )}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )}
  </div>
)}
            {/* Modals */}
            <ReplaceDocumentModal
              isOpen={showReplaceModal}
              onClose={() => { setShowReplaceModal(false); setPendingUpload(null); setExistingDocument(null); }}
              onConfirm={handleReplaceConfirm}
              documentType={pendingUpload?.docId}
              currentDocument={existingDocument}
              providerName={selectedProvider?.name}
            />

            <DocumentHistoryModal
              isOpen={showHistoryModal}
              onClose={() => { setShowHistoryModal(false); setHistoryData([]); }}
              history={historyData}
              documentType={historyDocType}
              providerName={selectedProvider?.name}
            />

            {/* PROFILE VIEW */}
  {activeView === 'PROFILE' && teamLeaderInfo && (
    <div className="profile-container">
      <div className="profile-card">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar">
            <i className="fas fa-user-tie"></i>
          </div>
          <h2 className="profile-name">{teamLeaderInfo.fullName || storedName}</h2>
          <div className="profile-role">
            <i className="fas fa-briefcase"></i> Team Leader - {teamLeaderInfo.leadingDepartment || 'Credentialing'}
          </div>
        </div>

        {/* Profile Stats Bar */}
        <div className="profile-stats-bar">
          <div className="profile-stat-item">
            <span className="profile-stat-value">{teamMembers.length}</span>
            <span className="profile-stat-label">
              <i className="fas fa-users"></i> Team Members
            </span>
          </div>
          <div className="profile-stat-item">
            <span className="profile-stat-value">{providers.length}</span>
            <span className="profile-stat-label">
              <i className="fas fa-user-md"></i> Total Providers
            </span>
          </div>
          <div className="profile-stat-item">
            <span className="profile-stat-value">{myTasks.length}</span>
            <span className="profile-stat-label">
              <i className="fas fa-tasks"></i> My Tasks
            </span>
          </div>
          <div className="profile-stat-item">
            <span className="profile-stat-value">{myTasks.filter(t => t.status === 'COMPLETED').length}</span>
            <span className="profile-stat-label">
              <i className="fas fa-check-circle"></i> Completed
            </span>
          </div>
        </div>

        {/* Profile Body */}
        <div className="profile-body">
          {/* Personal Information Section */}
          <div className="profile-section">
            <h3 className="profile-section-title">
              <i className="fas fa-user-circle"></i> Personal Information
            </h3>
            <div className="profile-info-grid">
              <div className="profile-info-item">
                <div className="profile-info-icon">
                  <i className="fas fa-user"></i>
                </div>
                <div className="profile-info-content">
                  <span className="profile-info-label">Full Name</span>
                  <span className="profile-info-value">{teamLeaderInfo.fullName || '—'}</span>
                </div>
              </div>
              <div className="profile-info-item">
                <div className="profile-info-icon">
                  <i className="fas fa-envelope"></i>
                </div>
                <div className="profile-info-content">
                  <span className="profile-info-label">Email Address</span>
                  <span className="profile-info-value">
                    <a href={`mailto:${teamLeaderInfo.email}`}>{teamLeaderInfo.email || '—'}</a>
                  </span>
                </div>
              </div>
              <div className="profile-info-item">
                <div className="profile-info-icon">
                  <i className="fas fa-phone"></i>
                </div>
                <div className="profile-info-content">
                  <span className="profile-info-label">Phone Number</span>
                  <span className="profile-info-value">{teamLeaderInfo.phoneNumber || '—'}</span>
                </div>
              </div>
              <div className="profile-info-item">
                <div className="profile-info-icon">
                  <i className="fas fa-building"></i>
                </div>
                <div className="profile-info-content">
                  <span className="profile-info-label">Department</span>
                  <span className="profile-info-value">{teamLeaderInfo.department || 'Credentialing'}</span>
                </div>
              </div>
              <div className="profile-info-item">
                <div className="profile-info-icon">
                  <i className="fas fa-chart-line"></i>
                </div>
                <div className="profile-info-content">
                  <span className="profile-info-label">Leading Department</span>
                  <span className="profile-info-value">{teamLeaderInfo.leadingDepartment || 'Credentialing'}</span>
                </div>
              </div>
              <div className="profile-info-item">
                <div className="profile-info-icon">
                  <i className="fas fa-calendar-alt"></i>
                </div>
                <div className="profile-info-content">
                  <span className="profile-info-label">Member Since</span>
                  <span className="profile-info-value">{teamLeaderInfo.createdAt ? new Date(teamLeaderInfo.createdAt).toLocaleDateString() : '—'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Team Statistics Section */}
          <div className="profile-section">
            <h3 className="profile-section-title">
              <i className="fas fa-chart-bar"></i> Team Statistics
            </h3>
            <div className="profile-stats-row">
              <div className="profile-stat-card">
                <div className="profile-stat-icon">
                  <i className="fas fa-users"></i>
                </div>
                <div className="profile-stat-info">
                  <span className="profile-stat-number">{teamMembers.length}</span>
                  <span className="profile-stat-text">Team Members</span>
                </div>
              </div>
              <div className="profile-stat-card">
                <div className="profile-stat-icon">
                  <i className="fas fa-user-md"></i>
                </div>
                <div className="profile-stat-info">
                  <span className="profile-stat-number">{providers.length}</span>
                  <span className="profile-stat-text">Total Providers</span>
                </div>
              </div>
              <div className="profile-stat-card">
                <div className="profile-stat-icon">
                  <i className="fas fa-layer-group"></i>
                </div>
                <div className="profile-stat-info">
                  <span className="profile-stat-number">{groups.length}</span>
                  <span className="profile-stat-text">Practice Groups</span>
                </div>
              </div>
              <div className="profile-stat-card">
                <div className="profile-stat-icon">
                  <i className="fas fa-check-circle"></i>
                </div>
                <div className="profile-stat-info">
                  <span className="profile-stat-number">
                    {myTasks.filter(t => t.status === 'COMPLETED').length}/{myTasks.length}
                  </span>
                  <span className="profile-stat-text">Tasks Completed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Section (Optional) */}
          <div className="profile-section">
            <h3 className="profile-section-title">
              <i className="fas fa-history"></i> Recent Activity
            </h3>
            <div className="profile-activity-timeline">
              {myTasks.slice(0, 5).map(task => (
                <div key={task.id} className="timeline-item">
                  <div className="timeline-icon">
                    <i className={`fas ${task.status === 'COMPLETED' ? 'fa-check-circle' : 'fa-tasks'}`}></i>
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-title">{task.title}</div>
                    <div className="timeline-date">
                      {task.updatedAt ? new Date(task.updatedAt).toLocaleDateString() : new Date(task.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
              {myTasks.length === 0 && (
                <div className="timeline-item">
                  <div className="timeline-icon">
                    <i className="fas fa-info-circle"></i>
                  </div>
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

            {/* Task Detail Modal */}
            {showTaskModal && selectedTask && (
              <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
                <div className="task-modal" onClick={e => e.stopPropagation()}>
                  <div className="task-modal-header">
                    <h2>{selectedTask.title}</h2>
                    <button className="modal-close" onClick={() => setShowTaskModal(false)}>
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                  <div className="task-modal-body">
                    <div className="task-info-section">
                      <div className="task-info-row">
                        <span className="info-label"><i className="fas fa-info-circle"></i> Status:</span>
                        <select 
  value={selectedTask.status}
  onChange={(e) => updateProjectTaskStatus(selectedTask.id, e.target.value)}
  className="task-status-select"
>
                          <option value="TODO"><i className="fas fa-tasks"></i> To Do</option>
                          <option value="IN_PROGRESS"><i className="fas fa-sync-alt"></i> In Progress</option>
                          <option value="IN_REVIEW"><i className="fas fa-eye"></i> In Review</option>
                          <option value="COMPLETED"><i className="fas fa-check-circle"></i> Completed</option>
                          <option value="BLOCKED"><i className="fas fa-ban"></i> Blocked</option>
                        </select>
                      </div>
                      <div className="task-info-row">
                        <span className="info-label"><i className="fas fa-flag"></i> Priority:</span>
                        <span className="info-value">{getPriorityIcon(selectedTask.priority)} {selectedTask.priority}</span>
                      </div>
                      <div className="task-info-row">
                        <span className="info-label"><i className="fas fa-calendar"></i> Due Date:</span>
                        <span className="info-value">{selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString() : 'No due date'}</span>
                      </div>
                      <div className="task-info-row">
                        <span className="info-label"><i className="fas fa-user"></i> Assigned By:</span>
                        <span className="info-value">{selectedTask.assignedBy}</span>
                      </div>
                      <div className="task-info-row">
                        <span className="info-label"><i className="fas fa-align-left"></i> Description:</span>
                        <p className="info-value description">{selectedTask.description}</p>
                      </div>
                    </div>
                    <div className="task-comments-section">
                      <h4><i className="fas fa-comments"></i> Comments</h4>
                      <div className="comments-list">
                        {selectedTask.comments?.map((comment, idx) => (
                          <div key={idx} className="comment-item">
                            <strong>{comment.userName}</strong>
                            <span className="comment-time">{new Date(comment.createdAt).toLocaleString()}</span>
                            <p>{comment.comment}</p>
                          </div>
                        ))}
                        {(!selectedTask.comments || selectedTask.comments.length === 0) && <p className="no-comments">No comments yet</p>}
                      </div>
                      <div className="add-comment">
                        <textarea placeholder="Add a comment..." value={taskComment} onChange={(e) => setTaskComment(e.target.value)} rows="3" />
                        <button onClick={addComment} disabled={addingComment}>
                          {addingComment ? <><i className="fas fa-spinner fa-spin"></i> Adding...</> : <><i className="fas fa-paper-plane"></i> Add Comment</>}
                        </button>
                      </div>
                    </div>
                    <div className="task-time-section">
                      <h4><i className="fas fa-clock"></i> Time Tracking</h4>
                      {showTimeLog ? (
                        <div className="time-log-form">
                          <input type="number" placeholder="Hours spent" value={timeSpent} onChange={(e) => setTimeSpent(e.target.value)} />
                          <input type="text" placeholder="What did you work on?" value={timeDescription} onChange={(e) => setTimeDescription(e.target.value)} />
                          <button onClick={logTime} disabled={loggingTime}>
                            {loggingTime ? <><i className="fas fa-spinner fa-spin"></i> Logging...</> : <><i className="fas fa-save"></i> Log Time</>}
                          </button>
                          <button onClick={() => { setShowTimeLog(false); setTimeSpent(''); setTimeDescription(''); }}>
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button className="log-time-btn" onClick={() => setShowTimeLog(true)}>
                          <i className="fas fa-clock"></i> Log Time
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Project Status Update Modal */}
{showStatusModal && selectedProject && (
  <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
    <div className="modal-content" onClick={e => e.stopPropagation()}>
      <div className="modal-header">
        <h3><i className="fas fa-sync-alt"></i> Update Project Status</h3>
        <button className="modal-close" onClick={() => setShowStatusModal(false)}>
          <i className="fas fa-times"></i>
        </button>
      </div>
      <div className="modal-body">
        <p className="status-modal-info">
          <strong>{selectedProject.projectName}</strong><br />
          Current Status: <span className={`status-badge status-${selectedProject.status?.toLowerCase()}`}>
            {selectedProject.status}
          </span>
        </p>
        <div className="status-options-grid">
          {['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED'].map(status => (
            <button
              key={status}
              className={`status-option-btn ${selectedProject.status === status ? 'active' : ''}`}
              onClick={() => {
                updateProjectStatus(selectedProject.id, status);
                setShowStatusModal(false);
              }}
            >
              <i className={`fas ${
                status === 'PLANNING' ? 'fa-clipboard-list' :
                status === 'IN_PROGRESS' ? 'fa-play-circle' :
                status === 'ON_HOLD' ? 'fa-pause-circle' :
                status === 'COMPLETED' ? 'fa-check-circle' : 'fa-times-circle'
              }`}></i>
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>
      <div className="modal-footer">
        <button className="ad-btn" onClick={() => setShowStatusModal(false)}>Cancel</button>
      </div>
    </div>
  </div>
)}

            {/* Create Group Modal */}
            {showCreateGroupModal && (
              <div className="modal-overlay" onClick={() => setShowCreateGroupModal(false)}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                  <h3><i className="fas fa-layer-group"></i> Create New Group</h3>
                  <div className="ad-field" style={{ marginBottom: 16 }}>
                    <label className="ad-field-lbl">Group Name *</label>
                    <input type="text" className="ad-field-inp" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder="Enter group name" />
                  </div>
                  <div className="ad-field" style={{ marginBottom: 16 }}>
                    <label className="ad-field-lbl">Assign Primary Manager (Optional)</label>
                    <select className="ad-field-inp" value={newGroupManagerId} onChange={e => setNewGroupManagerId(e.target.value)}>
                      <option value="">Select a manager (optional)</option>
                      {availableManagersList.map(m => (
                        <option key={m.id} value={m.id}>{m.fullName} ({m.email})</option>
                      ))}
                    </select>
                  </div>
                  <div className="modal-actions">
                    <button className="ad-btn" onClick={() => setShowCreateGroupModal(false)}>Cancel</button>
                    <button className="ad-btn ad-btn-violet" onClick={handleCreateGroupWithManager}>Create Group</button>
                  </div>
                </div>
              </div>
            )}

            {/* Create Group Manager Modal */}
            {showCreateManagerModal && (
              <div className="modal-overlay" onClick={() => setShowCreateManagerModal(false)}>
                <div className="modal-content team-dashboard-modal-large" onClick={e => e.stopPropagation()}>
                  <h3><i className="fas fa-user-tie"></i> Create Group Manager Account</h3>
                  <div className="modal-form-grid">
                    <div className="ad-field"><label className="ad-field-lbl">Full Name *</label><input type="text" className="ad-field-inp" value={managerFullName} onChange={e => setManagerFullName(e.target.value)} /></div>
                    <div className="ad-field"><label className="ad-field-lbl">Email</label><input type="email" className="ad-field-inp" value={managerEmail} onChange={e => setManagerEmail(e.target.value)} /></div>
                    <div className="ad-field"><label className="ad-field-lbl">Phone</label><input type="text" className="ad-field-inp" value={managerPhone} onChange={e => setManagerPhone(e.target.value)} /></div>
                    <div className="ad-field"><label className="ad-field-lbl">Username *</label><input type="text" className="ad-field-inp" value={managerUsername} onChange={e => setManagerUsername(e.target.value)} /></div>
                    <div className="ad-field"><label className="ad-field-lbl">Password *</label><input type="password" className="ad-field-inp" value={managerPassword} onChange={e => setManagerPassword(e.target.value)} /></div>
                  </div>
                  <div className="modal-actions">
                    <button className="ad-btn" onClick={() => setShowCreateManagerModal(false)}>Cancel</button>
                    <button className="ad-btn ad-btn-blue" onClick={handleCreateGroupManager}>Create Manager</button>
                  </div>
                </div>
              </div>
            )}

            {/* Create Task Modal */}
<CreateTaskModal
  isOpen={showCreateTaskModal}
  onClose={() => setShowCreateTaskModal(false)}
  onSuccess={(task) => {
    showToastMessage(`Task "${task.title}" created successfully`);
    fetchMyTasks();
    fetchTeamTasks();
  }}
  assignableUsers={assignableUsersForTask}
  providers={providers}
/>

{/* Edit Project Modal */}
<EditProjectModal
  isOpen={showEditProjectModal}
  onClose={() => setShowEditProjectModal(false)}
  onSuccess={() => {
    showToastMessage('Project updated successfully');
    fetchProjectStats();
    setShowEditProjectModal(false);
  }}
  project={editingProject}
  apiBase="/team-leader/projects"
/>

            {/* Assign Manager to Group Modal */}
            {showAssignManagerModal && (
              <div className="modal-overlay" onClick={() => setShowAssignManagerModal(false)}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                  <h3><i className="fas fa-exchange-alt"></i> Assign Manager to {selectedGroupName}</h3>
                  <div className="ad-field" style={{ marginBottom: 16 }}>
                    <label className="ad-field-lbl">Select Manager</label>
                    <select className="ad-field-inp" value={selectedManagerId} onChange={e => setSelectedManagerId(e.target.value)}>
                      <option value="">Select a manager</option>
                      {availableManagers.map(m => (
                        <option key={m.id} value={m.id}>{m.fullName} ({m.email})</option>
                      ))}
                    </select>
                  </div>
                  {availableManagers.length === 0 && (
                    <div className="info-note"><i className="fas fa-info-circle"></i> No available managers. Create a new manager first.</div>
                  )}
                  <div className="modal-actions">
                    <button className="ad-btn" onClick={() => setShowAssignManagerModal(false)}>Cancel</button>
                    <button className="ad-btn ad-btn-teal" onClick={handleAssignManagerToGroup}>Assign Manager</button>
                  </div>
                </div>
              </div>
            )}

            {/* Add Provider to Group Modal */}
            {showAddProviderModal && (
              <div className="modal-overlay" onClick={() => setShowAddProviderModal(false)}>
                <div className="modal-content team-dashboard-modal-large" onClick={e => e.stopPropagation()}>
                  <h3><i className="fas fa-plus-circle"></i> Add Provider to {selectedGroupName}</h3>
                  <div className="ad-field" style={{ marginBottom: 16 }}>
                    <label className="ad-field-lbl">Select Provider</label>
                    <select className="ad-field-inp" value={selectedProviderId} onChange={e => setSelectedProviderId(e.target.value)}>
                      <option value="">Select a provider</option>
                      {unassignedProviders.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} - {p.specialty || 'No specialty'} 
                          {p.groupId ? ` (Currently in: ${p.groupName || 'a group'})` : ' (Not in any group)'}
                        </option>
                      ))}
                    </select>
                  </div>
                  {unassignedProviders.length === 0 && (
                    <div className="info-note"><i className="fas fa-info-circle"></i> No providers available. All providers are already in groups.</div>
                  )}
                  <div className="modal-actions">
                    <button className="ad-btn" onClick={() => setShowAddProviderModal(false)}>Cancel</button>
                    <button className="ad-btn ad-btn-green" onClick={handleAddProviderToGroupEnhanced} disabled={!selectedProviderId}>
                      Add Provider
                    </button>
                  </div>
                </div>
              </div>
            )}


           {/*Replace license modal*/}
{showReplaceLicenseModal && replaceProvider && (
  <div className="modal-overlay" onClick={() => setShowReplaceLicenseModal(false)}>
    <div className="replace-license-modal" onClick={e => e.stopPropagation()}>
      <div className="modal-header">
  <h3>{replaceCurrentDocument ? 'Replace' : 'Upload'} {replaceDocumentType?.replace(/_/g, ' ')}</h3>
  <button className="modal-close" onClick={() => setShowReplaceLicenseModal(false)}>×</button>
</div>
<div className="modal-body">
  <p><strong>Provider:</strong> {replaceProvider.name}</p>
  {replaceCurrentDocument && (
    <p><strong>Current File:</strong> {replaceCurrentDocument.fileName}</p>
  )}
        
        {['MEDICAL_LICENSE', 'DEA_CERTIFICATE', 'BOARD_CERTIFICATION', 'MALPRACTICE_INSURANCE'].includes(replaceDocumentType) && (
  <>
    <div className="form-group">
      <label>New License Number (Optional)</label>
      <input 
        type="text" 
        id="newLicenseNumber"
        className="ad-field-inp" 
        placeholder="Enter new license number" 
      />
    </div>
    
    <div className="form-group">
      <label>New Expiry Date *</label>
      <input 
        type="date" 
        id="newExpiryDate"
        className="ad-field-inp" 
        required 
      />
    </div>
  </>
)}

<div className="form-group">
  <label>Upload File *</label>
  <input 
    type="file" 
    id="replaceLicenseFile"
    className="ad-field-inp" 
    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
  />
</div>
      </div>
      <div className="modal-footer">
        <button className="ad-btn" onClick={() => setShowReplaceLicenseModal(false)}>Cancel</button>
        <button className="ad-btn ad-btn-blue" onClick={handleReplaceLicenseUpload} disabled={uploading}>
  {uploading ? 'Uploading...' : 'Upload & Update'}
</button>
      </div>
    </div>
  </div>
)}

            {/* Edit Group Modal */}
            {showEditGroupModal && (
              <div className="modal-overlay" onClick={() => setShowEditGroupModal(false)}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                  <h3><i className="fas fa-edit"></i> Edit Group</h3>
                  <div className="ad-field" style={{ marginBottom: 16 }}>
                    <label className="ad-field-lbl">Group Name</label>
                    <input type="text" className="ad-field-inp" value={editGroupName} onChange={e => setEditGroupName(e.target.value)} />
                  </div>
                  <div className="modal-actions">
                    <button className="ad-btn" onClick={() => setShowEditGroupModal(false)}>Cancel</button>
                    <button className="ad-btn ad-btn-violet" onClick={handleUpdateGroup}>Save Changes</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Assign Team Leader to Group Modal */}
{showAssignTeamLeaderModal && (
  <div className="modal-overlay" onClick={() => setShowAssignTeamLeaderModal(false)}>
    <div className="modal-content" onClick={e => e.stopPropagation()}>
      <h3><i className="fas fa-user-tie"></i> Assign Team Leader to {selectedGroupName}</h3>
      <div className="ad-field" style={{ marginBottom: 16 }}>
        <label className="ad-field-lbl">Select Team Leader</label>
        <select className="ad-field-inp" value={selectedTeamLeaderForGroup} onChange={e => setSelectedTeamLeaderForGroup(e.target.value)}>
          <option value="">Select a Team Leader</option>
          {availableTeamLeadersForGroup.map(leader => (
            <option key={leader.id} value={leader.id}>
              {leader.fullName} ({leader.email}) {leader.leadingDepartment ? `- Leads: ${leader.leadingDepartment}` : ''}
            </option>
          ))}
        </select>
      </div>
      {availableTeamLeadersForGroup.length === 0 && (
        <div className="info-note"><i className="fas fa-info-circle"></i> No Team Leaders available.</div>
      )}
      <div className="modal-actions">
        <button className="ad-btn" onClick={() => setShowAssignTeamLeaderModal(false)}>Cancel</button>
        <button 
          className="ad-btn ad-btn-violet" 
          onClick={handleAssignTeamLeaderToGroup}
          disabled={loading || !selectedTeamLeaderForGroup}
        >
          {loading ? <><i className="fas fa-spinner fa-spin"></i> Assigning...</> : "Assign Team Leader"}
        </button>
      </div>
    </div>
  </div>
)}

{/* Assign Team Member to Group Modal */}
{showAssignTeamMemberModal && (
  <div className="modal-overlay" onClick={() => setShowAssignTeamMemberModal(false)}>
    <div className="modal-content" onClick={e => e.stopPropagation()}>
      <h3><i className="fas fa-user-plus"></i> Assign Team Member to {selectedGroupName}</h3>
      <div className="ad-field" style={{ marginBottom: 16 }}>
        <label className="ad-field-lbl">Select Team Member</label>
        <select className="ad-field-inp" value={selectedTeamMemberForGroup} onChange={e => setSelectedTeamMemberForGroup(e.target.value)}>
          <option value="">Select a Team Member</option>
          {availableTeamMembersForGroup.map(member => (
            <option key={member.id} value={member.id}>
              {member.fullName} ({member.email}) {member.department ? `- ${member.department}` : ''}
            </option>
          ))}
        </select>
      </div>
      {availableTeamMembersForGroup.length === 0 && (
        <div className="info-note"><i className="fas fa-info-circle"></i> No Team Members available.</div>
      )}
      <div className="modal-actions">
        <button className="ad-btn" onClick={() => setShowAssignTeamMemberModal(false)}>Cancel</button>
        <button 
          className="ad-btn ad-btn-green" 
          onClick={handleAssignTeamMemberToGroup}
          disabled={loading || !selectedTeamMemberForGroup}
        >
          {loading ? <><i className="fas fa-spinner fa-spin"></i> Assigning...</> : "Assign Team Member"}
        </button>
      </div>
    </div>
  </div>
)}

{/* Add Assignee to Project Modal */}
{/* Add Assignee to Project Modal */}
{showAddAssigneeModal && selectedProjectForTasks && (
  <div className="modal-overlay" onClick={() => setShowAddAssigneeModal(false)}>
    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
      <div className="modal-header">
        <h3>
          <i className="fas fa-user-plus"></i> 
          Add {assigneeRoleFilter === 'TEAM_LEADER' ? 'Team Leader' : 'Team Member'} to Project
        </h3>
        <button className="modal-close" onClick={() => setShowAddAssigneeModal(false)}>×</button>
      </div>
      
      <div className="modal-body">
        <p><strong>Project:</strong> {selectedProjectForTasks.projectName}</p>
        
        <div className="ad-field" style={{ marginBottom: 16 }}>
          <label className="ad-field-lbl">
            Select {assigneeRoleFilter === 'TEAM_LEADER' ? 'Team Leader' : 'Team Member'}
          </label>
          <select 
            className="ad-field-inp" 
            value={selectedAssigneeId} 
            onChange={e => setSelectedAssigneeId(e.target.value)}
          >
            <option value="">
              Select a {assigneeRoleFilter === 'TEAM_LEADER' ? 'Team Leader' : 'Team Member'}...
            </option>
            {assignableUsersForProject
              .filter(user => assigneeRoleFilter === 'ALL' || user.role === assigneeRoleFilter)
              .map(user => (
                <option key={user.id} value={user.id}>
                  {user.role === 'TEAM_LEADER' ? 'L ' : 'TM'} 
                  {user.fullName} 
                  ({user.role === 'TEAM_LEADER' ? 'Team Leader' : 'Team Member'})
                  {user.leadingDepartment ? ` - Leads: ${user.leadingDepartment}` : ''}
                  {user.department ? ` - ${user.department}` : ''}
                </option>
              ))}
          </select>
        </div>
        
        {assignableUsersForProject.filter(user => assigneeRoleFilter === 'ALL' || user.role === assigneeRoleFilter).length === 0 && (
          <div className="info-note">
            <i className="fas fa-info-circle"></i> No {assigneeRoleFilter === 'TEAM_LEADER' ? 'Team Leaders' : 'Team Members'} available to add.
          </div>
        )}
      </div>
      
      <div className="modal-footer" style={{ padding: '16px 20px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <button className="ad-btn" onClick={() => setShowAddAssigneeModal(false)}>Cancel</button>
        <button 
          className="ad-btn ad-btn-blue" 
          onClick={handleAddAssigneeToProject}
          disabled={loading || !selectedAssigneeId}
        >
          {loading ? <><i className="fas fa-spinner fa-spin"></i> Adding...</> : <><i className="fas fa-user-plus"></i> Add {assigneeRoleFilter === 'TEAM_LEADER' ? 'Team Leader' : 'Team Member'}</>}
        </button>
      </div>
    </div>
  </div>
)}

        {/* Provider Details Modal - Groups & Contracts */}
{showProviderDetailsModal && selectedProviderForDetails && (
    <div className="modal-overlay" onClick={() => setShowProviderDetailsModal(false)}>
        <div className="provider-details-modal" onClick={e => e.stopPropagation()} style={{ width: '90%', maxWidth: '800px', maxHeight: '85vh', overflowY: 'auto', background: 'white', borderRadius: '12px' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
                <h3 style={{ margin: 0 }}>
                    <i className="fas fa-user-md"></i> {selectedProviderForDetails.name}
                </h3>
                <button className="modal-close" onClick={() => setShowProviderDetailsModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>×</button>
            </div>
            <div className="modal-body" style={{ padding: '20px' }}>
                <ProviderGroupsManager 
                    providerId={selectedProviderForDetails.id}
                    providerName={selectedProviderForDetails.name}
                    onUpdate={() => {
                        fetchProviders();
                        fetchGroups();
                    }}
                />
                
              
            </div>
            <div className="modal-footer" style={{ padding: '16px 20px', borderTop: '1px solid #e5e7eb', textAlign: 'right' }}>
                <button className="ad-btn" onClick={() => setShowProviderDetailsModal(false)}>Close</button>
            </div>
        </div>
    </div>
)}

{/* Payor Details Modal - Hierarchical Table */}
{showPayorDetailsModal && payorFlatData && selectedPayor && (
  <div className="modal-overlay" onClick={() => setShowPayorDetailsModal(false)}>
    <div className="modal-content payor-detail-modal" onClick={e => e.stopPropagation()}>
      <div className="modal-header">
        <h3>
          <i className="fas fa-file-medical"></i> Credentialing Details - {selectedPayor}
          <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#6b7280', marginLeft: '12px' }}>
            Group: {selectedGroupName}
          </span>
        </h3>
        <button className="modal-close" onClick={() => setShowPayorDetailsModal(false)}>×</button>
      </div>
      
      <div className="modal-body">
        {/* Summary Stats */}
        <div className="payor-stats">
          <div><strong>Total Plans:</strong> <span className="stat-value">{payorFlatData.totalPlans}</span></div>
          <div><strong>Active:</strong> <span className="stat-value active">{payorFlatData.summary.active}</span></div>
          <div><strong>Pending:</strong> <span className="stat-value pending">{payorFlatData.summary.pending}</span></div>
          <div><strong>Expired:</strong> <span className="stat-value expired">{payorFlatData.summary.expired}</span></div>
          <div style={{ marginLeft: 'auto' }}>
            <button 
              className="ad-btn ad-btn-blue" 
              onClick={() => {
                setShowPayorDetailsModal(false);
                handleAddPayor();
                setPayorFormData(prev => ({
                  ...prev,
                  payerName: selectedPayor
                }));
              }}
            >
              <i className="fas fa-plus"></i> Add New Plan
            </button>
          </div>
        </div>

        {/* Hierarchical Table */}
        {payorFlatData.records && payorFlatData.records.length > 0 ? (
          <div className="ad-table-wrap payor-table-wrap">
            <table className="ad-table payor-hierarchy-table">
              <thead>
                <tr>
                  <th>Payer Name</th>
                  <th>LOB</th>
                  <th>Network</th>
                  <th>Product</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Managing Entity</th>
                  <th>App Date</th>
                  <th>Eff Date</th>
                  <th>Link Date</th>
                  <th>Recred Date</th>
                  <th>Term Date</th>
                  <th>Provider Rep</th>
                  <th>Contracting Rep</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  // Group by LOB -> Network -> Product -> Plan
                  const sortedRecords = [...payorFlatData.records].sort((a, b) => {
                    const lobCompare = (a.lob || '').localeCompare(b.lob || '');
                    if (lobCompare !== 0) return lobCompare;
                    const networkCompare = (a.network || '').localeCompare(b.network || '');
                    if (networkCompare !== 0) return networkCompare;
                    const productCompare = (a.product || '').localeCompare(b.product || '');
                    if (productCompare !== 0) return productCompare;
                    return (a.plan || '').localeCompare(b.plan || '');
                  });

                  // Build hierarchy
                  const hierarchy = [];
                  let currentLob = null;
                  let currentLobGroup = null;
                  let currentNetwork = null;
                  let currentNetworkGroup = null;
                  let currentProduct = null;
                  let currentProductGroup = null;

                  for (const record of sortedRecords) {
                    const lob = record.lob || '';
                    const network = record.network || '';
                    const product = record.product || '';

                    if (lob !== currentLob || !currentLobGroup) {
                      currentLob = lob;
                      currentLobGroup = { value: lob, rowSpan: 0, networks: [] };
                      hierarchy.push(currentLobGroup);
                      currentNetwork = null;
                      currentNetworkGroup = null;
                      currentProduct = null;
                      currentProductGroup = null;
                    }

                    if (network !== currentNetwork || !currentNetworkGroup) {
                      currentNetwork = network;
                      currentNetworkGroup = { value: network, rowSpan: 0, products: [] };
                      currentLobGroup.networks.push(currentNetworkGroup);
                      currentProduct = null;
                      currentProductGroup = null;
                    }

                    if (product !== currentProduct || !currentProductGroup) {
                      currentProduct = product;
                      currentProductGroup = { value: product, rowSpan: 0, plans: [] };
                      currentNetworkGroup.products.push(currentProductGroup);
                    }

                    // Avoid duplicates
                    const isDuplicateRow = currentProductGroup.plans.some(p =>
                      (p.plan || '') === (record.plan || '') &&
                      (p.status || '') === (record.status || '') &&
                      p.id === record.id
                    );
                    if (!isDuplicateRow) {
                      currentProductGroup.plans.push(record);
                    }
                  }

                  // Calculate rowSpans bottom-up
                  let totalPayerRowSpan = 0;
                  for (const lobGroup of hierarchy) {
                    let lobRowSpan = 0;
                    for (const networkGroup of lobGroup.networks) {
                      let networkRowSpan = 0;
                      for (const productGroup of networkGroup.products) {
                        const planCount = productGroup.plans.length;
                        productGroup.rowSpan = planCount;
                        networkRowSpan += planCount;
                      }
                      networkGroup.rowSpan = networkRowSpan;
                      lobRowSpan += networkRowSpan;
                    }
                    lobGroup.rowSpan = lobRowSpan;
                    totalPayerRowSpan += lobRowSpan;
                  }

                  // Render rows
                  const rows = [];
                  let globalRowIndex = 0;

                  hierarchy.forEach((lobGroup) => {
                    let isFirstRowOfLob = true;

                    lobGroup.networks.forEach((networkGroup) => {
                      let isFirstRowOfNetwork = true;

                      networkGroup.products.forEach((productGroup) => {
                        productGroup.plans.forEach((record, planIdx) => {
                          const isFirstRowOfProduct = planIdx === 0;

                          rows.push(
                            <tr key={record.id || planIdx}>
                              {/* Payer Name - merged across the ENTIRE table */}
                              {globalRowIndex === 0 && (
                                <td rowSpan={totalPayerRowSpan} className="hierarchy-cell payer-cell">
                                  {selectedPayor}
                                </td>
                              )}

                              {/* LOB - merged across its whole group */}
                              {isFirstRowOfLob && (
                                <td rowSpan={lobGroup.rowSpan} className="hierarchy-cell lob-cell">
                                  {lobGroup.value || '—'}
                                </td>
                              )}

                              {/* Network - merged across its whole group */}
                              {isFirstRowOfNetwork && (
                                <td rowSpan={networkGroup.rowSpan} className="hierarchy-cell network-cell">
                                  {networkGroup.value || '—'}
                                </td>
                              )}

                              {/* Product - merged across its whole group */}
                              {isFirstRowOfProduct && (
                                <td rowSpan={productGroup.rowSpan} className="hierarchy-cell product-cell">
                                  {productGroup.value || '—'}
                                </td>
                              )}

                              <td className="plan-cell">{record.plan || '—'}</td>

                              <td>
                                <span className={`status-badge ${
                                  record.status?.toLowerCase() === 'active' ? 'active' :
                                  record.status?.toLowerCase() === 'pending' ? 'pending' :
                                  record.status?.toLowerCase() === 'expired' ? 'expired' : ''
                                }`}>
                                  {record.status || '—'}
                                </span>
                              </td>

                              <td>{record.managingEntity || '—'}</td>
                              <td>{formatDateForDisplay(record.applicationDate) || '—'}</td>
                              <td>{formatDateForDisplay(record.credentialingEffectiveDate) || '—'}</td>
                              <td>{formatDateForDisplay(record.linkEffectiveDate) || '—'}</td>
                              <td>{formatDateForDisplay(record.recredentialingDate) || '—'}</td>
                              <td>{formatDateForDisplay(record.terminationDate) || '—'}</td>
                              <td>{record.providerRep || '—'}</td>
                              <td>{record.contractingRep || '—'}</td>

                              <td>
                                <div className="action-buttons">
                                  <button
                                    className="action-btn edit-btn"
                                    onClick={() => {
                                      const fullRecord = credentialingStatus.find(r => r.id === record.id);
                                      if (fullRecord) {
                                        handleEditPayor(fullRecord);
                                        setShowPayorDetailsModal(false);
                                      }
                                    }}
                                    title="Edit"
                                  >
                                    <i className="fas fa-edit"></i>
                                  </button>
                                  <button
                                    className="action-btn delete-btn"
                                    onClick={() => handleDeletePayor(record.id)}
                                    title="Delete"
                                  >
                                    <i className="fas fa-trash-alt"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );

                          globalRowIndex++;
                          isFirstRowOfLob = false;
                          isFirstRowOfNetwork = false;
                        });
                      });
                    });
                  });

                  return rows;
                })()}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <p style={{ color: '#6b7280' }}>No plans found for this payor</p>
          </div>
        )}
      </div>
      
      <div className="modal-footer">
        <button className="ad-btn" onClick={() => setShowPayorDetailsModal(false)}>Close</button>
      </div>
    </div>
  </div>
)}

{/* Add/Edit Payor Modal */}
{showAddPayorModal && (
  <div className="modal-overlay" onClick={() => setShowAddPayorModal(false)}>
    <div className="modal-content payor-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
      <div className="modal-header">
        <h3>
          <i className="fas fa-file-medical"></i> 
          {editingPayor ? 'Edit Payor Credentialing' : 'Add Payor Credentialing'}
        </h3>
        <button className="modal-close" onClick={() => setShowAddPayorModal(false)}>×</button>
      </div>
      
      <div className="modal-body">
        <div className="payor-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label>Payer Name *</label>
            <input 
              type="text" 
              name="payerName" 
              className="ad-field-inp" 
              value={payorFormData.payerName} 
              onChange={handlePayorInputChange}
              placeholder="e.g., Aetna, Cigna, BCBS"
            />
          </div>
          <div className="form-group">
            <label>LOB (Line of Business)</label>
            <input 
              type="text" 
              name="lob" 
              className="ad-field-inp" 
              value={payorFormData.lob} 
              onChange={handlePayorInputChange}
              placeholder="e.g., Commercial, Medicare, Medicaid"
            />
          </div>
          <div className="form-group">
            <label>Network</label>
            <input 
              type="text" 
              name="network" 
              className="ad-field-inp" 
              value={payorFormData.network} 
              onChange={handlePayorInputChange}
              placeholder="e.g., PPO, HMO, POS"
            />
          </div>
          <div className="form-group">
            <label>Product</label>
            <input 
              type="text" 
              name="product" 
              className="ad-field-inp" 
              value={payorFormData.product} 
              onChange={handlePayorInputChange}
              placeholder="e.g., Gold, Silver, Orange"
            />
          </div>
          <div className="form-group">
            <label>Plan</label>
            <input 
              type="text" 
              name="plan" 
              className="ad-field-inp" 
              value={payorFormData.plan} 
              onChange={handlePayorInputChange}
              placeholder="e.g., $0 Copay, High Ded, Low Ded"
            />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select
              name="status"
              className="ad-field-inp"
              value={payorFormData.status}
              onChange={handlePayorInputChange}
            >
              <option value="">Select Status</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
          <div className="form-group">
            <label>Managing Entity</label>
            <input 
              type="text" 
              name="managingEntity" 
              className="ad-field-inp" 
              value={payorFormData.managingEntity} 
              onChange={handlePayorInputChange}
              placeholder="Who manages this credentialing?"
            />
          </div>
          <div className="form-group">
            <label>Application Date</label>
            <input
              type="text"
              name="applicationDate"
              className="ad-field-inp"
              value={payorFormData.applicationDate}
              onChange={handleDateFieldChange}
              placeholder="MM-DD-YYYY"
              maxLength={10}
            />
          </div>
          <div className="form-group">
            <label>Credentialing Effective Date</label>
            <input
              type="text"
              name="credentialingEffectiveDate"
              className="ad-field-inp"
              value={payorFormData.credentialingEffectiveDate}
              onChange={handleDateFieldChange}
              placeholder="MM-DD-YYYY"
              maxLength={10}
            />
          </div>
          <div className="form-group">
            <label>Link Effective Date</label>
            <input
              type="text"
              name="linkEffectiveDate"
              className="ad-field-inp"
              value={payorFormData.linkEffectiveDate}
              onChange={handleDateFieldChange}
              placeholder="MM-DD-YYYY"
              maxLength={10}
            />
          </div>
          <div className="form-group">
            <label>Recredentialing Date</label>
            <input
              type="text"
              name="recredentialingDate"
              className="ad-field-inp"
              value={payorFormData.recredentialingDate}
              onChange={handleDateFieldChange}
              placeholder="MM-DD-YYYY"
              maxLength={10}
            />
          </div>
          <div className="form-group">
            <label>Termination Date</label>
            <input
              type="text"
              name="terminationDate"
              className="ad-field-inp"
              value={payorFormData.terminationDate}
              onChange={handleDateFieldChange}
              placeholder="MM-DD-YYYY"
              maxLength={10}
            />
          </div>
          <div className="form-group">
            <label>Provider Rep</label>
            <input 
              type="text" 
              name="providerRep" 
              className="ad-field-inp" 
              value={payorFormData.providerRep} 
              onChange={handlePayorInputChange}
              placeholder="Provider representative name"
            />
          </div>
          <div className="form-group">
            <label>Contracting Rep</label>
            <input 
              type="text" 
              name="contractingRep" 
              className="ad-field-inp" 
              value={payorFormData.contractingRep} 
              onChange={handlePayorInputChange}
              placeholder="Contracting representative name"
            />
          </div>
        </div>
      </div>
      
      <div className="modal-footer" style={{ padding: '16px 20px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <button className="ad-btn" onClick={() => setShowAddPayorModal(false)}>Cancel</button>
        <button className="ad-btn ad-btn-blue" onClick={handleSavePayor}>
          <i className="fas fa-save"></i> {editingPayor ? 'Update' : 'Save'} Payor
        </button>
      </div>
    </div>
  </div>
)}

        {/* Toast */}
        {toast.text && (
          <div className={`ad-toast ${toast.type === "error" ? "t-err" : "t-ok"}`}>
            <span className="t-icon">{toast.type === "error" ? <i className="fas fa-times-circle"></i> : <i className="fas fa-check-circle"></i>}</span>
            {toast.text}
          </div>
        )}

        
      </div>
    );
  };

  export default TeamLeaderDashboard;