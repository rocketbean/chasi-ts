/**
 * Phase 12 — model-bound route params e2e. Opt-in: DEEP_INTEGRATION=1.
 *
 * NOTE: the bundled demo api (container/http/api.ts) only exposes signin/signup,
 * so there is no live `/:user` model-bound route to drive end-to-end here. The
 * binding mechanism (Consumer.bindModel → request.params.__user) is unit-tested in
 * Phase 7 (consumer-before-data) and the controller consumption in Phase 6
 * (model-bound-params). Add a `:user` route to the demo api to enable this suite.
 */
import { describe, it } from "vitest";

const RUN = !!process.env.DEEP_INTEGRATION;

describe.skipIf(!RUN)("integration › model-bound params", () => {
  it.todo("drive a live /:user route once the demo api defines one (mechanism covered in P6/P7)");
});
