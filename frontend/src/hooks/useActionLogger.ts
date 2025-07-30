import { useCallback, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import logger from '@/services/logger';

export interface UserActionData {
  buttonId?: string;
  formName?: string;
  inputField?: string;
  value?: string | number | boolean;
  metadata?: Record<string, unknown>;
}

export interface UseActionLoggerReturn {
  logClick: (element: string, data?: UserActionData) => void;
  logFormSubmit: (formName: string, data?: UserActionData) => void;
  logInputChange: (fieldName: string, value: string | number | boolean) => void;
  logNavigation: (from: string, to: string) => void;
  logError: (error: Error, context?: string) => void;
  logPerformance: (metric: string, value: number, unit?: string) => void;
}

export function useActionLogger(componentName: string): UseActionLoggerReturn {
  const pathname = usePathname();

  // Log page view when component mounts or pathname changes
  useEffect(() => {
    logger.pageView(pathname, document.title);
  }, [pathname]);

  const logClick = useCallback((element: string, data?: UserActionData): void => {
    logger.userAction('click', componentName, {
      element,
      pathname,
      ...data,
    });
  }, [componentName, pathname]);

  const logFormSubmit = useCallback((formName: string, data?: UserActionData): void => {
    logger.userAction('form_submit', componentName, {
      formName,
      pathname,
      ...data,
    });
  }, [componentName, pathname]);

  const logInputChange = useCallback((fieldName: string, value: string | number | boolean): void => {
    logger.userAction('input_change', componentName, {
      fieldName,
      value: typeof value === 'string' && value.length > 100 ? '[TRUNCATED]' : value,
      pathname,
    });
  }, [componentName, pathname]);

  const logNavigation = useCallback((from: string, to: string): void => {
    logger.userAction('navigation', componentName, {
      from,
      to,
      pathname,
    });
  }, [componentName, pathname]);

  const logError = useCallback((error: Error, context?: string): void => {
    logger.error(`Component Error: ${componentName}`, {
      context,
      pathname,
      componentName,
    }, error);
  }, [componentName, pathname]);

  const logPerformance = useCallback((metric: string, value: number, unit: string = 'ms'): void => {
    logger.performance(`${componentName}.${metric}`, value, unit);
  }, [componentName]);

  return {
    logClick,
    logFormSubmit,
    logInputChange,
    logNavigation,
    logError,
    logPerformance,
  };
}

// Hook for tracking component lifecycle
export function useComponentLifecycle(componentName: string): void {
  const pathname = usePathname();

  useEffect(() => {
    const startTime = performance.now();
    
    logger.debug('Component Mounted', {
      componentName,
      pathname,
      timestamp: new Date().toISOString(),
    });

    return () => {
      const duration = performance.now() - startTime;
      logger.debug('Component Unmounted', {
        componentName,
        pathname,
        duration,
        timestamp: new Date().toISOString(),
      });
    };
  }, [componentName, pathname]);
}

// Hook for tracking API calls within components
export function useApiLogger(componentName: string): {
  logApiStart: (endpoint: string, method: string) => string;
  logApiSuccess: (requestId: string, endpoint: string, duration: number) => void;
  logApiError: (requestId: string, endpoint: string, error: Error, duration: number) => void;
} {
  const pathname = usePathname();

  const logApiStart = useCallback((endpoint: string, method: string): string => {
    const requestId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    logger.info('API Call Started', {
      requestId,
      endpoint,
      method,
      componentName,
      pathname,
    });

    return requestId;
  }, [componentName, pathname]);

  const logApiSuccess = useCallback((requestId: string, endpoint: string, duration: number): void => {
    logger.info('API Call Success', {
      requestId,
      endpoint,
      duration,
      componentName,
      pathname,
    });
  }, [componentName, pathname]);

  const logApiError = useCallback((requestId: string, endpoint: string, error: Error, duration: number): void => {
    logger.error('API Call Failed', {
      requestId,
      endpoint,
      duration,
      componentName,
      pathname,
    }, error);
  }, [componentName, pathname]);

  return {
    logApiStart,
    logApiSuccess,
    logApiError,
  };
}

export default useActionLogger;