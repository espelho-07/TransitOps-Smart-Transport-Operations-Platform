"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
const path_1 = __importDefault(require("path"));
// Load dotenv
dotenv_1.default.config({ path: path_1.default.join(__dirname, "../../.env") });
const envSchema = zod_1.z.object({
    PORT: zod_1.z.coerce.number().default(3000),
    MONGO_URI: zod_1.z.string().default("mongodb://127.0.0.1:27017/TransitOps"),
    JWT_SECRET: zod_1.z.string().default("transitops_super_secret_jwt_key"),
    JWT_REFRESH_SECRET: zod_1.z.string().default("transitops_super_secret_refresh_key"),
    REDIS_URL: zod_1.z.string().default("redis://127.0.0.1:6379"),
    NODE_ENV: zod_1.z.enum(["development", "production", "test"]).default("development"),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error("Invalid environment variables:", parsed.error.format());
    process.exit(1);
}
exports.env = parsed.data;
