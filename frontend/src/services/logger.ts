/**
 * Frontend Logger Service
 * Provides structured logging with TypeScript safety
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: Error;
  requestId?: string;
  userId?: string;
  sessionId?: string;
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
  maxRetries: number;
}

class Logger {
  private config: LoggerConfig;
  private logQueue: LogEntry[] = [];
  private isProcessing = false;
  private userId?: string;
  private sessionId?: string;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: 'info',
      enableConsole: true,
      enableRemote: false,
      maxRetries: 3,
      ...config,
    };
  }

  // Configuration methods
  updateConfig(newConfig: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  setUserId(userId: string): void {
    this.userId = userId;
  }

  setSessionId(sessionId: string): void {
    this.sessionId = sessionId;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };
    return levels[level] >= levels[this.config.level];
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      requestId: this.generateRequestId(),
      sessionId: this.getSessionId(),
    };

    if (context) {
      entry.context = context;
    }

    if (error) {
      entry.error = error;
    }

    if (this.userId) {
      entry.userId = this.userId;
    }

    if (this.sessionId) {
      entry.sessionId = this.sessionId;
    }

    return entry;
  }

  private generateRequestId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getSessionId(): string {
    if (typeof window !== 'undefined') {
      let sessionId = sessionStorage.getItem('session_id');
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('session_id', sessionId);
      }
      return sessionId;
    }
    return 'server'; // Fallback for SSR
  }

  private logToConsole(entry: LogEntry): void {
    if (!this.config.enableConsole) return;

    const logMethod = console[entry.level] || console.log;
    const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;
    
    if (entry.error) {
      logMethod(prefix, entry.message, entry.context, entry.error);
    } else {
      logMethod(prefix, entry.message, entry.context);
    }
  }

  private async logToRemote(entry: LogEntry): Promise<void> {
    if (!this.config.enableRemote || !this.config.remoteEndpoint) return;

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      console.error('Failed to send log to remote endpoint:', error);
    }
  }

  private async processLogQueue(): Promise<void> {
    if (this.isProcessing || this.logQueue.length === 0) return;

    this.isProcessing = true;
    const batch = this.logQueue.splice(0, 10); // Process in batches

    for (const entry of batch) {
      try {
        await this.logToRemote(entry);
      } catch (error) {
        console.error('Failed to process log entry:', error);
      }
    }

    this.isProcessing = false;

    // Process remaining queue if any
    if (this.logQueue.length > 0) {
      setTimeout(() => this.processLogQueue(), 1000);
    }
  }

  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: Error
  ): void {
    if (!this.shouldLog(level)) return;

    const entry = this.createLogEntry(level, message, context, error);
    
    this.logToConsole(entry);
    
    if (this.config.enableRemote) {
      this.logQueue.push(entry);
      this.processLogQueue();
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
  }

  error(message: string, context?: Record<string, unknown>, error?: Error): void {
    this.log('error', message, context, error);
  }

  // Specialized logging methods
  apiCall(method: string, url: string, status: number, duration: number): void {
    this.info('API Call', {
      method,
      url,
      status,
      duration,
      type: 'api_call',
    });
  }

  userAction(action: string, component: string, data?: Record<string, unknown>): void {
    this.info('User Action', {
      action,
      component,
      data,
      type: 'user_action',
    });
  }

  pageView(path: string, title?: string): void {
    this.info('Page View', {
      path,
      title,
      type: 'page_view',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
    });
  }

  performance(metric: string, value: number, unit: string = 'ms'): void {
    this.info('Performance Metric', {
      metric,
      value,
      unit,
      type: 'performance',
    });
  }
}

// Create singleton instance
const logger = new Logger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  enableConsole: true,
  enableRemote: process.env.NODE_ENV === 'production',
  remoteEndpoint: '/api/logs',
});

export default logger;