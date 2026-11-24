// RFC 9457 problem types from section 2 of docs/contract/save-plan.md.

import type { FastifyReply } from "fastify";

const BASE = "https://travel-planner.example/problems/";

export const PROBLEMS = {
  "invalid-json": { status: 400, title: "Malformed JSON" },
  validation: { status: 400, title: "Invalid request" },
  "idempotency-key-missing": {
    status: 400,
    title: "Idempotency-Key required",
  },
  unauthenticated: { status: 401, title: "Not signed in" },
  forbidden: { status: 403, title: "Not allowed" },
  "not-found": { status: 404, title: "Not found" },
  "idempotency-key-reused": { status: 422, title: "Idempotency-Key reused" },
  "plan-rejected": { status: 422, title: "Plan rejected by the validator" },
  internal: { status: 500, title: "Internal error" },
} as const;

export type ProblemSlug = keyof typeof PROBLEMS;

export interface FieldError {
  pointer: string;
  detail: string;
  code?: string;
}

export interface Problem {
  type: string;
  title: string;
  status: number;
  detail: string;
  errors?: FieldError[];
}

export function problem(
  slug: ProblemSlug,
  detail: string,
  errors?: FieldError[],
): Problem {
  const { status, title } = PROBLEMS[slug];
  return errors
    ? { type: BASE + slug, title, status, detail, errors }
    : { type: BASE + slug, title, status, detail };
}

// Sends a problem details response with the right status and content type.
export function sendProblem(
  reply: FastifyReply,
  slug: ProblemSlug,
  detail: string,
  errors?: FieldError[],
): FastifyReply {
  const body = problem(slug, detail, errors);
  return reply.code(body.status).type("application/problem+json").send(body);
}
