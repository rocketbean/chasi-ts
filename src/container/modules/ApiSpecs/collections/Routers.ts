import Router from "../../../../package/framework/Router/Router.js";
import RouterModule from "../../../../package/framework/Router/RouterModule.js";
import Authentication from "../../../../package/framework/Server/Authentication.js";
import Endpoint from "../../../../package/framework/Router/Endpoint.js";
import Group from "../../../../package/framework/Router/Group.js";
import type { RouteExceptions } from "Chasi/Router";
import type { ApiSpecConfig, ApiSpecOperation, ApiSpecPathItem } from "../ApiSpec.types.js";

// ─── RouterCollection ─────────────────────────────────────────────────────────

export default class RouterCollection {
  static paths: Record<string, ApiSpecPathItem> = {};

  get collections(): Record<string, ApiSpecPathItem> {
    return RouterCollection.paths;
  }

  async init(config: ApiSpecConfig): Promise<void> {
    RouterCollection.paths = {};
    const routerModule = ($app as { $modules: { RouterModule: RouterModule } })
      .$modules.RouterModule;

    for (const router of routerModule.routers) {
      this.collectFromRouter(router, config);
    }
  }

  // ─── Per-router collection ──────────────────────────────────────────────────

  private collectFromRouter(router: Router, config: ApiSpecConfig): void {
    const routerAuth = router.property.auth;
    const routerExceptions: RouteExceptions[] =
      router.property.AuthRouteExceptions ?? [];

    // Merge driver-level exceptions when auth is active
    const driverExceptions: RouteExceptions[] =
      routerAuth && typeof routerAuth === "string"
        ? (Authentication.$drivers[routerAuth]?.property
            ?.AuthRouteExceptions as RouteExceptions[]) ?? []
        : [];

    const allExceptions = [...routerExceptions, ...driverExceptions];

    for (const endpoint of router.$registry.routes) {
      if (!endpoint.property?.options?.spec) continue;
      this.collectEndpoint(endpoint, routerAuth, allExceptions, config);
    }
  }

  // ─── Per-endpoint path item assembly ───────────────────────────────────────

  private collectEndpoint(
    ep: Endpoint,
    routerAuth: string | boolean | null,
    exceptions: RouteExceptions[],
    config: ApiSpecConfig
  ): void {
    const openApiPath = this.toOpenApiPath(ep.path);
    const method = ep.property.method as string;
    const operation = this.buildOperation(ep, routerAuth, exceptions, config);

    if (!RouterCollection.paths[openApiPath]) {
      RouterCollection.paths[openApiPath] = {};
    }
    RouterCollection.paths[openApiPath][method] = operation;
  }

  // ─── Operation builder ──────────────────────────────────────────────────────

  private buildOperation(
    ep: Endpoint,
    routerAuth: string | boolean | null,
    exceptions: RouteExceptions[],
    config: ApiSpecConfig
  ): ApiSpecOperation {
    const epSpec = ep.spec as Record<string, unknown>;
    const op: ApiSpecOperation = {};

    // ── Standard operation fields ─────────────────────────────────────────────

    if (epSpec.summary && typeof epSpec.summary === "string") {
      op.summary = epSpec.summary;
    }
    if (epSpec.description && typeof epSpec.description === "string") {
      op.description = epSpec.description;
    }
    if (epSpec.operationId && typeof epSpec.operationId === "string") {
      op.operationId = epSpec.operationId;
    }
    if (epSpec.deprecated === true) {
      op.deprecated = true;
    }
    if (epSpec.requestBody) {
      op.requestBody = epSpec.requestBody;
    }

    // ── Responses ─────────────────────────────────────────────────────────────
    // Only include responses if the developer provided a non-empty object
    if (
      epSpec.responses &&
      typeof epSpec.responses === "object" &&
      !Array.isArray(epSpec.responses) &&
      Object.keys(epSpec.responses).length > 0
    ) {
      op.responses = epSpec.responses as Record<string, unknown>;
    }

    // ── Tags ──────────────────────────────────────────────────────────────────
    // Use spec tags if present; otherwise auto-derive from group prefixes
    const specTags = Array.isArray(epSpec.tags)
      ? (epSpec.tags as string[])
      : [];
    op.tags = specTags.length > 0
      ? specTags
      : this.deriveTagsFromGroups(ep.groups);

    // ── Parameters ───────────────────────────────────────────────────────────
    // Merged from endpoint spec + group parameters (done in Endpoint.defineEP)
    const params = Array.isArray(epSpec.parameters) ? epSpec.parameters : [];
    if (params.length > 0) {
      op.parameters = params;
    }

    // ── Security ──────────────────────────────────────────────────────────────
    // Precedence: endpoint spec.security > exception list > global config security
    if (epSpec.security !== undefined) {
      op.security = epSpec.security as Array<Record<string, string[]>>;
    } else {
      op.security = this.resolveSecurityRequirement(
        ep,
        routerAuth,
        exceptions,
        config
      );
    }

    // ── Middlewares (x-extension) ─────────────────────────────────────────────
    // ep.middlewares includes all names assigned (router + group + route layers).
    // ep.excludeFromMw contains names removed via .except().
    const effectiveMw = ep.middlewares.filter(
      (mw) => !ep.excludeFromMw.includes(mw)
    );
    if (effectiveMw.length > 0) {
      op["x-middlewares"] = effectiveMw;
    }

    // ── Passthrough x-* extensions from spec ─────────────────────────────────
    for (const key of Object.keys(epSpec)) {
      if (key.startsWith("x-") && !(key in op)) {
        op[key] = epSpec[key];
      }
    }

    return op;
  }

  // ─── Security resolution ────────────────────────────────────────────────────

  private resolveSecurityRequirement(
    ep: Endpoint,
    routerAuth: string | boolean | null,
    exceptions: RouteExceptions[],
    config: ApiSpecConfig
  ): Array<Record<string, string[]>> {
    // No auth on this router → always public
    if (!routerAuth) return [];

    const method = ep.property.method as string;
    const isException = exceptions.some(
      (e) => e.url === ep.path && e.m === method
    );
    if (isException) return [];

    // Protected route — use global security from config, or default to bearerAuth
    return config.security ?? [{ bearerAuth: [] }];
  }

  // ─── Tag derivation from group prefixes ─────────────────────────────────────

  private deriveTagsFromGroups(groups: Group[]): string[] {
    const seen = new Set<string>();
    const tags: string[] = [];

    for (const group of groups) {
      const prefix = group.property.prefix ?? "";
      // Take the first non-empty, non-param segment of the prefix
      const segment = prefix
        .split("/")
        .find((p) => p.length > 0 && !p.startsWith(":"));
      if (segment) {
        const tag = segment.charAt(0).toUpperCase() + segment.slice(1);
        if (!seen.has(tag)) {
          seen.add(tag);
          tags.push(tag);
        }
      }
    }

    return tags;
  }

  // ─── Path conversion ─────────────────────────────────────────────────────────

  /** Converts Express-style `:param` segments to OpenAPI `{param}` format. */
  private toOpenApiPath(expressPath: string): string {
    return expressPath
      .split("/")
      .map((segment) =>
        segment.startsWith(":") ? `{${segment.slice(1)}}` : segment
      )
      .join("/");
  }
}
