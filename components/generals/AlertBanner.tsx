import { AlertPayload, alertService } from '@/src/services/alerts/alert.service';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function AlertBanner() {
  const [current, setCurrent] = useState<AlertPayload | null>(null);

  useEffect(() => {
    const unsub = alertService.subscribe(setCurrent);
    return () => { unsub(); };
  }, []);

  if (!current) return null;

  const style =
    current.type === 'error'
      ? styles.error
      : current.type === 'warning'
      ? styles.warning
      : current.type === 'success'
      ? styles.success
      : styles.neutral;

  const icon =
    current.type === 'error'
      ? 'alert-circle'
      : current.type === 'warning'
      ? 'wifi'
      : current.type === 'success'
      ? 'checkmark-circle'
      : 'ban';

  return (
    <View style={[styles.container, style]}>
      <Ionicons name={icon as any} size={18} color="#fff" style={styles.icon} />
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{current.title}</Text>
        <Text style={styles.desc}>{current.message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 100,
  },
  icon: {
    marginRight: 8,
  },
  error: {
    backgroundColor: '#DC2626',
  },
  warning: {
    backgroundColor: '#FF8D28',
  },
  success: {
    backgroundColor: '#16A34A',
  },
  neutral: {
    backgroundColor: '#292929',
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  desc: {
    color: '#fff',
    fontSize: 14,
    marginTop: 4,
  },
});
