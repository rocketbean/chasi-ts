import { ExceptionProperty } from "../Interfaces.js";

export default class Exception extends Error {
  public invoker: any;
  public commonInvoker: string[] = [
    "ErrorHandler.handle",
    "Server/Consumer",
    "processTicksAndRejections",
  ];

  constructor(public property: ExceptionProperty) {
    super(property.message);
    if (property instanceof Error) this.stack = property.stack;
    const actualProto = new.target.prototype;
    this.commonInvoker.push(this.constructor.name);
    this.commonInvoker.push(property.message);
    this.invoker = this.setInvoker();
    Object.setPrototypeOf(this, new.target.prototype);
    this.property = property;
  }

  setInvoker() {
    let stack = this.stack
      .split("\n")
      .filter(
        (line: string) =>
          !this.commonInvoker.find((common) => line.includes(common)),
      )[0];
    let checkPath = stack.split("/");
    if (checkPath.length > 0) {
      let path = checkPath[checkPath.length - 1]
        .replace(/\)|\(|.js/g, "")
        .split(":");
      return `${path[0]}@${path[1]}`;
    }
    return this.constructor.name;
  }
}
