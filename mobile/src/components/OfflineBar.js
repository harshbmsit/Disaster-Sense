import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';

// Simple connectivity check that works on web + native without extra packages.
// Pings a tiny endpoint; if it fails, we assume offline.
function useNetworkStatus() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    let mounted = true;
    let interval;

    const check = async () => {
      try {
        // Use a lightweight HEAD request to detect connectivity
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        await fetch('https://www.google.com/generate_204', {
          method: 'HEAD',
          cache: 'no-store',
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (mounted) setIsOffline(false);
      } catch {
        if (mounted) setIsOffline(true);
      }
    };

    check();
    interval = setInterval(check, 10000); // re-check every 10s

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return isOffline;
}

export default function OfflineBar() {
  const isOffline = useNetworkStatus();
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOffline) {
      setVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setVisible(false));
    }
  }, [isOffline]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.bar, { transform: [{ translateY: slideAnim }] }]}>
      <Text style={styles.text}>📡 No internet connection — showing cached data</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#B71C1C',
    paddingTop: Platform.OS === 'web' ? 8 : 46,
    paddingBottom: 8,
    paddingHorizontal: 16,
    zIndex: 1000,
    alignItems: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
