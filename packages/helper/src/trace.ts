import debug from "debug";

export { Trace };

enum Level {
  error = 1,
  info,
  warn,
  debug,
  trace,
}

type LevelKey = keyof typeof Level;

interface ITrace {
  trace(formatter: any, ...args: any[]): void;
  debug(formatter: any, ...args: any[]): void;
  warn(formatter: any, ...args: any[]): void;
  info(formatter: any, ...args: any[]): void;
  error(formatter: any, ...args: any[]): void;
}

class Trace implements ITrace {
  private base: debug.Debugger;
  private debuggers: Array<debug.Debugger> = [];
  constructor(namespace: string) {
    this.base = debug(namespace);

    const colors = Object.keys(Level).reduce((obj, key) => {
      obj[`${namespace}:${key}`] = Level[key as LevelKey];
      return obj;
    }, {} as Record<string, Level>);
    debug.selectColor = (ns) => colors[ns] || "";

    this.debuggers = (Object.keys(Level) as Array<LevelKey>).reduce((logger, le) => {
      logger[Level[le]] = this.base.extend(le);
      return logger;
    }, [] as Array<debug.Debugger>);
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
    Trace.instance.error?.(formatter, ...args);
  }
  static info(formatter: any, ...args: any[]): void {
    Trace.instance.info?.(formatter, ...args);
  }
  static warn(formatter: any, ...args: any[]): void {
    Trace.instance.warn?.(formatter, ...args);
  }
  static debug(formatter: any, ...args: any[]): void {
    Trace.instance.debug?.(formatter, ...args);
  }
  static trace(formatter: any, ...args: any[]): void {
    Trace.instance.trace?.(formatter, ...args);
  }

  static instance: Trace;

  static init(namespace: string) {
    return (Trace.instance ||= new Trace(namespace));
  }
}
