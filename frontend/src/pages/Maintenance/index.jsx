import React, { useState, useEffect, useMemo } from 'react';
import {
  Wrench,
  Plus,
  RefreshCw,
  FileSpreadsheet,
  Trash2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Info
} from 'lucide-react';
import PageContainer from '../../components/ui/PageContainer';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import DataTable from '../../components/ui/DataTable';
import Drawer from '../../components/ui/Drawer';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { maintenanceService } from '../../services/maintenanceService';
import { vehicleService } from '../../services/vehicleService';
import { activityService } from '../../services/activityService';
import { showToast } from '../../components/ui/Toast';

const Maintenance = () => {
  const { currentUser } = useAuth();
  const isManager = currentUser?.role === 'Admin' || currentUser?.role === 'Fleet Manager';

  // State Management
  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    vehicleId: '',
    description: '',
    type: 'Routine',
    priority: 'Medium',
    mechanic: 'Central Depot Workshop',
    cost: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [errors, setErrors] = useState({});

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Initial Fetch
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [maintLogs, vehiclesList] = await Promise.all([
        maintenanceService.getAll(),
        vehicleService.getAll()
      ]);
      setLogs(maintLogs);
      setVehicles(vehiclesList.filter(v => !v.isArchived));
    } catch {
      showToast.error('Failed to sync maintenance logs');
    } finally {
      setLoading(false);
    }
  };

  // KPI Calculations
  const stats = useMemo(() => {
    const active = logs.filter(l => l.status === 'In Progress').length;
    const completed = logs.filter(l => l.status === 'Completed').length;
    const totalCost = logs.reduce((sum, l) => sum + (Number(l.cost) || 0), 0);
    const critical = logs.filter(l => l.priority === 'High' && l.status === 'In Progress').length;
    
    return { active, completed, totalCost, critical };
  }, [logs]);

  // Handle Search & Filter Client-Side
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = 
        log.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.vehicleId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.mechanic?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesPriority = filterPriority ? log.priority === filterPriority : true;
      const matchesType = filterType ? log.type === filterType : true;
      const matchesStatus = filterStatus ? log.status === filterStatus : true;

      return matchesSearch && matchesPriority && matchesType && matchesStatus;
    });
  }, [logs, searchQuery, filterPriority, filterType, filterStatus]);

  // Open Detailed Drawer
  const handleRowClick = (row) => {
    setSelectedLog(row);
    setIsDrawerOpen(true);
  };

  // Form input changes
  const handleInputChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Create validation
  const validateForm = () => {
    const tempErrors = {};
    if (!formData.vehicleId) tempErrors.vehicleId = 'Vehicle is required';
    if (!formData.description.trim()) tempErrors.description = 'Work order description is required';
    if (Number(formData.cost) < 0) tempErrors.cost = 'Estimated cost must be non-negative';
    if (!formData.date) tempErrors.date = 'Schedule date is required';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Submit new log
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast.error('Please resolve form validation issues');
      return;
    }

    setIsSubmitting(true);
    try {
      const newRecord = await maintenanceService.create({
        ...formData,
        cost: Number(formData.cost) || 0
      });
      
      // Update vehicle status to Maintenance
      await vehicleService.update(formData.vehicleId, { status: 'Maintenance' });
      await activityService.create('Schedule Service', `Scheduled servicing order ${newRecord.id} for vehicle ${formData.vehicleId}`, currentUser.name);

      showToast.success('Maintenance job scheduled successfully!');
      setIsModalOpen(false);
      setFormData({
        vehicleId: '',
        description: '',
        type: 'Routine',
        priority: 'Medium',
        mechanic: 'Central Depot Workshop',
        cost: '',
        date: new Date().toISOString().split('T')[0]
      });
      fetchData();
    } catch {
      showToast.error('Failed to schedule maintenance');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Actions on existing log
  const handleUpdateStatus = async (id, nextStatus) => {
    try {
      const updated = await maintenanceService.update(id, { status: nextStatus });
      setSelectedLog(updated);
      
      // If completed or cancelled, return vehicle to Available pool
      if (nextStatus === 'Completed' || nextStatus === 'Cancelled') {
        const item = logs.find(l => l.id === id);
        if (item) {
          await vehicleService.update(item.vehicleId, { status: 'Available' });
        }
      }

      await activityService.create('Update Service', `Moved service job ${id} status to ${nextStatus}`, currentUser.name);
      showToast.success(`Work order status updated to ${nextStatus}`);
      fetchData();
    } catch {
      showToast.error('Failed to update work order status');
    }
  };

  const handleDeleteLog = async (id) => {
    if (window.confirm('Are you sure you want to delete this maintenance entry?')) {
      try {
        const item = logs.find(l => l.id === id);
        await maintenanceService.delete(id);
        
        if (item && item.status === 'In Progress') {
          await vehicleService.update(item.vehicleId, { status: 'Available' });
        }

        await activityService.create('Delete Service', `Removed maintenance order ${id}`, currentUser.name);
        showToast.success('Maintenance record deleted');
        setIsDrawerOpen(false);
        fetchData();
      } catch {
        showToast.error('Failed to delete log entry');
      }
    }
  };

  const handleExportCSV = () => {
    const headers = ['Order ID', 'Vehicle ID', 'Description', 'Type', 'Priority', 'Cost ($)', 'Status', 'Date', 'Mechanic'];
    const rows = filteredLogs.map(l => [
      l.id,
      l.vehicleId,
      l.description,
      l.type,
      l.priority,
      l.cost,
      l.status,
      l.date,
      l.mechanic
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `TransitOps_Maintenance_Export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast.success('CSV export compiled!');
  };

  // Columns definition for DataTable
  const columns = [
    {
      header: 'ID',
      accessor: 'id',
      cell: (row) => <span className="font-bold text-text-main">{row.id}</span>
    },
    {
      header: 'Vehicle ID',
      accessor: 'vehicleId',
      cell: (row) => <span className="font-semibold text-text-secondary">{row.vehicleId}</span>
    },
    {
      header: 'Work Description',
      accessor: 'description',
      cell: (row) => <span className="truncate max-w-[200px] block text-text-main">{row.description}</span>
    },
    {
      header: 'Type',
      accessor: 'type',
      cell: (row) => <span className="font-semibold text-text-main text-xs bg-hover/80 px-2.5 py-1 rounded-full">{row.type}</span>
    },
    {
      header: 'Priority',
      accessor: 'priority',
      cell: (row) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
          row.priority === 'High' ? 'bg-danger/10 text-danger' : 
          row.priority === 'Medium' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
        }`}>
          {row.priority}
        </span>
      )
    },
    {
      header: 'Cost',
      accessor: 'cost',
      cell: (row) => <span className="font-semibold text-text-main">${row.cost}</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => <Badge status={row.status === 'In Progress' ? 'Pending' : row.status} />
    },
    {
      header: 'Date',
      accessor: 'date',
      cell: (row) => <span className="text-text-secondary text-xs">{row.date}</span>
    }
  ];

  return (
    <PageContainer>
      <div className="space-y-5 select-none">
        
        {/* Statistics Dashboard Banner */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card border border-border p-4 rounded-xl flex items-center gap-4">
            <div className="h-10 w-10 bg-info/10 text-info flex items-center justify-center rounded-lg">
              <Clock size={20} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-text-secondary">In Progress</span>
              <p className="text-xl font-black text-text-main mt-0.5">{stats.active}</p>
            </div>
          </div>
          <div className="bg-card border border-border p-4 rounded-xl flex items-center gap-4">
            <div className="h-10 w-10 bg-success/10 text-success flex items-center justify-center rounded-lg">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-text-secondary">Jobs Completed</span>
              <p className="text-xl font-black text-text-main mt-0.5">{stats.completed}</p>
            </div>
          </div>
          <div className="bg-card border border-border p-4 rounded-xl flex items-center gap-4">
            <div className="h-10 w-10 bg-warning/10 text-warning flex items-center justify-center rounded-lg">
              <AlertTriangle size={20} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-text-secondary">Critical Alerts</span>
              <p className="text-xl font-black text-text-main mt-0.5">{stats.critical}</p>
            </div>
          </div>
          <div className="bg-card border border-border p-4 rounded-xl flex items-center gap-4">
            <div className="h-10 w-10 bg-danger/10 text-danger flex items-center justify-center rounded-lg">
              <Wrench size={20} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-text-secondary">Total Spend</span>
              <p className="text-xl font-black text-text-main mt-0.5">${stats.totalCost.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-card border border-border p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 flex-col sm:flex-row gap-3 w-full">
            <input
              type="text"
              placeholder="Search by order ID, vehicle ID, description..."
              className="bg-background text-text-main border border-border rounded-lg px-3.5 py-1.5 text-xs w-full max-w-sm focus:outline-none focus:border-info"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            
            <select
              className="bg-background text-text-main border border-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-info"
              value={filterPriority}
              onChange={e => setFilterPriority(e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select
              className="bg-background text-text-main border border-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-info"
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="Preventive">Preventive</option>
              <option value="Routine">Routine</option>
              <option value="Breakdown">Breakdown</option>
            </select>

            <select
              className="bg-background text-text-main border border-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-info"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <FileSpreadsheet size={14} className="mr-1.5" /> Export CSV
            </Button>
            {isManager && (
              <Button variant="info" size="sm" onClick={() => setIsModalOpen(true)}>
                <Plus size={14} className="mr-1.5" /> Schedule Servicing
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={fetchData} className="px-2">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <DataTable
            columns={columns}
            data={filteredLogs}
            loading={loading}
            onRowClick={handleRowClick}
            emptyMessage="No maintenance work orders found matching filters."
          />
        </div>
      </div>

      {/* Quick View Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedLog ? `Order log: ${selectedLog.id}` : 'Work Order'}
        className="w-full sm:w-[420px]"
      >
        {selectedLog && (
          <div className="space-y-6 text-left text-xs font-semibold text-text-secondary h-full flex flex-col justify-between">
            <div className="space-y-5 overflow-y-auto pr-1">
              
              <div className="bg-hover/10 p-4 border border-border rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-border/50 pb-2">
                  <span className="text-[10px] uppercase font-bold">Lifecycle Status</span>
                  <Badge status={selectedLog.status === 'In Progress' ? 'Pending' : selectedLog.status} />
                </div>
                <div>
                  <span className="block text-[9px] uppercase font-bold text-text-secondary">Assigned Vehicle</span>
                  <span className="block text-text-main font-bold text-sm mt-0.5">{selectedLog.vehicleId}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="block text-[9.5px] uppercase font-black text-text-main tracking-wider">Order Overview</span>
                <div className="border border-border/50 rounded-xl p-3.5 space-y-3 bg-card">
                  <div>
                    <span className="block text-[9px] uppercase font-bold">Priority Classification</span>
                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase mt-1 ${
                      selectedLog.priority === 'High' ? 'bg-danger/10 text-danger' : 
                      selectedLog.priority === 'Medium' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
                    }`}>
                      {selectedLog.priority}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase font-bold">Servicing Category</span>
                    <span className="text-text-main block font-bold mt-0.5">{selectedLog.type} Servicing</span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase font-bold">Job Costing</span>
                    <span className="text-text-main block font-bold mt-0.5">${selectedLog.cost.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase font-bold">Schedule Execution Date</span>
                    <span className="text-text-main block font-bold mt-0.5">{selectedLog.date}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase font-bold">Assigned Mechanics / Depot</span>
                    <span className="text-text-main block font-bold mt-0.5">{selectedLog.mechanic}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="block text-[9.5px] uppercase font-black text-text-main tracking-wider">Troubleshoot Directives</span>
                <div className="border border-border/50 rounded-xl p-3.5 bg-card">
                  <p className="text-text-main leading-relaxed">{selectedLog.description}</p>
                </div>
              </div>

              <div className="space-y-2">
                <span className="block text-[9.5px] uppercase font-black text-text-main tracking-wider">Timeline History</span>
                <div className="border border-border/50 rounded-xl p-3.5 bg-card space-y-3">
                  <div className="flex gap-3">
                    <div className="w-1.5 h-1.5 bg-info rounded-full mt-1.5" />
                    <div>
                      <p className="text-text-main font-bold">Service Dispatched</p>
                      <p className="text-[10px] text-text-secondary mt-0.5">Assigned to {selectedLog.mechanic}</p>
                    </div>
                  </div>
                  {selectedLog.status === 'Completed' && (
                    <div className="flex gap-3">
                      <div className="w-1.5 h-1.5 bg-success rounded-full mt-1.5" />
                      <div>
                        <p className="text-success font-bold">Verification Signed-off</p>
                        <p className="text-[10px] text-text-secondary mt-0.5">Marked completed by dispatcher</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {isManager && (
              <div className="border-t border-border pt-4 flex gap-2.5">
                {selectedLog.status === 'In Progress' && (
                  <Button variant="success" className="flex-1 font-bold text-xs" onClick={() => handleUpdateStatus(selectedLog.id, 'Completed')}>
                    Mark Completed
                  </Button>
                )}
                {selectedLog.status === 'In Progress' && (
                  <Button variant="outline" className="flex-1 font-bold text-xs text-danger border-danger/25 hover:bg-danger/5" onClick={() => handleUpdateStatus(selectedLog.id, 'Cancelled')}>
                    Cancel Order
                  </Button>
                )}
                <Button variant="danger" size="sm" onClick={() => handleDeleteLog(selectedLog.id)} className="px-2.5">
                  <Trash2 size={15} />
                </Button>
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* Schedule Maintenance Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule Vehicle Servicing"
        size="md"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 text-left text-xs font-semibold text-text-secondary">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-bold text-text-secondary">Select Fleet Vehicle</label>
            <select
              value={formData.vehicleId}
              onChange={e => handleInputChange('vehicleId', e.target.value)}
              className="bg-background text-text-main border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-info"
            >
              <option value="">-- Choose Carrier --</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>
                  {v.id} - {v.make} {v.model} ({v.plateNumber}) [{v.status}]
                </option>
              ))}
            </select>
            {errors.vehicleId && <p className="text-danger text-[10px]">{errors.vehicleId}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-text-secondary">Servicing Type</label>
              <select
                value={formData.type}
                onChange={e => handleInputChange('type', e.target.value)}
                className="bg-background text-text-main border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-info"
              >
                <option value="Routine">Routine</option>
                <option value="Preventive">Preventive</option>
                <option value="Breakdown">Breakdown Work</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-text-secondary">Priority</label>
              <select
                value={formData.priority}
                onChange={e => handleInputChange('priority', e.target.value)}
                className="bg-background text-text-main border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-info"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-text-secondary">Cost Estimation ($)</label>
              <input
                type="number"
                value={formData.cost}
                onChange={e => handleInputChange('cost', e.target.value)}
                placeholder="e.g. 450"
                className="bg-background text-text-main border border-border rounded-lg px-3.5 py-1.5 focus:outline-none focus:border-info"
              />
              {errors.cost && <p className="text-danger text-[10px]">{errors.cost}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-text-secondary">Target Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={e => handleInputChange('date', e.target.value)}
                className="bg-background text-text-main border border-border rounded-lg px-3.5 py-1.5 focus:outline-none focus:border-info"
              />
              {errors.date && <p className="text-danger text-[10px]">{errors.date}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-bold text-text-secondary">Assigned Mechanics Workshop</label>
            <input
              type="text"
              value={formData.mechanic}
              onChange={e => handleInputChange('mechanic', e.target.value)}
              className="bg-background text-text-main border border-border rounded-lg px-3.5 py-1.5 focus:outline-none focus:border-info"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-bold text-text-secondary">Servicing Diagnostics Details</label>
            <textarea
              value={formData.description}
              onChange={e => handleInputChange('description', e.target.value)}
              rows={3}
              placeholder="Detail issues such as brake pad wear, oil filter replacement, tire alignment details..."
              className="bg-background text-text-main border border-border rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-info"
            />
            {errors.description && <p className="text-danger text-[10px]">{errors.description}</p>}
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="info" type="submit" loading={isSubmitting}>
              Schedule Job
            </Button>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
};

export default Maintenance;
