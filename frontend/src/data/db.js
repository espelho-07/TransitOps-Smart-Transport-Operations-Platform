// Unified Mock Database for TransitOps
// Generates 50 vehicles, 40 drivers, 120 trips, 25 maintenance records, 80 fuel logs, 70 expenses, 30 notifications, and 60 activity logs.

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

// Helper to get random item
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// ==========================================
// 1. VEHICLES GENERATOR (50 items)
// ==========================================
const vehicles = [];
for (let i = 1; i <= 50; i++) {
  const brand = randomItem(VEHICLE_MAKES);
  const model = randomItem(brand.models);
  const year = randomRange(2018, 2024);
  const id = `V${String(i).padStart(3, '0')}`;
  
  // Status allocation: 28 Available, 15 On Trip, 5 Maintenance, 2 Retired
  let status = 'Available';
  if (i <= 15) status = 'On Trip';
  else if (i <= 20) status = 'Maintenance';
  else if (i === 49 || i === 50) status = 'Retired';

  vehicles.push({
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
    carrierCap: model.includes('Heavy') || model.includes('Actros') ? '24 Tons' : '8 Tons'
  });
}

// ==========================================
// 2. DRIVERS GENERATOR (40 items)
// ==========================================
const drivers = [];
for (let i = 1; i <= 40; i++) {
  const id = `D${String(i).padStart(3, '0')}`;
  const name = DRIVER_NAMES[i - 1];
  
  // Status allocation: 15 On Trip (matches vehicles 1-15), 20 Available, 5 Inactive
  let status = 'Available';
  if (i <= 15) status = 'On Trip';
  else if (i >= 36) status = 'Inactive';

  drivers.push({
    id,
    name,
    email: `${name.toLowerCase().replace(/\s/g, '.')}@transitops.com`,
    phone: `+1 (555) ${randomRange(200, 999)}-${randomRange(1000, 9999)}`,
    licenseNumber: `DL-${String.fromCharCode(65 + randomRange(0, 25))}${String.fromCharCode(65 + randomRange(0, 25))}${randomRange(100000, 999999)}`,
    status,
    ratings: (randomRange(42, 50) / 10).toFixed(1),
    hireDate: `${2020 + (i % 4)}-0${randomRange(1, 9)}-${String(randomRange(10, 28))}`,
    avatar: name.split(' ').map(n => n[0]).join('').toUpperCase()
  });
}

// ==========================================
// 3. TRIPS GENERATOR (120 items)
// ==========================================
const trips = [];

// 15 Active Trips (linked to vehicles 1-15 and drivers 1-15)
for (let i = 1; i <= 15; i++) {
  const origin = randomItem(CITIES);
  let dest = randomItem(CITIES);
  while (dest === origin) dest = randomItem(CITIES);

  trips.push({
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
    cargoWeight: `${randomRange(5, 20)} Tons`
  });
}

// 95 Completed Trips (linked to random vehicles and drivers)
for (let i = 16; i <= 110; i++) {
  const origin = randomItem(CITIES);
  let dest = randomItem(CITIES);
  while (dest === origin) dest = randomItem(CITIES);

  const dist = randomRange(150, 750);
  const fuel = (dist * (randomRange(25, 35) / 100)).toFixed(1);

  const startDay = randomRange(1, 11);
  const start = new Date(Date.now() - startDay * 86400000);
  const end = new Date(start.getTime() + randomRange(4, 12) * 3600000);

  trips.push({
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
    fuelConsumed: Number(fuel),
    cargoWeight: `${randomRange(2, 22)} Tons`
  });
}

// 8 Scheduled Trips
for (let i = 111; i <= 118; i++) {
  const origin = randomItem(CITIES);
  let dest = randomItem(CITIES);
  while (dest === origin) dest = randomItem(CITIES);

  trips.push({
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
    cargoWeight: `${randomRange(5, 18)} Tons`
  });
}

// 2 Cancelled Trips
for (let i = 119; i <= 120; i++) {
  const origin = randomItem(CITIES);
  let dest = randomItem(CITIES);
  while (dest === origin) dest = randomItem(CITIES);

  trips.push({
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
    cargoWeight: `${randomRange(5, 15)} Tons`
  });
}

// ==========================================
// 4. MAINTENANCE LOGS (25 items)
// ==========================================
const maintenance = [];

// 5 Active Maintenance Logs (linked to vehicles V016 - V020 marked 'Maintenance')
for (let i = 1; i <= 5; i++) {
  maintenance.push({
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
    mechanic: randomItem(['Frank Miller', 'Tomy Lee', 'Bruce Banner'])
  });
}

// 20 Completed Maintenance Logs
for (let i = 6; i <= 25; i++) {
  maintenance.push({
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
    mechanic: randomItem(['Frank Miller', 'Tomy Lee', 'Bruce Banner'])
  });
}

