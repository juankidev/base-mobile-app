import { LogoText } from '@/components/generals/LogoText';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function ModalScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/auth/login');
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.backgroundFill} />

      <Image
        source={require('@/assets/icons/SplashScreen.jpg')}
        style={[styles.backgroundImage, { width: width , height: height}]}
        resizeMode="cover"
      />

      {[...Array(5)].map((_, i) => (
        <View key={i} style={[{ top: i * (height / 5) }]} />
      ))}

      {[...Array(4)].map((_, i) => (
        <View
          key={i}
          style={[styles.separator, { top: (i + 1) * (height / 5) - 1 }]}
        />
      ))}

      <LogoText style={{ zIndex: 10, position: 'relative' }} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  backgroundFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F1F2F5',
    zIndex: 0,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
  },
  separator: {
    position: 'absolute',
    width: width * 5,
    height: 5,
    transform: [{ rotate: '-15deg' }],
    zIndex: 5,
  },
});
