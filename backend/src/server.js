import "dotenv/config";
import "express-async-errors";
import fs from "fs";
import path from "path";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { connectDatabase } from "./config/db.js";
import { errorHandler, notFound } from "./middleware/error.js";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";

const app = express();
const port = process.env.PORT || 5000;
const uploadDirectory = path.resolve("uploads");
fs.mkdirSync(uploadDirectory, { recursive: true });

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);
app.use(
  cors({
    origin: process.env.CLIENT_URL?.split(",").map((url) => url.trim()) || true
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: "draft-7",
    legacyHeaders: false
  })
);

app.use("/uploads", express.static(uploadDirectory));
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "Campus Lost & Found API" });
});
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/admin", adminRoutes);
app.use(notFound);
app.use(errorHandler);

connectDatabase().then(() => {
  app.listen(port, () => {
    console.log(`API running at http://localhost:${port}`);
  });
});
