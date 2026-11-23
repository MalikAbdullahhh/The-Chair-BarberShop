// Cloudflare Workers entry for an existing Express API.
// The Express app runs inside a single Durable Object so its MongoDB (mongoose)
// connection stays open between requests (plain Workers cannot reuse sockets).
import { DurableObject } from "cloudflare:workers";
import { handleAsNodeRequest } from "cloudflare:node";
import mongoose from "mongoose";

// ── Idle sleep ──────────────────────────────────────────────────────────────
// An open MongoDB connection keeps heartbeat timers running, which keeps the Durable Object
// "active" (and counting against the free plan's daily duration) even with no visitors.
// After IDLE_MS without requests an alarm closes the connection so the object can go idle;
// the next request reconnects with the app's original settings before it is handled.
const IDLE_MS = 90_000;
let connectArgs = null;
const originalConnect = mongoose.connect.bind(mongoose);
mongoose.connect = (...args) => { connectArgs = args; return originalConnect(...args); };

const PORT = Number(process.env.PORT || 5000);

export class ApiServer extends DurableObject {
  async fetch(request) {
    this.lastSeen = Date.now();
    if (connectArgs && mongoose.connection.readyState === 0) {
      try { await originalConnect(...connectArgs); } catch (e) { console.error("reconnect failed", e?.message); }
    }
    if (!this.alarmSet) {
      this.alarmSet = true;
      this.ctx.storage.setAlarm(Date.now() + IDLE_MS).catch(() => { this.alarmSet = false; });
    }
    // Importing the server module starts Express (app.listen) and connects to MongoDB once.
    this.ready ??= import("./src/server.js").catch((e) => { this.ready = undefined; throw e; });
    try {
      await this.ready;
      return await handleAsNodeRequest(PORT, request);
    } catch (e) {
      console.error("API error:", e?.stack || e);
      return Response.json({ message: "Server error" }, { status: 500 });
    }
  }

  async alarm() {
    const idle = Date.now() - (this.lastSeen ?? 0);
    if (idle < IDLE_MS) {
      await this.ctx.storage.setAlarm((this.lastSeen ?? Date.now()) + IDLE_MS);
      return;
    }
    this.alarmSet = false;
    // Close the database, but never wait more than 5 s for it…
    if (mongoose.connection.readyState !== 0) {
      await Promise.race([mongoose.disconnect().catch(() => {}), new Promise((r) => setTimeout(r, 5000))]);
    }
    // …then evict this object from memory. Closing the connection alone was not enough: leftover sockets/timers kept
    // the object resident (and billed) for 15–20 hours a day with no requests, exhausting the free daily duration.
    // Deferred so this alarm completes normally (an abort inside it would count as a failure and be retried).
    // The next request simply starts a fresh object and reconnects.
    setTimeout(() => { try { this.ctx.abort("idle"); } catch {} }, 100);
  }
}


export default {
  async fetch(request, env) {
    const stub = env.API_SERVER.get(env.API_SERVER.idFromName("main"), { locationHint: "apac" });
    return stub.fetch(request);
  },
}
