import { Iobject } from "../../framework/Interfaces.js";
import chalk from "chalk";
import Writer, { Writable } from "./Writer.js";
export default class Reporter extends Writer implements Writable {
  format(message: string) {
    let width: number = this.cols;
  }

  customFormat(message: string, obs: any) {
    let bar: number = this.cols * 0.6;
    let str = "\r";
    let rssPer = bar;
    let obsRss = ` ${obs.rss}MB`;
    let rssLen = rssPer;
    let _rssLen = rssLen - obsRss.length;

    let totHeapPer = obs.total / obs.rss;
    let totHeap = ` ${(totHeapPer * 100).toFixed(2)}%`;
    let totStr = rssPer * totHeapPer;
    let _stLen = totStr - totHeap.length;

    let toUsedPer = obs.used / obs.total;
    let usedHeap = ` ${(toUsedPer * 100).toFixed(2)}%`;
    let usedStr = totStr * toUsedPer;
    let _usedLen = usedStr - usedHeap.length;

    str += chalk.blueBright(`rss: ${obs.rss} MB \n`);
    str += chalk.cyan(`HeapTotal: ${obs.total.toFixed(2)}MB \n`);
    str += chalk.yellow(`HeapUsed: ${obs.used.toFixed(2)}MB \n`);
    str += "Memory Usage[Avg]: ";
    str += chalk.bgYellow(chalk.blue(usedHeap) + this.fill(_usedLen));
    str += chalk.bgCyan(chalk.red(totHeap) + this.fill(_stLen - usedStr));
    str +=
      chalk.bgBlueBright(chalk.yellow(obsRss) + this.fill(_rssLen - totStr)) +
      " \n";
    return str;
  }
}
