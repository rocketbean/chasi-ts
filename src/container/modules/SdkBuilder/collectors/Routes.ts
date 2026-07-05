import Router from "../../../../package/framework/Router/Router.js";
import RouterModule from "../../../../package/framework/Router/RouterModule.js";
import Authentication from "../../../../package/framework/Server/Authentication.js";
import Endpoint from "../../../../package/framework/Router/Endpoint.js";
import type { RouteExceptions } from "Chasi/Router";
import type { SdkBuilderOutput, SdkBuilderTyped, SdkRouteEntry, SdkRouterFilter, SdkRouterSelector } from "../SdkBuilder.types.js";

// ─── RouteCollector ───────────────────────────────────────────────────────────

export default class RouteCollector {
  entries: SdkRouteEntry[] = [];

  /** Typed-output context, populated only in build mode when typed.enabled. */
  private typed: SdkBuilderTyped | null = null;
  private signatures: (typeof import("./Signatures.js"))["default"] | null = null;

  get routes(): SdkRouteEntry[] {
    return this.entries;
  }

  async init(output: SdkBuilderOutput): Promise<void> {
    this.entries = [];
    await this.prepareTyped(output);

    const routerModule = ($app as { $modules: { RouterModule: RouterModule } })
      .$modules.RouterModule;

    const selectors = this.normalizeSelectors(output.routers);

    // No selectors → include every registered router (whole router, no filter).
    if (!selectors.length) {
      for (const router of routerModule.routers) {
        this.collectFromRouter(router, output);
      }
    } else {
      for (const selector of selectors) {
        const router = routerModule.routers.find(
          (r) => r.property.name === selector.router
        );
        if (!router) {
          Logger.log(
            `[SdkBuilder] router "${selector.router}" not found — skipping selector`
          );
          continue;
        }
        this.collectFromRouter(
          router,
          output,
          selector.filter,
          selector.namespace,
          selector.naming
        );
      }
    }

    this.reportUntyped();
  }

  /** Normalises the mixed `string | object` routers config into selector objects. */
  private normalizeSelectors(
    routers: SdkBuilderOutput["routers"]
  ): SdkRouterSelector[] {
    if (!routers?.length) return [];
    return routers.map((r) => (typeof r === "string" ? { router: r } : r));
  }

  // ─── Per-router ────────────────────────────────────────────────────────────

  private collectFromRouter(
    router: Router,
    output: SdkBuilderOutput,
    filter?: SdkRouterFilter,
    routerNamespace?: string,
    naming?: SdkRouterSelector["naming"]
  ): void {
    const routerAuth = router.property.auth;
    const routerExceptions: RouteExceptions[] = router.property.AuthRouteExceptions ?? [];

    const driverExceptions: RouteExceptions[] =
      routerAuth && typeof routerAuth === "string"
        ? (Authentication.$drivers[routerAuth]?.property
            ?.AuthRouteExceptions as RouteExceptions[]) ?? []
        : [];

    const allExceptions = [...routerExceptions, ...driverExceptions];

    for (const endpoint of router.$registry.routes) {
      const method = endpoint.property.method as string;

      if (this.isExcluded(endpoint.path, method, output.exclude ?? [])) continue;
      if (filter && !this.passesFilter(filter, endpoint)) continue;

      const entry = this.buildEntry(
        endpoint,
        router,
        routerAuth,
        allExceptions,
        routerNamespace,
        naming
      );
      this.entries.push(entry);
    }
  }

  /** Runs a selector's filter defensively — a throw excludes the endpoint (logged). */
  private passesFilter(filter: SdkRouterFilter, endpoint: Endpoint): boolean {
    try {
      return !!filter(endpoint);
    } catch (err) {
      Logger.log(
        `[SdkBuilder] router filter threw for ${endpoint.path} — excluding endpoint: ${err}`
      );
      return false;
    }
  }

  // ─── Entry builder ─────────────────────────────────────────────────────────

