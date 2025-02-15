import { Iobject } from "../Interfaces.js";


export type ServerHooks = {
  beforeApp?: any;
};

export type corsConfig = {
  [key: string]: any,
  origin: string,
  allowedHeaders: string[],
  credentials: boolean,
  enablePreflight: boolean,
  optionsSuccessStatus?: number
}

export type serviceClusterConfig = {
  /** *enabled
  * enable/disable nodejs
  * service clustering
  */
  enabled: boolean,

  /** *trackUsage
  * options for logging
  * resource usage of workers
  */
  trackUsage?: {
    /** *trackUsage.enabled
    * enable/disable logging
    */
    enabled: boolean,

    /** *trackUsage.interval
    *  unit [ms]
    * logging frequency
    */
    interval: number,
  },

  /** *logs
  * logs worker
  * thread information
  */
  logs: true,

  /** *workers
  * numbers of worker
  * thread to assign;
  * performance gain will depend of
  * the type/numbers of cpu's available
  * NOTE
  * do not max out numbers of CPU available
  * as it will utilize all available core/s.
  * and might affect performance specifically
  * on async tasks.
  */
  workers: number,

  /** *settings
  * settings to apply to the cluster. check
  * https://nodejs.org/docs/latest/api/cluster. html#clustersetupprimarysettings
  */
  settings: {},

  /** *schedulingPolicy
  * {1} none - this is typically left on the OS, 
  *   to distribute tasks.
  * {2} RoundRobin - round robin approach where requests will be 
  *   assigned in sequence
  */
  schedulingPolicy: 1 | 2,
}

export type serverModeConfig = {
  [key: string]: {

    /** ?key
    * string path to ssl key
    */
    key?: string,

    /** ?cert
    * string path to ssl cert
    */
    cert?: string,

    /** ?protocol
    * http protocol option
    */
    protocol: "http" | "https"
  }
}

export type serverConfig = {

  /** *port
  * port number to be used
  * by the server
  */
  port: number;

  /** environment
  * environment setup
  */
  environment: "dev" | "prod";

  /**
   * you can setup your own server environment
   * and add that inside [mode] property
   * change the [environment] property to the desired
   * selection, just keep make sure that the selected
   * environment is registered here...
   */
  modes: serverModeConfig;

  /** CorsOption
  * Cors setup
  * ref: https://www.npmjs.com/package/cors#configuring-cors
  */
  cors: corsConfig;

  /** hooks {Object} lifecycle hook
   * @beforeApp {function} beforeApp
   * hook will be executed before 
   * chasi instantiate ServerSession.
   * this is useful if somehow a module
   * needs to execute something before
   * server processes. 
   * e.g. CompilerEngine, 
   * managing service clusters
   */
  hooks?: ServerHooks;

  /** ?statidDir
  * a static directory to be served
  */
  staticDir?: string;

  /** ?serviceCluster
  * server clustering 
  * configurations.
  */
  serviceCluster?: serviceClusterConfig;

};