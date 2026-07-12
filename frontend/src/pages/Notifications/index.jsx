import React, { useState, useEffect, useMemo } from 'react';
import {
  Bell,
  RefreshCw,
  Trash2,
  CheckSquare,
  ShieldAlert,
  Info,
  Calendar,
  Layers,
  CheckCircle,
  Truck,
  Wrench,
  DollarSign
} from 'lucide-react';
import PageContainer from '../../components/ui/PageContainer';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import { notificationService } from '../../services/notificationService';
import { showToast } from '../../components/ui/Toast';

const Notifications = () => {
  const [notificationsList, setNotificationsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getAll();
      setNotificationsList(data);
    } catch {
      showToast.error('Failed to sync notification logs');
    } finally {
      setLoading(false);
    }
  };

  const filteredNotifications = useMemo(() => {
    return notificationsList.filter(n => {
      const matchesSearch = n.title?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType ? n.type === filterType : true;
      return matchesSearch && matchesType;
    });
  }, [notificationsList, searchQuery, filterType]);

  const stats = useMemo(() => {
    const unread = notificationsList.filter(n => n.unread).length;
    const total = notificationsList.length;
    return { unread, total };
  }, [notificationsList]);

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      showToast.success('Notification marked as read');
      fetchData();
    } catch {
      showToast.error('Failed to update status');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      showToast.success('All notifications marked as read');
      fetchData();
    } catch {
      showToast.error('Failed to update status');
    }
  };

  const handleArchive = async (id) => {
    try {
      await notificationService.archive(id);
      showToast.success('Notification archived');
      fetchData();
    } catch {
      showToast.error('Failed to delete notification');
    }
  };

  const columns = [
    {
      header: 'Category',
      accessor: 'type',
      cell: (row) => {
        let icon = <Info size={14} className="text-info" />;
        if (row.type === 'vehicle') icon = <Truck size={14} className="text-info" />;
        if (row.type === 'trip') icon = <Layers size={14} className="text-success" />;
        if (row.type === 'maintenance') icon = <Wrench size={14} className="text-warning" />;
        if (row.type === 'license') icon = <ShieldAlert size={14} className="text-danger" />;
        if (row.type === 'expense') icon = <DollarSign size={14} className="text-success" />;

        return (
          <div className="flex items-center justify-center h-8 w-8 bg-hover/80 rounded-full shrink-0">
            {icon}
          </div>
        );
      }
    },
    {
      header: 'Notification Details',
      accessor: 'title',
      cell: (row) => (
        <div className="text-left py-1">
          <span className={`block text-xs font-bold leading-normal ${row.unread ? 'text-text-main font-black' : 'text-text-secondary font-medium'}`}>
            {row.title}
          </span>
          <span className="text-[10px] text-text-secondary/80 font-medium block mt-0.5">{row.time}</span>
        </div>
      )
    },
    {
      header: 'Read Status',
      accessor: 'unread',
      cell: (row) => (
        <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
          row.unread ? 'bg-info/10 text-info' : 'bg-hover/80 text-text-secondary'
        }`}>
          {row.unread ? 'Unread' : 'Read'}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        <div className="flex gap-2 justify-end">
          {row.unread && (
            <Button variant="outline" size="sm" onClick={() => handleMarkRead(row.id)} className="px-2">
              <CheckSquare size={13} />
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => handleArchive(row.id)} className="px-2 text-danger border-danger/25 hover:bg-danger/5">
            <Trash2 size={13} />
          </Button>
        </div>
      )
    }
  ];

  return (
    <PageContainer>
      <div className="space-y-5 select-none text-left">
        
        {/* Statistics Widgets Banner */}
        <div className="grid grid-cols-2 gap-4 max-w-lg">
          <div className="bg-card border border-border p-4 rounded-xl flex items-center gap-4">
            <div className="h-10 w-10 bg-info/10 text-info flex items-center justify-center rounded-lg">
              <Bell size={20} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-text-secondary">Unread Alerts</span>
              <p className="text-xl font-black text-text-main mt-0.5">{stats.unread}</p>
            </div>
          </div>
          <div className="bg-card border border-border p-4 rounded-xl flex items-center gap-4">
            <div className="h-10 w-10 bg-hover/80 text-text-secondary flex items-center justify-center rounded-lg">
              <CheckCircle size={20} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-text-secondary">Total Logs</span>
              <p className="text-xl font-black text-text-main mt-0.5">{stats.total}</p>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-card border border-border p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 flex-col sm:flex-row gap-3 w-full">
            <input
              type="text"
              placeholder="Search alert messages..."
              className="bg-background text-text-main border border-border rounded-lg px-3.5 py-1.5 text-xs w-full max-w-sm focus:outline-none focus:border-info"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />

            <select
              className="bg-background text-text-main border border-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-info"
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="vehicle">Vehicles</option>
              <option value="trip">Trips</option>
              <option value="maintenance">Maintenance</option>
              <option value="license">Licensing</option>
              <option value="expense">Expenses</option>
            </select>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
            <Button variant="outline" size="sm" onClick={handleMarkAllRead} disabled={stats.unread === 0}>
              Mark All Read
            </Button>
            <Button variant="outline" size="sm" onClick={fetchData} className="px-2">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </Button>
          </div>
        </div>

        {/* Notifications Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <DataTable
            columns={columns}
            data={filteredNotifications}
            loading={loading}
            emptyMessage="No notifications found in your inbox."
          />
        </div>
      </div>
    </PageContainer>
  );
};

export default Notifications;
