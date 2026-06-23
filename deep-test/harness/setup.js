/**
 * Global Vitest setup file (referenced by vitest.deep.config.ts -> setupFiles).
 * Runs once per test file before any test in it.
 *
 * Responsibilities:
 *  - Install framework globals for every test (unit + integration).
 *  - Silence the framework's very chatty boot logger unless DEEP_VERBOSE=1.
 */
import "./globals.ts";
if (!process.env.DEEP_VERBOSE) {
    // The framework Logger writes a lot during boot/route registration.
    // Keep test output readable; flip DEEP_VERBOSE=1 to see everything.
    // (We only mute log/info — warn/error stay visible.)
    // eslint-disable-next-line no-console
    const noop = () => { };
    // Comment these out locally if you are debugging boot behavior.
    // console.log = noop;
    // console.info = noop;
}
