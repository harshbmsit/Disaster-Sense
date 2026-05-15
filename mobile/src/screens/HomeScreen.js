import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  AppState,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { fetchAlerts, fetchRiskScore, checkHealth } from '../hooks/useApi';
import { WS_URL } from '../config';
import { sendTelegramAlert } from '../utils/telegram';
import OfflineBar from '../components/OfflineBar';
import LoadingScreen from '../components/LoadingScreen';
import ErrorScreen from '../components/ErrorScreen';

// ── Mock data fallback ──
const MOCK_ALERTS = [
  { id: '1', title: 'Flood Warning — Koramangala', severity: 'Critical', location: 'Koramangala, Bengaluru', time: '10 mins ago', description: 'Water levels rising rapidly near Koramangala lake.', instructions: 'Move to higher ground immediately.' },
  { id: '2', title: 'Heavy Rainfall Advisory', severity: 'Warning', location: 'South Bengaluru', time: '25 mins ago', description: 'IMD has issued heavy rainfall warning.', instructions: 'Avoid unnecessary travel.' },
  { id: '3', title: 'Thunderstorm Watch', severity: 'Advisory', location: 'Whitefield, Bengaluru', time: '1 hour ago', description: 'Thunderstorm activity detected.', instructions: 'Stay indoors if possible.' },
  { id: '4', title: 'Air Quality Monitor', severity: 'Monitor', location: 'North Bengaluru', time: '2 hours ago', description: 'AQI levels slightly elevated.', instructions: 'Sensitive individuals should limit outdoor exposure.' },
];

const SEVERITY_COLORS = {
  Monitor:  { badgeBg: '#3D3D3D', text: '#68D391', border: '#888888' },
  Advisory: { badgeBg: '#0D2137', text: '#63B3ED', border: '#2979FF' },
  Warning:  { badgeBg: '#2D1A00', text: '#F6AD55', border: '#FF6B35' },
  Critical: { badgeBg: '#2D0000', text: '#FC8181', border: '#FF0000' },
  // lowercase versions from backend
  monitor:  { badgeBg: '#3D3D3D', text: '#68D391', border: '#888888' },
  advisory: { badgeBg: '#0D2137', text: '#63B3ED', border: '#2979FF' },
  warning:  { badgeBg: '#2D1A00', text: '#F6AD55', border: '#FF6B35' },
  critical: { badgeBg: '#2D0000', text: '#FC8181', border: '#FF0000' },
};

const ALERT_LEVEL_COLORS = {
  Monitor:  '#68D391',
  Advisory: '#63B3ED',
  Warning:  '#F6AD55',
  Critical: '#FC8181',
};

function getSeverityLabel(sev) {
  if (!sev) return 'Monitor';
  return sev.charAt(0).toUpperCase() + sev.slice(1).toLowerCase();
}

