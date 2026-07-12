import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck,
  Users,
  Compass,
  Wrench,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Plus,
  Fuel,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  DollarSign,
  AlertCircle,
  Play,
  Pause,
  CheckSquare,
  FileText,
  Upload,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  MapPin,
  Calendar,
  Bell,
  HelpCircle,
  Check,
  X
} from 'lucide-react';

// UI components
import PageContainer from '../../components/ui/PageContainer';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Drawer from '../../components/ui/Drawer';
import ImageUpload from '../../components/ui/ImageUpload';
import { VehicleImage, DriverAvatar } from '../../components/ui/FallbackImage';
import ConfirmationDialog from '../../components/ConfirmationDialog';

// Mock Services & Context
import { useAuth, ROLES } from '../../context/AuthContext';
import { vehicleService } from '../../services/vehicleService';
import { driverService } from '../../services/driverService';
import { tripService } from '../../services/tripService';
import { expenseService } from '../../services/expenseService';
import { maintenanceService } from '../../services/maintenanceService';
import { fuelService } from '../../services/fuelService';
import { notificationService } from '../../services/notificationService';
import { showToast } from '../../components/ui/Toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Global operational states
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [fuelLogs, setFuelLogs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Time & Date Header states
  const [currentTime, setCurrentTime] = useState(new Date());

  // Trip Drawer states
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [isTripDrawerOpen, setIsTripDrawerOpen] = useState(false);

  // Driver mobile workspace inputs
  const [driverTripStatus, setDriverTripStatus] = useState('Scheduled');
  const [deliveryProofImage, setDeliveryProofImage] = useState(null);
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
  const [isReportIssueModalOpen, setIsReportIssueModalOpen] = useState(false);
  const [fuelLiters, setFuelLiters] = useState('');
  const [fuelCost, setFuelCost] = useState('');
  const [reportedIssueDesc, setReportedIssueDesc] = useState('');

  // Confirmation Modal state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Clock Update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchOperationalData();
  }, []);

  const fetchOperationalData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const [vData, dData, tData, eData, mData, fData, nData] = await Promise.all([
        vehicleService.getAll(),
        driverService.getAll(),
        tripService.getAll(),
        expenseService.getAll(),
        maintenanceService.getAll(),
        fuelService.getAll(),
        notificationService.getAll()
      ]);

      setVehicles(vData);
      setDrivers(dData);
      setTrips(tData);
      setExpenses(eData);
      setMaintenance(mData);
      setFuelLogs(fData);
      setNotifications(nData);
    } catch (err) {
      showToast.error('Encountered an exception mapping command center logs');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // 1. KPI Aggregations
  const stats = useMemo(() => {
    const activeVehicles = vehicles.filter(v => !v.isArchived);
    const available = activeVehicles.filter(v => v.status === 'Available').length;
    const onTrip = activeVehicles.filter(v => v.status === 'On Trip').length;
    const maintenanceCount = activeVehicles.filter(v => v.status === 'Maintenance').length;
    const retired = activeVehicles.filter(v => v.status === 'Retired').length;
    
    const availableDriversCount = drivers.filter(d => d.status === 'Available').length;
    
    // Count today's trips
    const todayStr = new Date().toISOString().split('T')[0];
    const todayTrips = trips.filter(t => t.startDate?.includes(todayStr) || t.status === 'Active').length;

    return {
      totalVehicles: activeVehicles.length,
      available,
      onTrip,
      maintenance: maintenanceCount,
      retired,
      availableDriversCount,
      todayTrips
    };
  }, [vehicles, drivers, trips]);

  // 2. Financial Metrics
  const financialMetrics = useMemo(() => {
    // Only approved expenses are included in reports / summaries
    const approvedExpenses = expenses.filter(e => e.status === 'Approved');
    const totalExpenses = approvedExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);
    const pendingExpenses = expenses.filter(e => e.status === 'Pending');

    const fuelCostTotal = approvedExpenses.filter(e => e.category === 'Fuel').reduce((acc, e) => acc + e.amount, 0);
    const maintCostTotal = approvedExpenses.filter(e => e.category === 'Maintenance' || e.category === 'Repair').reduce((acc, e) => acc + e.amount, 0);
    const otherCostTotal = approvedExpenses.filter(e => e.category !== 'Fuel' && e.category !== 'Maintenance' && e.category !== 'Repair').reduce((acc, e) => acc + e.amount, 0);
    
    // Budget usage (e.g. monthly budget is 1,500,000 INR)
    const monthlyBudget = 1500000;
    const budgetUsagePercent = Math.min(Math.round((totalExpenses / monthlyBudget) * 100), 100);

    return {
      totalExpenses,
      pendingExpenses,
      fuelCostTotal,
      maintCostTotal,
      otherCostTotal,
      budgetUsagePercent
    };
  }, [expenses]);

  const pendingCounts = useMemo(() => {
    return {
      vehicles: vehicles.filter(v => v.status === 'Pending Approval').length,
      drivers: drivers.filter(d => d.status === 'Pending Approval').length,
      maintenance: maintenance.filter(m => m.status === 'Pending').length,
      expenses: expenses.filter(e => e.status === 'Pending').length,
      total: vehicles.filter(v => v.status === 'Pending Approval').length +
             drivers.filter(d => d.status === 'Pending Approval').length +
             maintenance.filter(m => m.status === 'Pending').length +
             expenses.filter(e => e.status === 'Pending').length
    };
  }, [vehicles, drivers, maintenance, expenses]);

  // 3. Driver context specific objects
  const driverVehicle = useMemo(() => {
    if (currentUser.role !== ROLES.DRIVER) return null;
    return vehicles.find(v => v.id === currentUser.assignedVehicleId) || null;
  }, [currentUser, vehicles]);

  const driverTrip = useMemo(() => {
    if (currentUser.role !== ROLES.DRIVER) return null;
    const matchingDriver = drivers.find(d => d.email === currentUser.email);
    if (!matchingDriver) return null;
    return trips.find(t => t.driverId === matchingDriver.id && t.status !== 'Completed') || null;
  }, [currentUser, trips, drivers]);

  useEffect(() => {
    if (driverTrip) {
      setDriverTripStatus(driverTrip.status);
    }
  }, [driverTrip]);

  // Actions
  const handleApproveExpense = (id) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Approve Expense Transaction',
      message: 'Are you sure you want to approve this expense record? Approved expenses will be factored into all reporting statements.',
      onConfirm: async () => {
        try {
          const updated = await expenseService.update(id, { status: 'Approved' });
          setExpenses(prev => prev.map(e => e.id === id ? updated : e));
          showToast.success('Expense transaction approved');
          fetchOperationalData(true);
        } catch {
          showToast.error('Operation failed');
        }
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleRejectExpense = (id) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Reject Expense Transaction',
      message: 'Are you sure you want to reject this expense? Rejected transactions will be excluded from all dashboards and financial statements.',
      onConfirm: async () => {
        try {
          const updated = await expenseService.update(id, { status: 'Rejected' });
          setExpenses(prev => prev.map(e => e.id === id ? updated : e));
          showToast.success('Expense transaction marked as Rejected');
          fetchOperationalData(true);
        } catch {
          showToast.error('Operation failed');
        }
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };
  
  const handleDriverFuelLogSubmit = async (e) => {
    e.preventDefault();
    if (!fuelLiters || !fuelCost) {
      showToast.error('Please input liters and cost parameters');
      return;
    }

    const matchingDriver = drivers.find(d => d.email === currentUser.email);
    const driverId = matchingDriver ? matchingDriver.id : null;
    const vehicleId = driverTrip?.vehicleId || driverVehicle?.id;

    if (!vehicleId) {
      showToast.error('No active vehicle assignment found for logging fuel.');
      return;
    }

    try {
      await fuelService.create({
        vehicleId,
        driverId,
        quantity: Number(fuelLiters),
        cost: Number(fuelCost),
        odometer: driverVehicle?.odometer || 100000,
        stationName: 'Driver Terminal Refuel',
        date: new Date().toISOString().split('T')[0]
      });

      showToast.success(`Refuel entry registered! Logged ${fuelLiters}L for INR ${fuelCost}`);
      setFuelLiters('');
      setFuelCost('');
      setIsFuelModalOpen(false);
      fetchOperationalData(true);
    } catch (err) {
      showToast.error(err.response?.data?.error || 'Failed to submit fuel log');
    }
  };
  const handleDriverIssueReportSubmit = (e) => {
    e.preventDefault();
    if (!reportedIssueDesc.trim()) {
      showToast.error('Issue diagnostic comments cannot be empty');
      return;
    }
    showToast.success('Incident ticket created! Operations dispatch notified.');
    setReportedIssueDesc('');
    setIsReportIssueModalOpen(false);
  };

  const handleRowClick = (trip) => {
    setSelectedTrip(trip);
    setIsTripDrawerOpen(true);
  };

  // WORKSPACE VIEW RENDERERS

  // 1. FLEET MANAGER DASHBOARD (Fit to one screen, focused cards, approvals list)
  const renderFleetManagerWorkspace = () => {
    const recentTripsList = trips.slice(0, 5);
    const recentNotifsList = notifications.slice(0, 5);

    return (
      <div className="space-y-6 text-left">
        {/* Header Greeting Banner */}
        <div className="bg-card border border-border rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div>
            <h3 className="text-sm font-black text-text-main uppercase tracking-wider">Fleet Management Desk</h3>
            <p className="text-xs text-text-secondary font-semibold mt-1">
              Live updates: {currentTime.toLocaleDateString()} at {currentTime.toLocaleTimeString()}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => fetchOperationalData(true)} className="flex items-center gap-1.5 font-bold">
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
            <span>Sync Registry</span>
          </Button>
        </div>

        {/* 6 KPI Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-card border border-border p-4 rounded-xl flex flex-col justify-between h-24">
            <span className="text-[10px] font-bold text-text-secondary uppercase">Total Fleet</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-black text-text-main leading-none">{stats.totalVehicles}</span>
              <Truck size={16} className="text-info" />
            </div>
          </div>
          <div className="bg-card border border-border p-4 rounded-xl flex flex-col justify-between h-24">
            <span className="text-[10px] font-bold text-text-secondary uppercase">Available</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-black text-success leading-none">{stats.available}</span>
              <CheckCircle size={16} className="text-success" />
            </div>
          </div>
          <div className="bg-card border border-border p-4 rounded-xl flex flex-col justify-between h-24">
            <span className="text-[10px] font-bold text-text-secondary uppercase">On Trip</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-black text-info leading-none">{stats.onTrip}</span>
              <Compass size={16} className="text-info" />
            </div>
          </div>
          <div className="bg-card border border-border p-4 rounded-xl flex flex-col justify-between h-24">
            <span className="text-[10px] font-bold text-text-secondary uppercase">Maintenance</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-black text-warning leading-none">{stats.maintenance}</span>
              <Wrench size={16} className="text-warning" />
            </div>
          </div>
          <div className="bg-card border border-border p-4 rounded-xl flex flex-col justify-between h-24">
            <span className="text-[10px] font-bold text-text-secondary uppercase">Drivers Avail</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-black text-success leading-none">{stats.availableDriversCount}</span>
              <Users size={16} className="text-success" />
            </div>
          </div>
          <div className="bg-card border border-border p-4 rounded-xl flex flex-col justify-between h-24">
            <span className="text-[10px] font-bold text-text-secondary uppercase">Today's Trips</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-black text-text-main leading-none">{stats.todayTrips}</span>
              <Layers size={16} className="text-info" />
            </div>
          </div>
        </div>

        {/* Pending Approvals & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Pending Approvals List */}
          <div className="lg:col-span-2">
            <Card 
              title="Operational Approval Center" 
              subtitle="Pending authorizations required to execute fleet operations" 
              className="h-full"
              actions={
                <Button variant="info" size="sm" onClick={() => navigate('/approvals')} className="text-xs font-bold">
                  Open Approval Center &rarr;
                </Button>
              }
            >
              {pendingCounts.total === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center text-xs font-semibold text-text-secondary">
                  <CheckCircle size={32} className="text-success mb-2" />
                  <span>All fleet operations are cleared and authorized!</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                  <div className="p-4 bg-hover/10 border border-border/80 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="block font-bold text-text-main">Vehicle Registrations</span>
                      <span className="block text-[10.5px] text-text-secondary mt-0.5">Awaiting regulatory compliance review</span>
                    </div>
                    <span className={`text-base font-black px-2.5 py-1 rounded-lg ${pendingCounts.vehicles > 0 ? 'bg-danger/10 text-danger' : 'bg-hover text-text-secondary'}`}>
                      {pendingCounts.vehicles}
                    </span>
                  </div>

                  <div className="p-4 bg-hover/10 border border-border/80 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="block font-bold text-text-main">Driver Credentials</span>
                      <span className="block text-[10.5px] text-text-secondary mt-0.5">Licensing background checks pending</span>
                    </div>
                    <span className={`text-base font-black px-2.5 py-1 rounded-lg ${pendingCounts.drivers > 0 ? 'bg-danger/10 text-danger' : 'bg-hover text-text-secondary'}`}>
                      {pendingCounts.drivers}
                    </span>
                  </div>

                  <div className="p-4 bg-hover/10 border border-border/80 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="block font-bold text-text-main">Maintenance Scheduling</span>
                      <span className="block text-[10.5px] text-text-secondary mt-0.5">Commercial repair order approvals</span>
                    </div>
                    <span className={`text-base font-black px-2.5 py-1 rounded-lg ${pendingCounts.maintenance > 0 ? 'bg-warning/10 text-warning' : 'bg-hover text-text-secondary'}`}>
                      {pendingCounts.maintenance}
                    </span>
                  </div>

                  <div className="p-4 bg-hover/10 border border-border/80 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="block font-bold text-text-main">Expense Invoices</span>
                      <span className="block text-[10.5px] text-text-secondary mt-0.5">General ledger transaction audits</span>
                    </div>
                    <span className={`text-base font-black px-2.5 py-1 rounded-lg ${pendingCounts.expenses > 0 ? 'bg-warning/10 text-warning' : 'bg-hover text-text-secondary'}`}>
                      {pendingCounts.expenses}
                    </span>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Quick Actions Console */}
          <div className="lg:col-span-1">
            <Card title="Operations Console" subtitle="Administrative actions registry" className="h-full">
              <div className="grid grid-cols-1 gap-2.5">
                <button onClick={() => navigate('/vehicles?add=true')} className="flex items-center gap-3 p-3 bg-hover/20 hover:bg-hover/40 border border-border/60 hover:border-border rounded-xl transition-all w-full text-left">
                  <div className="p-2.5 bg-card border border-border rounded-lg text-text-secondary"><Plus size={15} /></div>
                  <div><span className="block text-xs font-bold text-text-main">Register Vehicle</span><span className="block text-[9px] text-text-secondary font-medium">Add new vehicle fleet</span></div>
                </button>
                <button onClick={() => navigate('/drivers?add=true')} className="flex items-center gap-3 p-3 bg-hover/20 hover:bg-hover/40 border border-border/60 hover:border-border rounded-xl transition-all w-full text-left">
                  <div className="p-2.5 bg-card border border-border rounded-lg text-text-secondary"><Users size={15} /></div>
                  <div><span className="block text-xs font-bold text-text-main">Register Driver</span><span className="block text-[9px] text-text-secondary font-medium">Add custodian driver logs</span></div>
                </button>
                <button onClick={() => navigate('/trips/dispatch')} className="flex items-center gap-3 p-3 bg-hover/20 hover:bg-hover/40 border border-border/60 hover:border-border rounded-xl transition-all w-full text-left">
                  <div className="p-2.5 bg-card border border-border rounded-lg text-text-secondary"><Compass size={15} /></div>
                  <div><span className="block text-xs font-bold text-text-main">Create Trip</span><span className="block text-[9px] text-text-secondary font-medium">Dispatch cargo routing</span></div>
                </button>
                <button onClick={() => navigate('/maintenance')} className="flex items-center gap-3 p-3 bg-hover/20 hover:bg-hover/40 border border-border/60 hover:border-border rounded-xl transition-all w-full text-left">
                  <div className="p-2.5 bg-card border border-border rounded-lg text-text-secondary"><Wrench size={15} /></div>
                  <div><span className="block text-xs font-bold text-text-main">Maintenance Service</span><span className="block text-[9px] text-text-secondary font-medium">Schedule mechanics dispatch</span></div>
                </button>
              </div>
            </Card>
          </div>
        </div>

        {/* Recent Trips & Recent Notifications Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Trips */}
          <div className="lg:col-span-2">
            <Card title="Recent Logistics Dispatches" subtitle="Active dispatches status summaries" actions={<Button variant="outline" size="sm" onClick={() => navigate('/trips')} className="text-xs">View All Trips</Button>}>
              <div className="overflow-x-auto border border-border/85 rounded-xl">
                <table className="w-full text-xs text-text-secondary text-left border-collapse font-semibold">
                  <thead>
                    <tr className="border-b border-border bg-hover/10 text-[9.5px] text-text-secondary/70 uppercase">
                      <th className="py-2.5 px-3">Trip ID</th>
                      <th className="py-2.5 px-3">Vehicle</th>
                      <th className="py-2.5 px-3">Driver</th>
                      <th className="py-2.5 px-3">Destination</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTripsList.map(trip => {
                      const vehicleObj = vehicles.find(v => v.id === trip.vehicleId);
                      const driverObj = drivers.find(d => d.id === trip.driverId);
                      return (
                        <tr key={trip.id} onClick={() => handleRowClick(trip)} className="border-b border-border/60 hover:bg-hover/20 cursor-pointer transition-colors">
                          <td className="py-2.5 px-3 font-bold text-info">{trip.tripNumber}</td>
                          <td className="py-2.5 px-3">{vehicleObj?.plateNumber || trip.vehicleId}</td>
                          <td className="py-2.5 px-3">{driverObj?.name || 'Unassigned'}</td>
                          <td className="py-2.5 px-3 truncate max-w-[120px]">{trip.destination}</td>
                          <td className="py-2.5 px-3"><Badge status={trip.status} className="scale-90" /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Recent Notifications */}
          <div className="lg:col-span-1">
            <Card title="Operations Alerts" subtitle="Inbox notifications registry" actions={<Button variant="outline" size="sm" onClick={() => navigate('/notifications')} className="text-xs">View All</Button>}>
              <div className="space-y-3.5 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar text-xs font-semibold text-text-secondary">
                {recentNotifsList.map(n => (
                  <div key={n.id} className={`flex items-start gap-2.5 pb-3.5 border-b border-border/40 last:border-0 last:pb-0 ${n.unread ? 'text-text-main font-black' : ''}`}>
                    <div className="p-1 rounded bg-hover/80 shrink-0 mt-0.5"><Bell size={12} className={n.unread ? 'text-info' : 'text-text-secondary'} /></div>
                    <div>
                      <p className="leading-tight">{n.title}</p>
                      <span className="text-[9.5px] text-text-secondary font-semibold block mt-1">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

      </div>
    );
  };

  // 2. FINANCIAL ANALYST DASHBOARD (Fully customized for finance, line/donut/bar charts, transactions ledger)
  const renderFinancialWorkspace = () => {
    const pendingApprovalsList = financialMetrics.pendingExpenses.slice(0, 5);
    // Grab latest 5 approved transactions
    const approvedTransactions = expenses.filter(e => e.status === 'Approved').slice(0, 5);

    return (
      <div className="space-y-6 text-left">
        {/* Greeting Clock Header */}
        <div className="bg-card border border-border rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div>
            <h3 className="text-sm font-black text-text-main uppercase tracking-wider">Financial Audit Console</h3>
            <p className="text-xs text-text-secondary font-semibold mt-1">
              Active Session: Analyst Account &middot; time: {currentTime.toLocaleTimeString()}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => fetchOperationalData(true)} className="flex items-center gap-1.5 font-bold">
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
            <span>Reload General Ledger</span>
          </Button>
        </div>

        {/* Finance KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-card border border-border p-4 rounded-xl flex flex-col justify-between h-24">
            <span className="text-[9.5px] font-bold text-text-secondary uppercase">Monthly Expenses</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-lg font-black text-text-main leading-none">INR {financialMetrics.totalExpenses?.toLocaleString()}</span>
              <DollarSign size={16} className="text-success" />
            </div>
          </div>
          <div className="bg-card border border-border p-4 rounded-xl flex flex-col justify-between h-24">
            <span className="text-[9.5px] font-bold text-text-secondary uppercase">Fuel Cost</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-lg font-black text-text-main leading-none">INR {financialMetrics.fuelCostTotal?.toLocaleString()}</span>
              <Fuel size={16} className="text-info" />
            </div>
          </div>
          <div className="bg-card border border-border p-4 rounded-xl flex flex-col justify-between h-24">
            <span className="text-[9.5px] font-bold text-text-secondary uppercase">Maintenance Cost</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-lg font-black text-text-main leading-none">INR {financialMetrics.maintCostTotal?.toLocaleString()}</span>
              <Wrench size={16} className="text-warning" />
            </div>
          </div>
          <div className="bg-card border border-border p-4 rounded-xl flex flex-col justify-between h-24">
            <span className="text-[9.5px] font-bold text-text-secondary uppercase">Net Operating Cost</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-lg font-black text-text-main leading-none">INR {(financialMetrics.totalExpenses + 85000)?.toLocaleString()}</span>
              <DollarSign size={16} className="text-danger" />
            </div>
          </div>
          <div className="bg-card border border-border p-4 rounded-xl flex flex-col justify-between h-24">
            <span className="text-[9.5px] font-bold text-text-secondary uppercase">Pending Approvals</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-lg font-black text-warning leading-none">{financialMetrics.pendingExpenses.length}</span>
              <AlertCircle size={16} className="text-warning" />
            </div>
          </div>
          <div className="bg-card border border-border p-4 rounded-xl flex flex-col justify-between h-24">
            <span className="text-[9.5px] font-bold text-text-secondary uppercase">Budget Utilized</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-lg font-black text-text-main leading-none">{financialMetrics.budgetUsagePercent}%</span>
              <TrendingUp size={16} className="text-info" />
            </div>
          </div>
        </div>

        {/* Charts & Graphs block */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* 1. Expense Trend Line Chart (SVG representation) */}
          <Card title="Monthly Expense Trend" subtitle="Daily cost aggregation tracking">
            <div className="h-44 flex items-end justify-center relative w-full pt-4">
              <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--info)" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="var(--info)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Area path */}
                <path d="M 0 90 Q 50 60 100 75 T 200 30 T 300 10 L 300 100 L 0 100 Z" fill="url(#trendGrad)" />
                {/* Line path */}
                <path d="M 0 90 Q 50 60 100 75 T 200 30 T 300 10" fill="none" stroke="var(--info)" strokeWidth="2.5" />
              </svg>
              {/* labels */}
              <div className="absolute bottom-1 left-2 text-[9px] font-bold text-text-secondary">Week 1</div>
              <div className="absolute bottom-1 right-2 text-[9px] font-bold text-text-secondary">Week 4</div>
            </div>
          </Card>

          {/* 2. Fuel Cost Breakdown (Simple donut visual representation) */}
          <Card title="Fuel Cost Breakdown" subtitle="Distribution of refill stations receipts">
            <div className="h-44 flex items-center justify-center gap-6">
              {/* Circle donut layout */}
              <div className="relative h-28 w-28 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  {/* Base Circle */}
                  <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="var(--border)" strokeWidth="3" />
                  {/* Segment 1: Shell 60% */}
                  <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="var(--info)" strokeWidth="3.2" strokeDasharray="60 40" strokeDashoffset="0" />
                  {/* Segment 2: BP 25% */}
                  <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="var(--success)" strokeWidth="3.2" strokeDasharray="25 75" strokeDashoffset="-60" />
                </svg>
                <div className="absolute text-center">
                  <span className="block text-[9px] uppercase font-bold text-text-secondary">Total Liters</span>
                  <span className="text-sm font-black text-text-main">4,850 L</span>
                </div>
              </div>
              <div className="space-y-1.5 text-[10px] font-bold text-text-secondary">
                <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-info" /><span>Shell Refills (60%)</span></div>
                <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-success" /><span>BP Hubs (25%)</span></div>
                <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-border" /><span>Others (15%)</span></div>
              </div>
            </div>
          </Card>

          {/* 3. Maintenance Cost Summary (CSS vertical bars representation) */}
          <Card title="Maintenance Costs" subtitle="Servicing expense classes">
            <div className="h-44 flex items-end justify-around pb-2 pt-6 w-full text-[9.5px] font-bold text-text-secondary text-center">
              <div className="space-y-2 flex flex-col items-center">
                <div className="w-6 bg-info rounded-t-md transition-all" style={{ height: '70px' }} />
                <span>Breakdowns</span>
              </div>
              <div className="space-y-2 flex flex-col items-center">
                <div className="w-6 bg-warning rounded-t-md transition-all" style={{ height: '110px' }} />
                <span>Preventive</span>
              </div>
              <div className="space-y-2 flex flex-col items-center">
                <div className="w-6 bg-success rounded-t-md transition-all" style={{ height: '50px' }} />
                <span>Inspection</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Expense Approvals & Transactions Ledger */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Approvals */}
          <div className="lg:col-span-1">
            <Card title="Expense Approvals Awaiting" subtitle="Transactions requiring analyst audit approval" className="h-full">
              {pendingApprovalsList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center text-xs font-semibold text-text-secondary">
                  <CheckCircle size={32} className="text-success mb-2" />
                  <span>General ledger is fully audited!</span>
                </div>
              ) : (
                <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                  {pendingApprovalsList.map(e => (
                    <div key={e.id} className="p-3 bg-hover/10 border border-border/80 rounded-xl space-y-2 text-xs">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="block font-bold text-text-main">{e.category}</span>
                          <span className="text-[10px] text-text-secondary font-medium">{e.merchant || 'Operations Vendor'} &middot; Vehicle: {e.vehicleId}</span>
                        </div>
                        <span className="font-bold text-text-main">INR {e.amount?.toLocaleString()}</span>
                      </div>
                      <div className="flex gap-2 justify-end pt-1">
                        <Button variant="outline" size="sm" onClick={() => handleApproveExpense(e.id)} className="px-2.5 py-1 text-success border-success/30 hover:bg-success/5 flex items-center gap-1 font-bold text-[10px]"><ThumbsUp size={11} /> Approve</Button>
                        <Button variant="outline" size="sm" onClick={() => handleRejectExpense(e.id)} className="px-2.5 py-1 text-danger border-danger/30 hover:bg-danger/5 flex items-center gap-1 font-bold text-[10px]"><ThumbsDown size={11} /> Reject</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Transactions Ledger */}
          <div className="lg:col-span-2">
            <Card title="Approved Transactions Ledger" subtitle="Latest audited expense ledger transactions" actions={<Button variant="outline" size="sm" onClick={() => navigate('/expenses')} className="text-xs">Audit Ledger</Button>}>
              <div className="overflow-x-auto border border-border/85 rounded-xl">
                <table className="w-full text-xs text-text-secondary text-left border-collapse font-semibold">
                  <thead>
                    <tr className="border-b border-border bg-hover/10 text-[9.5px] text-text-secondary/70 uppercase">
                      <th className="py-2.5 px-3">Log ID</th>
                      <th className="py-2.5 px-3">Vehicle</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Audit Date</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvedTransactions.map(trans => (
                      <tr key={trans.id} className="border-b border-border/60 hover:bg-hover/20 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-info">{trans.id}</td>
                        <td className="py-2.5 px-3">{trans.vehicleId}</td>
                        <td className="py-2.5 px-3">{trans.category}</td>
                        <td className="py-2.5 px-3 text-text-main font-bold">INR {trans.amount?.toLocaleString()}</td>
                        <td className="py-2.5 px-3">{trans.date}</td>
                        <td className="py-2.5 px-3"><span className="text-[10px] font-black uppercase text-success bg-success/10 px-2 py-0.5 rounded">Approved</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>

      </div>
    );
  };

  // 3. SAFETY OFFICER DASHBOARD
  const renderSafetyOfficerWorkspace = () => {
    return renderFleetManagerWorkspace(); // Shares layout structures, filtering specific menus via sidebar clearance levels
  };

  // 4. DRIVER WORKSPACE (Simplified, Mobile-Friendly)
  const renderDriverWorkspace = () => {
    return (
      <div className="space-y-6 text-left max-w-2xl mx-auto">
        <div className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <h3 className="text-sm font-black text-text-main uppercase tracking-wider">Pilot Workspace</h3>
            <p className="text-xs text-text-secondary font-semibold mt-1">Logged in: {currentUser.name}</p>
          </div>
          <Badge status="Active" />
        </div>

        {/* Assigned Vehicle Summary */}
        <Card title="My Assigned Vehicle" subtitle="Active fleet asset specifications">
          {driverVehicle ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <VehicleImage src={driverVehicle.image} size={50} />
                <div>
                  <h4 className="font-bold text-text-main text-xs">{driverVehicle.make} {driverVehicle.model}</h4>
                  <span className="text-[10.5px] text-text-secondary block font-bold mt-0.5">{driverVehicle.plateNumber} &middot; Class: {driverVehicle.type}</span>
                </div>
              </div>
              <div className="space-y-1.5 text-[11px] font-semibold text-text-secondary">
                <div><span>Fuel Type:</span> <span className="font-bold text-text-main">{driverVehicle.fuelType}</span></div>
                <div><span>Odometer:</span> <span className="font-bold text-text-main">{driverVehicle.odometer?.toLocaleString()} km</span></div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-text-secondary">No vehicle assigned to your session.</div>
          )}
        </Card>

        {/* Assigned Trip & Status Actions */}
        <Card title="Active Route Dispatched" subtitle="Assigned active logistics dispatch logs">
          {driverTrip ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-border/60 pb-3">
                <div>
                  <span className="text-[10px] text-info font-black uppercase">{driverTrip.tripNumber}</span>
                  <p className="font-bold text-text-main text-xs mt-0.5">{driverTrip.origin} &rarr; {driverTrip.destination}</p>
                </div>
                <Badge status={driverTripStatus} />
              </div>

              {/* Status Toggles */}
              <div className="space-y-2">
                <label className="text-[10px] text-text-secondary font-bold uppercase block">Update Trip State</label>
                <div className="flex gap-2 flex-wrap">
                  {['Scheduled', 'Active', 'Paused', 'Completed'].map(state => (
                    <button
                      key={state}
                      onClick={async () => {
                        try {
                          await tripService.update(driverTrip.id, { status: state });
                          setDriverTripStatus(state);
                          showToast.success(`Trip status updated to: ${state}`);
                          fetchOperationalData(true);
                        } catch {
                          showToast.error('Failed to persist status change');
                        }
                      }}
                      className={`px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                        driverTripStatus === state
                          ? 'bg-info text-white'
                          : 'bg-hover/80 text-text-secondary hover:bg-hover'
                      }`}
                    >
                      {state}
                    </button>
                  ))}
                </div>
              </div>

              {/* Proof of delivery & refuels */}
              <div className="flex gap-3">
                <Button variant="outline" size="sm" onClick={() => setIsFuelModalOpen(true)} className="flex-1 font-bold"><Fuel size={13} className="mr-1.5" /> Log Fuel Refill</Button>
                <Button variant="outline" size="sm" onClick={() => setIsReportIssueModalOpen(true)} className="flex-1 font-bold text-danger border-danger/25 hover:bg-danger/5"><AlertTriangle size={13} className="mr-1.5" /> Report Breakdown</Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-text-secondary">No active dispatch schedules recorded.</div>
          )}
        </Card>

        {/* Active Fuel Log Modal */}
        {isFuelModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-xl p-5 w-full max-w-xs space-y-4">
              <div className="text-left">
                <h6 className="font-bold text-text-main uppercase tracking-wider text-xs">Record Fuel Log</h6>
                <p className="text-[10px] text-text-secondary mt-0.5">Input fuel liters and cost metrics</p>
              </div>
              <form onSubmit={handleDriverFuelLogSubmit} className="space-y-3 text-left">
                <div className="space-y-1">
                  <label className="text-[10px] text-text-secondary font-bold uppercase">Liters Refueled</label>
                  <input type="number" required value={fuelLiters} onChange={(e) => setFuelLiters(e.target.value)} className="w-full px-3 py-1.5 bg-background text-text-main border border-border rounded-lg text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-text-secondary font-bold uppercase">Cost (INR)</label>
                  <input type="number" required value={fuelCost} onChange={(e) => setFuelCost(e.target.value)} className="w-full px-3 py-1.5 bg-background text-text-main border border-border rounded-lg text-xs" />
                </div>
                <div className="flex gap-2 text-xs pt-1">
                  <Button variant="outline" type="button" onClick={() => setIsFuelModalOpen(false)} className="w-1/2 text-xs">Cancel</Button>
                  <Button variant="primary" type="submit" className="w-1/2 text-xs">Save</Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Report Breakdown Modal */}
        {isReportIssueModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-xl p-5 w-full max-w-xs space-y-4">
              <div className="text-left">
                <h6 className="font-bold text-text-main uppercase tracking-wider text-xs">Report Breakdown / Incident</h6>
                <p className="text-[10px] text-text-secondary mt-0.5">Details will dispatch warning flags to mechanics</p>
              </div>
              <form onSubmit={handleDriverIssueReportSubmit} className="space-y-3 text-left">
                <div className="space-y-1">
                  <label className="text-[10px] text-text-secondary font-bold uppercase">Describe Incident Details</label>
                  <textarea rows={3} required value={reportedIssueDesc} onChange={(e) => setReportedIssueDesc(e.target.value)} className="w-full px-3 py-1.5 bg-background text-text-main border border-border rounded-lg text-xs" placeholder="e.g. Engine coolant temp warning..." />
                </div>
                <div className="flex gap-2 text-xs pt-1">
                  <Button variant="outline" type="button" onClick={() => setIsReportIssueModalOpen(false)} className="w-1/2 text-xs">Cancel</Button>
                  <Button variant="danger" type="submit" className="w-1/2 text-xs">Submit Incident</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Switch Dashboard view loader
  const renderRoleDashboard = () => {
    switch (currentUser.role) {
      case ROLES.ADMIN:
      case ROLES.FLEET_MANAGER:
        return renderFleetManagerWorkspace();
      case ROLES.DRIVER:
        return renderDriverWorkspace();
      case ROLES.SAFETY_OFFICER:
        return renderSafetyOfficerWorkspace();
      case ROLES.FINANCIAL_ANALYST:
        return renderFinancialWorkspace();
      default:
        return renderFleetManagerWorkspace();
    }
  };

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title={`Dashboard: ${currentUser.role}`}
        subtitle={`Welcome back, ${currentUser.name}. Control center logs and workflows are configured.`}
      />
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-[50vh] space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-info" />
          <span className="text-xs text-text-secondary font-semibold uppercase">Mapping Control Center...</span>
        </div>
      ) : (
        renderRoleDashboard()
      )}

      {/* Confirmation Modal */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
      />

      {/* Trip Details drawer */}
      {selectedTrip && (
        <Drawer
          isOpen={isTripDrawerOpen}
          onClose={() => setIsTripDrawerOpen(false)}
          title={`Trip Detail: ${selectedTrip.tripNumber}`}
          className="w-full sm:w-96"
        >
          <div className="space-y-5 text-xs text-left">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <span className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest">Lifecycle Status</span>
              <Badge status={selectedTrip.status} />
            </div>

            <div className="space-y-3.5">
              <div>
                <span className="block text-[9px] uppercase font-bold text-text-secondary">Trip Number</span>
                <span className="text-text-main font-bold block mt-0.5">{selectedTrip.tripNumber}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="block text-[9px] uppercase font-bold text-text-secondary">Origin Hub</span>
                  <span className="text-text-main font-bold block mt-0.5">{selectedTrip.origin}</span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase font-bold text-text-secondary">Destination Destination</span>
                  <span className="text-text-main font-bold block mt-0.5">{selectedTrip.destination}</span>
                </div>
              </div>
            </div>
          </div>
        </Drawer>
      )}
    </PageContainer>
  );
};

export default Dashboard;
