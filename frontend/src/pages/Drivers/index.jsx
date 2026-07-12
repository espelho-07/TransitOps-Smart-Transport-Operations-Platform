import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Users,
  Plus,
  RefreshCw,
  FileSpreadsheet,
  Eye,
  Edit,
  Trash2,
  Copy,
  ShieldAlert
} from 'lucide-react';

// UI components
import PageContainer from '../../components/ui/PageContainer';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Dropdown from '../../components/ui/Dropdown';
import DataTable from '../../components/ui/DataTable';

// Custom subcomponents
import DriverModal from './components/DriverModal';
import DriverDrawer from './components/DriverDrawer';

// Mock Services & Context
import { driverService } from '../../services/driverService';
import { showToast } from '../../components/ui/Toast';
import { DriverAvatar } from '../../components/ui/FallbackImage';
import { useAuth } from '../../context/AuthContext';

const Drivers = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const isManager = currentUser?.role === 'Admin' || currentUser?.role === 'Fleet Manager';
  const isSafety = currentUser?.role === 'Admin' || currentUser?.role === 'Safety Officer';

  // State hooks
  const [viewMode, setViewMode] = useState('list'); // list
  const [selectedDriverId, setSelectedDriverId] = useState(null);

  // Drawer slider states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerDriverId, setDrawerDriverId] = useState(null);

  // Modal open states
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Drivers lists state
  const [drivers, setDrivers] = useState(driverService.getAll());
  const [loading, setLoading] = useState(false);

  // Toolbar & filter configurations
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Initial load
  useEffect(() => {
    loadDrivers();
  }, []);

  // Detect URL search triggers
  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      setSearchParams({}, { replace: true });
      if (isManager || isSafety) {
        setSelectedDriverId(null);
        setIsModalOpen(true);
      } else {
        showToast.error("Security audit failed. Unauthorized access level.");
      }
    }
  }, [searchParams, isManager, isSafety]);

  const loadDrivers = async () => {
    setLoading(true);
    try {
      const data = await driverService.getAll();
      setDrivers(data);
    } catch {
      showToast.error("Failed to load driver registry");
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterStatus('');
  };

  // Pre-filter database records client-side
  const filteredDrivers = useMemo(() => {
    let result = [...drivers];

    // Search query matches
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(d =>
        d.name?.toLowerCase().includes(q) ||
        d.licenseNumber?.toLowerCase().includes(q) ||
        d.email?.toLowerCase().includes(q)
      );
    }

    // Status filter matches
    if (filterStatus) {
      result = result.filter(d => d.status === filterStatus);
    }

    return result;
  }, [drivers, searchQuery, filterStatus]);

  // Actions handlers
  const handleViewDetails = (id) => {
    setIsDrawerOpen(false);
    setDrawerDriverId(id);
    setIsDrawerOpen(true);
  };

  const handleEditDetails = (id) => {
    setIsDrawerOpen(false);
    setSelectedDriverId(id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this driver profile? This action is permanent.")) {
      try {
        await driverService.delete(id);
        showToast.success("Driver profile removed successfully");
        loadDrivers();
      } catch {
        showToast.error("Failed to delete driver");
      }
    }
  };

  const handleBulkDelete = async (ids, clearSelection) => {
    if (window.confirm(`Are you sure you want to delete ${ids.length} selected drivers?`)) {
      try {
        await Promise.all(ids.map(id => driverService.delete(id)));
        showToast.success(`Successfully removed ${ids.length} driver profiles`);
        clearSelection();
        loadDrivers();
      } catch {
        showToast.error("Bulk delete failed");
      }
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (filteredDrivers.length === 0) return;
    
    const headers = ['Driver ID', 'Name', 'Email', 'Phone', 'License', 'Status', 'Rating'];
    const rows = filteredDrivers.map(d => [
      d.id,
      d.name,
      d.email,
      d.phone,
      d.licenseNumber,
      d.status,
      d.ratings
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `transitops_drivers_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast.success('CSV Export download started');
  };

  // Row click logs quick view drawer
  const handleRowClick = (row) => {
    setDrawerDriverId(row.id);
    setIsDrawerOpen(true);
  };

  // Columns definitions
  const columns = [
    {
      key: 'avatar',
      label: 'Avatar',
      render: (_, row) => <DriverAvatar name={row.name} avatarUrl={row.avatar} size={36} />
    },
    {
      key: 'name',
      label: 'Driver Name',
      sortable: true,
      render: (val, row) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleViewDetails(row.id);
          }}
          className="font-bold text-info hover:underline text-left text-xs"
        >
          {val}
        </button>
      )
    },
    {
      key: 'contact',
      label: 'Contact Info',
      render: (_, row) => (
        <div className="text-left text-xs font-semibold text-text-secondary leading-tight">
          <span className="block text-text-main font-bold">{row.email}</span>
          <span className="block text-[10px] mt-0.5">{row.phone}</span>
        </div>
      )
    },
    {
      key: 'licenseNumber',
      label: 'CDL License',
      sortable: true,
      render: (val) => <span className="text-xs font-mono font-bold text-text-main uppercase">{val}</span>
    },
    {
      key: 'ratings',
      label: 'Safety Score',
      sortable: true,
      render: (val) => <span className="text-xs text-success font-bold">{val} / 5.0</span>
    },
    {
      key: 'hireDate',
      label: 'Hired Date',
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
    { label: 'Name', value: 'name' },
    { label: 'License Number', value: 'licenseNumber' },
    { label: 'Safety Rating', value: 'ratings' },
    { label: 'Hire Date', value: 'hireDate' }
  ];

  return (
    <PageContainer className="space-y-6">
      
      {viewMode === 'list' && (
        <div className="space-y-6">
          <PageHeader
            title="Driver Management"
            subtitle="Manage commercial drivers, licensing compliance, and profile data."
          />

          {/* Single Line Scrollable Toolbar */}
          <div className="flex items-center gap-2 bg-card border border-border p-2 rounded-xl overflow-x-auto w-full select-none no-scrollbar flex-nowrap text-xs">
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search driver name or CDL..."
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
              <option value="Available">Available</option>
              <option value="On Trip">On Trip</option>
              <option value="Suspended">Suspended</option>
            </select>

            {/* Spacer */}
            <div className="flex-1" />

            <Button variant="outline" size="sm" onClick={handleResetFilters} className="text-xs shrink-0 py-1.5">
              Reset Filters
            </Button>
            <Button variant="outline" size="sm" leftIcon={RefreshCw} onClick={loadDrivers} className="text-xs shrink-0 py-1.5">
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
                  setSelectedDriverId(null);
                  setIsModalOpen(true);
                }}
                className="text-xs shrink-0 py-1.5"
              >
                Add Driver
              </Button>
            )}
          </div>

          {/* DataTable */}
          <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
            <DataTable
              columns={columns}
              data={filteredDrivers}
              isLoading={loading}
              sortFields={sortFields}
              searchPlaceholder="Search driver name, license or emails..."
              onRowClick={handleRowClick}
              emptyMessage="No drivers registered under active filters."
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
          {drawerDriverId && (
            <DriverDrawer
              isOpen={isDrawerOpen}
              onClose={() => setIsDrawerOpen(false)}
              driverId={drawerDriverId}
              driver={drivers.find(d => d.id === drawerDriverId)}
              onViewProfile={handleViewDetails}
              onEditProfile={handleEditDetails}
              onUpdate={loadDrivers}
            />
          )}

        </div>
      )}

      {/* Centered Modal */}
      <DriverModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDriverId(null);
        }}
        driverId={selectedDriverId}
        onSave={loadDrivers}
        driversList={drivers}
      />

    </PageContainer>
  );
};

export default Drivers;
