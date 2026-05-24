import Event from "./../../../Observer/Event.js";
import RouterModule from "../../../framework/Router/RouterModule.js";

export default class InitializeApp extends Event {
  async validate(params: Record<string, unknown>, next: () => void): Promise<void> {
    const app = params.app as Record<string, unknown>;
    app.state = 2;
    const routers = (app.$modules as Record<string, unknown>).RouterModule as RouterModule;
    (app.$app as Record<string, unknown>).$routers = routers.routers;
    next();
  }

  async fire(params: Record<string, unknown>): Promise<void> {
    await (params.next as Function)();
  }
  async onemit(): Promise<void> {}
  async emitted(): Promise<void> {}
}
