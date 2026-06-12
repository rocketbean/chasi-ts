# SocketServer Module

WebSocket support for chasi-ts, built on the native `ws` library. Piggybacks on the existing HTTP server — no separate port needed.

---

## Architecture

```
SocketServiceProvider
  └── NetServer              — routes upgrade requests to the right SocketRouter
        └── SocketRouter     — one WebSocketServer per path, EventEmitter-based
              ├── Client     — wraps each connected socket
              └── Channel    — named pub/sub groups of clients
```

---

## Quick Start

### 1. Register a router in `SocketServiceProvider.ts`

```ts
async boot() {
  new SocketRouter("/", {
    container: "container/net/web",  // event handler file
    heartbeat: 30000,                // ping clients every 30s (0 = off)
  });
  return this.netserver;
}
```

### 2. Define event handlers in your container file

```ts
// src/container/net/web.ts
import { SocketRouter } from "../modules/SocketServer/NetServer.js";

export default (server: SocketRouter) => {
  server.on("connect", (_, client) => {
    client.sendEvent("connected", { id: client.id });
  });

  server.on("my:event", (payload, client) => {
    // client may be undefined when this fires on a non-originating cluster worker
    if (!client) return;
    client.sendEvent("my:response", { ok: true });
  });
};
```

### 3. Connect from the browser

```js
const ws = new WebSocket("ws://localhost:3000/");

ws.onopen = () => {
  ws.send(JSON.stringify({ event: "my:event", payload: { hello: "world" } }));
};

ws.onmessage = (e) => {
  const { event, payload } = JSON.parse(e.data);
  console.log(event, payload);
};
```

---

## Message Format

All messages are JSON with `event` and `payload` fields.

**Client → Server:**
```json
{ "event": "channel:join", "payload": { "name": "room-1" } }
```

**Server → Client:**
```json
{ "event": "channel:joined", "payload": { "name": "room-1" } }
```

---

## SocketRouter Options

```ts
new SocketRouter("/path", {
  container: "container/net/myEvents",  // required
  heartbeat: 30000,                     // ms between pings; 0 to disable (default: 30000)
  auth: async (request) => {            // optional — throw to reject with 401
    const token = new URL(request.url, "http://x").searchParams.get("token");
    if (!token) throw new Error("missing token");
    return await Authorization.$drivers["dev"].verify(token);
  },
});
```

### Auth

When `auth` is provided it runs before the WebSocket handshake. Return the user object to allow the connection — it becomes `client.user` in all handlers. Throw anything to reject with HTTP 401.

```ts
server.on("connect", (_, client) => {
  console.log(client.user); // { id, email, ... }
});
```

### Heartbeat

Pings every connected client on the interval. Clients that do not pong back are terminated and removed. This cleans up ghost connections from network drops or tab closures without a clean `close` event.

---

## Client API

| Property / Method | Description |
|---|---|
| `client.id` | UUID assigned on connect |
| `client.user` | User returned by the `auth` hook (`null` if no auth) |
| `client.isOpen` | `true` if socket is still open |
| `client.send(payload)` | Send raw string or object (auto-serialised to JSON) |
| `client.sendEvent(event, payload)` | Send `{ event, payload }` JSON |
| `client.close(code?, reason?)` | Close the connection cleanly |

---

## Channel API

Channels are named pub/sub groups. Clients subscribe themselves; send broadcasts the message to the whole group.

```ts
import Channel from "../modules/SocketServer/lib/Channel.js";

// Create or get a channel
const ch = Channel._create("room-1", { path: "/" });

// Subscribe / unsubscribe a client
ch.subscribe(client);
ch.unsubscribe(client);

// Broadcast to all subscribers
ch.send({ text: "hello room" }, { path: "/" });

// Look up an existing channel by name or id
const ch = Channel.get("room-1");
```

### Built-in channel events (from `web.ts`)

| Client sends | Payload | Effect |
|---|---|---|
| `channel:join` | `{ name }` | Subscribes client to the named channel |
| `channel:leave` | `{ name }` | Unsubscribes client |
| `channel:send` | `{ name, data }` | Broadcasts `data` to all channel subscribers |

---

## Lifecycle Events

Emitted automatically — handle them in your container file.

| Event | When | Signature |
|---|---|---|
| `connect` | Client completes handshake | `(_, client) => void` |
| `disconnect` | Client closes or errors | `(_, client) => void` |

---

## Multiple Routers

```ts
async boot() {
  new SocketRouter("/chat",          { container: "container/net/chat" });
  new SocketRouter("/notifications", { container: "container/net/notifications" });
  return this.netserver;
}
```

Each router has its own isolated client list, channels, and event handlers.

---

## Emitting from Outside the Container

From a controller or any service:

```ts
// Observer-based (NS[ prefix required)
SocketRouter.$observer.emit("NS[my:event]", { data: "hello" });

// Channel broadcast
import Channel from "../modules/SocketServer/lib/Channel.js";
Channel.get("room-1")?.send({ text: "server push" }, { path: "/" });
```

---

## Cluster Support (`serviceCluster.enabled: true`)

When clustering is on, each worker runs its own `SocketRouter` and owns a subset of the connected clients. The pipe system synchronises events across workers automatically.

### How it works

```
Worker A  ──(websock:event)──▶  Primary  ──(socket:fire)──▶  Workers B, C, D
   ↑                                                               ↓
fires locally                                          fires on each worker
(client gets response)                             (reaches their clients)
```

1. Worker A receives a WS message and fires the event **locally** immediately — the connected client gets a response without waiting for the round-trip.
2. Worker A writes the event to the pipe (`websock:event`).
3. The primary receives it and forwards `socket:fire` to **all other workers** (A is excluded to prevent double-firing).
4. Workers B, C, D fire the event on their local `SocketRouter` — their connected clients receive it too.

### Important: `client` is `undefined` on non-originating workers

When an event fires via the pipe broadcast, there is no `client` — the client object lives only on the worker that owns the connection. Always guard:

```ts
server.on("my:event", (payload, client) => {
  // request/response — only reply to the connected client
  if (client) {
    client.sendEvent("response", { ok: true });
  }

  // broadcast to all local clients — works on every worker
  server.clients.forEach((c) => c.sendEvent("update", payload));
});
```

### Channel broadcasts in cluster mode

`Channel.send()` writes to the pipe and returns — the pipe triggers `_send()` on all workers. Do **not** call `_send()` directly unless you intentionally want to skip cluster sync.

```ts
// correct — syncs across all workers
ch.send(payload, { path: "/" });

// only sends to clients on this worker
ch._send(payload, { path: "/" });
```

### NS[ observer events in cluster mode

Observer events prefixed with `NS[` are emitted locally on the worker that received the message. If you need them on all workers, emit them inside a `socket:fire` handler (which fires on all workers via the pipe).
