import Writer, { Writable } from "./Writer.js";
import _style from "../styles/style.js";
import chalk from "chalk";
import Router from "../../framework/Router/Router.js";
import Endpoint from "../../framework/Router/Endpoint.js";

export default class RouterList extends Writer implements Writable {
  format(message: string) {
    return message;
  }

  center(message: string, cols: number) {
    let width: number = cols / 2;
    let mw: number = message.length / 2;
    message = this.fill(width - mw) + message + this.fill(width - mw);
    if (message.length < cols) {
      message += this.fill(cols - message.length);
    }
    return _style.subsystem(message);
  }

  startTrace(ep: Endpoint, method: string) {
    let message = ep.path;
    let width: number = Math.floor(this.cols / 1.8);
    let threshold = width - message.length - method.length;
    let fullMessage = this.fill(threshold, "-") + message;
    if (ep.exceptions.length > 0) {
      fullMessage = chalk.rgb(175, 125, 25)(fullMessage);
    }
    if (ep.unmatched) {
      fullMessage = _style["adjusted"](fullMessage);
    }
    return fullMessage;
  }

  /***
   */
  setTags(tags) {
    return Object.keys(tags).map((key: string): { [key: string]: any } => {
      let style;
      if (typeof tags[key] == "boolean") {
        if (tags[key]) style = _style.RouterTags(`[${key}]`);
        else style = _style.bgBrightNegative(`[${key}]`);
        let _tk = `[${key}] `;
        return {
          key: _tk,
          style,
          count: _tk.length,
        };
      }
    });
  }

  formatHeader(router: Router) {
    let displayname = `[...${router.property.prefix.toUpperCase()}]`,
      _tags = this.setTags({
        auth: router.property.auth ? true : false,
      });
    if (router.property?.mount) {
      router.property?.mount.map((_m) => {
        let _tk = `[${_m.name}:${_m.props.join("|")}]`;
        _tags.push({
          key: [`${_m.name}`],
          style: _style.RouterTags(_tk.toUpperCase()),
          count: _tk.length,
        });
      });
    }

    let cols = this.cols - displayname.length;
    cols -= _tags.reduce((a, b) => a + b.count, 0);
    return `${_style.RouterName(displayname)}:${_tags
      .map((tag) => tag.style)
      .join(" ")} ${this.center(
      `[${router.property.name.toUpperCase()}]::Router`,
      cols - 2,
    )}`;
  }

  formatPath(router: Router) {
    router.$registry.routes.forEach((ep: Endpoint) => {
      let writeStyle;
      let _m = `[${ep.property.method.toUpperCase()}]`;
      if (ep.unmatched) writeStyle = "adjusted";
      else writeStyle = "warning";

      this.write(
        `${_style[writeStyle](_m)}${this.startTrace(ep, _m)}| ${ep.groups
          .map(
            (group) => `${_style.coolText("[" + group.property.prefix + "]")}`,
          )
          .join("")}\n`,
        "clear",
        "routeRegistry",
      );

      if (ep.exceptions.length > 0) {
        ep.exceptions.forEach((exc) => {
          exc.log();
        });
      }
    });
  }

  displayRouter(route: Router) {
    this.write(
      "\n" + this.formatHeader(route) + "\n",
      "clear",
      "routeRegistry",
    );
    this.formatPath(route);
  }
}
