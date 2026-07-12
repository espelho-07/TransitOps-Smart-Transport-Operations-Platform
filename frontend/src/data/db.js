import { vehicles as initialVehicles } from './vehicles';
import { drivers as initialDrivers } from './drivers';
import { trips as initialTrips } from './trips';
import { maintenance as initialMaintenance } from './maintenance';
import { fuel as initialFuel } from './fuelLogs';
import { expenses as initialExpenses } from './expenses';
import { notifications as initialNotifications } from './notifications';
import { users as initialUsers } from './users';
import { activities as initialActivities } from './auditLogs';
import { reports as initialReports } from './reports';

const isBrowser = typeof window !== 'undefined';

// Clear old keys to avoid mismatch and force refresh to v3 schema
if (isBrowser) {
  for (let key in localStorage) {
    if (key.startsWith('transitops_') && !key.startsWith('transitops_v4_')) {
      localStorage.removeItem(key);
    }
  }
}

const loadFromStorage = (key, defaultValue) => {
  if (!isBrowser) return defaultValue;
  const stored = localStorage.getItem(`transitops_v4_${key}`);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(`transitops_v4_${key}`, JSON.stringify(defaultValue));
  return defaultValue;
};

export const saveCollection = (key, data) => {
  if (isBrowser) {
    localStorage.setItem(`transitops_v4_${key}`, JSON.stringify(data));
  }
};

const finalVehicles = loadFromStorage('vehicles', initialVehicles);
const finalDrivers = loadFromStorage('drivers', initialDrivers);
const finalTrips = loadFromStorage('trips', initialTrips);
const finalMaintenance = loadFromStorage('maintenance', initialMaintenance);
const finalFuel = loadFromStorage('fuel', initialFuel);
const finalExpenses = loadFromStorage('expenses', initialExpenses);
const finalNotifications = loadFromStorage('notifications', initialNotifications);
const finalUsers = loadFromStorage('users', initialUsers);
const finalActivities = loadFromStorage('activities', initialActivities);
const finalReports = loadFromStorage('reports', initialReports);

export {
  finalVehicles as vehicles,
  finalDrivers as drivers,
  finalTrips as trips,
  finalMaintenance as maintenance,
  finalFuel as fuel,
  finalExpenses as expenses,
  finalNotifications as notifications,
  finalUsers as users,
  finalActivities as activities,
  finalReports as reports
};
