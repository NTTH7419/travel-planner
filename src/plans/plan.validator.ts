// The plan validator (step 8 of the contract). It is code, not a model, and
// runs on every save.
//
// The PA#2 build is a stub: it checks only unknown-place and unknown-item. The
// contract lists the other codes (closed, travel-time, over-member-cap,
// over-group-total, rain) so clients already handle them.

import type { PlaceStore } from "../places/place.store.js";
import type { FieldError } from "../shared/problems.js";
import type { StopInput } from "./plan.model.js";

export function validatePlan(
  stops: StopInput[],
  places: PlaceStore,
): FieldError[] {
  const violations: FieldError[] = [];
  stops.forEach((stop, i) => {
    if (!places.hasPlace(stop.placeId)) {
      violations.push({
        code: "unknown-place",
        pointer: `/stops/${i}/placeId`,
        detail: `place ${stop.placeId} does not exist`,
      });
    }
    stop.items.forEach((item, j) => {
      if (places.priceOf(stop.placeId, item.itemId) === undefined) {
        violations.push({
          code: "unknown-item",
          pointer: `/stops/${i}/items/${j}/itemId`,
          detail: `item ${item.itemId} is not sold at place ${stop.placeId}`,
        });
      }
    });
  });
  return violations;
}
