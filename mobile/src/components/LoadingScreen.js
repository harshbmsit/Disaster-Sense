import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

export default function LoadingScreen({ message = 'Loading...' }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#FF6B35" />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080C14',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#8A9BB0',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 16,
  },
});
