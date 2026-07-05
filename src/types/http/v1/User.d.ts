/**
 * Typed request/response contracts for the `api` router's user endpoints.
 *
 * SdkBuilder's typed layer reads this barrel (module `Chasi/Http/v2/<Seg>`) to
 * verify `*Response` siblings, and the generated `.d.ts` imports these names
 * from `Chasi/Http/v2` (see index.d.ts). Request types carry a `body` — the SDK
 * unwraps it via `ReqBody<T>` so the client payload is exactly the body shape.
 */
declare module "Chasi/Http/v1/User" {
  /** A persisted user entity (server response shape). */
  export type Entity = {
    id: string;
    name: string;
    email: string;
    alias: string;
  };

  // ── POST /api/users/signin ──────────────────────────────────────────────────
  export type SigninRequest = {
    body: {
      email: string;
      pass: string;
    };
  };
  export type SigninResponse = {
    user: Entity;
    token: string;
  };

  // ── POST /api/users/signup (UserController@create) ──────────────────────────
  export type CreateRequest = {
    body: {
      name: string;
      email: string;
      alias: string;
      password: string;
    };
  };
  export type CreateResponse = Entity;
}
