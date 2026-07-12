// Unified Mock Database for TransitOps Logistics
// Generates exactly: 50 vehicles, 35 drivers, 120 trips, 45 maintenance records, 350 fuel logs, 280 expenses, 100 notifications, 15 users.

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
  "Mark Allen", "Ashley Young", "Donald Hernandez", "Dorothy King", "Steven Wright"
];

const CITIES = [
  "Houston, TX", "Dallas, TX", "Austin, TX", "San Antonio, TX", "Los Angeles, CA",
  "San Francisco, CA", "San Diego, CA", "Seattle, WA", "Denver, CO", "Chicago, IL",
  "New York, NY", "Boston, MA", "Miami, FL", "Atlanta, GA", "Phoenix, AZ"
];

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
  
  let status = 'Available';
  if (i <= 15) status = 'On Trip';
  else if (i <= 20) status = 'Maintenance';
  else if (i === 49 || i === 50) status = 'Retired';

  const type = model.includes('Heavy') || model.includes('Actros') ? 'Heavy Truck' : model.includes('Box') ? 'Box Truck' : 'Light Cargo';
  let carrierCap = '1.5 Tons';
  let capacityKg = 1500;
  if (type === 'Heavy Truck') {
    carrierCap = '24 Tons';
    capacityKg = 24000;
  } else if (type === 'Box Truck') {
    carrierCap = '8 Tons';
    capacityKg = 8000;
  } else if (model.includes('Sprinter')) {
    carrierCap = '3 Tons';
    capacityKg = 3000;
  }

  const purchaseDate = `${year}-${String(randomRange(1, 12)).padStart(2, '0')}-${String(randomRange(1, 28)).padStart(2, '0')}`;
  const insuranceExpiry = `2026-${String(randomRange(7, 12)).padStart(2, '0')}-${String(randomRange(1, 28)).padStart(2, '0')}`;
  const fitnessExpiry = `2026-${String(randomRange(8, 12)).padStart(2, '0')}-${String(randomRange(1, 28)).padStart(2, '0')}`;
  const permitExpiry = `2026-${String(randomRange(7, 12)).padStart(2, '0')}-${String(randomRange(1, 28)).padStart(2, '0')}`;
  const pucExpiry = `2026-${String(randomRange(6, 12)).padStart(2, '0')}-${String(randomRange(1, 28)).padStart(2, '0')}`;

  const vin = `1FM${String.fromCharCode(65 + randomRange(0, 25))}${randomRange(10, 99)}H${randomRange(100000, 999999)}`;
  
  vehicles.push({
    id,
    plateNumber: `TX-${randomRange(100, 999)}-${String.fromCharCode(65 + randomRange(0, 25))}${String.fromCharCode(65 + randomRange(0, 25))}`,
    make: brand.make,
    model,
    year,
    type,
    carrierCap,
    capacityKg,
    status,
    fuelLevel: randomRange(15, 100),
    odometer: randomRange(25000, 250000),
    purchaseDate,
    purchaseCost: randomRange(35000, 85000),
    vin,
    insuranceExpiry,
    fitnessExpiry,
    permitExpiry,
    pucExpiry,
    region: randomItem(['North', 'South', 'East', 'West', 'Central']),
    notes: 'Standard operations vehicle profile.',
    assignedDriverId: status === 'On Trip' ? `D${String(i).padStart(3, '0')}` : null,
    assignedTripId: status === 'On Trip' ? `T${String(i).padStart(3, '0')}` : null,
    lastServiceDate: `2026-05-${String(randomRange(1, 28)).padStart(2, '0')}`,
    nextServiceDate: `2026-08-${String(randomRange(1, 28)).padStart(2, '0')}`,
    image: type === 'Heavy Truck'
      ? 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=400&q=80'
      : type === 'Box Truck'
        ? 'https://images.unsplash.com/photo-1516576880669-dfcbfd2f6208?auto=format&fit=crop&w=400&q=80'
        : 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=400&q=80'
  });
}

// ==========================================
// 2. DRIVERS GENERATOR (35 items)
// ==========================================
const drivers = [];
for (let i = 1; i <= 35; i++) {
  const id = `D${String(i).padStart(3, '0')}`;
  const name = DRIVER_NAMES[i - 1];
  let status = 'Available';
  if (i <= 15) status = 'On Trip';
  else if (i === 34 || i === 35) status = 'Suspended';

  drivers.push({
    id,
    name,
    email: `${name.toLowerCase().replace(/\s/g, '.')}@transitops.com`,
    phone: `+1 (555) ${randomRange(200, 999)}-${randomRange(1000, 9999)}`,
    licenseNumber: `DL-${String.fromCharCode(65 + randomRange(0, 25))}${randomRange(100000, 999999)}`,
    status,
    ratings: (randomRange(43, 50) / 10).toFixed(1),
    hireDate: `2022-0${randomRange(1, 9)}-${String(randomRange(10, 28))}`,
    avatar: `https://images.unsplash.com/${[
      'photo-1507003211169-0a1dd7228f2d',
      'photo-1494790108377-be9c29b29330',
      'photo-1500648767791-00dcc994a43e',
      'photo-1438761681033-6461ffad8d80',
      'photo-1472099645785-5658abf4ff4e',
      'photo-1544005313-94ddf0286df2',
      'photo-1519085360753-af0119f7cbe7',
      'photo-1573496359142-b8d87734a5a2',
      'photo-1506794778202-cad84cf45f1d',
      'photo-1534528741775-53994a69daeb'
    ][(i - 1) % 10]}?auto=format&fit=crop&w=150&h=150&q=80`
  });
}

