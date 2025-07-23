export function handleError(error: unknown): void {
  if (error instanceof Error) {
    console.error("Error:", error.message);
  } else {
    console.error("Unknown error:", error);
  }
}