import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title as ChartTitle,
  Tooltip as ChartTooltip,
  Legend,
  Filler
} from 'chart.js';
import { Doughnut, Pie, Line, Bar } from 'react-chartjs-2';
import {
  Truck,
  Users,
  Compass,
  Wrench,
  Clock,
  AlertTriangle,
  Activity,
  Plus,
  Fuel,
  DollarSign,
  CheckCircle,
  Calendar,
  Sparkles,
  RefreshCw,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';

// Import Reusable Design System components
import PageContainer from '../../components/ui/PageContainer';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import MetricCard from '../../components/ui/MetricCard';
import Card from '../../components/ui/Card';
import ChartCard from '../../components/ui/ChartCard';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Timeline from '../../components/ui/Timeline';
import Skeleton from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import NoData from '../../components/ui/NoData';
import QuickActionCard from '../../components/ui/QuickActionCard';

// Import Mock Services
import dashboardService from '../../services/dashboardService';
import { tripService } from '../../services/tripService';
import { maintenanceService } from '../../services/maintenanceService';
import { fuelService } from '../../services/fuelService';
import { notificationService } from '../../services/notificationService';
import { activityService } from '../../services/activityService';

// Register Chart.js Components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  ChartTitle,
  ChartTooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const navigate = useNavigate();

  // Loading, error and datasets states
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [kpis, setKpis] = useState(null);
  const [chartsData, setChartsData] = useState(null);
  const [insights, setInsights] = useState([]);
  const [tripsList, setTripsList] = useState([]);
  const [maintenanceList, setMaintenanceList] = useState([]);
  const [fuelList, setFuelList] = useState([]);
  const [notificationsList, setNotificationsList] = useState([]);
  const [activitiesList, setActivitiesList] = useState([]);
  
  // Theme state to re-trigger charts styling
  const [themeMode, setThemeMode] = useState(
    document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  );

  // 1. Listen to DOM theme class mutations to make graphs reactive
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains('dark');
      setThemeMode(isDark ? 'dark' : 'light');
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // 2. Fetch all operational logs and dashboard stats
  const fetchDashboardData = async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const [kpiRes, chartRes, insightRes, tripRes, maintRes, fuelRes, notifRes, actRes] = await Promise.all([
        dashboardService.getKPIs(),
        dashboardService.getChartsData(),
        dashboardService.getInsights(),
        tripService.getAll(),
        maintenanceService.getAll(),
        fuelService.getAll(),
        notificationService.getAll(),
        activityService.getAll()
      ]);

      setKpis(kpiRes);
      setChartsData(chartRes);
      setInsights(insightRes);
      setTripsList(tripRes);
      setMaintenanceList(maintRes.slice(0, 5)); // show recent 5
      setFuelList(fuelRes.slice(0, 5)); // show recent 5
      setNotificationsList(notifRes.slice(0, 6)); // show recent 6
      setActivitiesList(actRes.slice(0, 6)); // show recent 6
    } catch (err) {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // 3. Dynamic chart color settings matching theme modes
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: themeMode === 'dark' ? '#E5E7EB' : '#374151',
          font: { size: 11, weight: '600' },
          padding: 12
        }
      },
      tooltip: {
        backgroundColor: themeMode === 'dark' ? '#18181B' : '#FFFFFF',
        titleColor: themeMode === 'dark' ? '#FFFFFF' : '#111827',
        bodyColor: themeMode === 'dark' ? '#D1D5DB' : '#4B5563',
        borderColor: themeMode === 'dark' ? '#2E2E34' : '#E5E7EB',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8
      }
    },
    scales: {
      x: {
        grid: { color: themeMode === 'dark' ? '#2E2E34' : '#E5E7EB' },
        ticks: { color: themeMode === 'dark' ? '#9CA3AF' : '#6B7280', font: { size: 10, weight: '600' } }
      },
      y: {
        grid: { color: themeMode === 'dark' ? '#2E2E34' : '#E5E7EB' },
        ticks: { color: themeMode === 'dark' ? '#9CA3AF' : '#6B7280', font: { size: 10, weight: '600' } }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: themeMode === 'dark' ? '#E5E7EB' : '#374151',
          font: { size: 10, weight: '600' },
          padding: 10
        }
      },
      tooltip: {
        backgroundColor: themeMode === 'dark' ? '#18181B' : '#FFFFFF',
        titleColor: themeMode === 'dark' ? '#FFFFFF' : '#111827',
        bodyColor: themeMode === 'dark' ? '#D1D5DB' : '#4B5563',
        borderColor: themeMode === 'dark' ? '#2E2E34' : '#E5E7EB',
        borderWidth: 1,
        padding: 8,
        cornerRadius: 8
      }
    }
  };

  // 4. Reusable DataTable Column configurations for Recent Trips
  const tripColumns = [
    {
      key: 'id',
      label: 'Trip ID',
      sortable: true,
      render: (val) => <span className="font-bold text-info">{val}</span>
    },
    {
      key: 'vehicleId',
      label: 'Vehicle ID',
      sortable: true,
      render: (val) => <span className="font-bold text-text-main">{val}</span>
    },
    {
      key: 'driverId',
      label: 'Driver ID',
      sortable: true,
      render: (val) => <span className="text-text-secondary">{val}</span>
    },
    { key: 'origin', label: 'Origin', sortable: true },
    { key: 'destination', label: 'Destination', sortable: true },
    { key: 'cargoWeight', label: 'Cargo Weight' },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val) => <Badge status={val} />
    },
    {
      key: 'startDate',
      label: 'Dispatch Time',
      render: (val) => val ? new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'
    }
  ];

  // Actions for selected rows in DataTable bulk actions banner
  const renderBulkActions = (ids, clearSelection) => (
    <Button
      variant="danger"
      size="sm"
      onClick={() => {
        alert(`Dispatched Bulk Action for: ${ids.join(', ')}`);
        clearSelection();
      }}
    >
      Cancel Selection
    </Button>
  );

  // Expandable sub-view detail row renderer for trips table
  const renderExpandableRow = (row) => (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-2.5">
      <div>
        <span className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest">Trip Code</span>
        <span className="text-xs font-semibold text-text-main">{row.tripNumber}</span>
      </div>
      <div>
        <span className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest">Est. Distance</span>
        <span className="text-xs font-semibold text-text-main">{row.distance} km</span>
      </div>
      <div>
        <span className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest">Dispatch Date</span>
        <span className="text-xs font-semibold text-text-main">{row.startDate ? new Date(row.startDate).toLocaleDateString() : '-'}</span>
      </div>
      <div>
        <span className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest">Cargo Detail</span>
        <span className="text-xs font-semibold text-text-main">Standard Logistics Cargo</span>
      </div>
    </div>
  );

  // 5. Loading State View (Skeleton layout)
  if (isLoading) {
    return (
      <PageContainer>
        <div className="space-y-6">
          <div className="h-10 bg-border animate-pulse rounded-lg w-1/4" />
          <Skeleton variant="dashboard" />
        </div>
      </PageContainer>
    );
  }

  // 6. Error State View (with Retry callback)
  if (hasError) {
    return (
      <PageContainer>
        <ErrorState
          code="500"
          title="Operations Registry Failure"
          message="We encountered an exception mapping logistics datasets. Try reloading the services."
          actionText="Retry Loading"
          onActionClick={fetchDashboardData}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-6">
      {/* 1. Header Segment */}
      <PageHeader
        title="Good Morning, Alex Johnson"
        subtitle="Operations Overview | Fleet Manager Credentials"
        actions={
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border rounded-lg text-xs font-semibold text-text-secondary select-none">
              <Calendar size={14} />
              {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <Button
              variant="outline"
              size="sm"
              leftIcon={RefreshCw}
              onClick={fetchDashboardData}
              className="text-xs"
            >
              Refresh Logs
            </Button>
          </div>
        }
      />

      {/* 2. KPI Cards Grid (12 indicators in groups of 4) */}
      <div className="space-y-4">
        {/* Row 1: Fleet Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Active Vehicles" value={kpis.activeVehicles} change="8.5" isPositive={true} icon={Truck} sparklineData={[20, 24, 22, 28, 25, 27, 28]} />
          <StatCard title="Available Vehicles" value={kpis.availableVehicles} change="4.2" isPositive={true} icon={CheckCircle} sparklineData={[15, 18, 16, 22, 21, 26, 28]} />
          <StatCard title="Vehicles On Trip" value={kpis.vehiclesOnTrip} change="12.0" isPositive={true} icon={Compass} sparklineData={[10, 12, 11, 14, 13, 14, 15]} />
          <StatCard title="In Maintenance" value={kpis.vehiclesInMaintenance} change="2.1" isPositive={false} icon={Wrench} sparklineData={[8, 7, 9, 6, 5, 4, 5]} />
        </div>

        {/* Row 2: Driver & Dispatch Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Drivers Available" value={kpis.driversAvailable} change="5.0" isPositive={true} icon={Users} />
          <MetricCard label="Drivers On Trip" value={kpis.driversOnTrip} change="12.5" isPositive={true} icon={Compass} />
          <MetricCard label="Trips Dispatched Today" value={kpis.tripsToday} change="15.0" isPositive={true} icon={Activity} />
          <MetricCard label="Completed Trips" value={kpis.completedTrips} change="18.2" isPositive={true} icon={CheckCircle} />
        </div>

        {/* Row 3: Finances & Utilizations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Scheduled Trips" value={kpis.pendingTrips} change="5.4" isPositive={true} icon={Clock} sparklineData={[5, 6, 8, 5, 7, 9, 8]} />
          <StatCard title="Fuel Cost Today" value={`$${kpis.fuelCostToday}`} change="3.1" isPositive={false} icon={Fuel} sparklineData={[120, 110, 130, 95, 115, 105, 98]} />
          <StatCard title="Fleet Utilization %" value={`${kpis.fleetUtilization}%`} change="12.2" isPositive={true} icon={TrendingUp} sparklineData={[28, 29, 31, 30, 32, 33, 31]} />
          <MetricCard label="Monthly Operational Expense" value={`$${kpis.monthlyExpense}`} change="1.5" isPositive={false} icon={DollarSign} />
        </div>
      </div>

      {/* 3. Quick Actions shortcuts Panel */}
      <Card title="Quick Action Panel" subtitle="Launch logistics modules actions shortcuts">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <QuickActionCard title="Add Vehicle Asset" description="Register a new fleet carrier or van asset" buttonText="Add Vehicle" icon={Truck} onClick={() => navigate('/vehicles')} />
          <QuickActionCard title="Register Driver" description="Log driver profile credentials and details" buttonText="Add Driver" icon={Users} onClick={() => navigate('/drivers')} />
          <QuickActionCard title="Create Cargo Dispatch" description="Schedule and authorize a new trip route" buttonText="Create Trip" icon={Compass} onClick={() => navigate('/trips')} />
          <QuickActionCard title="Schedule Maintenance" description="Open diagnostic logs or schedule repair service" buttonText="Schedule" icon={Wrench} onClick={() => navigate('/maintenance')} />
        </div>
      </Card>

      {/* 4. Chart Grid Row 1: completed trends and category expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard title="Monthly Completed Trips" subtitle="Monthly trend comparison (last 6 months)" isLoading={!chartsData}>
            {chartsData && <Line data={chartsData.monthlyTrips} options={chartOptions} />}
          </ChartCard>
        </div>
        <div>
          <ChartCard title="Expenses Grouped by Category" subtitle="Monthly transaction aggregates" isLoading={!chartsData}>
            {chartsData && <Bar data={chartsData.expensesData} options={chartOptions} />}
          </ChartCard>
        </div>
      </div>

      {/* 5. Chart Grid Row 2: Status distribution charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ChartCard title="Vehicle Status Share" subtitle="Active status distributions" height="h-56" isLoading={!chartsData}>
          {chartsData && <Doughnut data={chartsData.vehicleStatus} options={doughnutOptions} />}
        </ChartCard>
        <ChartCard title="Trip Dispatches Share" subtitle="Trips records status distributions" height="h-56" isLoading={!chartsData}>
          {chartsData && <Pie data={chartsData.tripStatus} options={doughnutOptions} />}
        </ChartCard>
        <ChartCard title="Driver Availabilities Share" subtitle="Drivers registry active distributions" height="h-56" isLoading={!chartsData}>
          {chartsData && <Doughnut data={chartsData.driverStatus} options={doughnutOptions} />}
        </ChartCard>
      </div>

      {/* 6. Chart Grid Row 3: Fuel, Maintenance trends & Area utilization */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ChartCard title="Weekly Fuel consumption (L)" subtitle="Refuel volumes across days" height="h-56" isLoading={!chartsData}>
          {chartsData && <Bar data={chartsData.fuelData} options={chartOptions} />}
        </ChartCard>
        <ChartCard title="Maintenance Trends" subtitle="Completed vs Scheduled repairs count" height="h-56" isLoading={!chartsData}>
          {chartsData && <Line data={chartsData.maintenanceTrends} options={chartOptions} />}
        </ChartCard>
        <ChartCard title="Weekly Fleet Utilization (%)" subtitle="Utilization ratios across days" height="h-56" isLoading={!chartsData}>
          {chartsData && <Line data={chartsData.fleetUtilization} options={chartOptions} />}
        </ChartCard>
      </div>

      {/* 7. Operational Logs grid row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Interactive Trips Table DataTable */}
        <div className="lg:col-span-2 space-y-4">
          <Card title="Recent Dispatch Trips" subtitle="Interactive DataTable of ongoing and past deliveries">
            <DataTable
              columns={tripColumns}
              data={tripsList}
              isLoading={isLoading}
              searchPlaceholder="Filter trip codes, drivers or cargo weight..."
              expandableRowRender={renderExpandableRow}
              bulkActions={renderBulkActions}
            />
          </Card>
        </div>

        {/* Right: Smart Insights & Feed boards */}
        <div className="space-y-6">
          {/* Smart AI Insights */}
          <Card title="Smart AI Insights" subtitle="Generated from operations databases" className="border-info/30 bg-info/5">
            <div className="space-y-3.5">
              {insights.map((ins, index) => (
                <div key={index} className="flex gap-2.5 items-start text-xs font-semibold text-text-main leading-relaxed">
                  <Sparkles size={14} className="text-info mt-0.5 flex-shrink-0" />
                  <span>{ins}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Upcoming System Warnings */}
          <Card title="Upcoming Alerts" subtitle="Urgent compliance warnings" className="border-danger/30 bg-danger/5">
            <div className="space-y-3">
              <div className="flex gap-3 items-center text-xs font-semibold text-danger">
                <AlertTriangle size={15} />
                <span>Driver Sarah Jenkins license expires in 3 days.</span>
              </div>
              <div className="flex gap-3 items-center text-xs font-semibold text-danger">
                <AlertTriangle size={15} />
                <span>Asset V018 scheduled service is overdue.</span>
              </div>
              <div className="flex gap-3 items-center text-xs font-semibold text-text-main">
                <Clock size={15} className="text-warning" />
                <span>8 scheduled dispatch trips await assignment.</span>
              </div>
              <div className="flex gap-3 items-center text-xs font-semibold text-text-main">
                <DollarSign size={15} className="text-warning" />
                <span>Maintenance invoice #845 exceeds $1,500.</span>
              </div>
            </div>
          </Card>

          {/* Real-time Notifications timeline */}
          <Card title="Operational Notifications" subtitle="Real-time status changes">
            {notificationsList.length === 0 ? (
              <NoData message="No active notifications" />
            ) : (
              <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                {notificationsList.map(notif => (
                  <div key={notif.id} className="flex gap-3 items-start border-b border-border/40 pb-2.5 last:border-0 last:pb-0">
                    <span className="h-1.5 w-1.5 bg-info rounded-full mt-1.5 flex-shrink-0" />
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-text-main">{notif.title}</p>
                      <span className="text-[10px] text-text-secondary uppercase tracking-wider font-semibold">{notif.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Audit trail activity timeline */}
          <Card title="Audit Activity Trail" subtitle="Recent fleet manager logs">
            {activitiesList.length === 0 ? (
              <NoData message="No activity logs registered" />
            ) : (
              <div className="max-h-72 overflow-y-auto pr-1">
                <Timeline
                  items={activitiesList.map(act => ({
                    title: `${act.action} by ${act.user}`,
                    description: act.description,
                    date: act.date
                  }))}
                />
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* 8. Recent Maintenance and Fuel logs Cards list */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Maintenance logs cards */}
        <Card title="Recent Maintenance Actions" subtitle="Recent service and diagnostic logs">
          {maintenanceList.length === 0 ? (
            <NoData message="No maintenance history" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {maintenanceList.map((maint) => (
                <div key={maint.id} className="p-4 bg-hover/20 border border-border/80 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-info">{maint.vehicleId}</span>
                    <Badge status={maint.status} />
                  </div>
                  <div className="space-y-1">
                    <h5 className="text-xs font-bold text-text-main truncate">{maint.description}</h5>
                    <p className="text-[10px] text-text-secondary uppercase tracking-wider font-semibold">Mechanic: {maint.mechanic}</p>
                  </div>
                  <div className="h-px bg-border/40" />
                  <div className="flex items-center justify-between text-[10.5px] font-semibold text-text-secondary">
                    <span>Priority: <span className={maint.priority === 'High' ? 'text-danger font-bold' : 'text-text-main'}>{maint.priority}</span></span>
                    <span>Cost: <span className="text-text-main font-bold">${maint.cost}</span></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Fuel refill logs cards */}
        <Card title="Recent Fuel Loggings" subtitle="Recent refueling transactions details">
          {fuelList.length === 0 ? (
            <NoData message="No refuel logs registered" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fuelList.map((fLog) => (
                <div key={fLog.id} className="p-4 bg-hover/20 border border-border/80 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-info">{fLog.vehicleId}</span>
                    <span className="text-[10px] text-text-secondary uppercase tracking-wider font-semibold">{fLog.date}</span>
                  </div>
                  <div className="space-y-1">
                    <h5 className="text-xs font-bold text-text-main truncate">Refuel at {fLog.stationName}</h5>
                    <p className="text-[10px] text-text-secondary uppercase tracking-wider font-semibold">Receipt: {fLog.receiptNumber}</p>
                  </div>
                  <div className="h-px bg-border/40" />
                  <div className="flex items-center justify-between text-[10.5px] font-semibold text-text-secondary">
                    <span>Liters: <span className="text-text-main font-bold">{fLog.quantity}L</span></span>
                    <span>Cost: <span className="text-success font-bold">${fLog.cost}</span></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </PageContainer>
  );
};

export default Dashboard;
