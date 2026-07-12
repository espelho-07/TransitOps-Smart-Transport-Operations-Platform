/**
 * TransitOps - MongoDB Initialization Script
 * Usage: mongosh TransitOps init-mongo.js
 * Or run from Node.js using a script to read and execute.
 */

const dbName = "TransitOps";
const conn = new Mongo();
const db = conn.getDB(dbName);

print(`Connecting to database: ${dbName}...`);

// Clear existing collections if running clean setup
const collectionsToDrop = ["vehicles", "drivers", "trips", "maintenance", "fuel_logs", "expenses", "users"];
collectionsToDrop.forEach((col) => {
  if (db.getCollectionNames().includes(col)) {
    print(`Dropping existing collection: ${col}`);
    db.getCollection(col).drop();
  }
});

// ==========================================
// 1. USERS COLLECTION (Authentication & RBAC)
// ==========================================
print("Creating 'users' collection with validators...");
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "password_hash", "name", "roles", "organization_id", "created_at"],
      properties: {
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
          description: "Must be a valid email address and is required"
        },
        password_hash: { bsonType: "string", description: "Hashed password string is required" },
        name: { bsonType: "string", description: "User's full name is required" },
        roles: {
          bsonType: "array",
          minItems: 1,
          items: {
            enum: ["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"]
          },
          description: "At least one role is required"
        },
        organization_id: { bsonType: "objectId", description: "Reference to the owner organization" },
        created_at: { bsonType: "date" }
      }
    }
  }
});

print("Creating indexes for 'users'...");
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ organization_id: 1 });


// ==========================================
// 2. VEHICLES COLLECTION (Fleet Assets)
// ==========================================
print("Creating 'vehicles' collection with validators...");
db.createCollection("vehicles", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "registration_number", 
        "model", 
        "type", 
        "max_load_capacity", 
        "odometer", 
        "acquisition_cost", 
        "status", 
        "organization_id",
        "total_fuel_cost",
        "total_maintenance_cost",
        "total_revenue",
        "total_distance_traveled",
        "total_fuel_consumed_liters"
      ],
      properties: {
        registration_number: { 
          bsonType: "string", 
          pattern: "^[A-Z0-9-]{3,15}$",
          description: "Must be alphanumeric, 3-15 chars, and unique"
        },
        model: { bsonType: "string" },
        type: { enum: ["Truck", "Van", "Car", "Bus", "Trailer"] },
        max_load_capacity: { bsonType: "number", minimum: 0, description: "Max weight capacity in kg" },
        odometer: { bsonType: "number", minimum: 0, description: "Current mileage in km" },
        acquisition_cost: { bsonType: "number", minimum: 0 },
        status: { enum: ["Available", "On Trip", "In Shop", "Retired"] },
        region: { bsonType: "string" },
        organization_id: { bsonType: "objectId" },
        current_trip_id: { bsonType: ["objectId", "null"] },
        
        // Denormalized metrics for real-time ROI and cost reporting (O(1) reads)
        total_fuel_cost: { bsonType: "number", minimum: 0 },
        total_maintenance_cost: { bsonType: "number", minimum: 0 },
        total_revenue: { bsonType: "number", minimum: 0 },
        total_distance_traveled: { bsonType: "number", minimum: 0 },
        total_fuel_consumed_liters: { bsonType: "number", minimum: 0 }
      }
    }
  }
});

print("Creating indexes for 'vehicles'...");
db.vehicles.createIndex({ registration_number: 1 }, { unique: true });
db.vehicles.createIndex({ organization_id: 1, status: 1, type: 1 });
db.vehicles.createIndex({ organization_id: 1, region: 1 });


// ==========================================
// 3. DRIVERS COLLECTION (Staff Registry)
// ==========================================
print("Creating 'drivers' collection with validators...");
db.createCollection("drivers", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "name", 
        "license_number", 
        "license_category", 
        "license_expiry_date", 
        "contact_number", 
        "safety_score", 
        "status", 
        "organization_id"
      ],
      properties: {
        name: { bsonType: "string" },
        license_number: { bsonType: "string" },
        license_category: { enum: ["Heavy Commercial", "Light Commercial", "Private", "Hazardous"] },
        license_expiry_date: { bsonType: "date", description: "Must be a valid date" },
        contact_number: { bsonType: "string" },
        safety_score: { bsonType: "number", minimum: 0, maximum: 100 },
        status: { enum: ["Available", "On Trip", "Off Duty", "Suspended"] },
        organization_id: { bsonType: "objectId" },
        current_trip_id: { bsonType: ["objectId", "null"] }
      }
    }
  }
});

print("Creating indexes for 'drivers'...");
db.drivers.createIndex({ license_number: 1 }, { unique: true });
db.drivers.createIndex({ organization_id: 1, status: 1, license_expiry_date: 1 });
db.drivers.createIndex({ license_expiry_date: 1 });


