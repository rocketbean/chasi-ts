/**
 * Phase 6 — model-bound route params (request.params.__user) consumed by controllers.
 *
 * The resolution of a `:user` path segment into request.params.__user (the loaded
 * model document) is performed at the server/router layer and is exercised in
 * Phase 7/12. Here we pin the controller-side contract: delete()/update() operate
 * on the already-bound document.
 */
import { describe, it, expect, vi } from "vitest";
import "../../harness/globals.ts";
import UserController from "../../../src/container/controllers/v1/UserController.js";
import Models from "../../../src/package/framework/Database/Models.js";
function makeUC() {
    Models.collection = { user: {} };
    return new UserController();
}
describe("model-bound params", () => {
    it("delete() calls delete() on the bound __user document", async () => {
        const __user = { delete: vi.fn(async () => true) };
        const out = await makeUC().delete({ params: { __user } }, {});
        expect(__user.delete).toHaveBeenCalledOnce();
        expect(out).toBe(true);
    });
    it("update() merges the body into the bound __user and saves it", async () => {
        const __user = { name: "old", save: vi.fn(async function () { return this; }) };
        const out = await makeUC().update({ params: { __user }, body: { name: "new" } }, {});
        expect(__user.name).toBe("new");
        expect(__user.save).toHaveBeenCalledOnce();
        expect(out.name).toBe("new");
    });
});
