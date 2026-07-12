import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Plus,
  RefreshCw,
  FileSpreadsheet,
  Trash2,
  Edit,
  Shield,
  Clock,
  Eye,
  UserPlus
} from 'lucide-react';
import PageContainer from '../../components/ui/PageContainer';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import DataTable from '../../components/ui/DataTable';
import Drawer from '../../components/ui/Drawer';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { activityService } from '../../services/activityService';
import { DriverAvatar } from '../../components/ui/FallbackImage';
import { showToast } from '../../components/ui/Toast';

const UsersPage = () => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'Admin';
  const isSuperAdmin = currentUser?.role === 'Super Admin';
  const hasAccess = isAdmin || isSuperAdmin;

  // State Management
  const [createdUserData, setCreatedUserData] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Driver',
    status: 'Active'
  });
  const [errors, setErrors] = useState({});

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Initial Load
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await userService.getAll();
      setUsersList(data);
    } catch {
      showToast.error('Failed to sync team users registry');
    } finally {
      setLoading(false);
    }
  };

  // KPIs
  const stats = useMemo(() => {
    const total = usersList.length;
    const active = usersList.filter(u => u.status === 'Active').length;
    const adminCount = usersList.filter(u => u.role === 'Admin').length;

    return { total, active, adminCount };
  }, [usersList]);

  // Client Side Filtering
  const filteredUsers = useMemo(() => {
    return usersList.filter(user => {
      const matchesSearch = 
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.id?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole = filterRole ? user.role === filterRole : true;
      const matchesStatus = filterStatus ? user.status === filterStatus : true;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [usersList, searchQuery, filterRole, filterStatus]);

  // Row selection Drawer
  const handleRowClick = (row) => {
    setSelectedUser(row);
    setIsDrawerOpen(true);
  };

  // Form handlers
  const handleInputChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const tempErrors = {};
    if (!formData.name.trim()) tempErrors.name = 'Full name is required';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      tempErrors.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email)) {
      tempErrors.email = 'Invalid email syntax';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleApproveUser = async (user, e) => {
    e?.stopPropagation();
    try {
      const targetId = user.id || user._id;
      await userService.update(targetId, { status: 'Active' });
      await activityService.create('Approve User', `Approved registration request for user ID ${targetId}`, currentUser.name);
      showToast.success('User account approved and activated!');
      fetchData();
    } catch {
      showToast.error('Failed to approve user');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast.error('Please fix validation warnings');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEdit) {
        await userService.update(editId, formData);
        await activityService.create('Modify User', `Updated settings details for operator ${formData.name}`, currentUser.name);
        showToast.success('Operator profile modified');
      } else {
        const newUser = await userService.create(formData);
        await activityService.create('Register User', `Created staff operator credentials for ${formData.name}`, currentUser.name);
        showToast.success('Registered new staff credentials!');
        if (newUser && newUser.generatedPassword) {
          setCreatedUserData({
            name: newUser.name,
            email: newUser.email,
            password: newUser.generatedPassword
          });
        }
      }

      setIsModalOpen(false);
      setFormData({ name: '', email: '', role: 'Driver', status: 'Active' });
      fetchData();
    } catch {
      showToast.error('Failed to register user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (user, e) => {
    e.stopPropagation();
    setIsEdit(true);
    setEditId(user.id);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    });
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (id, e) => {
    e?.stopPropagation();
    if (id === currentUser.id) {
      showToast.error('Cannot delete own profile session');
      return;
    }

    if (window.confirm('Are you sure you want to permanently delete this user credentials log?')) {
      try {
        await userService.delete(id);
        await activityService.create('Revoke User', `Revoked credentials for user ID ${id}`, currentUser.name);
        showToast.success('Credentials revoked successfully');
        setIsDrawerOpen(false);
        fetchData();
      } catch {
        showToast.error('Failed to revoke access');
      }
    }
  };

  const handleExportCSV = () => {
    const headers = ['User ID', 'Name', 'Email', 'Role', 'Status'];
    const rows = filteredUsers.map(u => [
      u.id,
      u.name,
      u.email,
      u.role,
      u.status
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `TransitOps_StaffRegistry_Export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast.success('CSV export compiled!');
  };

  // Columns definition
  const columns = [
    {
      header: 'Staff User',
      accessor: 'name',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <DriverAvatar name={row.name} avatarUrl={row.avatar} size={32} />
          <div>
            <span className="font-bold text-text-main block">{row.name}</span>
            <span className="text-[10px] text-text-secondary font-medium block">{row.email}</span>
          </div>
        </div>
      )
    },
    {
      header: 'User ID',
      accessor: 'id',
      cell: (row) => <span className="font-bold text-text-secondary text-xs">{row.id}</span>
    },
    {
      header: 'Assign Role',
      accessor: 'role',
      cell: (row) => <span className="font-semibold text-text-main text-xs bg-hover/80 px-2.5 py-1 rounded-full">{row.role}</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => <Badge status={row.status} />
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        <div className="flex gap-2 items-center">
          {isSuperAdmin && row.status === 'Pending' && (
            <Button variant="info" size="sm" className="px-2 py-1 font-bold text-[10px]" onClick={(e) => handleApproveUser(row, e)}>
              Approve
            </Button>
          )}
          <Button variant="outline" size="sm" className="px-2" onClick={(e) => handleEditClick(row, e)}>
            <Edit size={13} />
          </Button>
          <Button variant="outline" size="sm" className="px-2 text-danger border-danger/25 hover:bg-danger/5" onClick={(e) => handleDeleteUser(row.id || row._id, e)}>
            <Trash2 size={13} />
          </Button>
        </div>
      )
    }
  ];

  if (!hasAccess) {
    return (
      <PageContainer>
        <div className="bg-card border border-border p-8 rounded-lg shadow-sm text-center select-none space-y-3">
          <Shield size={40} className="mx-auto text-danger" />
          <h3 className="text-base font-black text-text-main uppercase">Access Denied</h3>
          <p className="text-text-secondary text-xs max-w-sm mx-auto leading-relaxed">
            You do not possess the required Security Clearance to audit organization staff accounts.
          </p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-5 select-none">
        
        {/* KPI Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-card border border-border p-4 rounded-xl flex items-center gap-4">
            <div className="h-10 w-10 bg-info/10 text-info flex items-center justify-center rounded-lg">
              <Users size={20} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-text-secondary">Total Staff</span>
              <p className="text-xl font-black text-text-main mt-0.5">{stats.total}</p>
            </div>
          </div>
          <div className="bg-card border border-border p-4 rounded-xl flex items-center gap-4">
            <div className="h-10 w-10 bg-success/10 text-success flex items-center justify-center rounded-lg">
              <Shield size={20} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-text-secondary">Active Access</span>
              <p className="text-xl font-black text-text-main mt-0.5">{stats.active}</p>
            </div>
          </div>
          <div className="bg-card border border-border p-4 rounded-xl flex items-center gap-4">
            <div className="h-10 w-10 bg-warning/10 text-warning flex items-center justify-center rounded-lg">
              <Clock size={20} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-text-secondary">Admins</span>
              <p className="text-xl font-black text-text-main mt-0.5">{stats.adminCount}</p>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-card border border-border p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 flex-col sm:flex-row gap-3 w-full">
            <input
              type="text"
              placeholder="Search staff name, email, credentials..."
              className="bg-background text-text-main border border-border rounded-lg px-3.5 py-1.5 text-xs w-full max-w-sm focus:outline-none focus:border-info"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />

            <select
              className="bg-background text-text-main border border-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-info"
              value={filterRole}
              onChange={e => setFilterRole(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Fleet Manager">Fleet Manager</option>
              <option value="Safety Officer">Safety Officer</option>
              <option value="Financial Analyst">Financial Analyst</option>
              <option value="Driver">Driver</option>
            </select>

            <select
              className="bg-background text-text-main border border-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-info"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <FileSpreadsheet size={14} className="mr-1.5" /> Export CSV
            </Button>
            <Button variant="info" size="sm" onClick={() => {
              setIsEdit(false);
              setFormData({ name: '', email: '', role: 'Driver', status: 'Active' });
              setIsModalOpen(true);
            }}>
              <UserPlus size={14} className="mr-1.5" /> Add Staff User
            </Button>
            <Button variant="outline" size="sm" onClick={fetchData} className="px-2">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <DataTable
            columns={columns}
            data={filteredUsers}
            loading={loading}
            onRowClick={handleRowClick}
            emptyMessage="No staff operator log match parameters."
          />
        </div>
      </div>

      {/* Quick View Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedUser ? `Staff profile: ${selectedUser.id}` : 'Staff User'}
        className="w-full sm:w-[420px]"
      >
        {selectedUser && (
          <div className="space-y-6 text-left text-xs font-semibold text-text-secondary h-full flex flex-col justify-between">
            <div className="space-y-5 overflow-y-auto pr-1">
              
              <div className="bg-hover/10 p-4 border border-border rounded-xl flex items-center gap-4">
                <DriverAvatar name={selectedUser.name} avatarUrl={selectedUser.avatar} size={50} />
                <div>
                  <h4 className="text-sm font-black text-text-main leading-tight">{selectedUser.name}</h4>
                  <span className="inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-info/10 text-info mt-1.5">
                    {selectedUser.role}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="block text-[9.5px] uppercase font-black text-text-main tracking-wider">Account Specifics</span>
                <div className="border border-border/50 rounded-xl p-3.5 space-y-3 bg-card">
                  <div>
                    <span className="block text-[9px] uppercase font-bold">Email address</span>
                    <span className="text-text-main block font-black mt-0.5">{selectedUser.email}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase font-bold">Lifecycle state</span>
                    <div className="mt-1">
                      <Badge status={selectedUser.status} />
                    </div>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase font-bold">Odoo access privileges</span>
                    <span className="text-text-main block font-bold mt-0.5">Full console write permissions</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="block text-[9.5px] uppercase font-black text-text-main tracking-wider">Related Logs</span>
                <div className="border border-border/50 rounded-xl p-3.5 bg-card space-y-3">
                  <div className="flex gap-3">
                    <div className="w-1.5 h-1.5 bg-success rounded-full mt-1.5" />
                    <div>
                      <p className="text-text-main font-bold">Account created</p>
                      <p className="text-[10px] text-text-secondary mt-0.5">Access granted by administrator</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="border-t border-border pt-4 flex gap-2">
              <Button variant="outline" className="flex-1 font-bold text-xs" onClick={(e) => handleEditClick(selectedUser, e)}>
                Modify Profile
              </Button>
              <Button variant="danger" className="flex-1 font-bold text-xs" onClick={(e) => handleDeleteUser(selectedUser.id, e)}>
                Revoke Credentials
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      {/* Add/Edit User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEdit ? 'Modify Staff Credentials' : 'Register Staff Account'}
        size="md"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 text-left text-xs font-semibold text-text-secondary">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-bold text-text-secondary">Full name</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => handleInputChange('name', e.target.value)}
              placeholder="e.g. Fiona Gallagher"
              className="bg-background text-text-main border border-border rounded-lg px-3.5 py-1.5 focus:outline-none focus:border-info"
            />
            {errors.name && <p className="text-danger text-[10px]">{errors.name}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-bold text-text-secondary">Email address</label>
            <input
              type="email"
              value={formData.email}
              onChange={e => handleInputChange('email', e.target.value)}
              placeholder="fiona.gallagher@transitops.com"
              className="bg-background text-text-main border border-border rounded-lg px-3.5 py-1.5 focus:outline-none focus:border-info"
            />
            {errors.email && <p className="text-danger text-[10px]">{errors.email}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-text-secondary">Role Classification</label>
              <select
                value={formData.role}
                onChange={e => handleInputChange('role', e.target.value)}
                className="bg-background text-text-main border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-info"
              >
                <option value="Admin">Admin</option>
                <option value="Fleet Manager">Fleet Manager</option>
                <option value="Safety Officer">Safety Officer</option>
                <option value="Financial Analyst">Financial Analyst</option>
                <option value="Driver">Driver</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-text-secondary">Status</label>
              <select
                value={formData.status}
                onChange={e => handleInputChange('status', e.target.value)}
                className="bg-background text-text-main border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-info"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="info" type="submit" loading={isSubmitting}>
              {isEdit ? 'Update Details' : 'Register Account'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Temporary Credentials display Modal */}
      <Modal
        isOpen={!!createdUserData}
        onClose={() => setCreatedUserData(null)}
        title="Account Credentials Generated"
        size="sm"
      >
        <div className="space-y-4 text-left text-xs font-semibold text-text-secondary select-none">
          <p className="text-text-main text-xs font-bold leading-relaxed">
            The temporary access credentials have been generated. Please copy them now as they will not be shown again.
          </p>
          <div className="bg-hover/10 p-3.5 border border-border rounded-xl space-y-2.5">
            <div>
              <span className="block text-[9px] uppercase font-bold text-text-secondary">Username / Email</span>
              <span className="text-text-main block font-black select-all mt-0.5">{createdUserData?.email}</span>
            </div>
            <div>
              <span className="block text-[9px] uppercase font-bold text-text-secondary">Temporary Password</span>
              <span className="text-text-main block font-black select-all mt-0.5">{createdUserData?.password}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="info"
              className="w-full font-bold py-2 text-xs"
              onClick={() => {
                navigator.clipboard.writeText(`Email: ${createdUserData?.email}\nPassword: ${createdUserData?.password}`);
                showToast.success('Credentials copied to clipboard!');
                setCreatedUserData(null);
              }}
            >
              Copy Credentials & Close
            </Button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
};

export default UsersPage;
