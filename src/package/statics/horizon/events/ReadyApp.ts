import Event from "./../../../Observer/Event.js";
import SessionStorage from "../../../framework/Chasi/Storage.js";
export default class ReadyApp extends Event {
  async validate(_params: Record<string, unknown>, next: () => void): Promise<void> {
    next();
  }

  async fire(_params: Record<string, unknown>): Promise<void> {}
  async onemit(): Promise<void> {
    SessionStorage.state = 1;
  }
  async emitted(): Promise<void> {}
}
