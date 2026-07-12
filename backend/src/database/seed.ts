import mongoose from "mongoose";
import { UserModel } from "../modules/users/model";
import { VehicleModel } from "../modules/vehicles/model";
import { DriverModel } from "../modules/drivers/model";
import { TripModel } from "../modules/trips/model";
import { MaintenanceModel } from "../modules/maintenance/model";
import { FuelLogModel } from "../modules/fuel/model";
import { ExpenseModel } from "../modules/expenses/model";
import { NotificationModel } from "../modules/notifications/model";
import { ActivityModel } from "../modules/activities/model";
import { env } from "../config/env";

const VEHICLE_MAKES = [
  { make: 'Volvo', models: ['FH16 Heavy', 'VNL 860', 'FE Box Truck'] },
  { make: 'Mercedes-Benz', models: ['Actros 2646', 'Atego 1218', 'Sprinter Cargo'] },
  { make: 'Scania', models: ['R500 Streamline', 'P320 Box', 'G450 Heavy'] },
  { make: 'Isuzu', models: ['NPR Medium', 'FTR Heavy', 'NQR Flatbed'] },
  { make: 'Ford', models: ['F-550 Super Duty', 'F-750 Cargo', 'Transit 350'] }
];

const DRIVER_NAMES = [
  "Alexander Pierce", "Sarah Jenkins", "Marcus Aurelius", "David Kross", "Elena Rostova",
  "James Smith", "Patricia Jones", "Robert Johnson", "Michael Brown", "Elizabeth Davis",
  "William Miller", "Linda Wilson", "David Moore", "Barbara Taylor", "Richard Thomas",
  "Susan Anderson", "Joseph Jackson", "Jessica White", "Thomas Harris", "Sarah Martin",
  "Charles Thompson", "Karen Garcia", "Christopher Martinez", "Nancy Robinson", "Daniel Clark",
  "Lisa Rodriguez", "Matthew Lewis", "Betty Lee", "Anthony Walker", "Sandra Hall",
  "Mark Allen", "Ashley Young", "Donald Hernandez", "Dorothy King", "Steven Wright",
  "Kimberly Lopez", "Andrew Hill", "Donna Scott", "Joshua Green", "Emily Adams"
];

const CITIES = [
  "Houston, TX", "Dallas, TX", "Austin, TX", "San Antonio, TX", "Los Angeles, CA",
  "San Francisco, CA", "San Diego, CA", "Seattle, WA", "Denver, CO", "Chicago, IL",
  "New York, NY", "Boston, MA", "Miami, FL", "Orlando, FL", "Atlanta, GA",
  "Phoenix, AZ", "Las Vegas, NV", "Detroit, MI", "Charlotte, NC", "Philadelphia, PA"
];

