import { Link, router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import TopNavBar from '@/components/top-navbar';
import { useAuth } from '@/context/auth-context';
import { cinemaApi } from '@/services/cinema-api';
import type { Purchase } from '@/types/cinema';

export default function PerfilScreen() {
  const { user, logout, isAuthenticated } = useAuth();
  const [comprasRecentes, setComprasRecentes] = useState<Purchase[]>([]);

  useEffect(() => {
    const load = async () => {
      const purchases = await cinemaApi.getPurchases();
      setComprasRecentes(purchases);
    };

    void load();
  }, []);

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace('/login');
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <View style={styles.screenWrap}>
      <TopNavBar />

      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Voltar</Text>
      </Pressable>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.headerCard}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarText}>{user.nome.slice(0, 2).toUpperCase()}</Text>
          </View>

        <Text style={styles.title}>{user.nome}</Text>
        <Text style={styles.subtitle}>{user.email}</Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{comprasRecentes.length}</Text>
            <Text style={styles.statLabel}>Ingressos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{new Set(comprasRecentes.map((item) => item.movie)).size}</Text>
            <Text style={styles.statLabel}>Filmes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{user.tipo_usuario === 'admin' ? 'Admin' : 'Gold'}</Text>
            <Text style={styles.statLabel}>Plano</Text>
          </View>
        </View>
      </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Últimas compras</Text>

          {comprasRecentes.map((item) => (
            <View key={item.id} style={styles.purchaseRow}>
              <View>
                <Text style={styles.purchaseTitle}>{item.movie}</Text>
                <Text style={styles.purchaseDate}>{new Date(item.dataCompra).toLocaleDateString('pt-BR')} • {item.session}</Text>
              </View>
              <Text style={styles.purchaseValue}>R$ {item.value.toFixed(2).replace('.', ',')}</Text>
            </View>
          ))}
        </View>

        <View style={styles.buttonsWrap}>
          <Link href="/compras" asChild>
            <Pressable style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Minhas compras</Text>
            </Pressable>
          </Link>

          <Pressable style={styles.secondaryButton} onPress={handleLogout}>
            <Text style={styles.secondaryButtonText}>Sair</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenWrap: {
    flex: 1,
    backgroundColor: '#0b1020',
  },
  container: {
    flex: 1,
    backgroundColor: '#0b1020',
  },
  content: {
    padding: 18,
    paddingBottom: 40,
  },
  headerCard: {
    backgroundColor: '#121b32',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#273b6c',
    alignItems: 'center',
  },
  avatarWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#101a31',
    fontSize: 26,
    fontWeight: '900',
  },
  title: {
    color: '#f8f9ff',
    fontSize: 28,
    fontWeight: '900',
    marginTop: 14,
  },
  subtitle: {
    color: '#bac6ee',
    fontSize: 14,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 22,
    width: '100%',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#0f1830',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2d407a',
  },
  statNumber: {
    color: '#4ade80',
    fontSize: 18,
    fontWeight: '900',
  },
  statLabel: {
    color: '#dfe7ff',
    fontSize: 11,
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: '#121b32',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#273b6c',
    marginTop: 18,
  },
  sectionTitle: {
    color: '#f8f9ff',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 12,
  },
  purchaseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#243760',
    paddingBottom: 10,
    marginBottom: 10,
  },
  purchaseTitle: {
    color: '#edf4ff',
    fontWeight: '700',
    fontSize: 14,
  },
  purchaseDate: {
    color: '#96a8d9',
    fontSize: 12,
    marginTop: 4,
  },
  purchaseValue: {
    color: '#ffb703',
    fontWeight: '800',
    fontSize: 13,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginLeft: 18,
    marginTop: 12,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#182544',
    borderWidth: 1,
    borderColor: '#3a4f85',
  },
  backButtonText: {
    color: '#edf4ff',
    fontWeight: '700',
    fontSize: 12,
  },
  buttonsWrap: {
    marginTop: 22,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#22c55e',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#101a31',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryButton: {
    backgroundColor: '#182544',
    borderWidth: 1,
    borderColor: '#3a4f85',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#edf4ff',
    fontSize: 15,
    fontWeight: '800',
  },
});
