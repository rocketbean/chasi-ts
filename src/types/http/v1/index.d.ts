/**
 * Barrel for the `Chasi/Http/v2` HTTP type namespace.
 *
 * Controllers and the generated SDK `.d.ts` both import from here
 * (`import type { User } from "Chasi/Http/v2"`), while each resource's concrete
 * types live in its own `Chasi/Http/v2/<Seg>` module (which SdkBuilder's parser
 * indexes for response-sibling verification). Add one re-export per resource.
 */
declare module "Chasi/Http/v1" {
  export * as User from "Chasi/Http/v1/User";
}
