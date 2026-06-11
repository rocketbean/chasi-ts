---
name: typescript
description: TypeScript best practices, type system guidance, strict mode patterns, generics, decorators, and tsconfig conventions. Use when writing or reviewing TypeScript code.
---

# TypeScript Skill

## Project Config

This project uses `tsconfig.json` with:
- Output to `dist/` in CommonJS format with ESNext target
- Strict mode recommended — lean into it rather than suppressing errors
- Use `paths` aliases if configured rather than deep relative imports

## Type System Principles

- Prefer `interface` for object shapes that may be extended; `type` for unions, intersections, and mapped types.
- Avoid `any` — use `unknown` when the type is genuinely unknown, then narrow.
- Use `as const` for literal tuples and enums-as-objects.
- Prefer `readonly` on arrays and object properties that shouldn't mutate.

## Generics

- Constrain generics when you know the shape: `<T extends object>` not bare `<T>`.
- Use conditional types (`T extends U ? X : Y`) for type-level logic.
- `infer` inside conditional types for extraction patterns.

## Strict Patterns

```ts
// Nullish coalescing + optional chaining
const val = obj?.prop ?? defaultValue;

// Type guard
function isString(x: unknown): x is string {
  return typeof x === "string";
}

// Exhaustive switch
function assertNever(x: never): never {
  throw new Error("Unexpected value: " + x);
}
```

## Class Patterns (used in chasi-ts)

- Extend framework base classes (`Controller`, `Model`) — don't reimplement their internals.
- Access injected models via `this.models.{Name}` inside controllers.
- Use `private`/`protected`/`readonly` modifiers consistently.

## Avoiding Common Mistakes

- Don't widen return types unnecessarily — let inference work.
- Don't cast with `as` to paper over type errors; fix the type.
- Avoid `!` non-null assertions except at verified boundaries.
- Use `satisfies` (TS 4.9+) to validate shapes without widening.

## Compilation

```bash
npx tsc --noEmit   # type-check without emitting
npx tsc            # compile to dist/
```
