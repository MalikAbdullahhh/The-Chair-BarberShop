// Cloudflare Workers entry for an existing Express API.
// The Express app runs inside a single Durable Object so its MongoDB (mongoose)
// connection stays open between requests (plain Workers cannot reuse sockets).
import { DurableObject } from "cloudflare:workers";
import { handleAsNodeRequest } from "cloudflare:node";

const PORT = Number(process.env.PORT || 5000);

export class ApiServer extends DurableObject {
  async fetch(request) {
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
}

export default {
  async fetch(request, env) {
    const stub = env.API_SERVER.get(env.API_SERVER.idFromName("main"), { locationHint: "apac" });
    return stub.fetch(request);
  },
};
