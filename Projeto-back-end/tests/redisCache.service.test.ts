import { beforeEach, describe, expect, it, vi } from "vitest";

const { redisMock } = vi.hoisted(() => ({
  redisMock: {
    isOpen: false,
    connect: vi.fn(),
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    incr: vi.fn(),
    on: vi.fn(),
  },
}));

vi.mock("redis", () => ({
  createClient: vi.fn(() => redisMock),
}));

import { getCachedOrLoad, invalidateCache } from "../src/services/redisCache.service";

describe("Redis cache-aside", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    redisMock.get.mockResolvedValue(null);
    redisMock.set.mockResolvedValue("OK");
    redisMock.del.mockResolvedValue(1);
    redisMock.incr.mockResolvedValue(1);
  });

  it("loads from the database and stores the result with a 60-second TTL on a miss", async () => {
    const loader = vi.fn().mockResolvedValue([{ id: 1 }]);
    const result = await getCachedOrLoad("catalog:filmes", "all", loader);

    expect(result).toEqual({ value: [{ id: 1 }], status: "MISS" });
    expect(loader).toHaveBeenCalledOnce();
    expect(redisMock.set).toHaveBeenCalledWith(
      "cache:catalog:filmes:v0:all",
      '[{"id":1}]',
      { EX: 60 },
    );
  });

  it("returns cached data without querying the database on a hit", async () => {
    redisMock.get
      .mockResolvedValueOnce("3")
      .mockResolvedValueOnce('[{"id":1}]');
    const loader = vi.fn();

    const result = await getCachedOrLoad("catalog:filmes", "all", loader);

    expect(result).toEqual({ value: [{ id: 1 }], status: "HIT" });
    expect(loader).not.toHaveBeenCalled();
  });

  it("bypasses Redis and reads from the database when Redis cannot be read", async () => {
    const error = new Error("Redis unavailable");
    redisMock.get.mockRejectedValueOnce(error);
    const loader = vi.fn().mockResolvedValue([]);
    const logError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const result = await getCachedOrLoad("catalog:sessoes", "all", loader);

    expect(result).toEqual({ value: [], status: "BYPASS" });
    expect(loader).toHaveBeenCalledOnce();
    const logEntry = JSON.parse(logError.mock.calls[0][0] as string);
    expect(logEntry).toMatchObject({
      level: "error",
      message: "redis.cache.read.failed",
      namespace: "catalog:sessoes",
      key: "all",
      errorMessage: error.message,
    });
    logError.mockRestore();
  });

  it("invalidates every key in a catalog namespace by incrementing its version", async () => {
    await invalidateCache("catalog:filmes");

    expect(redisMock.incr).toHaveBeenCalledWith("cache:catalog:filmes:version");
  });
});
