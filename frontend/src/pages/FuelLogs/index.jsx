import React, { useState, useEffect, useMemo } from 'react';
import {
  Fuel,
  Plus,
  RefreshCw,
  FileSpreadsheet,
  Trash2,
  Calendar,
  AlertCircle,
  Eye,
  TrendingUp,
  MapPin,
  FileText,
  Info
} from 'lucide-react';
import PageContainer from '../../components/ui/PageContainer';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import DataTable from '../../components/ui/DataTable';
import Drawer from '../../components/ui/Drawer';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { fuelService } from '../../services/fuelService';
import { vehicleService } from '../../services/vehicleService';
import { driverService } from '../../services/driverService';
import { expenseService } from '../../services/expenseService';
import { activityService } from '../../services/activityService';
import { showToast } from '../../components/ui/Toast';

const FuelLogs = () => {
  const { currentUser } = useAuth();
  const isManager = currentUser?.role === 'Admin' || currentUser?.role === 'Fleet Manager';
  const isFinancial = currentUser?.role === 'Financial Analyst' || currentUser?.role === 'Admin';

  // State Management
  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    vehicleId: '',
    driverId: '',
    quantity: '',
    cost: '',
    odometer: '',
    stationName: 'Shell Logistics Hub',
    date: new Date().toISOString().split('T')[0]
  });
  const [errors, setErrors] = useState({});

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVehicle, setFilterVehicle] = useState('');
  const [filterStation, setFilterStation] = useState('');

  // Initial Load
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fuelLogs, vehiclesList, driversList] = await Promise.all([
        fuelService.getAll(),
        vehicleService.getAll(),
        driverService.getAll()
      ]);
      setLogs(fuelLogs);
      setVehicles(vehiclesList.filter(v => !v.isArchived));
      setDrivers(driversList);
    } catch {
      showToast.error('Failed to sync fuel ledger logs');
    } finally {
      setLoading(false);
    }
  };

  // KPIs
  const stats = useMemo(() => {
    const totalLiters = logs.reduce((sum, l) => sum + (Number(l.quantity) || 0), 0);
    const totalCost = logs.reduce((sum, l) => sum + (Number(l.cost) || 0), 0);
    const avgPrice = totalLiters > 0 ? (totalCost / totalLiters).toFixed(2) : '0.00';
    const totalRefills = logs.length;

    return { totalLiters, totalCost, avgPrice, totalRefills };
  }, [logs]);

  // Client Side Filtering
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Role-based check: Drivers only view own logs
      if (currentUser?.role === 'Driver') {
        const matchingDriver = drivers.find(d => d.email?.toLowerCase().trim() === currentUser.email?.toLowerCase().trim());
        if (!matchingDriver || log.driverId !== matchingDriver.id) {
          return false;
        }
      }

      const matchesSearch = 
        log.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.vehicleId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.receiptNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.stationName?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesVehicle = filterVehicle ? log.vehicleId === filterVehicle : true;
      const matchesStation = filterStation ? log.stationName?.includes(filterStation) : true;

      return matchesSearch && matchesVehicle && matchesStation;
    });
  }, [logs, searchQuery, filterVehicle, filterStation, currentUser, drivers]);

  const uniqueStations = useMemo(() => {
    const stations = logs.map(l => l.stationName).filter(Boolean);
    return [...new Set(stations)];
  }, [logs]);

  // Open Quick View Drawer
  const handleRowClick = (row) => {
    setSelectedLog(row);
    setIsDrawerOpen(true);
  };

  // Form inputs
  const handleInputChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const tempErrors = {};
    if (!formData.vehicleId) tempErrors.vehicleId = 'Vehicle assignment is required';
    if (!formData.driverId) tempErrors.driverId = 'Operator assignment is required';
    if (Number(formData.quantity) <= 0) tempErrors.quantity = 'Quantity must be positive';
    if (Number(formData.cost) <= 0) tempErrors.cost = 'Total cost must be positive';
    if (Number(formData.odometer) <= 0) tempErrors.odometer = 'Odometer is required';
    if (!formData.stationName.trim()) tempErrors.stationName = 'Refuel station name is required';
    if (!formData.date) tempErrors.date = 'Date is required';

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
      const newRefuel = await fuelService.create({
        ...formData,
        quantity: Number(formData.quantity),
        cost: Number(formData.cost),
        odometer: Number(formData.odometer)
      });

      // Update vehicle odometer
      await vehicleService.update(formData.vehicleId, { odometer: Number(formData.odometer) });

      // Create linked expense automatically
      await expenseService.create({
        vehicleId: formData.vehicleId,
        category: 'Fuel',
        amount: Number(formData.cost),
        date: formData.date,
        description: `Refueling ledger entry receipt ${newRefuel.receiptNumber}`,
        status: 'Approved',
        merchant: formData.stationName
      });

      await activityService.create('Log Fuel', `Logged refuel receipt ${newRefuel.receiptNumber} ($${formData.cost}) for vehicle ${formData.vehicleId}`, currentUser.name);

      showToast.success('Fuel log submitted & expense recorded!');
      setIsModalOpen(false);
      setFormData({
        vehicleId: '',
        driverId: '',
        quantity: '',
        cost: '',
        odometer: '',
        stationName: 'Shell Logistics Hub',
        date: new Date().toISOString().split('T')[0]
      });
      fetchData();
    } catch {
      showToast.error('Failed to log refuel entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLog = async (id) => {
    if (window.confirm('Are you sure you want to delete this fuel record? The associated expense ledger remains unchanged.')) {
      try {
        await fuelService.delete(id);
        await activityService.create('Delete Fuel Log', `Removed fuel refill log ${id}`, currentUser.name);
        showToast.success('Refill record deleted');
        setIsDrawerOpen(false);
        fetchData();
      } catch {
        showToast.error('Failed to delete log entry');
      }
    }
  };

  const handleExportCSV = () => {
    const headers = ['Refill ID', 'Receipt Number', 'Vehicle ID', 'Driver ID', 'Date', 'Quantity (Liters)', 'Cost ($)', 'Odometer', 'Station Name'];
    const rows = filteredLogs.map(l => [
      l.id,
      l.receiptNumber,
      l.vehicleId,
      l.driverId,
      l.date,
      l.quantity,
      l.cost,
      l.odometer,
      l.stationName
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `TransitOps_Fuel_Export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast.success('CSV export compiled!');
  };

  const columns = [
    {
      header: 'Receipt ID',
      accessor: 'receiptNumber',
      cell: (row) => <span className="font-bold text-text-main">{row.receiptNumber}</span>
    },
    {
      header: 'Vehicle',
      accessor: 'vehicleId',
      cell: (row) => <span className="font-semibold text-text-secondary">{row.vehicleId}</span>
    },
    {
      header: 'Driver',
      accessor: 'driverId',
      cell: (row) => <span className="font-semibold text-text-secondary">{row.driverId}</span>
    },
    {
      header: 'Refuel Date',
      accessor: 'date',
      cell: (row) => <span className="text-text-secondary text-xs">{row.date}</span>
    },
    {
      header: 'Liters',
      accessor: 'quantity',
      cell: (row) => <span className="font-semibold text-text-main">{row.quantity} L</span>
    },
    {
      header: 'Cost',
      accessor: 'cost',
      cell: (row) => <span className="font-semibold text-text-main">${row.cost}</span>
    },
    {
      header: 'Station',
      accessor: 'stationName',
      cell: (row) => <span className="truncate max-w-[150px] block text-text-main">{row.stationName}</span>
    }
  ];

  return (
    <PageContainer>
      <div className="space-y-5 select-none">
        
        {/* KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card border border-border p-4 rounded-xl flex items-center gap-4">
            <div className="h-10 w-10 bg-info/10 text-info flex items-center justify-center rounded-lg">
              <Fuel size={20} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-text-secondary">Refills Registered</span>
              <p className="text-xl font-black text-text-main mt-0.5">{stats.totalRefills}</p>
            </div>
          </div>
          <div className="bg-card border border-border p-4 rounded-xl flex items-center gap-4">
            <div className="h-10 w-10 bg-success/10 text-success flex items-center justify-center rounded-lg">
              <TrendingUp size={20} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-text-secondary">Total Liters</span>
              <p className="text-xl font-black text-text-main mt-0.5">{stats.totalLiters.toLocaleString()} L</p>
            </div>
          </div>
          <div className="bg-card border border-border p-4 rounded-xl flex items-center gap-4">
            <div className="h-10 w-10 bg-warning/10 text-warning flex items-center justify-center rounded-lg">
              <AlertCircle size={20} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-text-secondary">Avg. price / L</span>
              <p className="text-xl font-black text-text-main mt-0.5">${stats.avgPrice}</p>
            </div>
          </div>
          <div className="bg-card border border-border p-4 rounded-xl flex items-center gap-4">
            <div className="h-10 w-10 bg-danger/10 text-danger flex items-center justify-center rounded-lg">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-text-secondary">Total Spend</span>
              <p className="text-xl font-black text-text-main mt-0.5">${stats.totalCost.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-card border border-border p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 flex-col sm:flex-row gap-3 w-full">
            <input
              type="text"
              placeholder="Search by receipt ID, vehicle ID, station name..."
              className="bg-background text-text-main border border-border rounded-lg px-3.5 py-1.5 text-xs w-full max-w-sm focus:outline-none focus:border-info"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />

            <select
              className="bg-background text-text-main border border-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-info"
              value={filterVehicle}
              onChange={e => setFilterVehicle(e.target.value)}
            >
              <option value="">All Vehicles</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.id} - {v.model}</option>
              ))}
            </select>

            <select
              className="bg-background text-text-main border border-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-info"
              value={filterStation}
              onChange={e => setFilterStation(e.target.value)}
            >
              <option value="">All Stations</option>
              {uniqueStations.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <FileSpreadsheet size={14} className="mr-1.5" /> Export CSV
            </Button>
            {isManager && (
              <Button variant="info" size="sm" onClick={() => setIsModalOpen(true)}>
                <Plus size={14} className="mr-1.5" /> Log Fuel Card
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={fetchData} className="px-2">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </Button>
          </div>
        </div>

        {/* List Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <DataTable
            columns={columns}
            data={filteredLogs}
            loading={loading}
            onRowClick={handleRowClick}
            emptyMessage="No fuel fill logs registered matching criteria."
          />
        </div>
      </div>

      {/* Details Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedLog ? `Refill log: ${selectedLog.id}` : 'Fuel Log'}
        className="w-full sm:w-[420px]"
      >
        {selectedLog && (
          <div className="space-y-6 text-left text-xs font-semibold text-text-secondary h-full flex flex-col justify-between">
            <div className="space-y-5 overflow-y-auto pr-1">
              
              <div className="bg-hover/10 p-4 border border-border rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-border/50 pb-2">
                  <span className="text-[10px] uppercase font-bold">Log Record ID</span>
                  <span className="font-bold text-text-main">{selectedLog.id}</span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase font-bold text-text-secondary">Refueling Station</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <MapPin size={14} className="text-info" />
                    <span className="block text-text-main font-bold text-sm leading-tight">
                      {selectedLog.stationName}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="block text-[9.5px] uppercase font-black text-text-main tracking-wider">Transaction Overview</span>
                <div className="border border-border/50 rounded-xl p-3.5 space-y-3 bg-card">
                  <div>
                    <span className="block text-[9px] uppercase font-bold">Linked Receipt</span>
                    <span className="text-text-main block font-black mt-0.5">{selectedLog.receiptNumber}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase font-bold">Vehicle Code</span>
                    <span className="text-text-main block font-bold mt-0.5">{selectedLog.vehicleId}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase font-bold">Operator Custodian</span>
                    <span className="text-text-main block font-bold mt-0.5">{selectedLog.driverId}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase font-bold">Log Refill Date</span>
                    <span className="text-text-main block font-bold mt-0.5">{selectedLog.date}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase font-bold">Logged Liter Volume</span>
                    <span className="text-text-main block font-bold mt-0.5">{selectedLog.quantity} Liters</span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase font-bold">Odometer Milage</span>
                    <span className="text-text-main block font-bold mt-0.5">{selectedLog.odometer.toLocaleString()} km</span>
                  </div>
                  <div className="border-t border-border/50 pt-2.5">
                    <span className="block text-[9px] uppercase font-bold">Financial Billing</span>
                    <span className="text-success block text-sm font-black mt-0.5">${selectedLog.cost.toLocaleString()} USD</span>
                  </div>
                </div>
              </div>

              <div className="border border-border/50 rounded-xl p-3.5 bg-hover/5 flex gap-3.5">
                <Info size={18} className="text-info shrink-0" />
                <p className="leading-relaxed">A corresponding financial expense invoice was compiled automatically in the ledger on refill authorization.</p>
              </div>

            </div>

            {isManager && (
              <div className="border-t border-border pt-4 flex">
                <Button variant="danger" className="w-full font-bold text-xs" onClick={() => handleDeleteLog(selectedLog.id)}>
                  Delete Fuel Log
                </Button>
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* Log Fuel Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register Fuel Receipt"
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
              <label className="text-[10px] uppercase font-bold text-text-secondary">Custodian Operator</label>
              <select
                value={formData.driverId}
                onChange={e => handleInputChange('driverId', e.target.value)}
                className="bg-background text-text-main border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-info"
              >
                <option value="">-- Choose Driver --</option>
                {drivers.map(d => (
                  <option key={d.id} value={d.id}>{d.id} - {d.name}</option>
                ))}
              </select>
              {errors.driverId && <p className="text-danger text-[10px]">{errors.driverId}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-text-secondary">Volume (Liters)</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={e => handleInputChange('quantity', e.target.value)}
                placeholder="e.g. 120"
                className="bg-background text-text-main border border-border rounded-lg px-3.5 py-1.5 focus:outline-none focus:border-info"
              />
              {errors.quantity && <p className="text-danger text-[10px]">{errors.quantity}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-text-secondary">Refill Billing ($)</label>
              <input
                type="number"
                value={formData.cost}
                onChange={e => handleInputChange('cost', e.target.value)}
                placeholder="e.g. 222.50"
                className="bg-background text-text-main border border-border rounded-lg px-3.5 py-1.5 focus:outline-none focus:border-info"
              />
              {errors.cost && <p className="text-danger text-[10px]">{errors.cost}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-text-secondary">Odometer (km)</label>
              <input
                type="number"
                value={formData.odometer}
                onChange={e => handleInputChange('odometer', e.target.value)}
                placeholder="e.g. 154300"
                className="bg-background text-text-main border border-border rounded-lg px-3.5 py-1.5 focus:outline-none focus:border-info"
              />
              {errors.odometer && <p className="text-danger text-[10px]">{errors.odometer}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-text-secondary">Gas Station Merchant</label>
              <input
                type="text"
                value={formData.stationName}
                onChange={e => handleInputChange('stationName', e.target.value)}
                className="bg-background text-text-main border border-border rounded-lg px-3.5 py-1.5 focus:outline-none focus:border-info"
              />
              {errors.stationName && <p className="text-danger text-[10px]">{errors.stationName}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-text-secondary">Refill Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={e => handleInputChange('date', e.target.value)}
                className="bg-background text-text-main border border-border rounded-lg px-3.5 py-1.5 focus:outline-none focus:border-info"
              />
              {errors.date && <p className="text-danger text-[10px]">{errors.date}</p>}
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="info" type="submit" loading={isSubmitting}>
              Authorise Entry
            </Button>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
};

export default FuelLogs;
