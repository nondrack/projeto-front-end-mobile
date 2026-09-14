import { Link } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/context/auth-context';
import { cinemaApi } from '@/services/cinema-api';
import type { Movie } from '@/types/cinema';

const destaquesTelaInicial = [
  { label: '4 Salas 3D', text: 'Audio e imagem de primeira linha.' },
  { label: 'Combo Premium', text: 'Pipoca + bebida com desconto.' },
  { label: 'Assento Marcado', text: 'Escolha seu lugar antes de entrar.' },
];

export default function HomeScreen() {
  const { isAuthenticated, user } = useAuth();
  const [filmesDisponiveis, setFilmesDisponiveis] = useState<Movie[]>([]);

  useEffect(() => {
    const carregarFilmes = async () => {
      const filmesCarregados = await cinemaApi.getMovies();
      setFilmesDisponiveis(filmesCarregados);
    };

    void carregarFilmes();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>Experiência Premium</Text>
        <Text style={styles.title}>CINE MAX</Text>
        <Text style={styles.subtitle}>
          O cinema que transforma cada sessão em um evento especial com som imersivo,
          conforto e lançamentos incríveis.
        </Text>

        <View style={styles.buttonRow}>
          <Link href={isAuthenticated ? '/perfil' : '/login'} asChild>
            <Pressable style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>{isAuthenticated ? `Olá, ${user?.nome?.split(' ')[0] ?? 'Cliente'}` : 'Entrar'}</Text>
            </Pressable>
          </Link>

          <Link href="/detalhes" asChild>
            <Pressable style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Destaques</Text>
            </Pressable>
          </Link>
        </View>
      </View>

      <View style={styles.quickActions}>
        <Link href="/cadastro" asChild>
          <Pressable style={styles.quickAction}>
            <Text style={styles.quickActionText}>Cadastro</Text>
          </Pressable>
        </Link>
        <Link href={isAuthenticated ? '/perfil' : '/login'} asChild>
          <Pressable style={styles.quickAction}>
            <Text style={styles.quickActionText}>{isAuthenticated ? 'Perfil' : 'Login'}</Text>
          </Pressable>
        </Link>
        <Link href="/compras" asChild>
          <Pressable style={styles.quickAction}>
            <Text style={styles.quickActionText}>Compras</Text>
          </Pressable>
        </Link>
      </View>

      <View style={styles.featureRow}>
        {destaquesTelaInicial.map((item) => (
          <View key={item.label} style={styles.featureCard}>
            <Text style={styles.featureLabel}>{item.label}</Text>
            <Text style={styles.featureText}>{item.text}</Text>
          </View>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Filmes em destaque</Text>
        <Text style={styles.sectionAction}>Ver tudo</Text>
      </View>

      {filmesDisponiveis.map((filme) => (
        <View key={filme.id} style={styles.movieCard}>
          <Image source={{ uri: filme.image }} style={styles.moviePoster} />

          <View style={styles.movieContent}>
            <View style={styles.movieTopRow}>
              <Text style={styles.movieTitle}>{filme.title}</Text>
              <Text style={styles.ratingPill}>{filme.rating}</Text>
            </View>

            <Text style={styles.movieMeta}>{filme.genre} • {filme.time} min</Text>

            <View style={styles.chipsRow}>
              <Text style={styles.chip}>2D</Text>
              <Text style={styles.chip}>3D</Text>
              <Text style={styles.chip}>IMAX</Text>
            </View>

            <Link href={`/detalhes?id=${filme.id}`} asChild>
              <Pressable style={styles.reserveButton}>
                <Text style={styles.reserveButtonText}>Comprar ingresso</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      ))}
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
  heroCard: {
    backgroundColor: '#121b32',
    borderRadius: 26,
    padding: 20,
    borderWidth: 1,
    borderColor: '#22335d',
    shadowColor: '#0b1020',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 8,
  },
  eyebrow: {
    color: '#4ade80',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 8,
    color: '#f9fbff',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  subtitle: {
    marginTop: 10,
    color: '#b4bddc',
    fontSize: 15,
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#22c55e',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#101a31',
    fontWeight: '800',
    fontSize: 14,
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#384d83',
    backgroundColor: '#182544',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#edf2ff',
    fontWeight: '700',
    fontSize: 14,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  quickAction: {
    flex: 1,
    backgroundColor: '#182544',
    borderWidth: 1,
    borderColor: '#2d407a',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  quickActionText: {
    color: '#edf4ff',
    fontWeight: '700',
    fontSize: 12,
  },
  featureRow: {
    marginTop: 18,
    gap: 12,
  },
  featureCard: {
    backgroundColor: '#121b32',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#253861',
  },
  featureLabel: {
    color: '#4ade80',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },
  featureText: {
    color: '#d3daf7',
    fontSize: 12,
    lineHeight: 18,
  },
  sectionHeader: {
    marginTop: 26,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: '#f8f9ff',
    fontSize: 22,
    fontWeight: '800',
  },
  sectionAction: {
    color: '#4ade80',
    fontSize: 12,
    fontWeight: '700',
  },
  movieCard: {
    marginBottom: 16,
    backgroundColor: '#121b32',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#243562',
    overflow: 'hidden',
    flexDirection: 'row',
  },
  moviePoster: {
    width: 116,
    height: 170,
  },
  movieContent: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  movieTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  movieTitle: {
    color: '#f8f9ff',
    fontSize: 18,
    fontWeight: '800',
    flex: 1,
    paddingRight: 8,
  },
  ratingPill: {
    backgroundColor: '#1d2d52',
    color: '#4ade80',
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 11,
  },
  movieMeta: {
    marginTop: 8,
    color: '#bec8ed',
    fontSize: 12,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  chip: {
    backgroundColor: '#182544',
    color: '#dfe7ff',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
    fontSize: 10,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: '#2c3f73',
  },
  reserveButton: {
    marginTop: 14,
    backgroundColor: '#22c55e',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  reserveButtonText: {
    color: '#101a31',
    fontWeight: '800',
    fontSize: 13,
  },
});
