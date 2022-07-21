import { ExceptionLoggerInterface } from "../Interfaces.js";
import DatabaseLogger from "./loggers/Database.js";
import TerminalLogger from "./loggers/Terminal.js";
import TextfileLogger from "./loggers/Textfile.js";

export default class ExceptionLogger {
  static writers: { [key: string]: any } = {
    database: DatabaseLogger,
    terminal: TerminalLogger,
    textfile: TextfileLogger,
  };

  writer: ExceptionLoggerInterface;

  constructor(public config: any) {
    this.config = config;
    this.writer = new ExceptionLogger.writers[config.LogType.type]();
  }

  getLogger() {}
}
