import {
  SessionStorageData,
  SessionStorageClusterData,
  Iobject,
} from "../Interfaces.js";
import chalk from "chalk";
import PipeHandler from "./PipeHandler.js";
import cluster from "cluster";

export default class SessionStorage {
  public data: SessionStorageData = {
    threads: [],
    reports: {},
    database: [],
    routeRegistry: [],
    services: [],
    boot: [],
    exceptions: [],
    logs: [],
    workers: [],
  };

  public strData: string = "";
  public clusterData: Iobject = {};
  public enabled: boolean;
  public pipe: PipeHandler;
  public ReportLog: any = Logger.writers["Reporter"];

  private _redrawTimer: NodeJS.Timeout | null = null;
  private _resizeHandler: (() => void) | null = null;
  private _perfInterval: NodeJS.Timeout | null = null;

  constructor(public config: Iobject) {
    if (cluster.isPrimary) {
      this._resizeHandler = () => this._redraw();
      process.stdout.on("resize", this._resizeHandler);
      if (this.config?.trackUsage?.enabled) {
        this._perfInterval = setInterval(this.reportPerf.bind(this), this.config.trackUsage.interval);
      }
    }
  }

  destroy(): void {
    if (this._resizeHandler) {
      process.stdout.off("resize", this._resizeHandler);
      this._resizeHandler = null;
    }
    if (this._perfInterval) {
      clearInterval(this._perfInterval);
      this._perfInterval = null;
    }
    if (this._redrawTimer) {
      clearTimeout(this._redrawTimer);
      this._redrawTimer = null;
    }
  }

  async setPipe(pipe: PipeHandler): Promise<void> {
    this.pipe = pipe;
    if (cluster.isWorker) {
      await this.pipe.write({ action: "getClusterData" });
    }
  }

  setClusterData(d: SessionStorageClusterData): void {
    if (cluster.isPrimary) {
      this.clusterData = d;
      this.appendClusterData();
    }
  }

  reportPerf() {
    this.data.reports = this.requestPerf();
    this._redraw();
  }

  requestPerf() {
    let rss = Math.round((process.memoryUsage().rss / 1024 / 1024) * 100) / 100;
    let used =
      Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100;
    let total =
      Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100;

    let log = this.ReportLog.customFormat("", {
      rss,
      used,
      total,
    });
    return {
      memory: log,
    };
  }

  getWorkerData(): void {
    return;
  }

  appendClusterData() {
    let sched =
      this.clusterData.scheduling == 1 ? "[1]os specified" : "[2]RoundRobin";
    if (this.data.threads.length == 0) {
      this.data.threads.push(
        chalk.bold.magentaBright(`Active thread/s : `) +
        `[${this.clusterData.threads}]\n`,
        chalk.bold.magentaBright(`Scheduling      : `) + sched + "\n",
        chalk.bold.magentaBright(`MainThread      : `) +
        this.clusterData.process +
        "\n",
        chalk.bold.magentaBright(`Lead            : `) + process.pid + "\n",
        chalk.bold.magentaBright(`PIDs            : `) +
        this.clusterData?.pids?.join(" ") +
        "\n",
      );
    }
  }

  private _redraw(): void {
    // Debounce: collapse rapid bursts (worker pipe messages, resize events)
    // into a single repaint ~60 ms after the last trigger.
    if (this._redrawTimer) clearTimeout(this._redrawTimer);
    this._redrawTimer = setTimeout(() => {
      this._redrawTimer = null;
      // \x1b[2J  — erase the visible screen (does NOT clear scrollback, so
      //             the user can still scroll up to read previous output).
      // \x1b[H   — move cursor to row 1, col 1.
      process.stdout.write("\x1b[2J\x1b[H" + this.format(this.data));
    }, 50);
  }

  private get _cols(): number {
    return process.stdout.columns || 100;
  }

  private _fill(n: number, ch = "─"): string {
    return n > 0 ? ch.repeat(n) : "";
  }

