export interface LoginRequestDto {
  email?: string;
  senha?: string;
}

export interface LoginInputDto {
  email: string;
  senha: string;
}

export interface AuthPayloadDto {
  id_usuario: number;
  email: string;
  tipo_usuario: string;
}