// ==========================================
// 5. FUEL LOGS (80 items)
// ==========================================
const fuel = [];
for (let i = 1; i <= 80; i++) {
  const qty = randomRange(80, 220);
  const price = (randomRange(16, 21) / 10); // $1.6 - $2.1 per liter
  const cost = Number((qty * price).toFixed(2));
  fuel.push({
    id: `F${String(i).padStart(3, '0')}`,
    vehicleId: `V${String(randomRange(1, 50)).padStart(3, '0')}`,
    driverId: `D${String(randomRange(1, 40)).padStart(3, '0')}`,
    date: `2026-07-${String(randomRange(1, 12)).padStart(2, '0')}`,
    quantity: qty,
    cost: cost,
    odometer: randomRange(50000, 200000),
    stationName: randomItem(['Shell Houston', 'Exxon Austin Route', 'Chevron LA Hub', 'Speedway Chicago']),
    receiptNumber: `RCPT-${randomRange(10000, 99999)}`
  });
}

// ==========================================
// 6. EXPENSES GENERATOR (70 items)
// ==========================================
const expenses = [];

// Seed from Fuel Logs (20 fuel expenses)
for (let i = 1; i <= 20; i++) {
  const fLog = fuel[i - 1];
  expenses.push({
    id: `E${String(i).padStart(3, '0')}`,
    category: 'Fuel',
    amount: fLog.cost,
    date: fLog.date,
    description: `Refuel at ${fLog.stationName}`,
    status: 'Approved',
    merchant: fLog.stationName
  });
}

// Seed from Maintenance Logs (10 maintenance expenses)
for (let i = 1; i <= 10; i++) {
  const mLog = maintenance[i - 1];
  expenses.push({
    id: `E${String(20 + i).padStart(3, '0')}`,
    category: 'Maintenance',
    amount: mLog.cost,
    date: mLog.date,
    description: `Asset service: ${mLog.description}`,
    status: mLog.status === 'Completed' ? 'Approved' : 'Pending',
    merchant: 'Fleet Maintenance Services'
  });
}

// Generate remaining general expenses (Tolls, Salaries, Insurance)
for (let i = 31; i <= 70; i++) {
  const cat = randomItem(['Tolls', 'Salaries', 'Insurance', 'Miscellaneous']);
  let amt = randomRange(15, 300);
  if (cat === 'Salaries') amt = randomRange(1200, 3000);
  if (cat === 'Insurance') amt = randomRange(450, 1500);

  expenses.push({
    id: `E${String(i).padStart(3, '0')}`,
    category: cat,
    amount: amt,
    date: `2026-07-${String(randomRange(1, 12)).padStart(2, '0')}`,
    description: `${cat} payment for operations`,
    status: randomItem(['Approved', 'Approved', 'Pending']),
    merchant: cat === 'Tolls' ? 'State Tollway Agency' : cat === 'Insurance' ? 'SafeGuard Commercial' : 'TransitOps Operations'
  });
}

// ==========================================
// 7. NOTIFICATIONS (30 items)
// ==========================================
const notifications = [];
for (let i = 1; i <= 30; i++) {
  const type = randomItem(['vehicle', 'trip', 'fuel', 'maintenance', 'license', 'info']);
  let title = '';
  switch (type) {
    case 'vehicle':
      title = `Vehicle V0${randomRange(10, 50)} assigned to trip route`;
      break;
    case 'trip':
      title = `Trip TRIP-2026-${randomRange(10, 99)} marked as Completed`;
      break;
    case 'fuel':
      title = `Fuel log logged for Vehicle V0${randomRange(10, 50)}`;
      break;
    case 'maintenance':
      title = `Maintenance started on Vehicle V${randomRange(10, 25)}`;
      break;
    case 'license':
      title = `Driver License for ${DRIVER_NAMES[randomRange(0, 10)]} expiring soon`;
      break;
    default:
      title = `Expense item logged for approvals`;
  }

  notifications.push({
    id: `N${String(i).padStart(3, '0')}`,
    title,
    time: `${randomRange(10, 59)}m ago`,
    unread: i <= 8,
    type
  });
}

// ==========================================
// 8. ACTIVITY LOGS (60 items)
// ==========================================
const activities = [];
const ACTIONS = [
  { action: 'Create Trip', desc: 'Dispatched trip record' },
  { action: 'Log Fuel', desc: 'Registered fuel card refill details' },
  { action: 'Approve Expense', desc: 'Approved pending fuel log costs' },
  { action: 'Schedule Service', desc: 'Scheduled maintenance check for vehicle' },
  { action: 'Update Driver', desc: 'Updated driver compliance parameters' }
];

for (let i = 1; i <= 60; i++) {
  const act = randomItem(ACTIONS);
  activities.push({
    id: `A${String(i).padStart(3, '0')}`,
    user: 'Alex Johnson',
    action: act.action,
    description: `${act.desc} in database registry.`,
    date: `July ${randomRange(1, 12)}, 2026 at ${String(randomRange(1, 12)).padStart(2, '0')}:${String(randomRange(10, 59))}`,
    status: randomItem(['success', 'success', 'info'])
  });
}

export {
  vehicles,
  drivers,
  trips,
  maintenance,
  fuel,
  expenses,
  notifications,
  activities
};
