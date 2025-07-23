import React from 'react';

// AppException class definition
export class AppException extends Error {
  public code: string;
  public statusCode: number;

  constructor(code: string, message: string, statusCode: number = 500) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.name = 'AppException';
  }
}

// Global error handler for production
class ProductionErrorHandler {
  private static instance: ProductionErrorHandler;
  
  private constructor() {
    this.setupGlobalErrorHandlers();
  }
  
  public static getInstance(): ProductionErrorHandler {
    ProductionErrorHandler.instance ??= new ProductionErrorHandler();
    return ProductionErrorHandler.instance;
  }
  
  private setupGlobalErrorHandlers(): void {
    // Handle unhandled promise rejections
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
        this.logError('unhandled_promise_rejection', event.reason);
        event.preventDefault();
      });
      
      // Handle global errors
      window.addEventListener('error', (event) => {
        console.error('Global error:', event.error);
        this.logError('global_error', event.error);
      });
    }
  }
  
  public logError(type: string, error: unknown, context?: unknown): void {
    // Type guard untuk memeriksa apakah error memiliki properti message dan stack
    const errorMessage = error instanceof Error ? error.message : 
                        typeof error === 'object' && error !== null && 'message' in error ? 
                        String((error as Record<string, unknown>).message) : 'Unknown error';
    
    const errorStack = error instanceof Error ? error.stack : 
                      typeof error === 'object' && error !== null && 'stack' in error ? 
                      String((error as Record<string, unknown>).stack) : undefined;
    
    const errorData: {
      type: string;
      message: string;
      stack?: string;
      timestamp: string;
      url: string;
      userAgent: string;
      context?: unknown;
    } = {
      type,
      message: errorMessage,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'server',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      context
    };
    
    // Only add stack if it exists
    if (errorStack !== null && errorStack !== undefined && errorStack !== "") {
      errorData.stack = errorStack;
    }
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', errorData);
    }
    
    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      void this.sendToMonitoring(errorData);
    }
  }
  
  private async sendToMonitoring(errorData: {
    type: string;
    message: string;
    stack?: string;
    timestamp: string;
    url: string;
    userAgent: string;
    context?: unknown;
  }): Promise<void> {
    try {
      // Send to your monitoring service (e.g., Sentry, LogRocket, etc.)
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData)
      });
    } catch (err) {
      console.error('Failed to send error to monitoring:', err);
    }
  }
  
  public wrapAsync<T>(fn: () => Promise<T>, context?: string): Promise<T> {
    return fn().catch((error) => {
      this.logError('async_error', error, { context });
      throw error;
    });
  }
  
  public wrapComponent<P extends object>(
    Component: React.ComponentType<P>,
    componentName?: string
  ): React.ComponentType<P> {
    return (props: P) => {
      try {
        return React.createElement(Component, props);
      } catch (error) {
        this.logError('component_error', error, { componentName });
        
        // Return error boundary fallback
        return React.createElement('div', {
          className: "p-4 border border-red-200 rounded-lg bg-red-50"
        }, [
          React.createElement('h3', {
            key: 'title',
            className: "text-red-800 font-semibold"
          }, 'Something went wrong'),
          React.createElement('p', {
            key: 'message',
            className: "text-red-600 text-sm mt-1"
          }, process.env.NODE_ENV === 'development' 
            ? error instanceof Error ? error.message : 'Unknown error'
            : 'Please refresh the page or try again later.'
          )
        ]);
      }
    };
  }
}

// Export singleton instance
export const errorHandler = ProductionErrorHandler.getInstance();

// Enhanced tryCatch with better error handling
export async function enhancedTryCatch<T>(
  operation: () => Promise<T>,
  context?: string
): Promise<T | AppException> {
  try {
    return await operation();
  } catch (error) {
    errorHandler.logError('service_error', error, { context });
    
    if (error instanceof AppException) {
      return error;
    }
    
    // Convert unknown errors to AppException
    return new AppException(
      'INTERNAL_ERROR',
      error instanceof Error ? error.message : 'An unexpected error occurred',
      500
    );
  }
}

// Error boundary component
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    errorHandler.logError('react_error_boundary', error, errorInfo);
  }
  
  render(): React.ReactNode {
    if (this.state.hasError) {
      return this.props.fallback ?? React.createElement('div', {
        className: "min-h-screen flex items-center justify-center bg-gray-50"
      }, React.createElement('div', {
        className: "max-w-md w-full bg-white shadow-lg rounded-lg p-6"
      }, [
        React.createElement('div', {
          key: 'header',
          className: "flex items-center mb-4"
        }, [
          React.createElement('div', {
            key: 'icon-container',
            className: "flex-shrink-0"
          }, React.createElement('svg', {
            className: "h-8 w-8 text-red-400",
            fill: "none",
            viewBox: "0 0 24 24",
            stroke: "currentColor"
          }, React.createElement('path', {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: 2,
            d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          }))),
          React.createElement('div', {
            key: 'title-container',
            className: "ml-3"
          }, React.createElement('h3', {
            className: "text-lg font-medium text-gray-900"
          }, 'Oops! Something went wrong'))
        ]),
        React.createElement('div', {
          key: 'message',
          className: "text-sm text-gray-500 mb-4"
        }, process.env.NODE_ENV === 'development' && this.state.error
          ? this.state.error.message
          : 'We apologize for the inconvenience. Please refresh the page or try again later.'
        ),
        React.createElement('button', {
          key: 'refresh-button',
          onClick: () => window.location.reload(),
          className: "w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        }, 'Refresh Page')
      ]));
    }
    
    return this.props.children;
  }
}