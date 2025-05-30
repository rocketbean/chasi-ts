declare module "Chasi/Database" {
  import { Prisma, PrismaClient } from "@prisma/client";
  export type drivers = "prisma" | "mongodb";

  export interface DBDriverInterface {
    config: DBProperty<drivers, U>;
    connection: any;
    isDefaultDB: boolean;
    driverName: drivers;
    driver?: any;
    connect(a?: any): void;
  }

  export interface DatabaseDrivers {
    [key: string]: DBDriverInterface;
  }

  export type PrismaOptions<U> = {
    useDynamicPrismaClient: boolean;
    client: string;
    dims?: PrismaClient;
  };

  export type MongoDBOptions<U> = {
    connectTimeoutMS: number;
    socketTimeoutMS: number;
    serverSelectionTimeoutMS: number;
  };

  export type DBProperty<drivers, U = null> = {
    driver: drivers;
    url: string;
    db: string;
    params?: string;
    hideLogConnectionStrings?: boolean;
    options: PrismaOptions<U> | MongoDBOptions<U>;
  };

  export type DatabaseConfig = {
    /**
     * Connection name
     * declared in
     * [DatabaseConfig.connections]
     */
    host: string;

    /**
     * will throw an
     * execution error
     * if one of the DB connections
     * failed to connect
     */
    bootWithDB: boolean;

    /**
     * the default connection
     * to be used by the models
     * if none is specified
     */
    default: string;

    /**
     * hides the connection
     * string in terminal
     * logging
     */
    hideLogConnectionStrings: boolean;

    /**
     * this is where database connections
     * should be declared.
     */
    connections: Record<string, DBProperty<drivers, U>>;
  };
}
