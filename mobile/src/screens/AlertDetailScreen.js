import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';

const SEVERITY_COLORS = {
  Monitor:  { badgeBg: '#3D3D3D', text: '#AAAAAA', border: '#888888' },
  Advisory: { badgeBg: '#0D2137', text: '#4DA6FF', border: '#2979FF' },
  Warning:  { badgeBg: '#2D1A00', text: '#FF8C00', border: '#FF6B35' },
  Critical: { badgeBg: '#2D0000', text: '#FF4444', border: '#FF0000' },
};

export default function AlertDetailScreen({ route, navigation }) {
  const alert = route.params?.alert;
  const colors = SEVERITY_COLORS[alert.severity] || SEVERITY_COLORS.Monitor;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#080C14" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Alert Details</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Severity Badge */}
        <View style={[styles.severityBadge, { backgroundColor: colors.badgeBg, borderColor: colors.border }]}>
          <Text style={[styles.severityText, { color: colors.text }]}>{alert.severity.toUpperCase()}</Text>
        </View>

        {/* Title */}
        <Text style={styles.alertTitle}>{alert.title}</Text>

        {/* Meta Row */}
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>📍 {alert.location}</Text>
          <Text style={styles.metaText}>🕐 {alert.time}</Text>
        </View>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Description */}
        <Text style={styles.sectionLabel}>Description</Text>
        <View style={styles.detailCard}>
          <Text style={styles.detailText}>{alert.description}</Text>
        </View>

        {/* Instructions */}
        <Text style={styles.sectionLabel}>Instructions</Text>
        <View style={[styles.detailCard, { borderLeftWidth: 3, borderLeftColor: colors.border }]}>
          <Text style={styles.detailText}>{alert.instructions}</Text>
        </View>

        {/* Timestamp */}
        <View style={styles.timestampCard}>
          <Text style={styles.timestampLabel}>Last Updated</Text>
          <Text style={styles.timestampValue}>{alert.time}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080C14',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 14,
    backgroundColor: '#0A1020',
    borderBottomWidth: 1,
    borderBottomColor: '#1A2040',
  },
  backBtn: {
    paddingVertical: 6,
    paddingRight: 10,
  },
  backText: {
    color: '#FF6B35',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  severityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  alertTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metaText: {
    color: '#8A9BB0',
    fontSize: 13,
  },
  divider: {
    height: 2,
    borderRadius: 1,
    opacity: 0.3,
    marginBottom: 24,
  },
  sectionLabel: {
    color: '#8A9BB0',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  detailCard: {
    backgroundColor: '#0F1A2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  detailText: {
    color: '#C8D6E5',
    fontSize: 15,
    lineHeight: 22,
  },
  timestampCard: {
    backgroundColor: '#0F1A2E',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  timestampLabel: {
    color: '#8A9BB0',
    fontSize: 13,
  },
  timestampValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
