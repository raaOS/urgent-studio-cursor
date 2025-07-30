/**
 * Frontend Logging Configuration
 * Test file untuk menguji implementasi logging
 */

import logger from '@/services/logger';

// Test logging functions
export const testLogging = (): void => {
  console.log('=== Testing Frontend Logging ===');

  // Test basic logging levels
  logger.debug('Debug message test', { testType: 'debug' });
  logger.info('Info message test', { testType: 'info' });
  logger.warn('Warning message test', { testType: 'warn' });
  logger.error('Error message test', { testType: 'error' }, new Error('Test error'));

  // Test API call logging
  logger.apiCall('GET', '/api/test', 200, 150);

  // Test user action logging
  logger.userAction('click', 'TestComponent', {
    element: 'test-button',
    metadata: { testData: 'value' },
  });

  // Test page view logging
  logger.pageView('/test-page', 'Test Page Title');

  // Test performance logging
  logger.performance('test-metric', 250, 'ms');

  console.log('=== Logging Test Complete ===');
};

// Test remote logging
export const testRemoteLogging = async (): Promise<void> => {
  try {
    const testLog = {
      level: 'info' as const,
      message: 'Test remote logging',
      timestamp: new Date().toISOString(),
      context: {
        testType: 'remote',
        environment: 'development',
      },
    };

    const response = await fetch('/api/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testLog),
    });

    const result = await response.json();
    console.log('Remote logging test result:', result);
  } catch (error) {
    console.error('Remote logging test failed:', error);
  }
};

// Test batch logging
export const testBatchLogging = async (): Promise<void> => {
  try {
    const batchLogs = [
      {
        level: 'info' as const,
        message: 'Batch log 1',
        timestamp: new Date().toISOString(),
        context: { batchIndex: 1 },
      },
      {
        level: 'warn' as const,
        message: 'Batch log 2',
        timestamp: new Date().toISOString(),
        context: { batchIndex: 2 },
      },
      {
        level: 'error' as const,
        message: 'Batch log 3',
        timestamp: new Date().toISOString(),
        context: { batchIndex: 3 },
        error: {
          name: 'TestError',
          message: 'Test batch error',
          stack: 'Error stack trace...',
        },
      },
    ];

    const response = await fetch('/api/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(batchLogs),
    });

    const result = await response.json();
    console.log('Batch logging test result:', result);
  } catch (error) {
    console.error('Batch logging test failed:', error);
  }
};

// Extend window interface for test functions
declare global {
  interface Window {
    testLogging?: () => void;
    testRemoteLogging?: () => Promise<void>;
    testBatchLogging?: () => Promise<void>;
  }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.testLogging = testLogging;
  window.testRemoteLogging = testRemoteLogging;
  window.testBatchLogging = testBatchLogging;
}