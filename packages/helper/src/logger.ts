import debug from 'debug';

enum Level {
  error = 1,
  info,
  warn,
  debug,
  trace,
}

type LevelKey = keyof typeof Level;

/**
 * @public
 */
export interface ILogger {
  trace(formatter: any, ...args: any[]): void;
  debug(formatter: any, ...args: any[]): void;
  warn(formatter: any, ...args: any[]): void;
  info(formatter: any, ...args: any[]): void;
  error(formatter: any, ...args: any[]): void;
}

const DefaultHandler: ILogger = {
  trace: () => {},
  debug: () => {},
  warn: () => {},
  info: () => {},
  error: () => {},
};

/**
 * @public
 */
export class Logger {
  static _handler: ILogger = DefaultHandler;

  static init(namespace: string) {
    return (this._handler ||= new DebugHandler(namespace));
  }

  static error(formatter: any, ...args: any[]): void {
    this._handler.error(formatter, ...args);
  }
  static info(formatter: any, ...args: any[]): void {
    this._handler.info(formatter, ...args);
  }
  static warn(formatter: any, ...args: any[]): void {
    this._handler.warn(formatter, ...args);
  }
  static debug(formatter: any, ...args: any[]): void {
    this._handler.debug(formatter, ...args);
  }
  static trace(formatter: any, ...args: any[]): void {
    this._handler.trace(formatter, ...args);
  }
}

class DebugHandler implements ILogger {
  private base: debug.Debugger;
  private debuggers: Array<debug.Debugger> = [];
  constructor(namespace: string) {
    this.base = debug(namespace);

    const colors = {} as Record<string, Level>;
    for (const key in Level) {
      colors[`${namespace}:${key}`] = Level[key as LevelKey];
    }

    debug.selectColor = ns => colors[ns] || '';

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
}
