import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SEVERITY_CONFIG = {
  Monitor:  { bg: '#6b7280', emoji: '⚫' },
  Advisory: { bg: '#2563eb', emoji: '🔵' },
  Warning:  { bg: '#f97316', emoji: '🟠' },
  Critical: { bg: '#dc2626', emoji: '🔴' },
};

export default function AlertBanner({ severity, message }) {
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.Monitor;

  return (
    <View style={[styles.card, { borderLeftColor: config.bg }]}>
      <View style={styles.header}>
        <Text style={styles.emoji}>{config.emoji}</Text>
        <Text style={[styles.severity, { color: config.bg }]}>{severity}</Text>
      </View>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  emoji: {
    fontSize: 16,
    marginRight: 6,
  },
  severity: {
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  message: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
});
