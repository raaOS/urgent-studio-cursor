// Semua fungsi log dinonaktifkan karena Firestore dihapus
export type LogType = 'telegram' | 'general' | 'error';
export type LogStatus = 'success' | 'error' | 'info';
export type LogContext = Record<string, any>;
export type LogEntry = {
  id: string;
  message: string;
  status: LogStatus;
  timestamp: string;
  error?: string;
  context?: LogContext;
};
export async function addLog() { return ''; }
export async function getLogsWithListener(limitCount: number, callback: (logs: LogEntry[]) => void) {
  callback([]);
  return () => {};
}
