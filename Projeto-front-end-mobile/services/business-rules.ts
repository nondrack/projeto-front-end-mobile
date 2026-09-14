export function normalizarTexto(valor: string) {
  return valor.trim().replace(/\s+/g, ' ');
}

export function validarEmail(email: string) {
  const emailNormalizado = normalizarTexto(email);

  if (!emailNormalizado) {
    return 'Informe seu e-mail.';
  }

  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regexEmail.test(emailNormalizado)) {
    return 'Informe um e-mail válido.';
  }

  return null;
}

export function validarSenha(senha: string) {
  const senhaNormalizada = normalizarTexto(senha);

  if (!senhaNormalizada) {
    return 'Informe sua senha.';
  }

  if (senhaNormalizada.length < 6) {
    return 'A senha deve ter pelo menos 6 caracteres.';
  }

  return null;
}

export function formatarCpf(valor: string) {
  const digitos = valor.replace(/\D/g, '').slice(0, 11);

  if (digitos.length <= 3) return digitos;
  if (digitos.length <= 6) return `${digitos.slice(0, 3)}.${digitos.slice(3)}`;
  if (digitos.length <= 9) return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6)}`;

  return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-${digitos.slice(9)}`;
}

export function validarCpf(valor: string) {
  const digitos = valor.replace(/\D/g, '');

  if (digitos.length !== 11) {
    return 'Informe um CPF válido com 11 dígitos.';
  }

  return null;
}

export function validarTelefone(valor: string) {
  const digitos = valor.replace(/\D/g, '');

  if (!digitos || digitos.length < 10) {
    return 'Informe um telefone válido.';
  }

  return null;
}

export function construirResumoIngressos(quantidadeInteira: number, quantidadeMeia: number) {
  return `${quantidadeInteira} inteira(s) / ${quantidadeMeia} meia(s)`;
}

export function calcularValorTotalCompra({
  valorBase,
  quantidadeInteira,
  quantidadeMeia,
}: {
  valorBase: number;
  quantidadeInteira: number;
  quantidadeMeia: number;
}) {
  const valorEntradaInteira = Number(valorBase || 0);
  const valorEntradaMeia = Number(((valorBase || 0) / 2).toFixed(2));

  return Number((quantidadeInteira * valorEntradaInteira + quantidadeMeia * valorEntradaMeia).toFixed(2));
}

export function validarSelecaoCompra({
  totalIngressos,
  assentosSelecionados,
  formaPagamento,
}: {
  totalIngressos: number;
  assentosSelecionados: string[];
  formaPagamento: string;
}) {
  if (totalIngressos <= 0) {
    return 'Selecione pelo menos 1 ingresso.';
  }

  if (assentosSelecionados.length !== totalIngressos) {
    return `Selecione exatamente ${totalIngressos} assento(s) para continuar.`;
  }

  if (!formaPagamento) {
    return 'Escolha a forma de pagamento antes de confirmar.';
  }

  return null;
}
