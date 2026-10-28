import "dotenv/config";
import { createClient } from "redis";
import logger from "../utils/logger";

const EVENT_CHANNEL = "cinema:events";
const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const publisher = createClient({ url: redisUrl, disableOfflineQueue: true });
const subscriber = createClient({ url: redisUrl, disableOfflineQueue: true });

export type DomainEntity = "filme" | "sessao";

export interface DomainEvent {
  eventId: string;
  type: `${DomainEntity}.${"created" | "updated" | "deleted"}`;
  entity: DomainEntity;
  entityId: number;
  occurredAt: string;
}

interface DomainEventInput {
  type: DomainEvent["type"];
  entity: DomainEntity;
  entityId: number;
}

publisher.on("error", (error) => {
  logger.error("redis.events.publisher.connection.error", error);
});

subscriber.on("error", (error) => {
  logger.error("redis.events.subscriber.connection.error", error);
});

let consumerStarted = false;

export async function connectEventBus(): Promise<void> {
  if (!publisher.isOpen) {
    await publisher.connect();
  }
  if (!subscriber.isOpen) {
    await subscriber.connect();
  }

  if (!consumerStarted) {
    await subscriber.subscribe(EVENT_CHANNEL, (message) => {
      try {
        const event = JSON.parse(message) as DomainEvent;
        logger.info("redis.event.received", { channel: EVENT_CHANNEL, event });
      } catch (error) {
        logger.error("redis.event.invalid_message", error, { channel: EVENT_CHANNEL });
      }
    });
    consumerStarted = true;
    logger.info("redis.event.consumer.subscribed", {
      channel: EVENT_CHANNEL,
    });
  }
}

export async function publishDomainEvent(input: DomainEventInput): Promise<DomainEvent> {
  const event: DomainEvent = {
    ...input,
    eventId: crypto.randomUUID(),
    occurredAt: new Date().toISOString(),
  };

  const subscriberCount = await publisher.publish(EVENT_CHANNEL, JSON.stringify(event));
  logger.info("redis.event.published", {
    channel: EVENT_CHANNEL,
    subscriberCount,
    event,
  });

  return event;
}
