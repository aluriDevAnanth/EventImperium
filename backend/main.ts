import { Hono } from "hono";
import { cors } from "hono/cors";
import mongoose from "mongoose";
import { router as EventRouter } from "./src/routes/EventRou.ts";
import { router as UserRou } from "./src/routes/UserRou.ts";
import { router as VendorRou } from "./src/routes/VendorRou.ts";
import { router as ChatRou } from "./src/routes/ChatRou.ts";
import seedData from "./src/db/seed.ts";
import { Env } from "./types.ts";
import { createResponse } from "better-sse";

const app = new Hono<Env>();

export const activeClients = new Map();

app.use("*", cors());

app.route("/api/v1", EventRouter);
app.route("/api/v1", UserRou);
app.route("/api/v1", VendorRou);
app.route("/api/v1", ChatRou);

app.get("/api/v1/health", (c) => {
  return c.json({ hello: 200 });
});

const start = async () => {
  try {
    console.log("Initializing...");
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/EventEmpire"
    );
    await seedData();
    console.log("Database connected and seeded.");
  } catch (error) {
    console.error("Startup error:", error);
  }
};

start();

export default {
  port: 3000,
  fetch: app.fetch,
};
