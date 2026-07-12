# TransitOps - Smart Transport Operations Platform

TransitOps is a centralized logistics and fleet management platform that digitizes vehicle registration, driver profiles, dispatch boards, maintenance tracking, fuel logs, and operational expenses.

---

## 1. Installation & Local Development Setup

To run the application locally, install the dependencies for both the backend (root directory) and the frontend.

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### Setup Commands
1. **Clone the repository** and install root dependencies:
   ```bash
   npm install
   ```
2. **Install frontend dependencies**:
   ```bash
   cd frontend
   ```
   ```bash
   npm install
   ```
3. **Start the local development server**:
   ```bash
   npm run dev
   ```
   The application will be running locally on [http://localhost:5173/](http://localhost:5173/).

---

## 2. Authentication & Credentials (RBAC)

Sign in to the platform using the following role credentials:

- **Fleet Manager**
  - **Email**: `manager@transitops.com` or `marcus.brody@transitops.com`
  - **Password**: `password`
  - *Permissions*: Full access (vehicles, drivers, dispatches, maintenance, expenses, and analytics).

- **Driver**
  - **Email**: `driver@transitops.com` or `sarah.jenkins@transitops.com`
  - **Password**: `password`
  - *Permissions*: Log own fuel refills, view assigned trip statuses, edit profile.

- **Safety Officer**
  - **Email**: `safety@transitops.com` or `david.vance@transitops.com`
  - **Password**: `password`
  - *Permissions*: Access driver registries, license expiry notifications, update safety scores.

- **Financial Analyst**
  - **Email**: `analyst@transitops.com` or `fiona.gallagher@transitops.com`
  - **Password**: `password`
  - *Permissions*: Approve operational expenses, track fuel efficiency, view ROI analytics.

---

## 3. Operational Workflows & Rules

### Vehicle & Driver Registries
1. Navigate to **Vehicles** to register a new commercial vehicle (Plate Number must be unique).
2. Navigate to **Drivers** to log driver profile details.

### Dispatching & Validation Rules
1. Navigate to **Trips** and click **Dispatch Trip**.
2. Select an available vehicle and driver.
3. *Cargo weight check*: Cargo weight must not exceed the vehicle's capacity.
4. *License check*: Drivers with expired licenses or `Suspended` status cannot be assigned.
5. *Automatic State updates*: Active dispatched trips set both vehicle and driver status to `On Trip`.
6. *Complete/Cancel*: Completing a trip releases the driver and vehicle status back to `Available`.

### Workshop Maintenance
1. Navigate to **Maintenance** and select **Log Maintenance** for a vehicle.
2. Logging maintenance immediately updates the vehicle's status to `Maintenance` (represented as "In Shop"), removing it from the driver's dispatch selection pool.
3. Completing the maintenance restores the vehicle to `Available`.

### Financial Audits & Analytics
1. Navigate to **Reports** to inspect operational metrics:
   - **Fuel Efficiency** (`Distance / Fuel`).
   - **Fleet Utilization** (`Active / Total Active + Available`).
   - **Operational Cost** (`Fuel + Maintenance`).
   - **Vehicle ROI** (`(Revenue - (Maintenance + Fuel)) / Acquisition Cost`).
2. Export the metrics into a CSV file by clicking **Export CSV**.