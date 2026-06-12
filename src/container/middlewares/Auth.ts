import type { SdkMiddlewareFn } from "Chasi/Router";

/**
 * Express middleware — runs on every protected HTTP request.
 * JWT verification is handled by the framework auth driver;
 * add any extra request-level auth logic here.
 */
export default async (request, response, next) => {
  next();
};

/**
 * SDK validation handler for auth — registered on a route via `.sdk(authSdk)`.
 * Called by sdkBuilder during its compilation pass, NOT during HTTP requests.
 *
 * Receives `next` followed by any params forwarded by sdkBuilder.
 * Call `next()` to advance the chain; throw to halt it.
 *
 * @example — register on a route:
 *   import { authSdk } from "../../middlewares/Auth.js";
 *
 *   route.get("/profile", "v1/UserController@index").sdk(authSdk);
 *
 * @example — sdkBuilder calls it internally as:
 *   await endpoint.runSdk(token, context);
 */
export const authSdk: SdkMiddlewareFn = async (params, next) => {
  const token = params as string;
  if (!token || typeof token !== "string") {
    throw { status: 401, message: "Authorization token is required" };
  }

  // Add any further token/session validation here before advancing.
  await next();
};
