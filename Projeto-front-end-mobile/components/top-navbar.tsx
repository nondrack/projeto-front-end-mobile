import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/context/auth-context';

export default function TopNavBar() {
  const { user } = useAuth();

  const initials = user?.nome
    ? user.nome
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('')
    : 'P';

  const profileLabel = user?.nome ? user.nome.trim().split(/\s+/)[0] : 'Perfil';

  return (
    <View style={styles.navbar}>
      <View style={styles.brandWrap}>
        <Text style={styles.brand}>CINE MAX</Text>
      </View>

      <View style={styles.rightActions}>
        <Link href="/perfil" asChild>
          <Pressable style={styles.profileButton}>
            <Text style={styles.profileAvatar}>{initials}</Text>
          </Pressable>
        </Link>

        {user ? (
          <Text style={styles.profileName}>{profileLabel}</Text>
        ) : (
          <Text style={styles.profileName}>Perfil</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 14,
    backgroundColor: '#0b1020',
    borderBottomWidth: 1,
    borderBottomColor: '#1d2c4b',
  },
  brandWrap: {
    flex: 1,
  },
  brand: {
    color: '#ffb703',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  profileButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f8f9ff',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 4,
  },
  profileAvatar: {
    color: '#101a31',
    fontSize: 12,
    fontWeight: '900',
  },
  profileName: {
    color: '#edf4ff',
    fontSize: 12,
    fontWeight: '700',
    maxWidth: 90,
  },
});
