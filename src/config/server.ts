import { serverConfig } from "../package/framework/Interfaces.js";
import os from "os";

export default {
  staticDir: "storage",
  port: checkout(process.env.ServerPort, 3010),
  environment: checkout(process.env.environment, "local"),
  /**
   * check NPM[Cors] package
   * https://www.npmjs.com/package/cors
   */
  cors: {
    origin: "*",
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Access-Control-Allow-Methods",
      "Access-Control-Request-Headers",
    ],
    credentials: false,
    enablePreflight: true,
  },

  serviceCluster: {
    enabled: true,
    workers: os.cpus().length,
  },

  /**
   * you can setup your own server environment
   * and add that inside [mode] property
   * change the [environment] property to the desired
   * selection, just keep make sure that the selected
   * environment is registered here...
   */

  modes: {
    dev: {
      key: checkout(process.env.devKey),
      cert: checkout(process.env.devCert),
      protocol: "https",
    },
    local: {
      key: checkout(process.env.SSLcontainerKeyLocal),
      cert: checkout(process.env.SSLcontainerKeyLocal),
      protocol: "http",
    },
  },
} as serverConfig;
