import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { env } from "./config/env";
import { connectDatabase } from "./database/connection";
import { globalErrorHandler } from "./middlewares/error";

// Import Routers
import { authRouter } from "./modules/auth/routes";
import { vehicleRouter } from "./modules/vehicles/routes";
import { driverRouter } from "./modules/drivers/routes";
import { tripRouter } from "./modules/trips/routes";
import { maintenanceRouter } from "./modules/maintenance/routes";
import { fuelRouter } from "./modules/fuel/routes";
import { expenseRouter } from "./modules/expenses/routes";
import { dashboardRouter } from "./modules/dashboard/routes";
import { notificationRouter } from "./modules/notifications/routes";
import { activityRouter } from "./modules/activities/routes";
import { usersRouter } from "./modules/users/routes";
import { reportsRouter } from "./modules/reports/routes";

// Import Seeder function
import { seedLargeDatabase } from "./database/seed";

const app = express();

// Standard middlewares
app.use(helmet());
app.use(cors({ origin: "*" })); // Allow React Vite frontend requests
app.use(express.json());

// Basic Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per window
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", time: new Date() });
});

// Register API Routes
app.use("/api/auth", authRouter);
app.use("/api/vehicles", vehicleRouter);
app.use("/api/drivers", driverRouter);
app.use("/api/trips", tripRouter);
app.use("/api/maintenance", maintenanceRouter);
app.use("/api/fuel", fuelRouter);
app.use("/api/expenses", expenseRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/activities", activityRouter);
app.use("/api/users", usersRouter);
app.use("/api/reports", reportsRouter);

// Global Error Handler middleware
app.use(globalErrorHandler as any);

async function startServer() {
  await connectDatabase();

  // If command-line --seed argument is supplied, seed database and exit
  if (process.argv.includes("--seed")) {
    try {
      await seedLargeDatabase();
      console.log("Database seeding completed successfully. Exiting...");
      process.exit(0);
    } catch (err) {
      console.error("Database seeding failure:", err);
      process.exit(1);
    }
  }

  app.listen(env.PORT, () => {
    console.log(`==================================================`);
    console.log(`TransitOps Backend API Server running on port ${env.PORT}`);
    console.log(`Database connected & models fully initialized.`);
    console.log(`==================================================`);
  });
}

startServer();
