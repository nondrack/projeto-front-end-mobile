import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import type { AuthResponse, Movie, Purchase, Session } from '@/types/cinema';

const STORAGE_KEYS = {
  token: 'cinemax-token',
  user: 'cinemax-user',
  purchases: 'cinemax-purchases',
};

const fallbackMovies: Movie[] = [
  {
    id: 1,
    title: 'Duna: Parte 2',
    genre: 'Sci‑Fi',
    rating: '12+',
    time: 166,
    image:
      'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=900&q=80',
    synopsis:
      'Paul Atreides une forças com Fremen para confrontar um futuro incerto, onde o destino do universo e a sobrevivência da família podem mudar tudo.',
    price: 45,
  },
  {
    id: 2,
    title: 'O Rei do Show',
    genre: 'Drama',
    rating: '14+',
    time: 132,
    image:
      'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80',
    synopsis:
      'Uma jornada emocional e inspiradora que mistura música, determinação e momentos de grande impacto.',
    price: 38,
  },
  {
    id: 3,
    title: 'A Cidade do Céu',
    genre: 'Aventura',
    rating: 'Livre',
    time: 118,
    image:
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=80',
    synopsis:
      'Uma aventura visualmente rica com encontros emocionantes, desafios e descobertas ao longo da historia.',
    price: 32,
  },
];

const fallbackSessions: Session[] = [
  { id: 1, movieId: 1, horario: '14:40', sala: 'Sala 1', tipo: '2D', valor: 32 },
  { id: 2, movieId: 1, horario: '16:10', sala: 'Sala 2', tipo: '3D', valor: 38 },
  { id: 3, movieId: 1, horario: '18:50', sala: 'Sala 3', tipo: 'IMAX', valor: 45 },
  { id: 4, movieId: 2, horario: '15:20', sala: 'Sala 4', tipo: '2D', valor: 35 },
  { id: 5, movieId: 2, horario: '18:00', sala: 'Sala 1', tipo: '3D', valor: 42 },
  { id: 6, movieId: 3, horario: '17:30', sala: 'Sala 2', tipo: 'IMAX', valor: 39 },
];

const fallbackPurchases: Purchase[] = [
  {
    id: 'demo-1',
    movie: 'Duna: Parte 2',
    session: '18:50 • Sala 3',
    type: 'IMAX',
    seats: 'F5, F6',
    quantity: 2,
    value: 90,
    dataCompra: new Date().toISOString(),
    userEmail: 'cliente@cinemax.com.br',
  },
];

const apiBaseUrl = (() => {
  const configuredUrl = process.env.EXPO_PUBLIC_API_URL;
  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, '');
  }

  const host = Platform.select({
    android: 'http://10.0.2.2:3000',
    ios: 'http://localhost:3000',
    default: 'http://localhost:3000',
  });

  return host ?? 'http://localhost:3000';
})();

async function readStorage<T>(key: string): Promise<T | null> {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

async function writeStorage(key: string, value: unknown) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

async function getStoredToken(): Promise<string | null> {
  return readStorage<string>(STORAGE_KEYS.token);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getStoredToken();
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
    ...options,
  });

  const plainText = await response.text();
  const parsed = plainText ? JSON.parse(plainText) : null;

  if (!response.ok) {
    const message = parsed?.message || 'Erro de comunicação com a API.';
    throw new Error(message);
  }

  return parsed as T;
}

function normalizeMovie(raw: any): Movie {
  return {
    id: Number(raw.id_filme ?? raw.id ?? 1),
    title: String(raw.titulo ?? raw.title ?? 'Filme'),
    genre: String(raw.genero ?? raw.genre ?? 'Drama'),
    rating: String(raw.classificacao_etaria ?? raw.rating ?? 'Livre'),
    time: Number(raw.duracao ?? raw.time ?? 120),
    image: String(raw.poster_url ?? raw.image ?? fallbackMovies[0].image),
    synopsis: String(raw.sinopse ?? raw.synopsis ?? 'Sinopse em atualização.'),
    price: Number(raw.preco ?? raw.price ?? 35),
  };
}

function normalizeSession(raw: any, fallbackMovieId = 1): Session {
  return {
    id: Number(raw.id_sessao ?? raw.id ?? fallbackMovieId),
    movieId: Number(raw.id_filme ?? raw.movieId ?? fallbackMovieId),
    horario: String(raw.horario ?? '18:00'),
    sala: String(raw.sala ?? 'Sala 1'),
    tipo: String(raw.tipo ?? '2D'),
    valor: Number(raw.preco ?? raw.valor ?? 35),
  };
}

function normalizePurchase(raw: any): Purchase {
  return {
    id: String(raw.id ?? raw.id_ingresso ?? `purchase-${Date.now()}`),
    movie: String(raw.filme ?? raw.movie ?? 'Filme'),
    session: String(raw.sessao ?? raw.session ?? 'Sessão'),
    type: String(raw.tipo ?? raw.type ?? raw.metodo ?? '—'),
    seats: String(raw.assento ?? raw.seats ?? '—'),
    quantity: Number(raw.quantidade ?? raw.quantity ?? 1),
    value: Number(raw.valor ?? raw.value ?? 0),
    dataCompra: String(raw.dataCompra ?? raw.data_compra ?? new Date().toISOString()),
    userEmail: raw.userEmail ?? raw.email ?? undefined,
    paymentMethod: raw.metodo ?? raw.paymentMethod ?? undefined,
    tipoIngresso: raw.tipoIngresso ?? undefined,
  };
}

async function syncClientProfile(user: AuthResponse['user']) {
  const profilePayload = {
    nome: user.nome,
    email: user.email,
  };

  try {
    await request('/clientes/me', {
      method: 'POST',
      body: JSON.stringify(profilePayload),
    });
  } catch {
    // A sincronização do cliente será reprocessada na próxima tentativa.
  }
}