const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomRange = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export async function seedLargeDatabase() {
  const orgId = new mongoose.Types.ObjectId("60c72b2f9b1d8b3a7c8c8c8c");
  const userId = new mongoose.Types.ObjectId("60c72b2f9b1d8b3a7c8c8c8d");

  console.log("Starting full database seeding...");

  // 1. CLEAR COLLECTIONS
  await UserModel.deleteMany({});
  await VehicleModel.deleteMany({});
  await DriverModel.deleteMany({});
  await TripModel.deleteMany({});
  await MaintenanceModel.deleteMany({});
  await FuelLogModel.deleteMany({});
  await ExpenseModel.deleteMany({});
  await NotificationModel.deleteMany({});
  await ActivityModel.deleteMany({});

  console.log("Database cleared.");

  // 2. SEED DEFAULT USER
  await new UserModel({
    _id: userId,
    email: "manager@transitops.com",
    password_hash: "$2b$10$EpRkB1B0p37kQc1pMepZle3G2xYk/r8nJ9pQ/6x739a8U", // password: password
    name: "Alex Johnson",
    roles: ["Fleet Manager"],
    organization_id: orgId
  }).save();
  console.log("Default User seeded.");

  // 3. SEED VEHICLES (50 items)
  const vehiclesList = [];
  for (let i = 1; i <= 50; i++) {
    const brand = randomItem(VEHICLE_MAKES);
    const model = randomItem(brand.models);
    const year = randomRange(2018, 2024);
    const id = `V${String(i).padStart(3, '0')}`;
    
    let status = 'Available';
    if (i <= 15) status = 'On Trip';
    else if (i <= 20) status = 'Maintenance';
    else if (i === 49 || i === 50) status = 'Retired';

    vehiclesList.push({
      id,
      plateNumber: `TX-${randomRange(100, 999)}-${String.fromCharCode(65 + randomRange(0, 25))}${String.fromCharCode(65 + randomRange(0, 25))}`,
      make: brand.make,
      model,
      year,
      type: model.includes('Heavy') || model.includes('Actros') ? 'Heavy Truck' : model.includes('Box') ? 'Box Truck' : 'Light Cargo',
      status,
      fuelType: i % 10 === 0 ? 'Gasoline' : 'Diesel',
      odometer: randomRange(40000, 250000),
      registrationExpiry: `2026-${String(randomRange(1, 12)).padStart(2, '0')}-${String(randomRange(1, 28)).padStart(2, '0')}`,
      lastServiceDate: `2026-${String(randomRange(1, 5)).padStart(2, '0')}-${String(randomRange(1, 28)).padStart(2, '0')}`,
      carrierCap: model.includes('Heavy') || model.includes('Actros') ? '24 Tons' : '8 Tons',
      organization_id: orgId,
      total_fuel_cost: 0,
      total_maintenance_cost: 0,
      total_revenue: 0,
      total_distance_traveled: 0,
      total_fuel_consumed_liters: 0
    });
  }
  await VehicleModel.insertMany(vehiclesList);
  console.log("50 Vehicles seeded.");

  // 4. SEED DRIVERS (40 items)
  const driversList = [];
  for (let i = 1; i <= 40; i++) {
    const id = `D${String(i).padStart(3, '0')}`;
    const name = DRIVER_NAMES[i - 1];
    
    let status = 'Available';
    if (i <= 15) status = 'On Trip';
    else if (i >= 36) status = 'Inactive';

    driversList.push({
      id,
      name,
      email: `${name.toLowerCase().replace(/\s/g, '.')}@transitops.com`,
      phone: `+1 (555) ${randomRange(200, 999)}-${randomRange(1000, 9999)}`,
      licenseNumber: `DL-${String.fromCharCode(65 + randomRange(0, 25))}${String.fromCharCode(65 + randomRange(0, 25))}${randomRange(100000, 999999)}`,
      status,
      ratings: Number((randomRange(42, 50) / 10).toFixed(1)),
      hireDate: `${2020 + (i % 4)}-0${randomRange(1, 9)}-${String(randomRange(10, 28))}`,
      avatar: name.split(' ').map(n => n[0]).join('').toUpperCase(),
      organization_id: orgId
    });
  }
  await DriverModel.insertMany(driversList);
  console.log("40 Drivers seeded.");

  // 5. SEED TRIPS (120 items)
  const tripsList = [];
  
  // 15 Active Trips (linked to vehicles 1-15 and drivers 1-15)
  for (let i = 1; i <= 15; i++) {
    const origin = randomItem(CITIES);
    let dest = randomItem(CITIES);
    while (dest === origin) dest = randomItem(CITIES);

    tripsList.push({
      id: `T${String(i).padStart(3, '0')}`,
      tripNumber: `TRIP-2026-${String(i).padStart(3, '0')}`,
      vehicleId: `V${String(i).padStart(3, '0')}`,
      driverId: `D${String(i).padStart(3, '0')}`,
      origin,
      destination: dest,
      status: 'Active',
      startDate: new Date(Date.now() - randomRange(1, 10) * 3600000).toISOString(),
      endDate: null,
      distance: randomRange(250, 600),
      fuelConsumed: null,
      cargoWeight: `${randomRange(5, 20)} Tons`,
      organization_id: orgId
    });
  }

  // 95 Completed Trips
  for (let i = 16; i <= 110; i++) {
    const origin = randomItem(CITIES);
    let dest = randomItem(CITIES);
    while (dest === origin) dest = randomItem(CITIES);

    const dist = randomRange(150, 750);
    const fuel = Number((dist * (randomRange(25, 35) / 100)).toFixed(1));

    const startDay = randomRange(1, 11);
    const start = new Date(Date.now() - startDay * 86400000);
    const end = new Date(start.getTime() + randomRange(4, 12) * 3600000);

    tripsList.push({
      id: `T${String(i).padStart(3, '0')}`,
      tripNumber: `TRIP-2026-${String(i).padStart(3, '0')}`,
      vehicleId: `V${String(randomRange(16, 48)).padStart(3, '0')}`,
      driverId: `D${String(randomRange(16, 35)).padStart(3, '0')}`,
      origin,
      destination: dest,
      status: 'Completed',
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      distance: dist,
      fuelConsumed: fuel,
      cargoWeight: `${randomRange(2, 22)} Tons`,
      organization_id: orgId
    });
  }

  // 8 Scheduled Trips
  for (let i = 111; i <= 118; i++) {
    const origin = randomItem(CITIES);
    let dest = randomItem(CITIES);
    while (dest === origin) dest = randomItem(CITIES);

    tripsList.push({
      id: `T${String(i).padStart(3, '0')}`,
      tripNumber: `TRIP-2026-${String(i).padStart(3, '0')}`,
      vehicleId: `V${String(randomRange(21, 48)).padStart(3, '0')}`,
      driverId: `D${String(randomRange(16, 35)).padStart(3, '0')}`,
      origin,
      destination: dest,
      status: 'Scheduled',
      startDate: new Date(Date.now() + randomRange(12, 48) * 3600000).toISOString(),
      endDate: null,
      distance: randomRange(200, 500),
      fuelConsumed: null,
      cargoWeight: `${randomRange(5, 18)} Tons`,
      organization_id: orgId
    });
  }

  // 2 Cancelled Trips
  for (let i = 119; i <= 120; i++) {
    const origin = randomItem(CITIES);
    let dest = randomItem(CITIES);
    while (dest === origin) dest = randomItem(CITIES);

    tripsList.push({
      id: `T${String(i).padStart(3, '0')}`,
      tripNumber: `TRIP-2026-${String(i).padStart(3, '0')}`,
      vehicleId: `V${String(randomRange(21, 48)).padStart(3, '0')}`,
      driverId: `D${String(randomRange(16, 35)).padStart(3, '0')}`,
      origin,
      destination: dest,
      status: 'Cancelled',
      startDate: new Date(Date.now() - randomRange(2, 5) * 86400000).toISOString(),
      endDate: null,
      distance: randomRange(300, 600),
      fuelConsumed: null,
      cargoWeight: `${randomRange(5, 15)} Tons`,
      organization_id: orgId
    });
  }
  await TripModel.insertMany(tripsList);
  console.log("120 Trips seeded.");

  // 6. SEED MAINTENANCE LOGS (25 items)
  const maintenanceList = [];
  // 5 Active Maintenance Logs
  for (let i = 1; i <= 5; i++) {
    maintenanceList.push({
      id: `M${String(i).padStart(3, '0')}`,
      vehicleId: `V${String(15 + i).padStart(3, '0')}`,
      description: randomItem([
        'Engine Oil replacement & diagnostics',
        'Rear brake pad replacements',
        'Transmission gearbox calibration',
        'Air suspension system diagnostic test',
        'Steering axle alignment checking'
      ]),
      type: randomItem(['Preventive', 'Repair', 'Routine']),
      cost: randomRange(350, 1800),
      status: i % 2 === 0 ? 'In Progress' : 'Scheduled',
      date: `2026-07-${10 + i}`,
      notes: 'Checking hydraulic lines, replacing standard seal gaskets.',
      priority: i % 2 === 0 ? 'High' : 'Medium',
      mechanic: randomItem(['Frank Miller', 'Tomy Lee', 'Bruce Banner']),
      organization_id: orgId
    });
  }

  // 20 Completed Maintenance Logs
  for (let i = 6; i <= 25; i++) {
    maintenanceList.push({
      id: `M${String(i).padStart(3, '0')}`,
      vehicleId: `V${String(randomRange(1, 50)).padStart(3, '0')}`,
      description: randomItem([
        'Annual Safety Inspection',
        'Tire rotation & alignment',
        'Coolant fluid flush',
        'Brake disk resurfacing',
        'Electrical fuses overhaul'
      ]),
      type: randomItem(['Routine', 'Preventive', 'Repair']),
      cost: randomRange(100, 1200),
      status: 'Completed',
      date: `2026-06-${String(randomRange(1, 30)).padStart(2, '0')}`,
      notes: 'Service items completed. Asset safety checks passed.',
      priority: 'Low',
      mechanic: randomItem(['Frank Miller', 'Tomy Lee', 'Bruce Banner']),
      organization_id: orgId
    });
  }
  await MaintenanceModel.insertMany(maintenanceList);
  console.log("25 Maintenance logs seeded.");

  // 7. SEED FUEL LOGS (80 items)
  const fuelList = [];
  for (let i = 1; i <= 80; i++) {
    const qty = randomRange(80, 220);
    const price = (randomRange(16, 21) / 10);
    const cost = Number((qty * price).toFixed(2));
    fuelList.push({
      id: `F${String(i).padStart(3, '0')}`,
      vehicleId: `V${String(randomRange(1, 50)).padStart(3, '0')}`,
      driverId: `D${String(randomRange(1, 40)).padStart(3, '0')}`,
      date: `2026-07-${String(randomRange(1, 12)).padStart(2, '0')}`,
      quantity: qty,
      cost: cost,
      odometer: randomRange(50000, 200000),
      stationName: randomItem(['Shell Houston', 'Exxon Austin Route', 'Chevron LA Hub', 'Speedway Chicago']),
      receiptNumber: `RCPT-${randomRange(10000, 99999)}`,
      organization_id: orgId
    });
  }
  await FuelLogModel.insertMany(fuelList);
  console.log("80 Fuel logs seeded.");

  // 8. SEED EXPENSES GENERATOR (70 items)
  const expensesList = [];
  // Seed from Fuel Logs (20 fuel expenses)
  for (let i = 1; i <= 20; i++) {
    const fLog = fuelList[i - 1];
    expensesList.push({
      id: `E${String(i).padStart(3, '0')}`,
      category: 'Fuel',
      amount: fLog.cost,
      date: fLog.date,
      description: `Refuel at ${fLog.stationName}`,
      status: 'Approved',
      merchant: fLog.stationName,
      organization_id: orgId
    });
  }

  // Seed from Maintenance Logs (10 maintenance expenses)
  for (let i = 1; i <= 10; i++) {
    const mLog = maintenanceList[i - 1];
    expensesList.push({
      id: `E${String(20 + i).padStart(3, '0')}`,
      category: 'Maintenance',
      amount: mLog.cost,
      date: mLog.date,
      description: `Asset service: ${mLog.description}`,
      status: mLog.status === 'Completed' ? 'Approved' : 'Pending',
      merchant: 'Fleet Maintenance Services',
      organization_id: orgId
    });
  }

  // Generate remaining general expenses (Tolls, Salaries, Insurance)
  for (let i = 31; i <= 70; i++) {
    const cat = randomItem(['Tolls', 'Salaries', 'Insurance', 'Miscellaneous']);
    let amt = randomRange(15, 300);
    if (cat === 'Salaries') amt = randomRange(1200, 3000);
    if (cat === 'Insurance') amt = randomRange(450, 1500);

    expensesList.push({
      id: `E${String(i).padStart(3, '0')}`,
      category: cat,
      amount: amt,
      date: `2026-07-${String(randomRange(1, 12)).padStart(2, '0')}`,
      description: `${cat} payment for operations`,
      status: randomItem(['Approved', 'Approved', 'Pending']),
      merchant: cat === 'Tolls' ? 'State Tollway Agency' : cat === 'Insurance' ? 'SafeGuard Commercial' : 'TransitOps Operations',
      organization_id: orgId
    });
  }
  await ExpenseModel.insertMany(expensesList);
  console.log("70 Expenses seeded.");

  // 9. SEED NOTIFICATIONS (30 items)
  const notificationsList = [];
  const NOTIF_TYPES = ['vehicle', 'trip', 'fuel', 'maintenance', 'license', 'info'];
  for (let i = 1; i <= 30; i++) {
    const type = randomItem(NOTIF_TYPES);
    let title = '';
    switch (type) {
      case 'vehicle':
        title = `Vehicle V0${randomRange(10, 49)} status changed to On Trip.`;
        break;
      case 'trip':
        title = `Trip TRIP-2026-0${randomRange(10, 99)} has been completed successfully.`;
        break;
      case 'fuel':
        title = `New fuel logging registered for vehicle V0${randomRange(10, 49)}.`;
        break;
      case 'maintenance':
        title = `Preventive service scheduled for vehicle V0${randomRange(10, 49)}.`;
        break;
      case 'license':
        title = `Driver license expiry check warning for operator.`;
        break;
      default:
        title = `System database synchronization check completed.`;
    }
    notificationsList.push({
      id: `N${String(i).padStart(3, '0')}`,
      type,
      title,
      time: `${i} hours ago`,
      organization_id: orgId
    });
  }
  await NotificationModel.insertMany(notificationsList);
  console.log("30 Notifications seeded.");

  // 10. SEED ACTIVITIES (60 items)
  const activitiesList = [];
  const ACTIONS = ['Dispatched trip', 'Completed trip', 'Logged fuel', 'Scheduled service', 'Added driver', 'Registered asset'];
  for (let i = 1; i <= 60; i++) {
    const action = randomItem(ACTIONS);
    activitiesList.push({
      id: `A${String(i).padStart(3, '0')}`,
      action,
      user: 'Alex Johnson',
      description: `${action} parameters mapped to fleet registry.`,
      date: new Date(Date.now() - i * 7200000).toISOString(),
      organization_id: orgId
    });
  }
  await ActivityModel.insertMany(activitiesList);
  console.log("60 Activity logs seeded.");

  // 11. UPDATE VEHICLES DENORMALIZED COUNTERS based on Completed Trips / Fuel / Maintenance
  console.log("Updating denormalized vehicle operational counters...");
  const dbVehicles = await VehicleModel.find({ organization_id: orgId });
  for (const vehicle of dbVehicles) {
    const vId = vehicle.id;
    
    // Sum completed trips distance & revenue & fuel
    const completedTrips = await TripModel.find({ vehicleId: vId, status: "Completed" });
    const totalDist = completedTrips.reduce((sum, t) => sum + t.distance, 0);
    const totalRevenue = completedTrips.reduce((sum, t) => sum + t.distance * 2, 0); // mock revenue as distance * 2
    const totalFuelConsumed = completedTrips.reduce((sum, t) => sum + (t.fuelConsumed || 0), 0);

    // Sum fuel logs
    const fuelLogs = await FuelLogModel.find({ vehicleId: vId });
    const totalFuelCost = fuelLogs.reduce((sum, f) => sum + f.cost, 0);

    // Sum maintenance logs
    const maintenanceLogs = await MaintenanceModel.find({ vehicleId: vId, status: "Completed" });
    const totalMaintCost = maintenanceLogs.reduce((sum, m) => sum + m.cost, 0);

    await VehicleModel.updateOne(
      { _id: vehicle._id },
      {
        $set: {
          total_revenue: totalRevenue,
          total_distance_traveled: totalDist,
          total_fuel_consumed_liters: totalFuelConsumed,
          total_fuel_cost: totalFuelCost,
          total_maintenance_cost: totalMaintCost
        }
      }
    );
  }
  console.log("Seeding complete! The database has been populated with rich mock datasets.");
}
