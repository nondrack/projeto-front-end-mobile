export interface FilmePayloadDto {
  [key: string]: unknown;
  [key: symbol]: unknown;
  titulo?: string;
  genero?: string;
  classificacao_etaria?: string;
  duracao?: number;
  sinopse?: string;
  poster_url?: string;
  data_lancamento?: string;
}
