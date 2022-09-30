import { resolve, join } from "path";
import {
  CompilerEngineConfig,
  builderConfig,
  Builder,
} from "../container/modules/compilerEngine/compiler.js";
import { serverBuild, clientBuild } from "../container/html/ssr.config.js";
const config: CompilerEngineConfig = {
  enabled: true,
  engines: [
    {
      name: "web",
      environment: "dev",
      root: join(__dirname, "../src/container/html"),
      ssrServerModule: "entry-server.js",
      serverBuild,
      clientBuild,
      configPath: resolve(
        join(__dirname, "../src/container/html/ssr.config.js"),
      ),
      mountedTo: "/api/",
      hook: async (getConfig: Function, ctx: builderConfig) => {
        await Builder.prodSetup(getConfig, ctx);
      },
    },
  ],
};

export default config;
