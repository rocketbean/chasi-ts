/**
 * Phase 3 — ChasiException.
 */
import { describe, it, expect, vi, beforeAll } from "vitest";
import "../../harness/globals.ts";
import Exception from "../../../src/package/framework/ErrorHandler/Exception.js";
import ChasiException from "../../../src/package/framework/ErrorHandler/exceptions/ChasiException.js";
beforeAll(async () => {
    await Exception.init({ emit: vi.fn() });
});
describe("ChasiException", () => {
    it("is an Exception/Error subclass carrying the message", () => {
        const ex = new ChasiException({ message: "kaput" });
        expect(ex).toBeInstanceOf(Exception);
        expect(ex).toBeInstanceOf(Error);
        expect(ex.message).toBe("kaput");
    });
    it("defaults interpose to 1 (log)", () => {
        expect(new ChasiException({ message: "interpose stays one" }).interpose).toBe(1);
    });
    it("lets property.interpose override the default", () => {
        expect(new ChasiException({ message: "interpose override four", interpose: 4 }).interpose).toBe(4);
    });
});
