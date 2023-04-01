import debug from "debug";

export { Logger };

enum Level {
  error = 1,
  info,
  warn,
  debug,
  trace,
}

type LevelKey = keyof typeof Level;

interface ILogger {
  trace(formatter: any, ...args: any[]): void;
  debug(formatter: any, ...args: any[]): void;
  warn(formatter: any, ...args: any[]): void;
  info(formatter: any, ...args: any[]): void;
  error(formatter: any, ...args: any[]): void;
}

class Logger implements ILogger {
  private base: debug.Debugger;
  private debuggers: Array<debug.Debugger> = [];
  constructor(namespace: string) {
    this.base = debug(namespace);

    const colors = {} as Record<string, Level>;
    for (const key in Level) {
      colors[`${namespace}:${key}`] = Level[key as LevelKey];
    }

    debug.selectColor = (ns) => colors[ns] || "";

    this.debuggers = [] as Array<debug.Debugger>;
    for (const key in Level) {
      this.debuggers[+Level[key]] = this.base.extend(key);
    }
  }

  error(formatter: any, ...args: any[]): void {
    this.debuggers[Level.error]?.(formatter, ...args);
  }
  info(formatter: any, ...args: any[]): void {
    this.debuggers[Level.info]?.(formatter, ...args);
  }
  warn(formatter: any, ...args: any[]): void {
    this.debuggers[Level.warn]?.(formatter, ...args);
  }
  debug(formatter: any, ...args: any[]): void {
    this.debuggers[Level.debug]?.(formatter, ...args);
  }
  trace(formatter: any, ...args: any[]): void {
    this.debuggers[Level.trace]?.(formatter, ...args);
  }

  static error(formatter: any, ...args: any[]): void {
    Logger.instance?.error?.(formatter, ...args);
  }
  static info(formatter: any, ...args: any[]): void {
    Logger.instance?.info?.(formatter, ...args);
  }
  static warn(formatter: any, ...args: any[]): void {
    Logger.instance?.warn?.(formatter, ...args);
  }
  static debug(formatter: any, ...args: any[]): void {
    Logger.instance?.debug?.(formatter, ...args);
  }
  static trace(formatter: any, ...args: any[]): void {
    Logger.instance?.trace?.(formatter, ...args);
  }

  static instance: Logger;

  static init(namespace: string) {
    return (Logger.instance ||= new Logger(namespace));
  }
}