function formatApiAlert(a, idx) {
  const sev = getSeverityLabel(a.severity);
  const time = a.timestamp ? new Date(a.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'Just now';
  return {
    id: a.id || String(idx + 1),
    title: a.type || a.title || 'Alert',
    severity: sev,
    location: a.location || 'Bengaluru',
    time: time,
    description: a.description || '',
    instructions: a.instructions || 'Stay alert and follow local authorities.',
  };
}

function AlertCard({ alert, onPress }) {
  const colors = SEVERITY_COLORS[alert.severity] || SEVERITY_COLORS.Monitor;
  return (
    <TouchableOpacity style={[styles.alertCard, { borderLeftColor: colors.border }]} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.alertTop}>
        <Text style={styles.alertTitle} numberOfLines={1}>{alert.title}</Text>
        <View style={[styles.severityBadge, { backgroundColor: colors.badgeBg }]}>
          <Text style={[styles.severityText, { color: colors.text }]}>{alert.severity}</Text>
        </View>
      </View>
      <View style={styles.alertBottom}>
        <Text style={styles.alertLocation}>📍 {alert.location}</Text>
        <Text style={styles.alertTime}>{alert.time}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [riskScore, setRiskScore] = useState(0);
  const [alertLevel, setAlertLevel] = useState('Monitor');
  const [isBackendOnline, setIsBackendOnline] = useState(true);

  const wsRef = useRef(null);
  const refreshInterval = useRef(null);

  // ── Load data ──
  const loadData = useCallback(async () => {
    try {
      const online = await checkHealth();
      setIsBackendOnline(online);

      if (online) {
        const [alertsData, riskData] = await Promise.all([
          fetchAlerts(),
          fetchRiskScore(),
        ]);

        const formattedAlerts = alertsData.length > 0
          ? alertsData.map(formatApiAlert)
          : MOCK_ALERTS;

        setAlerts(formattedAlerts);
        setRiskScore(Math.round(riskData.fused_score || 0));
        setAlertLevel(getSeverityLabel(riskData.alert_level || 'Monitor'));

        // Cache to AsyncStorage
        await AsyncStorage.setItem('cached_alerts', JSON.stringify(formattedAlerts));
        await AsyncStorage.setItem('cached_risk', JSON.stringify(riskData));
      } else {
        // Load from cache
        const cachedAlerts = await AsyncStorage.getItem('cached_alerts');
        const cachedRisk = await AsyncStorage.getItem('cached_risk');
        setAlerts(cachedAlerts ? JSON.parse(cachedAlerts) : MOCK_ALERTS);
        if (cachedRisk) {
          const r = JSON.parse(cachedRisk);
          setRiskScore(Math.round(r.fused_score || 0));
          setAlertLevel(getSeverityLabel(r.alert_level || 'Monitor'));
        }
      }

      setLoading(false);
      setError(false);
    } catch (err) {
      console.log('loadData error:', err);
      setAlerts(MOCK_ALERTS);
      setRiskScore(72);
      setAlertLevel('Warning');
      setLoading(false);
      setError(false);
    }
  }, []);

  // ── WebSocket ──
  const connectWebSocket = useCallback(() => {
    try {
      const ws = new WebSocket(WS_URL);
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.fused_score !== undefined) {
            setRiskScore(Math.round(data.fused_score));
          }
          if (data.alert_level) {
            const level = getSeverityLabel(data.alert_level);
            setAlertLevel(level);

            // Send Telegram alert for Warning/Critical
            if (level === 'Warning' || level === 'Critical') {
              sendTelegramAlert(
                `🚨 <b>DisasterSense Alert</b>\n` +
                `Level: ${level}\n` +
                `Fused Score: ${Math.round(data.fused_score || 0)}/100\n` +
                `Flood: ${Math.round(data.flood_risk || 0)}/100\n` +
                `Earthquake: ${Math.round(data.earthquake_risk || 0)}/100\n` +
                `Cyclone: ${Math.round(data.cyclone_risk || 0)}/100\n` +
                `Location: Bengaluru\n` +
                `Time: ${new Date().toLocaleString('en-IN')}`
              );
            }
          }
        } catch (e) {
          console.log('WS parse error:', e);
        }
      };
      ws.onerror = () => {
        console.log('WS error — using REST polling');
      };
      ws.onclose = () => {
        console.log('WS closed');
      };
      wsRef.current = ws;
    } catch (err) {
      console.log('WS connection error:', err);
    }
  }, []);

  // ── Offline sync ──
  const syncOfflineReports = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem('disastersense_reports');
      if (!raw) return;
      const reports = JSON.parse(raw);
      const unsent = reports.filter((r) => !r.synced);
      if (unsent.length === 0) return;

      const online = await checkHealth();
      if (!online) return;

      const { submitReport } = require('../hooks/useApi');
      let syncedCount = 0;
      for (const report of unsent) {
        const result = await submitReport(report);
        if (result.success) {
          report.synced = true;
          syncedCount++;
        }
      }
      await AsyncStorage.setItem('disastersense_reports', JSON.stringify(reports));
      if (syncedCount > 0) {
        console.log(`✅ ${syncedCount} offline reports synced`);
      }
    } catch (err) {
      console.log('syncOfflineReports error:', err);
    }
  }, []);

  useEffect(() => {
    loadData();
    connectWebSocket();
    syncOfflineReports();

    // Refresh every 30 seconds
    refreshInterval.current = setInterval(loadData, 30000);

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (refreshInterval.current) clearInterval(refreshInterval.current);
    };
  }, []);

  // ── Send mock notification ──
  const sendTestNotification = async () => {
    if (Platform.OS === 'web') {
      alert('⚠️ Notifications are not supported on web. Test on Expo Go.');
      return;
    }
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⚠️ Warning: Flood Risk High',
          body: `Koramangala area flood risk is now at ${riskScore}/100. Evacuate immediately.`,
          badge: alerts.length,
          data: { screen: 'Home' },
        },
        trigger: { seconds: 2 },
      });
    } catch (err) {
      alert('Could not send notification.');
    }
  };

  if (loading) return <LoadingScreen message="Connecting to DisasterSense..." />;
  if (error) return <ErrorScreen message="Could not connect to backend." onRetry={loadData} />;

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const levelColor = ALERT_LEVEL_COLORS[alertLevel] || '#68D391';
  const riskBarColor = riskScore >= 70 ? '#FC8181' : riskScore >= 40 ? '#F6AD55' : '#68D391';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#080C14" />
      <OfflineBar />

      {!isBackendOnline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineBannerText}>⚠️ Offline Mode — showing cached data</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.appName}>DisasterSense</Text>
          <Text style={styles.subtitle}>Bengaluru Early Warning System</Text>
          <Text style={styles.dateTime}>{dateStr} • {timeStr}</Text>
        </View>

        {/* RISK STATUS CARD */}
        <View style={styles.riskCard}>
          <View style={styles.riskHeader}>
            <Text style={styles.riskTitle}>Current Risk Level</Text>
            <Text style={[styles.riskScore, { color: riskBarColor }]}>{riskScore}<Text style={styles.riskTotal}>/100</Text></Text>
          </View>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${Math.min(riskScore, 100)}%`, backgroundColor: riskBarColor }]} />
          </View>
          <Text style={[styles.riskLabel, { color: levelColor }]}>
            {riskScore >= 70 ? '🔴' : riskScore >= 40 ? '🟠' : '🟢'}  {alertLevel.toUpperCase()}
          </Text>
        </View>

        {/* NOTIFICATION BUTTON */}
        <TouchableOpacity style={styles.notifBtn} onPress={sendTestNotification} activeOpacity={0.8}>
          <Text style={styles.notifBtnIcon}>🔔</Text>
          <Text style={styles.notifBtnText}>Send Test Alert Notification</Text>
        </TouchableOpacity>

        {/* ALERT FEED */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Alerts</Text>
          <Text style={styles.alertCount}>{alerts.length}</Text>
        </View>

        {alerts.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>✅ No active alerts</Text>
          </View>
        ) : (
          alerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onPress={() => navigation.navigate('AlertDetail', { alert })}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080C14' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 54, paddingBottom: 30 },

  offlineBanner: {
    backgroundColor: '#2D1A00', paddingVertical: 8, paddingHorizontal: 16, alignItems: 'center',
  },
  offlineBannerText: { color: '#F6AD55', fontSize: 12, fontWeight: '600' },

  header: { marginBottom: 24 },
  appName: { color: '#FFFFFF', fontSize: 28, fontWeight: '800', letterSpacing: 0.5 },
  subtitle: { color: '#8A9BB0', fontSize: 14, marginTop: 4 },
  dateTime: { color: '#5A6B80', fontSize: 12, marginTop: 6 },

  riskCard: { backgroundColor: '#0F1A2E', borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#1A2A45' },
  riskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  riskTitle: { color: '#8A9BB0', fontSize: 14, fontWeight: '600' },
  riskScore: { fontSize: 28, fontWeight: '800' },
  riskTotal: { color: '#5A6B80', fontSize: 16, fontWeight: '500' },
  barTrack: { height: 8, backgroundColor: '#1A2A45', borderRadius: 4, overflow: 'hidden', marginBottom: 14 },
  barFill: { height: '100%', borderRadius: 4 },
  riskLabel: { fontSize: 14, fontWeight: '700', letterSpacing: 0.5 },

  notifBtn: { backgroundColor: '#0F1A2E', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 24, borderWidth: 1, borderColor: '#FF6B35' },
  notifBtnIcon: { fontSize: 18 },
  notifBtnText: { color: '#FF6B35', fontSize: 14, fontWeight: '700' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  alertCount: { color: '#FF6B35', fontSize: 14, fontWeight: '700', backgroundColor: '#1A1020', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12, overflow: 'hidden' },

  alertCard: { backgroundColor: '#0F1A2E', borderRadius: 12, padding: 16, marginBottom: 10, borderLeftWidth: 4 },
  alertTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  alertTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', flex: 1, marginRight: 10 },
  severityBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  severityText: { fontSize: 11, fontWeight: '700' },
  alertBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  alertLocation: { color: '#8A9BB0', fontSize: 12 },
  alertTime: { color: '#5A6B80', fontSize: 11 },

  emptyCard: { backgroundColor: '#0F1A2E', borderRadius: 12, padding: 30, alignItems: 'center' },
  emptyText: { color: '#68D391', fontSize: 15, fontWeight: '600' },
});
