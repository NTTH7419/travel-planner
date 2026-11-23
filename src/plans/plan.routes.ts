// The plan routes: which URL goes to which controller method, nothing else.
// Registered by app.ts under the /v1 prefix.

import type { FastifyPluginAsync } from "fastify";
import { PlanController, type PlanControllerDeps } from "./plan.controller.js";

export const planRoutes: FastifyPluginAsync<PlanControllerDeps> = async (
  app,
  deps,
) => {
  const plans = new PlanController(deps);

  app.post("/plans/:planId/save", plans.save);
};
