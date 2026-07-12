import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Edit,
  Archive,
  Trash2,
  UploadCloud,
  FileText,
  Download,
  Eye,
  Plus,
  TrendingUp,
  Activity,
  Layers,
  Wrench,
  Fuel as FuelIcon,
  DollarSign,
  User,
  ShieldCheck,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import Tabs from '../../../components/ui/Tabs';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Timeline from '../../../components/ui/Timeline';
import { vehicleService } from '../../../services/vehicleService';
import { driverService } from '../../../services/driverService';
import { tripService } from '../../../services/tripService';
import { fuelService } from '../../../services/fuelService';
import { maintenanceService } from '../../../services/maintenanceService';
import { expenseService } from '../../../services/expenseService';
import { showToast } from '../../../components/ui/Toast';
import { VehicleImage, DriverAvatar } from '../../../components/ui/FallbackImage';

const VehicleDetails = ({ vehicleId, onBack, onEdit }) => {
  const [vehicle, setVehicle] = useState(null);
  const [driver, setDriver] = useState(null);
  const [trips, setTrips] = useState([]);
  const [fuelLogs, setFuelLogs] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tabs layout configuration
  const [activeTab, setActiveTab] = useState('overview');

  const tabOptions = [
    { id: 'overview', label: 'Overview' },
    { id: 'driver', label: 'Driver' },
    { id: 'trips', label: 'Trips' },
    { id: 'fuel', label: 'Fuel History' },
    { id: 'maintenance', label: 'Maintenance' },
    { id: 'expenses', label: 'Expenses' },
    { id: 'documents', label: 'Documents' },
    { id: 'timeline', label: 'Timeline' }
  ];

  // Documents state
  const [documents, setDocuments] = useState([
    { name: 'Registration Certificate (RC)', file: 'RC-TX-2026.pdf', date: '2024-02-15', status: 'verified' },
    { name: 'Commercial Insurance Policy', file: 'INS-COM-4401.pdf', date: '2025-05-10', status: 'verified' },
    { name: 'Pollution Under Control (PUC) Cert', file: 'PUC-998.pdf', date: '2026-01-20', status: 'expiring' },
    { name: 'National Goods Carriage Permit', file: 'PMT-NAT.pdf', date: '2024-07-01', status: 'verified' }
  ]);

  useEffect(() => {
    if (vehicleId) {
      loadAllData();
    }
  }, [vehicleId]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Vehicle
      const vData = await vehicleService.getById(vehicleId);
      setVehicle(vData);

      // 2. Fetch Driver
      if (vData.assignedDriverId) {
        try {
          const dData = await driverService.getById(vData.assignedDriverId);
          setDriver(dData);
        } catch {
          setDriver(null);
        }
      } else {
        setDriver(null);
      }

      // 3. Fetch Related Logs in parallel
      const [allTrips, allFuel, allMaint, allExp] = await Promise.all([
        tripService.getAll(),
        fuelService.getAll(),
        maintenanceService.getAll(),
        expenseService.getAll()
      ]);

      // Filter by vehicle ID
      setTrips(allTrips.filter(t => t.vehicleId === vehicleId));
      setFuelLogs(allFuel.filter(f => f.vehicleId === vehicleId));
      setMaintenance(allMaint.filter(m => m.vehicleId === vehicleId));

      // Build expenses specifically relating to this vehicle
      // Include maintenance costs & refuel costs
      const vehicleFuelCost = allFuel.filter(f => f.vehicleId === vehicleId).reduce((acc, f) => acc + (f.cost || 0), 0);
      const vehicleMaintCost = allMaint.filter(m => m.vehicleId === vehicleId).reduce((acc, m) => acc + (m.cost || 0), 0);
      
      const vExpenses = [
        { id: 'EXP-1', category: 'Fuel Refills', amount: vehicleFuelCost, date: 'Accumulated', description: 'Total cost of fuel cards refills' },
        { id: 'EXP-2', category: 'Maintenance Services', amount: vehicleMaintCost, date: 'Accumulated', description: 'Total cost of routine and repair services' },
        { id: 'EXP-3', category: 'Commercial Insurance Policy', amount: vData.purchaseCost * 0.02 || 1200, date: vData.purchaseDate, description: 'Annual commercial comprehensive premium' },
        { id: 'EXP-4', category: 'Road Toll Taxes', amount: 840, date: 'Accumulated', description: 'Depot transit toll gates charges' }
      ];
      setExpenses(vExpenses);

    } catch (err) {
      console.error("Failed to load vehicle details:", err);
      showToast.error(err.response?.data?.error || err.message || 'Failed to load vehicle data profile');
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async () => {
    try {
      const updated = await vehicleService.archive(vehicleId);
      setVehicle(updated);
      showToast.success(updated.isArchived ? 'Vehicle archived successfully' : 'Vehicle restored successfully');
    } catch {
      showToast.error('Operation failed');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this vehicle asset? This is irreversible.')) {
      try {
        await vehicleService.delete(vehicleId);
        showToast.success('Vehicle deleted successfully');
        onBack();
      } catch {
        showToast.error('Failed to delete vehicle');
      }
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newDoc = {
        name: file.name.split('.')[0] + ' Upload',
        file: file.name,
        date: new Date().toISOString().split('T')[0],
        status: 'verified'
      };
      setDocuments(prev => [...prev, newDoc]);
      showToast.success('Document uploaded successfully');
    }
  };

  const handleDocDelete = (docName) => {
    setDocuments(prev => prev.filter(d => d.name !== docName));
    showToast.success('Document deleted');
  };

  // Compile Dynamic Timeline Events
  const timelineItems = useMemo(() => {
    if (!vehicle) return [];
    
    const events = [];

    // Milestone 1: Purchase
    events.push({
      title: 'Vehicle Purchased & Acquired',
      description: `Asset acquired for commercial logistics operations at cost of INR ${vehicle.purchaseCost?.toLocaleString() || '0'}.`,
      date: vehicle.purchaseDate || 'N/A'
    });

    // Milestone 2: Registration
    events.push({
      title: 'Plate Registration Registered',
      description: `Registered unique plate number ${vehicle.plateNumber} with structural cargo capacity of ${vehicle.carrierCap}.`,
      date: vehicle.purchaseDate || 'N/A'
    });

    // Milestone 3: Driver assignation
    if (vehicle.assignedDriverId && driver) {
      events.push({
        title: 'Driver Credentials Assigned',
        description: `Operational driver ${driver.name} (License Category: ${driver.licenseNumber}) linked as primary operator.`,
        date: 'Recent Action'
      });
    }

    // Milestone 4: Fuel Logs
    fuelLogs.forEach((f, idx) => {
      events.push({
        title: `Refuel card logged #${f.receiptNumber}`,
        description: `Refilled ${f.quantity} Liters at ${f.stationName} for total cost of INR ${f.cost}.`,
        date: f.date
      });
    });

    // Milestone 5: Maintenance
    maintenance.forEach((m, idx) => {
      events.push({
        title: `Maintenance action logged: ${m.type}`,
        description: `${m.description} handled by mechanic ${m.mechanic}. Cost: INR ${m.cost}.`,
        date: m.date
      });
    });

    // Sort events by date or label
    events.sort((a, b) => {
      if (a.date === 'Recent Action') return -1;
      if (b.date === 'Recent Action') return 1;
      return new Date(b.date) - new Date(a.date);
    });

    return events;
  }, [vehicle, driver, fuelLogs, maintenance]);

  // Aggregate stats calculations
  const totalExpense = useMemo(() => {
    return expenses.reduce((acc, e) => acc + e.amount, 0);
  }, [expenses]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-info" />
        <span className="text-sm text-text-secondary font-bold">Querying asset data registry...</span>
      </div>
    );
  }

  if (!vehicle) return null;

  return (
    <div className="space-y-6">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onBack} icon={ArrowLeft}>
            Back
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black text-text-main tracking-tight leading-none">
                {vehicle.plateNumber}
              </h1>
              <Badge status={vehicle.status} />
              {vehicle.isArchived && <Badge variant="warning">Archived</Badge>}
            </div>
            <p className="text-xs text-text-secondary font-semibold mt-1">
              {vehicle.make} {vehicle.model} &middot; {vehicle.type}
            </p>
          </div>
        </div>

        {/* Action Panel Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => onEdit(vehicle.id)} leftIcon={Edit}>
            Edit Profile
          </Button>
          <Button variant="outline" size="sm" onClick={handleArchive} leftIcon={Archive}>
            {vehicle.isArchived ? 'Restore Asset' : 'Archive'}
          </Button>
          <Button variant="danger" size="sm" onClick={handleDelete} leftIcon={Trash2}>
            Delete Asset
          </Button>
        </div>
      </div>

      {/* Tabs list bar */}
      <Tabs tabs={tabOptions} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Panels */}
      <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
        
        {/* Tab 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Left Primary Asset Photo */}
            <div className="flex-shrink-0 mx-auto md:mx-0">
              <VehicleImage src={vehicle.image} alt={vehicle.plateNumber} size={140} className="rounded-xl border border-border" />
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-text-main border-b border-border/60 pb-2 uppercase tracking-wider text-left">
                  Registration Specifications
                </h3>
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                <div>
                  <span className="block text-text-secondary text-[10px] uppercase">Registration Number</span>
                  <span className="text-text-main text-sm font-black">{vehicle.plateNumber}</span>
                </div>
                <div>
                  <span className="block text-text-secondary text-[10px] uppercase">VIN</span>
                  <span className="text-text-main text-sm font-black">{vehicle.vin}</span>
                </div>
                <div>
                  <span className="block text-text-secondary text-[10px] uppercase">Manufacturer / Make</span>
                  <span className="text-text-main text-sm font-black">{vehicle.make}</span>
                </div>
                <div>
                  <span className="block text-text-secondary text-[10px] uppercase">Model Name</span>
                  <span className="text-text-main text-sm font-black">{vehicle.model}</span>
                </div>
                <div>
                  <span className="block text-text-secondary text-[10px] uppercase">Year of Manufacture</span>
                  <span className="text-text-main text-sm font-black">{vehicle.year}</span>
                </div>
                <div>
                  <span className="block text-text-secondary text-[10px] uppercase">Fuel Type</span>
                  <span className="text-text-main text-sm font-black">{vehicle.fuelType}</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-sm font-bold text-text-main border-b border-border/60 pb-2 uppercase tracking-wider">
                Technical & Purchase Details
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                <div>
                  <span className="block text-text-secondary text-[10px] uppercase">Engine Number</span>
                  <span className="text-text-main text-sm font-black">{vehicle.engineNumber}</span>
                </div>
                <div>
                  <span className="block text-text-secondary text-[10px] uppercase">Chassis Number</span>
                  <span className="text-text-main text-sm font-black">{vehicle.chassisNumber}</span>
                </div>
                <div>
                  <span className="block text-text-secondary text-[10px] uppercase">Transmission</span>
                  <span className="text-text-main text-sm font-black">{vehicle.transmission}</span>
                </div>
                <div>
                  <span className="block text-text-secondary text-[10px] uppercase">Odometer</span>
                  <span className="text-text-main text-sm font-black">{vehicle.odometer.toLocaleString()} km</span>
                </div>
                <div>
                  <span className="block text-text-secondary text-[10px] uppercase">Purchase Cost</span>
                  <span className="text-text-main text-sm font-black">INR {vehicle.purchaseCost?.toLocaleString()}</span>
                </div>
                <div>
                  <span className="block text-text-secondary text-[10px] uppercase">Purchase Date</span>
                  <span className="text-text-main text-sm font-black">{vehicle.purchaseDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

        {/* Tab 2: DRIVER */}
        {activeTab === 'driver' && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-text-main border-b border-border/60 pb-2 uppercase tracking-wider">
              Assigned Commercial Driver
            </h3>
            {driver ? (
              <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start text-left">
                <DriverAvatar name={driver.name} avatarUrl={driver.avatar} size={80} />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 flex-1 text-xs font-semibold">
                  <div>
                    <span className="block text-text-secondary text-[10px] uppercase">Driver Name</span>
                    <span className="text-text-main text-sm font-bold">{driver.name}</span>
                  </div>
                  <div>
                    <span className="block text-text-secondary text-[10px] uppercase">License Number</span>
                    <span className="text-text-main text-sm font-bold">{driver.licenseNumber}</span>
                  </div>
                  <div>
                    <span className="block text-text-secondary text-[10px] uppercase">Contact Number</span>
                    <span className="text-text-main text-sm font-bold">{driver.phone || '98765xxxxx'}</span>
                  </div>
                  <div>
                    <span className="block text-text-secondary text-[10px] uppercase">Email Address</span>
                    <span className="text-text-main text-sm font-bold">{driver.email}</span>
                  </div>
                  <div>
                    <span className="block text-text-secondary text-[10px] uppercase">Rating</span>
                    <span className="text-text-main text-sm font-bold text-warning">{driver.ratings} ★</span>
                  </div>
                  <div>
                    <span className="block text-text-secondary text-[10px] uppercase">Availability Status</span>
                    <Badge status={driver.status} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 border border-dashed border-border rounded-xl">
                <User className="mx-auto text-text-secondary mb-3" size={32} />
                <span className="text-xs text-text-secondary font-bold block">No driver currently assigned to this vehicle</span>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: TRIPS */}
        {activeTab === 'trips' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-text-main border-b border-border/60 pb-2 uppercase tracking-wider">
              Dispatched Trips Registry
            </h3>
            {trips.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-border rounded-xl">
                <Activity className="mx-auto text-text-secondary mb-3" size={32} />
                <span className="text-xs text-text-secondary font-bold block">No dispatch trips logs for this vehicle</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-semibold text-text-secondary text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/60 text-[10px] text-text-secondary/70 uppercase">
                      <th className="py-2.5 px-2">Trip Number</th>
                      <th className="py-2.5 px-2">Route</th>
                      <th className="py-2.5 px-2">Weight</th>
                      <th className="py-2.5 px-2">Distance</th>
                      <th className="py-2.5 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trips.map(t => (
                      <tr key={t.id} className="border-b border-border/40 hover:bg-hover/20">
                        <td className="py-3 px-2 font-bold text-info">{t.tripNumber}</td>
                        <td className="py-3 px-2 text-text-main">{t.origin} &rarr; {t.destination}</td>
                        <td className="py-3 px-2">{t.cargoWeight}</td>
                        <td className="py-3 px-2">{t.distance} km</td>
                        <td className="py-3 px-2"><Badge status={t.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: FUEL HISTORY */}
        {activeTab === 'fuel' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-text-main border-b border-border/60 pb-2 uppercase tracking-wider">
              Fuel Refilling Logs
            </h3>
            {fuelLogs.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-border rounded-xl">
                <FuelIcon className="mx-auto text-text-secondary mb-3" size={32} />
                <span className="text-xs text-text-secondary font-bold block">No fuel refill logs registered</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-semibold text-text-secondary text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/60 text-[10px] text-text-secondary/70 uppercase">
                      <th className="py-2.5 px-2">Receipt</th>
                      <th className="py-2.5 px-2">Date</th>
                      <th className="py-2.5 px-2">Station</th>
                      <th className="py-2.5 px-2">Odometer</th>
                      <th className="py-2.5 px-2 text-right">Liters</th>
                      <th className="py-2.5 px-2 text-right">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fuelLogs.map(f => (
                      <tr key={f.id} className="border-b border-border/40 hover:bg-hover/20">
                        <td className="py-3 px-2 font-bold text-text-main">{f.receiptNumber}</td>
                        <td className="py-3 px-2">{f.date}</td>
                        <td className="py-3 px-2">{f.stationName}</td>
                        <td className="py-3 px-2">{f.odometer.toLocaleString()} km</td>
                        <td className="py-3 px-2 text-right text-text-main font-bold">{f.quantity} L</td>
                        <td className="py-3 px-2 text-right text-success font-black">INR {f.cost?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 5: MAINTENANCE */}
        {activeTab === 'maintenance' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-text-main border-b border-border/60 pb-2 uppercase tracking-wider">
              Diagnostic & Maintenance Logs
            </h3>
            {maintenance.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-border rounded-xl">
                <Wrench className="mx-auto text-text-secondary mb-3" size={32} />
                <span className="text-xs text-text-secondary font-bold block">No maintenance service records</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-semibold text-text-secondary text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/60 text-[10px] text-text-secondary/70 uppercase">
                      <th className="py-2.5 px-2">Code</th>
                      <th className="py-2.5 px-2">Type</th>
                      <th className="py-2.5 px-2">Description</th>
                      <th className="py-2.5 px-2">Mechanic</th>
                      <th className="py-2.5 px-2">Date</th>
                      <th className="py-2.5 px-2 text-right">Cost</th>
                      <th className="py-2.5 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {maintenance.map(m => (
                      <tr key={m.id} className="border-b border-border/40 hover:bg-hover/20">
                        <td className="py-3 px-2 font-bold text-text-main">{m.id}</td>
                        <td className="py-3 px-2">{m.type}</td>
                        <td className="py-3 px-2 text-text-main">{m.description}</td>
                        <td className="py-3 px-2">{m.mechanic}</td>
                        <td className="py-3 px-2">{m.date}</td>
                        <td className="py-3 px-2 text-right text-text-main font-bold">INR {m.cost?.toLocaleString()}</td>
                        <td className="py-3 px-2"><Badge status={m.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 6: EXPENSES */}
        {activeTab === 'expenses' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <h3 className="text-sm font-bold text-text-main uppercase tracking-wider">
                Total Operational Expenses
              </h3>
              <div className="text-right">
                <span className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest">Aggregated Total</span>
                <span className="text-xl font-black text-info leading-none">
                  INR {totalExpense.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {expenses.map(e => (
                <div key={e.id} className="border border-border p-4 rounded-xl shadow-xs bg-hover/10 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-text-main text-sm">{e.category}</span>
                    <span className="text-text-main text-sm font-black">INR {e.amount?.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-text-secondary font-medium leading-relaxed">
                    {e.description}
                  </p>
                  <div className="h-px bg-border/40 my-1" />
                  <div className="flex justify-between items-center text-[10px] font-bold text-text-secondary/70 uppercase">
                    <span>Transaction ref: {e.id}</span>
                    <span>Date: {e.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 7: DOCUMENTS */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <h3 className="text-sm font-bold text-text-main uppercase tracking-wider">
                Compliance Document Attachments
              </h3>
              <label className="cursor-pointer">
                <input type="file" onChange={handleFileUpload} className="hidden" />
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-info text-white hover:bg-info-hover rounded-lg text-xs font-semibold shadow-sm transition-colors">
                  <UploadCloud size={14} />
                  Upload Document
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {documents.map((doc, idx) => (
                <div key={idx} className="border border-border/80 p-4 rounded-xl flex items-center justify-between hover:border-info/30 transition-colors">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`p-2.5 rounded-lg ${doc.status === 'expiring' ? 'bg-danger/10 text-danger' : 'bg-info/10 text-info'}`}>
                      <FileText size={18} />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-xs font-bold text-text-main truncate">{doc.name}</span>
                      <span className="block text-[10px] text-text-secondary font-semibold uppercase mt-0.5 tracking-wider">{doc.file}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {doc.status === 'expiring' && (
                      <span className="inline-flex items-center text-[10px] font-bold text-danger gap-1 border border-danger/20 bg-danger/5 px-2 py-0.5 rounded-full uppercase select-none">
                        <AlertTriangle size={10} />
                        Expiring
                      </span>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => alert(`Downloading document asset: ${doc.file}`)}
                      className="p-2"
                      aria-label="Download Document"
                    >
                      <Download size={13} />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDocDelete(doc.name)}
                      className="p-2"
                      aria-label="Delete Document"
                    >
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 8: TIMELINE */}
        {activeTab === 'timeline' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-text-main border-b border-border/60 pb-2 uppercase tracking-wider">
              Asset Lifecycle Timeline
            </h3>
            <div className="px-2 py-4">
              <Timeline items={timelineItems} />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default VehicleDetails;
