import { DatabaseConfig } from "../package/framework/Interfaces.js";

export default <DatabaseConfig> {
  host: checkout(process.env.database, "local"),

  /** 
  * throws an error if one of 
  * the specified DB 
  * connections failed
  */
  bootWithDB: false,

  /** 
  * hides the 
  * connection string
  */
  hideLogConnectionStrings: true,

  /** 
  * this option will be used as
  * a default DB for models
  * that did not specify 
  * a DB connection.
  */
  default: checkout(process.env.database, "local"),
  /**
   * *------------- [ Database Connections ] ---------------*
   * | all instances declared will automatically            |
   * | connected once boot started, Model connections       |
   * | will try to connect on the default connection that   |
   * | is set. [Model] connection can be altered in the     |
   * | model itself.                                        |
   * *------------------------------------------------------*
   *
   */

  connections: {
    /**
     * *--------------- { DatabaseAdapter } ------------------*
     * | $getConnection('ConnectionName': String) function    |
     * | [ConnectionName]will be switch to default            |
     * | if the declaration is non-existent                   |
     * | to chasi's current connections                       |
     * ********************************************************
     *
     */
    dev: {
      driver: "mongodb",
      url: process.env.dbConStringDev,
      db: process.env.devDatabaseName,
      params: "?authSource=admin",
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        connectTimeoutMS: 1000,
        socketTimeoutMS: 1000,
        serverSelectionTimeoutMS: 5000,
      },
    },

    test: {
      driver: "mongodb",
      url: process.env.dbConStringDev,
      db: "dbmocks",
      params: "?authSource=admin",
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        connectTimeoutMS: 1000,
        socketTimeoutMS: 1000,
        serverSelectionTimeoutMS: 5000,
      },
    },

    local: {
      driver: "mongodb",
      url: process.env.dbConStringLocal,
      db: process.env.databaseName,
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        connectTimeoutMS: 4000,
        socketTimeoutMS: 4000,
        serverSelectionTimeoutMS: 5000,
      },
    },
  },

  /** modelsDir -
   * Chasi will autoload this dirs,
   * look for models / schemas
   * then bind it to
   * [Event|Controller]Class
   */
  modelsDir: ["./container/models/"],
};
