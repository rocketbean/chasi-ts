/**
 * Phase 10/11 — cluster fork behavior. Opt-in: DEEP_INTEGRATION=1.
 *
 * Forking is process-level: enabling serviceCluster forks N workers from the
 * primary, which cannot be observed from inside a single vitest worker without a
 * dedicated subprocess harness. The single-process path and the cluster config
 * surface are unit-tested in Phase 10 (servicecluster). This suite is reserved
 * for a subprocess-based fork assertion.
 */
import { describe, it } from "vitest";

const RUN = !!process.env.DEEP_INTEGRATION;

describe.skipIf(!RUN)("integration › cluster fork", () => {
  it.todo("spawn the app with CLUSTER=1 WORKERS=2 in a subprocess and assert 2 workers fork");
});
