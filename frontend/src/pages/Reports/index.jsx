import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  FileText,
  FileSpreadsheet,
  Download,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  Truck,
  Users,
  Wrench,
  Fuel,
  DollarSign
} from 'lucide-react';
import PageContainer from '../../components/ui/PageContainer';
import Button from '../../components/ui/Button';
import { vehicleService } from '../../services/vehicleService';
import { driverService } from '../../services/driverService';
import { tripService } from '../../services/tripService';
import { maintenanceService } from '../../services/maintenanceService';
import { fuelService } from '../../services/fuelService';
import { expenseService } from '../../services/expenseService';
import { showToast } from '../../components/ui/Toast';

const Reports = () => {
  const [activeReport, setActiveReport] = useState('fleet'); // fleet | trips | fuel | maintenance | expenses
  const [loading, setLoading] = useState(false);
  const [dataSummary, setDataSummary] = useState({
    vehiclesCount: 0,
    driversCount: 0,
    tripsCount: 0,
    maintCount: 0,
    fuelCost: 0,
    expenseCost: 0
  });

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    setLoading(true);
    try {
      const [v, d, t, m, f, e] = await Promise.all([
        vehicleService.getAll().catch(() => []),
        driverService.getAll().catch(() => []),
        tripService.getAll().catch(() => []),
        maintenanceService.getAll().catch(() => []),
        fuelService.getAll().catch(() => []),
        expenseService.getAll().catch(() => [])
      ]);

      const fuelCostSum = f.reduce((s, x) => s + (Number(x.cost) || 0), 0);
      const expenseCostSum = e.filter(x => x.status === 'Approved').reduce((s, x) => s + (Number(x.amount) || 0), 0);

      setDataSummary({
        vehiclesCount: v.length,
        driversCount: d.length,
        tripsCount: t.length,
        maintCount: m.length,
        fuelCost: Math.round(fuelCostSum),
        expenseCost: Math.round(expenseCostSum)
      });
    } catch {
      console.error('Failed to load metrics summary for reports');
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerCSV = async () => {
    setLoading(true);
    try {
      let headers = [];
      let rows = [];
      let filename = '';

      if (activeReport === 'fleet') {
        const vList = await vehicleService.getAll();
        headers = ['ID', 'Plate Number', 'Make', 'Model', 'Year', 'Type', 'Status', 'Odometer'];
        rows = vList.map(v => [v.id, v.plateNumber, v.make, v.model, v.year, v.type, v.status, v.odometer]);
        filename = 'Fleet_Inventory_Report.csv';
      } else if (activeReport === 'trips') {
        const tList = await tripService.getAll();
        headers = ['Trip ID', 'Trip Number', 'Vehicle ID', 'Driver ID', 'Origin', 'Destination', 'Status', 'Distance (km)'];
        rows = tList.map(t => [t.id, t.tripNumber, t.vehicleId, t.driverId, t.origin, t.destination, t.status, t.distance]);
        filename = 'Trips_Dispatch_Report.csv';
      } else if (activeReport === 'fuel') {
        const fList = await fuelService.getAll();
        headers = ['Log ID', 'Receipt', 'Vehicle ID', 'Driver ID', 'Date', 'Quantity (L)', 'Cost ($)', 'Station'];
        rows = fList.map(f => [f.id, f.receiptNumber, f.vehicleId, f.driverId, f.date, f.quantity, f.cost, f.stationName]);
        filename = 'Fuel_Efficiency_Report.csv';
      } else if (activeReport === 'maintenance') {
        const mList = await maintenanceService.getAll();
        headers = ['Order ID', 'Vehicle ID', 'Category', 'Priority', 'Cost ($)', 'Status', 'Date', 'Workshop'];
        rows = mList.map(m => [m.id, m.vehicleId, m.type, m.priority, m.cost, m.status, m.date, m.mechanic]);
        filename = 'Maintenance_Service_Report.csv';
      } else if (activeReport === 'expenses') {
        const eList = (await expenseService.getAll()).filter(e => e.status !== 'Rejected');
        headers = ['ID', 'Vehicle ID', 'Category', 'Amount ($)', 'Date', 'Merchant', 'Status'];
        rows = eList.map(e => [e.id, e.vehicleId, e.category, e.amount, e.date, e.merchant, e.status]);
        filename = 'Expense_Ledger_Report.csv';
      }

      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast.success(`Successfully exported ${filename}`);
    } catch {
      showToast.error('Report compilation failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintPDF = () => {
    showToast.info('Preparing PDF document layout...');
    setTimeout(() => {
      window.print();
    }, 800);
  };

  return (
    <PageContainer>
      <div className="space-y-6 select-none text-left print:bg-white print:text-black">
        
        {/* Navigation Sidebar & Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 print:block">
          
          {/* Menu Sidebar */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-2 h-fit md:col-span-1 print:hidden">
            <h4 className="text-[10px] font-black text-text-secondary uppercase tracking-widest px-2 mb-3">Report Category</h4>
            
            <button
              onClick={() => setActiveReport('fleet')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-colors ${
                activeReport === 'fleet' ? 'bg-info/10 text-info' : 'text-text-secondary hover:text-text-main hover:bg-hover'
              }`}
            >
              <div className="flex items-center gap-2">
                <Truck size={15} />
                <span>Fleet Asset Registry</span>
              </div>
              <ArrowRight size={12} />
            </button>

            <button
              onClick={() => setActiveReport('trips')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-colors ${
                activeReport === 'trips' ? 'bg-info/10 text-info' : 'text-text-secondary hover:text-text-main hover:bg-hover'
              }`}
            >
              <div className="flex items-center gap-2">
                <Layers size={15} />
                <span>Trips & Dispatch</span>
              </div>
              <ArrowRight size={12} />
            </button>

            <button
              onClick={() => setActiveReport('fuel')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-colors ${
                activeReport === 'fuel' ? 'bg-info/10 text-info' : 'text-text-secondary hover:text-text-main hover:bg-hover'
              }`}
            >
              <div className="flex items-center gap-2">
                <Fuel size={15} />
                <span>FuelLedger Logs</span>
              </div>
              <ArrowRight size={12} />
            </button>

            <button
              onClick={() => setActiveReport('maintenance')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-colors ${
                activeReport === 'maintenance' ? 'bg-info/10 text-info' : 'text-text-secondary hover:text-text-main hover:bg-hover'
              }`}
            >
              <div className="flex items-center gap-2">
                <Wrench size={15} />
                <span>Servicing & Maintenance</span>
              </div>
              <ArrowRight size={12} />
            </button>

            <button
              onClick={() => setActiveReport('expenses')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-colors ${
                activeReport === 'expenses' ? 'bg-info/10 text-info' : 'text-text-secondary hover:text-text-main hover:bg-hover'
              }`}
            >
              <div className="flex items-center gap-2">
                <DollarSign size={15} />
                <span>Expense Statements</span>
              </div>
              <ArrowRight size={12} />
            </button>
          </div>

          {/* Details Content Board */}
          <div className="md:col-span-3 bg-card border border-border rounded-xl p-5 md:p-6 space-y-6 flex flex-col justify-between print:border-none print:p-0">
            
            {/* Header Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border-b border-border/80 pb-4 print:hidden">
              <div>
                <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest block">Executive Declarations</span>
                <h3 className="text-base font-black text-text-main uppercase mt-0.5">
                  {activeReport === 'fleet' && 'Fleet Asset Utilization'}
                  {activeReport === 'trips' && 'Dispatch Delivery Metrics'}
                  {activeReport === 'fuel' && 'Refill Cards and Efficiency Analysis'}
                  {activeReport === 'maintenance' && 'Servicing Audit Report'}
                  {activeReport === 'expenses' && 'Financial Spend and ROI Report'}
                </h3>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={handleTriggerCSV} disabled={loading}>
                  <FileSpreadsheet size={14} className="mr-1.5" /> CSV Sheet
                </Button>
                <Button variant="info" size="sm" onClick={handlePrintPDF}>
                  <FileText size={14} className="mr-1.5" /> Export PDF / Print
                </Button>
              </div>
            </div>

            {/* Print Header */}
            <div className="hidden print:block border-b-2 border-black pb-4 mb-6">
              <h2 className="text-2xl font-black">TRANSITOPS ERP STATEMENTS</h2>
              <p className="text-xs font-bold">Hackathon Prototype Print Ledger | Date: {new Date().toLocaleString()}</p>
            </div>

            {/* Dynamic Charts/Metrics Preview Area */}
            <div className="space-y-6 flex-1">
              
              {/* Report Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="border border-border/50 bg-hover/5 rounded-lg p-3">
                  <span className="block text-[9px] uppercase font-bold text-text-secondary">Registered Assets</span>
                  <span className="text-base font-black text-text-main block mt-0.5">{dataSummary.vehiclesCount} Commercial Carriers</span>
                </div>
                <div className="border border-border/50 bg-hover/5 rounded-lg p-3">
                  <span className="block text-[9px] uppercase font-bold text-text-secondary">Assigned Operators</span>
                  <span className="text-base font-black text-text-main block mt-0.5">{dataSummary.driversCount} Drivers</span>
                </div>
                <div className="border border-border/50 bg-hover/5 rounded-lg p-3">
                  <span className="block text-[9px] uppercase font-bold text-text-secondary">Completed Dispatches</span>
                  <span className="text-base font-black text-text-main block mt-0.5">{dataSummary.tripsCount} Active Routes</span>
                </div>
              </div>

              {/* Graphical Presentation Simulator */}
              <div className="bg-hover/10 rounded-xl p-5 border border-border/80 space-y-4">
                <h5 className="text-[10px] font-black text-text-secondary uppercase tracking-wider flex items-center gap-2">
                  <BarChart3 size={14} className="text-info" /> Operations Trend Distribution (Last 6 Months)
                </h5>

                {/* Mock Bar Chart using CSS */}
                <div className="h-44 flex items-end justify-between gap-4 pt-4 border-b border-border/60">
                  {[
                    { month: 'Jan', val: 40 },
                    { month: 'Feb', val: 55 },
                    { month: 'Mar', val: 75 },
                    { month: 'Apr', val: 60 },
                    { month: 'May', val: 90 },
                    { month: 'Jun', val: 120 }
                  ].map(item => (
                    <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-info/10 rounded-t group relative cursor-pointer" style={{ height: `${item.val * 1.1}px` }}>
                        <div className="bg-info rounded-t absolute inset-x-0 bottom-0 h-2/3 group-hover:h-full transition-all" />
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-card border border-border px-1 rounded text-[9px] font-bold text-text-main opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {item.val} items
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-text-secondary">{item.month}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Lists Preview Summary */}
              <div className="space-y-3">
                <h5 className="text-[10px] font-black text-text-main uppercase tracking-wider">Report Details Preview</h5>
                <div className="border border-border/80 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-hover/20 border-b border-border">
                        <th className="p-3 text-[10px] font-black uppercase text-text-secondary">Summary Label</th>
                        <th className="p-3 text-[10px] font-black uppercase text-text-secondary text-right">Value Mapping</th>
                      </tr>
                    </thead>
                    <tbody className="text-text-main">
                      {activeReport === 'fleet' && (
                        <>
                          <tr className="border-b border-border/50">
                            <td className="p-3 font-semibold">Total Odoo Fleet size</td>
                            <td className="p-3 text-right font-bold">{dataSummary.vehiclesCount} vehicles</td>
                          </tr>
                          <tr className="border-b border-border/50">
                            <td className="p-3 font-semibold">Under maintenance status</td>
                            <td className="p-3 text-right font-bold">{dataSummary.maintCount} vehicles</td>
                          </tr>
                        </>
                      )}
                      {activeReport === 'trips' && (
                        <>
                          <tr className="border-b border-border/50">
                            <td className="p-3 font-semibold">Completed routes count</td>
                            <td className="p-3 text-right font-bold">{dataSummary.tripsCount} routes</td>
                          </tr>
                          <tr className="border-b border-border/50">
                            <td className="p-3 font-semibold">Total estimated driver ratings</td>
                            <td className="p-3 text-right font-bold">4.8 / 5.0 Rating</td>
                          </tr>
                        </>
                      )}
                      {activeReport === 'fuel' && (
                        <>
                          <tr className="border-b border-border/50">
                            <td className="p-3 font-semibold">Fuel cost logged to date</td>
                            <td className="p-3 text-right font-bold text-success">${dataSummary.fuelCost.toLocaleString()} USD</td>
                          </tr>
                          <tr className="border-b border-border/50">
                            <td className="p-3 font-semibold">Avg. fleet refuel quantity</td>
                            <td className="p-3 text-right font-bold">110 Liters / refill</td>
                          </tr>
                        </>
                      )}
                      {activeReport === 'maintenance' && (
                        <>
                          <tr className="border-b border-border/50">
                            <td className="p-3 font-semibold">Servicing cost logged</td>
                            <td className="p-3 text-right font-bold">${dataSummary.expenseCost.toLocaleString()} USD</td>
                          </tr>
                          <tr className="border-b border-border/50">
                            <td className="p-3 font-semibold">Preventive servicing efficiency</td>
                            <td className="p-3 text-right font-bold">96.8% Up-time</td>
                          </tr>
                        </>
                      )}
                      {activeReport === 'expenses' && (
                        <>
                          <tr className="border-b border-border/50">
                            <td className="p-3 font-semibold">Total Approved spend</td>
                            <td className="p-3 text-right font-bold text-success">${dataSummary.expenseCost.toLocaleString()} USD</td>
                          </tr>
                          <tr className="border-b border-border/50">
                            <td className="p-3 font-semibold">Pending invoice cards</td>
                            <td className="p-3 text-right font-bold text-warning">${dataSummary.fuelCost.toLocaleString()} USD</td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </PageContainer>
  );
};

export default Reports;
