export interface UserRequestDto {
  nome?: string;
  cpf?: string;
  email?: string;
  senha?: string;
  tipo_usuario?: string;
}

export interface NormalizedUserInputDto {
  nome: string;
  cpf: string;
  email: string;
  senha: string;
}
