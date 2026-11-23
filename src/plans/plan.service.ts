// Plan use cases. No HTTP here: each use case returns a result the handler
// turns into a response. Steps are numbered as in the contract's check order
// (docs/contract/save-plan.md); steps 1-3 are HTTP and live in the handler.

import type { GroupStore } from "../groups/group.store.js";
import type { PlaceStore } from "../places/place.store.js";
import { fingerprint, type IdempotencyStore } from "../shared/idempotency.js";
import type { FieldError } from "../shared/problems.js";
import {
  applySave,
  canSave,
  canSee,
  type Plan,
  type Stop,
  type StopInput,
} from "./plan.model.js";
import { checkSaveRequest } from "./plan.request.js";
import type { PlanStore } from "./plan.store.js";
import { validatePlan } from "./plan.validator.js";

export interface PlanServiceDeps {
  plans: PlanStore;
  groups: GroupStore;
  places: PlaceStore;
  savedKeys: IdempotencyStore<Plan>;
  now: () => Date;
}

export interface SavePlanCommand {
  userId: number;
  // undefined when the path id is not a positive integer
  planId: number | undefined;
  idempotencyKey: string;
  body: unknown;
}

export type SavePlanResult =
  | { kind: "not-found" }
  | { kind: "forbidden" }
  | { kind: "key-reused" }
  | { kind: "replayed"; plan: Plan }
  | { kind: "invalid"; errors: FieldError[] }
  | { kind: "rejected"; violations: FieldError[] }
  | { kind: "saved"; plan: Plan };

export class PlanService {
  private readonly plans: PlanStore;
  private readonly groups: GroupStore;
  private readonly places: PlaceStore;
  private readonly savedKeys: IdempotencyStore<Plan>;
  private readonly now: () => Date;

  constructor(deps: PlanServiceDeps) {
    this.plans = deps.plans;
    this.groups = deps.groups;
    this.places = deps.places;
    this.savedKeys = deps.savedKeys;
    this.now = deps.now;
  }

  save(cmd: SavePlanCommand): SavePlanResult {
    // 4. The caller can see the plan, else it does not exist for them.
    const plan =
      cmd.planId === undefined ? undefined : this.plans.get(cmd.planId);
    if (!plan) return { kind: "not-found" };
    const inTripGroup = this.groups.isMemberOfTripGroup(
      cmd.userId,
      plan.tripId,
    );
    if (!canSee(plan, cmd.userId, inTripGroup)) return { kind: "not-found" };

    // 5. The caller may save it.
    if (!canSave(plan, cmd.userId)) return { kind: "forbidden" };

    // 6. A key the caller has used before.
    const requestPrint = fingerprint({ planId: plan.id, body: cmd.body });
    const previous = this.savedKeys.lookup(
      cmd.userId,
      cmd.idempotencyKey,
      requestPrint,
    );
    if (previous.kind === "reused") return { kind: "key-reused" };
    if (previous.kind === "replay") {
      return { kind: "replayed", plan: previous.response };
    }

    // 7. Field rules.
    const checked = checkSaveRequest(cmd.body);
    if (!checked.ok) return { kind: "invalid", errors: checked.errors };

    // 8. The validator.
    const violations = validatePlan(checked.stops, this.places);
    if (violations.length > 0) return { kind: "rejected", violations };

    // 9. Save, and remember the key with the result. Nothing can run between
    // these two writes, so they act as one transaction.
    const saved = applySave(plan, this.priceStops(checked.stops), this.now());
    this.plans.put(saved);
    this.savedKeys.remember(
      cmd.userId,
      cmd.idempotencyKey,
      requestPrint,
      saved,
    );
    return { kind: "saved", plan: saved };
  }

  // Attaches today's price to every item. Prices come from the place store,
  // never from the client. Call only with stops the validator has accepted.
  private priceStops(stops: StopInput[]): Stop[] {
    return stops.map((stop) => ({
      placeId: stop.placeId,
      startsAt: stop.startsAt,
      endsAt: stop.endsAt,
      items: stop.items.map((item) => {
        const priceVnd = this.places.priceOf(stop.placeId, item.itemId);
        if (priceVnd === undefined) {
          throw new Error(`No price for item ${item.itemId}`);
        }
        return { itemId: item.itemId, qty: item.qty, priceVnd };
      }),
    }));
  }
}
