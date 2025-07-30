'use client';

import React, { createContext, useContext, useEffect, ReactNode } from 'react';

// Define logger interface
interface LoggerInterface {
  info: (message: string, context?: Record<string, unknown>) => void;
  debug: (message: string, context?: Record<string, unknown>) => void;
  warn: (message: string, context?: Record<string, unknown>) => void;
  error: (message: string, context?: Record<string, unknown>, error?: Error) => void;
  setUserId: (userId: string) => void;
  setSessionId: (sessionId: string) => void;
  updateConfig: (config: Record<string, unknown>) => void;
}

// Fallback logger
const fallbackLogger: LoggerInterface = {
  info: (message: string, context?: Record<string, unknown>) => console.log('[INFO]', message, context),
  debug: (message: string, context?: Record<string, unknown>) => console.log('[DEBUG]', message, context),
  warn: (message: string, context?: Record<string, unknown>) => console.warn('[WARN]', message, context),
  error: (message: string, context?: Record<string, unknown>, error?: Error) => console.error('[ERROR]', message, context, error),
  setUserId: () => {},
  setSessionId: () => {},
  updateConfig: () => {},
};

// Initialize logger
let logger: LoggerInterface = fallbackLogger;

interface LoggerContextValue {
  logger: typeof logger;
  isInitialized: boolean;
}

const LoggerContext = createContext<LoggerContextValue | undefined>(undefined);

interface LoggerProviderProps {
  children: ReactNode;
  config?: {
    enableRemote?: boolean;
    enableConsole?: boolean;
    level?: 'debug' | 'info' | 'warn' | 'error';
    userId?: string;
    sessionId?: string;
  };
}

export function LoggerProvider({ children, config = {} }: LoggerProviderProps): JSX.Element {
  const [isInitialized, setIsInitialized] = React.useState(false);

  useEffect(() => {
    // Initialize logger with configuration
    const initLogger = async (): Promise<void> => {
      try {
        // Try to load the actual logger service
        try {
          const loggerModule = await import('@/services/logger');
          logger = loggerModule.default;
        } catch (importError) {
          console.warn('Failed to import logger service, using fallback:', importError);
          // Keep using fallback logger
        }

        // Set user and session information if provided
        if (config.userId) {
          logger.setUserId(config.userId);
        }
        
        if (config.sessionId) {
          logger.setSessionId(config.sessionId);
        }

        // Configure logger based on environment
        const isDevelopment = process.env.NODE_ENV === 'development';
        
        // Update logger configuration
        logger.updateConfig({
          enableConsole: config.enableConsole ?? isDevelopment,
          enableRemote: config.enableRemote ?? !isDevelopment,
          level: config.level ?? (isDevelopment ? 'debug' : 'info'),
        });

        // Log initialization
        logger.info('Logger Provider Initialized', {
          environment: process.env.NODE_ENV,
          enableConsole: config.enableConsole ?? isDevelopment,
          enableRemote: config.enableRemote ?? !isDevelopment,
          level: config.level ?? (isDevelopment ? 'debug' : 'info'),
          hasUserId: !!config.userId,
          hasSessionId: !!config.sessionId,
        });

        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize logger:', error);
        setIsInitialized(true); // Still set to true to prevent blocking
      }
    };

    initLogger();
  }, [config.userId, config.sessionId, config.enableConsole, config.enableRemote, config.level]);

  // Log unhandled errors
  useEffect(() => {
    const handleUnhandledError = (event: ErrorEvent): void => {
      logger.error('Unhandled JavaScript Error', {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        type: 'unhandled_error',
      }, event.error);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent): void => {
      logger.error('Unhandled Promise Rejection', {
        reason: event.reason,
        type: 'unhandled_rejection',
      }, event.reason instanceof Error ? event.reason : new Error(String(event.reason)));
    };

    window.addEventListener('error', handleUnhandledError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleUnhandledError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  });

  // Log page visibility changes
  useEffect(() => {
    const handleVisibilityChange = (): void => {
      logger.info('Page Visibility Changed', {
        hidden: document.hidden,
        visibilityState: document.visibilityState,
        type: 'visibility_change',
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  });

  const contextValue: LoggerContextValue = {
    logger,
    isInitialized,
  };

  return (
    <LoggerContext.Provider value={contextValue}>
      {children}
    </LoggerContext.Provider>
  );
}

export function useLogger(): LoggerContextValue {
  const context = useContext(LoggerContext);
  
  if (context === undefined) {
    throw new Error('useLogger must be used within a LoggerProvider');
  }
  
  return context;
}

// HOC for automatic component logging
export function withLogging<P extends Record<string, unknown>>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
): React.ComponentType<P> {
  const displayName = componentName || WrappedComponent.displayName || WrappedComponent.name || 'Component';
  
  const WithLoggingComponent = (props: P): JSX.Element => {
    const { logger: loggerInstance } = useLogger();
    
    useEffect(() => {
      const startTime = performance.now();
      
      loggerInstance.debug('Component Mounted', {
        componentName: displayName,
        props: Object.keys(props as object),
      });
      
      return () => {
        const duration = performance.now() - startTime;
        loggerInstance.debug('Component Unmounted', {
          componentName: displayName,
          duration,
        });
      };
    }, [loggerInstance, props]);
    
    return <WrappedComponent {...props} />;
  };
  
  WithLoggingComponent.displayName = `withLogging(${displayName})`;
  
  return WithLoggingComponent;
}

export default LoggerProvider;