import React, { useState, useEffect, useMemo } from 'react';
import {
  DollarSign,
  Plus,
  RefreshCw,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  CreditCard,
  FileText
} from 'lucide-react';
import PageContainer from '../../components/ui/PageContainer';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import DataTable from '../../components/ui/DataTable';
import Drawer from '../../components/ui/Drawer';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { expenseService } from '../../services/expenseService';
import { vehicleService } from '../../services/vehicleService';
import { activityService } from '../../services/activityService';
import { showToast } from '../../components/ui/Toast';

const Expenses = () => {
  const { currentUser } = useAuth();
  const isManager = currentUser?.role === 'Admin' || currentUser?.role === 'Fleet Manager';
  const isFinancial = currentUser?.role === 'Financial Analyst' || currentUser?.role === 'Admin';

  // State Management
  const [items, setItems] = useState(expenseService.getAll());
  const [vehicles, setVehicles] = useState(vehicleService.getAll());
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    vehicleId: '',
    category: 'Tolls',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    merchant: 'Operations Cash Pool'
  });
  const [errors, setErrors] = useState({});

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Load Data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [expenseList, vehiclesList] = await Promise.all([
        expenseService.getAll(),
        vehicleService.getAll()
      ]);
      setItems(expenseList);
      setVehicles(vehiclesList.filter(v => !v.isArchived));
    } catch {
      showToast.error('Failed to sync financial ledgers');
    } finally {
      setLoading(false);
    }
  };

  // KPIs
  const stats = useMemo(() => {
    const approved = items.filter(e => e.status === 'Approved').reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const pending = items.filter(e => e.status === 'Pending').reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const rejected = items.filter(e => e.status === 'Rejected').length;
    const totalCount = items.length;

    return { approved, pending, rejected, totalCount };
  }, [items]);

  // Client Side Filter
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = 
        item.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.vehicleId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.merchant?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = filterCategory ? item.category === filterCategory : true;
      const matchesStatus = filterStatus ? item.status === filterStatus : true;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [items, searchQuery, filterCategory, filterStatus]);

  // Open Quick View Drawer
  const handleRowClick = (row) => {
    setSelectedItem(row);
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
    if (!formData.vehicleId) tempErrors.vehicleId = 'Vehicle code is required';
    if (!formData.amount || Number(formData.amount) <= 0) tempErrors.amount = 'Amount must be positive';
    if (!formData.date) tempErrors.date = 'Expense date is required';
    if (!formData.description.trim()) tempErrors.description = 'Description notes are required';
    if (!formData.merchant.trim()) tempErrors.merchant = 'Merchant name is required';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast.error('Please fix validation warnings');
      return;
    }

    setIsSubmitting(true);
    try {
      const newExpense = await expenseService.create({
        ...formData,
        amount: Number(formData.amount),
        // If created by financial analyst, auto-approve, else default to pending
        status: isFinancial ? 'Approved' : 'Pending'
      });

      await activityService.create('Log Expense', `Created expense entry ${newExpense.id} ($${formData.amount}) for vehicle ${formData.vehicleId}`, currentUser.name);

      showToast.success(isFinancial ? 'Expense recorded and approved!' : 'Expense filed successfully. Awaiting approval.');
      setIsModalOpen(false);
      setFormData({
        vehicleId: '',
        category: 'Tolls',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        merchant: 'Operations Cash Pool'
      });
      fetchData();
    } catch {
      showToast.error('Failed to file expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Approve / Reject actions
  const handleAction = async (id, actionStatus) => {
    try {
      const updated = await expenseService.update(id, { status: actionStatus });
      setSelectedItem(updated);
      await activityService.create('Update Expense', `Flipped expense order ${id} to ${actionStatus}`, currentUser.name);
      showToast.success(`Expense invoice ${actionStatus.toLowerCase()} successfully`);
      fetchData();
    } catch {
      showToast.error('Failed to change invoice state');
    }
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this expense ledger?')) {
      try {
        await expenseService.delete(id);
        await activityService.create('Delete Expense', `Removed expense log ${id}`, currentUser.name);
        showToast.success('Expense record deleted');
        setIsDrawerOpen(false);
        fetchData();
      } catch {
        showToast.error('Failed to delete expense entry');
      }
    }
  };

  const handleExportCSV = () => {
    const headers = ['Expense ID', 'Vehicle ID', 'Category', 'Amount ($)', 'Date', 'Description', 'Status', 'Merchant'];
    const rows = filteredItems.map(e => [
      e.id,
      e.vehicleId,
      e.category,
      e.amount,
      e.date,
      e.description,
      e.status,
      e.merchant
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `TransitOps_Expenses_Export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast.success('CSV export compiled!');
  };

  const columns = [
    {
      header: 'ID',
      accessor: 'id',
      cell: (row) => <span className="font-bold text-text-main">{row.id}</span>
    },
    {
      header: 'Vehicle',
      accessor: 'vehicleId',
      cell: (row) => <span className="font-semibold text-text-secondary">{row.vehicleId}</span>
    },
    {
      header: 'Category',
      accessor: 'category',
      cell: (row) => <span className="font-bold text-text-main text-xs bg-hover/80 px-2.5 py-1 rounded-full">{row.category}</span>
    },
    {
      header: 'Amount',
      accessor: 'amount',
      cell: (row) => <span className="font-black text-text-main">${row.amount.toLocaleString()}</span>
    },
    {
      header: 'Billing Date',
      accessor: 'date',
      cell: (row) => <span className="text-text-secondary text-xs">{row.date}</span>
    },
    {
      header: 'Merchant',
      accessor: 'merchant',
      cell: (row) => <span className="truncate max-w-[150px] block text-text-main">{row.merchant}</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => <Badge status={row.status} />
    }
  ];

  return (
    <PageContainer>
      <div className="space-y-5 select-none">
        
        {/* KPI Dashboard */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card border border-border p-4 rounded-xl flex items-center gap-4">
            <div className="h-10 w-10 bg-success/10 text-success flex items-center justify-center rounded-lg">
              <CheckCircle size={20} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-text-secondary">Approved Spend</span>
              <p className="text-xl font-black text-text-main mt-0.5">${stats.approved.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-card border border-border p-4 rounded-xl flex items-center gap-4">
            <div className="h-10 w-10 bg-warning/10 text-warning flex items-center justify-center rounded-lg">
              <Clock size={20} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-text-secondary">Pending Approvals</span>
              <p className="text-xl font-black text-text-main mt-0.5">${stats.pending.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-card border border-border p-4 rounded-xl flex items-center gap-4">
            <div className="h-10 w-10 bg-danger/10 text-danger flex items-center justify-center rounded-lg">
              <XCircle size={20} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-text-secondary">Rejected Invoices</span>
              <p className="text-xl font-black text-text-main mt-0.5">{stats.rejected}</p>
            </div>
          </div>
          <div className="bg-card border border-border p-4 rounded-xl flex items-center gap-4">
            <div className="h-10 w-10 bg-info/10 text-info flex items-center justify-center rounded-lg">
              <DollarSign size={20} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-text-secondary">Total Logged</span>
              <p className="text-xl font-black text-text-main mt-0.5">{stats.totalCount}</p>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-card border border-border p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 flex-col sm:flex-row gap-3 w-full">
            <input
              type="text"
              placeholder="Search by vehicle ID, merchant, description..."
              className="bg-background text-text-main border border-border rounded-lg px-3.5 py-1.5 text-xs w-full max-w-sm focus:outline-none focus:border-info"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />

            <select
              className="bg-background text-text-main border border-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-info"
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Fuel">Fuel</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Tolls">Tolls</option>
              <option value="Salaries">Salaries</option>
              <option value="Insurance">Insurance</option>
              <option value="Miscellaneous">Miscellaneous</option>
            </select>

            <select
              className="bg-background text-text-main border border-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-info"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <FileSpreadsheet size={14} className="mr-1.5" /> Export CSV
            </Button>
            {isManager && (
              <Button variant="info" size="sm" onClick={() => setIsModalOpen(true)}>
                <Plus size={14} className="mr-1.5" /> File Expense
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={fetchData} className="px-2">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </Button>
          </div>
        </div>

        {/* Expenses List */}
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <DataTable
            columns={columns}
            data={filteredItems}
            loading={loading}
            onRowClick={handleRowClick}
            emptyMessage="No expense ledger matches found."
          />
        </div>
      </div>

      {/* Details Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedItem ? `Expense ticket: ${selectedItem.id}` : 'Expense Details'}
        className="w-full sm:w-[420px]"
      >
        {selectedItem && (
          <div className="space-y-6 text-left text-xs font-semibold text-text-secondary h-full flex flex-col justify-between">
            <div className="space-y-5 overflow-y-auto pr-1">
              
              <div className="bg-hover/10 p-4 border border-border rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-border/50 pb-2">
                  <span className="text-[10px] uppercase font-bold">Category</span>
                  <Badge status={selectedItem.status} />
                </div>
                <div>
                  <span className="block text-[9px] uppercase font-bold text-text-secondary">Billing Amount</span>
                  <span className="block text-success font-black text-xl mt-0.5">${selectedItem.amount.toLocaleString()} USD</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="block text-[9.5px] uppercase font-black text-text-main tracking-wider">Invoice Specifics</span>
                <div className="border border-border/50 rounded-xl p-3.5 space-y-3 bg-card">
                  <div>
                    <span className="block text-[9px] uppercase font-bold">Category Class</span>
                    <span className="text-text-main block font-bold mt-0.5">{selectedItem.category} Cost</span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase font-bold">Billing Merchant</span>
                    <div className="flex items-center gap-1.5 mt-1 text-text-main font-bold">
                      <CreditCard size={14} className="text-info" />
                      <span>{selectedItem.merchant}</span>
                    </div>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase font-bold">Filer Vehicle</span>
                    <span className="text-text-main block font-bold mt-0.5">{selectedItem.vehicleId || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase font-bold">Billing Date</span>
                    <span className="text-text-main block font-bold mt-0.5">{selectedItem.date}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="block text-[9.5px] uppercase font-black text-text-main tracking-wider">Invoice Justification</span>
                <div className="border border-border/50 rounded-xl p-3.5 bg-card">
                  <p className="text-text-main leading-relaxed">{selectedItem.description}</p>
                </div>
              </div>

            </div>

            <div className="border-t border-border pt-4 flex flex-col gap-2">
              {isFinancial && selectedItem.status === 'Pending' && (
                <div className="flex gap-2">
                  <Button variant="success" className="flex-1 font-bold text-xs" onClick={() => handleAction(selectedItem.id, 'Approved')}>
                    Approve
                  </Button>
                  <Button variant="outline" className="flex-1 font-bold text-xs text-danger border-danger/25 hover:bg-danger/5" onClick={() => handleAction(selectedItem.id, 'Rejected')}>
                    Reject
                  </Button>
                </div>
              )}
              {isManager && (
                <Button variant="danger" className="w-full font-bold text-xs" onClick={() => handleDeleteItem(selectedItem.id)}>
                  Delete Expense
                </Button>
              )}
            </div>
          </div>
        )}
      </Drawer>

      {/* File Expense Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="File Operational Expense"
        size="md"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 text-left text-xs font-semibold text-text-secondary">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-text-secondary">Assign Carrier Vehicle</label>
              <select
                value={formData.vehicleId}
                onChange={e => handleInputChange('vehicleId', e.target.value)}
                className="bg-background text-text-main border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-info"
              >
                <option value="">-- Choose Vehicle --</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.id} - {v.model}</option>
                ))}
              </select>
              {errors.vehicleId && <p className="text-danger text-[10px]">{errors.vehicleId}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-text-secondary">Cost Category</label>
              <select
                value={formData.category}
                onChange={e => handleInputChange('category', e.target.value)}
                className="bg-background text-text-main border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-info"
              >
                <option value="Tolls">Tolls</option>
                <option value="Salaries">Salaries / Payroll</option>
                <option value="Insurance">Insurance Premium</option>
                <option value="Fuel">Fuel Cost</option>
                <option value="Maintenance">Maintenance Cost</option>
                <option value="Miscellaneous">Miscellaneous</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-text-secondary">Billing Amount ($)</label>
              <input
                type="number"
                value={formData.amount}
                onChange={e => handleInputChange('amount', e.target.value)}
                placeholder="e.g. 150"
                className="bg-background text-text-main border border-border rounded-lg px-3.5 py-1.5 focus:outline-none focus:border-info"
              />
              {errors.amount && <p className="text-danger text-[10px]">{errors.amount}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-text-secondary">Receipt Date</label>
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
            <label className="text-[10px] uppercase font-bold text-text-secondary">Billing Merchant / Creditor</label>
            <input
              type="text"
              value={formData.merchant}
              onChange={e => handleInputChange('merchant', e.target.value)}
              className="bg-background text-text-main border border-border rounded-lg px-3.5 py-1.5 focus:outline-none focus:border-info"
            />
            {errors.merchant && <p className="text-danger text-[10px]">{errors.merchant}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-bold text-text-secondary">Filing Justification Details</label>
            <textarea
              value={formData.description}
              onChange={e => handleInputChange('description', e.target.value)}
              rows={3}
              placeholder="State clear reason for operational spend card charges..."
              className="bg-background text-text-main border border-border rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-info"
            />
            {errors.description && <p className="text-danger text-[10px]">{errors.description}</p>}
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="info" type="submit" loading={isSubmitting}>
              Submit Expense
            </Button>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
};

export default Expenses;
