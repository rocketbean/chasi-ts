---
name: nodejs
description: Node.js runtime patterns, Express middleware, async/await, streams, environment management, and performance considerations. Use when working on server-side Node.js code.
---

# Node.js Skill

## Runtime Patterns

- Use `async/await` over raw Promises; avoid mixing `.then()` chains with `await`.
- Always `await` or `.catch()` Promise rejections — unhandled rejections crash the process.
- Use `process.env` via a safe accessor (this project uses `checkout(key, default)` from `helper.ts`).

## Express Patterns (used in chasi-ts)

```ts
// Middleware signature
(req: Request, res: Response, next: NextFunction) => void

// Error middleware — must have 4 args for Express to recognize it
(err: Error, req: Request, res: Response, next: NextFunction) => void

// Async route wrapper (avoid uncaught promise rejections)
const asyncRoute = (fn: AsyncHandler) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
```

- Register error middleware LAST, after all routes.
- Use `res.json()` for API responses, not `res.send()` with manual headers.
- Prefer `router.use()` for sub-paths over defining all routes on the main app.

## Module System

- This project compiles to CommonJS (`require`/`module.exports`).
- Use ES module `import`/`export` syntax in source — tsc handles the transform.
- Avoid `require()` calls in TypeScript source except for CommonJS-only interop.

## Environment & Config

- `.env` → read via `checkout()` helper, never access `process.env` directly in app logic.
- Keep secrets out of source; use `.env` (gitignored) or environment injection.

## Performance

- Avoid synchronous file I/O (`fs.readFileSync`) on hot paths — use async variants.
- Use connection pooling for database clients; don't create new connections per request.
- `setImmediate` / `process.nextTick` to defer heavy work off the current event loop tick.

## Error Handling

```ts
// Typed error wrapper
class AppError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = "AppError";
  }
}
```

## Debugging

```bash
node --inspect dist/server.js   # attach Chrome DevTools / VS Code debugger
NODE_ENV=development npm run dev
```
