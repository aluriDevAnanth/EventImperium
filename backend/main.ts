import { Hono } from "hono";
import { cors } from "hono/cors";
import mongoose from "mongoose";
import { router as EventRouter } from "src/routes/EventRou.ts";
import { router as UserRou } from "src/routes/UserRou.ts";
import { router as VendorRou } from "src/routes/VendorRou.ts";
import { router as ChatRou } from "src/routes/ChatRou.ts";
import seedData from "src/db/seed.ts";
import { Env } from "@/types.ts";
import PocketBase from "pocketbase";
import { Server as Engine } from "@socket.io/bun-engine";
import { Server } from "socket.io";
import { engine, userSocketMap, websocket } from "./scoketIO.ts";

export const pb = new PocketBase("http://127.0.0.1:8090");

const app = new Hono<Env>();

app.use("*", cors());

app.route("/api/v1", EventRouter);
app.route("/api/v1", UserRou);
app.route("/api/v1", VendorRou);
app.route("", ChatRou);

app.get("/api/v1/health", (c) => {
  return c.json({ hello: 200 });
});

const start = async () => {
  try {
    console.log("Initializing...");
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/EventEmpire",
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
  idleTimeout: 30,

  fetch(req, server) {
    const url = new URL(req.url);

    if (url.pathname.startsWith("/socket.io/")) {
      return engine.handleRequest(req, server);
    }

    return app.fetch(req, server);
  },

  websocket,
};