// ==========================================
// 4. TRIPS COLLECTION (Transport Logs)
// ==========================================
print("Creating 'trips' collection with validators...");
db.createCollection("trips", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "vehicle_id", 
        "driver_id", 
        "source", 
        "destination", 
        "cargo_weight", 
        "planned_distance", 
        "status", 
        "organization_id", 
        "created_at"
      ],
      properties: {
        vehicle_id: { bsonType: "objectId" },
        driver_id: { bsonType: "objectId" },
        source: {
          bsonType: "object",
          required: ["name", "coordinates"],
          properties: {
            name: { bsonType: "string" },
            coordinates: {
              bsonType: "array",
              minItems: 2,
              maxItems: 2,
              items: { bsonType: "number" } // [longitude, latitude]
            }
          }
        },
        destination: {
          bsonType: "object",
          required: ["name", "coordinates"],
          properties: {
            name: { bsonType: "string" },
            coordinates: {
              bsonType: "array",
              minItems: 2,
              maxItems: 2,
              items: { bsonType: "number" }
            }
          }
        },
        cargo_weight: { bsonType: "number", minimum: 0, description: "Weight of cargo in kg" },
        planned_distance: { bsonType: "number", minimum: 0, description: "Planned distance in km" },
        actual_distance: { bsonType: "number", minimum: 0 },
        status: { enum: ["Draft", "Dispatched", "Completed", "Cancelled"] },
        organization_id: { bsonType: "objectId" },
        revenue: { bsonType: "number", minimum: 0, default: 0.0 },
        fuel_consumed_liters: { bsonType: "number", minimum: 0 },
        start_odometer: { bsonType: "number" },
        end_odometer: { bsonType: "number" },
        created_at: { bsonType: "date" },
        completed_at: { bsonType: ["date", "null"] }
      }
    }
  }
});

print("Creating indexes for 'trips'...");
db.trips.createIndex({ organization_id: 1, status: 1, created_at: -1 });
db.trips.createIndex({ vehicle_id: 1, created_at: -1 });
db.trips.createIndex({ driver_id: 1, created_at: -1 });


// ==========================================
// 5. MAINTENANCE COLLECTION (Shop Logs)
// ==========================================
print("Creating 'maintenance' collection with validators...");
db.createCollection("maintenance", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["vehicle_id", "type", "cost", "start_date", "status", "organization_id"],
      properties: {
        vehicle_id: { bsonType: "objectId" },
        type: { enum: ["Routine Service", "Engine Repair", "Tire Change", "Brake System", "Electrical", "Other"] },
        description: { bsonType: "string" },
        cost: { bsonType: "number", minimum: 0 },
        start_date: { bsonType: "date" },
        end_date: { bsonType: ["date", "null"] },
        status: { enum: ["Active", "Completed"] },
        organization_id: { bsonType: "objectId" }
      }
    }
  }
});

print("Creating indexes for 'maintenance'...");
db.maintenance.createIndex({ vehicle_id: 1, status: 1 });
db.maintenance.createIndex({ organization_id: 1, start_date: -1 });


// ==========================================
// 6. FUEL LOGS COLLECTION (Fuel Spending)
// ==========================================
print("Creating 'fuel_logs' collection with validators...");
db.createCollection("fuel_logs", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["vehicle_id", "liters", "cost", "date", "organization_id"],
      properties: {
        vehicle_id: { bsonType: "objectId" },
        trip_id: { bsonType: ["objectId", "null"] },
        liters: { bsonType: "number", minimum: 0 },
        cost: { bsonType: "number", minimum: 0 },
        date: { bsonType: "date" },
        odometer: { bsonType: "number", minimum: 0 },
        organization_id: { bsonType: "objectId" }
      }
    }
  }
});

print("Creating indexes for 'fuel_logs'...");
db.fuel_logs.createIndex({ vehicle_id: 1, date: -1 });
db.fuel_logs.createIndex({ organization_id: 1, date: -1 });


// ==========================================
// 7. EXPENSES COLLECTION (Miscellaneous Costs)
// ==========================================
print("Creating 'expenses' collection with validators...");
db.createCollection("expenses", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["vehicle_id", "amount", "type", "date", "organization_id"],
      properties: {
        vehicle_id: { bsonType: "objectId" },
        trip_id: { bsonType: ["objectId", "null"] },
        amount: { bsonType: "number", minimum: 0 },
        type: { enum: ["Toll", "Permit", "Driver Allowance", "Parking", "Fine", "Other"] },
        date: { bsonType: "date" },
        description: { bsonType: "string" },
        organization_id: { bsonType: "objectId" }
      }
    }
  }
});

print("Creating indexes for 'expenses'...");
db.expenses.createIndex({ vehicle_id: 1, date: -1 });
db.expenses.createIndex({ organization_id: 1, date: -1 });

print("==================================================");
print("TransitOps MongoDB Database Schema & Indexes Initialized!");
print("==================================================");
