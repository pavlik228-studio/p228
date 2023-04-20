export class Logger {
  public static log(..._: unknown[]): void {}
}

Logger.log = console.log.bind(console, '[P228]')