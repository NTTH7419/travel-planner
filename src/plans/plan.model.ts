// The Plan resource and its rules: who may see it, who may save it, and what
// a save does to it. Pure: no stores, no HTTP. Callers fetch what a rule needs.

export interface ItemLine {
  itemId: number;
  qty: number;
  priceVnd: number;
}

export interface Stop {
  placeId: number;
  startsAt: string;
  endsAt: string;
  items: ItemLine[];
}

export interface Plan {
  id: number;
  tripId: number;
  ownerId: number;
  status: "draft" | "saved";
  revision: number;
  stops: Stop[];
  totalVnd: number;
  savedAt: string | null;
}

// A stop as the client sends it: no prices.
export interface StopInput {
  placeId: number;
  startsAt: string;
  endsAt: string;
  items: { itemId: number; qty: number }[];
}

// A draft is private to its owner; a saved plan is visible to the trip's group.
export function canSee(
  plan: Plan,
  userId: number,
  inTripGroup: boolean,
): boolean {
  if (plan.ownerId === userId) return true;
  return inTripGroup;
}

// Whoever may edit a plan may save it. Until editing together exists, only
// the owner edits.
export function canSave(plan: Plan, userId: number): boolean {
  return plan.ownerId === userId;
}

// The plan after a successful save: saved for good, one revision up, the given
// stops with their prices frozen, and a total computed from them.
export function applySave(plan: Plan, pricedStops: Stop[], now: Date): Plan {
  return {
    ...plan,
    status: "saved",
    revision: plan.revision + 1,
    stops: pricedStops,
    totalVnd: pricedStops
      .flatMap((stop) => stop.items)
      .reduce((sum, item) => sum + item.priceVnd * item.qty, 0),
    savedAt: now.toISOString(),
  };
}
