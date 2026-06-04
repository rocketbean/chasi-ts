import Router from "../../../../package/framework/Router/Router.js";
import RouterModule from "../../../../package/framework/Router/RouterModule.js";
import Authentication from "../../../../package/framework/Server/Authentication.js";
import Endpoint from "../../../../package/framework/Router/Endpoint.js";
import type { RouteExceptions } from "Chasi/Router";
import type { SdkBuilderConfig, SdkRouteEntry } from "../SdkBuilder.types.js";

// ─── RouteCollector ───────────────────────────────────────────────────────────

export default class RouteCollector {
  static entries: SdkRouteEntry[] = [];

  get routes(): SdkRouteEntry[] {
    return RouteCollector.entries;
  }

  async init(config: SdkBuilderConfig): Promise<void> {
    RouteCollector.entries = [];

    const routerModule = ($app as { $modules: { RouterModule: RouterModule } })
      .$modules.RouterModule;

    for (const router of routerModule.routers) {
      if (config.routers?.length && !config.routers.includes(router.property.name)) continue;
      this.collectFromRouter(router, config);
    }
  }

  // ─── Per-router ────────────────────────────────────────────────────────────

  private collectFromRouter(router: Router, config: SdkBuilderConfig): void {
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

      if (this.isExcluded(endpoint.path, method, config.exclude ?? [])) continue;

      const entry = this.buildEntry(endpoint, router, routerAuth, allExceptions);
      RouteCollector.entries.push(entry);
    }
  }

  // ─── Entry builder ─────────────────────────────────────────────────────────

  private buildEntry(
    ep: Endpoint,
    router: Router,
    routerAuth: string | boolean | null,
    exceptions: RouteExceptions[]
  ): SdkRouteEntry {
    const method = ep.property.method as string;
    const isPublic =
      !routerAuth ||
      exceptions.some((e) => e.url === ep.path && e.m === method);

    const effectiveMw = ep.middlewares.filter(
      (mw) => !ep.excludeFromMw.includes(mw)
    );

    const { namespace, functionName } = this.deriveNames(
      ep.path,
      router.property.prefix,
      method
    );

    return {
      path: ep.path,
      method,
      isProtected: !isPublic,
      middlewares: effectiveMw,
      hasSdkHandlers: ep.$sdkHandlers.length > 0,
      sdkHandlers: ep.$sdkHandlers,
      requiredFields: this.extractRequiredFields(ep),
      namespace,
      functionName,
    };
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
   * Derives the SDK namespace and function name from an Express path.
   *
   * The router prefix is stripped first, then each segment is camelCased.
   * The last non-param segment becomes the function name; everything before
   * it becomes the namespace path.
   *
   * Examples (router prefix "/api"):
   *   /api/users/signin    → namespace: ["users"], fn: "signin"
   *   /api/users/pg-signup → namespace: ["users"], fn: "pgSignup"
   *   /api/users/:user     → namespace: ["users"], fn: "get" (method fallback)
   *   /api/health          → namespace: [],        fn: "health"
   */
  private deriveNames(
    path: string,
    routerPrefix: string,
    method: string
  ): { namespace: string[]; functionName: string } {
    const stripped = path.startsWith(routerPrefix)
      ? path.slice(routerPrefix.length)
      : path;

    const segments = stripped
      .split("/")
      .filter((s) => s.length > 0 && !s.startsWith(":"))
      .map(this.toCamelCase);

    if (segments.length === 0) {
      return { namespace: [], functionName: method.toLowerCase() };
    }
    if (segments.length === 1) {
      return { namespace: [], functionName: segments[0] };
    }

    return {
      namespace: segments.slice(0, -1),
      functionName: segments[segments.length - 1],
    };
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
