import { Link } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const programacao = [
  { titulo: 'Aventura Nocturna', horario: '14:40', sala: 'Sala 1', tipo: '2D' },
  { titulo: 'Horizonte Solar', horario: '16:10', sala: 'Sala 2', tipo: '3D' },
  { titulo: 'Cidade dos Reflexos', horario: '18:50', sala: 'Sala 3', tipo: 'IMAX' },
  { titulo: 'Última Estação', horario: '21:30', sala: 'Sala 4', tipo: '4DX' },
];

export default function ProgramacaoScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.headerCard}>
        <Text style={styles.eyebrow}>Programação</Text>
        <Text style={styles.title}>Sessões do dia</Text>
        <Text style={styles.subtitle}>
          Confira os horários e salas para a sua próxima experiência no CINE MAX.
        </Text>
      </View>

      <View style={styles.dateChipContainer}>
        <Text style={styles.dateChip}>Hoje</Text>
        <Text style={styles.dateChipMuted}>Amanhã</Text>
        <Text style={styles.dateChipMuted}>Sábado</Text>
      </View>

      {programacao.map((sessao) => (
        <Link key={sessao.titulo} href="/detalhes" asChild>
          <Pressable style={styles.sessionCard}>
            <View style={styles.sessionInfo}>
              <Text style={styles.sessionTitle}>{sessao.titulo}</Text>
              <Text style={styles.sessionMeta}>{sessao.sala}</Text>
            </View>
            <View style={styles.sessionBadge}>
              <Text style={styles.sessionTime}>{sessao.horario}</Text>
              <Text style={styles.sessionType}>{sessao.tipo}</Text>
            </View>
          </Pressable>
        </Link>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1020',
  },
  contentContainer: {
    padding: 18,
    paddingBottom: 32,
  },
  headerCard: {
    backgroundColor: '#121b32',
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#243562',
  },
  eyebrow: {
    color: '#ffb703',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
  },
  title: {
    color: '#f8f9ff',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 6,
  },
  subtitle: {
    color: '#b4bddc',
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
  },
  dateChipContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  dateChip: {
    backgroundColor: '#ffb703',
    color: '#101a31',
    fontWeight: '800',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    fontSize: 12,
  },
  dateChipMuted: {
    backgroundColor: '#182544',
    color: '#dfe7ff',
    fontWeight: '700',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    fontSize: 12,
    borderWidth: 1,
    borderColor: '#2d3e6f',
  },
  sessionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#121b32',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#243562',
  },
  sessionInfo: {
    flex: 1,
    paddingRight: 12,
  },
  sessionTitle: {
    color: '#f8f9ff',
    fontWeight: '700',
    fontSize: 16,
  },
  sessionMeta: {
    color: '#8f95c3',
    marginTop: 5,
    fontSize: 13,
  },
  sessionBadge: {
    backgroundColor: '#1b2b4b',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 82,
    borderWidth: 1,
    borderColor: '#2c3f73',
  },
  sessionTime: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
  sessionType: {
    color: '#ffb703',
    fontSize: 11,
    marginTop: 3,
    fontWeight: '700',
  },
});
