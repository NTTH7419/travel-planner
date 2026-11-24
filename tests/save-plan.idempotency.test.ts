// Contract section 4.1, "Idempotency": a retry with the same key must not
// save or share the plan a second time.

import { describe, expect, it } from "vitest";
import {
  expectProblem,
  expectSaved,
  newApp,
  savePlan,
  tickingClock,
  validBody,
} from "./helpers.js";

describe("same key, same request", () => {
  it("returns the stored response with Idempotent-Replayed: true", async () => {
    const app = newApp(tickingClock());
    const first = await savePlan(app, { key: "retry-1" });
    const original = expectSaved(first);

    const again = await savePlan(app, { key: "retry-1" });
    expect(again.statusCode).toBe(200);
    expect(again.headers["content-type"]).toMatch(/^application\/json/);
    expect(again.headers["idempotent-replayed"]).toBe("true");
    // Identical body: same revision and same savedAt, though the clock moved.
    expect(again.json()).toEqual(original);
  });

  it("does not save the plan again", async () => {
    const app = newApp();
    await savePlan(app, { key: "retry-1" });
    await savePlan(app, { key: "retry-1" });
    await savePlan(app, { key: "retry-1" });
    // One real save so far, so the next new key makes revision 2.
    const next = expectSaved(await savePlan(app, { key: "retry-2" }));
    expect(next.revision).toBe(2);
  });

  it("treats bodies equal as JSON values as the same request", async () => {
    const app = newApp();
    const original = expectSaved(
      await savePlan(app, { key: "retry-1", body: validBody() }),
    );
    // Same value with different key order and whitespace.
    const reordered = JSON.stringify(
      {
        stops: validBody().stops.map((s) => ({
          items: s.items.map((i) => ({ qty: i.qty, itemId: i.itemId })),
          endsAt: s.endsAt,
          startsAt: s.startsAt,
          placeId: s.placeId,
        })),
      },
      null,
      2,
    );
    const again = await savePlan(app, { key: "retry-1", rawBody: reordered });
    expect(again.statusCode).toBe(200);
    expect(again.headers["idempotent-replayed"]).toBe("true");
    expect(again.json()).toEqual(original);
  });
});

describe("same key, different request", () => {
  it("a different body gives 422 idempotency-key-reused", async () => {
    // The contract's example: qty changed from 4 to 3.
    const app = newApp();
    expectSaved(await savePlan(app, { key: "retry-1" }));
    const body = validBody();
    body.stops[0].items[0].qty = 3;
    expectProblem(
      await savePlan(app, { key: "retry-1", body }),
      "idempotency-key-reused",
    );
  });

  it("another planId gives 422 idempotency-key-reused", async () => {
    const app = newApp();
    expectSaved(await savePlan(app, { planId: 1, key: "retry-1" }));
    expectProblem(
      await savePlan(app, { planId: 3, key: "retry-1" }),
      "idempotency-key-reused",
    );
  });

  it("saves nothing", async () => {
    const app = newApp();
    expectSaved(await savePlan(app, { key: "retry-1" }));
    const body = validBody();
    body.stops[0].items[0].qty = 3;
    await savePlan(app, { key: "retry-1", body });
    const next = expectSaved(await savePlan(app, { key: "retry-2" }));
    expect(next.revision).toBe(2);
    expect(next.stops[0].items[0].qty).toBe(4);
  });

  it("is checked before the field rules (step 6 before step 7)", async () => {
    const app = newApp();
    expectSaved(await savePlan(app, { key: "retry-1" }));
    expectProblem(
      await savePlan(app, { key: "retry-1", body: { stops: [] } }),
      "idempotency-key-reused",
    );
  });
});

describe("keys are scoped per caller", () => {
  it("two users may use the same key without affecting each other", async () => {
    const app = newApp();
    const mine = expectSaved(
      await savePlan(app, { planId: 1, token: "user-1", key: "shared" }),
    );
    const theirs = expectSaved(
      await savePlan(app, { planId: 2, token: "user-2", key: "shared" }),
    );
    expect(mine.id).toBe(1);
    expect(theirs.id).toBe(2);
    expect(theirs.ownerId).toBe(2);
  });
});

describe("only a 200 is stored", () => {
  it("after a plan-rejected, the same key with a fixed body saves", async () => {
    const app = newApp();
    const bad = validBody();
    bad.stops[1].placeId = 999;
    expectProblem(
      await savePlan(app, { key: "k", body: bad }),
      "plan-rejected",
    );

    const plan = expectSaved(await savePlan(app, { key: "k" }));
    expect(plan.revision).toBe(1);
  });

  it("after a validation error, the same key with a fixed body saves", async () => {
    const app = newApp();
    expectProblem(
      await savePlan(app, { key: "k", body: { stops: [] } }),
      "validation",
    );
    expectSaved(await savePlan(app, { key: "k" }));
  });

  it("after a refused caller, the key is still free for that caller", async () => {
    const app = newApp();
    expectProblem(
      await savePlan(app, { planId: 3, token: "user-2", key: "k" }),
      "forbidden",
    );
    expectSaved(await savePlan(app, { planId: 2, token: "user-2", key: "k" }));
  });
});