// ==========================================
// 3. TRIPS GENERATOR (120 items)
// ==========================================
const trips = [];
// 15 Active Trips
for (let i = 1; i <= 15; i++) {
  trips.push({
    id: `T${String(i).padStart(3, '0')}`,
    tripNumber: `TRIP-2026-${String(i).padStart(3, '0')}`,
    vehicleId: `V${String(i).padStart(3, '0')}`,
    driverId: `D${String(i).padStart(3, '0')}`,
    origin: randomItem(CITIES),
    destination: randomItem(CITIES),
    status: 'Active',
    startDate: new Date(Date.now() - randomRange(1, 10) * 3600000).toISOString(),
    endDate: null,
    distance: randomRange(250, 600),
    fuelConsumed: null,
    cargoWeight: `${randomRange(5, 20)} Tons`
  });
}
// 95 Completed Trips
for (let i = 16; i <= 110; i++) {
  const dist = randomRange(150, 750);
  const start = new Date(Date.now() - randomRange(1, 15) * 86400000);
  trips.push({
    id: `T${String(i).padStart(3, '0')}`,
    tripNumber: `TRIP-2026-${String(i).padStart(3, '0')}`,
    vehicleId: `V${String(randomRange(16, 48)).padStart(3, '0')}`,
    driverId: `D${String(randomRange(16, 33)).padStart(3, '0')}`,
    origin: randomItem(CITIES),
    destination: randomItem(CITIES),
    status: 'Completed',
    startDate: start.toISOString(),
    endDate: new Date(start.getTime() + randomRange(4, 12) * 3600000).toISOString(),
    distance: dist,
    fuelConsumed: Number((dist * 0.28).toFixed(1)),
    cargoWeight: `${randomRange(2, 22)} Tons`
  });
}
// 10 Scheduled/Cancelled Trips
for (let i = 111; i <= 120; i++) {
  trips.push({
    id: `T${String(i).padStart(3, '0')}`,
    tripNumber: `TRIP-2026-${String(i).padStart(3, '0')}`,
    vehicleId: `V${String(randomRange(21, 48)).padStart(3, '0')}`,
    driverId: `D${String(randomRange(16, 33)).padStart(3, '0')}`,
    origin: randomItem(CITIES),
    destination: randomItem(CITIES),
    status: i % 2 === 0 ? 'Scheduled' : 'Cancelled',
    startDate: new Date(Date.now() + randomRange(12, 48) * 3600000).toISOString(),
    endDate: null,
    distance: randomRange(200, 500),
    fuelConsumed: null,
    cargoWeight: `${randomRange(5, 18)} Tons`
  });
}

// ==========================================
// 4. MAINTENANCE LOGS (45 items)
// ==========================================
const maintenance = [];
// 5 Active Maintenance Logs (vehicles 16-20)
for (let i = 1; i <= 5; i++) {
  maintenance.push({
    id: `M${String(i).padStart(3, '0')}`,
    vehicleId: `V${String(15 + i).padStart(3, '0')}`,
    description: randomItem(['Engine oil flush & filter checks', 'Brake pad caliper swap', 'Suspension alignment']),
    type: 'Preventive',
    cost: randomRange(300, 1500),
    status: 'In Progress',
    date: `2026-07-${10 + i}`,
    priority: 'High',
    mechanic: 'Central Depot Workshop'
  });
}
// 40 Completed Maintenance Logs
for (let i = 6; i <= 45; i++) {
  maintenance.push({
    id: `M${String(i).padStart(3, '0')}`,
    vehicleId: `V${String(randomRange(1, 50)).padStart(3, '0')}`,
    description: randomItem(['Tire rotation', 'Coolant flush', 'Safety certification checking', 'Air filter replacement']),
    type: 'Routine',
    cost: randomRange(100, 800),
    status: 'Completed',
    date: `2026-06-${String(randomRange(1, 28)).padStart(2, '0')}`,
    priority: 'Low',
    mechanic: 'Fleet Partner Services'
  });
}

// ==========================================
// 5. FUEL LOGS (350 items)
// ==========================================
const fuel = [];
for (let i = 1; i <= 350; i++) {
  const qty = randomRange(60, 180);
  const cost = Number((qty * 1.85).toFixed(2));
  fuel.push({
    id: `F${String(i).padStart(3, '0')}`,
    vehicleId: `V${String(randomRange(1, 50)).padStart(3, '0')}`,
    driverId: `D${String(randomRange(1, 33)).padStart(3, '0')}`,
    date: `2026-06-${String(randomRange(1, 30)).padStart(2, '0')}`,
    quantity: qty,
    cost,
    odometer: randomRange(50000, 220000),
    stationName: randomItem(['Shell Logistics Hub', 'Exxon Highway Hub', 'Chevron Central Depot']),
    receiptNumber: `RCPT-FUEL-${randomRange(10000, 99999)}`
  });
}