async function getClientProfile() {
  try {
    return await request<any>('/clientes/me');
  } catch {
    return null;
  }
}

async function getAssentos(): Promise<Array<{ id_assento: number; fila: string; numero: string }>> {
  try {
    const data = await request<any[]>('/catalogo/assentos');
    return Array.isArray(data)
      ? data.map((assento) => ({
          id_assento: Number(assento.id_assento ?? assento.id ?? 0),
          fila: String(assento.fila ?? ''),
          numero: String(assento.numero ?? ''),
        }))
      : [];
  } catch {
    return [];
  }
}

export const cinemaApi = {
  async login(email: string, senha: string): Promise<AuthResponse> {
    const response = await request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
    });

    await writeStorage(STORAGE_KEYS.token, response.token);
    await writeStorage(STORAGE_KEYS.user, response.user);
    await syncClientProfile(response.user);

    return response;
  },

  async register(userData: { nome: string; email: string; senha: string; cpf?: string; telefone?: string }) {
    await request('/usuarios', {
      method: 'POST',
      body: JSON.stringify({
        nome: userData.nome,
        cpf: userData.cpf || '00000000000',
        email: userData.email,
        senha: userData.senha,
        tipo_usuario: 'cliente',
      }),
    });

    return this.login(userData.email, userData.senha);
  },

  async getMovies(): Promise<Movie[]> {
    try {
      const data = await request<any[]>('/catalogo/filmes');
      if (!Array.isArray(data) || !data.length) {
        return fallbackMovies;
      }
      return data.map((movie) => normalizeMovie(movie));
    } catch {
      return fallbackMovies;
    }
  },

  async getMovieById(id: number): Promise<Movie | null> {
    try {
      const movie = await request<any>(`/catalogo/filmes/${id}`);
      return normalizeMovie(movie);
    } catch {
      return fallbackMovies.find((item) => item.id === id) ?? fallbackMovies[0];
    }
  },

  async getSessions(): Promise<Session[]> {
    try {
      const data = await request<any[]>('/catalogo/sessoes');
      if (!Array.isArray(data) || !data.length) {
        return fallbackSessions;
      }
      return data.map((session) => normalizeSession(session, Number(session.id_filme || session.movieId || 1)));
    } catch {
      return fallbackSessions;
    }
  },

  async getUserSession() {
    const [token, user] = await Promise.all([
      readStorage<string>(STORAGE_KEYS.token),
      readStorage<any>(STORAGE_KEYS.user),
    ]);

    return { token, user };
  },

  async logout() {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.token),
      AsyncStorage.removeItem(STORAGE_KEYS.user),
    ]);
  },

  async savePurchase(purchase: Purchase) {
    const storedToken = await getStoredToken();

    if (!storedToken) {
      const current = (await readStorage<Purchase[]>(STORAGE_KEYS.purchases)) ?? [];
      const updated = [purchase, ...current].slice(0, 20);
      await writeStorage(STORAGE_KEYS.purchases, updated);
      return updated;
    }

    try {
      const profile = (await getClientProfile()) ?? (await syncClientProfile((await readStorage<AuthResponse['user']>(STORAGE_KEYS.user)) as AuthResponse['user']));

      if (!profile?.id_cliente) {
        throw new Error('Cliente não foi encontrado na API.');
      }

      const assentos = await getAssentos();
      const seats = purchase.seats
        .split(',')
        .map((seat) => seat.trim())
        .filter(Boolean);

      const createdPurchases: Array<{ id_ingresso: number }> = [];

      for (const seat of seats) {
        const assento = assentos.find((item) => `${item.fila}${item.numero}`.toUpperCase() === seat.toUpperCase());

        if (!assento) {
          continue;
        }

        const ingresso = await request<any>('/ingressos', {
          method: 'POST',
          body: JSON.stringify({
            id_sessao: purchase.sessionId ?? 1,
            id_cliente: Number(profile.id_cliente),
            id_assento: assento.id_assento,
            data_compra: purchase.dataCompra,
          }),
        });

        createdPurchases.push(ingresso);
      }

      const paymentValue = seats.length > 0 ? Number((purchase.value / seats.length).toFixed(2)) : Number(purchase.value || 0);

      for (const ingresso of createdPurchases) {
        await request('/pagamentos', {
          method: 'POST',
          body: JSON.stringify({
            id_ingresso: ingresso.id_ingresso,
            valor: paymentValue,
            metodo_pagamento: purchase.paymentMethod ?? 'pix',
            data_pagamento: purchase.dataCompra,
          }),
        });
      }

      const current = (await readStorage<Purchase[]>(STORAGE_KEYS.purchases)) ?? [];
      const updated = [purchase, ...current].slice(0, 20);
      await writeStorage(STORAGE_KEYS.purchases, updated);
      return updated;
    } catch {
      const current = (await readStorage<Purchase[]>(STORAGE_KEYS.purchases)) ?? [];
      const updated = [purchase, ...current].slice(0, 20);
      await writeStorage(STORAGE_KEYS.purchases, updated);
      return updated;
    }
  },

  async getPurchases(): Promise<Purchase[]> {
    const token = await getStoredToken();

    if (!token) {
      return (await readStorage<Purchase[]>(STORAGE_KEYS.purchases)) ?? fallbackPurchases;
    }

    try {
      const data = await request<any[]>('/me/compras');
      return Array.isArray(data) ? data.map((purchase) => normalizePurchase(purchase)) : fallbackPurchases;
    } catch {
      return (await readStorage<Purchase[]>(STORAGE_KEYS.purchases)) ?? fallbackPurchases;
    }
  },
};
