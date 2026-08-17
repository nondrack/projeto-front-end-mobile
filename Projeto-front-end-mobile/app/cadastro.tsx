import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAuth } from '@/context/auth-context';
import { formatCpf, normalizeText, validateCpf, validateEmail, validatePassword, validatePhone } from '@/services/business-rules';

export default function CadastroScreen() {
  const { register } = useAuth();
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [telefone, setTelefone] = useState('');
  const [loading, setLoading] = useState(false);

  const clearFieldOnFocus = (setter: React.Dispatch<React.SetStateAction<string>>) => () => {
    setter((current) => (current ? '' : current));
  };

  const handleCpfChange = (value: string) => {
    setCpf(formatCpf(value));
  };

  const handleRegister = async () => {
    const cpfError = validateCpf(cpf);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(senha);
    const phoneError = validatePhone(telefone);

    if (!nome.trim()) {
      Alert.alert('Cadastro', 'Informe seu nome completo.');
      return;
    }

    if (cpfError || emailError || passwordError || phoneError) {
      Alert.alert('Cadastro', cpfError || emailError || passwordError || phoneError || 'Dados inválidos.');
      return;
    }

    setLoading(true);
    try {
      await register({
        nome: normalizeText(nome),
        cpf: cpf.replace(/\D/g, ''),
        email: normalizeText(email),
        senha: normalizeText(senha),
        telefone: normalizeText(telefone),
      });
      router.replace('/');
    } catch (error: any) {
      Alert.alert('Cadastro', error?.message || 'Não foi possível criar a conta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Novo por aqui?</Text>
        <Text style={styles.title}>Crie sua conta</Text>
        <Text style={styles.subtitle}>Cadastre-se para reservar ingressos, acompanhar compras e receber ofertas exclusivas.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Nome completo</Text>
        <TextInput style={styles.input} placeholder="Seu nome" placeholderTextColor="#7e8bb5" value={nome} onChangeText={setNome} onFocus={clearFieldOnFocus(setNome)} />

        <Text style={styles.label}>CPF</Text>
        <TextInput
          style={styles.input}
          placeholder="000.000.000-00"
          placeholderTextColor="#7e8bb5"
          keyboardType="numeric"
          value={cpf}
          onChangeText={handleCpfChange}
          autoCapitalize="none"
          onFocus={clearFieldOnFocus(setCpf)}
        />

        <Text style={styles.label}>E-mail</Text>
        <TextInput style={styles.input} placeholder="seu@email.com" placeholderTextColor="#7e8bb5" keyboardType="email-address" value={email} onChangeText={setEmail} autoCapitalize="none" onFocus={clearFieldOnFocus(setEmail)} />

        <Text style={styles.label}>Senha</Text>
        <TextInput style={styles.input} placeholder="Crie uma senha" placeholderTextColor="#7e8bb5" secureTextEntry value={senha} onChangeText={setSenha} onFocus={clearFieldOnFocus(setSenha)} />

        <Text style={styles.label}>Telefone</Text>
        <TextInput style={styles.input} placeholder="(11) 99999-9999" placeholderTextColor="#7e8bb5" keyboardType="phone-pad" value={telefone} onChangeText={setTelefone} onFocus={clearFieldOnFocus(setTelefone)} />

        <Pressable style={styles.primaryButton} onPress={handleRegister} disabled={loading}>
          <Text style={styles.primaryButtonText}>{loading ? 'Cadastrando...' : 'Cadastrar'}</Text>
        </Pressable>
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.footerText}>Já tem conta?</Text>
        <Link href="/login" asChild>
          <Pressable>
            <Text style={styles.linkText}>Fazer login</Text>
          </Pressable>
        </Link>
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
    padding: 20,
    paddingTop: 40,
    paddingBottom: 44,
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
    fontSize: 30,
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
  primaryButton: {
    backgroundColor: '#22c55e',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#101a31',
    fontSize: 15,
    fontWeight: '800',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
    gap: 6,
  },
  footerText: {
    color: '#dfe7ff',
    fontSize: 13,
  },
  linkText: {
    color: '#4ade80',
    fontWeight: '800',
    fontSize: 13,
  },
});
