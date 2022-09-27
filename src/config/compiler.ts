import { resolve, join } from "path";
import { CompilerEngineConfig } from "../container/modules/compilerEngine/compiler.js";
const config: CompilerEngineConfig = {
  enabled: true,
  engines: [
    {
      name: "web",
      root: join(__dirname, "../src/container/html"),
      ssrServerModule: "entry-server.js",
      configPath: resolve(
        join(__dirname, "../src/container/html/ssr.config.js"),
      ),
    },
  ],
};

export default config;
