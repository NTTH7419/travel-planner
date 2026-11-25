// Contract sections 3 (the Plan resource) and 4.1, "What happens when it
// saves": the 200 response and how a save changes the plan.

import { describe, expect, it } from "vitest";
import {
  PRICE_VND,
  VALID_TOTAL_VND,
  expectProblem,
  expectSaved,
  newApp,
  savePlan,
  validBody,
} from "./helpers.js";

const SAVED_AT = "2026-11-23T10:15:00.000Z";
const fixedClock = () => new Date(SAVED_AT);

describe("a successful save", () => {
  it("returns the Plan with every field the contract defines", async () => {
    const res = await savePlan(newApp(fixedClock));
    const plan = expectSaved(res);

    expect(plan).toEqual({
      id: 1,
      tripId: 1,
      ownerId: 1,
      status: "saved",
      revision: 1,
      stops: [
        {
          placeId: 1,
          startsAt: "2026-11-28T02:00:00.000Z",
          endsAt: "2026-11-28T03:30:00.000Z",
          items: [{ itemId: 11, qty: 4, priceVnd: PRICE_VND[11] }],
        },
        {
          placeId: 2,
          startsAt: "2026-11-28T04:00:00.000Z",
          endsAt: "2026-11-28T05:00:00.000Z",
          items: [],
        },
      ],
      totalVnd: VALID_TOTAL_VND,
      savedAt: SAVED_AT,
    });
  });

  it("computes totalVnd as the sum of priceVnd x qty over every stop", async () => {
    const body = validBody();
    body.stops[0].items.push({ itemId: 12, qty: 20 });
    body.stops[1].items.push({ itemId: 21, qty: 2 });
    const plan = expectSaved(await savePlan(newApp(), { body }));
    expect(plan.totalVnd).toBe(
      4 * PRICE_VND[11] + 20 * PRICE_VND[12] + 2 * PRICE_VND[21],
    );
  });

  it("ignores prices and totals sent by the client", async () => {
    const body = {
      totalVnd: 1,
      stops: validBody().stops.map((s) => ({
        ...s,
        items: s.items.map((i) => ({ ...i, priceVnd: 1 })),
      })),
    };
    const plan = expectSaved(await savePlan(newApp(), { body }));
    expect(plan.stops[0].items[0].priceVnd).toBe(PRICE_VND[11]);
    expect(plan.totalVnd).toBe(VALID_TOTAL_VND);
  });

  it("ignores request fields it does not know", async () => {
    const body = { ...validBody(), note: "hello" };
    expectSaved(await savePlan(newApp(), { body }));
  });

  it("keeps the stops in the order the client sent them", async () => {
    const body = validBody();
    body.stops.push({
      placeId: 1,
      startsAt: "2026-11-28T06:00:00.000Z",
      endsAt: "2026-11-28T07:00:00.000Z",
      items: [],
    });
    const plan = expectSaved(await savePlan(newApp(), { body }));
    expect(plan.stops.map((s) => s.placeId)).toEqual([1, 2, 1]);
  });
});

describe("what a save changes", () => {
  it("a later save with a new key replaces the stops and raises revision by 1", async () => {
    // Plan 3 starts saved at revision 1 with one item 11 x 1.
    const app = newApp();
    const plan = expectSaved(await savePlan(app, { planId: 3 }));
    expect(plan.status).toBe("saved");
    expect(plan.revision).toBe(2);
    expect(plan.stops).toHaveLength(2);
    expect(plan.totalVnd).toBe(VALID_TOTAL_VND);

    const again = expectSaved(await savePlan(app, { planId: 3 }));
    expect(again.revision).toBe(3);
  });

  it("sets a new savedAt on every new revision", async () => {
    let now = new Date("2026-11-23T10:00:00.000Z");
    const app = newApp(() => now);
    const first = expectSaved(await savePlan(app));
    now = new Date("2026-11-23T11:00:00.000Z");
    const second = expectSaved(await savePlan(app));
    expect(first.savedAt).toBe("2026-11-23T10:00:00.000Z");
    expect(second.savedAt).toBe("2026-11-23T11:00:00.000Z");
  });

  it("a rejected save changes nothing", async () => {
    const app = newApp();
    const bad = validBody();
    bad.stops[1].placeId = 999;
    expectProblem(await savePlan(app, { body: bad }), "plan-rejected");
    // Plan 1 is still a draft at revision 0, so the next save is revision 1.
    const plan = expectSaved(await savePlan(app));
    expect(plan.revision).toBe(1);
  });

  it("an invalid request changes nothing", async () => {
    const app = newApp();
    expectProblem(
      await savePlan(app, { planId: 3, body: { stops: [] } }),
      "validation",
    );
    const plan = expectSaved(await savePlan(app, { planId: 3 }));
    expect(plan.revision).toBe(2);
  });
});
