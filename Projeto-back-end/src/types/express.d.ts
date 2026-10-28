export {};

declare module "express-serve-static-core" {
  interface Request {
    requestId?: string;
    authUser?: {
      id_usuario: number;
      email: string;
      tipo_usuario: string;
    };
  }
}
