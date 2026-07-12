/**
 * TransitOps - Database Seeder Script
 * Run using: node seed-db.js
 * Populates your local TransitOps database with rich mockup data (Users, Vehicles, Drivers, Trips, Maintenance, and Fuel Logs)
 * so your frontend teammate has data to display immediately on the dashboard.
 */

const { MongoClient, ObjectId } = require("mongodb");

const uri = "mongodb://127.0.0.1:27017";
const dbName = "TransitOps";

async function seed() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("Connected to MongoDB server for seeding...");
    const db = client.db(dbName);

    // Clear existing data to make the seeder idempotent
    console.log("Cleaning collections...");
    await db.collection("users").deleteMany({});
    await db.collection("drivers").deleteMany({});
    await db.collection("vehicles").deleteMany({});
    await db.collection("trips").deleteMany({});
    await db.collection("maintenance").deleteMany({});
    await db.collection("fuel_logs").deleteMany({});
    await db.collection("expenses").deleteMany({});

    // Shared mock organization ID
    const orgId = new ObjectId("60c72b2f9b1d8b3a7c8c8c8c");

    // 1. SEED USER
    console.log("Seeding Users...");
    await db.collection("users").insertOne({
      _id: new ObjectId("60c72b2f9b1d8b3a7c8c8c8d"),
      email: "manager@transitops.com",
      password_hash: "$2b$10$EpRkB1B0p37kQc1pMepZle3G2xYk/r8nJ9pQ/6x739a8U", // dummy hash
      name: "John Doe",
      roles: ["Fleet Manager"],
      organization_id: orgId,
      created_at: new Date()
    });

    // 2. SEED DRIVERS
    console.log("Seeding Drivers...");
    const driver1Id = new ObjectId();
    const driver2Id = new ObjectId();
    const driver3Id = new ObjectId();

    await db.collection("drivers").insertMany([
      {
        _id: driver1Id,
        name: "Alex Johnson",
        license_number: "DL-98471239",
        license_category: "Heavy Commercial",
        license_expiry_date: new Date("2028-12-31T00:00:00Z"),
        contact_number: "+1-555-0199",
        safety_score: 95,
        status: "Available",
        organization_id: orgId,
        current_trip_id: null
      },
      {
        _id: driver2Id,
        name: "Marcus Aurelius",
        license_number: "DL-11029482",
        license_category: "Light Commercial",
        license_expiry_date: new Date("2027-05-15T00:00:00Z"),
        contact_number: "+1-555-0144",
        safety_score: 88,
        status: "On Trip",
        organization_id: orgId,
        current_trip_id: null // Will update below
      },
      {
        _id: driver3Id,
        name: "Sarah Croft",
        license_number: "DL-48192304",
        license_category: "Private",
        license_expiry_date: new Date("2026-09-20T00:00:00Z"),
        contact_number: "+1-555-0123",
        safety_score: 92,
        status: "Available",
        organization_id: orgId,
        current_trip_id: null
      }
    ]);

    // 3. SEED VEHICLES
    console.log("Seeding Vehicles...");
    const vehicle1Id = new ObjectId();
    const vehicle2Id = new ObjectId();
    const vehicle3Id = new ObjectId();

    await db.collection("vehicles").insertMany([
      {
        _id: vehicle1Id,
        registration_number: "TRK-001",
        model: "Volvo FH16",
        type: "Truck",
        max_load_capacity: 15000.0,
        odometer: 124500.0,
        acquisition_cost: 135000.0,
        status: "Available",
        region: "North",
        organization_id: orgId,
        current_trip_id: null,
        // Denormalized running counters
        total_fuel_cost: 4200.0,
        total_maintenance_cost: 1500.0,
        total_revenue: 9500.0,
        total_distance_traveled: 4500.0,
        total_fuel_consumed_liters: 1500.0
      },
      {
        _id: vehicle2Id,
        registration_number: "VAN-002",
        model: "Ford Transit",
        type: "Van",
        max_load_capacity: 2500.0,
        odometer: 48900.0,
        acquisition_cost: 45000.0,
        status: "On Trip",
        region: "South",
        organization_id: orgId,
        current_trip_id: null, // Will update below
        total_fuel_cost: 1800.0,
        total_maintenance_cost: 600.0,
        total_revenue: 4100.0,
        total_distance_traveled: 3100.0,
        total_fuel_consumed_liters: 380.0
      },
      {
        _id: vehicle3Id,
        registration_number: "VAN-003",
        model: "Mercedes Sprinter",
        type: "Van",
        max_load_capacity: 3000.0,
        odometer: 62000.0,
        acquisition_cost: 52000.0,
        status: "In Shop",
        region: "West",
        organization_id: orgId,
        current_trip_id: null,
        total_fuel_cost: 2500.0,
        total_maintenance_cost: 2300.0,
        total_revenue: 5800.0,
        total_distance_traveled: 5100.0,
        total_fuel_consumed_liters: 620.0
      }
    ]);

    // 4. SEED TRIPS
    console.log("Seeding Trips...");
    const activeTripId = new ObjectId();
    const completedTripId = new ObjectId();

    await db.collection("trips").insertMany([
      {
        _id: completedTripId,
        vehicle_id: vehicle1Id,
        driver_id: driver1Id,
        source: { name: "Warehouse A", coordinates: [-74.0060, 40.7128] },
        destination: { name: "Retail Center B", coordinates: [-73.9352, 40.7306] },
        cargo_weight: 12000.0,
        planned_distance: 120.0,
        actual_distance: 122.5,
        status: "Completed",
        organization_id: orgId,
        revenue: 2500.0,
        fuel_consumed_liters: 45.0,
        start_odometer: 124377.5,
        end_odometer: 124500.0,
        created_at: new Date("2026-07-10T08:00:00Z"),
        completed_at: new Date("2026-07-10T11:30:00Z")
      },
      {
        _id: activeTripId,
        vehicle_id: vehicle2Id,
        driver_id: driver2Id,
        source: { name: "Depot South", coordinates: [-118.2437, 34.0522] },
        destination: { name: "Client Hub West", coordinates: [-122.4194, 37.7749] },
        cargo_weight: 1800.0,
        planned_distance: 610.0,
        actual_distance: 0.0,
        status: "Dispatched",
        organization_id: orgId,
        revenue: 1500.0,
        fuel_consumed_liters: 0.0,
        start_odometer: 48900.0,
        end_odometer: 0.0,
        created_at: new Date(),
        completed_at: null
      }
    ]);

    // Set active trip links
    await db.collection("vehicles").updateOne({ _id: vehicle2Id }, { $set: { current_trip_id: activeTripId } });
    await db.collection("drivers").updateOne({ _id: driver2Id }, { $set: { current_trip_id: activeTripId } });

    // 5. SEED MAINTENANCE LOGS
    console.log("Seeding Maintenance logs...");
    await db.collection("maintenance").insertOne({
      _id: new ObjectId(),
      vehicle_id: vehicle3Id,
      type: "Engine Repair",
      description: "Alternator replacement and belt change",
      cost: 450.00,
      start_date: new Date(),
      end_date: null,
      status: "Active",
      organization_id: orgId
    });

    // 6. SEED FUEL LOGS
    console.log("Seeding Fuel logs...");
    await db.collection("fuel_logs").insertOne({
      _id: new ObjectId(),
      vehicle_id: vehicle1Id,
      trip_id: completedTripId,
      liters: 45.0,
      cost: 180.0,
      date: new Date("2026-07-10T10:00:00Z"),
      odometer: 124480.0,
      organization_id: orgId
    });

    console.log("\n==================================================");
    console.log("Mock data seeded successfully! Refresh MongoDB Compass to see the documents.");
    console.log("==================================================");

  } catch (err) {
    console.error("Seeding error:", err);
    if (err.errInfo) {
      console.error("Validation error details:", JSON.stringify(err.errInfo, null, 2));
    }
    if (err.writeErrors) {
      err.writeErrors.forEach(we => {
        console.error("Write error detail:", JSON.stringify(we, null, 2));
      });
    }
  } finally {
    await client.close();
  }
}

seed();
