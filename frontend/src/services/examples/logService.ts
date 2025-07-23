/* eslint-disable no-console */
export function logInfo(message: string): void {
  console.log("INFO:", message);
}

export function logError(error: unknown): void {
  if (error instanceof Error) {
    console.error("ERROR:", error.message);
  } else {
    console.error("ERROR:", error);
  }
}