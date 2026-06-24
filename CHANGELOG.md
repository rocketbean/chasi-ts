# Changelog

All notable changes to **chasi-ts** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [4.2.0] - 2026-06-24

A dependency-modernization release moving the framework onto the current majors of
its core stack. **This release is not backward-compatible with 4.1.x** — the
dependency majors and the removal of `testMode` require app-side changes (see
_Breaking Changes_ and _Migration_ below).

### Breaking Changes

- **`testMode` flag removed.** Replaced by `NODE_ENV=test` + `CHASI_COMPILER=false`
  with filesystem auto-detection — the app boots from `/src` in-process without the
  Vite build step. Update `.env.test` accordingly.
- **Express 5.** `req.body` now defaults to `undefined` (was `{}`); bare `"*"`
  wildcard routes are no longer valid and are auto-translated (see _Fixed_).
- **Mongoose 9.** `pre("save")` hooks are now async and no longer receive a `next`
  callback; models must use `ObjectId` ids.
- **Prisma 7.** `datasource.url` was removed from the schema — connections now go
  through a driver adapter configured in `prisma.config.ts`.
- **Node engine** raised to `>=20.19.0`.

### Added

- Express 5 legacy-wildcard translation (`*`, `/*`, `/files/*` → `/{*splat}`) so
  existing catch-all routes keep working across the upgrade.
- `.well-known` static support (dotfiles `allow`) and refined `express.static`
  dotfiles handling.
- Cross-platform dynamic-import resolution (`importSpecifier` / `withModuleExt`):
  `file://` URLs on win32, raw paths elsewhere, `.js`-else-`.ts` auto-detect.
- Prisma 7 driver-adapter client (`prisma.config.ts` + `@prisma/adapter-pg`).
- **deep-test** behavioral conformance suite expanded with new lanes: cluster
  (real-app-routing, behavior-parity, db-race, static-dotfiles), DB integrity
  (Mongo, Prisma), build (postbuild), plus Express 5 routing & middleware-runtime
  unit tests and supporting harnesses.
- RFC 0001 — Database Uniformity ("uniform plumbing, native queries").
- Web-engine version document `v4.2.0.json`, registered as the default version.

### Changed

- **Dependency majors:** Express 5, path-to-regexp v8, Mongoose 9, Prisma 7,
  Vite 8 (Rolldown/Oxc), Vitest 4, `@types/node` 22, TypeScript 6.
- `req.body` shield middleware added so handlers still receive `{}` under Express 5.
- `bin.chasis` now points at `@rocketbean/create-chasi-ts`.
- `postbuild` copies `container/html` and (optionally) the generated Prisma client.
- Documentation updated throughout to v4.2.0.

### Removed

- The `testMode` flag and its dev/prod caveats.
- ~16 unused packages from `dependencies`/`devDependencies`.
- `src/package` dead code: unused imports and locals, and the vestigial
  `methodHandler` Proxy trap in the route `Collector` (the tested `methods`
  introspection field was retained).

### Fixed

- Hardened `Exception.setInvoker()` against stack frames where every line matches a
  common invoker (no longer crashes on an undefined frame).
- Mongoose 9 user-model signup regression (`next is not a function`).

### Migration (4.1.x → 4.2.0)

1. Replace `testMode="enabled"` in `.env.test` with `NODE_ENV=test` and
   `CHASI_COMPILER=false`.
2. Convert `pre("save")` hooks to `async` and drop the `next` callback.
3. Move Prisma connection config out of `schema.prisma` into `prisma.config.ts`
   and install the appropriate driver adapter.
4. Replace any bare `"*"` wildcard routes with named wildcards if you bind them
   manually (framework-collected routes are translated automatically).
5. Ensure Node `>=20.19.0`.

[4.2.0]: https://github.com/rocketbean/chasi-ts/releases/tag/4.2.0
