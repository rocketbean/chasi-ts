import { beforeAll, describe } from "vitest";
import { app } from "./setup.ts";
import routesTest from "./tests/routes.test.ts";
console.clear();
describe("App Test running", () => {
  let $app = new app({
    basePath: "/api",
    signinUrl: "/api/users/signin",
  });
  beforeAll(async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
  });

  /**
   * Run Tests accordingly
   * - tests can be executed asynchronously
   * - tests will be executed in the order of declaration
   *
   * E.G.
   * User($app);
   * someTest($app);
   */

  routesTest($app);
});
