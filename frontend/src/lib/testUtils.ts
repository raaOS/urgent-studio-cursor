/**
 * File utilitas untuk testing yang menyediakan fungsi-fungsi mock
 * untuk testing dengan Jest
 */

// Definisi tipe untuk respons API
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
  errorCode?: string;
}

/**
 * Membuat fungsi mock sederhana
 */
export function fn(): {
  (...args: unknown[]): unknown;
  calls: unknown[][];
  implementation: null | ((...args: unknown[]) => unknown);
  mockImplementation: (impl: (...args: unknown[]) => unknown) => unknown;
  mockResolvedValue: (value: unknown) => unknown;
  mockRejectedValue: (error: unknown) => unknown;
} {
  const mockFn = function(...args: unknown[]): unknown {
    mockFn.calls.push(args);
    return mockFn.implementation ? mockFn.implementation(...args) : undefined;
  };
  
  mockFn.calls = [] as unknown[][];
  mockFn.implementation = null as null | ((...args: unknown[]) => unknown);
  
  mockFn.mockImplementation = function(impl: (...args: unknown[]) => unknown): unknown {
    mockFn.implementation = impl;
    return mockFn;
  };
  
  mockFn.mockResolvedValue = function(value: unknown): unknown {
    return mockFn.mockImplementation(() => Promise.resolve(value));
  };
  
  mockFn.mockRejectedValue = function(error: unknown): unknown {
    return mockFn.mockImplementation(() => Promise.reject(error));
  };
  
  return mockFn;
}

/**
 * Namespace untuk fungsi-fungsi mock
 */
export const vi = {
  fn
};

/**
 * Tipe untuk fungsi mock
 */
export type Mock<T = unknown, Y extends unknown[] = unknown[]> = ReturnType<typeof fn> & {
  implementation: null | ((...args: Y) => T);
  calls: Y[];
  mockImplementation(impl: (...args: Y) => T): Mock<T, Y>;
  mockResolvedValue(value: T): Mock<Promise<T>, Y>;
  mockRejectedValue(error: unknown): Mock<Promise<T>, Y>;
};
