---
name: openapi
description: Code-first OpenAPI 3.0 documentation in chasi-ts using the framework's native spec system — RouterSpec config, inline route spec options, group-level spec, auto path-param detection, schema collection from ApiSpec, and Swagger UI serving. Use for defining API docs without JSDoc annotations.
---

# OpenAPI / Swagger — Code-First (chasi-ts native)

chasi-ts has a **built-in code-first OpenAPI pipeline**. You define specs inline in route declarations; the framework collects them, merges with `swagger-jsdoc`, and serves Swagger UI automatically. No JSDoc annotations needed.

> For the JSDoc-annotation approach (reading `@swagger` blocks from compiled `dist/`), see [[swagger]].

---

## How the pipeline works

```
RouterConfigInterface.spec         ← swagger-jsdoc base options + UI config
  ↓
route.get("/path", "Ctrl@method", { spec: { ... } })   ← per-route Operation
route.group({ prefix, spec }, () => { ... })            ← group-level tags/params
  ↓
Router.getSpecPaths()              ← collects routes with spec, converts :param → {param}
Router.serveDocSpec($app)          ← merges paths, optionally writes JSON, serves UI
```

Only routes that have a `spec` option appear in the generated docs.

---

## 1. Enable spec on a Router

Add the `spec` key to your `RouterConfigInterface` inside `RouterServiceProvider.ts`:

```ts
// src/container/services/RouterServiceProvider.ts
import ApiSpec from "../modules/ApiSpecs/spec.js";

new Router(<RouterConfigInterface>{
  name: "api",
  auth: "dev",
  prefix: "/api",
  namespace: "container/http/api.js",
  ControllerDir: ["container/controllers"],
  middleware: [],
  AuthRouteExceptions: [
    { m: "post", url: "/api/users/signin" },
    { m: "post", url: "/api/users/signup" },
  ],
  spec: {
    config: {
      enabled: true,
      url: "/docs",          // mounted at /api/docs
      jsonFile: "./openapi.json",  // optional — writes spec to disk on boot
    },
    spec: {
      definition: {
        openapi: "3.0.0",
        info: {
          title: "API",      // prepended with "[api]" automatically → "[api]API"
          version: "1.0.0",
        },
        servers: [
          { url: `http://localhost:${checkout(process.env.ServerPort, 3010)}/api` },
        ],
        components: {
          securitySchemes: {
            bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
          },
          schemas: {},       // filled at runtime via buildSwaggerSchemas() below
        },
        security: [{ bearerAuth: [] }],
      },
      apis: [],              // no JSDoc files needed for code-first approach
    },
  },
  displayLog: 1,
})
```

Call `Router.serveDocSpec($app)` from `ApiSpecServiceProvider.beforeServerBoot()` **after** `ApiSpec.init()` resolves — this is also where you inject the collected model schemas:

```ts
// src/container/services/ApiSpecServiceProvider.ts
import Provider from "../../package/framework/Services/Provider.js";
import { ServiceProviderInterface } from "../../package/framework/Interfaces.js";
import ApiSpec from "../modules/ApiSpecs/spec.js";

export default class ApiSpecServiceProvider extends Provider implements ServiceProviderInterface {
  async boot() {}

  async beforeServerBoot($app: any) {
    await ApiSpec.init();

    const routers = $app.$modules.RouterModule.routers;
    for (const key in routers) {
      const router = routers[key];
      if (router.property?.spec?.config?.enabled) {
        // inject auto-collected model schemas before serving
        router.property.spec.spec.definition.components.schemas = buildSwaggerSchemas();
        await router.serveDocSpec($app);
      }
    }
  }
}

function buildSwaggerSchemas(): Record<string, object> {
  const raw = ApiSpec.instance.schemas.collections;
  const out: Record<string, object> = {};
  for (const key of Object.keys(raw)) {
    const name = key.replace(/^\[.*?\]/, "");
    const properties: Record<string, object> = {};
    for (const [field, meta] of Object.entries(raw[key] as Record<string, { type: string }>)) {
      properties[field] = { type: mapFieldType(meta.type) };
    }
    out[name] = { type: "object", properties };
  }
  return out;
}

function mapFieldType(t: string): string {
  const map: Record<string, string> = {
    String: "string", string: "string",
    Number: "number", number: "number", Int: "integer", Float: "number",
    Boolean: "boolean", bool: "boolean",
    Date: "string", DateTime: "string",
    ObjectId: "string",
  };
  return map[t] ?? "string";
}
```

Swagger UI is now live at `http://localhost:<port>/api/docs`.

---

## 2. Route-level `spec`

Pass `{ spec: PathItem }` as the third argument to any route method. The `spec` object is a standard OpenAPI `PathItem` / `Operation` merged under the route's HTTP method:

