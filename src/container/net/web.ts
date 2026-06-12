import { SocketRouter } from "../modules/SocketServer/NetServer.js";
import Channel from "../modules/SocketServer/lib/Channel.js";

export default (server: SocketRouter) => {
  // ── Lifecycle ─────────────────────────────────────────────────────────
  server.on("connect", (_, client) => {
    Logger.log(`WS connected   id=${client.id} user=${client.user?.id ?? "anon"}`);
    client.sendEvent("connected", { id: client.id });
  });

  server.on("disconnect", (_, client) => {
    Logger.log(`WS disconnected id=${client.id}`);
  });

  // ── Broadcast to all connected clients ────────────────────────────────
  server.on("broadcast", (payload, client) => {
    server.clients.forEach((c) => c.sendEvent("broadcast", payload));
  });

  // ── Channel: join ─────────────────────────────────────────────────────
  server.on("channel:join", (payload, client) => {
    const { name } = payload;
    if (!name) return client.sendEvent("error", { message: "channel name required" });
    const ch = Channel._create(name, { path: server.path });
    ch.subscribe(client);
    client.sendEvent("channel:joined", { name });
  });

  // ── Channel: leave ────────────────────────────────────────────────────
  server.on("channel:leave", (payload, client) => {
    const { name } = payload;
    const ch = Channel.get(name);
    if (ch) ch.unsubscribe(client);
    client.sendEvent("channel:left", { name });
  });

  // ── Channel: send to a specific channel ───────────────────────────────
  server.on("channel:send", (payload, client) => {
    const { name, data } = payload;
    const ch = Channel.get(name);
    if (!ch) return client.sendEvent("error", { message: `channel "${name}" not found` });
    ch.send(data, { path: server.path });
  });

  // ── Ping / pong (manual, separate from WS protocol heartbeat) ─────────
  server.on("ping", (_, client) => {
    client.sendEvent("pong", { ts: Date.now() });
  });
};
