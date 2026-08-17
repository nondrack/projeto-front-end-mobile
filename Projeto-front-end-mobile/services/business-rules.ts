export function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

export function validateEmail(email: string) {
  const normalized = normalizeText(email);
  if (!normalized) {
    return 'Informe seu e-mail.';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalized)) {
    return 'Informe um e-mail válido.';
  }

  return null;
}

export function validatePassword(password: string) {
  const normalized = normalizeText(password);
  if (!normalized) {
    return 'Informe sua senha.';
  }

  if (normalized.length < 6) {
    return 'A senha deve ter pelo menos 6 caracteres.';
  }

  return null;
}

export function formatCpf(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export function validateCpf(value: string) {
  const digits = value.replace(/\D/g, '');

  if (digits.length !== 11) {
    return 'Informe um CPF válido com 11 dígitos.';
  }

  return null;
}

export function validatePhone(value: string) {
  const digits = value.replace(/\D/g, '');

  if (!digits || digits.length < 10) {
    return 'Informe um telefone válido.';
  }

  return null;
}

export function buildTicketSummary(qtdInteira: number, qtdMeia: number) {
  return `${qtdInteira} inteira(s) / ${qtdMeia} meia(s)`;
}

export function calculatePurchaseTotal({ basePrice, qtdInteira, qtdMeia }: { basePrice: number; qtdInteira: number; qtdMeia: number }) {
  const valorInteira = Number(basePrice || 0);
  const valorMeia = Number(((basePrice || 0) / 2).toFixed(2));

  return Number((qtdInteira * valorInteira + qtdMeia * valorMeia).toFixed(2));
}

export function validatePurchaseSelection({
  totalIngressos,
  selectedSeats,
  paymentMethod,
}: {
  totalIngressos: number;
  selectedSeats: string[];
  paymentMethod: string;
}) {
  if (totalIngressos <= 0) {
    return 'Selecione pelo menos 1 ingresso.';
  }

  if (selectedSeats.length !== totalIngressos) {
    return `Selecione exatamente ${totalIngressos} assento(s) para continuar.`;
  }

  if (!paymentMethod) {
    return 'Escolha a forma de pagamento antes de confirmar.';
  }

  return null;
}
