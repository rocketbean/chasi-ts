import { RouteGroupProperty } from "../Interfaces.js";
import { ObjectId } from "mongodb";
export default class Group {
  public property: RouteGroupProperty = {
    middleware: [],
    prefix: "",
    controller: "",
    before: async (): Promise<void> => {},
    after: async (): Promise<void> => {},
  };

  id: string = new ObjectId().toString();

  constructor(property) {
    Object.assign(this.property, property);
  }
}
