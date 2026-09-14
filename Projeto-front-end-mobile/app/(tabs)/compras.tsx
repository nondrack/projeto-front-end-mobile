import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { cinemaApi } from '@/services/cinema-api';
import type { Purchase } from '@/types/cinema';

export default function ComprasTabScreen() {
  const [registrosCompras, setRegistrosCompras] = useState<Purchase[]>([]);

  useEffect(() => {
    const carregarCompras = async () => {
      setRegistrosCompras(await cinemaApi.getPurchases());
    };

    void carregarCompras();
  }, []);

  const valorTotalGasto = useMemo(
    () => registrosCompras.reduce((acumulador, compra) => acumulador + Number(compra.value || 0), 0),
    [registrosCompras],
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable style={styles.backButton} onPress={() => router.replace('/')}>
        <Text style={styles.backButtonText}>Voltar para a home</Text>
      </Pressable>

      <Text style={styles.eyebrow}>Histórico</Text>
      <Text style={styles.title}>Minhas compras</Text>
      <Text style={styles.subtitle}>Histórico de ingressos e pagamentos realizados na plataforma.</Text>

      {registrosCompras.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Você ainda não possui compras registradas.</Text>
        </View>
      ) : (
        <>
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total de compras</Text>
              <Text style={styles.summaryValue}>{registrosCompras.length}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Valor total</Text>
              <Text style={styles.summaryValue}>R$ {valorTotalGasto.toFixed(2).replace('.', ',')}</Text>
            </View>
          </View>

          {registrosCompras.map((compra) => (
            <View key={compra.id} style={styles.card}>
              <View style={styles.headerRow}>
                <Text style={styles.filme}>{compra.movie}</Text>
                <Text style={styles.valor}>R$ {Number(compra.value).toFixed(2).replace('.', ',')}</Text>
              </View>

              <Text style={styles.meta}><Text style={styles.metaLabel}>Ingresso:</Text> #{compra.id}</Text>
              <Text style={styles.meta}><Text style={styles.metaLabel}>Sessão:</Text> {compra.session}</Text>
              <Text style={styles.meta}><Text style={styles.metaLabel}>Assento:</Text> {compra.seats}</Text>
              <Text style={styles.meta}><Text style={styles.metaLabel}>Tipo:</Text> {compra.tipoIngresso ?? '—'}</Text>
              <Text style={styles.meta}><Text style={styles.metaLabel}>Método:</Text> {compra.paymentMethod ?? compra.type}</Text>
              <Text style={styles.meta}><Text style={styles.metaLabel}>Compra:</Text> {new Date(compra.dataCompra).toLocaleDateString('pt-BR')}</Text>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1020',
  },
  content: {
    padding: 18,
    paddingTop: 18,
    paddingBottom: 40,
  },
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#182544',
    borderWidth: 1,
    borderColor: '#3a4f85',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
  },
  backButtonText: {
    color: '#edf4ff',
    fontWeight: '700',
    fontSize: 12,
  },
  eyebrow: {
    color: '#ffb703',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  title: {
    color: '#f8f9ff',
    fontSize: 30,
    fontWeight: '900',
    marginTop: 6,
  },
  subtitle: {
    color: '#bac6ee',
    fontSize: 14,
    marginTop: 8,
    marginBottom: 18,
  },
  summaryCard: {
    backgroundColor: '#121b32',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#253860',
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    color: '#a8b8df',
    fontSize: 12,
  },
  summaryValue: {
    color: '#f8f9ff',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 6,
  },
  emptyCard: {
    backgroundColor: '#121b32',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#253860',
    padding: 22,
  },
  emptyText: {
    color: '#edf4ff',
    fontSize: 15,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#121b32',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#253860',
    padding: 16,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  filme: {
    color: '#f8f9ff',
    fontSize: 17,
    fontWeight: '800',
    flex: 1,
    paddingRight: 12,
  },
  valor: {
    color: '#4ade80',
    fontWeight: '800',
    fontSize: 14,
  },
  meta: {
    color: '#dfe7ff',
    fontSize: 13,
    marginTop: 4,
  },
  metaLabel: {
    color: '#ffb703',
    fontWeight: '700',
  },
});
