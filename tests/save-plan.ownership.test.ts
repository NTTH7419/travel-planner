// Contract section 4.1, "Who may call it". Seed data (section 6): users 1
// and 2 are in group 1, user 3 is in no group. Plan 1 is user 1's draft,
// plan 2 is user 2's draft, plan 3 is user 1's saved plan. All are in trip 1.

import { describe, expect, it } from "vitest";
import { expectProblem, expectSaved, newApp, savePlan } from "./helpers.js";

describe("who may save which plan", () => {
  it("the owner saves their own draft", async () => {
    const plan = expectSaved(await savePlan(newApp(), { planId: 1 }));
    expect(plan.id).toBe(1);
    expect(plan.ownerId).toBe(1);
  });

  it("the owner saves their own plan that is already saved", async () => {
    const plan = expectSaved(await savePlan(newApp(), { planId: 3 }));
    expect(plan.id).toBe(3);
  });

  it("another member of the group gets 404 for a draft", async () => {
    expectProblem(
      await savePlan(newApp(), { planId: 1, token: "user-2" }),
      "not-found",
    );
    expectProblem(
      await savePlan(newApp(), { planId: 2, token: "user-1" }),
      "not-found",
    );
  });

  it("another member of the group gets 403 for a saved plan", async () => {
    expectProblem(
      await savePlan(newApp(), { planId: 3, token: "user-2" }),
      "forbidden",
    );
  });

  it("someone outside the group gets 404 for a draft and for a saved plan", async () => {
    expectProblem(
      await savePlan(newApp(), { planId: 1, token: "user-3" }),
      "not-found",
    );
    expectProblem(
      await savePlan(newApp(), { planId: 3, token: "user-3" }),
      "not-found",
    );
  });

  it("once the owner saves a draft, a group member gets 403 instead of 404", async () => {
    const app = newApp();
    expectProblem(
      await savePlan(app, { planId: 1, token: "user-2" }),
      "not-found",
    );
    expectSaved(await savePlan(app, { planId: 1, token: "user-1" }));
    expectProblem(
      await savePlan(app, { planId: 1, token: "user-2" }),
      "forbidden",
    );
  });

  it("a refused caller changes nothing", async () => {
    const app = newApp();
    await savePlan(app, { planId: 1, token: "user-2" });
    await savePlan(app, { planId: 3, token: "user-2" });
    // Plan 1 is still a draft and plan 3 still at revision 1.
    expect(expectSaved(await savePlan(app, { planId: 1 })).revision).toBe(1);
    expect(expectSaved(await savePlan(app, { planId: 3 })).revision).toBe(2);
  });
});

describe("a plan the caller cannot see looks exactly like one that does not exist", () => {
  // Same status, type, title and detail, with only the id in detail
  // differing, so probing plan ids reveals nothing.
  async function notFoundFor(token: string, planId: number) {
    const res = await savePlan(newApp(), { planId, token });
    const body = expectProblem(res, "not-found");
    return {
      contentType: res.headers["content-type"],
      body: { ...body, detail: body.detail.replace(String(planId), "{id}") },
    };
  }

  it("for another member's draft", async () => {
    expect(await notFoundFor("user-2", 1)).toEqual(
      await notFoundFor("user-2", 999),
    );
  });

  it("for a saved plan of a group the caller is not in", async () => {
    expect(await notFoundFor("user-3", 3)).toEqual(
      await notFoundFor("user-3", 999),
    );
  });
});
