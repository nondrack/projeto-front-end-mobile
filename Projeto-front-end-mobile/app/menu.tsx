import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const menuItems = [
  { label: 'Home', href: '/' },
  { label: 'Programação', href: '/explore' },
  { label: 'Perfil', href: '/perfil' },
  { label: 'Minhas compras', href: '/compras' },
  { label: 'Login', href: '/login' },
];

export default function MenuScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.panel}>
        <Text style={styles.title}>Menu</Text>

        {menuItems.map((item) => (
          <Link key={item.label} href={item.href as any} asChild>
            <Pressable style={styles.item}>
              <Text style={styles.itemText}>{item.label}</Text>
            </Pressable>
          </Link>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1020',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  panel: {
    backgroundColor: '#121b32',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#2a3d6d',
    padding: 18,
  },
  title: {
    color: '#ffb703',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 12,
  },
  item: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#273b6c',
  },
  itemText: {
    color: '#edf4ff',
    fontSize: 17,
    fontWeight: '700',
  },
});
