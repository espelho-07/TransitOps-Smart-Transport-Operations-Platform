import React, { useState, useEffect } from 'react';
import { 
  Check, 
  X, 
  Eye, 
  Truck, 
  Users, 
  Wrench, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import PageContainer from '../../components/ui/PageContainer';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { showToast } from '../../components/ui/Toast';
import { vehicleService } from '../../services/vehicleService';
import { driverService } from '../../services/driverService';
import { maintenanceService } from '../../services/maintenanceService';
import { expenseService } from '../../services/expenseService';
import { VehicleImage, DriverAvatar } from '../../components/ui/FallbackImage';
import VehicleDrawer from '../Vehicles/components/VehicleDrawer';
import DriverDrawer from '../Drivers/components/DriverDrawer';

const TABS = [
  { id: 'vehicles', label: 'Vehicles Pending', icon: Truck },
  { id: 'drivers', label: 'Drivers Pending', icon: Users },
  { id: 'maintenance', label: 'Maintenance Orders', icon: Wrench },
  { id: 'expenses', label: 'Expenses Invoices', icon: DollarSign }
];

const Approvals = () => {
  const [activeTab, setActiveTab] = useState('vehicles');
  const [loading, setLoading] = useState(false);

  // States for pending collections
  const [pendingVehicles, setPendingVehicles] = useState([]);
  const [pendingDrivers, setPendingDrivers] = useState([]);
  const [pendingMaintenance, setPendingMaintenance] = useState([]);
  const [pendingExpenses, setPendingExpenses] = useState([]);

  // Drawer control states
  const [isVehicleDrawerOpen, setIsVehicleDrawerOpen] = useState(false);
  const [drawerVehicleId, setDrawerVehicleId] = useState(null);

  const [isDriverDrawerOpen, setIsDriverDrawerOpen] = useState(false);
  const [drawerDriverId, setDrawerDriverId] = useState(null);

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    setLoading(true);
    try {
      const [vList, dList, mList, eList] = await Promise.all([
        vehicleService.getAll(),
        driverService.getAll(),
        maintenanceService.getAll(),
        expenseService.getAll()
      ]);

      // Filter collections by status "Pending Approval" or "Pending"
      setPendingVehicles(vList.filter(v => v.status === 'Pending Approval'));
      setPendingDrivers(dList.filter(d => d.status === 'Pending Approval'));
      setPendingMaintenance(mList.filter(m => m.status === 'Pending'));
      setPendingExpenses(eList.filter(e => e.status === 'Pending'));
    } catch (err) {
      showToast.error("Failed to query approvals backlog");
    } finally {
      setLoading(false);
    }
  };

  // Vehicles Approval Actions
  const handleApproveVehicle = async (id) => {
    try {
      await vehicleService.update(id, { status: 'Available' });
      showToast.success(`Vehicle registration approved successfully`);
      fetchPendingApprovals();
    } catch (err) {
      showToast.error(err.message || "Failed to approve vehicle registration");
    }
  };

  const handleRejectVehicle = async (id) => {
    if (window.confirm("Are you sure you want to reject this vehicle registration?")) {
      try {
        await vehicleService.update(id, { status: 'Retired' });
        showToast.warning("Vehicle registration rejected");
        fetchPendingApprovals();
      } catch (err) {
        showToast.error(err.message || "Failed to reject vehicle");
      }
    }
  };

  // Drivers Approval Actions
  const handleApproveDriver = async (id) => {
    try {
      await driverService.update(id, { status: 'Available' });
      showToast.success("Driver operator profile approved successfully");
      fetchPendingApprovals();
    } catch (err) {
      showToast.error(err.message || "Failed to approve driver");
    }
  };

  const handleRejectDriver = async (id) => {
    if (window.confirm("Are you sure you want to reject this driver registration?")) {
      try {
        await driverService.update(id, { status: 'Suspended' });
        showToast.warning("Driver registration rejected");
        fetchPendingApprovals();
      } catch (err) {
        showToast.error(err.message || "Failed to reject driver");
      }
    }
  };

  // Maintenance Approval Actions
  const handleApproveMaintenance = async (maint) => {
    try {
      await maintenanceService.update(maint.id, { status: 'In Progress' });
      await vehicleService.update(maint.vehicleId, { status: 'Maintenance' });
      showToast.success(`Maintenance task approved. Vehicle is now In Shop.`);
      fetchPendingApprovals();
    } catch (err) {
      showToast.error(err.message || "Failed to approve maintenance order");
    }
  };

  const handleRejectMaintenance = async (id) => {
    if (window.confirm("Are you sure you want to reject this maintenance request?")) {
      try {
        await maintenanceService.update(id, { status: 'Rejected' });
        showToast.warning("Maintenance order rejected");
        fetchPendingApprovals();
      } catch (err) {
        showToast.error(err.message || "Failed to reject maintenance");
      }
    }
  };

  // Expenses Approval Actions
  const handleApproveExpense = async (id) => {
    try {
      await expenseService.update(id, { status: 'Approved' });
      showToast.success("Expense statement approved successfully");
      fetchPendingApprovals();
    } catch (err) {
      showToast.error(err.message || "Failed to approve expense invoice");
    }
  };

  const handleRejectExpense = async (id) => {
    if (window.confirm("Are you sure you want to reject this expense?")) {
      try {
        await expenseService.update(id, { status: 'Rejected' });
        showToast.warning("Expense statement rejected");
        fetchPendingApprovals();
      } catch (err) {
        showToast.error(err.message || "Failed to reject expense");
      }
    }
  };

  // Drawers trigger
  const handleViewVehicle = (id) => {
    setDrawerVehicleId(id);
    setIsVehicleDrawerOpen(true);
  };

  const handleViewDriver = (id) => {
    setDrawerDriverId(id);
    setIsDriverDrawerOpen(true);
  };

  return (
    <PageContainer>
      <div className="space-y-6 text-left select-none">
        
        {/* Navigation Tabs Bar */}
        <div className="flex gap-1.5 border-b border-border/80 pb-3 flex-wrap">
          {TABS.map(tab => {
            const Icon = tab.icon;
            let count = 0;
            if (tab.id === 'vehicles') count = pendingVehicles.length;
            if (tab.id === 'drivers') count = pendingDrivers.length;
            if (tab.id === 'maintenance') count = pendingMaintenance.length;
            if (tab.id === 'expenses') count = pendingExpenses.length;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  activeTab === tab.id
                    ? 'bg-info/10 text-info'
                    : 'text-text-secondary hover:text-text-main hover:bg-hover'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
                {count > 0 && (
                  <span className="bg-danger text-white text-[9.5px] px-1.5 py-0.5 rounded-full font-bold">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Dynamic Backlog Render */}
        <Card title="Awaiting Approvals Backlog" subtitle="Audited operational items requiring validation clearance" className="min-h-[40vh]">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-info" />
              <span className="text-xs text-text-secondary font-bold uppercase tracking-wider">Syncing validations...</span>
            </div>
          ) : (
            <div>
              {/* VEHICLES TAB */}
              {activeTab === 'vehicles' && (
                pendingVehicles.length === 0 ? (
                  <div className="py-20 flex flex-col items-center justify-center text-center text-text-secondary text-xs">
                    <CheckCircle2 size={36} className="text-success mb-2 animate-bounce" />
                    <span className="font-bold uppercase tracking-wider">All vehicles are approved</span>
                  </div>
                ) : (
                  <div className="divide-y divide-border/60">
                    {pendingVehicles.map(v => (
                      <div key={v.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-3">
                          <VehicleImage src={v.image} alt={v.model} size={40} className="rounded-lg object-cover" />
                          <div className="text-xs">
                            <span className="block font-black text-text-main uppercase">{v.registrationNo}</span>
                            <span className="block text-[10.5px] text-text-secondary font-semibold">
                              {v.make} {v.model} &middot; Odometer: {v.odometer?.toLocaleString()} km
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewVehicle(v.id)} className="p-2"><Eye size={12} /></Button>
                          <Button variant="outline" size="sm" onClick={() => handleApproveVehicle(v.id)} className="p-2 text-success border-success/30 hover:bg-success/5"><Check size={12} /></Button>
                          <Button variant="outline" size="sm" onClick={() => handleRejectVehicle(v.id)} className="p-2 text-danger border-danger/30 hover:bg-danger/5"><X size={12} /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* DRIVERS TAB */}
              {activeTab === 'drivers' && (
                pendingDrivers.length === 0 ? (
                  <div className="py-20 flex flex-col items-center justify-center text-center text-text-secondary text-xs">
                    <CheckCircle2 size={36} className="text-success mb-2 animate-bounce" />
                    <span className="font-bold uppercase tracking-wider">All driver registrations are approved</span>
                  </div>
                ) : (
                  <div className="divide-y divide-border/60">
                    {pendingDrivers.map(d => (
                      <div key={d.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-3">
                          <DriverAvatar name={d.name} avatarUrl={d.avatar} size={40} />
                          <div className="text-xs">
                            <span className="block font-black text-text-main">{d.name}</span>
                            <span className="block text-[10.5px] text-text-secondary font-semibold">
                              CDL: {d.license} &middot; Experience: {d.experience} Years
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewDriver(d.id)} className="p-2"><Eye size={12} /></Button>
                          <Button variant="outline" size="sm" onClick={() => handleApproveDriver(d.id)} className="p-2 text-success border-success/30 hover:bg-success/5"><Check size={12} /></Button>
                          <Button variant="outline" size="sm" onClick={() => handleRejectDriver(d.id)} className="p-2 text-danger border-danger/30 hover:bg-danger/5"><X size={12} /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* MAINTENANCE TAB */}
              {activeTab === 'maintenance' && (
                pendingMaintenance.length === 0 ? (
                  <div className="py-20 flex flex-col items-center justify-center text-center text-text-secondary text-xs">
                    <CheckCircle2 size={36} className="text-success mb-2 animate-bounce" />
                    <span className="font-bold uppercase tracking-wider">No pending maintenance requests</span>
                  </div>
                ) : (
                  <div className="divide-y divide-border/60">
                    {pendingMaintenance.map(m => (
                      <div key={m.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                        <div className="text-xs space-y-1">
                          <span className="block font-black text-text-main uppercase">{m.type} service order: {m.id}</span>
                          <span className="block text-[10.5px] text-text-secondary font-semibold leading-tight">
                            Vehicle Code: {m.vehicleId} &middot; Cost: INR {m.cost?.toLocaleString()} &middot; Date: {m.date}
                          </span>
                          <p className="text-[10px] text-text-secondary font-medium italic">"{m.description}"</p>
                        </div>
                        <div className="flex gap-2 shrink-0 ml-4">
                          <Button variant="outline" size="sm" onClick={() => handleApproveMaintenance(m)} className="p-2 text-success border-success/30 hover:bg-success/5"><Check size={12} /></Button>
                          <Button variant="outline" size="sm" onClick={() => handleRejectMaintenance(m.id)} className="p-2 text-danger border-danger/30 hover:bg-danger/5"><X size={12} /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* EXPENSES TAB */}
              {activeTab === 'expenses' && (
                pendingExpenses.length === 0 ? (
                  <div className="py-20 flex flex-col items-center justify-center text-center text-text-secondary text-xs">
                    <CheckCircle2 size={36} className="text-success mb-2 animate-bounce" />
                    <span className="font-bold uppercase tracking-wider">All expenses invoices audited</span>
                  </div>
                ) : (
                  <div className="divide-y divide-border/60">
                    {pendingExpenses.map(e => (
                      <div key={e.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                        <div className="text-xs space-y-1">
                          <span className="block font-black text-text-main">{e.category} invoice at {e.merchant}</span>
                          <span className="block text-[10.5px] text-text-secondary font-semibold leading-tight">
                            Vehicle: {e.vehicleId} &middot; Cost: INR {e.amount?.toLocaleString()} &middot; Date: {e.date}
                          </span>
                        </div>
                        <div className="flex gap-2 shrink-0 ml-4">
                          <Button variant="outline" size="sm" onClick={() => handleApproveExpense(e.id)} className="p-2 text-success border-success/30 hover:bg-success/5"><Check size={12} /></Button>
                          <Button variant="outline" size="sm" onClick={() => handleRejectExpense(e.id)} className="p-2 text-danger border-danger/30 hover:bg-danger/5"><X size={12} /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Slide-out detail Drawers */}
      {drawerVehicleId && (
        <VehicleDrawer
          isOpen={isVehicleDrawerOpen}
          onClose={() => setIsVehicleDrawerOpen(false)}
          vehicleId={drawerVehicleId}
          vehicle={pendingVehicles.find(v => v.id === drawerVehicleId)}
          onViewProfile={() => {}}
          onEditProfile={() => {}}
          onUpdate={fetchPendingApprovals}
        />
      )}

      {drawerDriverId && (
        <DriverDrawer
          isOpen={isDriverDrawerOpen}
          onClose={() => setIsDriverDrawerOpen(false)}
          driverId={drawerDriverId}
          driver={pendingDrivers.find(d => d.id === drawerDriverId)}
          onViewProfile={() => {}}
          onEditProfile={() => {}}
          onUpdate={fetchPendingApprovals}
        />
      )}
    </PageContainer>
  );
};

export default Approvals;
