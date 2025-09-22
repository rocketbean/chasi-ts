import { beforeAll, describe } from "vitest";
import { app } from "./setup.ts";

console.clear();
describe("App Test running", async () => {
  let $app = new app({
    basePath: "/baseurl",
  });
  beforeAll(async () => {
    // configure app before tests
    // await $app.configure();
  });

  /**
   * Run Tests accordingly
   * - tests can be executed asynchronously
   * - tests will be executed in the order of declaration
   *
   * E.G.
   * await User($app);
   * await someTest($app);
   */
});
