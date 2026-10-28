import { beforeEach, describe, expect, it, vi } from "vitest";

const { publisherMock, subscriberMock, clientMocks } = vi.hoisted(() => {
  const publisherMock = {
    isOpen: false,
    connect: vi.fn(async () => {
      publisherMock.isOpen = true;
    }),
    publish: vi.fn(),
    on: vi.fn(),
  };
  const subscriberMock = {
    isOpen: false,
    connect: vi.fn(async () => {
      subscriberMock.isOpen = true;
    }),
    subscribe: vi.fn(),
    on: vi.fn(),
  };

  return {
    publisherMock,
    subscriberMock,
    clientMocks: [publisherMock, subscriberMock],
  };
});

vi.mock("redis", () => ({
  createClient: vi.fn()
    .mockImplementationOnce(() => clientMocks[0])
    .mockImplementationOnce(() => clientMocks[1]),
}));

import { connectEventBus, publishDomainEvent } from "../src/services/redisEventBus.service";

describe("Redis Pub/Sub event bus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    publisherMock.isOpen = false;
    subscriberMock.isOpen = false;
    publisherMock.connect.mockImplementation(async () => {
      publisherMock.isOpen = true;
    });
    subscriberMock.connect.mockImplementation(async () => {
      subscriberMock.isOpen = true;
    });
    publisherMock.publish.mockResolvedValue(1);
  });

  it("publishes an event and logs matching publisher and consumer event IDs", async () => {
    let consumeMessage: ((message: string) => void) | undefined;
    subscriberMock.subscribe.mockImplementation(async (_channel, callback) => {
      consumeMessage = callback;
    });
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);

    await connectEventBus();
    const event = await publishDomainEvent({
      type: "filme.updated",
      entity: "filme",
      entityId: 42,
    });

    expect(publisherMock.publish).toHaveBeenCalledWith("cinema:events", JSON.stringify(event));
    expect(event).toMatchObject({
      type: "filme.updated",
      entity: "filme",
      entityId: 42,
    });
    expect(event.eventId).toBeTruthy();
    expect(event.occurredAt).toBeTruthy();

    consumeMessage?.(JSON.stringify(event));

    const logs = log.mock.calls.map(([message]) => JSON.parse(message as string));
    expect(logs).toContainEqual(expect.objectContaining({
      message: "redis.event.published",
      channel: "cinema:events",
      subscriberCount: 1,
      event,
    }));
    expect(logs).toContainEqual(expect.objectContaining({
      message: "redis.event.received",
      channel: "cinema:events",
      event,
    }));
    log.mockRestore();
  });
});
