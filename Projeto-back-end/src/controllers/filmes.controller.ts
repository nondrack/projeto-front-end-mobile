import { Request, Response } from "express";
import Filme from "../models/Filme";
import { getCachedOrLoad, invalidateCache } from "../services/redisCache.service";
import { publishDomainEvent } from "../services/redisEventBus.service";
import type { FilmePayloadDto } from "../dtos/filme.dto";

const CACHE_NAMESPACE = "catalog:filmes";

class FilmesController {
  private static readonly NOT_FOUND_MESSAGE = "Filme nao encontrado.";

  private static isForeignKeyConstraintError(error: unknown): boolean {
    if (!error || typeof error !== "object") return false;
    const err = error as { name?: string; original?: { code?: string } };
    return err.name === "SequelizeForeignKeyConstraintError" || err.original?.code === "ER_ROW_IS_REFERENCED_2";
  }

  private static parsePagination(query: Request["query"]) {
    const page = Math.max(Number(query.page || 1), 1);
    const limit = Math.min(Math.max(Number(query.limit || 10), 1), 100);
    return { page, limit, offset: (page - 1) * limit };
  }

  private static toPayload(body: FilmePayloadDto): FilmePayloadDto {
    const {
      titulo,
      genero,
      classificacao_etaria,
      duracao,
      sinopse,
      poster_url,
      data_lancamento,
    } = body;

    return { titulo, genero, classificacao_etaria, duracao, sinopse, poster_url, data_lancamento };
  }

  private static async findOrNotFound(id: number, res: Response) {
    const filme = await Filme.findByPk(id);
    if (!filme) {
      res.status(404).json({ message: FilmesController.NOT_FOUND_MESSAGE });
      return null;
    }
    return filme;
  }

  static async findAll(req: Request, res: Response) {
    const hasPagination = req.query.page !== undefined || req.query.limit !== undefined;

    if (!hasPagination) {
      const result = await getCachedOrLoad(CACHE_NAMESPACE, "all", () => Filme.findAll());
      res.setHeader("X-Cache", result.status);
      return res.status(200).json(result.value);
    }

    const { page, limit, offset } = FilmesController.parsePagination(req.query);
    const result = await getCachedOrLoad(
      CACHE_NAMESPACE,
      `page:${page}:limit:${limit}`,
      () => Filme.findAndCountAll({ limit, offset }),
    );
    const { rows, count } = result.value;

    res.setHeader("X-Cache", result.status);
    return res.status(200).json({
      data: rows,
      pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
    });
  }

  static async getById(req: Request, res: Response) {
    const id = Number(req.params.id);
    const result = await getCachedOrLoad(CACHE_NAMESPACE, `id:${id}`, async () => {
      const filme = await Filme.findByPk(id);
      return filme ? filme.toJSON() : null;
    });
    res.setHeader("X-Cache", result.status);
    if (!result.value) {
      return res.status(404).json({ message: FilmesController.NOT_FOUND_MESSAGE });
    }

    return res.status(200).json(result.value);
  }

  static async create(req: Request, res: Response) {
    const filme = await Filme.create(FilmesController.toPayload(req.body as FilmePayloadDto));
    await invalidateCache(CACHE_NAMESPACE);
    await publishDomainEvent({ type: "filme.created", entity: "filme", entityId: filme.id_filme });
    res.setHeader("X-Cache-Invalidated", "true");
    return res.status(201).json(filme);
  }

  static async update(req: Request, res: Response) {
    const filme = await FilmesController.findOrNotFound(Number(req.params.id), res);
    if (!filme) return;

    await filme.update(FilmesController.toPayload(req.body as FilmePayloadDto));
    await invalidateCache(CACHE_NAMESPACE);
    await publishDomainEvent({ type: "filme.updated", entity: "filme", entityId: filme.id_filme });
    res.setHeader("X-Cache-Invalidated", "true");

    return res.status(200).json(filme);
  }

  static async delete(req: Request, res: Response) {
    const filme = await FilmesController.findOrNotFound(Number(req.params.id), res);
    if (!filme) return;
    try {
      await filme.destroy();
    } catch (error) {
      if (FilmesController.isForeignKeyConstraintError(error)) {
        return res.status(409).json({ message: "Nao e possivel remover filme com sessoes cadastradas." });
      }
      throw error;
    }
    await invalidateCache(CACHE_NAMESPACE);
    await publishDomainEvent({ type: "filme.deleted", entity: "filme", entityId: filme.id_filme });
    res.setHeader("X-Cache-Invalidated", "true");
    return res.status(200).json({ message: "Filme removido com sucesso." });
  }
}

export default FilmesController;
