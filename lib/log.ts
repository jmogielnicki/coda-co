// Minimal structured logger. Emits one JSON line per event so Vercel's
// log aggregation can index fields without regex-parsing free-form
// strings. Wraps console so there's no runtime dependency — swap the
// emitter for pino/axiom/etc. later without touching call sites.

type Level = "info" | "warn" | "error";

export interface LogFields {
  [key: string]: unknown;
}

interface SerializedError {
  name: string;
  message: string;
  stack?: string;
}

function serializeError(err: unknown): SerializedError | unknown {
  if (err instanceof Error) {
    return { name: err.name, message: err.message, stack: err.stack };
  }
  return err;
}

function emit(level: Level, event: string, fields?: LogFields) {
  const record: Record<string, unknown> = {
    level,
    event,
    timestamp: new Date().toISOString(),
  };
  if (fields) {
    for (const [k, v] of Object.entries(fields)) {
      record[k] = k === "err" ? serializeError(v) : v;
    }
  }
  const line = JSON.stringify(record);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const log = {
  info: (event: string, fields?: LogFields) => emit("info", event, fields),
  warn: (event: string, fields?: LogFields) => emit("warn", event, fields),
  error: (event: string, fields?: LogFields) => emit("error", event, fields),
};

// Next.js uses thrown "errors" with a `digest` field to drive redirect()
// and notFound() control flow. They're not real failures, so callers
// re-throwing from catch blocks should skip logging them.
export function isNextControlFlow(err: unknown): boolean {
  if (!err || typeof err !== "object" || !("digest" in err)) return false;
  const digest = (err as { digest?: unknown }).digest;
  return (
    typeof digest === "string" &&
    (digest.startsWith("NEXT_REDIRECT") || digest === "NEXT_NOT_FOUND")
  );
}
