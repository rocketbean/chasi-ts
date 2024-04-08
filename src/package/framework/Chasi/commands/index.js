import { Command } from "commander";
import generator from "./defaults/generator.js";
import "./Helper.js";
const program = new Command();

program
  .name("Chasi-cli")
  .description("Speeds up your development with chasi")
  .version("0.8.0");

program
  .command("create")
  .description("Helps you generate default files.")
  .arguments("<filename>", "filename to generate")
  .option("-m, --model", "generates a default copy of a Model.", "User")
  .option("-e, --event", "generates a default copy of a Event.", "event")
  .option(
    "-w, --middleware",
    "generates a default copy of a Middleware.",
    "default",
  )
  .option(
    "-c, --controller",
    "generates a default copy of a Controller",
    "HomeController",
  )
  .option("-r, --router", "generates a default copy of Router container", "web")
  .action(async (filename, options) => {
    return await generator(filename, options);
  });

program.parse(process.argv);
