/**
 * TransitOps - Node.js Database Setup Script
 * Installs the MongoDB driver if missing, connects to local MongoDB, and configures
 * all collections, JSON schema validations, and indexes using frontend-compatible naming.
 * Run using: node setup-db.js
 */

const { execSync } = require("child_process");

try {
  require.resolve("mongodb");
} catch (e) {
  console.log("Installing 'mongodb' npm package locally...");
  execSync("npm init -y", { stdio: "ignore" });
  execSync("npm install mongodb", { stdio: "inherit" });
}

const { MongoClient } = require("mongodb");

const uri = "mongodb://127.0.0.1:27017";
const dbName = "TransitOps";

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("Connected successfully to local MongoDB server.");
    const db = client.db(dbName);

    const collectionsToDrop = ["users", "vehicles", "drivers", "trips", "maintenance", "fuel_logs", "expenses", "notifications", "activities"];
    const existingCollections = (await db.listCollections().toArray()).map(c => c.name);

    for (const col of collectionsToDrop) {
      if (existingCollections.includes(col)) {
        console.log(`Dropping existing collection: ${col}`);
        await db.collection(col).drop();
      }
    }

    // 1. USERS
    console.log("Creating 'users' collection with validators...");
    await db.createCollection("users", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["email", "password_hash", "name", "roles", "organization_id", "created_at"],
          properties: {
            email: { bsonType: "string", pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$" },
            password_hash: { bsonType: "string" },
            name: { bsonType: "string" },
            roles: {
              bsonType: "array",
              minItems: 1,
              items: { enum: ["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"] }
            },
            organization_id: { bsonType: "objectId" },
            created_at: { bsonType: "date" }
          }
        }
      }
    });
    await db.collection("users").createIndex({ email: 1 }, { unique: true });
    await db.collection("users").createIndex({ organization_id: 1 });

    // 2. VEHICLES
    console.log("Creating 'vehicles' collection with validators...");
    await db.createCollection("vehicles", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["id", "plateNumber", "make", "model", "year", "type", "status", "odometer", "organization_id"],
          properties: {
            id: { bsonType: "string" },
            plateNumber: { bsonType: "string" },
            make: { bsonType: "string" },
            model: { bsonType: "string" },
            year: { bsonType: "number" },
            type: { bsonType: "string" },
            status: { enum: ["Available", "On Trip", "Maintenance", "Retired"] },
            odometer: { bsonType: "number" },
            organization_id: { bsonType: "objectId" }
          }
        }
      }
    });
    await db.collection("vehicles").createIndex({ id: 1 }, { unique: true });
    await db.collection("vehicles").createIndex({ plateNumber: 1 }, { unique: true });
    await db.collection("vehicles").createIndex({ organization_id: 1, status: 1 });

    // 3. DRIVERS
    console.log("Creating 'drivers' collection with validators...");
    await db.createCollection("drivers", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["id", "name", "email", "phone", "licenseNumber", "status", "organization_id"],
          properties: {
            id: { bsonType: "string" },
            name: { bsonType: "string" },
            email: { bsonType: "string" },
            phone: { bsonType: "string" },
            licenseNumber: { bsonType: "string" },
            status: { enum: ["Available", "On Trip", "Inactive"] },
            organization_id: { bsonType: "objectId" }
          }
        }
      }
    });
    await db.collection("drivers").createIndex({ id: 1 }, { unique: true });
    await db.collection("drivers").createIndex({ licenseNumber: 1 }, { unique: true });
    await db.collection("drivers").createIndex({ organization_id: 1, status: 1 });

    // 4. TRIPS
    console.log("Creating 'trips' collection with validators...");
    await db.createCollection("trips", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["id", "tripNumber", "vehicleId", "driverId", "origin", "destination", "status", "startDate", "distance", "cargoWeight", "organization_id"],
          properties: {
            id: { bsonType: "string" },
            tripNumber: { bsonType: "string" },
            vehicleId: { bsonType: "string" },
            driverId: { bsonType: "string" },
            origin: { bsonType: "string" },
            destination: { bsonType: "string" },
            status: { enum: ["Active", "Completed", "Scheduled", "Cancelled"] },
            startDate: { bsonType: "string" },
            distance: { bsonType: "number" },
            cargoWeight: { bsonType: "string" },
            organization_id: { bsonType: "objectId" }
          }
        }
      }
    });
    await db.collection("trips").createIndex({ id: 1 }, { unique: true });
    await db.collection("trips").createIndex({ tripNumber: 1 }, { unique: true });
    await db.collection("trips").createIndex({ organization_id: 1, status: 1 });

    // 5. MAINTENANCE
    console.log("Creating 'maintenance' collection with validators...");
    await db.createCollection("maintenance", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["id", "vehicleId", "description", "type", "cost", "status", "date", "organization_id"],
          properties: {
            id: { bsonType: "string" },
            vehicleId: { bsonType: "string" },
            description: { bsonType: "string" },
            type: { enum: ["Preventive", "Repair", "Routine"] },
            cost: { bsonType: "number" },
            status: { enum: ["In Progress", "Scheduled", "Completed"] },
            date: { bsonType: "string" },
            organization_id: { bsonType: "objectId" }
          }
        }
      }
    });
    await db.collection("maintenance").createIndex({ id: 1 }, { unique: true });
    await db.collection("maintenance").createIndex({ vehicleId: 1, status: 1 });

    // 6. FUEL LOGS
    console.log("Creating 'fuel_logs' collection with validators...");
    await db.createCollection("fuel_logs", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["id", "vehicleId", "driverId", "date", "quantity", "cost", "odometer", "stationName", "receiptNumber", "organization_id"],
          properties: {
            id: { bsonType: "string" },
            vehicleId: { bsonType: "string" },
            driverId: { bsonType: "string" },
            date: { bsonType: "string" },
            quantity: { bsonType: "number" },
            cost: { bsonType: "number" },
            odometer: { bsonType: "number" },
            stationName: { bsonType: "string" },
            receiptNumber: { bsonType: "string" },
            organization_id: { bsonType: "objectId" }
          }
        }
      }
    });
    await db.collection("fuel_logs").createIndex({ id: 1 }, { unique: true });
    await db.collection("fuel_logs").createIndex({ vehicleId: 1, date: -1 });

    // 7. EXPENSES
    console.log("Creating 'expenses' collection with validators...");
    await db.createCollection("expenses", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["id", "category", "amount", "date", "status", "organization_id"],
          properties: {
            id: { bsonType: "string" },
            category: { bsonType: "string" },
            amount: { bsonType: "number" },
            date: { bsonType: "string" },
            status: { enum: ["Approved", "Pending", "Rejected"] },
            organization_id: { bsonType: "objectId" }
          }
        }
      }
    });
    await db.collection("expenses").createIndex({ id: 1 }, { unique: true });
    await db.collection("expenses").createIndex({ organization_id: 1, date: -1 });

    // 8. NOTIFICATIONS
    console.log("Creating 'notifications' collection...");
    await db.createCollection("notifications");
    await db.collection("notifications").createIndex({ id: 1 }, { unique: true });

    // 9. ACTIVITIES
    console.log("Creating 'activities' collection...");
    await db.createCollection("activities");
    await db.collection("activities").createIndex({ id: 1 }, { unique: true });

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
