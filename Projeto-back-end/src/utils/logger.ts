type LogContext = Record<string, unknown>;
type LogLevel = "info" | "warn" | "error";

function write(level: LogLevel, message: string, context: LogContext = {}): void {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
  };
  const serialized = JSON.stringify(entry);

  if (level === "error") {
    console.error(serialized);
  } else if (level === "warn") {
    console.warn(serialized);
  } else {
    console.log(serialized);
  }
}

function serializeError(error: unknown): LogContext {
  if (error instanceof Error) {
    return {
      errorName: error.name,
      errorMessage: error.message,
      ...(error.stack ? { stack: error.stack } : {}),
    };
  }

  return { error: String(error) };
}

const logger = {
  info(message: string, context?: LogContext): void {
    write("info", message, context);
  },
  warn(message: string, context?: LogContext): void {
    write("warn", message, context);
  },
  error(message: string, error?: unknown, context: LogContext = {}): void {
    write("error", message, { ...context, ...serializeError(error) });
  },
};

export default logger;
