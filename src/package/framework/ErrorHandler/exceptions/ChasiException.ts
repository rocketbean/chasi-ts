import Exception from "../Exception.js";
import { AppException, ExceptionProperty } from "../../Interfaces.js";

export default class ChasiException extends Exception implements AppException {
  /**
   * [interpose] as ErrorResponse types: [2] as default
   *              ---------------------------------------
   * [1]Log      | immediately logs the error,
   * [2]Warn     | only show logs after app is booted,
   * [3]Break    | drops the invoker instance,
   * [4]Stop     | stops the parent invoker,
   * [5]severe   | breaks all the process
   *              ---------------------------------------
   */
  constructor(
    public property: ExceptionProperty,
    public interpose: string | number = 1,
  ) {
    super(property);
    this.interpose = property.interpose ? property.interpose : this.interpose;
  }
}
