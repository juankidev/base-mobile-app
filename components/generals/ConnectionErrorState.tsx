import NetInfo from '@react-native-community/netinfo';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  onRetry?: () => void;
};

export function ConnectionErrorState({ onRetry }: Props) {
  const handleRetry = async () => {
    const net = await NetInfo.fetch();
    if (!net.isConnected) {
      return;
    }
    onRetry?.();
  };

  return (
    <View style={styles.container}>
      <Image source={require('@/assets/icons/ErrorConnection.png')} style={styles.icon} />
      <Text style={styles.title}>Sin conexión a internet</Text>
      <Text style={styles.subtitle}>No pudimos cargar la información. Verifica tu red e inténtalo nuevamente.</Text>
      <TouchableOpacity style={styles.button} activeOpacity={0.9} onPress={handleRetry}>
        <Text style={styles.buttonText}>Reintentar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  icon: {
    width: 120,
    height: 120,
    marginBottom: 16,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#164194',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
