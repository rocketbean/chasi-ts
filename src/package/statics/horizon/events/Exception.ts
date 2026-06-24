import Event from "./../../../Observer/Event.js";

export default class Exception extends Event {
  async validate(_params: Record<string, unknown>, next: () => void): Promise<void> {
    next();
  }

  async fire(params: Record<string, unknown>): Promise<void> {
    const exc = params.exception as Record<string, unknown>;
    if (exc.interpose !== 1) {
      (() => {
        if ((($app as Record<string, unknown>).state as number) < 4) {
          setTimeout(() => this.fire(params), 100);
        } else {
          if (!(exc.property as Record<string, unknown>).hide) {
            (exc.log as Function)();
          }
        }
      })();
    } else {
      (exc.log as Function)();
    }
  }

  async onemit(): Promise<void> {}
  async emitted(): Promise<void> {}
}
