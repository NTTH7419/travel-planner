// Builds the app: Fastify setup shared by every route, fresh in-memory stores,
// and each domain's routes. Each call returns an independent instance, so
// tests can start clean.

import Fastify, { type FastifyInstance } from "fastify";
import { seedTokens } from "./auth/auth.tokens.js";
import { seedGroups } from "./groups/group.store.js";
import { seedPlaces } from "./places/place.store.js";
import type { Plan } from "./plans/plan.model.js";
import { planRoutes } from "./plans/plan.routes.js";
import { PlanService } from "./plans/plan.service.js";
import { seedPlans } from "./plans/plan.store.js";
import { IdempotencyStore } from "./shared/idempotency.js";
import { sendProblem } from "./shared/problems.js";

export interface AppOptions {
  // The clock used for savedAt. Tests may pass a fixed one.
  now?: () => Date;
}

export function createApp(options: AppOptions = {}): FastifyInstance {
  const app = Fastify();

  // Keep every body as raw text. Contracts check the caller and headers
  // before the JSON, so handlers parse it themselves.
  app.removeAllContentTypeParsers();
  app.addContentTypeParser("*", { parseAs: "string" }, (_req, body, done) => {
    done(null, body);
  });

  app.setNotFoundHandler((request, reply) => {
    sendProblem(reply, "not-found", `No such path: ${request.url}`);
  });

  app.setErrorHandler((error, request, reply) => {
    if ((error as { statusCode?: number }).statusCode === 413) {
      sendProblem(reply, "validation", "The request body is too large", [
        { pointer: "", detail: "must be at most 1 MiB" },
      ]);
      return;
    }
    request.log.error(error);
    sendProblem(reply, "internal", "Something went wrong on our side");
  });

  const plans = new PlanService({
    plans: seedPlans(),
    groups: seedGroups(),
    places: seedPlaces(),
    savedKeys: new IdempotencyStore<Plan>(),
    now: options.now ?? (() => new Date()),
  });

  // Plugins load on app.ready(), which listen() and inject() call for us.
  app.register(planRoutes, {
    prefix: "/v1",
    tokens: seedTokens(),
    service: plans,
  });

  return app;
}
