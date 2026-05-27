import { ObserverConfig } from "../package/Observer/index.js";

/**
 * Observer configuration (`src/config/observer.ts`).
 *
 * Loaded by `Handler` and passed to `new Observer(config)`. Controls which
 * application Event classes are registered and optional global hooks around
 * every event's `fire()` pipeline.
 *
 * @see `ObserverConfig` — `{ events, beforeEmit, afterEmit }` in `package/Observer/index.ts`
 * @see `events` — `Record<string, string>` alias → path relative to `src/`
 * @see `EventInterface` — contract for classes under `container/events/`
 *
 * **Registration** — Custom events are only available after you add them here.
 * `emit("myEvent")` has no handler until the alias is listed and the app has restarted.
 *
 * **Execution** — Events run on the async emitter, isolated from the HTTP request.
 * In controllers, calling `emit()` without `await` lets the response return while
 * `validate` → `fire` → listeners still run in the background.
 */
export default <ObserverConfig>{
  /**
   * Named event registry (`events` type: `Record<string, string>`).
   *
   * **Required for custom events.** Only aliases listed here are loaded at boot and
   * can be passed to `$observer.emit()`. Add the class under `container/events/`,
   * map the alias to its path, then restart (or rely on dev reload).
   *
   * Maps an event **alias** (first argument to `$observer.emit`) to the path of
   * its Event class file, relative to `src/` and without a file extension.
   * Resolved at boot in `Observer.setup()` via dynamic import.
   *
   * @example
   * ```ts
   * events: {
   *   authorized: "container/events/Authorize",
   * }
   * // later in a controller:
   * await this.$observer.emit("authorized", { userId: "..." });
   * ```
   *
   * Each class must extend `Event` and implement `EventInterface`
   * (`package/Observer/Event.ts`).
   */
  events: {
    authorized: "container/events/Authorize",
  },

  /**
   * Global `beforeEmit` hook — runs in `Event.onemit()` before `fire()`.
   *
   * Applies to every registered event whose class does **not** define its own
   * `onemit()` / `beforeEmit`. Use for cross-cutting setup: tracing, shared
   * validation context, or structured logging.
   *
   * - `this` — the `Event` instance
   * - `params` — payload passed to `$observer.emit(alias, params)`
   */
  beforeEmit: async function (params) {},

  /**
   * Global `afterEmit` hook — runs in `Event.emitted()` after `fire()` and
   * `when()` listeners complete.
   *
   * Applies unless the event class overrides `emitted()` / `afterEmit`.
   * Use for audit logs, metrics, or cleanup.
   *
   * - `this` — the `Event` instance
   * - `params` — same payload from `emit()`
   */
  afterEmit: async function (params) {},
};