// ==========================================
// 6. EXPENSES GENERATOR (280 items)
// ==========================================
const expenses = [];
// 150 Fuel Expenses
for (let i = 1; i <= 150; i++) {
  const fLog = fuel[i - 1];
  expenses.push({
    id: `E${String(i).padStart(3, '0')}`,
    vehicleId: fLog.vehicleId,
    category: 'Fuel',
    amount: fLog.cost,
    date: fLog.date,
    description: `Refueling transaction receipt ${fLog.receiptNumber}`,
    status: 'Approved',
    merchant: fLog.stationName
  });
}
// 30 Maintenance Expenses
for (let i = 151; i <= 180; i++) {
  const mLog = maintenance[(i - 151) % 45];
  expenses.push({
    id: `E${String(i).padStart(3, '0')}`,
    vehicleId: mLog.vehicleId,
    category: 'Maintenance',
    amount: mLog.cost,
    date: mLog.date,
    description: `Asset service billing code ${mLog.id}`,
    status: mLog.status === 'Completed' ? 'Approved' : 'Pending',
    merchant: 'Fleet Partner Services'
  });
}
// 100 General Expenses
for (let i = 181; i <= 280; i++) {
  const category = randomItem(['Tolls', 'Salaries', 'Insurance', 'Miscellaneous']);
  let amount = randomRange(20, 250);
  if (category === 'Salaries') amount = randomRange(1500, 2500);
  if (category === 'Insurance') amount = randomRange(400, 1200);

  expenses.push({
    id: `E${String(i).padStart(3, '0')}`,
    vehicleId: `V${String(randomRange(1, 50)).padStart(3, '0')}`,
    category,
    amount,
    date: `2026-07-${String(randomRange(1, 12)).padStart(2, '0')}`,
    description: `Operational ${category.toLowerCase()} cost entry`,
    status: randomItem(['Approved', 'Pending']),
    merchant: category === 'Tolls' ? 'E-Pass Highway Tolls' : category === 'Insurance' ? 'Universal Risks Ltd' : 'Operations Cash Pool'
  });
}

// ==========================================
// 7. NOTIFICATIONS (100 items)
// ==========================================
const notifications = [];
for (let i = 1; i <= 100; i++) {
  const type = randomItem(['vehicle', 'trip', 'maintenance', 'license', 'expense']);
  let title = '';
  switch (type) {
    case 'vehicle':
      title = `Vehicle V${String(randomRange(1, 50)).padStart(3, '0')} assigned to dispatcher`;
      break;
    case 'trip':
      title = `Trip TRIP-2026-${randomRange(100, 220)} completed successfully`;
      break;
    case 'maintenance':
      title = `Preventive service scheduled for vehicle V${String(randomRange(1, 50)).padStart(3, '0')}`;
      break;
    case 'license':
      title = `Driver License for operator D${String(randomRange(1, 35)).padStart(3, '0')} expiring soon`;
      break;
    default:
      title = `Operational expense log awaiting approvals`;
  }

  notifications.push({
    id: `N${String(i).padStart(3, '0')}`,
    title,
    time: `${randomRange(10, 59)}m ago`,
    unread: i <= 12,
    type
  });
}

// ==========================================
// 8. USERS (15 items)
// ==========================================
const users = [];
const ROLES_LIST = ['Admin', 'Fleet Manager', 'Driver', 'Safety Officer', 'Financial Analyst'];
for (let i = 1; i <= 15; i++) {
  const role = ROLES_LIST[(i - 1) % 5];
  const name = i <= 5 ? ['Alex Johnson', 'Marcus Brody', 'Sarah Jenkins', 'Officer David Vance', 'Fiona Gallagher'][i - 1] : `Staff User ${i}`;
  users.push({
    id: `U${String(i).padStart(3, '0')}`,
    name,
    email: `${name.toLowerCase().replace(/\s/g, '.')}@transitops.com`,
    role,
    status: 'Active',
    avatar: `https://images.unsplash.com/photo-${i % 2 === 0 ? '1507003211169-0a1dd7228f2d' : '1494790108377-be9c29b29330'}?auto=format&fit=crop&w=150&h=150&q=80`
  });
}

// Activity logs standard placeholder
const activities = [];
const ACTIONS = [
  { action: 'Create Trip', desc: 'Dispatched trip' },
  { action: 'Log Fuel', desc: 'Logged refuel card' },
  { action: 'Schedule Service', desc: 'Scheduled servicing check' }
];
for (let i = 1; i <= 60; i++) {
  const act = randomItem(ACTIONS);
  activities.push({
    id: `A${String(i).padStart(3, '0')}`,
    user: 'Alex Johnson',
    action: act.action,
    description: `${act.desc} in registry.`,
    date: `July ${randomRange(1, 12)}, 2026 at ${randomRange(1, 12)}:${randomRange(10, 59)}`,
    status: 'success'
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
  users,
  activities
};
