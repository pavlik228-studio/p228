export class Logger {
  public static log(...args: unknown[]): void {}
}

if (process.env['NODE_ENV'] !== 'production') {
  Logger.log = console.log.bind(console, '[P228]');
  Logger.log('Logger.log is enabled');
}
