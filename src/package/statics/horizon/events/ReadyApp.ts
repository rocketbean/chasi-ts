import Event from "./../../../Observer/Event.js";

export default class ReadyApp extends Event {
  async validate(_params: Record<string, unknown>, next: () => void): Promise<void> {
    next();
  }

  async fire(_params: Record<string, unknown>): Promise<void> {}
  async onemit(): Promise<void> {}
  async emitted(): Promise<void> {}
}
