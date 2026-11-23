// Idempotency-Key storage, shared by every endpoint that creates or publishes.
// Keys are scoped per caller. Only successful responses are remembered.

export type KeyLookup<T> =
  { kind: "new" } | { kind: "replay"; response: T } | { kind: "reused" };

interface Entry<T> {
  fingerprint: string;
  response: T;
}

export class IdempotencyStore<T> {
  // Entries live as long as the process, which is longer than the 24 hours
  // the contract promises.
  private readonly entries = new Map<string, Entry<T>>();

  lookup(userId: number, key: string, fingerprint: string): KeyLookup<T> {
    const entry = this.entries.get(entryId(userId, key));
    if (!entry) return { kind: "new" };
    if (entry.fingerprint !== fingerprint) return { kind: "reused" };
    return { kind: "replay", response: entry.response };
  }

  remember(userId: number, key: string, fingerprint: string, response: T) {
    this.entries.set(entryId(userId, key), { fingerprint, response });
  }
}

function entryId(userId: number, key: string): string {
  return `${userId} ${key}`;
}

// JSON with object keys sorted at every level, so two requests that are equal
// as JSON values get the same fingerprint whatever their key order.
export function fingerprint(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(fingerprint).join(",")}]`;
  if (typeof value === "object" && value !== null) {
    const entries = Object.entries(value).sort(([a], [b]) =>
      a < b ? -1 : a > b ? 1 : 0,
    );
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${fingerprint(v)}`).join(",")}}`;
  }
  return JSON.stringify(value);
}
