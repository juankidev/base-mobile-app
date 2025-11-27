import { ConnectionErrorState } from '@/components/generals/ConnectionErrorState';
import { EmptyState } from '@/components/generals/EmptyState';
import { listRoutesUseCase } from '@/src/features/routes/application/listRoutes.usecase';
import { routesRepositoryImpl } from '@/src/features/routes/infrastructure/routesRepositoryImpl';
import NetInfo from '@react-native-community/netinfo';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Image, RefreshControl, StyleSheet, Text, View } from 'react-native';

type RouteItem = {
  id: number;
  name: string;
  appointment: string; // ISO string
  preparedOrders: number;
  totalOrders: number;
};

function formatAppointment(iso: string) {
  const d = new Date(iso);
  const date = d.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: '2-digit' });
  const time = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  return { date, time };
}

const listRoutes = listRoutesUseCase(routesRepositoryImpl);

function ProgressBar({ value, total }: { value: number; total: number }) {
  const pct = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;
  return (
    <View style={styles.progressBar}>
      <View style={[styles.progressFill, { width: `${pct}%` }]} />
    </View>
  );
}

function RouteCard({ item }: { item: RouteItem }) {
  const { date, time } = formatAppointment(item.appointment);
  return (
    <View style={[styles.cardActive, item.preparedOrders < item.totalOrders ? styles.cardActive : styles.cardInactive]}>
      <View style={styles.cardHeader}>
        <Text style={styles.routeId}>{item.id}</Text>
        <Text style={styles.appointment}>Cita: {date} · {time}</Text>
      </View>
      <Text style={styles.routeName}>{item.name}</Text>
      <ProgressBar value={item.preparedOrders} total={item.totalOrders} />
      <Text style={styles.ordersText}>{item.preparedOrders}/{item.totalOrders} Pedidos</Text>
    </View>
  );
}

export function RoutesList() {
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasNetwork, setHasNetwork] = useState(true);

  const sorted = useMemo(() => {
    return [...routes].sort((a, b) => new Date(a.appointment).getTime() - new Date(b.appointment).getTime());
  }, [routes]);

  const load = useCallback(async () => {
    setLoading(true);
    const controller = new AbortController();
    try {
      const net = await NetInfo.fetch();
      setHasNetwork(!!net.isConnected);
      if (!net.isConnected) {
        setRoutes([]);
        return;
      }
      const res = await listRoutes({ signal: controller.signal });
      const data = Array.isArray(res.data) ? res.data : [];
      setRoutes(data as RouteItem[]);
    } catch (e) {
      setRoutes([]);
    } finally {
      setLoading(false);
    }
    return () => controller.abort();
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
            <Image source={require('@/assets/icons/Box.png')} style={styles.headerImage} />
        </View>
        
        <Text style={styles.headerTitle}>Rutas</Text>
      </View>

      {loading ? (
        <View style={styles.skeletonContainer}>
          {[...Array(3)].map((_, i) => (
            <View key={i} style={styles.skeletonCard} />
          ))}
        </View>
      ) : !hasNetwork ? (
        <View style={styles.emptyContainer}>
          <ConnectionErrorState onRetry={onRefresh} />
        </View>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <RouteCard item={item} />}
          contentContainerStyle={sorted.length === 0 ? styles.emptyContainer : styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <EmptyState
              icon={require('@/assets/icons/Box.png')}
              title="No hay rutas por alistar en este momento."
              subtitle="Cuando se asignen nuevas rutas, aparecerán aquí."
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffff',
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    boxShadow: '0px 6px 8px 0px rgba(0,0,0,0.08)',
    marginTop: 20,
    padding: 12,
    borderRadius: 6,
  },
  headerIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 32,
    height: 32,
    padding: 5,
    borderRadius: 6,
    backgroundColor: '#003d82',
    marginRight: 8,
  },
  headerImage: {
    width: 15,
    height: 17,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
  },
  listContent: {
    paddingBottom: 24,
  },
  cardActive: {
    backgroundColor: '#fff',
    borderColor: '#E4E4E7',
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    marginBottom: 12
  },
  cardInactive: {
    backgroundColor: '#E4E4E7',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  routeId: {
    fontSize: 13,
    color: '#18181B',
  },
  appointment: {
    fontSize: 12,
    color: '#666',
  },
  routeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#e9ecef',
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2f9e44',
  },
  ordersText: {
    fontSize: 12,
    color: '#444',
    marginTop: 6,
    fontWeight: '600',
  },
  skeletonContainer: {
    gap: 12,
  },
  skeletonCard: {
    height: 84,
    backgroundColor: '#eee',
    borderRadius: 12,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

