import Driver, { DBDriverInterface } from "./drivers.js";

export default class MongoDBDriver extends Driver implements DBDriverInterface {
  async connect(connection) {}
}
