import { AuthenticationConfig } from "./types.js";

export default <AuthenticationConfig>{
  /**
   * Named authentication driver instances.
   * Each key (e.g. "dev") can be referenced by a router's `auth` property
   * to activate that driver for all routes in that router.
   * You can declare multiple drivers to support different auth strategies
   * across different parts of your API.
   */
  drivers: {
    dev: {
      /**
       * Authentication strategy to apply.
       * `"jwt"` uses JSON Web Tokens (Bearer tokens in the Authorization header).
       * Chasi verifies the token signature on every protected request.
       */
      driver: "jwt",

      /**
       * Path to a custom auth handler file implementing the `AuthDriver` interface.
       * Set to `null` to use Chasi's built-in JWT handler.
       * Provide a file path when you need custom token introspection logic
       * (e.g. session lookup, API-key validation, OAuth2 token exchange).
       */
      handler: null,

      /**
       * Secret used to sign and verify JWT tokens.
       * Store this in an environment variable — never commit secrets to source control.
       * Rotating this key immediately invalidates all active sessions.
       */
      key: checkout(process.env.oauthkey, "chasi-dev"),

      /**
       * Mongoose model name (from `container/models/`) representing an authenticated user.
       * After a successful token verification, Chasi resolves the matching document
       * and attaches it to `request.auth` so controllers can access the current user.
       */
      model: "user",

      /**
       * Routes exempted from the authentication guard.
       * Each entry must specify a `url` and HTTP `m`ethod.
       * Exempted routes will NOT have `request.auth` populated — keep that in mind
       * for endpoints like login, signup, password reset, or public health checks.
       *
       * Example:
       *   { url: "/api/login", m: "post" }
       */
      AuthRouteExceptions: [],
    },
  },
};
