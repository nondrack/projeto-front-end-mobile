import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAuth } from '@/context/auth-context';
import { normalizarTexto, validarEmail, validarSenha } from '@/services/business-rules';

export default function LoginScreen() {
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  const limparCampoAoFocar = (atualizarCampo: React.Dispatch<React.SetStateAction<string>>) => () => {
    atualizarCampo((valorAtual) => (valorAtual ? '' : valorAtual));
  };

  const realizarLogin = async () => {
    const erroEmail = validarEmail(email);
    const erroSenha = validarSenha(senha);

    if (erroEmail || erroSenha) {
      Alert.alert('Login', erroEmail || erroSenha || 'Dados inválidos.');
      return;
    }

    setCarregando(true);
    try {
      await login(normalizarTexto(email), normalizarTexto(senha));
      router.replace('/');
    } catch (erro: any) {
      Alert.alert('Login', erro?.message || 'Não foi possível entrar.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Bem-vindo</Text>
        <Text style={styles.title}>Entrar no CINE MAX</Text>
        <Text style={styles.subtitle}>Acesse sua conta e aproveite os melhores filmes com conforto e rapidez.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>E-mail</Text>
        <TextInput
          style={styles.input}
          placeholder="seu@email.com"
          placeholderTextColor="#7e8bb5"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          onFocus={limparCampoAoFocar(setEmail)}
        />

        <Text style={styles.label}>Senha</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor="#7e8bb5"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
          onFocus={limparCampoAoFocar(setSenha)}
        />

        <View style={styles.inlineRow}>
          <Text style={styles.rememberText}>Lembrar-me</Text>
          <Text style={styles.linkText}>Esqueci a senha</Text>
        </View>

        <Pressable style={styles.primaryButton} onPress={realizarLogin} disabled={carregando}>
          <Text style={styles.primaryButtonText}>{carregando ? 'Entrando...' : 'Entrar'}</Text>
        </Pressable>

        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>ou</Text>
          <View style={styles.divider} />
        </View>

        <Link href="/cadastro" asChild>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Criar conta</Text>
          </Pressable>
        </Link>
      </View>

      <Link href="/" asChild>
        <Pressable style={styles.ghostButton}>
          <Text style={styles.ghostButtonText}>Voltar para a home</Text>
        </Pressable>
      </Link>

      {isAuthenticated ? <Text style={styles.authBadge}>Sessão ativa</Text> : null}
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
    paddingTop: 40,
    paddingBottom: 48,
  },
  header: {
    marginBottom: 20,
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
    fontSize: 32,
    fontWeight: '900',
    marginTop: 8,
  },
  subtitle: {
    color: '#bac6ee',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 8,
  },
  card: {
    backgroundColor: '#121b32',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#263b6d',
  },
  label: {
    color: '#dfe7ff',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#0f1830',
    borderColor: '#2b3d6e',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#f6f8ff',
    marginBottom: 16,
    fontSize: 15,
  },
  inlineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  rememberText: {
    color: '#dfe7ff',
    fontSize: 12,
  },
  linkText: {
    color: '#4ade80',
    fontSize: 12,
    fontWeight: '700',
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
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#2d3f70',
  },
  dividerText: {
    color: '#8ea0d5',
    paddingHorizontal: 10,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  secondaryButton: {
    backgroundColor: '#182544',
    borderColor: '#3a4f85',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#edf4ff',
    fontWeight: '800',
    fontSize: 15,
  },
  ghostButton: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 12,
  },
  ghostButtonText: {
    color: '#ffb703',
    fontWeight: '700',
    fontSize: 14,
  },
});