```ts
// src/container/http/api.ts
import Route from "../../package/statics/Route.js";

export default (route: Route) => {

  route.group({ prefix: "/users" }, () => {

    // GET /users — list
    route.get("/", "v1/UserController@list", {
      spec: {
        summary: "List all users",
        tags: ["Users"],
        responses: {
          200: {
            description: "Array of user objects",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/user" } },
              },
            },
          },
        },
      },
    });

    // POST /users — create (public route — override global security)
    route.post("/signup", "v1/UserController@create", {
      spec: {
        summary: "Register a new user",
        tags: ["Users"],
        security: [],          // override global bearerAuth — this is a public route
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name:     { type: "string" },
                  email:    { type: "string", format: "email" },
                  password: { type: "string", format: "password", minLength: 6 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Created user", content: { "application/json": { schema: { $ref: "#/components/schemas/user" } } } },
          400: { description: "Email already exists" },
        },
      },
    });

    // POST /users/signin
    route.post("/signin", "v1/UserController@signin", {
      spec: {
        summary: "Sign in and receive a JWT",
        tags: ["Users"],
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "pass"],
                properties: {
                  email: { type: "string", format: "email" },
                  pass:  { type: "string", format: "password" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "User with JWT token",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    user:  { $ref: "#/components/schemas/user" },
                    token: { type: "string" },
                  },
                },
              },
            },
          },
          401: { description: "Wrong credentials" },
          422: { description: "Missing parameters" },
        },
      },
    });

  });
};
```

---

## 3. Group-level `spec` — shared tags and auto path params

Groups can carry a `spec` that **propagates** to every child route:

- `spec.tags` — merged into every child endpoint's tags
- `spec.parameters` — merged into every child endpoint's parameters
- **Path params** (`:id` in prefix) are auto-detected and injected as `{ in: "path", required: true }` — no manual declaration needed
- If the param name matches a loaded model name, the description auto-fills as `Index of Model::[MODELNAME]`

```ts
route.group(
  {
    prefix: "/users/:user",
    spec: {
      tags: ["Users"],
      // no need to declare :user here — auto-detected from prefix
    },
  },
  () => {
    // GET /users/:user
    route.get("/", "v1/UserController@index", {
      spec: {
        summary: "Get a user by ID",
        responses: {
          200: { description: "User object", content: { "application/json": { schema: { $ref: "#/components/schemas/user" } } } },
          404: { description: "Not found" },
        },
      },
    });

    // PUT /users/:user
    route.put("/", "v1/UserController@update", {
      spec: {
        summary: "Update a user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name:  { type: "string" },
                  email: { type: "string", format: "email" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Updated user" },
        },
      },
    });

    // DELETE /users/:user
    route.delete("/", "v1/UserController@delete", {
      spec: {
        summary: "Delete a user",
        responses: {
          200: { description: "Deleted" },
          404: { description: "Not found" },
        },
      },
    });
  }
);
```

The generated OpenAPI path becomes `/users/{user}` — `:user` → `{user}` is handled by `Router.getSpecPaths()`.

---

## 4. Path parameter rules

| Route definition | Generated OpenAPI path | Auto parameter |
|---|---|---|
| `route.group({ prefix: "/users/:user" })` | `/users/{user}` | `user` — path, required, auto-described if model |
| `route.get("/:id", ...)` | not auto — add manually in route `spec.parameters` |  |
| `route.group({ prefix: "/posts/:post/comments/:comment" })` | `/posts/{post}/comments/{comment}` | both injected |

Auto-detection only fires on **group prefixes**. For path params on individual route endpoints (not in a group prefix), add them manually:

```ts
route.get("/:id", "v1/PostController@index", {
  spec: {
    summary: "Get post by ID",
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string" } },
    ],
    responses: { 200: { description: "Post" } },
  },
});
```

---

## 5. Referencing auto-collected schemas

`buildSwaggerSchemas()` (from step 1) strips the `[connectionName]` prefix. Use the resulting name in `$ref`:

| Driver | Raw `ApiSpec` key | `$ref` target |
|--------|------------------|---------------|
| MongoDB (`dev`) | `[dev]user` | `#/components/schemas/user` |
| Prisma (`mysql`) | `[mysql]User` | `#/components/schemas/User` |
| Drizzle (`pg`) | `[pg]properties` | `#/components/schemas/properties` |

---

## 6. Reusable error responses

Define shared responses once in the `spec.definition.components.responses` object, then `$ref` them across routes:

```ts
// in RouterConfigInterface.spec.spec.definition.components:
responses: {
  Unauthorized: {
    description: "Missing or invalid JWT",
    content: { "application/json": { schema: { type: "object", properties: { message: { type: "string" } } } } },
  },
  NotFound:   { description: "Resource not found" },
  BadRequest: { description: "Validation error" },
},
```

```ts
// in route spec:
responses: {
  401: { $ref: "#/components/responses/Unauthorized" },
  404: { $ref: "#/components/responses/NotFound" },
}
```

---

## 7. JSON export

Set `config.jsonFile` to write the resolved spec to disk on every boot:

```ts
spec: {
  config: {
    enabled: true,
    url: "/docs",
    jsonFile: "./openapi.json",   // written to project root; commit or .gitignore as needed
  },
  ...
}
```

Useful for SDK generation (`openapi-generator`, `orval`, etc.) or CI spec validation.

---

## Prefix and URL resolution

The `spec.config.url` is joined with the router `prefix`:

```
router.prefix = "/api"
spec.config.url = "/docs"
→ Swagger UI served at /api/docs

spec.definition.servers[0].url = "http://localhost:3010/api"
→ route annotation /users resolves to /api/users  ✓
```

Write route paths in `spec` **without** the router prefix — the server base URL already covers it.

---

## What appears in docs

Only routes with a `spec` option in their route declaration are included. Routes without `spec` are still functional but invisible to the generated docs. This is intentional — document incrementally.
