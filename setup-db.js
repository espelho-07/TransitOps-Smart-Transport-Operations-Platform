/**
 * TransitOps - Node.js Database Setup Script
 * Installs the MongoDB driver if missing, connects to local MongoDB, and configures
 * all collections, JSON schema validations, and indexes.
 * Run using: node setup-db.js
 */

const { execSync } = require("child_process");

// Step 1: Ensure mongodb driver is installed
try {
  require.resolve("mongodb");
} catch (e) {
  console.log("Installing 'mongodb' npm package locally...");
  execSync("npm init -y", { stdio: "ignore" }); // Initialize package.json if it doesn't exist
  execSync("npm install mongodb", { stdio: "inherit" });
}

const { MongoClient, ObjectId } = require("mongodb");

const uri = "mongodb://127.0.0.1:27017";
const dbName = "TransitOps";

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("Connected successfully to local MongoDB server.");
    const db = client.db(dbName);

    // Drop existing collections to ensure a clean slate (hackathon testing environment)
    const collectionsToDrop = ["users", "vehicles", "drivers", "trips", "maintenance", "fuel_logs", "expenses"];
    const existingCollections = (await db.listCollections().toArray()).map(c => c.name);

    for (const col of collectionsToDrop) {
      if (existingCollections.includes(col)) {
        console.log(`Dropping existing collection: ${col}`);
        await db.collection(col).drop();
      }
    }

    // ==========================================
    // 1. USERS COLLECTION
    // ==========================================
    console.log("Creating 'users' collection with validators...");
    await db.createCollection("users", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["email", "password_hash", "name", "roles", "organization_id", "created_at"],
          properties: {
            email: {
              bsonType: "string",
              pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
            },
            password_hash: { bsonType: "string" },
            name: { bsonType: "string" },
            roles: {
              bsonType: "array",
              minItems: 1,
              items: {
                enum: ["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"]
              }
            },
            organization_id: { bsonType: "objectId" },
            created_at: { bsonType: "date" }
          }
        }
      }
    });
    await db.collection("users").createIndex({ email: 1 }, { unique: true });
    await db.collection("users").createIndex({ organization_id: 1 });

    // ==========================================
    // 2. VEHICLES COLLECTION
    // ==========================================
    console.log("Creating 'vehicles' collection with validators...");
    await db.createCollection("vehicles", {
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
            registration_number: { bsonType: "string", pattern: "^[A-Z0-9-]{3,15}$" },
            model: { bsonType: "string" },
            type: { enum: ["Truck", "Van", "Car", "Bus", "Trailer"] },
            max_load_capacity: { bsonType: "number", minimum: 0 },
            odometer: { bsonType: "number", minimum: 0 },
            acquisition_cost: { bsonType: "number", minimum: 0 },
            status: { enum: ["Available", "On Trip", "In Shop", "Retired"] },
            region: { bsonType: "string" },
            organization_id: { bsonType: "objectId" },
            current_trip_id: { bsonType: ["objectId", "null"] },
            total_fuel_cost: { bsonType: "number", minimum: 0 },
            total_maintenance_cost: { bsonType: "number", minimum: 0 },
            total_revenue: { bsonType: "number", minimum: 0 },
            total_distance_traveled: { bsonType: "number", minimum: 0 },
            total_fuel_consumed_liters: { bsonType: "number", minimum: 0 }
          }
        }
      }
    });
    await db.collection("vehicles").createIndex({ registration_number: 1 }, { unique: true });
    await db.collection("vehicles").createIndex({ organization_id: 1, status: 1, type: 1 });
    await db.collection("vehicles").createIndex({ organization_id: 1, region: 1 });

    // ==========================================
    // 3. DRIVERS COLLECTION
    // ==========================================
    console.log("Creating 'drivers' collection with validators...");
    await db.createCollection("drivers", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["name", "license_number", "license_category", "license_expiry_date", "contact_number", "safety_score", "status", "organization_id"],
          properties: {
            name: { bsonType: "string" },
            license_number: { bsonType: "string" },
            license_category: { enum: ["Heavy Commercial", "Light Commercial", "Private", "Hazardous"] },
            license_expiry_date: { bsonType: "date" },
            contact_number: { bsonType: "string" },
            safety_score: { bsonType: "number", minimum: 0, maximum: 100 },
            status: { enum: ["Available", "On Trip", "Off Duty", "Suspended"] },
            organization_id: { bsonType: "objectId" },
            current_trip_id: { bsonType: ["objectId", "null"] }
          }
        }
      }
    });
    await db.collection("drivers").createIndex({ license_number: 1 }, { unique: true });
    await db.collection("drivers").createIndex({ organization_id: 1, status: 1, license_expiry_date: 1 });
    await db.collection("drivers").createIndex({ license_expiry_date: 1 });

    // ==========================================
    // 4. TRIPS COLLECTION
    // ==========================================
    console.log("Creating 'trips' collection with validators...");
    await db.createCollection("trips", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["vehicle_id", "driver_id", "source", "destination", "cargo_weight", "planned_distance", "status", "organization_id", "created_at"],
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
                  items: { bsonType: "number" }
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
            cargo_weight: { bsonType: "number", minimum: 0 },
            planned_distance: { bsonType: "number", minimum: 0 },
            actual_distance: { bsonType: "number", minimum: 0 },
            status: { enum: ["Draft", "Dispatched", "Completed", "Cancelled"] },
            organization_id: { bsonType: "objectId" },
            revenue: { bsonType: "number", minimum: 0 },
            fuel_consumed_liters: { bsonType: "number", minimum: 0 },
            start_odometer: { bsonType: "number" },
            end_odometer: { bsonType: "number" },
            created_at: { bsonType: "date" },
            completed_at: { bsonType: ["date", "null"] }
          }
        }
      }
    });
    await db.collection("trips").createIndex({ organization_id: 1, status: 1, created_at: -1 });
    await db.collection("trips").createIndex({ vehicle_id: 1, created_at: -1 });
    await db.collection("trips").createIndex({ driver_id: 1, created_at: -1 });

    // ==========================================
    // 5. MAINTENANCE COLLECTION
    // ==========================================
    console.log("Creating 'maintenance' collection with validators...");
    await db.createCollection("maintenance", {
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
    await db.collection("maintenance").createIndex({ vehicle_id: 1, status: 1 });
    await db.collection("maintenance").createIndex({ organization_id: 1, start_date: -1 });

    // ==========================================
    // 6. FUEL LOGS COLLECTION
    // ==========================================
    console.log("Creating 'fuel_logs' collection with validators...");
    await db.createCollection("fuel_logs", {
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
    await db.collection("fuel_logs").createIndex({ vehicle_id: 1, date: -1 });
    await db.collection("fuel_logs").createIndex({ organization_id: 1, date: -1 });

    // ==========================================
    // 7. EXPENSES COLLECTION
    // ==========================================
    console.log("Creating 'expenses' collection with validators...");
    await db.createCollection("expenses", {
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
    await db.collection("expenses").createIndex({ vehicle_id: 1, date: -1 });
    await db.collection("expenses").createIndex({ organization_id: 1, date: -1 });

    console.log("\n==================================================");
    console.log("TransitOps database initialized successfully!");
    console.log("==================================================");

  } catch (err) {
    console.error("An error occurred during database setup:", err);
  } finally {
    await client.close();
  }
}

run();
