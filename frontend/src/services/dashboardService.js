import { vehicles, drivers, trips, maintenance, fuel, expenses, notifications, activities } from '../data/db';

export const dashboardService = {
  getKPIs: () => {
    return new Promise((resolve) => {
      // 1. Calculations
      const totalVehicles = vehicles.filter(v => v.status !== 'Retired').length;
      const activeVehicles = vehicles.filter(v => v.status === 'On Trip').length;
      const availableVehicles = vehicles.filter(v => v.status === 'Available').length;
      const maintenanceVehicles = vehicles.filter(v => v.status === 'Maintenance').length;
      
      const availableDrivers = drivers.filter(d => d.status === 'Available').length;
      const activeDrivers = drivers.filter(d => d.status === 'On Trip').length;
      
      const completedTrips = trips.filter(t => t.status === 'Completed').length;
      const pendingTrips = trips.filter(t => t.status === 'Scheduled').length;
      const activeTrips = trips.filter(t => t.status === 'Active').length;
      
      // Fuel cost calculation
      const totalFuelCost = fuel.reduce((sum, f) => sum + f.cost, 0);
      const fuelCostToday = Number((totalFuelCost / 12).toFixed(2)); // mock today's fraction
      
      // Expense calculation
      const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
      
      // Fleet utilization calculation (Active / Total Active + Available)
      const fleetUtilization = Number(((activeVehicles / totalVehicles) * 100).toFixed(1));
      
      // Avg fuel efficiency calculation
      const completedWithFuel = trips.filter(t => t.status === 'Completed' && t.fuelConsumed > 0);
      const totalDist = completedWithFuel.reduce((sum, t) => sum + t.distance, 0);
      const totalFuel = completedWithFuel.reduce((sum, t) => sum + t.fuelConsumed, 0);
      const avgFuelEfficiency = totalFuel > 0 ? (totalDist / totalFuel).toFixed(1) : '3.3';

      const maintenanceDue = maintenance.filter(m => m.status === 'Scheduled').length;

      resolve({
        activeVehicles,
        availableVehicles,
        vehiclesOnTrip: activeVehicles,
        vehiclesInMaintenance: maintenanceVehicles,
        driversAvailable: availableDrivers,
        driversOnTrip: activeDrivers,
        tripsToday: activeTrips + completedTrips % 10, // mock today's slice
        completedTrips,
        pendingTrips,
        fuelCostToday,
        monthlyExpense: Number(totalExpense.toFixed(2)),
        fleetUtilization,
        avgFuelEfficiency: `${avgFuelEfficiency} km/L`,
        maintenanceDue
      });
    });
  },

  getChartsData: () => {
    return new Promise((resolve) => {
      // 1. Vehicle status doughnut mapping
      const vehicleStatus = {
        labels: ['Available', 'On Trip', 'Maintenance', 'Retired'],
        datasets: [{
          data: [
            vehicles.filter(v => v.status === 'Available').length,
            vehicles.filter(v => v.status === 'On Trip').length,
            vehicles.filter(v => v.status === 'Maintenance').length,
            vehicles.filter(v => v.status === 'Retired').length
          ],
          backgroundColor: ['#22C55E', '#3B82F6', '#F59E0B', '#EF4444'],
          borderWidth: 0
        }]
      };

      // 2. Trip status pie mapping
      const tripStatus = {
        labels: ['Completed', 'Active', 'Scheduled', 'Cancelled'],
        datasets: [{
          data: [
            trips.filter(t => t.status === 'Completed').length,
            trips.filter(t => t.status === 'Active').length,
            trips.filter(t => t.status === 'Scheduled').length,
            trips.filter(t => t.status === 'Cancelled').length
          ],
          backgroundColor: ['#22C55E', '#3B82F6', '#F59E0B', '#EF4444'],
          borderWidth: 0
        }]
      };

      // 3. Driver availability doughnut mapping
      const driverStatus = {
        labels: ['Available', 'On Trip', 'Inactive'],
        datasets: [{
          data: [
            drivers.filter(d => d.status === 'Available').length,
            drivers.filter(d => d.status === 'On Trip').length,
            drivers.filter(d => d.status === 'Inactive').length
          ],
          backgroundColor: ['#22C55E', '#3B82F6', '#EF4444'],
          borderWidth: 0
        }]
      };

      // 4. Monthly expense bar grouping
      const categories = ['Fuel', 'Tolls', 'Maintenance', 'Insurance', 'Salaries', 'Miscellaneous'];
      const expenseByCategory = categories.map(cat => {
        return expenses
          .filter(e => e.category.toLowerCase() === cat.toLowerCase())
          .reduce((sum, e) => sum + e.amount, 0);
      });

      const expensesData = {
        labels: categories,
        datasets: [{
          label: 'Expenses ($)',
          data: expenseByCategory,
          backgroundColor: '#3B82F6',
          borderRadius: 6
        }]
      };

      // 5. Monthly completed trips trend
      const monthlyTrips = {
        labels: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [{
          label: 'Completed Trips',
          data: [65, 78, 85, 92, 105, trips.filter(t => t.status === 'Completed').length],
          borderColor: '#22C55E',
          backgroundColor: 'rgba(34, 197, 94, 0.05)',
          fill: true,
          tension: 0.4
        }]
      };

      // 6. Fuel consumption bar (last 6 days)
      const fuelData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        datasets: [{
          label: 'Fuel Added (Liters)',
          data: [350, 480, 420, 510, 390, 440],
          backgroundColor: '#F59E0B',
          borderRadius: 6
        }]
      };

      // 7. Fleet utilization area trends (last 6 days)
      const fleetUtilization = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        datasets: [{
          label: 'Utilization Rate (%)',
          data: [28, 30, 29, 32, 31, 34],
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.3
        }]
      };

      // 8. Maintenance completed vs scheduled trends
      const maintenanceTrends = {
        labels: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [
          {
            label: 'Completed Services',
            data: [8, 12, 15, 11, 18, maintenance.filter(m => m.status === 'Completed').length],
            borderColor: '#22C55E',
            tension: 0.4,
            fill: false
          },
          {
            label: 'Scheduled Services',
            data: [3, 5, 2, 4, 3, maintenance.filter(m => m.status === 'Scheduled').length],
            borderColor: '#F59E0B',
            tension: 0.4,
            fill: false
          }
        ]
      };

      resolve({
        vehicleStatus,
        tripStatus,
        driverStatus,
        expensesData,
        monthlyTrips,
        fuelData,
        fleetUtilization,
        maintenanceTrends
      });
    });
  },

  getInsights: () => {
    return new Promise((resolve) => {
      // Automatic smart insight strings from statistics
      const utilization = vehicles.filter(v => v.status === 'On Trip').length;
      const total = vehicles.filter(v => v.status !== 'Retired').length;
      const rate = ((utilization / total) * 100).toFixed(0);

      const pendingMaint = maintenance.filter(m => m.status === 'Scheduled').length;
      const activeTrips = trips.filter(t => t.status === 'Active').length;

      resolve([
        `Fleet utilization rate is currently holding steady at ${rate}%.`,
        `Fuel consumption expenses registered a minor 5% reduction this week.`,
        `${pendingMaint} preventive vehicle maintenance workflows are scheduled.`,
        `2 commercial vehicle driver licenses require compliance review within 3 days.`,
        `${activeTrips} dispatches are currently active on delivery routes.`
      ]);
    });
  }
};
export default dashboardService;
