import Event from "./../../../Observer/Event.js";

export default class AfterApp extends Event {
  async validate(_params: Record<string, unknown>, next: () => void): Promise<void> {
    next();
  }

  async fire(params: Record<string, unknown>): Promise<void> {
    const app = params.app as Record<string, unknown>;
    await (app.$app as Record<string, unknown> & { consumeLayers: () => Promise<void> }).consumeLayers();
    await (params.next as Function)();
  }

  async onemit(): Promise<void> {}
  async emitted(): Promise<void> {}
}