  private buildEntry(
    ep: Endpoint,
    router: Router,
    routerAuth: string | boolean | null,
    exceptions: RouteExceptions[],
    routerNamespace?: string,
    naming?: SdkRouterSelector["naming"]
  ): SdkRouteEntry {
    const method = ep.property.method as string;
    const isPublic =
      !routerAuth ||
      exceptions.some((e) => e.url === ep.path && e.m === method);

    const effectiveMw = ep.middlewares.filter(
      (mw) => !ep.excludeFromMw.includes(mw)
    );

    const namespace = this.deriveResourceNamespace(
      ep.path,
      router.property.prefix
    );
    // Function name source: "http" → verb; "controller" (default) → controller
    // method, falling back to the verb for function-bound routes.
    const functionName =
      naming === "http"
        ? method.toLowerCase()
        : ep.method && ep.method !== "Function"
          ? ep.method
          : method.toLowerCase();

    const entry: SdkRouteEntry = {
      path: ep.path,
      method,
      isProtected: !isPublic,
      middlewares: effectiveMw,
      hasSdkHandlers: ep.$sdkHandlers.length > 0,
      sdkHandlers: ep.$sdkHandlers,
      requiredFields: this.extractRequiredFields(ep),
      namespace,
      functionName,
      routerNamespace,
    };

    // Typed output (build mode only): resolve request/response FQNs. Manifest
    // entries win over parser-derived types; misses leave the fields undefined
    // so the Compiler emits fallback types.
    if (this.typed && this.signatures) {
      const key = `${method.toLowerCase()} ${ep.path}`;
      const override = this.typed.manifest?.[key] ?? {};
      const parsed = this.signatures.resolve(ep, ep.method, this.typed);
      entry.reqType = override.req ?? parsed.req;
      entry.resType = override.res ?? parsed.res;
    }

    return entry;
  }

  // ─── Typed output (build-mode only) ──────────────────────────────────────────

  /**
   * Load the signature parser when typed output is enabled AND we're in build
   * mode. `Signatures` statically imports `typescript`, so it is imported here
   * dynamically — never on the server-boot runtime path.
   */
  private async prepareTyped(output: SdkBuilderOutput): Promise<void> {
    this.typed = null;
    this.signatures = null;
    if (!globalThis.__chasiBuild || !output.typed?.enabled) return;
    try {
      const mod = await import("./Signatures.js");
      mod.default.reset();
      this.signatures = mod.default;
      this.typed = output.typed;
    } catch (err) {
      Logger.log(
        `[SdkBuilder] typed output enabled but the signature parser failed to load — emitting untyped: ${err}`
      );
    }
  }

  /**
   * Summarise included routes that fell back to untyped (a body route with no
   * request type, or any route with no response type). Logs one line; when
   * `typed.strict` is set, throws instead so `npm run build` fails (exit 1).
   */
  private reportUntyped(): void {
    if (!this.typed) return;
    const bodyless = new Set(["get", "delete", "head"]);
    const fell = this.entries.filter((e) => {
      const needsBody = !bodyless.has(e.method.toLowerCase());
      return (needsBody && !e.reqType) || !e.resType;
    });
    if (!fell.length) return;
    const list = fell.map((e) => `${e.method.toUpperCase()} ${e.path}`).join(", ");
    const msg = `[SdkBuilder] ${fell.length} route(s) fell back to untyped: ${list}`;
    if (this.typed.strict) throw new Error(`${msg} (typed.strict)`);
    Logger.log(msg);
  }

  // ─── Required field extraction from spec ───────────────────────────────────

  private extractRequiredFields(ep: Endpoint): string[] {
    try {
      const schema = (ep.spec as any)?.requestBody
        ?.content?.["application/json"]?.schema;
      return Array.isArray(schema?.required) ? (schema.required as string[]) : [];
    } catch {
      return [];
    }
  }

  // ─── Namespace + function name derivation ──────────────────────────────────

  /**
   * Resource namespace derivation. Strips the router prefix (tolerating a
   * leading-slash mismatch), then takes the first non-param segment as the
   * resource, nested under a leading version segment when present. Deeper path
   * segments fold in (they're distinguished by the function name):
   *
   *   prefix "api", /api/users/signin         → ["users"]
   *   prefix "api", /api/v2/organisations      → ["v2", "organisations"]
   *   prefix "api", /api/v2/orgs/roles/:type   → ["v2", "orgs"]
   */
  private deriveResourceNamespace(path: string, routerPrefix: string): string[] {
    const normPath = path.replace(/^\/+/, "");
    const normPrefix = (routerPrefix ?? "").replace(/^\/+|\/+$/g, "");

    let rest = normPath;
    if (
      normPrefix &&
      (normPath === normPrefix || normPath.startsWith(normPrefix + "/"))
    ) {
      rest = normPath.slice(normPrefix.length).replace(/^\/+/, "");
    }

    const segs = rest
      .split("/")
      .filter((s) => s.length > 0 && !s.startsWith(":"))
      .map(this.toCamelCase);

    if (segs.length === 0) return [];

    const version = /^v\d+$/i.test(segs[0]) ? segs[0] : null;
    const resource = version ? segs[1] ?? segs[0] : segs[0];
    return [version, resource].filter((s): s is string => !!s);
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private toCamelCase(str: string): string {
    return str.replace(/[-_](.)/g, (_, c: string) => c.toUpperCase());
  }

  private isExcluded(
    path: string,
    method: string,
    exclude: RouteExceptions[]
  ): boolean {
    return exclude.some((e) => e.url === path && e.m === method);
  }
}
