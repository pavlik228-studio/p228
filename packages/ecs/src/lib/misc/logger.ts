import * as process from 'process'

export class Logger {
  public static log(...args: unknown[]): void {}
}

try {
  if (process.env['NODE_ENV'] !== 'production') {
    Logger.log = console.log.bind(console, '[P228]')
  }
} catch (e) {
  // ignore
}