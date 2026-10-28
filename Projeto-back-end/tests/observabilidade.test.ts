import { afterEach, describe, expect, it, vi } from "vitest";
import multer from "multer";
import errorHandler from "../src/middlewares/errorHandler.middleware";
import { requestLogger } from "../src/middlewares/requestLogger.middleware";

function createResponse() {
  const res: any = {
    headersSent: false,
    statusCode: 200,
    status: vi.fn().mockImplementation((statusCode: number) => {
      res.statusCode = statusCode;
      return res;
    }),
    json: vi.fn().mockReturnThis(),
    setHeader: vi.fn(),
    on: vi.fn(),
  };
  return res;
}

describe("request logging and centralized errors", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("logs request ID, route, status and duration without logging query parameters", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const req: any = { method: "GET", path: "/catalogo/filmes", originalUrl: "/catalogo/filmes?token=secret" };
    const res = createResponse();
    const next = vi.fn();

    requestLogger(req, res, next);

    expect(req.requestId).toBeTruthy();
    expect(res.setHeader).toHaveBeenCalledWith("X-Request-Id", req.requestId);
    expect(next).toHaveBeenCalledOnce();

    const finish = res.on.mock.calls[0][1];
    res.statusCode = 200;
    finish();

    const entry = JSON.parse(log.mock.calls[0][0] as string);
    expect(entry).toMatchObject({
      level: "info",
      message: "http.request.completed",
      requestId: req.requestId,
      method: "GET",
      path: "/catalogo/filmes",
      statusCode: 200,
    });
    expect(log.mock.calls[0][0]).not.toContain("secret");
    expect(entry.durationMs).toEqual(expect.any(Number));
  });

  it("returns a safe, traceable response for unexpected errors", () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const req: any = { requestId: "request-123", method: "POST", path: "/filmes" };
    const res = createResponse();

    errorHandler(new Error("database password leaked"), req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Erro interno do servidor.",
      code: "INTERNAL_ERROR",
      requestId: "request-123",
    });
    expect(log).toHaveBeenCalledOnce();
    expect(res.json.mock.calls[0][0].message).not.toContain("database password leaked");
  });

  it("maps malformed JSON to a client error without exposing parser details", () => {
    const req: any = { requestId: "request-456", method: "POST", path: "/filmes" };
    const res = createResponse();

    errorHandler({ type: "entity.parse.failed", message: "sensitive parser detail" }, req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "O corpo da requisição contém JSON inválido.",
      code: "INVALID_JSON",
      requestId: "request-456",
    });
  });

  it("keeps the upload-size error status and returns the request ID", () => {
    const req: any = { requestId: "request-789", method: "POST", path: "/filmes/upload-poster" };
    const res = createResponse();

    errorHandler(new multer.MulterError("LIMIT_FILE_SIZE"), req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(413);
    expect(res.json).toHaveBeenCalledWith({
      message: "Arquivo muito grande. O tamanho máximo permitido é 2MB.",
      code: "FILE_TOO_LARGE",
      requestId: "request-789",
    });
  });
});
