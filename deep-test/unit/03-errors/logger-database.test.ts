/**
 * Phase 3 — Database exception logger + ExceptionLogger routing.
 * In 4.1.2 DatabaseLogger.write is a no-op placeholder; pinned as such.
 */
import { describe, it, expect } from "vitest";
import "../../harness/globals.ts";
import DatabaseLogger from "../../../src/package/framework/ErrorHandler/loggers/Database.js";
import ExceptionLogger from "../../../src/package/framework/ErrorHandler/ExceptionLogger.js";

describe("DatabaseLogger", () => {
  it("write() resolves without throwing (no-op in 4.1.2)", async () => {
    await expect(new DatabaseLogger().write()).resolves.toBeUndefined();
  });

  it("is selected by ExceptionLogger for LogType.type 'database'", () => {
    const el = new ExceptionLogger({ LogType: { type: "database" } } as any);
    expect(el.writer).toBeInstanceOf(DatabaseLogger);
  });
});
