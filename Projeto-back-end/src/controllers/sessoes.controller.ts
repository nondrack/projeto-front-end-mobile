import { Request, Response } from "express";
import Sessao from "../models/Sessao";
import { getCachedOrLoad, invalidateCache } from "../services/redisCache.service";
import { publishDomainEvent } from "../services/redisEventBus.service";
import type { SessaoPayloadDto } from "../dtos/sessao.dto";

const CACHE_NAMESPACE = "catalog:sessoes";

class SessoesController {
  private static readonly NOT_FOUND_MESSAGE = "Sessao nao encontrada.";

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

  private static toPayload(body: SessaoPayloadDto): SessaoPayloadDto {
    const { id_filme, id_sala, horario, preco } = body;
    return { id_filme, id_sala, horario, preco };
  }

  private static async findOrNotFound(id: number, res: Response) {
    const sessao = await Sessao.findByPk(id);
    if (!sessao) {
      res.status(404).json({ message: SessoesController.NOT_FOUND_MESSAGE });
      return null;
    }
    return sessao;
  }

  static async findAll(req: Request, res: Response) {
    const hasPagination = req.query.page !== undefined || req.query.limit !== undefined;

    if (!hasPagination) {
      const result = await getCachedOrLoad(CACHE_NAMESPACE, "all", () => Sessao.findAll());
      res.setHeader("X-Cache", result.status);
      return res.status(200).json(result.value);
    }

    const { page, limit, offset } = SessoesController.parsePagination(req.query);
    const result = await getCachedOrLoad(
      CACHE_NAMESPACE,
      `page:${page}:limit:${limit}`,
      () => Sessao.findAndCountAll({ limit, offset }),
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
      const sessao = await Sessao.findByPk(id);
      return sessao ? sessao.toJSON() : null;
    });
    res.setHeader("X-Cache", result.status);
    if (!result.value) {
      return res.status(404).json({ message: SessoesController.NOT_FOUND_MESSAGE });
    }

    return res.status(200).json(result.value);
  }

  static async create(req: Request, res: Response) {
    const sessao = await Sessao.create(SessoesController.toPayload(req.body as SessaoPayloadDto));
    await invalidateCache(CACHE_NAMESPACE);
    await publishDomainEvent({ type: "sessao.created", entity: "sessao", entityId: sessao.id_sessao });
    res.setHeader("X-Cache-Invalidated", "true");
    return res.status(201).json(sessao);
  }

  static async update(req: Request, res: Response) {
    const sessao = await SessoesController.findOrNotFound(Number(req.params.id), res);
    if (!sessao) return;

    await sessao.update(SessoesController.toPayload(req.body as SessaoPayloadDto));
    await invalidateCache(CACHE_NAMESPACE);
    await publishDomainEvent({ type: "sessao.updated", entity: "sessao", entityId: sessao.id_sessao });
    res.setHeader("X-Cache-Invalidated", "true");
    return res.status(200).json(sessao);
  }

  static async delete(req: Request, res: Response) {
    const sessao = await SessoesController.findOrNotFound(Number(req.params.id), res);
    if (!sessao) return;
    try {
      await sessao.destroy();
    } catch (error) {
      if (SessoesController.isForeignKeyConstraintError(error)) {
        return res.status(409).json({ message: "Nao e possivel remover sessao com ingressos cadastrados." });
      }
      throw error;
    }
    await invalidateCache(CACHE_NAMESPACE);
    await publishDomainEvent({ type: "sessao.deleted", entity: "sessao", entityId: sessao.id_sessao });
    res.setHeader("X-Cache-Invalidated", "true");
    return res.status(200).json({ message: "Sessao removida com sucesso." });
  }
}

export default SessoesController;