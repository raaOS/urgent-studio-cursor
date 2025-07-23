export function mockFetch<T>(response: T): () => Promise<T> {
  return async (): Promise<T> => response;
}