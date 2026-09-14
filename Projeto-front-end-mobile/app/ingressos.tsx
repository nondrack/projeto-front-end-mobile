import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/context/auth-context';
import { buildTicketSummary, calculatePurchaseTotal, validatePurchaseSelection } from '@/services/business-rules';
import { cinemaApi } from '@/services/cinema-api';
import type { Movie, Purchase, Session } from '@/types/cinema';

const opcoesPagamento = [
  { value: 'pix', title: 'Pix', description: 'Aprovação imediata' },
  { value: 'cartao', title: 'Cartão', description: 'Crédito ou débito' },
  { value: 'dinheiro', title: 'Dinheiro', description: 'Pagamento no caixa' },
];

const linhasAssentos = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const assentosOcupados = new Set(['A1', 'A3', 'B5', 'C2', 'D6', 'E7', 'F4', 'G8']);

function gerarAssentosDisponiveis() {
  const assentos: string[] = [];

  for (const linha of linhasAssentos) {
    for (let numero = 1; numero <= 8; numero += 1) {
      assentos.push(`${linha}${numero}`);
    }
  }

  return assentos;
}

export default function IngressosScreen() {
  const params = useLocalSearchParams<{ movieId?: string; sessionId?: string }>();
  const { isAuthenticated, user } = useAuth();
  const [filmeSelecionado, setFilmeSelecionado] = useState<Movie | null>(null);
  const [sessaoSelecionada, setSessaoSelecionada] = useState<Session | null>(null);
  const [assentosSelecionados, setAssentosSelecionados] = useState<string[]>([]);
  const [quantidadeInteira, setQuantidadeInteira] = useState(2);
  const [quantidadeMeia, setQuantidadeMeia] = useState(1);
  const [metodoPagamento, setMetodoPagamento] = useState('');

  useEffect(() => {
    const carregarDadosIngressos = async () => {
      const movieId = Number(params.movieId ?? 1);
      const sessionId = Number(params.sessionId ?? 1);
      const [filmeCarregado, sessoesCarregadas] = await Promise.all([
        cinemaApi.getMovieById(movieId),
        cinemaApi.getSessions(),
      ]);

      setFilmeSelecionado(filmeCarregado);
      setSessaoSelecionada(sessoesCarregadas.find((item) => item.id === sessionId) ?? sessoesCarregadas[0] ?? null);
    };

    void carregarDadosIngressos();
  }, [params.movieId, params.sessionId]);

  const precoBase = sessaoSelecionada?.valor ?? filmeSelecionado?.price ?? 35;
  const totalIngressos = quantidadeInteira + quantidadeMeia;
  const valorInteira = Number(precoBase);
  const valorMeia = Number((precoBase / 2).toFixed(2));

  const total = useMemo(
    () => calculatePurchaseTotal({ basePrice: valorInteira, qtdInteira: quantidadeInteira, qtdMeia: quantidadeMeia }),
    [quantidadeInteira, quantidadeMeia, valorInteira],
  );

  useEffect(() => {
    if (assentosSelecionados.length > totalIngressos) {
      setAssentosSelecionados((assentosAtuais) => assentosAtuais.slice(0, totalIngressos));
    }
  }, [assentosSelecionados, totalIngressos]);

  const todosAssentos = useMemo(() => gerarAssentosDisponiveis(), []);
  const resumoIngressos = buildTicketSummary(quantidadeInteira, quantidadeMeia);

  const ajustarQuantidadeIngressos = (tipo: 'inteira' | 'meia', operacao: 'mais' | 'menos') => {
    if (tipo === 'inteira') {
      setQuantidadeInteira((quantidadeAtual) => {
        const proximaQuantidade = operacao === 'mais' ? quantidadeAtual + 1 : quantidadeAtual - 1;
        return Math.max(0, Math.min(10, proximaQuantidade));
      });
      return;
    }

    setQuantidadeMeia((quantidadeAtual) => {
      const proximaQuantidade = operacao === 'mais' ? quantidadeAtual + 1 : quantidadeAtual - 1;
      return Math.max(0, Math.min(10, proximaQuantidade));
    });
  };

  const alternarSelecaoAssento = (assento: string) => {
    if (assentosOcupados.has(assento)) {
      return;
    }

    if (assentosSelecionados.includes(assento)) {
      setAssentosSelecionados((assentosAtuais) => assentosAtuais.filter((item) => item !== assento));
      return;
    }

    if (assentosSelecionados.length >= totalIngressos) {
      Alert.alert('Assentos', `Você já selecionou ${totalIngressos} assento(s) para essa compra.`);
      return;
    }

    setAssentosSelecionados((assentosAtuais) => [...assentosAtuais, assento]);
  };

  const abrirDetalhesFilme = () => {
    if (filmeSelecionado?.id) {
      router.push({ pathname: '/detalhes', params: { id: String(filmeSelecionado.id) } });
      return;
    }

    router.back();
  };

  const confirmarCompra = async () => {
    if (!isAuthenticated || !user || !filmeSelecionado || !sessaoSelecionada) {
      Alert.alert('Compra', 'Faça login antes de confirmar a compra.');
      router.replace('/login');
      return;
    }

    const purchaseValidationError = validatePurchaseSelection({
      totalIngressos,
      selectedSeats: assentosSelecionados,
      paymentMethod: metodoPagamento,
    });

    if (purchaseValidationError) {
      if (purchaseValidationError.includes('assento')) {
        Alert.alert('Assentos', purchaseValidationError);
        return;
      }

      if (purchaseValidationError.includes('pagamento')) {
        Alert.alert('Pagamento', purchaseValidationError);
        return;
      }

      Alert.alert('Compra', purchaseValidationError);
      return;
    }

    const purchase: Purchase = {
      id: `purchase-${Date.now()}`,
      movie: filmeSelecionado.title,
      session: `${sessaoSelecionada.horario} • ${sessaoSelecionada.sala}`,
      type: sessaoSelecionada.tipo,
      seats: assentosSelecionados.join(', '),
      quantity: totalIngressos,
      value: total,
      dataCompra: new Date().toISOString(),
      userEmail: user.email,
      paymentMethod: metodoPagamento,
      tipoIngresso: resumoIngressos,
      movieId: filmeSelecionado.id,
      sessionId: sessaoSelecionada.id,
    };

    await cinemaApi.savePurchase(purchase);
    Alert.alert('Compra confirmada', 'Seu ingresso foi registrado com sucesso.');
    router.replace('/compras');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topActions}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </Pressable>
        <Pressable style={styles.detailsButton} onPress={abrirDetalhesFilme}>
          <Text style={styles.detailsButtonText}>Filme</Text>
        </Pressable>
        <Pressable style={styles.homeButton} onPress={() => router.replace('/')}>
          <Text style={styles.homeButtonText}>Home</Text>
        </Pressable>
      </View>

      <Text style={styles.eyebrow}>Compra</Text>
      <Text style={styles.title}>Finalizar reserva</Text>

      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.label}>Filme</Text>
          <Text style={styles.value}>{filmeSelecionado?.title ?? 'Carregando...'}</Text>
        </View>

        <View style={styles.rowBetween}>
          <Text style={styles.label}>Sessão</Text>
          <Text style={styles.value}>{sessaoSelecionada ? `${sessaoSelecionada.horario} • ${sessaoSelecionada.sala}` : 'Carregando...'}</Text>
        </View>

        <View style={styles.rowBetween}>
          <Text style={styles.label}>Tipo da sessão</Text>
          <Text style={styles.value}>{sessaoSelecionada?.tipo ?? '—'}</Text>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>1. Escolha tipo e quantidade</Text>

        <View style={styles.ticketRow}>
          <View style={[styles.ticketCard, quantidadeInteira > 0 && styles.ticketCardActive]}>
            <Text style={styles.ticketBadge}>Inteira</Text>
            <Text style={styles.ticketLabel}>Inteira</Text>
            <Text style={styles.ticketPrice}>R$ {valorInteira.toFixed(2).replace('.', ',')}</Text>
            <View style={styles.counterRow}>
              <Pressable style={styles.counterButton} onPress={() => ajustarQuantidadeIngressos('inteira', 'menos')}>
                <Text style={styles.counterText}>-</Text>
              </Pressable>
              <Text style={styles.counterValue}>{quantidadeInteira}</Text>
              <Pressable style={styles.counterButton} onPress={() => ajustarQuantidadeIngressos('inteira', 'mais')}>
                <Text style={styles.counterText}>+</Text>
              </Pressable>
            </View>
          </View>

          <View style={[styles.ticketCard, quantidadeMeia > 0 && styles.ticketCardActive]}>
            <Text style={[styles.ticketBadge, styles.ticketBadgeMeia]}>Meia</Text>
            <Text style={styles.ticketLabel}>Meia entrada</Text>
            <Text style={styles.ticketPrice}>R$ {valorMeia.toFixed(2).replace('.', ',')}</Text>
            <View style={styles.counterRow}>
              <Pressable style={styles.counterButton} onPress={() => ajustarQuantidadeIngressos('meia', 'menos')}>
                <Text style={styles.counterText}>-</Text>
              </Pressable>
              <Text style={styles.counterValue}>{quantidadeMeia}</Text>
              <Pressable style={styles.counterButton} onPress={() => ajustarQuantidadeIngressos('meia', 'mais')}>
                <Text style={styles.counterText}>+</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <Text style={styles.summaryText}>Limite por compra: 10 ingressos. Selecionados: {totalIngressos} ingresso(s)</Text>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>2. Escolha os assentos</Text>

        <Text style={styles.screenBar}>TELA</Text>

        <View style={styles.seatGrid}>
          {todosAssentos.map((assento) => {
            const isOccupied = assentosOcupados.has(assento);
            const isSelected = assentosSelecionados.includes(assento);

            return (
              <Pressable
                key={assento}
                disabled={isOccupied}
                onPress={() => alternarSelecaoAssento(assento)}
                style={[
                  styles.seat,
                  isOccupied && styles.seatOccupied,
                  isSelected && styles.seatSelected,
                ]}>
                <Text style={styles.seatText}>{assento}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.seatLegend}>Assentos ocupados em vermelho; selecionados em verde.</Text>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>3. Forma de pagamento</Text>

        {opcoesPagamento.map((option) => {
          const selected = metodoPagamento === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => setMetodoPagamento(option.value)}
              style={[styles.paymentOption, selected && styles.paymentOptionSelected]}>
              <Text style={styles.paymentTitle}>{option.title}</Text>
              <Text style={styles.paymentDescription}>{option.description}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.summaryPanel}>
        <Text style={styles.summaryLabel}>Assentos</Text>
        <Text style={styles.summaryValue}>{assentosSelecionados.length > 0 ? assentosSelecionados.join(', ') : 'Nenhum'}</Text>

        <Text style={styles.summaryLabel}>Tipo</Text>
        <Text style={styles.summaryValue}>{resumoIngressos}</Text>

        <Text style={styles.summaryLabel}>Total</Text>
        <Text style={styles.summaryValue}>R$ {total.toFixed(2).replace('.', ',')}</Text>
      </View>

      <Pressable style={styles.primaryButton} onPress={confirmarCompra}>
        <Text style={styles.primaryButtonText}>Confirmar pagamento</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1020',
  },
  content: {
    padding: 20,
    paddingTop: 20,
    paddingBottom: 60,
  },
  topActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#182544',
    borderWidth: 1,
    borderColor: '#3a4f85',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backButtonText: {
    color: '#edf4ff',
    fontWeight: '700',
    fontSize: 12,
  },
  detailsButton: {
    backgroundColor: '#182544',
    borderWidth: 1,
    borderColor: '#3a4f85',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  detailsButtonText: {
    color: '#edf4ff',
    fontWeight: '700',
    fontSize: 12,
  },
  homeButton: {
    backgroundColor: '#22c55e',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  homeButtonText: {
    color: '#101a31',
    fontWeight: '800',
    fontSize: 12,
  },
  eyebrow: {
    color: '#ffb703',
    letterSpacing: 1.5,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  title: {
    color: '#f8f9ff',
    fontSize: 30,
    fontWeight: '900',
    marginTop: 8,
  },
  card: {
    backgroundColor: '#121b32',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#293d70',
    marginTop: 18,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    color: '#a7b5df',
    fontSize: 13,
  },
  value: {
    color: '#edf4ff',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'right',
  },
  sectionCard: {
    backgroundColor: '#121b32',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#293d70',
    marginTop: 18,
  },
  sectionTitle: {
    color: '#f8f9ff',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 14,
  },
  ticketRow: {
    flexDirection: 'row',
    gap: 12,
  },
  ticketCard: {
    flex: 1,
    backgroundColor: '#0f1830',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2d407a',
  },
  ticketCardActive: {
    borderColor: '#4ade80',
    backgroundColor: '#162a3d',
  },
  ticketBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffb703',
    color: '#101a31',
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
  },
  ticketBadgeMeia: {
    backgroundColor: '#4ade80',
  },
  ticketLabel: {
    color: '#edf4ff',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 10,
  },
  ticketPrice: {
    color: '#a7b5df',
    fontSize: 13,
    marginTop: 6,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  counterButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#182544',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3a4f85',
  },
  counterText: {
    color: '#edf4ff',
    fontSize: 18,
    fontWeight: '700',
  },
  counterValue: {
    color: '#edf4ff',
    fontSize: 16,
    fontWeight: '800',
  },
  summaryText: {
    color: '#bac6ee',
    fontSize: 12,
    marginTop: 12,
  },
  screenBar: {
    alignSelf: 'center',
    width: '72%',
    backgroundColor: '#1a223b',
    borderRadius: 14,
    paddingVertical: 8,
    textAlign: 'center',
    color: '#f8f9ff',
    fontWeight: '800',
    borderWidth: 1,
    borderColor: '#334a82',
    marginBottom: 12,
  },
  seatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  seat: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#2d3f70',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#425a97',
  },
  seatOccupied: {
    backgroundColor: '#b33a3a',
    borderColor: '#dc6a6a',
  },
  seatSelected: {
    backgroundColor: '#22c55e',
    borderColor: '#7ff0aa',
  },
  seatText: {
    color: '#edf4ff',
    fontSize: 10,
    fontWeight: '800',
  },
  seatLegend: {
    color: '#a8b8df',
    fontSize: 12,
    marginTop: 12,
  },
  paymentOption: {
    backgroundColor: '#0f1830',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2d407a',
    marginTop: 10,
  },
  paymentOptionSelected: {
    borderColor: '#4ade80',
    backgroundColor: '#142b3d',
  },
  paymentTitle: {
    color: '#edf4ff',
    fontSize: 15,
    fontWeight: '800',
  },
  paymentDescription: {
    color: '#a8b8df',
    fontSize: 12,
    marginTop: 4,
  },
  summaryPanel: {
    backgroundColor: '#121b32',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#293d70',
    marginTop: 18,
  },
  summaryLabel: {
    color: '#a7b5df',
    fontSize: 12,
    marginTop: 8,
  },
  summaryValue: {
    color: '#edf4ff',
    fontSize: 14,
    fontWeight: '700',
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
