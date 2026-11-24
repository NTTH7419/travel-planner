// Shared helpers for the contract tests of POST /v1/plans/{planId}/save.
// Everything here comes from docs/contract/save-plan.md, never from src/:
// the tests treat the server as a black box reached only through HTTP.

import type { FastifyInstance } from "fastify";
import { expect } from "vitest";
import { createApp } from "../src/app.js";

// Contract section 2: every problem type, its status and its title.
export const PROBLEMS = {
  "invalid-json": { status: 400, title: "Malformed JSON" },
  validation: { status: 400, title: "Invalid request" },
  "idempotency-key-missing": { status: 400, title: "Idempotency-Key required" },
  unauthenticated: { status: 401, title: "Not signed in" },
  forbidden: { status: 403, title: "Not allowed" },
  "not-found": { status: 404, title: "Not found" },
  "idempotency-key-reused": { status: 422, title: "Idempotency-Key reused" },
  "plan-rejected": { status: 422, title: "Plan rejected by the validator" },
  internal: { status: 500, title: "Internal error" },
} as const;

export type ProblemSlug = keyof typeof PROBLEMS;

export const PROBLEM_TYPE_BASE = "https://travel-planner.example/problems/";

export interface ProblemError {
  pointer: string;
  detail: string;
  code?: string;
}

export interface Problem {
  type: string;
  title: string;
  status: number;
  detail: string;
  errors?: ProblemError[];
}

export interface PlanItem {
  itemId: number;
  qty: number;
  priceVnd: number;
}

export interface Plan {
  id: number;
  tripId: number;
  ownerId: number;
  status: "draft" | "saved";
  revision: number;
  stops: {
    placeId: number;
    startsAt: string;
    endsAt: string;
    items: PlanItem[];
  }[];
  totalVnd: number;
  savedAt: string | null;
}

// Contract section 6: prices of the seeded items.
export const PRICE_VND = { 11: 45000, 12: 30000, 21: 60000 } as const;

// The request body from the contract's section 4.1: place 1 with 4 x item 11,
// then place 2 with nothing to buy. totalVnd is 4 x 45,000 = 180,000.
export function validBody() {
  return {
    stops: [
      {
        placeId: 1,
        startsAt: "2026-11-28T02:00:00.000Z",
        endsAt: "2026-11-28T03:30:00.000Z",
        items: [{ itemId: 11, qty: 4 }],
      },
      {
        placeId: 2,
        startsAt: "2026-11-28T04:00:00.000Z",
        endsAt: "2026-11-28T05:00:00.000Z",
        items: [] as { itemId: number; qty: number }[],
      },
    ],
  };
}

export const VALID_TOTAL_VND = 180000;

// A fresh server with the seeded data of contract section 6. Each test gets
// its own, so a save in one test never leaks into another.
export function newApp(now?: () => Date): FastifyInstance {
  return createApp(now ? { now } : {});
}

// A clock that moves one minute forward on every call, so a replay that
// re-saved the plan would show up as a different savedAt.
export function tickingClock(start = "2026-11-23T10:15:00.000Z") {
  let t = Date.parse(start);
  return () => {
    const d = new Date(t);
    t += 60_000;
    return d;
  };
}

export interface SaveRequest {
  planId?: number | string;
  // A user token such as "user-1". null sends no Authorization header.
  token?: string | null;
  // Overrides the whole Authorization header, e.g. "Basic abc".
  authorization?: string;
  // null sends no Idempotency-Key header.
  key?: string | null;
  // Sent as JSON. Ignored when rawBody is given.
  body?: unknown;
  // Sent exactly as written, for malformed JSON.
  rawBody?: string;
}

let keyCounter = 0;
export function newKey(): string {
  keyCounter += 1;
  return `test-key-${keyCounter}`;
}

// POST /v1/plans/{planId}/save. Defaults: plan 1, user-1, a fresh key and
// the valid body, so each test states only what it changes.
export function savePlan(app: FastifyInstance, req: SaveRequest = {}) {
  const headers: Record<string, string> = {
    "content-type": "application/json",
  };
  const token = req.token === undefined ? "user-1" : req.token;
  if (req.authorization !== undefined) {
    headers.authorization = req.authorization;
  } else if (token !== null) {
    headers.authorization = `Bearer ${token}`;
  }
  const key = req.key === undefined ? newKey() : req.key;
  if (key !== null) headers["idempotency-key"] = key;

  return app.inject({
    method: "POST",
    url: `/v1/plans/${req.planId ?? 1}/save`,
    headers,
    payload: req.rawBody ?? JSON.stringify(req.body ?? validBody()),
  });
}

type InjectResponse = Awaited<ReturnType<typeof savePlan>>;

// Checks everything the contract promises about a problem response: the
// status, the problem+json media type, and type, title and status in the
// body. Returns the body for further checks.
export function expectProblem(res: InjectResponse, slug: ProblemSlug): Problem {
  const { status, title } = PROBLEMS[slug];
  expect(res.statusCode).toBe(status);
  expect(res.headers["content-type"]).toMatch(/^application\/problem\+json/);

  const body = res.json<Problem>();
  expect(body.type).toBe(PROBLEM_TYPE_BASE + slug);
  expect(body.title).toBe(title);
  expect(body.status).toBe(status);
  expect(typeof body.detail).toBe("string");
  expect(body.detail.length).toBeGreaterThan(0);
  // `errors` belongs only to validation and plan-rejected.
  if (slug !== "validation" && slug !== "plan-rejected") {
    expect(body).not.toHaveProperty("errors");
  }
  return body;
}

// Checks a successful save: 200, plain JSON, no replay header.
export function expectSaved(res: InjectResponse): Plan {
  expect(res.statusCode).toBe(200);
  expect(res.headers["content-type"]).toMatch(/^application\/json/);
  expect(res.headers["idempotent-replayed"]).toBeUndefined();
  return res.json<Plan>();
}
