import "dotenv/config";
import { createClient } from "redis";
import logger from "../utils/logger";

const CACHE_TTL_SECONDS = 60;
const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
  disableOfflineQueue: true,
});

redisClient.on("error", (error) => {
  logger.error("redis.cache.connection.error", error);
});

export type CacheStatus = "HIT" | "MISS" | "BYPASS";

export async function connectRedis(): Promise<void> {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
}

export async function getCachedOrLoad<T>(
  namespace: string,
  key: string,
  loader: () => Promise<T>,
): Promise<{ value: T; status: CacheStatus }> {
  let cacheKey: string;

  try {
    const version = (await redisClient.get(`cache:${namespace}:version`)) ?? "0";
    cacheKey = `cache:${namespace}:v${version}:${key}`;
    const cached = await redisClient.get(cacheKey);

    if (cached !== null) {
      try {
        return { value: JSON.parse(cached) as T, status: "HIT" };
      } catch (error) {
        logger.error("redis.cache.invalid_entry", error, { cacheKey });
        await redisClient.del(cacheKey);
      }
    }
  } catch (error) {
    logger.error("redis.cache.read.failed", error, { namespace, key });
    return { value: await loader(), status: "BYPASS" };
  }

  const value = await loader();
  const serialized = JSON.stringify(value);
  if (serialized === undefined) {
    throw new TypeError(`Não foi possível serializar o valor de cache ${namespace}:${key}.`);
  }

  try {
    await redisClient.set(cacheKey, serialized, { EX: CACHE_TTL_SECONDS });
  } catch (error) {
    logger.error("redis.cache.write.failed", error, { namespace, key });
  }

  return { value, status: "MISS" };
}

export async function invalidateCache(namespace: string): Promise<void> {
  await redisClient.incr(`cache:${namespace}:version`);
}
