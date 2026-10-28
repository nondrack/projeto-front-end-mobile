import { ErrorRequestHandler, Response } from "express";
import multer from "multer";
import { ForeignKeyConstraintError, UniqueConstraintError, ValidationError } from "sequelize";
import logger from "../utils/logger";

interface ErrorResponse {
  message: string;
  code: string;
  requestId: string;
}

function getErrorProperty(error: unknown, property: string): unknown {
  if (!error || typeof error !== "object") return undefined;
  return (error as Record<string, unknown>)[property];
}

function sendError(
  res: Response,
  requestId: string,
  status: number,
  code: string,
  message: string,
): void {
  const payload: ErrorResponse = { message, code, requestId };
  res.status(status).json(payload);
}

const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  const requestId = req.requestId || "unavailable";

  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return sendError(res, requestId, 413, "FILE_TOO_LARGE", "Arquivo muito grande. O tamanho máximo permitido é 2MB.");
    }
    return sendError(res, requestId, 400, "UPLOAD_INVALID", "Erro ao receber o arquivo enviado.");
  }

  if (error instanceof UniqueConstraintError) {
    logger.warn("http.request.rejected", { requestId, errorCode: "DUPLICATE_VALUE" });
    return sendError(res, requestId, 409, "DUPLICATE_VALUE", "Já existe um registro com esses dados.");
  }

  if (error instanceof ForeignKeyConstraintError) {
    logger.warn("http.request.rejected", { requestId, errorCode: "RELATED_RECORD_EXISTS" });
    return sendError(res, requestId, 409, "RELATED_RECORD_EXISTS", "A operação conflita com registros relacionados.");
  }

  if (error instanceof ValidationError) {
    logger.warn("http.request.rejected", { requestId, errorCode: "VALIDATION_ERROR" });
    return sendError(res, requestId, 400, "VALIDATION_ERROR", "Os dados enviados são inválidos.");
  }

  const errorMessage = error instanceof Error ? error.message : "";
  if (errorMessage.startsWith("Formato inválido.")) {
    return sendError(res, requestId, 400, "INVALID_FILE_FORMAT", errorMessage);
  }

  if (getErrorProperty(error, "type") === "entity.parse.failed") {
    logger.warn("http.request.rejected", { requestId, errorCode: "INVALID_JSON" });
    return sendError(res, requestId, 400, "INVALID_JSON", "O corpo da requisição contém JSON inválido.");
  }

  logger.error("http.request.failed", error, {
    requestId,
    method: req.method,
    path: req.path,
  });
  return sendError(res, requestId, 500, "INTERNAL_ERROR", "Erro interno do servidor.");
};

export default errorHandler;
