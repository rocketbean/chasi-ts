import Exception from "../Exception.js";
import { AppException, ExceptionProperty } from "../../Interfaces.js";
import chalk from "chalk";
export default class SocketException extends Exception implements AppException {
  /**
   * [interpose] as ErrorResponse types: [2] as default
   *              ---------------------------------------
   * [1]Log      | immediately logs the error,
   * [2]Warn     | only show logs after app is booted,
   * [3]Break    | drops the invoker instance
   *              ---------------------------------------
   */
  public writer;
  public trace;
  constructor(
    public property: ExceptionProperty,
    public status: string | number,
    public SocketRouter: any,
    public interpose: string | number = 2,
  ) {
    super(property);
    this.interpose = property.interpose ? property.interpose : this.interpose;
    this.writer = Logger.writers["Left"];
    this.trace = Logger.writers["EndTrace"];
  }

  /**
   * calls the write method
   * of a specified ExceptionWriter
   * @param includeStack ErrorStack
   */
  log() {
    // let message = `├── Throw @[${this.SocketRouter.controller}::${this.ep.method}()]`;
    // message += `\n  ├── thrown APIException::class `;
    // message += `\n  ├── ServerResponded @${this.status}: ${this.property.message} \n`;
    // if (this.property instanceof Error) {
    //   message += `  ├── ${this.property.stack} \n\n`;
    // }
    // this.writer.write(chalk.yellowBright(message), "clear", "exceptions");
  }
}
