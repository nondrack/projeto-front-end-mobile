export interface SessaoPayloadDto {
  [key: string]: unknown;
  [key: symbol]: unknown;
  id_filme?: number;
  id_sala?: number;
  horario?: string;
  preco?: number;
}
