import React, { useState, useEffect } from "react";
import API from '../services/api';
import "./AdminDashboard.css";
import CreateTaskModal from '../components/CreateTaskModal';
import EditProjectModal from '../components/EditProjectModal';

function AdminDashboard() {
  // ==================== STATE VARIABLES ====================
  
  // Form states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [department, setDepartment] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [leadingDepartment, setLeadingDepartment] = useState("");

  //payor states

  const [payorSummaryList, setPayorSummaryList] = useState([]);
const [selectedPayor, setSelectedPayor] = useState(null);
const [showPayorDetailsModal, setShowPayorDetailsModal] = useState(false);
const [payorHierarchy, setPayorHierarchy] = useState(null);
const [expandedPayors, setExpandedPayors] = useState({});

// Hierarchical Table View States

const [payorFlatData, setPayorFlatData] = useState(null);

  // UI states
  const [toast, setToast] = useState({ text: "", type: "" });
  const [activeView, setActiveView] = useState("DASHBOARD");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  
const [assigneeRoleFilter, setAssigneeRoleFilter] = useState('ALL');
  
  // Data states
  const [teamMembers, setTeamMembers] = useState([]);
  const [filterRole, setFilterRole] = useState("ALL");
  const [providers, setProviders] = useState([]);
  const [groups, setGroups] = useState([]);
  const [teamLeaders, setTeamLeaders] = useState([]);
  const [unassignedTeamMembers, setUnassignedTeamMembers] = useState([]);
  const [teamLeaderStats, setTeamLeaderStats] = useState([]);

  
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  
  // Enhanced search states for Assign Team Member
  const [searchTeamLeaderTerm, setSearchTeamLeaderTerm] = useState("");
  const [selectedTeamLeaders, setSelectedTeamLeaders] = useState([]);
  const [searchTeamMemberTerm, setSearchTeamMemberTerm] = useState("");
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
  const [showTeamLeaderPicker, setShowTeamLeaderPicker] = useState(false);
  const [showTeamMemberPicker, setShowTeamMemberPicker] = useState(false);

  const [showAssignTeamLeaderModal, setShowAssignTeamLeaderModal] = useState(false);
  const [availableTeamLeaders, setAvailableTeamLeaders] = useState([]);
  const [selectedTeamLeaderId, setSelectedTeamLeaderId] = useState("");

  const [assignableUsers, setAssignableUsers] = useState([]);
  
  // Enhanced search states for Assign Task
  const [searchTaskAssigneeTerm, setSearchTaskAssigneeTerm] = useState("");
  const [selectedTaskAssignees, setSelectedTaskAssignees] = useState([]);
  const [showTaskAssigneePicker, setShowTaskAssigneePicker] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskPriority, setTaskPriority] = useState("MEDIUM");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskRelatedProvider, setTaskRelatedProvider] = useState("");


  // Reset Password Modal States
const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
const [resetPasswordUser, setResetPasswordUser] = useState(null);
const [newPassword, setNewPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');
const [passwordError, setPasswordError] = useState('');

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

  const [showAddAssigneeModal, setShowAddAssigneeModal] = useState(false);
const [selectedAssigneeId, setSelectedAssigneeId] = useState('');
const [assignableUsersForProject, setAssignableUsersForProject] = useState([]);

  const [dashboardStats, setDashboardStats] = useState({
    totalProviders: 0,
    totalGroups: 0,
    totalTeamMembers: 0,
    totalTeamLeaders: 0
  });
  
  // Modal states
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedTeamLeaderForStats, setSelectedTeamLeaderForStats] = useState(null);
  const [showTaskStatsModal, setShowTaskStatsModal] = useState(false);

  // Group Management States
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [selectedGroupName, setSelectedGroupName] = useState("");
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showEditGroupModal, setShowEditGroupModal] = useState(false);
  const [showAssignManagerModal, setShowAssignManagerModal] = useState(false);
  const [showAddProviderModal, setShowAddProviderModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [editGroupName, setEditGroupName] = useState("");
  const [selectedManagerId, setSelectedManagerId] = useState("");
  const [selectedProviderId, setSelectedProviderId] = useState("");
  const [existingManagers, setExistingManagers] = useState([]);
  const [groupProviders, setGroupProviders] = useState([]);
  const [availableManagers, setAvailableManagers] = useState([]);
  const [unassignedProviders, setUnassignedProviders] = useState([]);
  const [managerFullName, setManagerFullName] = useState("");
  const [managerEmail, setManagerEmail] = useState("");
  const [managerPhone, setManagerPhone] = useState("");
  const [managerUsername, setManagerUsername] = useState("");
  const [managerPassword, setManagerPassword] = useState("");
  const [showCreateManagerModal, setShowCreateManagerModal] = useState(false);


  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
const [showEditProjectModal, setShowEditProjectModal] = useState(false);
const [editingProject, setEditingProject] = useState(null);

  // Task statistics states
  const [allTasks, setAllTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  // Activity tracking states
  const [activityDate, setActivityDate] = useState(new Date().toISOString().split('T')[0]);
  const [activityData, setActivityData] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [activityStats, setActivityStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    avgHours: 0,
    complianceRate: 0
  });

  const [projects, setProjects] = useState([]);
  const [projectStats, setProjectStats] = useState({
    total: 0,
    planning: 0,
    inProgress: 0,
    onHold: 0,
    completed: 0,
    cancelled: 0,
    avgCompletion: 0
  });
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectDetail, setShowProjectDetail] = useState(false);
  const [projectSearch, setProjectSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [allTasksList, setAllTasksList] = useState([]);
  const [taskSearch, setTaskSearch] = useState("");
  const [taskStatusFilter, setTaskStatusFilter] = useState("ALL");
  const [taskRoleFilter, setTaskRoleFilter] = useState("ALL");
  const [selectedTaskForView, setSelectedTaskForView] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    department: '',
    leadingDepartment: '',
    specialty: '',
    status: 'Active'
  });

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
    
    // Create download link
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
    
    // Create download link
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

  // ==================== CREDENTIALING STATUS FUNCTIONS ====================

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



const handleSavePayor = async () => {
  if (!payorFormData.payerName) {
    showToastMessage("Payer Name is required", "error");
    return;
  }

  setLoading(true);
  try {
    // First, check if this combination already exists (only for new records)
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
        // If check endpoint fails, we'll let the save attempt handle it
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

    let response;
    if (editingPayor) {
      response = await API.put(`/credentialing/${editingPayor.id}`, payload);
      showToastMessage("Payor updated successfully");
    } else {
      response = await API.post('/credentialing/create', payload);
      showToastMessage("Payor added successfully");
    }

    // Refresh the list
    await fetchCredentialingRecords(selectedGroupId);
    
    setShowAddPayorModal(false);
    setEditingPayor(null);
  } catch (error) {
    console.error("Error saving payor:", error);
    
    // Check if it's a duplicate error from backend
    if (error.response?.status === 409 && error.response?.data?.duplicate) {
      showToastMessage(error.response?.data?.message || "This combination already exists!", "error");
    } else {
      showToastMessage(error.response?.data?.error || "Failed to save payor", "error");
    }
  } finally {
    setLoading(false);
  }
};

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

const handleDeletePayor = async (payorId) => {
  if (!window.confirm("Are you sure you want to delete this payor record?")) return;
  
  setLoading(true);
  try {
    await API.delete(`/credentialing/${payorId}`);
    showToastMessage("Payor deleted successfully");
    await fetchCredentialingRecords(selectedGroupId);
  } catch (error) {
    console.error("Error deleting payor:", error);
    showToastMessage(error.response?.data?.error || "Failed to delete payor", "error");
  } finally {
    setLoading(false);
  }
};

// Reset credentialing data when selected group changes
useEffect(() => {
  if (selectedGroupId) {
    fetchCredentialingRecords(selectedGroupId);
  } else {
    setCredentialingStatus([]);
  }
}, [selectedGroupId]);

const handlePayorInputChange = (e) => {
  setPayorFormData({
    ...payorFormData,
    [e.target.name]: e.target.value
  });
};

  const API_URL = process.env.REACT_APP_API_URL;
  const IDLE_THRESHOLD = process.env.REACT_APP_IDLE_THRESHOLD;

  console.log('API URL:', API_URL);

  const token = () => localStorage.getItem("token");
  const authH = () => ({ "Authorization": `Bearer ${token()}`, "Content-Type": "application/json" });

  // ==================== HELPER FUNCTIONS ====================
 
// ISO (YYYY-MM-DD, from backend) -> US display (MM-DD-YYYY)
const formatDateForDisplay = (isoDate) => {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate; // already some other format / garbage, show as-is
  const [year, month, day] = parts;
  return `${month}-${day}-${year}`;
};
 
// US display (MM-DD-YYYY) -> ISO (YYYY-MM-DD, for backend)
const formatDateForStorage = (usDate) => {
  if (!usDate) return '';
  const parts = usDate.split('-');
  if (parts.length !== 3) return '';
  const [month, day, year] = parts;
  if (!month || !day || !year || year.length !== 4) return ''; // incomplete date typed
  return `${year}-${month}-${day}`;
};
 
