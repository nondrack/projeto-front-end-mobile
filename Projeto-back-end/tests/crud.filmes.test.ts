import { beforeEach, describe, expect, it, vi } from "vitest";
import FilmesController from "../src/controllers/filmes.controller";
import Filme from "../src/models/Filme";

const { cacheMocks } = vi.hoisted(() => ({
  cacheMocks: {
    getCachedOrLoad: vi.fn(),
    invalidateCache: vi.fn(),
    publishDomainEvent: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock("../src/models/Filme", () => ({
  default: {
    findAndCountAll: vi.fn(),
    findByPk: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("../src/services/redisCache.service", () => cacheMocks);
vi.mock("../src/services/redisEventBus.service", () => ({
  publishDomainEvent: cacheMocks.publishDomainEvent,
}));

function createResponse() {
  const res: any = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    setHeader: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  };
  return res;
}

describe("🎬 CRUD DE FILMES", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cacheMocks.getCachedOrLoad.mockImplementation(async (_namespace, _key, loader) => ({
      value: await loader(),
      status: "MISS",
    }));
  });

  it("✅ SUCESSO: deve listar filmes com paginacao", async () => {
    (Filme as any).findAndCountAll.mockResolvedValue({ rows: [], count: 0 });

    const req = { query: { page: "1", limit: "10" } };
    const res = createResponse();

    await FilmesController.findAll(req as any, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.setHeader).toHaveBeenCalledWith("X-Cache", "MISS");
  });

  it("invalida o cache após atualizar um filme", async () => {
    const filme = { id_filme: 1, update: vi.fn().mockResolvedValue(undefined) };
    (Filme as any).findByPk.mockResolvedValue(filme);

    const req = { params: { id: "1" }, body: { titulo: "Atualizado" } };
    const res = createResponse();

    await FilmesController.update(req as any, res);

    expect(cacheMocks.invalidateCache).toHaveBeenCalledWith("catalog:filmes");
    expect(cacheMocks.publishDomainEvent).toHaveBeenCalledWith({
      type: "filme.updated",
      entity: "filme",
      entityId: 1,
    });
    expect(res.setHeader).toHaveBeenCalledWith("X-Cache-Invalidated", "true");
  });

  it("❌ SABOTAGEM CRUD: deve retornar 404 ao atualizar filme inexistente", async () => {
    (Filme as any).findByPk.mockResolvedValue(null);

    const req = { params: { id: "999" }, body: { titulo: "Novo" } };
    const res = createResponse();

    await FilmesController.update(req as any, res);

    expect(res.status, "⚠️ O SISTEMA NAO RETORNOU 404 PARA FILME INEXISTENTE!").toHaveBeenCalledWith(404);
  });

  it("❌ SABOTAGEM CRUD: deve retornar 404 ao remover filme inexistente", async () => {
    (Filme as any).findByPk.mockResolvedValue(null);

    const req = { params: { id: "999" } };
    const res = createResponse();

    await FilmesController.delete(req as any, res);

    expect(res.status, "⚠️ O SISTEMA NAO RETORNOU 404 AO REMOVER FILME INEXISTENTE!").toHaveBeenCalledWith(404);
  });
});
