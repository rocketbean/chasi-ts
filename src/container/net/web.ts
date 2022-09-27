import { SocketRouter } from "../modules/SocketServer/NetServer.js";

export default (server: SocketRouter) => {
  server.on("trigger", (payload) => {
    server.clients.map((client) => client.send(payload));
  });

  server.on("broadcast", (payload) => {
    server.clients.map((client) => client.send(payload));
  });
};
