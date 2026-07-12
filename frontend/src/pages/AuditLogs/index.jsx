import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  RefreshCw,
  FileSpreadsheet,
  Search,
  Calendar,
  Layers,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import PageContainer from '../../components/ui/PageContainer';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import DataTable from '../../components/ui/DataTable';
import { useAuth } from '../../context/AuthContext';
import { activityService } from '../../services/activityService';
import { showToast } from '../../components/ui/Toast';

const AuditLogs = () => {
  const { currentUser } = useAuth();
  const hasAccess = currentUser?.role === 'Admin' || currentUser?.role === 'Safety Officer';

  // State Management
  const [activitiesList, setActivitiesList] = useState(activityService.getAll());
  const [loading, setLoading] = useState(false);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('');

  // Initial Load
  useEffect(() => {
    if (hasAccess) {
      fetchData();
    }
  }, [hasAccess]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await activityService.getAll();
      setActivitiesList(data);
    } catch {
      showToast.error('Failed to sync system audit ledger logs');
    } finally {
      setLoading(false);
    }
  };

  // Unique actions for filters dropdown
  const uniqueActions = useMemo(() => {
    const list = activitiesList.map(a => a.action).filter(Boolean);
    return [...new Set(list)];
  }, [activitiesList]);

  // Client Side Filter
  const filteredActivities = useMemo(() => {
    return activitiesList.filter(act => {
      const matchesSearch = 
        act.user?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.id?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesAction = filterAction ? act.action === filterAction : true;

      return matchesSearch && matchesAction;
    });
  }, [activitiesList, searchQuery, filterAction]);

  const handleExportCSV = () => {
    const headers = ['Log ID', 'Operator User', 'Action Type', 'Description Details', 'Timestamp', 'Status'];
    const rows = filteredActivities.map(a => [
      a.id,
      a.user,
      a.action,
      a.description,
      a.date,
      a.status
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `TransitOps_SystemAuditLogs_Export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast.success('CSV export compiled!');
  };

  const columns = [
    {
      header: 'Audit ID',
      accessor: 'id',
      cell: (row) => <span className="font-bold text-text-main">{row.id}</span>
    },
    {
      header: 'Operator',
      accessor: 'user',
      cell: (row) => <span className="font-bold text-text-main">{row.user}</span>
    },
    {
      header: 'Action Class',
      accessor: 'action',
      cell: (row) => <span className="font-semibold text-text-main text-xs bg-hover/80 px-2.5 py-1 rounded-full">{row.action}</span>
    },
    {
      header: 'System Directives',
      accessor: 'description',
      cell: (row) => <span className="text-text-secondary leading-normal block">{row.description}</span>
    },
    {
      header: 'Timestamp',
      accessor: 'date',
      cell: (row) => <span className="text-text-secondary text-xs">{row.date}</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => (
        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-success bg-success/10 px-2 py-0.5 rounded">
          Success
        </span>
      )
    }
  ];

  if (!hasAccess) {
    return (
      <PageContainer>
        <div className="bg-card border border-border p-8 rounded-lg shadow-sm text-center select-none space-y-3">
          <ShieldAlert size={40} className="mx-auto text-danger" />
          <h3 className="text-base font-black text-text-main uppercase">Access Denied</h3>
          <p className="text-text-secondary text-xs max-w-sm mx-auto leading-relaxed">
            You do not possess the required Security Clearance to inspect organization action logs.
          </p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-5 select-none text-left">
        
        {/* Search and Filters */}
        <div className="bg-card border border-border p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 flex-col sm:flex-row gap-3 w-full">
            <input
              type="text"
              placeholder="Search user name, log directive ID..."
              className="bg-background text-text-main border border-border rounded-lg px-3.5 py-1.5 text-xs w-full max-w-sm focus:outline-none focus:border-info"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />

            <select
              className="bg-background text-text-main border border-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-info"
              value={filterAction}
              onChange={e => setFilterAction(e.target.value)}
            >
              <option value="">All Action Types</option>
              {uniqueActions.map(actName => (
                <option key={actName} value={actName}>{actName}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <FileSpreadsheet size={14} className="mr-1.5" /> Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={fetchData} className="px-2">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </Button>
          </div>
        </div>

        {/* Audit Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <DataTable
            columns={columns}
            data={filteredActivities}
            loading={loading}
            emptyMessage="No audit log entries matched filters criteria."
          />
        </div>
      </div>
    </PageContainer>
  );
};

export default AuditLogs;
