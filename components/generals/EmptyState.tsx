import { Image, ImageSourcePropType, StyleSheet, Text, View, ViewStyle } from 'react-native';

type Props = {
  icon: ImageSourcePropType;
  title: string;
  subtitle?: string;
  style?: ViewStyle;
};

export function EmptyState({ icon, title, subtitle, style }: Props) {
  return (
    <View style={[styles.container, style]}>
      <Image source={icon} style={styles.icon} />
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
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
  },
});

