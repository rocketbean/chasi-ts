import Event from "./../../../Observer/Event.js";
import RouterModule from "./../../../framework/Router/RouterModule.js";

export default class BootApp extends Event {
  async validate(params: Record<string, unknown>, next: () => void): Promise<void> {
    const app = params.app as Record<string, unknown>;
    app.state = 4;
    const routers = (app.$modules as Record<string, unknown>).RouterModule as RouterModule;
    await routers.consume();
    await routers.logRouter();
    next();
  }

  async fire(params: Record<string, unknown>): Promise<void> {
    await (params.next as Function)();
  }
  async onemit(): Promise<void> {}
  async emitted(): Promise<void> {}
}
