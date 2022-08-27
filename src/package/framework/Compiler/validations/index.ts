import checkPackageJson from "./checkPackageJson.js";
import checkFileAccess from "./checkFileAccess.js";
import checkBaseDir from "./checkBaseDir.js";
import readFile from "./readFile.js";
import updateFile from "./updateFile.js";
import nuxt from "../modules/NuxtJs.js";
import run from "./run.js";
import chalk from "chalk";
import path from "path";
import { inspect } from "util";
import { exit } from "process";
var basePath;
var _config;
export type stateFile = {
  package: number;
  state: number;
};

export const checkAndWriteFile = async (dir, content, writer) => {
  let loader = writer.loading(`loading ${dir}...`);
  loader.start();
  await checkFileAccess(dir, content);
  loader.stop(console.log(`${dir}::[OK]`));
  return;
};

export const updateState = async (state) => {
  return await updateFile(
    path.join(basePath, _config.compiler.serverFile),
    JSON.stringify(state, null, 2),
  );
};

export const installPackages = async (data, writer) => {
  for (var pkg in data.dependencies) {
    let loader = writer.loading(`installing package::${pkg}...`);
    loader.start();
    let c = await run(
      `npm list ${pkg}@${data.dependencies[pkg]} || npm i ${pkg}@${data.dependencies[pkg]} --save `,
      loader.stop.bind(this),
    )
      .then((r) => r)
      .catch((e) => {
        console.log(e);
      });
  }

  for (var pkg in data.devDependencies) {
    let loader = writer.loading(`installing development package::${pkg}...`);
    loader.start();
    return await run(
      `npm list ${pkg}@${data.devDependencies[pkg]} || npm i ${pkg}@${data.devDependencies[pkg]} --save-dev`,
      loader.stop.bind(this),
    )
      .then((r) => r)
      .catch((e) => {
        console.log(e);
      });
  }
};

export const runBuildScript = async (writer) => {
  let loader = writer.loading(`revving up your Engine...`);
  loader.start();
  return await run(
    `cp ${basePath}/nuxt.config.js ./nuxt.config.js && nuxt build `,
    (data) => {
      console.log(data);
      loader.stop(data + chalk.green("configuring buildscript::[OK]"));
    },
  )
    .then((r) => r)
    .catch((e) => {
      console.log(e);
    });
};

export const stateHandler = {
  set(target, key, value) {
    target[key] = value;
    updateState(target);
    return true;
  },
};

/****
 * checking params
 */
export default async (config, writer, dir) => {
  _config = config;
  let loader = writer.loading("Checking dirs");
  let driver = config.compiler.driver;
  let engine = config.compiler.engines[driver];
  let conv = { ...(await nuxt.setup()) };
  let engineConfig = Object.assign(engine.config, conv.configFile || {});
  try {
    let errors = [];
    loader.start();
    basePath = path.join(dir, config.compiler.outDir);
    await checkBaseDir(basePath);
    loader.stop(console.log(`${dir}::[OK]`));
    await checkAndWriteFile(
      path.join(basePath, config.compiler.serverFile),
      JSON.stringify(conv.serverFile, null, 2),
      writer,
    );

    let state = new Proxy(
      <any>(
        JSON.parse(
          (await readFile(
            path.join(basePath, config.compiler.serverFile),
          )) as string,
        )
      ),
      stateHandler,
    ) as stateFile;

    let _engineConfig = await import(
      path.join(__filepath, config.compiler.outDir, "nuxt.config.js")
    ).catch((e) => {});

    /**
     * check package dependencies
     */
    if (state.package < 1) {
      await installPackages(Object.assign(conv.pkg, engine.package), writer);
      state.package = 1;
    }
    /**
     * check config file
     */
    if (!_engineConfig || state.state < 2) {
      let confContent = inspect(engineConfig, {
        showHidden: false,
        customInspect: false,
        depth: null,
      });
      await checkAndWriteFile(
        path.join(basePath, "nuxt.config.js"),
        `export default ${confContent}`,
        writer,
      );
      state.state = 2;
    }

    /**
     * Update nuxt file if configs are changed
     */
    if (
      _engineConfig?.default &&
      !__deepEqual(_engineConfig?.default, engineConfig)
    ) {
      let confContent = inspect(engineConfig, {
        showHidden: false,
        customInspect: false,
        depth: null,
      });
      return await updateFile(
        path.join(basePath, "nuxt.config.js"),
        `export default ${confContent}`,
      );
    }

    if (engine.useProdEnv) {
      await runBuildScript(writer);
    }
  } catch (e) {
    throw e;
  }
};
