"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = connectDatabase;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("../config/env");
async function connectDatabase() {
    try {
        console.log(`Connecting to MongoDB: ${env_1.env.MONGO_URI}...`);
        await mongoose_1.default.connect(env_1.env.MONGO_URI);
        console.log("MongoDB connected successfully!");
    }
    catch (error) {
        console.error("MongoDB connection failure:", error);
        process.exit(1);
    }
}
