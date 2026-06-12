import { Iobject } from "../../../../package/framework/Interfaces.js";
import { v4 as uuidv4 } from "uuid";

export default class Client {
  public id = uuidv4();
  public user: any = null;
  public _alive = true;

  constructor(public socket, public request?, public property: Iobject = {}) {}

  get isOpen(): boolean {
    return this.socket.readyState === 1;
  }

  send(payload: any): void {
    if (!this.isOpen) return;
    this.socket.send(typeof payload === "string" ? payload : JSON.stringify(payload));
  }

  sendEvent(event: string, payload: any): void {
    this.send(JSON.stringify({ event, payload }));
  }

  close(code = 1000, reason = ""): void {
    this.socket.close(code, reason);
  }
}
