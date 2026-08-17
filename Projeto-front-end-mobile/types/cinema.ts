export type Movie = {
  id: number;
  title: string;
  genre: string;
  rating: string;
  time: number;
  image: string;
  synopsis: string;
  price?: number;
};

export type Session = {
  id: number;
  movieId: number;
  horario: string;
  sala: string;
  tipo: string;
  valor: number;
};

export type AuthUser = {
  id_usuario: number;
  nome: string;
  email: string;
  tipo_usuario: string;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export type Purchase = {
  id: string;
  movie: string;
  session: string;
  type: string;
  seats: string;
  quantity: number;
  value: number;
  dataCompra: string;
  userEmail?: string;
  paymentMethod?: string;
  tipoIngresso?: string;
};
