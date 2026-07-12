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
  Calendar
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

// Mock Services & Context
import { useAuth, ROLES } from '../../context/AuthContext';
import { vehicleService } from '../../services/vehicleService';
import { driverService } from '../../services/driverService';
import { tripService } from '../../services/tripService';
import { expenseService } from '../../services/expenseService';
import { showToast } from '../../components/ui/Toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Global operational states
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Trip Drawer states
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [isTripDrawerOpen, setIsTripDrawerOpen] = useState(false);

  // Driver mobile workspace inputs
  const [driverTripStatus, setDriverTripStatus] = useState('Scheduled'); // Scheduled | Active | Paused | Completed
  const [deliveryProofImage, setDeliveryProofImage] = useState(null);
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
  const [isReportIssueModalOpen, setIsReportIssueModalOpen] = useState(false);
  const [fuelLiters, setFuelLiters] = useState('');
  const [fuelCost, setFuelCost] = useState('');
  const [reportedIssueDesc, setReportedIssueDesc] = useState('');

  useEffect(() => {
    fetchOperationalData();
  }, []);

  const fetchOperationalData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const [vData, dData, tData, eData] = await Promise.all([
        vehicleService.getAll(),
        driverService.getAll(),
        tripService.getAll(),
        expenseService.getAll()
      ]);

      setVehicles(vData);
      setDrivers(dData);
      setTrips(tData);
      setExpenses(eData);
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
    const maintenance = activeVehicles.filter(v => v.status === 'Maintenance').length;
    const retired = activeVehicles.filter(v => v.status === 'Retired').length;
    const availableDriversCount = drivers.filter(d => d.status === 'Available').length;
    
    // Compliance & Expiries Count
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const insuranceExpiredCount = activeVehicles.filter(v => v.insuranceExpiry && new Date(v.insuranceExpiry) < thirtyDaysFromNow).length;
    const permitExpiredCount = activeVehicles.filter(v => v.permitExpiry && new Date(v.permitExpiry) < thirtyDaysFromNow).length;
    const driverLicenseExpiredCount = drivers.filter(d => d.status === 'Suspended').length;

    return {
      totalVehicles: activeVehicles.length,
      available,
      onTrip,
      maintenance,
      retired,
      availableDriversCount,
      insuranceExpiredCount,
      permitExpiredCount,
      driverLicenseExpiredCount,
      totalAlerts: insuranceExpiredCount + permitExpiredCount + driverLicenseExpiredCount
    };
  }, [vehicles, drivers]);

  // 2. Financial Metrics
  const financialMetrics = useMemo(() => {
    const totalExpenses = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
    const pendingExpenses = expenses.filter(e => e.status === 'Pending');
    const approvedExpensesCount = expenses.filter(e => e.status === 'Approved').length;
    
    // Top Expensive vehicles analysis
    const costMap = {};
    expenses.forEach(e => {
      if (e.vehicleId) {
        costMap[e.vehicleId] = (costMap[e.vehicleId] || 0) + e.amount;
      }
    });

    const topExpensive = Object.keys(costMap)
      .map(id => ({
        id,
        amount: costMap[id],
        plate: vehicles.find(v => v.id === id)?.plateNumber || id,
        model: vehicles.find(v => v.id === id)?.model || 'Unknown Model'
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    return {
      totalExpenses,
      pendingExpenses,
      approvedExpensesCount,
      topExpensive
    };
  }, [expenses, vehicles]);

  // 3. Driver context specific objects
  const driverVehicle = useMemo(() => {
    if (currentUser.role !== ROLES.DRIVER) return null;
    return vehicles.find(v => v.id === currentUser.assignedVehicleId) || null;
  }, [currentUser, vehicles]);

  const driverTrip = useMemo(() => {
    if (currentUser.role !== ROLES.DRIVER) return null;
    // Find active or scheduled trip for D002 (Sarah Jenkins)
    return trips.find(t => t.driverId === 'D002' && t.status !== 'Completed') || trips[0];
  }, [currentUser, trips]);

  // Actions
  const handleApproveExpense = async (id) => {
    try {
      const updated = await expenseService.update(id, { status: 'Approved' });
      setExpenses(prev => prev.map(e => e.id === id ? updated : e));
      showToast.success('Transaction approved');
    } catch {
      showToast.error('Operation failed');
    }
  };

  const handleRejectExpense = async (id) => {
    try {
      const updated = await expenseService.update(id, { status: 'Rejected' });
      setExpenses(prev => prev.map(e => e.id === id ? updated : e));
      showToast.success('Transaction marked as Rejected');
    } catch {
      showToast.error('Operation failed');
    }
  };

  const handleSuspendDriver = async (id) => {
    try {
      const updated = await driverService.update(id, { status: 'Suspended' });
      setDrivers(prev => prev.map(d => d.id === id ? updated : d));
      showToast.success(`Driver ${id} license marked suspended`);
    } catch {
      showToast.error('Operation failed');
    }
  };

  const handleActivateDriver = async (id) => {
    try {
      const updated = await driverService.update(id, { status: 'Available' });
      setDrivers(prev => prev.map(d => d.id === id ? updated : d));
      showToast.success(`Driver ${id} license validated successfully`);
    } catch {
      showToast.error('Operation failed');
    }
  };

  // Driver interactive mock logs
  const handleDriverFuelLogSubmit = (e) => {
    e.preventDefault();
    if (!fuelLiters || !fuelCost) {
      showToast.error('Please input liters and cost parameters');
      return;
    }
    showToast.success(`Refuel entry registered! Logged ${fuelLiters}L for INR ${fuelCost}`);
    setFuelLiters('');
    setFuelCost('');
    setIsFuelModalOpen(false);
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

  // -------------------------------------------------------------
  // VIEW RENDERERS BY ROLE
  // -------------------------------------------------------------

  // Render 1: ADMIN WORKSPACE
  const renderAdminWorkspace = () => {
    const recentTripsList = trips.slice(0, 5);
    return (
      <div className="space-y-6 text-left">
        {/* Fleet Snapshot KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          <div className="bg-card border border-border p-4 rounded-xl flex items-start justify-between shadow-xs">
            <div>
              <span className="block text-[9.5px] font-bold text-text-secondary uppercase tracking-wider">Total Fleet</span>
              <span className="text-2xl font-black text-text-main leading-none">{stats.totalVehicles}</span>
            </div>
            <div className="p-2 bg-info/10 text-info rounded-lg"><Truck size={15} /></div>
          </div>

          <div className="bg-card border border-border p-4 rounded-xl flex items-start justify-between shadow-xs">
            <div>
              <span className="block text-[9.5px] font-bold text-text-secondary uppercase tracking-wider">Available</span>
              <span className="text-2xl font-black text-text-main leading-none">{stats.available}</span>
            </div>
            <div className="p-2 bg-success/15 text-success rounded-lg"><CheckCircle size={15} /></div>
          </div>

          <div className="bg-card border border-border p-4 rounded-xl flex items-start justify-between shadow-xs">
            <div>
              <span className="block text-[9.5px] font-bold text-text-secondary uppercase tracking-wider">On Trip</span>
              <span className="text-2xl font-black text-text-main leading-none">{stats.onTrip}</span>
            </div>
            <div className="p-2 bg-info/15 text-info rounded-lg"><Compass size={15} /></div>
          </div>

          <div className="bg-card border border-border p-4 rounded-xl flex items-start justify-between shadow-xs">
            <div>
              <span className="block text-[9.5px] font-bold text-text-secondary uppercase tracking-wider">Maintenance</span>
              <span className="text-2xl font-black text-text-main leading-none">{stats.maintenance}</span>
            </div>
            <div className="p-2 bg-warning/15 text-warning rounded-lg"><Wrench size={15} /></div>
          </div>

          <div className="bg-card border border-border p-4 rounded-xl flex items-start justify-between shadow-xs">
            <div>
              <span className="block text-[9.5px] font-bold text-text-secondary uppercase tracking-wider">Retired</span>
              <span className="text-2xl font-black text-text-main leading-none">{stats.retired}</span>
            </div>
            <div className="p-2 bg-hover text-text-secondary rounded-lg"><AlertTriangle size={15} /></div>
          </div>

          <div className={`p-4 rounded-xl border flex items-start justify-between shadow-xs ${stats.insuranceExpiredCount > 0 ? 'bg-danger/5 border-danger/25 text-danger' : 'bg-card border-border'}`}>
            <div>
              <span className="block text-[9.5px] font-bold text-text-secondary uppercase tracking-wider">Insurance Expiring</span>
              <span className="text-2xl font-black text-text-main leading-none">{stats.insuranceExpiredCount}</span>
            </div>
            <div className={`p-2 rounded-lg ${stats.insuranceExpiredCount > 0 ? 'bg-danger/15 text-danger' : 'bg-hover'}`}><AlertCircle size={15} /></div>
          </div>
        </div>

        {/* Mid Section: Pending Approvals & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Approvals */}
          <Card title="Operational Pending Approvals" subtitle="Awaiting validation of expenses and major maintenance tasks" className="border-border shadow-sm flex flex-col justify-between">
            {financialMetrics.pendingExpenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-xs font-semibold text-text-secondary">
                <CheckCircle size={32} className="text-success mb-2" />
                <span>All pending tasks approved. Complete!</span>
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {financialMetrics.pendingExpenses.slice(0, 4).map(e => (
                  <div key={e.id} className="flex items-center justify-between p-3 bg-hover/10 border border-border/80 rounded-xl">
                    <div className="text-xs space-y-1">
                      <span className="block font-bold text-text-main">{e.category} — {e.merchant}</span>
                      <span className="block text-[10px] text-text-secondary font-semibold">Vehicle: {e.vehicleId} &middot; Cost: INR {e.amount?.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button variant="outline" size="sm" onClick={() => handleApproveExpense(e.id)} className="p-1 text-success border-success/30 hover:bg-success/5"><ThumbsUp size={12} /></Button>
                      <Button variant="outline" size="sm" onClick={() => handleRejectExpense(e.id)} className="p-1 text-danger border-danger/30 hover:bg-danger/5"><ThumbsDown size={12} /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Quick Actions Console */}
          <Card title="Quick Admin Console" subtitle="Administrative configuration dispatches" className="border-border shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => navigate('/vehicles/add')} className="flex items-center gap-3 p-4 bg-hover/20 hover:bg-hover/40 border border-border/60 hover:border-border rounded-xl transition-all">
                <div className="p-3 bg-card border border-border rounded-xl text-text-secondary"><Plus size={16} /></div>
                <div className="text-left"><span className="block text-xs font-bold text-text-main">Register Vehicle</span><span className="block text-[10px] text-text-secondary font-medium">Add to fleet inventory</span></div>
              </button>
              <button onClick={() => navigate('/drivers')} className="flex items-center gap-3 p-4 bg-hover/20 hover:bg-hover/40 border border-border/60 hover:border-border rounded-xl transition-all">
                <div className="p-3 bg-card border border-border rounded-xl text-text-secondary"><Users size={16} /></div>
                <div className="text-left"><span className="block text-xs font-bold text-text-main">Manage Drivers</span><span className="block text-[10px] text-text-secondary font-medium">Update operator registry</span></div>
              </button>
              <button onClick={() => navigate('/trips/dispatch')} className="flex items-center gap-3 p-4 bg-hover/20 hover:bg-hover/40 border border-border/60 hover:border-border rounded-xl transition-all">
                <div className="p-3 bg-card border border-border rounded-xl text-text-secondary"><Compass size={16} /></div>
                <div className="text-left"><span className="block text-xs font-bold text-text-main">Create Trip</span><span className="block text-[10px] text-text-secondary font-medium">Dispatch active route</span></div>
              </button>
              <button onClick={() => navigate('/expenses')} className="flex items-center gap-3 p-4 bg-hover/20 hover:bg-hover/40 border border-border/60 hover:border-border rounded-xl transition-all">
                <div className="p-3 bg-card border border-border rounded-xl text-text-secondary"><DollarSign size={16} /></div>
                <div className="text-left"><span className="block text-xs font-bold text-text-main">Expense Audit</span><span className="block text-[10px] text-text-secondary font-medium">Validate financial cost logs</span></div>
              </button>
            </div>
          </Card>
        </div>

        {/* Recent Trips */}
        <Card title="Recent Logistics Dispatches" subtitle="Active dispatches status summaries" actions={<Button variant="outline" size="sm" onClick={() => navigate('/trips')} className="text-xs">View All Trips</Button>}>
          <div className="overflow-x-auto border border-border/80 rounded-xl">
            <table className="w-full text-xs text-text-secondary text-left border-collapse font-semibold">
              <thead>
                <tr className="border-b border-border bg-hover/10 text-[10px] text-text-secondary/70 uppercase">
                  <th className="py-3 px-4">Trip ID</th>
                  <th className="py-3 px-4">Vehicle</th>
                  <th className="py-3 px-4">Driver</th>
                  <th className="py-3 px-4">Destination</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">ETA</th>
                </tr>
              </thead>
              <tbody>
                {recentTripsList.map(trip => {
                  const vehicleObj = vehicles.find(v => v.id === trip.vehicleId);
                  const driverObj = drivers.find(d => d.id === trip.driverId);
                  return (
                    <tr key={trip.id} onClick={() => handleRowClick(trip)} className="border-b border-border/60 hover:bg-hover/20 cursor-pointer transition-colors">
                      <td className="py-3 px-4 font-bold text-info">{trip.tripNumber}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <VehicleImage src={vehicleObj?.image} size={32} />
                          <span>{vehicleObj?.plateNumber || trip.vehicleId}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <DriverAvatar name={driverObj?.name} avatarUrl={driverObj?.avatar} size={28} />
                          <span>{driverObj?.name || 'Unassigned'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">{trip.destination}</td>
                      <td className="py-3 px-4"><Badge status={trip.status} /></td>
                      <td className="py-3 px-4 text-text-main font-bold">45 mins</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  // Render 2: FLEET MANAGER WORKSPACE
  const renderFleetManagerWorkspace = () => {
    return renderAdminWorkspace(); // Shares layout structures, filters specific modules via sidebar checks
  };

  // Render 3: DRIVER WORKSPACE (Simplified, Mobile-Friendly)
  const renderDriverWorkspace = () => {
    return (
      <div className="space-y-6 text-left max-w-2xl mx-auto">
        {/* Header driver welcome */}
        <div className="bg-gradient-to-r from-info/20 to-card border border-border p-5 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-4">
            <DriverAvatar name={currentUser.name} avatarUrl={currentUser.avatar} size={56} />
            <div className="space-y-0.5">
              <span className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest">Logged in Driver</span>
              <h2 className="text-base font-black text-text-main">{currentUser.name}</h2>
              <span className="inline-flex px-2 py-0.5 bg-success/15 border border-success/30 text-success text-[9px] font-bold uppercase rounded">On Duty</span>
            </div>
          </div>
          <Button variant="danger" size="sm" onClick={() => showToast.error('SOS emergency dispatch alert sent to headquarters!')} className="text-xs uppercase tracking-wider font-bold">
            Emergency SOS
          </Button>
        </div>

        {/* Grid: Trip Details & Vehicle Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Today's Active Trip Card */}
          <Card title="Today's Assigned Trip" subtitle="Active cargo route schedule details">
            {driverTrip ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 bg-hover/10 border border-border/80 p-3 rounded-xl">
                  <MapPin size={18} className="text-info" />
                  <div className="text-xs text-left">
                    <span className="block text-[10px] text-text-secondary uppercase">Destination Route</span>
                    <span className="text-text-main font-black block text-sm mt-0.5">
                      {driverTrip.origin} &rarr; {driverTrip.destination}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="border border-border/50 p-2.5 rounded-lg">
                    <span className="block text-[10px] text-text-secondary uppercase">Cargo Weight</span>
                    <span className="font-bold text-text-main">{driverTrip.cargoWeight || '1.5 Tons'}</span>
                  </div>
                  <div className="border border-border/50 p-2.5 rounded-lg">
                    <span className="block text-[10px] text-text-secondary uppercase">Distance</span>
                    <span className="font-bold text-text-main">{driverTrip.distance} km</span>
                  </div>
                </div>

                {/* Progress Visual Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-text-secondary">
                    <span>Trip Status: {driverTripStatus}</span>
                    <span>{driverTripStatus === 'Completed' ? '100%' : driverTripStatus === 'Active' ? '65%' : '0%'}</span>
                  </div>
                  <div className="w-full bg-hover h-2 rounded overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${driverTripStatus === 'Completed' ? 'bg-success' : 'bg-info'}`}
                      style={{ width: driverTripStatus === 'Completed' ? '100%' : driverTripStatus === 'Active' ? '65%' : '15%' }}
                    />
                  </div>
                </div>

                {/* Trip State Controls */}
                <div className="flex gap-2">
                  {driverTripStatus === 'Scheduled' && (
                    <Button variant="primary" onClick={() => { setDriverTripStatus('Active'); showToast.success('Trip started'); }} leftIcon={Play} className="w-full text-xs">
                      Start Trip
                    </Button>
                  )}
                  {driverTripStatus === 'Active' && (
                    <>
                      <Button variant="outline" onClick={() => { setDriverTripStatus('Paused'); showToast.info('Trip paused'); }} leftIcon={Pause} className="w-1/2 text-xs">
                        Pause
                      </Button>
                      <Button variant="success" onClick={() => { setDriverTripStatus('Completed'); showToast.success('Trip completed'); }} leftIcon={CheckSquare} className="w-1/2 text-xs">
                        Complete
                      </Button>
                    </>
                  )}
                  {driverTripStatus === 'Paused' && (
                    <Button variant="primary" onClick={() => { setDriverTripStatus('Active'); showToast.success('Trip resumed'); }} leftIcon={Play} className="w-full text-xs">
                      Resume Trip
                    </Button>
                  )}
                  {driverTripStatus === 'Completed' && (
                    <span className="block text-center w-full py-2 bg-success/10 border border-success/30 text-success text-xs font-bold rounded-lg uppercase tracking-wider">
                      Trip Successfully Completed
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-text-secondary font-semibold">
                No active routes assigned.
              </div>
            )}
          </Card>

          {/* Assigned Vehicle specifications */}
          <Card title="Assigned Vehicle Card" subtitle="Current vehicle specifications and stats">
            {driverVehicle ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <VehicleImage src={driverVehicle.image} size={56} className="rounded-xl border border-border" />
                  <div className="text-left text-xs">
                    <h4 className="font-black text-text-main text-sm leading-tight">{driverVehicle.make} {driverVehicle.model}</h4>
                    <span className="block text-[10px] text-text-secondary uppercase font-semibold mt-0.5">{driverVehicle.plateNumber}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5 text-xs font-semibold text-text-secondary">
                  <div className="border border-border/40 p-2 rounded bg-hover/10">
                    <span className="block text-[9px] uppercase">Odometer</span>
                    <span className="text-text-main font-bold">{driverVehicle.odometer?.toLocaleString()} km</span>
                  </div>
                  <div className="border border-border/40 p-2 rounded bg-hover/10">
                    <span className="block text-[9px] uppercase">Fuel level</span>
                    <span className="text-text-main font-bold">{driverVehicle.fuelLevel}%</span>
                  </div>
                </div>

                {/* Document warning checklist */}
                <div className="p-2 border border-border/60 rounded bg-hover/5 space-y-1.5">
                  <span className="block text-[9.5px] font-bold text-text-secondary uppercase">Compliance Statuses</span>
                  <div className="flex gap-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-success"><CheckCircle size={10} /> Insurance Valid</span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-success"><CheckCircle size={10} /> Permit Valid</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-text-secondary font-semibold">
                No assigned vehicle.
              </div>
            )}
          </Card>
        </div>

        {/* Quick Driver Action Controls */}
        <Card title="Quick Operations Logging" subtitle="Log fuel cards, upload delivery records, or register diagnostic checks">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button onClick={() => setIsFuelModalOpen(true)} className="flex items-center gap-3 p-4 bg-hover/20 hover:bg-hover/45 border border-border rounded-xl transition-all">
              <div className="p-3 bg-card border border-border rounded-xl text-text-secondary"><Fuel size={16} /></div>
              <div className="text-left"><span className="block text-xs font-bold text-text-main">Log Fuel Card</span></div>
            </button>
            <button onClick={() => setIsReportIssueModalOpen(true)} className="flex items-center gap-3 p-4 bg-hover/20 hover:bg-hover/45 border border-border rounded-xl transition-all">
              <div className="p-3 bg-card border border-border rounded-xl text-text-secondary"><Wrench size={16} /></div>
              <div className="text-left"><span className="block text-xs font-bold text-text-main">Report Issue</span></div>
            </button>
            <div className="flex items-center gap-3 p-4 bg-hover/20 border border-border rounded-xl">
              <div className="p-3 bg-card border border-border rounded-xl text-text-secondary"><Upload size={16} /></div>
              <div className="text-left">
                <span className="block text-xs font-bold text-text-main mb-1.5">Delivery Slip</span>
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setDeliveryProofImage(URL.createObjectURL(file));
                      showToast.success('Delivery slip photo uploaded!');
                    }
                  }} className="hidden" />
                  <span className="px-2 py-1 bg-card border border-border rounded text-[10px] font-bold text-text-main hover:bg-hover select-none">
                    {deliveryProofImage ? 'Replace Photo' : 'Upload File'}
                  </span>
                </label>
              </div>
            </div>
          </div>
          {deliveryProofImage && (
            <div className="mt-4 p-3 border border-border rounded-xl flex items-center gap-3.5 bg-success/5 border-success/15 w-max">
              <img src={deliveryProofImage} alt="Delivery proof" className="h-14 w-14 object-cover border rounded border-border/80 shadow-sm" />
              <div className="text-left">
                <span className="block text-xs font-bold text-success">Delivery Proof Validated</span>
                <span className="block text-[9.5px] text-text-secondary font-semibold">Simulated receipt attachment complete</span>
              </div>
            </div>
          )}
        </Card>

        {/* Modal: Log Fuel */}
        {isFuelModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm space-y-4">
              <div className="text-left"><h3 className="text-sm font-black text-text-main uppercase tracking-wider">Log Fuel Entry</h3><p className="text-xs text-text-secondary mt-0.5">Input refueling details for the commercial card expense</p></div>
              <form onSubmit={handleDriverFuelLogSubmit} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-xs text-text-secondary font-semibold">Refueling Liters</label>
                  <input type="number" required value={fuelLiters} onChange={(e) => setFuelLiters(e.target.value)} className="w-full text-xs bg-hover/10 border border-border rounded-lg p-2 text-text-main focus:outline-none" placeholder="e.g. 45" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-text-secondary font-semibold">Total Cost (INR)</label>
                  <input type="number" required value={fuelCost} onChange={(e) => setFuelCost(e.target.value)} className="w-full text-xs bg-hover/10 border border-border rounded-lg p-2 text-text-main focus:outline-none" placeholder="e.g. 4500" />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" type="button" onClick={() => setIsFuelModalOpen(false)} className="w-1/2 text-xs">Cancel</Button>
                  <Button variant="primary" type="submit" className="w-1/2 text-xs">Save Entry</Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Report Issue */}
        {isReportIssueModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm space-y-4">
              <div className="text-left"><h3 className="text-sm font-black text-text-main uppercase tracking-wider">Report Vehicle Issue</h3><p className="text-xs text-text-secondary mt-0.5">Describe mechanical or electrical faults observed</p></div>
              <form onSubmit={handleDriverIssueReportSubmit} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-xs text-text-secondary font-semibold">Diagnostic Notes</label>
                  <textarea required value={reportedIssueDesc} onChange={(e) => setReportedIssueDesc(e.target.value)} className="w-full text-xs bg-hover/10 border border-border rounded-lg p-2 text-text-main focus:outline-none h-20 resize-none" placeholder="e.g. Air brake warning light flashing..." />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" type="button" onClick={() => setIsReportIssueModalOpen(false)} className="w-1/2 text-xs">Cancel</Button>
                  <Button variant="danger" type="submit" className="w-1/2 text-xs">Report Incident</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render 4: SAFETY OFFICER WORKSPACE (Compliance Oversight)
  const renderSafetyOfficerWorkspace = () => {
    // Collect alerts expiring soon from database
    const complianceWatchlist = vehicles.filter(v => {
      const now = new Date();
      const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      return (v.insuranceExpiry && new Date(v.insuranceExpiry) < thirtyDays) || 
             (v.fitnessExpiry && new Date(v.fitnessExpiry) < thirtyDays);
    }).slice(0, 5);

    // List drivers with suspended or review licenses
    const driverWatchlist = drivers.filter(d => d.status === 'Suspended' || d.ratings < 4.4).slice(0, 5);

    return (
      <div className="space-y-6 text-left">
        {/* Compliance Snapshot metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border p-4 rounded-xl flex items-start justify-between shadow-xs">
            <div>
              <span className="block text-[9.5px] font-bold text-text-secondary uppercase tracking-wider">Expired Licenses</span>
              <span className="text-2xl font-black text-text-main leading-none">{stats.driverLicenseExpiredCount}</span>
            </div>
            <div className="p-2 bg-danger/10 text-danger rounded-lg"><AlertTriangle size={15} /></div>
          </div>
          <div className="bg-card border border-border p-4 rounded-xl flex items-start justify-between shadow-xs">
            <div>
              <span className="block text-[9.5px] font-bold text-text-secondary uppercase tracking-wider">Compliance Alerts</span>
              <span className="text-2xl font-black text-text-main leading-none">{stats.totalAlerts}</span>
            </div>
            <div className="p-2 bg-warning/10 text-warning rounded-lg"><AlertCircle size={15} /></div>
          </div>
          <div className="bg-card border border-border p-4 rounded-xl flex items-start justify-between shadow-xs">
            <div>
              <span className="block text-[9.5px] font-bold text-text-secondary uppercase tracking-wider">Avg Safety Rating</span>
              <span className="text-2xl font-black text-text-main leading-none">4.7 / 5</span>
            </div>
            <div className="p-2 bg-success/15 text-success rounded-lg"><CheckCircle size={15} /></div>
          </div>
          <div className="bg-card border border-border p-4 rounded-xl flex items-start justify-between shadow-xs">
            <div>
              <span className="block text-[9.5px] font-bold text-text-secondary uppercase tracking-wider">Active Watchlist</span>
              <span className="text-2xl font-black text-text-main leading-none">{complianceWatchlist.length}</span>
            </div>
            <div className="p-2 bg-info/10 text-info rounded-lg"><Users size={15} /></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Compliance Expiries watchlist */}
          <Card title="Upcoming Asset Compliance Expiries" subtitle="Vehicles with expiring insurance policies or fitness certificates">
            <div className="space-y-3.5">
              {complianceWatchlist.map(v => (
                <div key={v.id} className="flex items-center justify-between p-3.5 bg-hover/10 border border-border/80 rounded-xl">
                  <div className="text-xs text-left space-y-1">
                    <span className="block font-bold text-text-main">{v.plateNumber} — {v.model}</span>
                    <span className="block text-[10px] text-danger font-semibold">Insurance Exp: {v.insuranceExpiry} &middot; Fitness Exp: {v.fitnessExpiry}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate('/vehicles')} className="text-xs">
                    Review Doc
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Driver License suspension workspace */}
          <Card title="Driver Certification & Safety Watchlist" subtitle="Commercial operators under safety rating reviews or suspensions">
            <div className="space-y-3.5">
              {driverWatchlist.map(d => (
                <div key={d.id} className="flex items-center justify-between p-3.5 bg-hover/10 border border-border/80 rounded-xl">
                  <div className="flex items-center gap-3">
                    <DriverAvatar name={d.name} avatarUrl={d.avatar} size={36} />
                    <div className="text-xs text-left space-y-0.5">
                      <span className="block font-bold text-text-main">{d.name} ({d.id})</span>
                      <span className="block text-[10px] text-text-secondary font-semibold">Rating: {d.ratings} &middot; License: {d.licenseNumber}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {d.status === 'Suspended' ? (
                      <Button variant="success" size="sm" onClick={() => handleActivateDriver(d.id)} className="text-xs">Validate</Button>
                    ) : (
                      <Button variant="danger" size="sm" onClick={() => handleSuspendDriver(d.id)} className="text-xs">Suspend</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  };

  // Render 5: FINANCIAL ANALYST WORKSPACE (Expenses Oversight)
  const renderFinancialWorkspace = () => {
    return (
      <div className="space-y-6 text-left">
        {/* Financial KPI stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border p-4 rounded-xl flex items-start justify-between shadow-xs">
            <div>
              <span className="block text-[9.5px] font-bold text-text-secondary uppercase tracking-wider">Total Monthly Costs</span>
              <span className="text-2xl font-black text-text-main leading-none">INR 185,400</span>
            </div>
            <div className="p-2 bg-danger/10 text-danger rounded-lg"><DollarSign size={15} /></div>
          </div>
          <div className="bg-card border border-border p-4 rounded-xl flex items-start justify-between shadow-xs">
            <div>
              <span className="block text-[9.5px] font-bold text-text-secondary uppercase tracking-wider">Pending Validations</span>
              <span className="text-2xl font-black text-text-main leading-none">{financialMetrics.pendingExpenses.length}</span>
            </div>
            <div className="p-2 bg-warning/10 text-warning rounded-lg"><Clock size={15} /></div>
          </div>
          <div className="bg-card border border-border p-4 rounded-xl flex items-start justify-between shadow-xs">
            <div>
              <span className="block text-[9.5px] font-bold text-text-secondary uppercase tracking-wider">Company Net ROI</span>
              <span className="text-2xl font-black text-text-main leading-none">12.4 %</span>
            </div>
            <div className="p-2 bg-success/15 text-success rounded-lg"><TrendingUp size={15} /></div>
          </div>
          <div className="bg-card border border-border p-4 rounded-xl flex items-start justify-between shadow-xs">
            <div>
              <span className="block text-[9.5px] font-bold text-text-secondary uppercase tracking-wider">Approved Cost Logs</span>
              <span className="text-2xl font-black text-text-main leading-none">{financialMetrics.approvedExpensesCount}</span>
            </div>
            <div className="p-2 bg-info/10 text-info rounded-lg"><CheckCircle size={15} /></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Expenses validation */}
          <Card title="Pending Expenses Validation Console" subtitle="Awaiting validation and authorization from financial controllers">
            {financialMetrics.pendingExpenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-xs font-semibold text-text-secondary">
                <CheckCircle size={32} className="text-success mb-2" />
                <span>All company costs validated. Complete!</span>
              </div>
            ) : (
              <div className="space-y-3">
                {financialMetrics.pendingExpenses.map(e => (
                  <div key={e.id} className="flex items-center justify-between p-3.5 bg-hover/10 border border-border/80 rounded-xl">
                    <div className="text-xs text-left space-y-0.5">
                      <span className="block font-bold text-text-main">{e.category} at {e.merchant}</span>
                      <span className="block text-[10px] text-text-secondary font-semibold">Vehicle: {e.vehicleId} &middot; Cost: INR {e.amount?.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="success" size="sm" onClick={() => handleApproveExpense(e.id)} className="text-xs px-2.5">Approve</Button>
                      <Button variant="danger" size="sm" onClick={() => handleRejectExpense(e.id)} className="text-xs px-2.5">Reject</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Top Expensive Vehicles cost center listing */}
          <Card title="Top Expensive Fleet Vehicles" subtitle="Highest cumulative cost metrics (Maintenance + Refueling + Tolls)">
            <div className="space-y-3">
              {financialMetrics.topExpensive.map((v, index) => (
                <div key={v.id} className="flex items-center justify-between p-3.5 bg-hover/10 border border-border/80 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="font-black text-text-secondary text-xs w-4">#{index + 1}</span>
                    <div className="text-xs text-left">
                      <span className="block font-bold text-text-main">{v.plate}</span>
                      <span className="block text-[9.5px] text-text-secondary font-semibold">{v.model}</span>
                    </div>
                  </div>
                  <span className="text-xs font-black text-text-main">
                    INR {v.amount?.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  };

  // Switch workspace loader
  const renderRoleDashboard = () => {
    switch (currentUser.role) {
      case ROLES.ADMIN:
        return renderAdminWorkspace();
      case ROLES.FLEET_MANAGER:
        return renderFleetManagerWorkspace();
      case ROLES.DRIVER:
        return renderDriverWorkspace();
      case ROLES.SAFETY_OFFICER:
        return renderSafetyOfficerWorkspace();
      case ROLES.FINANCIAL_ANALYST:
        return renderFinancialWorkspace();
      default:
        return renderAdminWorkspace();
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
                <span className="block text-[10px] text-text-secondary font-bold uppercase tracking-wider mb-0.5">Route Path</span>
                <span className="text-text-main font-black block text-sm">
                  {selectedTrip.origin} &rarr; {selectedTrip.destination}
                </span>
              </div>
              
              {/* Vehicle Info Box */}
              <div className="flex items-center gap-3 border border-border/40 p-3 rounded-xl bg-hover/10">
                <VehicleImage src={vehicles.find(v => v.id === selectedTrip.vehicleId)?.image} size={48} />
                <div>
                  <span className="block text-[10px] text-text-secondary font-bold uppercase">Vehicle</span>
                  <span className="block text-xs font-bold text-text-main">
                    {vehicles.find(v => v.id === selectedTrip.vehicleId)?.plateNumber || selectedTrip.vehicleId}
                  </span>
                  <span className="block text-[10px] text-text-secondary">
                    {vehicles.find(v => v.id === selectedTrip.vehicleId)?.model || 'Unknown Model'}
                  </span>
                </div>
              </div>

              {/* Driver Info Box */}
              <div className="flex items-center gap-3 border border-border/40 p-3 rounded-xl bg-hover/10">
                <DriverAvatar 
                  name={drivers.find(d => d.id === selectedTrip.driverId)?.name || 'Unassigned'} 
                  avatarUrl={drivers.find(d => d.id === selectedTrip.driverId)?.avatar} 
                  size={48} 
                />
                <div>
                  <span className="block text-[10px] text-text-secondary font-bold uppercase">Driver</span>
                  <span className="block text-xs font-bold text-text-main">
                    {drivers.find(d => d.id === selectedTrip.driverId)?.name || 'Unassigned'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border border-border/40 p-3 rounded-xl bg-hover/10 font-bold text-text-secondary">
                <div>
                  <span className="block text-[10px] uppercase">Cargo Weight</span>
                  <span className="text-text-main font-bold">{selectedTrip.cargoWeight || 'Standard Cargo'}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase">Distance</span>
                  <span className="text-text-main font-bold">{selectedTrip.distance} km</span>
                </div>
              </div>
            </div>

            <hr className="border-border/60" />

            <div className="flex items-center gap-2">
              <Button variant="primary" onClick={() => { setIsTripDrawerOpen(false); navigate('/trips'); }} className="w-full text-xs">
                Go to Trips Module
              </Button>
            </div>
          </div>
        </Drawer>
      )}
    </PageContainer>
  );
};

export default Dashboard;
