import chalk from "chalk";

export default {
  system: chalk.dim.bold.yellow,
  silver: chalk.bgGrey.yellow,
  subsystem: chalk.bgGreen.bold.rgb(0, 70, 0),
  light: chalk.green,
  bgpositive: chalk.green.bgBlack,
  positive: chalk.green,
  negative: chalk.red,
  magenta: chalk.magenta,
  cool: chalk.bgHex("484276").bold,
  systemRead: chalk.bgGrey.yellowBright,
  json: chalk.white,
  clear: chalk,
  danger: chalk.red.bgWhite,
  severe: chalk.red.bgBlack,
  warning: chalk.yellow,
  coolText: chalk.hex("986498"),
  lightGreen: chalk.bgGreenBright.rgb(0, 0, 0),
};
