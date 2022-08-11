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

  /**
   * Enables Clustering for the api
   * Chasi instace will be invoked
   * on the number of workers decalared
   * at serviceCluster[workers],
   * it will be equal to the available
   * cpus by default.
   *
   *  ----------------------------------------------------------
   * enabled[boolean]:  enables the clustering
   * logs[boolean]: logs the cluster when enabled
   * workers[number]:   number or workers to assign in a cluster
   * settings[object]:  settings to apply to the cluster. check
   * https://nodejs.org/docs/latest/api/cluster.html#clustersetupprimarysettings
   *
   * schedulingPolicy[number]:  [1|2]
   *  [1] none - this is typically left on the OS, to distribute tasks.
   *  [2] RoundRobin - round robin approach where requests will be assigned in sequence
   *
   * ** please note that in windows, using [2]round robin scheduling might not
   * as good as it was intended. **
   */

  serviceCluster: {
    enabled: false,
    logs: false,
    workers: os.cpus().length,
    settings: {},
    schedulingPolicy: 2,
  },

  /**
   * you can setup your own server environment
   * and add that inside [mode] property
   * change the [environment] property to the desired
   * selection, just keep make sure that the selected
   * environment is registered here...
   *
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
