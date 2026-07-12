import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Compass,
  Plus,
  RefreshCw,
  FileSpreadsheet,
  Eye,
  Edit,
  Trash2,
  AlertCircle
} from 'lucide-react';

// UI components
import PageContainer from '../../components/ui/PageContainer';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Dropdown from '../../components/ui/Dropdown';
import DataTable from '../../components/ui/DataTable';

// Custom subcomponents
import TripModal from './components/TripModal';
import TripDrawer from './components/TripDrawer';

// Mock Services & Context
import { tripService } from '../../services/tripService';
import { vehicleService } from '../../services/vehicleService';
import { driverService } from '../../services/driverService';
import { showToast } from '../../components/ui/Toast';
import { VehicleImage, DriverAvatar } from '../../components/ui/FallbackImage';
import { useAuth } from '../../context/AuthContext';

const Trips = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const isManager = currentUser?.role === 'Admin' || currentUser?.role === 'Fleet Manager';

  // Navigation states
  const [viewMode, setViewMode] = useState('list'); // list
  const [selectedTripId, setSelectedTripId] = useState(null);

  // Drawer slider states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerTripId, setDrawerTripId] = useState(null);

  // Modal open states
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Trips data states
  const [trips, setTrips] = useState(tripService.getAll());
  const [vehicles, setVehicles] = useState(vehicleService.getAll());
  const [drivers, setDrivers] = useState(driverService.getAll());
  const [loading, setLoading] = useState(false);

  // Toolbar & filter configurations
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Initial load
  useEffect(() => {
    loadTrips();
    loadDependencies();
  }, []);

  // Detect URL search triggers
  useEffect(() => {
    if (searchParams.get('dispatch') === 'true' || searchParams.get('add') === 'true') {
      setSearchParams({}, { replace: true });
      if (isManager) {
        setSelectedTripId(null);
        setIsModalOpen(true);
      } else {
        showToast.error("Security audit failed. Manager credentials required.");
      }
    }
  }, [searchParams, isManager]);

  const loadTrips = async () => {
    setLoading(true);
    try {
      const data = await tripService.getAll();
      setTrips(data);
    } catch {
      showToast.error("Failed to load dispatch registry");
    } finally {
      setLoading(false);
    }
  };

  const loadDependencies = async () => {
    try {
      const [vData, dData] = await Promise.all([
        vehicleService.getAll(),
        driverService.getAll()
      ]);
      setVehicles(vData);
      setDrivers(dData);
    } catch {
      console.error("Failed to load dependencies");
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterStatus('');
  };

  // Pre-filter data client-side for the DataTable
  const filteredTrips = useMemo(() => {
    let result = [...trips];

    // Search query matches
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.tripNumber?.toLowerCase().includes(q) ||
        t.origin?.toLowerCase().includes(q) ||
        t.destination?.toLowerCase().includes(q)
      );
    }

    // Role-based filter: Drivers only see own trips
    if (currentUser?.role === 'Driver') {
      const matchingDriver = drivers.find(d => d.email?.toLowerCase().trim() === currentUser.email?.toLowerCase().trim());
      if (matchingDriver) {
        result = result.filter(t => t.driverId === matchingDriver.id);
      } else {
        result = [];
      }
    }

    return result;
  }, [trips, searchQuery, filterStatus, currentUser, drivers]);

  // Actions handlers
  const handleViewDetails = (id) => {
    setIsDrawerOpen(false);
    setDrawerTripId(id);
    setIsDrawerOpen(true);
  };

  const handleEditDetails = (id) => {
    setIsDrawerOpen(false);
    setSelectedTripId(id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this trip dispatch? This action is permanent.")) {
      try {
        await tripService.delete(id);
        showToast.success("Trip dispatch removed");
        loadTrips();
      } catch {
        showToast.error("Failed to delete trip");
      }
    }
  };

  const handleBulkDelete = async (ids, clearSelection) => {
    if (window.confirm(`Are you sure you want to delete ${ids.length} selected dispatches?`)) {
      try {
        await Promise.all(ids.map(id => tripService.delete(id)));
        showToast.success(`Successfully removed ${ids.length} dispatch logs`);
        clearSelection();
        loadTrips();
      } catch {
        showToast.error("Bulk delete failed");
      }
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (filteredTrips.length === 0) return;

    const headers = ['Trip Number', 'Vehicle Code', 'Driver Name', 'Origin', 'Destination', 'Distance', 'Status'];
    const rows = filteredTrips.map(t => {
      const vehicleObj = vehicles.find(v => v.id === t.vehicleId);
      const driverObj = drivers.find(d => d.id === t.driverId);
      return [
        t.tripNumber,
        vehicleObj?.plateNumber || t.vehicleId,
        driverObj?.name || t.driverId,
        t.origin,
        t.destination,
        t.distance,
        t.status
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `transitops_dispatches_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast.success('CSV Export download started');
  };

  // Row clicked loads quick drawer
  const handleRowClick = (row) => {
    setDrawerTripId(row.id);
    setIsDrawerOpen(true);
  };

  // Column definitions
  const columns = [
    {
      key: 'tripNumber',
      label: 'Trip ID',
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
      key: 'vehicleId',
      label: 'Vehicle Plate',
      sortable: true,
      render: (val) => {
        const vehicleObj = vehicles.find(v => v.id === val);
        return (
          <div className="flex items-center gap-2">
            <VehicleImage src={vehicleObj?.image} size={32} />
            <span className="text-xs font-bold text-text-main">
              {vehicleObj ? vehicleObj.plateNumber : <span className="text-text-secondary font-semibold">{val}</span>}
            </span>
          </div>
        );
      }
    },
    {
      key: 'driverId',
      label: 'Driver Name',
      sortable: true,
      render: (val) => {
        const driverObj = drivers.find(d => d.id === val);
        return (
          <div className="flex items-center gap-2">
            <DriverAvatar name={driverObj?.name || 'Unassigned'} avatarUrl={driverObj?.avatar} size={28} />
            <span className="text-xs font-semibold text-text-main">
              {driverObj ? driverObj.name : <span className="text-text-secondary">Unassigned</span>}
            </span>
          </div>
        );
      }
    },
    {
      key: 'route',
      label: 'Dispatch Route Path',
      render: (_, row) => (
        <span className="text-xs font-semibold text-text-main">
          {row.origin} &rarr; {row.destination}
        </span>
      )
    },
    {
      key: 'distance',
      label: 'Distance (km)',
      sortable: true,
      render: (val) => <span className="text-xs font-bold text-text-secondary">{val} km</span>
    },
    {
      key: 'cargoWeight',
      label: 'Cargo Load',
      sortable: true,
      render: (val) => <span className="text-xs text-text-secondary font-semibold">{val}</span>
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val) => <Badge status={val} />
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
          {isManager && row.status !== 'Completed' && row.status !== 'Cancelled' && (
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
                <div className="p-1 w-32 space-y-0.5 text-left">
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

  const sortFields = [
    { label: 'Trip Number', value: 'tripNumber' },
    { label: 'Distance', value: 'distance' },
    { label: 'Cargo Load', value: 'cargoWeight' }
  ];

  return (
    <PageContainer className="space-y-6">
      
      {viewMode === 'list' && (
        <div className="space-y-6">
          <PageHeader
            title="Trip Management"
            subtitle="Dispatch commercial cargo trips, optimize routes and track fuel consumptions."
          />

          {/* Single Line Scrollable Toolbar */}
          <div className="flex items-center gap-2 bg-card border border-border p-2 rounded-xl overflow-x-auto w-full select-none no-scrollbar flex-nowrap text-xs">
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search TRIP-ID or route cities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-hover/20 border border-border text-xs px-3 py-1.5 rounded-lg text-text-main focus:outline-none focus:ring-1 focus:ring-info w-48 shrink-0"
            />

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-hover/20 border border-border text-xs px-3 py-1.5 rounded-lg text-text-main focus:outline-none focus:ring-1 focus:ring-info shrink-0 cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            {/* Spacer */}
            <div className="flex-1" />

            <Button variant="outline" size="sm" onClick={handleResetFilters} className="text-xs shrink-0 py-1.5">
              Reset Filters
            </Button>
            <Button variant="outline" size="sm" leftIcon={RefreshCw} onClick={loadTrips} className="text-xs shrink-0 py-1.5">
              Refresh
            </Button>
            <Button variant="outline" size="sm" leftIcon={FileSpreadsheet} onClick={handleExportCSV} className="text-xs shrink-0 py-1.5">
              Export CSV
            </Button>
            {isManager && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={Plus}
                onClick={() => {
                  setSelectedTripId(null);
                  setIsModalOpen(true);
                }}
                className="text-xs shrink-0 py-1.5"
              >
                Dispatch Trip
              </Button>
            )}
          </div>

          {/* DataTable */}
          <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
            <DataTable
              columns={columns}
              data={filteredTrips}
              isLoading={loading}
              sortFields={sortFields}
              searchPlaceholder="Search dispatches number or routes..."
              onRowClick={handleRowClick}
              emptyMessage="No trips dispatched under active filters."
              bulkActions={(selectedIds, clearSelection) => isManager ? (
                <div className="flex gap-2">
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

          {/* Slider Drawer */}
          {drawerTripId && (
            <TripDrawer
              isOpen={isDrawerOpen}
              onClose={() => setIsDrawerOpen(false)}
              tripId={drawerTripId}
              trip={trips.find(t => t.id === drawerTripId)}
              onViewProfile={handleViewDetails}
              onEditProfile={handleEditDetails}
              onUpdate={() => { loadTrips(); loadDependencies(); }}
            />
          )}

        </div>
      )}

      {/* Centered Modal */}
      <TripModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTripId(null);
        }}
        tripId={selectedTripId}
        onSave={() => { loadTrips(); loadDependencies(); }}
      />

    </PageContainer>
  );
};

export default Trips;
