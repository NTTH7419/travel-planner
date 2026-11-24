// Where plans live. In memory for PA#2; a database replaces this module.

import type { Plan } from "./plan.model.js";

export class PlanStore {
  private readonly plans: Map<number, Plan>;

  constructor(plans: Plan[]) {
    this.plans = new Map(plans.map((plan) => [plan.id, plan]));
  }

  get(id: number): Plan | undefined {
    return this.plans.get(id);
  }

  put(plan: Plan): void {
    this.plans.set(plan.id, plan);
  }
}

export function seedPlans(): PlanStore {
  return new PlanStore([
    draft(1, 1, 1),
    draft(2, 1, 2),
    {
      id: 3,
      tripId: 1,
      ownerId: 1,
      status: "saved",
      revision: 1,
      stops: [
        {
          placeId: 1,
          startsAt: "2026-11-28T02:00:00.000Z",
          endsAt: "2026-11-28T03:00:00.000Z",
          items: [{ itemId: 11, qty: 1, priceVnd: 45000 }],
        },
      ],
      totalVnd: 45000,
      savedAt: "2026-11-20T08:00:00.000Z",
    },
  ]);
}

function draft(id: number, tripId: number, ownerId: number): Plan {
  return {
    id,
    tripId,
    ownerId,
    status: "draft",
    revision: 0,
    stops: [],
    totalVnd: 0,
    savedAt: null,
  };
}
