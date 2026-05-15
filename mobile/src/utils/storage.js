import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'disastersense_reports';

export async function saveReport(report) {
  try {
    const enrichedReport = {
      ...report,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      synced: false,
    };

    const existing = await getReports();
    const updated = [...existing, enrichedReport];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return enrichedReport;
  } catch (error) {
    console.error('saveReport error:', error);
    return null;
  }
}

export async function getReports() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (error) {
    console.error('getReports error:', error);
    return [];
  }
}

export async function markSynced(reportId) {
  try {
    const reports = await getReports();
    const updated = reports.map((r) =>
      r.id === reportId ? { ...r, synced: true } : r
    );
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error('markSynced error:', error);
    return null;
  }
}
