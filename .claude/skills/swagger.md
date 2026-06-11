---
name: swagger
description: Describing APIs with Swagger/OpenAPI in chasi-ts — wiring swagger-jsdoc and swagger-ui-express into ApiSpecServiceProvider, writing JSDoc @swagger annotations on controllers, leveraging auto-collected model schemas from ApiSpec, and configuring JWT auth in Swagger UI.
---

# Swagger / OpenAPI Skill (chasi-ts)

## How API documentation fits in chasi-ts

The project already has `swagger-jsdoc` and `swagger-ui-express` installed. The `ApiSpecServiceProvider` initializes at `beforeServerBoot()` and already auto-collects:

- **`ApiSpec.instance.schemas.collections`** — model field maps from all active DB drivers, keyed as `[connectionName]ModelName` (e.g. `[test]user`, `[mysql]User`, `[pg]users`)
- **`ApiSpec.instance.routers.collections`** — all registered routes, keyed by URL path

Wire Swagger UI into the same `ApiSpecServiceProvider` — no new service provider needed.

---

## Wiring Swagger into ApiSpecServiceProvider

`beforeServerBoot($app)` receives the live Express instance. Mount the Swagger UI there after `ApiSpec.init()` resolves:

```ts
// src/container/services/ApiSpecServiceProvider.ts
import { ServiceProviderInterface } from "../../package/framework/Interfaces.js";
import Provider from "../../package/framework/Services/Provider.js";
import ApiSpec from "../modules/ApiSpecs/spec.js";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

export default class ApiSpecServiceProvider extends Provider implements ServiceProviderInterface {
  async boot() {}

  async beforeServerBoot($app: any) {
    await ApiSpec.init();

    const spec = swaggerJsdoc({
      definition: {
        openapi: "3.0.0",
        info: {
          title: checkout(process.env.APPNAME, "Chasi") + " API",
          version: "1.0.0",
        },
        servers: [
          { url: `http://localhost:${checkout(process.env.ServerPort, 3010)}/api` },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "JWT",
            },
          },
          schemas: buildSwaggerSchemas(),
        },
        security: [{ bearerAuth: [] }],   // apply JWT globally; override per-route if needed
      },
      apis: ["./dist/container/controllers/**/*.js"],  // compiled JS — swagger-jsdoc reads JSDoc from dist
    });

    $app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(spec));
  }
}

function buildSwaggerSchemas(): Record<string, object> {
  const raw = ApiSpec.instance.schemas.collections;
  const out: Record<string, object> = {};

  // raw keys are "[connectionName]ModelName" — strip brackets for clean component names
  for (const key of Object.keys(raw)) {
    const name = key.replace(/^\[.*?\]/, "");   // "[test]user" → "user"
    const fields = raw[key];
    const properties: Record<string, object> = {};

    for (const [field, meta] of Object.entries(fields as Record<string, { type: string }>)) {
      properties[field] = { type: mapFieldType(meta.type) };
    }

    out[name] = { type: "object", properties };
  }

  return out;
}

function mapFieldType(driverType: string): string {
  const map: Record<string, string> = {
    String: "string", string: "string",
    Number: "number", number: "number", Int: "integer", Float: "number",
    Boolean: "boolean", bool: "boolean",
    Date: "string",    DateTime: "string",
    ObjectId: "string",
  };
  return map[driverType] ?? "string";
}
```

After recompiling, Swagger UI is available at `http://localhost:<port>/api-docs`.

---

## Writing @swagger JSDoc on controllers

Annotate controller methods with `@swagger` JSDoc blocks. swagger-jsdoc reads from the compiled `dist/` files, so always rebuild before checking the docs.

### GET — list

```ts
/**
 * @swagger
 * /users:
 *   get:
 *     summary: List all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of user objects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/user'
 */
async list(request, response) {
  return await this.user.find({});
}
```

### POST — create

```ts
/**
 * @swagger
 * /users/signup:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     security: []          # override global JWT — this route is public
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, alias, password]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               alias:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Created user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/user'
 *       400:
 *         description: Email already exists
 */
async create(request, response) {
  let { email } = request.body;
  if (await this.user.findOne({ email })) {
    throw { status: 400, message: "Email already exists" };
  }
  return await this.user.create({ ...request.body });
}
```

### POST — auth (signin)

```ts
/**
 * @swagger
 * /users/signin:
 *   post:
 *     summary: Sign in and receive a JWT
 *     tags: [Users]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, pass]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               pass:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: User and JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/user'
 *                 token:
 *                   type: string
 *       401:
 *         description: Wrong credentials
 *       422:
 *         description: Missing or invalid parameters
 */
async signin(request, response) {
  let { email, pass } = request?.body;
  let user = await this.user.findByCredentials(email, pass);
  let token = await user.generateAuthToken("dev");
  return { user, token };
}
```

### GET — single with path param

```ts
/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/user'
 *       404:
 *         description: Not found
 */
async index(request, response) {
  return await this.user.findOne({ id: request.params.user });
}
```

### DELETE

```ts
/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted
 *       404:
 *         description: Not found
 */
async delete(request, response) {
  return await request.params.__user.delete();
}
```

---

## Routes, prefixes, and public endpoints

The `api` router has `prefix: "/api"` in `RouterServiceProvider`. Swagger `servers` is set to `/api`, so annotations use paths **without** the `/api` prefix:

```
RouterServiceProvider prefix: /api
Route definition:             /users/signin
Swagger path annotation:      /users/signin   ✓  (server base already covers /api)
Full URL hit by client:       /api/users/signin
```

Public routes (in `AuthRouteExceptions`) must explicitly override the global `security` with `security: []` in their `@swagger` block, so Swagger UI doesn't add an `Authorization` header to those requests.

---

## Referencing auto-collected schemas

`buildSwaggerSchemas()` above converts `ApiSpec.instance.schemas.collections` into Swagger component schemas automatically. After that, reference them in annotations with `$ref`:

| Driver | Raw key | `$ref` name |
|--------|---------|-------------|
| MongoDB (`test`) | `[test]user` | `user` |
| Prisma (`mysql`) | `[mysql]User` | `User` |
| Drizzle (`pg`) | `[pg]users` | `users` |

Use the exact name that `buildSwaggerSchemas()` produces after stripping the `[connectionName]` prefix.

---

## Inline schema vs $ref

Use `$ref` when the shape is already a registered component. Use an inline `schema:` when the request/response shape is a partial, a DTO, or doesn't map 1:1 to a model:

```yaml
# Partial update body — inline is cleaner than a dedicated component
requestBody:
  content:
    application/json:
      schema:
        type: object
        properties:
          name:
            type: string
```

---

## Standard error responses

Define once and reuse across annotations:

```ts
// In swaggerJsdoc definition.components.responses:
components: {
  responses: {
    Unauthorized: {
      description: "Missing or invalid JWT",
      content: { "application/json": { schema: { type: "object", properties: { message: { type: "string" } } } } },
    },
    NotFound: {
      description: "Resource not found",
    },
    BadRequest: {
      description: "Validation error",
    },
  }
}

// Then in annotations:
// responses:
//   401:
//     $ref: '#/components/responses/Unauthorized'
```

---

## npm scripts

No new scripts are needed — use the existing build pipeline:

```bash
npm run dev     # recompiles on change; swagger-jsdoc re-reads dist/ on each server restart
npm run start   # compile + serve; visit http://localhost:<port>/api-docs
```

swagger-jsdoc scans `dist/container/controllers/**/*.js` (compiled output). Always run a build before checking that new annotations appear in the UI.
