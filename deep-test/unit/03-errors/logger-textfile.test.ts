/**
 * Phase 3 — Textfile exception logger + ExceptionLogger routing.
 * In 4.1.2 TextfileLogger.write/init are no-ops (placeholders); pinned as such.
 */
import { describe, it, expect } from "vitest";
import "../../harness/globals.ts";
import TextfileLogger from "../../../src/package/framework/ErrorHandler/loggers/Textfile.js";
import ExceptionLogger from "../../../src/package/framework/ErrorHandler/ExceptionLogger.js";

describe("TextfileLogger", () => {
  it("write() and init() resolve without throwing (no-op in 4.1.2)", async () => {
    const logger = new TextfileLogger();
    await expect(logger.write()).resolves.toBeUndefined();
    await expect(logger.init()).resolves.toBeUndefined();
  });

  it("is selected by ExceptionLogger for LogType.type 'textfile'", () => {
    const el = new ExceptionLogger({ LogType: { type: "textfile" } } as any);
    expect(el.writer).toBeInstanceOf(TextfileLogger);
  });
});
