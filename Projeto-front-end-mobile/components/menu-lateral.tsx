import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const items = [
  { label: 'Home', href: '/' },
  { label: 'Programação', href: '/explore' },
  { label: 'Perfil', href: '/perfil' },
  { label: 'Minhas compras', href: '/compras' },
  { label: 'Login', href: '/login' },
];

export default function MenuLateral() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Menu</Text>
      {items.map((item) => (
        <Link key={item.label} href={item.href as any} asChild>
          <Pressable style={styles.item}>
            <Text style={styles.itemText}>{item.label}</Text>
          </Pressable>
        </Link>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 260,
    backgroundColor: '#101a31',
    borderLeftWidth: 1,
    borderLeftColor: '#273b6c',
    padding: 20,
    paddingTop: 50,
  },
  title: {
    color: '#ffb703',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 18,
  },
  item: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#253860',
  },
  itemText: {
    color: '#edf4ff',
    fontSize: 16,
    fontWeight: '700',
  },
});
