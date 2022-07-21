import Exception from "../Exception.js";
import { AppException, ExceptionProperty } from "../../Interfaces.js";

export default class APIException extends Exception implements AppException {
  /**
   * [interpose] as ErrorResponse types: [2] as default
   *              ---------------------------------------
   * [1]Log      | immediately logs the error,
   * [2]Warn     | only show logs after app is booted,
   * [3]Break    | drops the invoker instance
   *              ---------------------------------------
   */
  constructor(
    public property: ExceptionProperty,
    public interpose: string | number = 2,
  ) {
    super(property);
    this.interpose = property.interpose ? property.interpose : this.interpose;
  }
}
