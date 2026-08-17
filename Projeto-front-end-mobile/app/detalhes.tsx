import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { cinemaApi } from '@/services/cinema-api';
import type { Movie, Session } from '@/types/cinema';

export default function DetalhesFilmeScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);

  useEffect(() => {
    const loadDetails = async () => {
      const movieId = Number(params.id ?? 1);
      const [movieData, sessionsData] = await Promise.all([
        cinemaApi.getMovieById(movieId),
        cinemaApi.getSessions(),
      ]);

      setMovie(movieData);
      setSessions(sessionsData.filter((session) => session.movieId === movieId));
      setSelectedSessionId((sessionsData.find((session) => session.movieId === movieId)?.id) ?? null);
    };

    void loadDetails();
  }, [params.id]);

  const selectedSession = useMemo(
    () => sessions.find((session) => session.id === selectedSessionId) ?? sessions[0] ?? null,
    [selectedSessionId, sessions],
  );

  const handleBuy = () => {
    if (!selectedSession || !movie) {
      return;
    }

    router.push({ pathname: '/ingressos', params: { movieId: String(movie.id), sessionId: String(selectedSession.id) } });
  };

  if (!movie) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando filme...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable style={styles.backButton} onPress={() => router.replace('/')}>
        <Text style={styles.backButtonText}>Voltar para a home</Text>
      </Pressable>

      <Image source={{ uri: movie.image }} style={styles.poster} />

      <View style={styles.card}>
        <Text style={styles.eyebrow}>{movie.genre}</Text>
        <Text style={styles.title}>{movie.title}</Text>

        <View style={styles.metaRow}>
          <Text style={styles.metaChip}>{movie.rating}</Text>
          <Text style={styles.metaChip}>{movie.time} min</Text>
          <Text style={styles.metaChip}>4.9 ★</Text>
        </View>

        <Text style={styles.description}>{movie.synopsis}</Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Elenco</Text>
          <Text style={styles.infoText}>Timothée Chalamet • Zendaya • Rebecca Ferguson • Javier Bardem</Text>
        </View>

        <Text style={styles.sectionTitle}>Selecione a sessão</Text>

        {sessions.map((sessao) => (
          <Pressable
            key={sessao.id}
            onPress={() => setSelectedSessionId(sessao.id)}
            style={[styles.sessionCard, selectedSession?.id === sessao.id && styles.sessionSelected]}>
            <View>
              <Text style={styles.sessionTime}>{sessao.horario}</Text>
              <Text style={styles.sessionMeta}>{sessao.sala} • {sessao.tipo}</Text>
            </View>
            <Text style={styles.sessionPrice}>R$ {Number(sessao.valor).toFixed(2).replace('.', ',')}</Text>
          </Pressable>
        ))}

        <Pressable style={styles.primaryButton} onPress={handleBuy}>
          <Text style={styles.primaryButtonText}>Comprar ingresso</Text>
        </Pressable>
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
    padding: 18,
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
  poster: {
    width: '100%',
    height: 360,
    borderRadius: 26,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#2a3d6d',
  },
  card: {
    backgroundColor: '#121b32',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#273a69',
  },
  eyebrow: {
    color: '#4ade80',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  title: {
    color: '#f8f9ff',
    fontSize: 30,
    fontWeight: '900',
    marginTop: 8,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  metaChip: {
    color: '#dfe7ff',
    backgroundColor: '#182544',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 11,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: '#2e427d',
  },
  description: {
    color: '#c0c9eb',
    lineHeight: 22,
    fontSize: 14,
    marginTop: 14,
  },
  infoBox: {
    backgroundColor: '#0f1830',
    borderRadius: 16,
    padding: 12,
    marginTop: 18,
    borderWidth: 1,
    borderColor: '#243760',
  },
  infoTitle: {
    color: '#4ade80',
    fontWeight: '800',
    fontSize: 12,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  infoText: {
    color: '#e8eefc',
    fontSize: 13,
    lineHeight: 20,
  },
  sectionTitle: {
    color: '#f8f9ff',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 22,
    marginBottom: 12,
  },
  sessionCard: {
    backgroundColor: '#0f1830',
    borderColor: '#2e427d',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sessionTime: {
    color: '#f8f9ff',
    fontWeight: '800',
    fontSize: 16,
  },
  sessionMeta: {
    color: '#9aaad6',
    fontSize: 12,
    marginTop: 4,
  },
  sessionPrice: {
    color: '#ffb703',
    fontWeight: '800',
    fontSize: 13,
  },
  primaryButton: {
    backgroundColor: '#22c55e',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 18,
  },
  primaryButtonText: {
    color: '#101a31',
    fontSize: 15,
    fontWeight: '800',
  },
});
