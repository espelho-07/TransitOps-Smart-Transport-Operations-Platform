import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Truck,
  Plus,
  RefreshCw,
  FileSpreadsheet,
  Eye,
  Edit,
  Trash2,
  Archive,
  Copy,
  AlertCircle
} from 'lucide-react';

// UI components
import PageContainer from '../../components/ui/PageContainer';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Dropdown from '../../components/ui/Dropdown';
import DataTable from '../../components/ui/DataTable';

// Custom module subcomponents
import VehicleDashboard from './components/VehicleDashboard';
import VehicleDrawer from './components/VehicleDrawer';
import VehicleDetails from './components/VehicleDetails';
import VehicleModal from './components/VehicleModal';

// Mock Services & Context
import { vehicleService } from '../../services/vehicleService';
import { driverService } from '../../services/driverService';
import { showToast } from '../../components/ui/Toast';
import { VehicleImage, DriverAvatar } from '../../components/ui/FallbackImage';
import { useAuth } from '../../context/AuthContext';

const VEHICLE_TYPES = ['Heavy Truck', 'Box Truck', 'Light Cargo', 'Van', 'Mini'];
const FUEL_TYPES = ['Diesel', 'Gasoline', 'CNG', 'Electric'];

const Vehicles = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const isManager = currentUser?.role === 'Admin' || currentUser?.role === 'Fleet Manager';

  // Navigation / View modes states
  const [viewMode, setViewMode] = useState('list'); // list | details
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  
  // Drawer slider states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerVehicleId, setDrawerVehicleId] = useState(null);

  // Modal open states
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Vehicles list state
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Toolbar & filter configurations
  const [showArchived, setShowArchived] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRegion, setFilterRegion] = useState('');
  const [filterFuel, setFilterFuel] = useState('');

  // Initial load
  useEffect(() => {
    loadVehicles();
    loadDrivers();
  }, []);

  // Detect URL parameter to trigger registration modal
  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      setSearchParams({}, { replace: true });
      setSelectedVehicleId(null);
      setIsModalOpen(true);
    }
  }, [searchParams]);

  const loadVehicles = async () => {
    setLoading(true);
    try {
      const data = await vehicleService.getAll();
      setVehicles(data);
    } catch {
      showToast.error('Failed to load fleet registry');
    } finally {
      setLoading(false);
    }
  };

  const loadDrivers = async () => {
    try {
      const data = await driverService.getAll();
      setDrivers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterType('');
    setFilterStatus('');
    setFilterRegion('');
    setFilterFuel('');
  };

  // Pre-filter data client-side for the datatable
  const filteredVehicles = useMemo(() => {
    let result = [...vehicles];

    // Filter by archived status
    result = result.filter(v => !!v.isArchived === showArchived);

    // Text Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(v =>
        v.plateNumber?.toLowerCase().includes(q) ||
        v.model?.toLowerCase().includes(q) ||
        v.make?.toLowerCase().includes(q)
      );
    }

    // Dropdown filters
    if (filterType) result = result.filter(v => v.type === filterType);
    if (filterStatus) result = result.filter(v => v.status === filterStatus);
    if (filterRegion) result = result.filter(v => v.region === filterRegion);
    if (filterFuel) result = result.filter(v => v.fuelType === filterFuel);

    return result;
  }, [vehicles, showArchived, searchQuery, filterType, filterStatus, filterRegion, filterFuel]);

  // Actions handlers
  const handleViewDetails = (id) => {
    setIsDrawerOpen(false);
    setSelectedVehicleId(id);
    setViewMode('details');
  };

  const handleEditDetails = (id) => {
    setIsDrawerOpen(false);
    setSelectedVehicleId(id);
    setIsModalOpen(true);
  };

  const handleDuplicate = async (id) => {
    try {
      const cloned = await vehicleService.duplicate(id);
      showToast.success(`Vehicle cloned successfully as ${cloned.plateNumber}`);
      loadVehicles();
    } catch {
      showToast.error('Duplication failed');
    }
  };

  const handleToggleArchive = async (id) => {
    try {
      const updated = await vehicleService.archive(id);
      showToast.success(updated.isArchived ? 'Asset archived' : 'Asset restored');
      loadVehicles();
    } catch {
      showToast.error('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle asset? This action is permanent.')) {
      try {
        await vehicleService.delete(id);
        showToast.success('Vehicle deleted successfully');
        loadVehicles();
      } catch (err) {
        showToast.error(err.message || 'Failed to delete vehicle');
      }
    }
  };

  const handleBulkArchive = async (ids, clearSelection) => {
    try {
      await Promise.all(ids.map(id => vehicleService.update(id, { isArchived: !showArchived })));
      showToast.success(`Bulk updated ${ids.length} assets`);
      clearSelection();
      loadVehicles();
    } catch {
      showToast.error('Bulk archive operation failed');
    }
  };

  const handleBulkDelete = async (ids, clearSelection) => {
    if (window.confirm(`Are you sure you want to delete ${ids.length} selected vehicle assets?`)) {
      try {
        await Promise.all(ids.map(id => vehicleService.delete(id)));
        showToast.success(`Successfully deleted ${ids.length} assets`);
        clearSelection();
        loadVehicles();
      } catch (err) {
        showToast.error(err.message || 'Bulk delete operation rejected');
      }
    }
  };

  // CSV Export Trigger
  const handleExportCSV = () => {
    if (filteredVehicles.length === 0) return;
    
    const headers = ['Registration Code', 'Brand', 'Vehicle Model', 'Type', 'Capacity', 'Odometer', 'Status', 'Fuel Level'];
    const rows = filteredVehicles.map(v => [
      v.plateNumber,
      v.make,
      v.model,
      v.type,
      v.carrierCap,
      v.odometer,
      v.status,
      v.fuelLevel
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `transitops_fleet_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast.success('CSV Export download started');
  };

  // Row clicked loads quick drawer
  const handleRowClick = (row) => {
    setDrawerVehicleId(row.id);
    setIsDrawerOpen(true);
  };

  // Datatable Column Definitions
  const columns = [
    {
      key: 'image',
      label: 'Vehicle Image',
      render: (_, row) => <VehicleImage src={row.image} alt={row.model} size={40} className="rounded-lg border border-border/80 object-cover" />
    },
    {
      key: 'plateNumber',
      label: 'Registration Number',
      sortable: true,
      render: (val, row) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleViewDetails(row.id);
          }}
          className="font-black text-info hover:underline text-left text-xs uppercase"
        >
          {val}
        </button>
      )
    },
    {
      key: 'model',
      label: 'Vehicle Name',
      sortable: true,
      render: (val) => <span className="text-xs text-text-main font-bold">{val}</span>
    },
    {
      key: 'make',
      label: 'Model / Brand',
      sortable: true,
      render: (val) => <span className="text-xs text-text-secondary font-semibold">{val}</span>
    },
    {
      key: 'type',
      label: 'Vehicle Type',
      sortable: true,
      render: (val) => <span className="text-xs text-text-main font-semibold">{val}</span>
    },
    {
      key: 'carrierCap',
      label: 'Capacity',
      sortable: true,
      render: (val) => <span className="text-xs font-semibold text-text-secondary">{val}</span>
    },
    {
      key: 'assignedDriverId',
      label: 'Assigned Driver',
      sortable: true,
      render: (val) => {
        const driverObj = drivers.find(d => d.id === val);
        return (
          <div className="flex items-center gap-2">
            <DriverAvatar name={driverObj?.name || 'Unassigned'} avatarUrl={driverObj?.avatar} size={28} />
            <span className="text-xs text-text-main font-bold">
              {driverObj ? driverObj.name : <span className="text-text-secondary font-semibold">Unassigned</span>}
            </span>
          </div>
        );
      }
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val) => <Badge status={val} />
    },
    {
      key: 'fuelLevel',
      label: 'Fuel %',
      sortable: true,
      render: (val) => (
        <div className="flex items-center gap-2 min-w-[70px]">
          <div className="w-full bg-hover h-2 rounded overflow-hidden border border-border/40">
            <div
              className={`h-full ${val < 25 ? 'bg-danger' : val < 60 ? 'bg-warning' : 'bg-success'}`}
              style={{ width: `${val}%` }}
            />
          </div>
          <span className="text-[10px] font-bold text-text-secondary">{val}%</span>
        </div>
      )
    },
    {
      key: 'lastServiceDate',
      label: 'Last Service',
      sortable: true,
      render: (val) => <span className="text-xs font-semibold text-text-secondary">{val || 'N/A'}</span>
    },
    {
      key: 'odometer',
      label: 'Odometer',
      sortable: true,
      render: (val) => <span className="text-xs text-text-main font-bold">{val?.toLocaleString()} km</span>
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewDetails(row.id)}
            className="p-1.5"
            title="View details"
          >
            <Eye size={12} />
          </Button>
          {isManager && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditDetails(row.id)}
                className="p-1.5"
                title="Edit Details"
              >
                <Edit size={12} />
              </Button>
              <Dropdown
                align="right"
                trigger={
                  <Button variant="outline" size="sm" className="p-1.5">
                    <span className="text-[9px] px-0.5 font-bold">&#8942;</span>
                  </Button>
                }
              >
                <div className="p-1 w-36 space-y-0.5 text-left">
                  <button
                    onClick={() => handleDuplicate(row.id)}
                    className="w-full text-left text-xs font-semibold px-2.5 py-1.5 hover:bg-hover rounded text-text-main flex items-center gap-1.5"
                  >
                    <Copy size={12} /> Duplicate
                  </button>
                  <button
                    onClick={() => handleToggleArchive(row.id)}
                    className="w-full text-left text-xs font-semibold px-2.5 py-1.5 hover:bg-hover rounded text-text-main flex items-center gap-1.5"
                  >
                    <Archive size={12} /> {row.isArchived ? 'Restore' : 'Archive'}
                  </button>
                  <button
                    onClick={() => handleDelete(row.id)}
                    className="w-full text-left text-xs font-semibold px-2.5 py-1.5 hover:bg-danger/10 hover:text-danger rounded text-danger flex items-center gap-1.5"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </Dropdown>
            </>
          )}
        </div>
      )
    }
  ];

  // Sorting columns fields schema
  const sortFields = [
    { label: 'Registration Plate', value: 'plateNumber' },
    { label: 'Purchase Date', value: 'purchaseDate' },
    { label: 'Odometer Mileage', value: 'odometer' },
    { label: 'Weight Capacity', value: 'capacityKg' }
  ];

  // Gate for Driver Workspace redirection
  if (currentUser?.role === 'Driver') {
    return (
      <VehicleDetails
        vehicleId={currentUser.assignedVehicleId || 'V002'}
        onBack={() => navigate('/dashboard')}
        onEdit={() => {}}
      />
    );
  }

  return (
    <PageContainer className="space-y-6">
      
      {/* View 1: FLEET REGISTRY GRID TABLE */}
      {viewMode === 'list' && (
        <div className="space-y-6">
          <PageHeader
            title="Vehicle Management"
            subtitle="Manage fleet assets, registration, lifecycle and operational status."
          />

          {/* Quick Stats Overview Grid */}
          <VehicleDashboard vehicles={vehicles} />

          {/* Single Line Scrollable Toolbar */}
          <div className="flex items-center gap-2 bg-card border border-border p-2 rounded-xl overflow-x-auto w-full select-none no-scrollbar flex-nowrap text-xs">
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search registration or model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-hover/20 border border-border text-xs px-3 py-1.5 rounded-lg text-text-main focus:outline-none focus:ring-1 focus:ring-info w-48 shrink-0"
            />

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-hover/20 border border-border text-xs px-3 py-1.5 rounded-lg text-text-main focus:outline-none focus:ring-1 focus:ring-info shrink-0 cursor-pointer"
            >
              <option value="">All Types</option>
              {VEHICLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-hover/20 border border-border text-xs px-3 py-1.5 rounded-lg text-text-main focus:outline-none focus:ring-1 focus:ring-info shrink-0 cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="Available">Available</option>
              <option value="On Trip">On Trip</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Retired">Retired</option>
            </select>

            {/* Region Filter */}
            <select
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
              className="bg-hover/20 border border-border text-xs px-3 py-1.5 rounded-lg text-text-main focus:outline-none focus:ring-1 focus:ring-info shrink-0 cursor-pointer"
            >
              <option value="">All Regions</option>
              <option value="North">North</option>
              <option value="South">South</option>
              <option value="East">East</option>
              <option value="West">West</option>
              <option value="Central">Central</option>
            </select>

            {/* Fuel Filter */}
            <select
              value={filterFuel}
              onChange={(e) => setFilterFuel(e.target.value)}
              className="bg-hover/20 border border-border text-xs px-3 py-1.5 rounded-lg text-text-main focus:outline-none focus:ring-1 focus:ring-info shrink-0 cursor-pointer"
            >
              <option value="">All Fuel Types</option>
              {FUEL_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
            </select>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Toolbar Action Buttons */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="text-xs shrink-0 py-1.5"
            >
              Reset Filters
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowArchived(!showArchived)}
              leftIcon={Archive}
              className={`text-xs shrink-0 py-1.5 ${showArchived ? 'bg-warning/10 text-warning border-warning/30' : ''}`}
            >
              {showArchived ? 'Show Active' : 'Show Archived'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={RefreshCw}
              onClick={loadVehicles}
              className="text-xs shrink-0 py-1.5"
            >
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={FileSpreadsheet}
              onClick={handleExportCSV}
              className="text-xs shrink-0 py-1.5"
            >
              Export CSV
            </Button>
            {isManager && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={Plus}
                onClick={() => {
                  setSelectedVehicleId(null);
                  setIsModalOpen(true);
                }}
                className="text-xs shrink-0 py-1.5"
              >
                Add Vehicle
              </Button>
            )}
          </div>

          {/* Core ERP DataTable */}
          <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
            <DataTable
              columns={columns}
              data={filteredVehicles}
              isLoading={loading}
              sortFields={sortFields}
              searchPlaceholder="Search registration, models, drivers, type..."
              onRowClick={handleRowClick}
              emptyMessage={showArchived ? "No archived vehicles found." : "No active vehicles registered."}
              bulkActions={(selectedIds, clearSelection) => isManager ? (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkArchive(selectedIds, clearSelection)}
                    className="text-xs"
                  >
                    {showArchived ? 'Restore Selected' : 'Archive Selected'}
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleBulkDelete(selectedIds, clearSelection)}
                    className="text-xs"
                  >
                    Delete Selected
                  </Button>
                </div>
              ) : null}
            />
          </div>

          {/* Slide-out detail Drawer details updating handler */}
          {drawerVehicleId && (
            <VehicleDrawer
              isOpen={isDrawerOpen}
              onClose={() => setIsDrawerOpen(false)}
              vehicleId={drawerVehicleId}
              onViewProfile={handleViewDetails}
              onEditProfile={handleEditDetails}
              onUpdate={loadVehicles}
            />
          )}
        </div>
      )}

      {/* View 2: DETAILED PROFILE VIEW */}
      {viewMode === 'details' && (
        <VehicleDetails
          vehicleId={selectedVehicleId}
          onBack={() => {
            setViewMode('list');
            loadVehicles();
          }}
          onEdit={handleEditDetails}
        />
      )}

      {/* Centered Modal form overlay */}
      <VehicleModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedVehicleId(null);
        }}
        vehicleId={selectedVehicleId}
        onSave={loadVehicles}
        vehiclesList={vehicles}
      />

    </PageContainer>
  );
};

export default Vehicles;
