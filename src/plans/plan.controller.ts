// The plan controller: the HTTP side of plans. Each method reads the request,
// calls the service and maps its result to a response. Steps are numbered as in the contract's check order
// (docs/contract/save-plan.md); steps 4-9 live in the service.

import type { FastifyReply, FastifyRequest } from "fastify";
import { userFromAuthorization, type TokenStore } from "../auth/auth.tokens.js";
import { sendProblem } from "../shared/problems.js";
import type { PlanService } from "./plan.service.js";

export interface PlanControllerDeps {
  tokens: TokenStore;
  service: PlanService;
}

type SavePlanRequest = FastifyRequest<{ Params: { planId: string } }>;

export class PlanController {
  private readonly tokens: TokenStore;
  private readonly service: PlanService;

  constructor(deps: PlanControllerDeps) {
    this.tokens = deps.tokens;
    this.service = deps.service;
  }

  // Methods are arrow functions so `this` still works when Fastify calls them
  // as plain route handlers.

  // POST /v1/plans/{planId}/save
  save = async (request: SavePlanRequest, reply: FastifyReply) => {
    // 1. Who is calling.
    const userId = userFromAuthorization(
      request.headers.authorization,
      this.tokens,
    );
    if (userId === undefined) {
      reply.header("WWW-Authenticate", "Bearer");
      return sendProblem(
        reply,
        "unauthenticated",
        "Send Authorization: Bearer <token>",
      );
    }

    // 2. Idempotency-Key.
    const key = request.headers["idempotency-key"];
    if (typeof key !== "string" || key.length < 1 || key.length > 255) {
      return sendProblem(
        reply,
        "idempotency-key-missing",
        "Send an Idempotency-Key header of 1 to 255 characters",
      );
    }

    // 3. The body is JSON. The app keeps bodies as raw text so that steps 1
    // and 2 can run before this one.
    let body: unknown;
    try {
      body = JSON.parse(
        typeof request.body === "string" ? request.body : "",
      ) as unknown;
    } catch {
      return sendProblem(
        reply,
        "invalid-json",
        "The request body is not valid JSON",
      );
    }

    const planIdText = request.params.planId;
    const result = this.service.save({
      userId,
      planId: /^[1-9]\d*$/.test(planIdText) ? Number(planIdText) : undefined,
      idempotencyKey: key,
      body,
    });

    switch (result.kind) {
      case "not-found":
        // Must not differ from a plan that was never created.
        return sendProblem(reply, "not-found", `No plan ${planIdText}`);
      case "forbidden":
        return sendProblem(
          reply,
          "forbidden",
          "Only the plan's owner can save it",
        );
      case "key-reused":
        return sendProblem(
          reply,
          "idempotency-key-reused",
          "This Idempotency-Key was already used for a different request",
        );
      case "invalid":
        return sendProblem(
          reply,
          "validation",
          `${countOf(result.errors, "field is", "fields are")} invalid`,
          result.errors,
        );
      case "rejected":
        return sendProblem(
          reply,
          "plan-rejected",
          `The plan breaks ${countOf(result.violations, "rule", "rules")}`,
          result.violations,
        );
      case "replayed":
        reply.header("Idempotent-Replayed", "true");
        return result.plan;
      case "saved":
        return result.plan;
    }
  };
}

function countOf(list: unknown[], one: string, many: string): string {
  return `${list.length} ${list.length === 1 ? one : many}`;
}
