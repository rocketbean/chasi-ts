import { beforeAll, describe } from "vitest";
import { app } from "./setup.ts";
import routesTest from "./tests/routes.test.ts";
console.clear();
describe("App Test running", async () => {
  let $app = new app({
    basePath: "/api",
    signinUrl: "/api/users/signin",
  });
  beforeAll(async () => {
    // configure app before tests
    // await $app.configure();
      await new Promise((resolve) => setTimeout(resolve, 2000));

  });

  /**
   * Run Tests accordingly
   * - tests can be executed asynchronously
   * - tests will be executed in the order of declaration
   *
   * E.G.
   * await User($app);
   * await someTest($app);
   * 
   */

  await routesTest($app);

  // process.exit(0);

});
