import { serverConfig } from "../package/framework/Interfaces.js";

export default {
  staticDir: "storage",
  port: checkout(process.env.port, 3000),
  environment: checkout(process.env.environment, "local"),
  /**
   * check NPM[Cors] package
   * https://www.npmjs.com/package/cors
   */
  cors: {
    enabled: true,
    origin: "*",
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Access-Control-Allow-Methods",
      "Access-Control-Request-Headers",
    ],
    credentials: true,
    enablePreflight: true,
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