// Auto-inserts dashes as the user types digits: 07202026 -> 07-20-2026
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
 

  
  const showToastMessage = (text, type = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast({ text: "", type: "" }), 4000);
  };

  const clearForm = () => {
    setUsername(""); setPassword(""); setFullName(""); setEmail("");
    setPhoneNumber(""); setDepartment(""); setSpecialty("");
    setLeadingDepartment("");
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const safeJson = async (res) => {
    const t = await res.text();
    if (!t) return null;
    try { return JSON.parse(t); } catch { throw new Error(t.substring(0, 120)); }
  };

  const getPriorityIcon = (priority) => {
    switch(priority) {
      case 'HIGH': return <i className="fas fa-circle" style={{ color: '#ef4444', fontSize: '12px' }}></i>;
      case 'MEDIUM': return <i className="fas fa-circle" style={{ color: '#f59e0b', fontSize: '12px' }}></i>;
      case 'LOW': return <i className="fas fa-circle" style={{ color: '#10b981', fontSize: '12px' }}></i>;
      default: return <i className="fas fa-circle" style={{ color: '#9ca3af', fontSize: '12px' }}></i>;
    }
  };

  const updateProjectStatus = async (projectId, newStatus) => {
    setLoading(true);
    try {
      await API.put(`/admin/projects/${projectId}/status`, { status: newStatus });
      showToastMessage(`Project status updated to ${newStatus}`);
      fetchAllProjects();
    } catch (e) {
      showToastMessage(e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'TODO': return 'status-todo';
      case 'IN_PROGRESS': return 'status-in_progress';
      case 'IN_REVIEW': return 'status-in_review';
      case 'COMPLETED': return 'status-completed';
      case 'BLOCKED': return 'status-blocked';
      default: return 'status-todo';
    }
  };

  const openEditUserModal = (user) => {
    setEditingUser(user);
    setEditFormData({
      fullName: user.fullName || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      department: user.department || '',
      leadingDepartment: user.leadingDepartment || '',
      specialty: user.specialty || '',
      status: user.status || 'Active'
    });
    setShowEditModal(true);
  };

  const handleEditInputChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateUser = async () => {
    setLoading(true);
    try {
      await API.put(`/admin/update-user/${editingUser.id}`, editFormData);
      showToastMessage(`User "${editFormData.fullName}" updated successfully`);
      setShowEditModal(false);
      setEditingUser(null);
      fetchUsers(filterRole);
      fetchTeamLeaders();
      fetchUnassignedTeamMembers();
    } catch (e) {
      showToastMessage(e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete "${userName}"? This action cannot be undone.`)) {
      return;
    }
    setLoading(true);
    try {
      await API.delete(`/admin/delete-user/${userId}`);
      showToastMessage(`User "${userName}" deleted successfully`);
      fetchUsers(filterRole);
      fetchTeamLeaders();
      fetchUnassignedTeamMembers();
      fetchProviders();
    } catch (e) {
      showToastMessage(e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Open Reset Password Modal
const openResetPasswordModal = (user) => {
  setResetPasswordUser(user);
  setNewPassword('');
  setConfirmPassword('');
  setPasswordError('');
  setShowResetPasswordModal(true);
};

// Handle Reset Password
const handleResetPasswordSubmit = async () => {
  // Validate password
  if (!newPassword || newPassword.length < 4) {
    setPasswordError("Password must be at least 4 characters");
    return;
  }
  
  if (newPassword !== confirmPassword) {
    setPasswordError("Passwords do not match");
    return;
  }
  
  setLoading(true);
  setPasswordError('');
  
  try {
    await API.post(`/admin/reset-password/${resetPasswordUser.id}`, { password: newPassword });
    showToastMessage(`Password reset for "${resetPasswordUser.fullName}" successfully`);
    setShowResetPasswordModal(false);
    setResetPasswordUser(null);
    setNewPassword('');
    setConfirmPassword('');
  } catch (e) {
    showToastMessage(e.message, "error");
  } finally {
    setLoading(false);
  }
};

  // Group Management Functions
const fetchGroupManagers = async (groupId) => {
  if (!groupId) return;
  try {
    const response = await API.get(`/groups/${groupId}/managers`);
    setExistingManagers(response.data || []);
    
    // Fetch credentialing records for this group
    await fetchCredentialingRecords(groupId);
  } catch (error) {
    console.error("Error fetching group managers:", error);
    setExistingManagers([]);
  }
};

  const fetchGroupProviders = async (groupId) => {
    if (!groupId) return;
    try {
      const response = await API.get(`/groups/${groupId}/providers`);
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
    } catch (error) {
      console.error("Error fetching available managers:", error);
      setAvailableManagers([]);
    }
  };

  const fetchUnassignedProviders = async () => {
    try {
      const response = await API.get('/providers/unassigned');
      setUnassignedProviders(response.data || []);
    } catch (error) {
      console.error("Error fetching providers:", error);
      setUnassignedProviders([]);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName) {
      showToastMessage("Please enter a group name", "error");
      return;
    }
    setLoading(true);
    try {
      await API.post('/groups/create', { groupName: newGroupName });
      showToastMessage(`Group "${newGroupName}" created successfully`);
      setShowCreateGroupModal(false);
      setNewGroupName("");
      fetchGroups();
    } catch (error) {
      showToastMessage("Failed to create group", "error");
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

  const handleAddProviderToGroup = async () => {
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

  const openAddProviderModal = async () => {
    await fetchUnassignedProviders();
    setShowAddProviderModal(true);
  };

  

  // ==================== HIERARCHICAL VIEW FUNCTIONS ====================

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

const fetchPayorHierarchy = async (groupId, payerName) => {
  if (!groupId || !payerName) return;
  
  setLoading(true);
  try {
    const response = await API.get(`/credentialing/group/${groupId}/payor/${encodeURIComponent(payerName)}/hierarchy`);
    setPayorHierarchy(response.data);
  } catch (error) {
    console.error("Error fetching payor hierarchy:", error);
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

// Helper function to group records by hierarchy
// Helper function to group records by hierarchy
// Helper function to group records by hierarchy - FIXED VERSION
const groupRecordsByHierarchy = (records) => {
  if (!records || records.length === 0) return [];

  // Sort by hierarchy: Payer -> LOB -> Network -> Product -> Plan
  const sorted = [...records].sort((a, b) => {
    const payerCompare = (a.payerName || '').localeCompare(b.payerName || '');
    if (payerCompare !== 0) return payerCompare;
    const lobCompare = (a.lob || '').localeCompare(b.lob || '');
    if (lobCompare !== 0) return lobCompare;
    const networkCompare = (a.network || '').localeCompare(b.network || '');
    if (networkCompare !== 0) return networkCompare;
    const productCompare = (a.product || '').localeCompare(b.product || '');
    if (productCompare !== 0) return productCompare;
    return (a.plan || '').localeCompare(b.plan || '');
  });

  // Build hierarchical structure
  const result = [];
  
  let currentPayer = null;
  let currentPayerGroup = null;
  
  let currentLob = null;
  let currentLobGroup = null;
  
  let currentNetwork = null;
  let currentNetworkGroup = null;
  
  let currentProduct = null;
  let currentProductGroup = null;

  for (const record of sorted) {
    const payer = record.payerName || '';
    const lob = record.lob || '';
    const network = record.network || '';
    const product = record.product || '';

    // === PAYER LEVEL ===
    if (payer !== currentPayer) {
      currentPayer = payer;
      currentPayerGroup = {
        type: 'payer',
        value: payer,
        rowSpan: 0,
        children: []
      };
      result.push(currentPayerGroup);
      
      // Reset all child levels
      currentLob = null;
      currentLobGroup = null;
      currentNetwork = null;
      currentNetworkGroup = null;
      currentProduct = null;
      currentProductGroup = null;
    }

    // === LOB LEVEL ===
    if (lob !== currentLob) {
      currentLob = lob;
      currentLobGroup = {
        type: 'lob',
        value: lob,
        rowSpan: 0,
        children: []
      };
      currentPayerGroup.children.push(currentLobGroup);
      
      // Reset lower levels
      currentNetwork = null;
      currentNetworkGroup = null;
      currentProduct = null;
      currentProductGroup = null;
    }

    // === NETWORK LEVEL ===
    if (network !== currentNetwork) {
      currentNetwork = network;
      currentNetworkGroup = {
        type: 'network',
        value: network,
        rowSpan: 0,
        children: []
      };
      currentLobGroup.children.push(currentNetworkGroup);
      
      // Reset lower levels
      currentProduct = null;
      currentProductGroup = null;
    }

    // === PRODUCT LEVEL ===
    if (product !== currentProduct) {
      currentProduct = product;
      currentProductGroup = {
        type: 'product',
        value: product,
        rowSpan: 0,
        children: []
      };
      currentNetworkGroup.children.push(currentProductGroup);
    }

    // === PLAN LEVEL ===
    currentProductGroup.children.push({
      type: 'plan',
      value: record.plan || '',
      record: record
    });
  }

  // Calculate rowSpans (bottom-up)
  for (const payerGroup of result) {
    let payerRowSpan = 0;
    for (const lobGroup of payerGroup.children) {
      let lobRowSpan = 0;
      for (const networkGroup of lobGroup.children) {
        let networkRowSpan = 0;
        for (const productGroup of networkGroup.children) {
          const planCount = productGroup.children.length;
          productGroup.rowSpan = planCount;
          networkRowSpan += planCount;
          lobRowSpan += planCount;
          payerRowSpan += planCount;
        }
        networkGroup.rowSpan = networkRowSpan;
      }
      lobGroup.rowSpan = lobRowSpan;
    }
    payerGroup.rowSpan = payerRowSpan;
  }

  return result;
};

const toggleExpand = (path) => {
  setExpandedPayors(prev => ({
    ...prev,
    [path]: !prev[path]
  }));
};

  // ==================== API CALLS ====================
  
  const fetchGroups = async () => {
    try {
      const response = await API.get('/groups/admin/all');
      setGroups(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching groups:", error);
      setGroups([]);
    }
  };

  const fetchUsers = async (role) => {
    try {
      const url = role === "ALL" ? "/admin/all-users" : `/admin/all-users?role=${role}`;
      const response = await API.get(url);
      setTeamMembers(Array.isArray(response.data) ? response.data : []);
      setCurrentPage(1);
    } catch (e) {
      showToastMessage("Error: " + e.message, "error");
    }
  };

  const updateDashboardStats = () => {
    setDashboardStats({
      totalProviders: providers.length,
      totalGroups: groups.length,
      totalTeamMembers: teamMembers.filter(m => m.role === "TEAM_MEMBER").length,
      totalTeamLeaders: teamMembers.filter(m => m.role === "TEAM_LEADER").length
    });
  };

  useEffect(() => {
    updateDashboardStats();
  }, [providers, groups, teamMembers]);

  const fetchTeamLeaders = async () => {
    try {
      const response = await API.get('/admin/all-users?role=TEAM_LEADER');
      setTeamLeaders(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching team leaders:", error);
      setTeamLeaders([]);
    }
  };

  const fetchUnassignedTeamMembers = async () => {
    try {
      const response = await API.get('/admin/unassigned-team-members');
      setUnassignedTeamMembers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching unassigned team members:", error);
      setUnassignedTeamMembers([]);
    }
  };

  const fetchProviders = async () => {
    try {
      const response = await API.get('/providers/all');
      setProviders(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching providers:", error);
      setProviders([]);
    }
  };

  const fetchTeamLeaderTaskStats = async () => {
    try {
      const response = await API.get('/admin/team-leader-task-stats');
      setTeamLeaderStats(response.data);
    } catch (error) {
      console.error("Error fetching team leader stats:", error);
    }
  };

  const fetchAllProjects = async () => {
    setLoading(true);
    try {
      const response = await API.get('/admin/projects');
      const projectsList = response.data.projects || [];
      setProjects(projectsList);
      const stats = {
        total: projectsList.length,
        planning: projectsList.filter(p => p.status === 'PLANNING').length,
        inProgress: projectsList.filter(p => p.status === 'IN_PROGRESS').length,
        onHold: projectsList.filter(p => p.status === 'ON_HOLD').length,
        completed: projectsList.filter(p => p.status === 'COMPLETED').length,
        cancelled: projectsList.filter(p => p.status === 'CANCELLED').length,
        avgCompletion: projectsList.length > 0
          ? Math.round(projectsList.reduce((sum, p) => sum + (p.completionPercentage || 0), 0) / projectsList.length)
          : 0
      };
      setProjectStats(stats);
    } catch (error) {
      console.error("Error fetching projects:", error);
      showToastMessage("Failed to load projects", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project => {
    if (statusFilter !== "ALL" && project.status !== statusFilter) return false;
    if (projectSearch && !project.projectName?.toLowerCase().includes(projectSearch.toLowerCase())) return false;
    return true;
  });

  const fetchAllTasks = async () => {
    setLoadingTasks(true);
    try {
      const response = await API.get('/admin/all-tasks');
      setAllTasksList(response.data.tasks || []);
    } catch (error) {
      console.error("Error fetching all tasks:", error);
      setAllTasksList([]);
    } finally {
      setLoadingTasks(false);
    }
  };

  const fetchAssignableUsers = async () => {
    try {
      const response = await API.get('/admin/assignable-users');
      setAssignableUsers(response.data.users || []);
    } catch (error) {
      console.error("Error fetching assignable users:", error);
      setAssignableUsers([]);
    }
  };

  const fetchAvailableTeamLeaders = async () => {
    try {
      const response = await API.get('/groups/available-team-leaders');
      setAvailableTeamLeaders(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching team leaders:", error);
      setAvailableTeamLeaders([]);
    }
  };

  const handleAddAssigneeToProject = async (projectId) => {
  if (!selectedAssigneeId || !selectedProject) {
    showToastMessage("Please select a user to assign", "error");
    return;
  }
  
  setLoading(true);
  try {
    await API.post(`/admin/projects/${projectId}/assignees`, {
      userId: parseInt(selectedAssigneeId)
    });
    showToastMessage("User added to project successfully");
    setShowAddAssigneeModal(false);
    setSelectedAssigneeId('');
    fetchAllProjects();
    
    // Refresh project details if modal is open
    if (selectedProject) {
      const response = await API.get(`/admin/projects/${selectedProject.id}`);
      setSelectedProject(response.data);
    }
  } catch (error) {
    console.error("Error adding assignee:", error);
    showToastMessage(error.response?.data?.error || "Failed to add user", "error");
  } finally {
    setLoading(false);
  }
};

  const handleAssignTeamLeaderToGroup = async () => {
    if (!selectedTeamLeaderId) {
      showToastMessage("Please select a Team Leader", "error");
      return;
    }
    setLoading(true);
    try {
      await API.post(`/groups/${selectedGroupId}/assign-team-leader?teamLeaderId=${selectedTeamLeaderId}`);
      showToastMessage("Team Leader assigned successfully");
      setShowAssignTeamLeaderModal(false);
      setSelectedTeamLeaderId("");
      fetchGroups();
      if (selectedGroupId) {
        fetchGroupManagers(selectedGroupId);
      }
    } catch (error) {
      showToastMessage(error.response?.data?.error || "Failed to assign Team Leader", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTeamLeaderFromGroup = async () => {
    if (!window.confirm(`Are you sure you want to remove the Team Leader from "${selectedGroupName}"?`)) return;
    setLoading(true);
    try {
      await API.delete(`/groups/${selectedGroupId}/remove-team-leader`);
      showToastMessage("Team Leader removed from group");
      fetchGroups();
      if (selectedGroupId) {
        fetchGroupManagers(selectedGroupId);
      }
    } catch (error) {
      showToastMessage(error.response?.data?.error || "Failed to remove Team Leader", "error");
    } finally {
      setLoading(false);
    }
  };

  // ==================== CRUD OPERATIONS ====================
  
  const handleCreateTeamLeader = async () => {
    if (!leadingDepartment) {
      showToastMessage("Please select a department for the Team Leader", "error");
      return;
    }
    setLoading(true);
    try {
      const response = await API.post('/admin/create-team-leader', {
        username, password, fullName, email, phoneNumber,
        department, leadingDepartment
      });
      showToastMessage(`Team Leader "${response.data?.fullName || username}" created for ${response.data?.leadingDepartment} department`);
      clearForm();
      fetchUsers(filterRole);
      fetchTeamLeaders();
    } catch (e) {
      showToastMessage(e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeamMember = async () => {
    setLoading(true);
    try {
      await API.post('/admin/create-user', {
        username, password, role: "TEAM_MEMBER",
        fullName, email, phoneNumber, department, specialty
      });
      showToastMessage(`Team member "${username}" created`);
      clearForm();
      fetchUsers(filterRole);
      fetchUnassignedTeamMembers();
    } catch (e) {
      showToastMessage(e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProvider = async () => {
    setLoading(true);
    try {
      await API.post('/providers/create', {
        username, password, fullName, email, phoneNumber, specialty
      });
      showToastMessage("Provider created");
      clearForm();
      fetchProviders();
    } catch (e) {
      showToastMessage(e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTeamMembers = async () => {
    if (selectedTeamLeaders.length === 0 || selectedTeamMembers.length === 0) {
      showToastMessage("Please select at least one Team Leader and one Team Member", "error");
      return;
    }
    setLoading(true);
    let successCount = 0;
    for (const leader of selectedTeamLeaders) {
      for (const member of selectedTeamMembers) {
        try {
          await API.post('/admin/assign-team-member-to-leader', {
            teamLeaderId: leader.id,
            teamMemberId: member.id
          });
          successCount++;
        } catch (error) {
          console.error("Assignment failed:", error);
        }
      }
    }
    showToastMessage(`Successfully assigned ${successCount} team member(s)`);
    setSelectedTeamLeaders([]);
    setSelectedTeamMembers([]);
    setSearchTeamLeaderTerm("");
    setSearchTeamMemberTerm("");
    fetchUnassignedTeamMembers();
    fetchUsers("ALL");
    setLoading(false);
  };

  const handleAssignTask = async () => {
    if (selectedTaskAssignees.length === 0) {
      showToastMessage("Please select at least one assignee", "error");
      return;
    }
    if (!taskTitle.trim()) {
      showToastMessage("Please enter a task title", "error");
      return;
    }
    setLoading(true);
    let successCount = 0;
    for (const assignee of selectedTaskAssignees) {
      try {
        await API.post('/admin/assign-task', {
          userId: assignee.id,
          title: taskTitle,
          description: taskDescription,
          priority: taskPriority,
          dueDate: taskDueDate,
          relatedProviderId: taskRelatedProvider || null
        });
        successCount++;
      } catch (error) {
        console.error("Error assigning task:", error);
      }
    }
    if (successCount > 0) {
      showToastMessage(`Task assigned to ${successCount} user(s) successfully`);
      await fetchTeamLeaderTaskStats();
      await fetchAllTasks();
      setTaskTitle("");
      setTaskDescription("");
      setTaskPriority("MEDIUM");
      setTaskDueDate("");
      setTaskRelatedProvider("");
      setSelectedTaskAssignees([]);
      setSearchTaskAssigneeTerm("");
    }
    setLoading(false);
  };

  const fetchAllUsersActivity = async () => {
    setLoadingActivity(true);
    try {
      const response = await API.get(`/activity/admin/all-users?date=${activityDate}`);
      if (response.data && response.data.users) {
        setActivityData(response.data.users);
        const totalUsers = response.data.users.length;
        const activeUsers = response.data.users.filter(u => u.activeMinutes > 0).length;
        const totalHours = response.data.users.reduce((sum, u) => sum + (u.activeMinutes / 60), 0);
        const avgHours = totalUsers > 0 ? (totalHours / totalUsers).toFixed(1) : 0;
        const completedUsers = response.data.users.filter(u => u.remainingMinutes <= 0).length;
        const complianceRate = totalUsers > 0 ? Math.round((completedUsers / totalUsers) * 100) : 0;
        setActivityStats({ totalUsers, activeUsers, avgHours, complianceRate });
      } else {
        setActivityData([]);
      }
    } catch (error) {
      console.error("Error fetching activity data:", error);
      setActivityData([]);
    } finally {
      setLoadingActivity(false);
    }
  };

  useEffect(() => {
    if (activeView === "ACTIVITY") {
      fetchAllUsersActivity();
    }
  }, [activeView, activityDate]);

  // ==================== PAGINATION ====================
  
  const filteredUsers = teamMembers.filter(m => {
    if (!search) return true;
    const q = search.toLowerCase();
    return m.fullName?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.role?.toLowerCase().includes(q);
  });

  const filteredTasks = allTasksList.filter(task => {
    if (taskSearch && !task.title?.toLowerCase().includes(taskSearch.toLowerCase()) &&
      !task.assignedTo?.toLowerCase().includes(taskSearch.toLowerCase())) {
      return false;
    }
    if (taskStatusFilter !== "ALL" && task.status !== taskStatusFilter) {
      return false;
    }
    if (taskRoleFilter !== "ALL") {
      if (taskRoleFilter === "TEAM_LEADER" && task.assignedToRole !== "TEAM_LEADER") return false;
      if (taskRoleFilter === "TEAM_MEMBER" && task.assignedToRole !== "TEAM_MEMBER") return false;
    }
    return true;
  });


const fetchAssignableUsersForProject = async () => {
  try {
    const response = await API.get('/admin/assignable-users');
    setAssignableUsersForProject(response.data.users || []);
  } catch (error) {
    console.error("Error fetching assignable users:", error);
    setAssignableUsersForProject([]);
  }
};

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const goToPage = (pageNumber) => setCurrentPage(pageNumber);
  const goToNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const goToPrevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

  // ==================== INITIAL DATA LOAD ====================
  
  useEffect(() => {
    fetchProviders();
    fetchGroups();
    fetchUsers("ALL");
    fetchTeamLeaders();
    fetchUnassignedTeamMembers();
    fetchTeamLeaderTaskStats();
    fetchAllTasks();
    fetchAllProjects();
    fetchAssignableUsers();
    fetchAssignableUsersForProject();
  }, []);

  useEffect(() => {
    if (activeView === "ALL_USERS") fetchUsers(filterRole);
  }, [activeView, filterRole]);

  const storedName = localStorage.getItem("fullName") || "Admin";

  // ==================== RENDER COMPONENTS ====================
  
  const renderPagination = () => (
    <div className="pagination-container">
      <button className="pagination-btn" onClick={goToPrevPage} disabled={currentPage === 1}>
        <i className="fas fa-chevron-left"></i> Previous
      </button>
      <div className="pagination-pages">
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNum;
          if (totalPages <= 5) {
            pageNum = i + 1;
          } else if (currentPage <= 3) {
            pageNum = i + 1;
          } else if (currentPage >= totalPages - 2) {
            pageNum = totalPages - 4 + i;
          } else {
            pageNum = currentPage - 2 + i;
          }
          return (
            <button key={pageNum} className={`pagination-page ${currentPage === pageNum ? "active" : ""}`} onClick={() => goToPage(pageNum)}>
              {pageNum}
            </button>
          );
        })}
      </div>
      <button className="pagination-btn" onClick={goToNextPage} disabled={currentPage === totalPages || totalPages === 0}>
        Next <i className="fas fa-chevron-right"></i>
      </button>
    </div>
  );

  const renderEnhancedPicker = ({
    items,
    selectedItems,
    onSelectionChange,
    searchTerm,
    onSearchChange,
    showPicker,
    setShowPicker,
    placeholder,
    labelKey = "fullName",
    subKey = "email"
  }) => {
    const filteredItems = items.filter(item => {
      if (!searchTerm.trim()) return true;
      return item[labelKey]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item[subKey]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.department && item.department.toLowerCase().includes(searchTerm.toLowerCase()));
    });

    return (
      <div className="enhanced-picker">
        <div className="picker-input-wrapper">
          <i className="fas fa-search" style={{ marginLeft: '12px', color: 'var(--text-light)' }}></i>
          <input
            type="text"
            className="picker-input"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setShowPicker(true)}
          />
          <button className="picker-toggle" onClick={() => setShowPicker(!showPicker)}>
            <i className={`fas fa-chevron-${showPicker ? 'up' : 'down'}`}></i>
          </button>
        </div>

        {showPicker && (
          <div className="picker-dropdown">
            <div className="picker-header">
              <label className="picker-checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedItems.length === items.length && items.length > 0}
                  onChange={(e) => onSelectionChange(e.target.checked ? [...items] : [])}
                />
                Select All ({items.length})
              </label>
              <span className="selected-count">
                <i className="fas fa-check-circle"></i> {selectedItems.length} selected
              </span>
            </div>
            <div className="picker-options">
              {filteredItems.length === 0 ? (
                <div className="picker-empty">
                  <i className="fas fa-info-circle"></i> No {placeholder.toLowerCase()} found
                </div>
              ) : (
                filteredItems.map(item => (
                  <label key={item.id} className="picker-option">
                    <input
                      type="checkbox"
                      checked={selectedItems.some(s => s.id === item.id)}
                      onChange={(e) => onSelectionChange(
                        e.target.checked
                          ? [...selectedItems, item]
                          : selectedItems.filter(s => s.id !== item.id)
                      )}
                    />
                    <div className="picker-option-info">
                      <span className="option-name">
                        <i className="fas fa-user"></i> {item[labelKey]}
                      </span>
                      <span className="option-sub">
                        <i className="fas fa-envelope"></i> {item[subKey]}
                      </span>
                      {item.department && (
                        <span className="option-dept">
                          <i className="fas fa-building"></i> {item.department}
                        </span>
                      )}
                      {item.leadingDepartment && (
                        <span className="option-dept">
                          <i className="fas fa-chart-line"></i> Leads: {item.leadingDepartment}
                        </span>
                      )}
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>
        )}

      

        {selectedItems.length > 0 && (
          <div className="selected-badges">
            {selectedItems.map(item => (
              <span key={item.id} className="selected-badge">
                <i className="fas fa-user-check"></i> {item[labelKey]}
                <button onClick={() => onSelectionChange(selectedItems.filter(s => s.id !== item.id))}>
                  <i className="fas fa-times"></i>
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  

  // ==================== MAIN RETURN ====================
  
  return (
    <div className="ad-root">
      {/* Sidebar */}
      <aside className="ad-sidebar">
        <div className="ad-logo-row">
          <div className="ad-logo-mark">{storedName.charAt(0).toUpperCase()}</div>
          <span className="ad-logo-text">{storedName}</span>
        </div>
        <nav className="ad-nav">
          <div className="ad-nav-section">
            <span className="ad-nav-section-label">Main Menu</span>
            <button className={`ad-nav-btn ${activeView === 'DASHBOARD' ? 'ad-nav-active' : ''}`} onClick={() => setActiveView('DASHBOARD')}>
              <i className="fas fa-chart-pie"></i> Dashboard
            </button>
            <button className={`ad-nav-btn ${activeView === 'ALL_USERS' ? 'ad-nav-active' : ''}`} onClick={() => setActiveView('ALL_USERS')}>
              <i className="fas fa-users"></i> All Users
            </button>
            <button className={`ad-nav-btn ${activeView === 'ACTIVITY' ? 'ad-nav-active' : ''}`} onClick={() => setActiveView('ACTIVITY')}>
              <i className="fas fa-chart-line"></i> User Activity
            </button>
            <button className={`ad-nav-btn ${activeView === 'ALL_TASKS' ? 'ad-nav-active' : ''}`} onClick={() => setActiveView('ALL_TASKS')}>
              <i className="fas fa-tasks"></i> All Tasks
            </button>
            <button className={`ad-nav-btn ${activeView === 'PROJECTS' ? 'ad-nav-active' : ''}`} onClick={() => { setActiveView('PROJECTS'); fetchAllProjects(); }}>
              <i className="fas fa-project-diagram"></i> Projects
              <span className="badge">{projectStats.total}</span>
            </button>
            <button className={`ad-nav-btn ${activeView === 'GROUP_MANAGEMENT' ? 'ad-nav-active' : ''}`} onClick={() => setActiveView('GROUP_MANAGEMENT')}>
              <i className="fas fa-layer-group"></i> Group Management
            </button>
            <button className={`ad-nav-btn ${activeView === 'ASSIGN_TEAM' ? 'ad-nav-active' : ''}`} onClick={() => setActiveView('ASSIGN_TEAM')}>
              <i className="fas fa-user-plus"></i> Assign Team Member to Leader
            </button>
            <button className={`ad-nav-btn ${activeView === 'ASSIGN_TASKS' ? 'ad-nav-active' : ''}`} onClick={() => setActiveView('ASSIGN_TASKS')}>
              <i className="fas fa-tasks"></i> Assign Tasks to Team Leaders
            </button>
            <button
  className={`ad-nav-btn ${activeView === 'CREATE_TASK' ? 'ad-nav-active' : ''}`}
  onClick={() => setShowCreateTaskModal(true)}
>
  <i className="fas fa-plus-square"></i> Create Task
</button>
            <button className={`ad-nav-btn ${activeView === 'TASK_STATS' ? 'ad-nav-active' : ''}`} onClick={() => setActiveView('TASK_STATS')}>
              <i className="fas fa-chart-bar"></i> Team Leader Task Statistics
            </button>
          </div>
          <div className="ad-nav-section">
            <span className="ad-nav-section-label">Create</span>
            <button className={`ad-nav-btn ${activeView === 'TEAM_MEMBER' ? 'ad-nav-active' : ''}`} onClick={() => setActiveView('TEAM_MEMBER')}>
              <i className="fas fa-user-plus"></i> Add Team Member
            </button>
            <button className={`ad-nav-btn ${activeView === 'PROVIDER' ? 'ad-nav-active' : ''}`} onClick={() => setActiveView('PROVIDER')}>
              <i className="fas fa-user-md"></i> Add Provider
            </button>
            <button className={`ad-nav-btn ${activeView === 'TEAM_LEADER' ? 'ad-nav-active' : ''}`} onClick={() => setActiveView('TEAM_LEADER')}>
              <i className="fas fa-user-tie"></i> Create Team Leader
            </button>
          </div>
        </nav>
        <div className="ad-sidebar-bottom">
          <div className="ad-user-row">
            <div className="ad-user-ava">{storedName.charAt(0).toUpperCase()}</div>
            <div className="ad-user-info">
              <span className="ad-user-name">{storedName}</span>
              <span className="ad-user-role">Administrator</span>
            </div>
          </div>
          <button className="ad-signout" onClick={() => { localStorage.clear(); window.location.href = "/login"; }}>
            <i className="fas fa-sign-out-alt"></i> Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ad-main-wrap">
        <header className="ad-header">
          <div>
            <h1 className="ad-header-title">{({ DASHBOARD: "Dashboard", ALL_USERS: "All Users", ASSIGN_TEAM: "Assign Team Member to Team Leader", ASSIGN_TASKS: "Assign Tasks to Team Leaders", TASK_STATS: "Team Leader Task Statistics", ALL_TASKS: "All Tasks", PROJECTS: "Projects", TEAM_MEMBER: "Add Team Member", PROVIDER: "Add Provider", TEAM_LEADER: "Create Team Leader", ACTIVITY: "User Activity", GROUP_MANAGEMENT: "Group Management" })[activeView]}</h1>
            <p className="ad-header-sub">{({ DASHBOARD: "Overview of your workspace", ALL_USERS: "View and manage all accounts", ASSIGN_TEAM: "Bulk assign team members to team leaders", ASSIGN_TASKS: "Create and assign tasks to multiple team leaders", TASK_STATS: "View task completion statistics for all team leaders", ALL_TASKS: "View all tasks, comments, and time logs", PROJECTS: "View and manage all projects across the organization", TEAM_MEMBER: "Create a new team member", PROVIDER: "Create a provider account", TEAM_LEADER: "Create a department team leader", ACTIVITY: "Track team member activity and working hours", GROUP_MANAGEMENT: "Create and manage practice groups" })[activeView]}</p>
          </div>
        </header>

        <div className="ad-content-area">

          {/* DASHBOARD VIEW */}
          {activeView === "DASHBOARD" && (
            <div>
              <div className="ad-stats-row">
                {[
                  { label: "Total Providers", value: dashboardStats.totalProviders, color: "blue" },
                  { label: "Practice Groups", value: dashboardStats.totalGroups, color: "indigo" },
                  { label: "Team Members", value: dashboardStats.totalTeamMembers, color: "sky" },
                  { label: "Team Leaders", value: dashboardStats.totalTeamLeaders, color: "violet" },
                ].map(s => (
                  <div key={s.label} className={`ad-stat ad-stat-${s.color}`}>
                    <span className="ad-stat-num">{s.value}</span>
                    <span className="ad-stat-lbl">{s.label}</span>
                  </div>
                ))}
              </div>
              <div className="ad-dash-grid">
                <div className="ad-dash-card">
                  <h3 className="ad-dash-card-title">Quick Actions</h3>
                  <div className="ad-quick-actions">
                    <button className="ad-quick-row-btn" onClick={() => setActiveView("TEAM_MEMBER")}>
                      <span className="ad-quick-tag qt-team"><i className="fas fa-user-plus"></i> Team</span>
                      <span className="ad-quick-label">Add Team Member</span>
                    </button>
                    <button className="ad-quick-row-btn" onClick={() => setActiveView("PROVIDER")}>
                      <span className="ad-quick-tag qt-provider"><i className="fas fa-user-md"></i> Provider</span>
                      <span className="ad-quick-label">Add Provider</span>
                    </button>
                    <button className="ad-quick-row-btn" onClick={() => setActiveView("TEAM_LEADER")}>
                      <span className="ad-quick-tag qt-leader"><i className="fas fa-user-tie"></i> Leader</span>
                      <span className="ad-quick-label">Create Team Leader</span>
                    </button>
                  </div>
                </div>
                <div className="ad-dash-card">
                  <h3 className="ad-dash-card-title">Practice Groups</h3>
                  {groups.length === 0 ? <p className="ad-empty-note">No groups yet</p> : (
                    <table className="ad-table">
                      <thead>
                        <tr><th>Group</th><th>Manager</th><th>Providers</th></tr>
                      </thead>
                      <tbody>
                        {groups.slice(0, 6).map(g => (
                          <tr key={g.groupId}>
                            <td><strong>{g.groupName}</strong></td>
                            <td className="td-muted">{g.managerName}</td>
                            <td className="td-muted">{g.providerCount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ACTIVITY VIEW */}
          {activeView === "ACTIVITY" && (
            <div className="activity-container">
              <div className="activity-date-bar">
                <div className="date-selector">
                  <label>Select Date:</label>
                  <input
                    type="date"
                    value={activityDate}
                    onChange={(e) => setActivityDate(e.target.value)}
                    className="ad-field-inp"
                    style={{ width: '200px' }}
                  />
                  <button onClick={fetchAllUsersActivity} className="ad-btn ad-btn-blue" disabled={loadingActivity}>
                    {loadingActivity ? <><i className="fas fa-spinner fa-spin"></i> Loading...</> : <><i className="fas fa-sync-alt"></i> Refresh</>}
                  </button>
                </div>
                <div className="date-navigation">
                  <button className="ad-btn" onClick={() => {
                    const date = new Date(activityDate);
                    date.setDate(date.getDate() - 1);
                    setActivityDate(date.toISOString().split('T')[0]);
                  }}>
                    <i className="fas fa-chevron-left"></i> Previous Day
                  </button>
                  <button className="ad-btn" onClick={() => setActivityDate(new Date().toISOString().split('T')[0])}>
                    <i className="fas fa-calendar-day"></i> Today
                  </button>
                  <button className="ad-btn" onClick={() => {
                    const date = new Date(activityDate);
                    date.setDate(date.getDate() + 1);
                    setActivityDate(date.toISOString().split('T')[0]);
                  }}>
                    Next Day <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              </div>

              <div className="activity-stats-grid">
                <div className="activity-stat-card" style={{ borderTopColor: '#3b82f6' }}>
                  <div className="stat-icon"><i className="fas fa-users"></i></div>
                  <div className="stat-info">
                    <span className="stat-value">{activityStats.totalUsers}</span>
                    <span className="stat-label">Total Users Tracked</span>
                  </div>
                </div>
                <div className="activity-stat-card" style={{ borderTopColor: '#10b981' }}>
                  <div className="stat-icon"><i className="fas fa-circle" style={{ color: '#10b981' }}></i></div>
                  <div className="stat-info">
                    <span className="stat-value">{activityStats.activeUsers}</span>
                    <span className="stat-label">Active Today</span>
                  </div>
                </div>
                <div className="activity-stat-card" style={{ borderTopColor: '#f59e0b' }}>
                  <div className="stat-icon"><i className="fas fa-clock"></i></div>
                  <div className="stat-info">
                    <span className="stat-value">{activityStats.avgHours}h</span>
                    <span className="stat-label">Average Hours</span>
                  </div>
                </div>
                <div className="activity-stat-card" style={{ borderTopColor: '#8b5cf6' }}>
                  <div className="stat-icon"><i className="fas fa-check-circle"></i></div>
                  <div className="stat-info">
                    <span className="stat-value">{activityStats.complianceRate}%</span>
                    <span className="stat-label">Compliance Rate</span>
                  </div>
                </div>
              </div>

              <div className="ad-dash-card">
                <h3 className="ad-dash-card-title">Team Member Activity - {new Date(activityDate).toLocaleDateString()}</h3>
                {loadingActivity ? (
                  <div className="loading-state"><i className="fas fa-spinner fa-spin"></i> Loading activity data...</div>
                ) : activityData.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon"><i className="fas fa-chart-bar"></i></div>
                    <p>No activity data available for this date</p>
                    <p className="empty-sub">Activity tracking starts when team members log in</p>
                  </div>
                ) : (
                  <div className="ad-table-wrap">
                    <table className="ad-table">
                      <thead>
                        <tr>
                          <th>Team Member</th>
                          <th>Role</th>
                          <th>Active Hours</th>
                          <th>Idle Time</th>
                          <th>Break Time</th>
                          <th>Away Time</th>
                          <th>Total at Desk</th>
                          <th>Status</th>
                          <th>Remaining</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activityData.map(user => {
                          const totalDeskMinutes = user.activeMinutes + user.idleMinutes + user.breakMinutes + user.awayMinutes;
                          const remainingHours = Math.floor(user.remainingMinutes / 60);
                          const remainingMins = user.remainingMinutes % 60;
                          const isCompleted = user.remainingMinutes <= 0;
                          return (
                            <tr key={user.userId}>
                              <td>
                                <div className="td-name-wrap">
                                  <div className="td-avatar">{user.userName?.charAt(0) || "?"}</div>
                                  <div>
                                    <div className="td-name">{user.userName}</div>
                                    <div className="td-sub">{user.userEmail || ""}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="td-muted">
                                <span className={`role-badge role-${user.userRole?.toLowerCase()}`}>
                                  {user.userRole?.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="td-active">
                                <span className="active-hours">{(user.activeMinutes / 60).toFixed(1)}h</span>
                                <div className="progress-bar-small">
                                  <div className="progress-fill" style={{ width: `${Math.min(100, (user.activeMinutes / 480) * 100)}%` }} />
                                </div>
                              </td>
                              <td className="td-muted">{(user.idleMinutes / 60).toFixed(1)}h</td>
                              <td className="td-muted">{(user.breakMinutes / 60).toFixed(1)}h</td>
                              <td className="td-muted">{(user.awayMinutes / 60).toFixed(1)}h</td>
                              <td className="td-muted">{(totalDeskMinutes / 60).toFixed(1)}h</td>
                              <td className="td-status">
                                <span className={`activity-status ${isCompleted ? 'completed' : 'in-progress'}`}>
                                  {isCompleted ? <><i className="fas fa-check-circle"></i> Completed</> : <><i className="fas fa-hourglass-half"></i> In Progress</>}
                                </span>
                              </td>
                              <td className="td-remaining">
                                {isCompleted ? (
                                  <span className="completed-text">Goal Met! <i className="fas fa-trophy"></i></span>
                                ) : (
                                  <span className="remaining-text">{remainingHours}h {remainingMins}m remaining</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
                {activityData.length > 0 && (
                  <div className="activity-summary-footer">
                    <div className="summary-item">
                      <span className="summary-label"><i className="fas fa-chart-bar"></i> Total Active Hours:</span>
                      <span className="summary-value">{activityData.reduce((sum, u) => sum + (u.activeMinutes / 60), 0).toFixed(1)} hours</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label"><i className="fas fa-check-circle"></i> Completed 8 Hours:</span>
                      <span className="summary-value">{activityData.filter(u => u.remainingMinutes <= 0).length} / {activityData.length} users</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label"><i className="fas fa-calendar"></i> Date:</span>
                      <span className="summary-value">{new Date(activityDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ALL USERS VIEW */}
          {activeView === "ALL_USERS" && (
            <div className="ad-table-section">
              <div className="ad-table-meta">
                <div className="ad-search-box">
                  <i className="fas fa-search"></i>
                  <input className="ad-search-input" placeholder="Search by name, email or role..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="ad-role-filters">
                  {["ALL", "TEAM_MEMBER", "PROVIDER", "ADMIN", "TEAM_LEADER"].map(r => (
                    <button key={r} className={`ad-rf-pill ${filterRole === r ? "ad-rf-active" : ""}`} onClick={() => setFilterRole(r)}>
                      {r === "ALL" ? "All" : r.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>
              <div className="ad-table-wrap">
                <table className="ad-table ad-main-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Department</th>
                      <th>Leading</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentUsers.map(user => (
                      <tr key={user.id}>
                        <td>
                          <div className="td-name-wrap">
                            <div className="td-avatar">{user.fullName?.charAt(0)?.toUpperCase() || "?"}</div>
                            <div>
                              <div className="td-name">{user.fullName || "—"}</div>
                              <div className="td-sub">{user.username}</div>
                            </div>
                          </div>
                        </td>
                        <td className="td-muted">{user.email || "—"}</td>
                        <td><span className={`ad-role-chip rc-${(user.role || "").toLowerCase()}`}>{(user.role || "").replace("_", " ")}</span></td>
                        <td className="td-muted">{user.department || "—"}</td>
                        <td className="td-muted">{user.leadingDepartment || "—"}</td>
                        <td>
                          <span className={`ad-status-chip ${user.status === "Active" ? "sc-active" : "sc-inactive"}`}>
                            <span className="sc-dot" />{user.status || "—"}
                          </span>
                        </td>
                        <td className="td-muted">
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              className="action-btn edit-btn"
                              onClick={() => openEditUserModal(user)}
                              style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              <i className="fas fa-edit"></i> Edit
                            </button>
                            <button
                              className="action-btn delete-btn"
                              onClick={() => handleDeleteUser(user.id, user.fullName)}
                              style={{ background: '#dc2626', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              <i className="fas fa-trash-alt"></i> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {renderPagination()}
              <div className="pagination-info">
                Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} entries
              </div>
            </div>
          )}

          {/* Edit User Modal */}
          {showEditModal && editingUser && (
            <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
              <div className="modal-content edit-user-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>Edit User: {editingUser.fullName || editingUser.username}</h3>
                  <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
                </div>
                <div className="modal-body">
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Full Name *</label>
                      <input type="text" name="fullName" value={editFormData.fullName} onChange={handleEditInputChange} className="ad-field-inp" />
                    </div>
                    <div className="form-group">
                      <label>Email *</label>
                      <input type="email" name="email" value={editFormData.email} onChange={handleEditInputChange} className="ad-field-inp" />
                    </div>
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input type="text" name="phoneNumber" value={editFormData.phoneNumber} onChange={handleEditInputChange} className="ad-field-inp" />
                    </div>
                    <div className="form-group">
                      <label>Department</label>
                      <select name="department" value={editFormData.department} onChange={handleEditInputChange} className="ad-field-inp">
                        <option value="">Select Department</option>
                        <option value="Charge Entry">Charge Entry</option>
                        <option value="Posting">Posting</option>
                        <option value="Accounts Receivable">Accounts Receivable</option>
                        <option value="Credentialing">Credentialing</option>
                      </select>
                    </div>
                    {editingUser.role === "TEAM_LEADER" && (
                      <div className="form-group">
                        <label>Leading Department</label>
                        <select name="leadingDepartment" value={editFormData.leadingDepartment} onChange={handleEditInputChange} className="ad-field-inp">
                          <option value="">Select Department to Lead</option>
                          <option value="Charge Entry">Charge Entry Team</option>
                          <option value="Posting">Posting Team</option>
                          <option value="Accounts Receivable">Accounts Receivable Team</option>
                          <option value="Credentialing">Credentialing Team</option>
                        </select>
                      </div>
                    )}
                    {editingUser.role === "PROVIDER" && (
                      <div className="form-group">
                        <label>Specialty</label>
                        <input type="text" name="specialty" value={editFormData.specialty} onChange={handleEditInputChange} className="ad-field-inp" />
                      </div>
                    )}
                  </div>
                  <div className="form-actions" style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button 
  className="ad-btn" 
  onClick={() => openResetPasswordModal(editingUser)} 
  style={{ background: '#f59e0b', color: 'white' }}
>
  <i className="fas fa-key"></i> Reset Password
</button>
                    <button className="ad-btn" onClick={() => setShowEditModal(false)}>Cancel</button>
                    <button className="ad-btn ad-btn-blue" onClick={handleUpdateUser} disabled={loading}>
                      {loading ? <><i className="fas fa-spinner fa-spin"></i> Saving...</> : "Save Changes"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reset Password Modal */}
{showResetPasswordModal && resetPasswordUser && (
  <div className="modal-overlay" onClick={() => setShowResetPasswordModal(false)}>
    <div className="modal-content reset-password-modal" onClick={e => e.stopPropagation()}>
      <div className="modal-header">
        <h3>
          <i className="fas fa-key" style={{ color: '#f59e0b' }}></i> 
          Reset Password for {resetPasswordUser.fullName || resetPasswordUser.username}
        </h3>
        <button className="modal-close" onClick={() => setShowResetPasswordModal(false)}>×</button>
      </div>
      
      <div className="modal-body">
        <div className="reset-password-info">
          <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '16px' }}>
            Enter a new password for <strong>{resetPasswordUser.fullName}</strong>. 
            The password must be at least 4 characters long.
          </p>
        </div>
        
        <div className="form-grid">
          <div className="form-group full-width">
            <label>New Password *</label>
            <input 
              type="password" 
              className="ad-field-inp" 
              value={newPassword} 
              onChange={(e) => {
                setNewPassword(e.target.value);
                setPasswordError('');
              }}
              placeholder="Enter new password (min 4 characters)"
              autoFocus
            />
          </div>
          
          <div className="form-group full-width">
            <label>Confirm Password *</label>
            <input 
              type="password" 
              className="ad-field-inp" 
              value={confirmPassword} 
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setPasswordError('');
              }}
              placeholder="Confirm new password"
            />
          </div>
          
          {passwordError && (
            <div className="form-group full-width" style={{ marginTop: '-8px' }}>
              <span style={{ color: '#dc2626', fontSize: '13px' }}>
                <i className="fas fa-exclamation-circle"></i> {passwordError}
              </span>
            </div>
          )}
          
          <div className="form-group full-width">
            <div style={{ 
              background: '#fef3c7', 
              padding: '10px 14px', 
              borderRadius: '6px',
              fontSize: '13px',
              color: '#92400e',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px'
            }}>
              <i className="fas fa-info-circle" style={{ marginTop: '2px' }}></i>
              <div>
                <strong>Note:</strong> The user will need to use this new password to log in. 
                Please share the new password securely with the user.
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="modal-footer">
        <button className="ad-btn" onClick={() => setShowResetPasswordModal(false)}>Cancel</button>
        <button 
          className="ad-btn" 
          onClick={handleResetPasswordSubmit} 
          disabled={loading || !newPassword || !confirmPassword}
          style={{ 
            background: '#f59e0b', 
            color: 'white',
            border: 'none',
            padding: '8px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          {loading ? (
            <><i className="fas fa-spinner fa-spin"></i> Resetting...</>
          ) : (
            <><i className="fas fa-save"></i> Reset Password</>
          )}
        </button>
      </div>
    </div>
  </div>
)}

          {/* ALL TASKS VIEW */}
          {activeView === "ALL_TASKS" && (
            <div className="all-tasks-container">
              <div className="ad-dash-card">
                <h3 className="ad-dash-card-title">All Tasks</h3>
                <div className="all-tasks-filters">
                  <div className="filter-group">
                    <i className="fas fa-search"></i>
                    <input
                      type="text"
                      placeholder="Search by title or assignee..."
                      className="ad-field-inp"
                      value={taskSearch}
                      onChange={(e) => setTaskSearch(e.target.value)}
                    />
                  </div>
                  <div className="filter-group">
                    <select className="ad-field-inp" value={taskStatusFilter} onChange={(e) => setTaskStatusFilter(e.target.value)}>
                      <option value="ALL">All Status</option>
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="IN_REVIEW">In Review</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="BLOCKED">Blocked</option>
                    </select>
                  </div>
                  <div className="filter-group">
                    <select className="ad-field-inp" value={taskRoleFilter} onChange={(e) => setTaskRoleFilter(e.target.value)}>
                      <option value="ALL">All Assignees</option>
                      <option value="TEAM_LEADER">Team Leaders</option>
                      <option value="TEAM_MEMBER">Team Members</option>
                    </select>
                  </div>
                </div>
                <div className="all-tasks-list">
                  {loadingTasks ? (
                    <div className="loading-state"><i className="fas fa-spinner fa-spin"></i> Loading tasks...</div>
                  ) : filteredTasks.length === 0 ? (
                    <div className="empty-state">No tasks found</div>
                  ) : (
                    filteredTasks.map(task => (
                      <div key={task.id} className="task-detail-card" onClick={() => setSelectedTaskForView(task)}>
                        <div className="task-detail-header">
                          <div className="task-title-section">
                            <h4>{task.title}</h4>
                            <span className={`task-status-badge ${getStatusBadgeClass(task.status)}`}>
                              {task.status?.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="task-meta">
                            <span className="task-priority">{getPriorityIcon(task.priority)} {task.priority}</span>
                            <span className="task-assignee"><i className="fas fa-user"></i> {task.assignedTo}</span>
                            <span className="task-date"><i className="fas fa-calendar"></i> {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</span>
                          </div>
                        </div>
                        <div className="task-detail-body">
                          <p>{task.description}</p>
                        </div>
                        <div className="task-detail-footer">
                          <div className="task-comments-preview">
                            <i className="fas fa-comment"></i> {task.comments?.length || 0} comments
                          </div>
                          <div className="task-time-preview">
                            <i className="fas fa-clock"></i> {task.timeLogs?.reduce((sum, log) => sum + log.hoursSpent, 0) || 0} hours logged
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {selectedTaskForView && (
                <div className="modal-overlay" onClick={() => setSelectedTaskForView(null)}>
                  <div className="task-modal-large" onClick={e => e.stopPropagation()}>
                    <div className="task-modal-header">
                      <h2>{selectedTaskForView.title}</h2>
                      <button className="modal-close" onClick={() => setSelectedTaskForView(null)}>×</button>
                    </div>
                    <div className="task-modal-body">
                      <div className="task-info-grid">
                        <div><strong>Status:</strong> <span className={`status-badge ${getStatusBadgeClass(selectedTaskForView.status)}`}>{selectedTaskForView.status?.replace('_', ' ')}</span></div>
                        <div><strong>Priority:</strong> {getPriorityIcon(selectedTaskForView.priority)} {selectedTaskForView.priority}</div>
                        <div><strong>Assigned To:</strong> {selectedTaskForView.assignedTo}</div>
                        <div><strong>Due Date:</strong> {selectedTaskForView.dueDate ? new Date(selectedTaskForView.dueDate).toLocaleDateString() : 'No due date'}</div>
                        <div><strong>Created:</strong> {selectedTaskForView.createdAt ? new Date(selectedTaskForView.createdAt).toLocaleString() : 'N/A'}</div>
                        <div className="full-width"><strong>Description:</strong> {selectedTaskForView.description}</div>
                      </div>
                      <div className="task-comments-section">
                        <h4><i className="fas fa-comments"></i> Comments ({selectedTaskForView.comments?.length || 0})</h4>
                        <div className="comments-list">
                          {selectedTaskForView.comments?.map((comment, idx) => (
                            <div key={idx} className="comment-item">
                              <strong>{comment.userName}</strong>
                              <span className="comment-time">{new Date(comment.createdAt).toLocaleString()}</span>
                              <p>{comment.comment}</p>
                            </div>
                          ))}
                          {(!selectedTaskForView.comments || selectedTaskForView.comments.length === 0) && (
                            <p className="no-comments">No comments yet</p>
                          )}
                        </div>
                      </div>
                      <div className="task-time-section">
                        <h4><i className="fas fa-hourglass-half"></i> Time Logs ({selectedTaskForView.timeLogs?.reduce((sum, log) => sum + log.hoursSpent, 0) || 0} hours total)</h4>
                        <div className="time-logs-list">
                          {selectedTaskForView.timeLogs?.map((log, idx) => (
                            <div key={idx} className="time-log-item">
                              <span className="hours">{log.hoursSpent} hours</span>
                              <span className="description">{log.description}</span>
                              <span className="date">{new Date(log.loggedAt).toLocaleString()}</span>
                            </div>
                          ))}
                          {(!selectedTaskForView.timeLogs || selectedTaskForView.timeLogs.length === 0) && (
                            <p className="no-time-logs">No time logged yet</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PROJECTS VIEW */}
          {activeView === 'PROJECTS' && (
            <div className="admin-projects-container">
              <div className="projects-stats-row">
                <div className="stat-card">
                  <div className="stat-icon"><i className="fas fa-tasks"></i></div>
                  <div className="stat-info">
                    <div className="stat-value">{projectStats.total}</div>
                    <div className="stat-label">Total Projects</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon"><i className="fas fa-play-circle"></i></div>
                  <div className="stat-info">
                    <div className="stat-value">{projectStats.inProgress}</div>
                    <div className="stat-label">In Progress</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon"><i className="fas fa-check-circle"></i></div>
                  <div className="stat-info">
                    <div className="stat-value">{projectStats.completed}</div>
                    <div className="stat-label">Completed</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon"><i className="fas fa-chart-line"></i></div>
                  <div className="stat-info">
                    <div className="stat-value">{projectStats.avgCompletion}%</div>
                    <div className="stat-label">Avg Completion</div>
                  </div>
                </div>
              </div>

              <div className="projects-filters">
                <div className="search-box">
                  <i className="fas fa-search"></i>
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={projectSearch}
                    onChange={(e) => setProjectSearch(e.target.value)}
                  />
                </div>
                <select
                  className="status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">All Status</option>
                  <option value="PLANNING">Planning</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="ON_HOLD">On Hold</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div className="projects-table-wrapper">
                <table className="projects-table">
                  <thead>
                    <tr>
                      <th>Project Name</th>
                      <th>Type</th>
                      <th>Team / Provider</th>
                      <th>Status</th>
                      <th>Progress</th>
                      <th>Tasks</th>
                      <th>Due Date</th>
                      <th>Created By</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProjects.map(project => (
                      <tr key={project.id}>
                        <td>
                          <div className="project-name-cell">
                            <strong>{project.projectName}</strong>
                            {project.description && (
                              <div className="project-desc-preview">{project.description.substring(0, 50)}...</div>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={`project-type-badge ${project.projectType?.toLowerCase()}`}>
                            {project.projectType === 'GROUP'
                              ? <><i className="fas fa-building"></i> Group</>
                              : <><i className="fas fa-user-md"></i> Provider</>}
                          </span>
                        </td>
                        <td>
                          {project.projectType === 'GROUP' ? project.groupName : project.providerName}
                        </td>
                        <td>
                          <span className={`status-badge status-${project.status?.toLowerCase()}`}>
                            {project.status === 'PLANNING' && <><i className="fas fa-clipboard-list"></i> Planning</>}
                            {project.status === 'IN_PROGRESS' && <><i className="fas fa-sync-alt"></i> In Progress</>}
                            {project.status === 'ON_HOLD' && <><i className="fas fa-pause-circle"></i> On Hold</>}
                            {project.status === 'COMPLETED' && <><i className="fas fa-check-circle"></i> Completed</>}
                            {project.status === 'CANCELLED' && <><i className="fas fa-times-circle"></i> Cancelled</>}
                          </span>
                        </td>
                        <td>
                          <div className="progress-cell">
                            <div className="progress-bar-small">
                              <div className="progress-fill" style={{ width: `${project.completionPercentage || 0}%` }}></div>
                            </div>
                            <span className="progress-percent">{project.completionPercentage || 0}%</span>
                          </div>
                        </td>
                        <td className="tasks-count">
                          {project.tasks?.filter(t => t.status !== 'COMPLETED').length || 0}/{project.tasks?.length || 0}
                        </td>
                        <td className={`due-date ${isOverdue(project.targetEndDate) ? 'overdue' : ''}`}>
                          {project.targetEndDate ? new Date(project.targetEndDate).toLocaleDateString() : '—'}
                        </td>
                        <td>{project.createdByName || '—'}</td>
                        <td>
                          <button
                            className="view-details-btn"
                            onClick={() => { setSelectedProject(project); setShowProjectDetail(true); }}
                          >
                            <i className="fas fa-eye"></i> View
                          </button>
                          <button
  className="view-details-btn"
  style={{ marginLeft: 8, background: '#f59e0b', color: '#fff', border: 'none',
           padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: 12 }}
  onClick={(e) => {
    e.stopPropagation();
    setEditingProject(project);
    setShowEditProjectModal(true);
  }}
>
  <i className="fas fa-edit"></i> Edit
</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            
             {showProjectDetail && selectedProject && (
  <div className="modal-overlay" onClick={() => setShowProjectDetail(false)}>
    <div className="project-detail-modal" onClick={e => e.stopPropagation()}>
      <div className="modal-header">
        <h2>{selectedProject.projectName}</h2>
        <button className="modal-close" onClick={() => setShowProjectDetail(false)}>×</button>
      </div>
      <div className="modal-body">
        <div className="info-section">
          <h4><i className="fas fa-info-circle"></i> Project Details</h4>
          <div className="info-grid">
            <div><strong>Description:</strong> {selectedProject.description || '—'}</div>
            <div><strong>Type:</strong> {selectedProject.projectType === 'GROUP' ? 'Group Project' : 'Provider Project'}</div>
            <div><strong>Created By:</strong> {selectedProject.createdByName}</div>
            <div><strong>Created At:</strong> {new Date(selectedProject.createdAt).toLocaleDateString()}</div>
            <div><strong>Start Date:</strong> {selectedProject.startDate ? new Date(selectedProject.startDate).toLocaleDateString() : '—'}</div>
            <div><strong>Target End Date:</strong> {selectedProject.targetEndDate ? new Date(selectedProject.targetEndDate).toLocaleDateString() : '—'}</div>
          </div>
        </div>
        
        <div className="info-section">
          <h4><i className="fas fa-users"></i> Team Members ({selectedProject.assignees?.length || 0})</h4>
          <div className="assignees-list">
            {(selectedProject.assignees || []).map(assignee => (
              <div key={assignee.id} className="assignee-chip">
                <span className="assignee-avatar">{assignee.userName?.charAt(0)}</span>
                <span>{assignee.userName}</span>
                <span className="assignee-role">
                  {assignee.role === 'TEAM_LEADER' ? (
                    <><i className="fas fa-user-tie"></i> Team Leader</>
                  ) : (
                    <><i className="fas fa-user"></i> Team Member</>
                  )}
                </span>
              </div>
            ))}
          </div>
          
          {/* ADD ASSIGNEE BUTTONS - Separate buttons for Team Member and Team Leader */}
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
        
        <div className="info-section">
          <h4><i className="fas fa-tasks"></i> Tasks ({selectedProject.tasks?.length || 0})</h4>
          <div className="tasks-list">
            {(selectedProject.tasks || []).map(task => (
              <div key={task.id} className="task-item">
                <div className="task-header">
                  <span className="task-title">{task.title}</span>
                  <span className={`task-status status-${task.status?.toLowerCase()}`}>
                    {task.status?.replace('_', ' ')}
                  </span>
                </div>
                <div className="task-description">{task.description}</div>
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

          {activeView === 'GROUP_MANAGEMENT' && (
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
      <button className="ad-btn ad-btn-red" onClick={() => { if (selectedGroupId) { openAddProviderModal(); } else { showToastMessage("Please select a group first", "error"); } }} disabled={!selectedGroupId}>
        <i className="fas fa-plus-circle"></i> Add Provider to Group
      </button>
      <button
        className="ad-btn ad-btn-purple"
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
        <i className="fas fa-user-tie"></i> Assign Team Leader To Group
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
                          <td>
                            <strong>{group.groupName}</strong>{' '}
                            {selectedGroupId === group.groupId && <span className="selected-badge">Selected</span>}
                          </td>
                          <td className="td-muted">{group.teamLeaderName || "—"}</td>
                          <td className="td-muted">{group.managerName || "Unknown"}</td>
                          <td>
                            <div className="managers-list">
                              {group.managers && group.managers.length > 0
                                ? group.managers.map(manager => (
                                  <div key={manager.id} className="manager-chip">{manager.name}</div>
                                ))
                                : <span className="no-managers">No managers assigned</span>
                              }
                            </div>
                          </td>
                          <td className="td-muted">{group.providerCount || 0} providers</td>
                          <td>
                            <button className="td-action-btn" onClick={() => { setSelectedGroupId(group.groupId); setSelectedGroupName(group.groupName); fetchGroupManagers(group.groupId); fetchGroupProviders(group.groupId); }}>
                              <i className="fas fa-check-circle"></i> Select
                            </button>
                            <button className="td-action-btn" onClick={() => { setEditGroupName(group.groupName); setShowEditGroupModal(true); }} style={{ marginLeft: '8px' }} disabled={selectedGroupId !== group.groupId}>
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
                <tr><th>Provider Name</th><th>Specialty</th><th>License #</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {groupProviders.map(provider => (
                  <tr key={provider.id}>
                    <td>{provider.name}</td>
                    <td className="td-muted">{provider.specialty || '—'}</td>
                    <td className="td-muted">{provider.licenseNumber || '—'}</td>
                    <td>
                      <button className="td-action-btn delete-btn" onClick={() => handleRemoveProviderFromGroup(selectedGroupId, provider.id, provider.name)} style={{ color: 'var(--red)' }}>
                        <i className="fas fa-trash-alt"></i> Remove
                      </button>
                    </td>
                  </tr>
                ))}
                {groupProviders.length === 0 && (
                  <tr><td colSpan="4" className="td-empty">No providers in this group</td></tr>
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

            // Sort payor names alphabetically
            const sortedPayorNames = Object.keys(payorGroups).sort();

            return sortedPayorNames.map(payerName => {
              const records = payorGroups[payerName];
              
              // Count statuses
              const activeCount = records.filter(r => r.status?.toLowerCase() === 'active').length;
              const pendingCount = records.filter(r => r.status?.toLowerCase() === 'pending').length;
              const expiredCount = records.filter(r => r.status?.toLowerCase() === 'expired').length;
              const totalPlans = records.length;

              // Get unique hierarchy for display
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

              {/* Group Modals */}
              {showCreateGroupModal && (
                <div className="modal-overlay" onClick={() => setShowCreateGroupModal(false)}>
                  <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <h3><i className="fas fa-layer-group"></i> Create New Group</h3>
                    <div className="ad-field" style={{ marginBottom: 16 }}>
                      <label className="ad-field-lbl">Group Name *</label>
                      <input type="text" className="ad-field-inp" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder="Enter group name" />
                    </div>
                    <div className="modal-actions">
                      <button className="ad-btn" onClick={() => setShowCreateGroupModal(false)}>Cancel</button>
                      <button className="ad-btn ad-btn-violet" onClick={handleCreateGroup}>Create Group</button>
                    </div>
                  </div>
                </div>
              )}

              {showAssignTeamLeaderModal && (
                <div className="modal-overlay" onClick={() => setShowAssignTeamLeaderModal(false)}>
                  <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <h3><i className="fas fa-user-tie"></i> Assign Team Leader to {selectedGroupName}</h3>
                    {groups.find(g => g.groupId === selectedGroupId)?.teamLeaderName && (
                      <div className="info-note" style={{ background: '#e0e7ff', marginBottom: '16px' }}>
                        <i className="fas fa-info-circle"></i>{' '}
                        Current Team Leader: <strong>{groups.find(g => g.groupId === selectedGroupId)?.teamLeaderName}</strong>
                        <button
                          onClick={handleRemoveTeamLeaderFromGroup}
                          style={{ marginLeft: '12px', background: '#dc2626', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                    <div className="ad-field" style={{ marginBottom: 16 }}>
                      <label className="ad-field-lbl">Select Team Leader</label>
                      <select className="ad-field-inp" value={selectedTeamLeaderId} onChange={e => setSelectedTeamLeaderId(e.target.value)}>
                        <option value="">Select a Team Leader</option>
                        {availableTeamLeaders.map(leader => (
                          <option key={leader.id} value={leader.id}>
                            {leader.fullName} ({leader.email}) - Leads: {leader.leadingDepartment || 'N/A'}
                          </option>
                        ))}
                      </select>
                    </div>
                    {availableTeamLeaders.length === 0 && (
                      <div className="info-note">
                        <i className="fas fa-info-circle"></i> No Team Leaders available. Create Team Leaders first.
                      </div>
                    )}
                    <div className="modal-actions">
                      <button className="ad-btn" onClick={() => setShowAssignTeamLeaderModal(false)}>Cancel</button>
                      <button className="ad-btn ad-btn-purple" onClick={handleAssignTeamLeaderToGroup} disabled={loading || !selectedTeamLeaderId}>
                        {loading ? <><i className="fas fa-spinner fa-spin"></i> Assigning...</> : "Assign Team Leader"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

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

              {showAddProviderModal && (
                <div className="modal-overlay" onClick={() => setShowAddProviderModal(false)}>
                  <div className="modal-content" onClick={e => e.stopPropagation()}>
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
                      <button className="ad-btn ad-btn-green" onClick={handleAddProviderToGroup} disabled={!selectedProviderId}>
                        Add Provider
                      </button>
                    </div>
                  </div>
                </div>
              )}

              

              {showCreateManagerModal && (
                <div className="modal-overlay" onClick={() => setShowCreateManagerModal(false)}>
                  <div className="modal-content admin-modal-large" onClick={e => e.stopPropagation()}>
                    <h3><i className="fas fa-user-tie"></i> Create Group Manager Account</h3>
                    <div className="modal-form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                      <div className="ad-field"><label className="ad-field-lbl">Full Name *</label><input type="text" className="ad-field-inp" value={managerFullName} onChange={e => setManagerFullName(e.target.value)} /></div>
                      <div className="ad-field"><label className="ad-field-lbl">Email</label><input type="email" className="ad-field-inp" value={managerEmail} onChange={e => setManagerEmail(e.target.value)} /></div>
                      <div className="ad-field"><label className="ad-field-lbl">Phone</label><input type="text" className="ad-field-inp" value={managerPhone} onChange={e => setManagerPhone(e.target.value)} /></div>
                      <div className="ad-field"><label className="ad-field-lbl">Username *</label><input type="text" className="ad-field-inp" value={managerUsername} onChange={e => setManagerUsername(e.target.value)} /></div>
                      <div className="ad-field"><label className="ad-field-lbl">Password *</label><input type="password" className="ad-field-inp" value={managerPassword} onChange={e => setManagerPassword(e.target.value)} /></div>
                    </div>
                    <div className="modal-actions" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                      <button className="ad-btn" onClick={() => setShowCreateManagerModal(false)}>Cancel</button>
                      <button className="ad-btn ad-btn-blue" onClick={handleCreateGroupManager}>Create Manager</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ASSIGN TEAM VIEW */}
          {activeView === "ASSIGN_TEAM" && (
            <div className="ad-form-area">
              <div className="ad-form-card">
                <div className="ad-form-head">
                  <span className="ad-form-chip fc-violet">Team Assignment</span>
                  <p className="ad-form-desc">Click on search box to see all team leaders. Select multiple from both sides using checkboxes.</p>
                </div>
                <div className="assign-grid">
                  <div className="picker-section">
                    <label className="picker-label">Select Team Leaders</label>
                    {renderEnhancedPicker({ items: teamLeaders, selectedItems: selectedTeamLeaders, onSelectionChange: setSelectedTeamLeaders, searchTerm: searchTeamLeaderTerm, onSearchChange: setSearchTeamLeaderTerm, showPicker: showTeamLeaderPicker, setShowPicker: setShowTeamLeaderPicker, placeholder: "Click to see all team leaders...", labelKey: "fullName", subKey: "email" })}
                  </div>
                  <div className="picker-section">
                    <label className="picker-label">Select Team Members (Unassigned)</label>
                    {renderEnhancedPicker({ items: unassignedTeamMembers, selectedItems: selectedTeamMembers, onSelectionChange: setSelectedTeamMembers, searchTerm: searchTeamMemberTerm, onSearchChange: setSearchTeamMemberTerm, showPicker: showTeamMemberPicker, setShowPicker: setShowTeamMemberPicker, placeholder: "Click to see all unassigned team members...", labelKey: "fullName", subKey: "email" })}
                  </div>
                </div>
                <div className="form-actions">
                  <button className="ad-btn" onClick={() => { setSelectedTeamLeaders([]); setSelectedTeamMembers([]); setSearchTeamLeaderTerm(""); setSearchTeamMemberTerm(""); }}>Clear All</button>
                  <button className="ad-btn ad-btn-violet" onClick={handleAssignTeamMembers} disabled={loading || selectedTeamLeaders.length === 0 || selectedTeamMembers.length === 0}>
                    {loading ? <><i className="fas fa-spinner fa-spin"></i> Assigning...</> : `Assign ${selectedTeamMembers.length} Member(s) to ${selectedTeamLeaders.length} Leader(s)`}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ASSIGN TASKS VIEW */}
          {activeView === "ASSIGN_TASKS" && (
            <div className="assign-tasks-container">
              <div className="assign-tasks-card">
                <div className="assign-tasks-header">
                  <h3><i className="fas fa-tasks"></i> Assign Tasks to Team Members &amp; Leaders</h3>
                  <p>Create and assign tasks to multiple team members or team leaders at once</p>
                </div>
                <div className="assign-tasks-body">
                  <div className="team-leader-picker-section">
                    <div className="section-label">
                      <i className="fas fa-users"></i> Select Assignees *
                    </div>
                    {renderEnhancedPicker({
                      items: assignableUsers,
                      selectedItems: selectedTaskAssignees,
                      onSelectionChange: setSelectedTaskAssignees,
                      searchTerm: searchTaskAssigneeTerm,
                      onSearchChange: setSearchTaskAssigneeTerm,
                      showPicker: showTaskAssigneePicker,
                      setShowPicker: setShowTaskAssigneePicker,
                      placeholder: "Search team members or leaders...",
                      labelKey: "fullName",
                      subKey: "email"
                    })}
                  </div>
                  <div className="task-form-card">
                    <div className="task-form-title">
                      <i className="fas fa-edit"></i> Task Details
                    </div>
                    <div className="task-form-grid">
                      <div className="form-field full-width">
                        <label><i className="fas fa-heading"></i> Task Title *</label>
                        <input type="text" placeholder="Enter task title..." value={taskTitle} onChange={e => setTaskTitle(e.target.value)} />
                      </div>
                      <div className="form-field full-width">
                        <label><i className="fas fa-align-left"></i> Description</label>
                        <textarea placeholder="Enter task description..." value={taskDescription} onChange={e => setTaskDescription(e.target.value)} rows="3" />
                      </div>
                      <div className="form-field">
                        <label><i className="fas fa-flag"></i> Priority</label>
                        <select value={taskPriority} onChange={e => setTaskPriority(e.target.value)}>
                          <option value="HIGH">High Priority</option>
                          <option value="MEDIUM">Medium Priority</option>
                          <option value="LOW">Low Priority</option>
                        </select>
                      </div>
                      <div className="form-field">
                        <label><i className="fas fa-calendar"></i> Due Date</label>
                        <input type="date" value={taskDueDate} onChange={e => setTaskDueDate(e.target.value)} />
                      </div>
                      <div className="form-field full-width">
                        <label><i className="fas fa-user-md"></i> Related Provider (Optional)</label>
                        <select value={taskRelatedProvider} onChange={e => setTaskRelatedProvider(e.target.value)}>
                          <option value="">Select a provider...</option>
                          {providers.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {selectedTaskAssignees.length > 0 && (
                      <div className="selected-leaders-summary">
                        <h4><i className="fas fa-users"></i> Will be assigned to ({selectedTaskAssignees.length}) user(s):</h4>
                        <div className="selected-leaders-list">
                          {selectedTaskAssignees.map(assignee => (
                            <span key={assignee.id} className="selected-leader-tag">
                              {assignee.role === 'TEAM_LEADER' ? <i className="fas fa-user-tie"></i> : <i className="fas fa-user"></i>} {assignee.fullName}
                              <button onClick={() => setSelectedTaskAssignees(selectedTaskAssignees.filter(a => a.id !== assignee.id))}>
                                <i className="fas fa-times"></i>
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="form-actions">
                    <button className="ad-btn btn-clear" onClick={() => { setTaskTitle(""); setTaskDescription(""); setTaskPriority("MEDIUM"); setTaskDueDate(""); setTaskRelatedProvider(""); setSelectedTaskAssignees([]); setSearchTaskAssigneeTerm(""); }}>
                      <i className="fas fa-eraser"></i> Clear Form
                    </button>
                    <button className="ad-btn btn-submit" onClick={handleAssignTask} disabled={loading || !taskTitle || selectedTaskAssignees.length === 0}>
                      {loading ? <><i className="fas fa-spinner fa-spin"></i> Assigning...</> : <><i className="fas fa-paper-plane"></i> Assign Task to {selectedTaskAssignees.length} User(s)</>}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TASK STATS VIEW */}
          {activeView === "TASK_STATS" && (
            <div>
              <div className="stats-cards-row">
                <div className="stat-card stat-card-teal">
                  <div className="stat-icon"><i className="fas fa-users"></i></div>
                  <div className="stat-content">
                    <div className="stat-value">{teamLeaders.length}</div>
                    <div className="stat-label">Team Leaders</div>
                    <div className="stat-sub">Active Leaders</div>
                  </div>
                </div>
                <div className="stat-card stat-card-blue">
                  <div className="stat-icon"><i className="fas fa-tasks"></i></div>
                  <div className="stat-content">
                    <div className="stat-value">{teamLeaderStats.reduce((sum, t) => sum + (t.myTotalTasks || t.totalTasks || 0), 0)}</div>
                    <div className="stat-label">Total Tasks</div>
                    <div className="stat-sub">All Tasks</div>
                  </div>
                </div>
                <div className="stat-card stat-card-green">
                  <div className="stat-icon"><i className="fas fa-check-circle"></i></div>
                  <div className="stat-content">
                    <div className="stat-value">{teamLeaderStats.reduce((sum, t) => sum + (t.myCompletedTasks || 0), 0)}</div>
                    <div className="stat-label">Completed Tasks</div>
                    <div className="stat-sub">
                      {teamLeaderStats.reduce((sum, t) => sum + (t.myTotalTasks || t.totalTasks || 0), 0) > 0
                        ? Math.round((teamLeaderStats.reduce((sum, t) => sum + (t.myCompletedTasks || 0), 0) / teamLeaderStats.reduce((sum, t) => sum + (t.myTotalTasks || t.totalTasks || 0), 0)) * 100)
                        : 0}% Complete
                    </div>
                  </div>
                </div>
                <div className="stat-card stat-card-amber">
                  <div className="stat-icon"><i className="fas fa-hourglass-half"></i></div>
                  <div className="stat-content">
                    <div className="stat-value">{teamLeaderStats.reduce((sum, t) => sum + (t.myPendingTasks || 0), 0)}</div>
                    <div className="stat-label">Active Tasks</div>
                    <div className="stat-sub">In Progress</div>
                  </div>
                </div>
              </div>

              <div className="performance-table-card">
                <h3><i className="fas fa-chart-line"></i> Team Leader Performance</h3>
                {teamLeaders.length === 0 ? (
                  <div className="empty-table-message">
                    <div className="empty-icon"><i className="fas fa-users"></i></div>
                    <p>No team leaders found</p>
                    <p className="empty-sub">Create team leaders to track their performance</p>
                  </div>
                ) : teamLeaderStats.reduce((sum, t) => sum + (t.myTotalTasks || t.totalTasks || 0), 0) === 0 ? (
                  <div className="empty-table-message">
                    <div className="empty-icon"><i className="fas fa-tasks"></i></div>
                    <p>No tasks assigned yet</p>
                    <p className="empty-sub">Use "Assign Tasks to Team Leaders" to create tasks</p>
                  </div>
                ) : (
                  <div className="ad-table-wrap">
                    <table className="ad-table">
                      <thead>
                        <tr>
                          <th>Team Leader</th>
                          <th>Department</th>
                          <th><i className="fas fa-tasks"></i> TODO</th>
                          <th><i className="fas fa-sync-alt"></i> In Progress</th>
                          <th><i className="fas fa-eye"></i> In Review</th>
                          <th><i className="fas fa-check-circle"></i> Completed</th>
                          <th><i className="fas fa-ban"></i> Blocked</th>
                          <th>Completion Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {teamLeaders.map(leader => {
                          const stats = teamLeaderStats.find(s => s.id === leader.id) || { myTodoTasks: 0, myInProgressTasks: 0, myInReviewTasks: 0, myCompletedTasks: 0, myBlockedTasks: 0, completionRate: 0 };
                          const completionRate = stats.completionRate || 0;
                          return (
                            <tr key={leader.id}>
                              <td>
                                <div className="td-name-wrap">
                                  <div className="td-avatar">{leader.fullName?.charAt(0) || "?"}</div>
                                  <div>
                                    <div className="td-name">{leader.fullName}</div>
                                    <div className="td-sub">{leader.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="td-muted">{leader.leadingDepartment || leader.department || "—"}</td>
                              <td className="td-muted">{stats.myTodoTasks || 0}</td>
                              <td className="td-muted">{stats.myInProgressTasks || 0}</td>
                              <td className="td-muted">{stats.myInReviewTasks || 0}</td>
                              <td className="td-muted" style={{ color: 'var(--green)' }}>{stats.myCompletedTasks || 0}</td>
                              <td className="td-muted" style={{ color: 'var(--red)' }}>{stats.myBlockedTasks || 0}</td>
                              <td>
                                <div className="completion-cell">
                                  <div className="completion-bar-big">
                                    <div className="completion-fill" style={{ width: `${completionRate}%` }} />
                                  </div>
                                  <span className="completion-percent">{completionRate}%</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {(teamLeaders.length > 0 || teamLeaderStats.length > 0) && (
                <div className="bottom-stats-row">
                  <div className="quick-stats-card">
                    <h4><i className="fas fa-chart-bar"></i> Quick Stats</h4>
                    <div className="stats-list">
                      <div className="stat-item">
                        <span className="stat-label">Average Completion Rate</span>
                        <span className="stat-value">
                          {teamLeaders.filter(leader => {
                            const s = teamLeaderStats.find(st => st.id === leader.id);
                            return s && (s.myPendingTasks + s.myCompletedTasks) > 0;
                          }).length > 0
                            ? Math.round(teamLeaders.reduce((sum, leader) => {
                              const s = teamLeaderStats.find(st => st.id === leader.id) || {};
                              const total = (s.myPendingTasks || 0) + (s.myCompletedTasks || 0);
                              const rate = total > 0 ? ((s.myCompletedTasks || 0) / total) * 100 : 0;
                              return sum + rate;
                            }, 0) / teamLeaders.filter(leader => {
                              const s = teamLeaderStats.find(st => st.id === leader.id);
                              return s && (s.myPendingTasks + s.myCompletedTasks) > 0;
                            }).length)
                            : 0}%
                        </span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Total Team Members</span>
                        <span className="stat-value">{teamMembers.filter(m => m.role === "TEAM_MEMBER").length}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Total Providers</span>
                        <span className="stat-value">{providers.length}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Active Tasks</span>
                        <span className="stat-value">{teamLeaderStats.reduce((sum, t) => sum + (t.pendingTasks || 0), 0)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="top-performers-card">
                    <h4><i className="fas fa-trophy"></i> Top Performers</h4>
                    <div className="performers-list">
                      {teamLeaders
                        .filter(leader => {
                          const s = teamLeaderStats.find(st => st.id === leader.id);  
                          return s && (s.myPendingTasks + s.myCompletedTasks) > 0;
                        })
                        .sort((a, b) => {
                          const sa = teamLeaderStats.find(s => s.id === a.id) || {};
                          const sb = teamLeaderStats.find(s => s.id === b.id) || {};
                          const totalA = (sa.myPendingTasks || 0) + (sa.myCompletedTasks || 0);
                          const totalB = (sb.myPendingTasks || 0) + (sb.myCompletedTasks || 0);
                          const rateA = totalA > 0 ? ((sa.myCompletedTasks || 0) / totalA) * 100 : 0;
                          const rateB = totalB > 0 ? ((sb.myCompletedTasks || 0) / totalB) * 100 : 0;
                          return rateB - rateA;
                        })
                        .slice(0, 3)
                        .map((leader, idx) => {
                          const s = teamLeaderStats.find(st => st.id === leader.id) || {};
                          const total = (s.myPendingTasks || 0) + (s.myCompletedTasks || 0);
                          const rate = total > 0 ? ((s.myCompletedTasks || 0) / total) * 100 : 0;
                          return (
                            <div key={leader.id} className="performer-item">
                              <div className="performer-rank">{idx + 1}</div>
                              <div className="performer-info">
                                <div className="performer-name">{leader.fullName}</div>
                                <div className="performer-dept">{leader.leadingDepartment || leader.department}</div>
                              </div>
                              <div className="performer-rate">{Math.round(rate)}%</div>
                            </div>
                          );
                        })}
                      {teamLeaders.filter(leader => {
                        const s = teamLeaderStats.find(st => st.id === leader.id);
                        return s && (s.myPendingTasks + s.myCompletedTasks) > 0;
                      }).length === 0 && <div className="no-data">No data available yet</div>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CREATE TEAM LEADER FORM */}
          {activeView === "TEAM_LEADER" && (
            <div className="ad-form-area">
              <div className="ad-form-card">
                <div className="ad-form-head">
                  <span className="ad-form-chip fc-violet">Create Team Leader</span>
                  <p className="ad-form-desc">Create a new team leader who will manage a specific department.</p>
                </div>
                <div className="ad-form-grid">
                  <div className="ad-field"><label className="ad-field-lbl">Full Name *</label><input className="ad-field-inp" type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Enter full name" /></div>
                  <div className="ad-field"><label className="ad-field-lbl">Email *</label><input className="ad-field-inp" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter email" /></div>
                  <div className="ad-field"><label className="ad-field-lbl">Phone Number</label><input className="ad-field-inp" type="text" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="Enter phone number" /></div>
                  <div className="ad-field"><label className="ad-field-lbl">Department</label><select className="ad-field-inp" value={department} onChange={e => setDepartment(e.target.value)}><option value="">Select Department</option><option value="Charge Entry">Charge Entry</option><option value="Posting">Posting</option><option value="Accounts Receivable">Accounts Receivable</option><option value="Credentialing">Credentialing</option></select></div>
                  <div className="ad-field"><label className="ad-field-lbl">Leading Department *</label><select className="ad-field-inp" value={leadingDepartment} onChange={e => setLeadingDepartment(e.target.value)}><option value="">Select Department to Lead</option><option value="Charge Entry">Charge Entry Team</option><option value="Posting">Posting Team</option><option value="Accounts Receivable">Accounts Receivable Team</option><option value="Credentialing">Credentialing Team</option></select></div>
                  <div className="ad-field"><label className="ad-field-lbl">Username *</label><input className="ad-field-inp" type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter username" /></div>
                  <div className="ad-field"><label className="ad-field-lbl">Password *</label><input className="ad-field-inp" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" /></div>
                </div>
                <div className="form-actions">
                  <button className="ad-btn ad-btn-violet" onClick={handleCreateTeamLeader} disabled={loading || !username || !password || !leadingDepartment}>
                    {loading ? <><i className="fas fa-spinner fa-spin"></i> Creating...</> : "Create Team Leader"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CREATE TEAM MEMBER FORM */}
          {activeView === "TEAM_MEMBER" && (
            <div className="ad-form-area">
              <div className="ad-form-card">
                <div className="ad-form-head">
                  <span className="ad-form-chip fc-blue">Create Team Member</span>
                  <p className="ad-form-desc">Create a new team member who will work under a team leader.</p>
                </div>
                <div className="ad-form-grid">
                  <div className="ad-field"><label className="ad-field-lbl">Full Name *</label><input className="ad-field-inp" type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Enter full name" /></div>
                  <div className="ad-field"><label className="ad-field-lbl">Email *</label><input className="ad-field-inp" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter email" /></div>
                  <div className="ad-field"><label className="ad-field-lbl">Phone Number</label><input className="ad-field-inp" type="text" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="Enter phone number" /></div>
                  <div className="ad-field"><label className="ad-field-lbl">Department</label><select className="ad-field-inp" value={department} onChange={e => setDepartment(e.target.value)}><option value="">Select Department</option><option value="Charge Entry">Charge Entry</option><option value="Posting">Posting</option><option value="Accounts Receivable">Accounts Receivable</option><option value="Credentialing">Credentialing</option></select></div>
                  <div className="ad-field"><label className="ad-field-lbl">Specialty</label><input className="ad-field-inp" type="text" value={specialty} onChange={e => setSpecialty(e.target.value)} placeholder="Enter specialty" /></div>
                  <div className="ad-field"><label className="ad-field-lbl">Username *</label><input className="ad-field-inp" type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter username" /></div>
                  <div className="ad-field"><label className="ad-field-lbl">Password *</label><input className="ad-field-inp" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" /></div>
                </div>
                <div className="form-actions">
                  <button className="ad-btn ad-btn-blue" onClick={handleCreateTeamMember} disabled={loading}>
                    {loading ? <><i className="fas fa-spinner fa-spin"></i> Creating...</> : "Create Team Member"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CREATE PROVIDER FORM */}
          {activeView === "PROVIDER" && (
            <div className="ad-form-area">
              <div className="ad-form-card">
                <div className="ad-form-head">
                  <span className="ad-form-chip fc-teal">Create Provider</span>
                  <p className="ad-form-desc">Create a new provider account.</p>
                </div>
                <div className="ad-form-grid">
                  <div className="ad-field"><label className="ad-field-lbl">Full Name *</label><input className="ad-field-inp" type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Enter full name" /></div>
                  <div className="ad-field"><label className="ad-field-lbl">Email *</label><input className="ad-field-inp" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter email" /></div>
                  <div className="ad-field"><label className="ad-field-lbl">Phone Number</label><input className="ad-field-inp" type="text" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="Enter phone number" /></div>
                  <div className="ad-field"><label className="ad-field-lbl">Specialty</label><input className="ad-field-inp" type="text" value={specialty} onChange={e => setSpecialty(e.target.value)} placeholder="Enter specialty" /></div>
                  <div className="ad-field"><label className="ad-field-lbl">Username *</label><input className="ad-field-inp" type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter username" /></div>
                  <div className="ad-field"><label className="ad-field-lbl">Password *</label><input className="ad-field-inp" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" /></div>
                </div>
                <div className="form-actions">
                  <button className="ad-btn ad-btn-teal" onClick={handleCreateProvider} disabled={loading}>
                    {loading ? <><i className="fas fa-spinner fa-spin"></i> Creating...</> : "Create Provider"}
                  </button>
                </div>
              </div>
            </div>
          )}

             <CreateTaskModal
  isOpen={showCreateTaskModal}
  onClose={() => setShowCreateTaskModal(false)}
  onSuccess={(task) => {
    showToastMessage(`Task "${task.title}" created successfully`);
    fetchAllTasks();
    fetchTeamLeaderTaskStats();
  }}
  assignableUsers={assignableUsers}   
  providers={providers}
/>
 
<EditProjectModal
  isOpen={showEditProjectModal}
  onClose={() => setShowEditProjectModal(false)}
  onSuccess={() => {
    showToastMessage('Project updated successfully');
    fetchAllProjects();
    setShowEditProjectModal(false);
  }}
  project={editingProject}
  apiBase="/admin/projects"
/>  


{/* Add Assignee to Project Modal */}
{showAddAssigneeModal && selectedProject && (
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
        <p><strong>Project:</strong> {selectedProject.projectName}</p>
        
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
                  {user.role === 'TEAM_LEADER' ? (
                    <><i className="fas fa-user-tie"></i> {user.fullName} {user.leadingDepartment ? `(Leads: ${user.leadingDepartment})` : ''}</>
                  ) : (
                    <><i className="fas fa-user"></i> {user.fullName} {user.department ? `(${user.department})` : ''}</>
                  )}
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
          onClick={() => handleAddAssigneeToProject(selectedProject.id)}
          disabled={loading || !selectedAssigneeId}
        >
          {loading ? <><i className="fas fa-spinner fa-spin"></i> Adding...</> : <><i className="fas fa-user-plus"></i> Add {assigneeRoleFilter === 'TEAM_LEADER' ? 'Team Leader' : 'Team Member'}</>}
        </button>
      </div>
    </div>
  </div>
)}


          {/* User Profile Modal */}
          {showUserModal && selectedUser && (
            <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={() => setShowUserModal(false)}>×</button>
                <h3>{selectedUser.fullName || selectedUser.username}'s Profile</h3>
                <div className="modal-body">
                  <p><strong>Role:</strong> {selectedUser.role?.replace("_", " ")}</p>
                  <p><strong>Email:</strong> {selectedUser.email || "—"}</p>
                  <p><strong>Phone:</strong> {selectedUser.phoneNumber || "—"}</p>
                  <p><strong>Department:</strong> {selectedUser.department || "—"}</p>
                  {selectedUser.leadingDepartment && <p><strong>Leading Department:</strong> {selectedUser.leadingDepartment}</p>}
                  <p><strong>Status:</strong> {selectedUser.status || "Active"}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

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

{/* Payor Details Modal - Hierarchical Table */}
{showPayorDetailsModal && payorFlatData && selectedPayor && (
  <div className="modal-overlay" onClick={() => setShowPayorDetailsModal(false)}>
    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '95%', maxHeight: '90vh', overflow: 'hidden' }}>
      <div className="modal-header">
        <h3>
          <i className="fas fa-file-medical"></i> Credentialing Details - {selectedPayor}
          <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#6b7280', marginLeft: '12px' }}>
            Group: {selectedGroupName}
          </span>
        </h3>
        <button className="modal-close" onClick={() => setShowPayorDetailsModal(false)}>×</button>
      </div>
      
      <div className="modal-body" style={{ overflow: 'auto', maxHeight: 'calc(90vh - 120px)' }}>
        {/* Summary Stats */}
        <div className="payor-stats" style={{ 
          display: 'flex', 
          gap: '20px', 
          marginBottom: '16px',
          padding: '12px 16px',
          background: '#f9fafb',
          borderRadius: '8px',
          flexWrap: 'wrap'
        }}>
          <div><strong>Total Plans:</strong> <span style={{ fontWeight: 'bold' }}>{payorFlatData.totalPlans}</span></div>
          <div><strong>Active:</strong> <span style={{ fontWeight: 'bold', color: '#10b981' }}>{payorFlatData.summary.active}</span></div>
          <div><strong>Pending:</strong> <span style={{ fontWeight: 'bold', color: '#f59e0b' }}>{payorFlatData.summary.pending}</span></div>
          <div><strong>Expired:</strong> <span style={{ fontWeight: 'bold', color: '#ef4444' }}>{payorFlatData.summary.expired}</span></div>
          <div style={{ marginLeft: 'auto' }}>
            <button 
              className="ad-btn ad-btn-blue" 
              style={{ padding: '4px 12px', fontSize: '12px' }}
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
          <div className="ad-table-wrap" style={{ maxHeight: 'calc(90vh - 250px)', overflow: 'auto' }}>
            <table className="ad-table" style={{ fontSize: '13px' }}>
              <thead>
                <tr style={{ position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
                  <th style={{ minWidth: '100px' }}>Payer Name</th>
                  <th style={{ minWidth: '100px' }}>LOB</th>
                  <th style={{ minWidth: '100px' }}>Network</th>
                  <th style={{ minWidth: '100px' }}>Product</th>
                  <th style={{ minWidth: '120px' }}>Plan</th>
                  <th style={{ minWidth: '80px' }}>Status</th>
                  <th style={{ minWidth: '120px' }}>Managing Entity</th>
                  <th style={{ minWidth: '100px' }}>App Date</th>
                  <th style={{ minWidth: '100px' }}>Eff Date</th>
                  <th style={{ minWidth: '100px' }}>Link Date</th>
                  <th style={{ minWidth: '100px' }}>Recred Date</th>
                  <th style={{ minWidth: '100px' }}>Term Date</th>
                  <th style={{ minWidth: '120px' }}>Provider Rep</th>
                  <th style={{ minWidth: '120px' }}>Contracting Rep</th>
                  <th style={{ minWidth: '80px' }}>Actions</th>
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

    // Build the hierarchy — a new group is only created when its own value changes
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

      // New LOB
      if (lob !== currentLob || !currentLobGroup) {
        currentLob = lob;
        currentLobGroup = { value: lob, rowSpan: 0, networks: [] };
        hierarchy.push(currentLobGroup);
        currentNetwork = null;
        currentNetworkGroup = null;
        currentProduct = null;
        currentProductGroup = null;
      }

      // New Network (only within the current LOB)
      if (network !== currentNetwork || !currentNetworkGroup) {
        currentNetwork = network;
        currentNetworkGroup = { value: network, rowSpan: 0, products: [] };
        currentLobGroup.networks.push(currentNetworkGroup);
        currentProduct = null;
        currentProductGroup = null;
      }

      // New Product (only within the current Network)
      if (product !== currentProduct || !currentProductGroup) {
        currentProduct = product;
        currentProductGroup = { value: product, rowSpan: 0, plans: [] };
        currentNetworkGroup.products.push(currentProductGroup);
      }

      // Add plan (dedupe identical rows so an accidental duplicate insert
      // doesn't render twice)
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

    // Render rows — each level tracks its OWN "first row" flag,
    // reset only when that level's group changes (not on every nested change)
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
              <tr key={record.id}>
                {/* Payer Name - merged across the ENTIRE table */}
                {globalRowIndex === 0 && (
                  <td rowSpan={totalPayerRowSpan} style={{ verticalAlign: 'middle', fontWeight: '600', background: '#f8fafc' }}>
                    {selectedPayor}
                  </td>
                )}

                {/* LOB - merged across its whole group, only */}
                {isFirstRowOfLob && (
                  <td rowSpan={lobGroup.rowSpan} style={{ verticalAlign: 'middle', fontWeight: '500', background: '#f8fafc' }}>
                    {lobGroup.value || '—'}
                  </td>
                )}

                {/* Network - merged across its whole group, only */}
                {isFirstRowOfNetwork && (
                  <td rowSpan={networkGroup.rowSpan} style={{ verticalAlign: 'middle', background: '#fafafa' }}>
                    {networkGroup.value || '—'}
                  </td>
                )}

                {/* Product - merged across its whole group, only */}
                {isFirstRowOfProduct && (
                  <td rowSpan={productGroup.rowSpan} style={{ verticalAlign: 'middle', fontWeight: '500', background: '#fafafa' }}>
                    {productGroup.value || '—'}
                  </td>
                )}

                <td>{record.plan || '—'}</td>

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
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      className="td-action-btn"
                      onClick={() => {
                        const fullRecord = credentialingStatus.find(r => r.id === record.id);
                        if (fullRecord) {
                          handleEditPayor(fullRecord);
                          setShowPayorDetailsModal(false);
                        }
                      }}
                      style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
                      title="Edit"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      className="td-action-btn delete-btn"
                      onClick={() => handleDeletePayor(record.id)}
                      style={{ background: '#dc2626', color: 'white', border: 'none', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
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
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: '#6b7280' }}>No plans found for this payor</p>
          </div>
        )}
      </div>
      
      <div className="modal-footer" style={{ padding: '16px 20px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
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
        <button className="ad-btn" onClick={() => setShowPayorDetailsModal(false)}>Close</button>
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
}

export default AdminDashboard;