  private _uptime(): string {
    const s = Math.floor(process.uptime());
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ${s % 60}s`;
    return `${Math.floor(m / 60)}h ${m % 60}m`;
  }

  private _stripAnsi(s: string): string {
    return s.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, "");
  }

  format(data: any): string {
    const cols = this._cols;
    const ver = process.env.npm_package_version || process.env.APP_VERSION || "unknown";
    // ── header banner ─────────────────────────────────────────────
    const titleText = `  ◆  CHASI-TS  v${ver}  `;
    const headerPad = this._fill(Math.max(0, cols - titleText.length));
    const header =
      chalk.bgHex("0d0d1a").bold.hex("c4b5fd")(titleText) +
      chalk.bgHex("0d0d1a").hex("312e81")(headerPad);

    // ── runtime status ────────────────────────────────────────────
    const dot  = chalk.hex("334155")(" · ");
    const env  = (checkout(process.env.environment, "local") as string);
    const port = (checkout(process.env.ServerPort, "3010") as string);
    const statusLine =
      "  " +
      chalk.hex("4ade80").bold(`Node ${process.version}`) + dot +
      chalk.hex("94a3b8")(`PID ${process.pid}`)           + dot +
      chalk.hex("fbbf24").bold(`[${env}]`)                + dot +
      chalk.hex("38bdf8")(`port ${port}`)                 + dot +
      chalk.hex("a78bfa")(`up ${this._uptime()}`);

    let str = "\n" + header + "\n" + statusLine + "\n";

    // ── section metadata ──────────────────────────────────────────
    const sectionMeta: Record<string, { icon: string; style: Function; label: string }> = {
      threads:       { icon: "⬡", style: chalk.magenta,           label: "THREADS"        },
      reports:       { icon: "◇", style: chalk.rgb(80, 200, 120), label: "PERFORMANCE"    },
      database:      { icon: "●", style: chalk.cyan,              label: "DATABASE"       },
      routeRegistry: { icon: "▸", style: chalk.hex("a78bfa"),     label: "ROUTE REGISTRY" },
      services:      { icon: "◈", style: chalk.yellow,            label: "SERVICES"       },
      boot:          { icon: "◆", style: chalk.greenBright,       label: "BOOT"           },
      exceptions:    { icon: "✖", style: chalk.redBright,         label: "EXCEPTIONS"     },
      logs:          { icon: "◎", style: chalk.hex("64748b"),     label: "LOGS"           },
      workers:       { icon: "◌", style: chalk.blueBright,        label: "WORKERS"        },
    };

    const order = ["threads", "reports", "database", "routeRegistry", "services", "boot", "exceptions", "logs", "workers"];

    for (const group of order) {
      if (!(group in data)) continue;
      const isArr = Array.isArray(data[group]);
      const empty = isArr ? data[group].length === 0 : Object.keys(data[group]).length === 0;
      if (empty) continue;

      const { icon, style, label } = sectionMeta[group] ?? { icon: "○", style: chalk.white, label: group.toUpperCase() };

      // optional badge: route count for routeRegistry
      let badge = "";
      if (group === "routeRegistry") {
        const routeLines = (data[group] as string[]).filter((l: string) =>
          this._stripAnsi(l).includes("|")
        ).length;
        if (routeLines > 0) badge = chalk.dim(` [${routeLines} routes]`);
      }

      const rawLabel = ` ${icon}  ${label} `;
      const dashLen  = cols - rawLabel.length - this._stripAnsi(badge).length - 2;

      str += "\n " + style(rawLabel) + badge + " " + chalk.hex("1e293b")(this._fill(Math.max(0, dashLen))) + "\n";

      if (isArr) {
        str += (data[group] as string[]).map((m: string) => `   ${m}`).join("");
      } else {
        Object.keys(data[group]).forEach((k) => {
          str += `   ${data[group][k]}\n`;
        });
      }
    }

    str += "\n";
    return str;
  }

  write(message: any, target: string = "logs") {
    if (this.config.enabled) {
      if (cluster.isPrimary) {
        if (!Array.isArray(this.data[target])) this.data[target] = [];
        this.data[target].push(message);
        this._redraw();
      } else {
        // Exceptions surface from every worker; all other log sections
        // forward only from the lead worker to keep the dashboard noise-free.
        const isLead = process.env.lead === "1";
        if (target === "exceptions" || isLead) {
          setTimeout(() => {
            this.pipe?.write({ action: "logData", transmit: { message, target } });
          }, 20);
        }
      }
    } else {
      this.data[target].push(message);
      this._redraw();
    }
  }
}
