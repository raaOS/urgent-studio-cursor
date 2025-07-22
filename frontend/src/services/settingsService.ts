
'use server';

// Semua fungsi settings dinonaktifkan karena Firestore dihapus
export async function getControlSettings() {
  return { productLimitWeekly: 0, revenueTarget: 0 };
}
export async function updateControlSettings() {
  return true;
}
