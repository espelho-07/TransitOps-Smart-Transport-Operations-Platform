"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = require("express-rate-limit");
const env_1 = require("./config/env");
const connection_1 = require("./database/connection");
const error_1 = require("./middlewares/error");
// Import Routers
const routes_1 = require("./modules/auth/routes");
const routes_2 = require("./modules/vehicles/routes");
const routes_3 = require("./modules/drivers/routes");
const routes_4 = require("./modules/trips/routes");
const routes_5 = require("./modules/maintenance/routes");
const routes_6 = require("./modules/fuel/routes");
const routes_7 = require("./modules/expenses/routes");
const routes_8 = require("./modules/dashboard/routes");
const routes_9 = require("./modules/notifications/routes");
const routes_10 = require("./modules/activities/routes");
// Import Seeder function
const seed_1 = require("./database/seed");
const app = (0, express_1.default)();
// Standard middlewares
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: "*" })); // Allow React Vite frontend requests
app.use(express_1.default.json());
// Basic Rate Limiting
const limiter = (0, express_rate_limit_1.rateLimit)({
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
app.use("/api/auth", routes_1.authRouter);
app.use("/api/vehicles", routes_2.vehicleRouter);
app.use("/api/drivers", routes_3.driverRouter);
app.use("/api/trips", routes_4.tripRouter);
app.use("/api/maintenance", routes_5.maintenanceRouter);
app.use("/api/fuel", routes_6.fuelRouter);
app.use("/api/expenses", routes_7.expenseRouter);
app.use("/api/dashboard", routes_8.dashboardRouter);
app.use("/api/notifications", routes_9.notificationRouter);
app.use("/api/activities", routes_10.activityRouter);
// Global Error Handler middleware
app.use(error_1.globalErrorHandler);
async function startServer() {
    await (0, connection_1.connectDatabase)();
    // If command-line --seed argument is supplied, seed database and exit
    if (process.argv.includes("--seed")) {
        try {
            await (0, seed_1.seedLargeDatabase)();
            console.log("Database seeding completed successfully. Exiting...");
            process.exit(0);
        }
        catch (err) {
            console.error("Database seeding failure:", err);
            process.exit(1);
        }
    }
    app.listen(env_1.env.PORT, () => {
        console.log(`==================================================`);
        console.log(`TransitOps Backend API Server running on port ${env_1.env.PORT}`);
        console.log(`Database connected & models fully initialized.`);
        console.log(`==================================================`);
    });
}
startServer();
