export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  [key: string]: any;
}

export class Logger {
  private static logLevels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  constructor(
    private name: string,
    private level: LogLevel = 'info'
  ) {}

  private shouldLog(level: LogLevel): boolean {
    return Logger.logLevels[level] >= Logger.logLevels[this.level];
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] [${this.name}] ${message}${contextStr}`;
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, context));
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, context));
    }
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (this.shouldLog('error')) {
      const errorContext = {
        ...context,
        ...(error instanceof Error ? {
          error: error.message,
          stack: error.stack,
        } : { error: String(error) }),
      };
      console.error(this.formatMessage('error', message, errorContext));
    }
  }

  child(name: string): Logger {
    return new Logger(`${this.name}:${name}`, this.level);
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }
}

// Factory function to create logger with config
export function createLogger(name: string, level: LogLevel = 'info'): Logger {
  return new Logger(name, level);
}