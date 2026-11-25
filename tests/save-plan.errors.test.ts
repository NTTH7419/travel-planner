// Contract section 2 (Errors) and the field rules of section 4.1: one or more
// tests per problem type, each checking status, type, title and
// Content-Type — never the status code alone.

import { describe, expect, it } from "vitest";
import { expectProblem, newApp, savePlan, validBody } from "./helpers.js";

describe("unauthenticated (401)", () => {
  it("rejects a request with no Authorization header", async () => {
    const res = await savePlan(newApp(), { token: null });
    expectProblem(res, "unauthenticated");
    expect(res.headers["www-authenticate"]).toBe("Bearer");
  });

  it("rejects a header that is not of the form Bearer <token>", async () => {
    const res = await savePlan(newApp(), { authorization: "Basic dXNlcjE=" });
    expectProblem(res, "unauthenticated");
    expect(res.headers["www-authenticate"]).toBe("Bearer");
  });

  it("rejects a token the server does not know", async () => {
    const res = await savePlan(newApp(), { token: "user-99" });
    expectProblem(res, "unauthenticated");
    expect(res.headers["www-authenticate"]).toBe("Bearer");
  });
});

describe("idempotency-key-missing (400)", () => {
  it("rejects a request with no Idempotency-Key", async () => {
    expectProblem(
      await savePlan(newApp(), { key: null }),
      "idempotency-key-missing",
    );
  });

  it("rejects an empty Idempotency-Key", async () => {
    expectProblem(
      await savePlan(newApp(), { key: "" }),
      "idempotency-key-missing",
    );
  });

  it("rejects a key longer than 255 characters", async () => {
    expectProblem(
      await savePlan(newApp(), { key: "k".repeat(256) }),
      "idempotency-key-missing",
    );
  });

  it("accepts a key of exactly 255 characters", async () => {
    const res = await savePlan(newApp(), { key: "k".repeat(255) });
    expect(res.statusCode).toBe(200);
  });
});

describe("invalid-json (400)", () => {
  it("rejects a body that is not valid JSON", async () => {
    expectProblem(
      await savePlan(newApp(), { rawBody: '{"stops": [' }),
      "invalid-json",
    );
  });
});

describe("not-found (404)", () => {
  it("answers a plan id that was never created", async () => {
    expectProblem(await savePlan(newApp(), { planId: 999 }), "not-found");
  });

  it.each(["0", "-1", "abc", "1.5"])(
    "answers a plan id that is not a positive integer: %s",
    async (planId) => {
      expectProblem(await savePlan(newApp(), { planId }), "not-found");
    },
  );

  it("answers a /v1 path that does not exist with problem details", async () => {
    const res = await newApp().inject({
      method: "GET",
      url: "/v1/no-such-path",
      headers: { authorization: "Bearer user-1" },
    });
    expectProblem(res, "not-found");
  });
});

describe("forbidden (403)", () => {
  it("answers a group member saving a saved plan they do not own", async () => {
    // Plan 3 is saved, owned by user 1, in group 1; user 2 is in group 1.
    const res = await savePlan(newApp(), { planId: 3, token: "user-2" });
    expectProblem(res, "forbidden");
  });
});

describe("validation (400)", () => {
  it("lists every broken field, with a JSON Pointer each", async () => {
    // The contract's own example: endsAt before startsAt and qty 0.
    const body = validBody();
    body.stops[0].endsAt = "2026-11-28T01:00:00.000Z";
    body.stops[0].items[0].qty = 0;

    const problem = expectProblem(
      await savePlan(newApp(), { body }),
      "validation",
    );
    expect(problem.errors).toHaveLength(2);
    expect(problem.errors?.map((e) => e.pointer).sort()).toEqual([
      "/stops/0/endsAt",
      "/stops/0/items/0/qty",
    ]);
    for (const error of problem.errors ?? []) {
      expect(typeof error.detail).toBe("string");
    }
  });

  it("lists broken fields in different stops, not just the first", async () => {
    const body = validBody();
    body.stops[0].placeId = 0;
    body.stops[1].items.push({ itemId: 21, qty: 21 });

    const problem = expectProblem(
      await savePlan(newApp(), { body }),
      "validation",
    );
    const pointers = problem.errors?.map((e) => e.pointer);
    expect(pointers).toContain("/stops/0/placeId");
    expect(pointers).toContain("/stops/1/items/0/qty");
  });

  it.each([
    ["an array", []],
    ["a string", "stops"],
    ["a number", 42],
    ["null", null],
  ])(
    'rejects a body that is valid JSON but %s, with pointer ""',
    async (_name, body) => {
      const problem = expectProblem(
        await savePlan(newApp(), { rawBody: JSON.stringify(body) }),
        "validation",
      );
      expect(problem.errors?.map((e) => e.pointer)).toContain("");
    },
  );

  it("rejects a body with no stops", async () => {
    const problem = expectProblem(
      await savePlan(newApp(), { body: {} }),
      "validation",
    );
    expect(problem.errors?.map((e) => e.pointer)).toContain("/stops");
  });

  it("rejects an empty stops array", async () => {
    const problem = expectProblem(
      await savePlan(newApp(), { body: { stops: [] } }),
      "validation",
    );
    expect(problem.errors?.map((e) => e.pointer)).toContain("/stops");
  });

  it("rejects more than 20 stops", async () => {
    const stops = Array.from({ length: 21 }, (_, i) => ({
      placeId: 2,
      startsAt: new Date(Date.UTC(2026, 10, 28, i)).toISOString(),
      endsAt: new Date(Date.UTC(2026, 10, 28, i, 30)).toISOString(),
      items: [],
    }));
    const problem = expectProblem(
      await savePlan(newApp(), { body: { stops } }),
      "validation",
    );
    expect(problem.errors?.map((e) => e.pointer)).toContain("/stops");
  });

  it("rejects more than 8 items in one stop", async () => {
    const body = validBody();
    body.stops[0].items = Array.from({ length: 9 }, () => ({
      itemId: 11,
      qty: 1,
    }));
    const problem = expectProblem(
      await savePlan(newApp(), { body }),
      "validation",
    );
    expect(problem.errors?.map((e) => e.pointer)).toContain("/stops/0/items");
  });

  it("rejects a stop with no items array", async () => {
    const body: { stops: Record<string, unknown>[] } = validBody();
    delete body.stops[1].items;
    const problem = expectProblem(
      await savePlan(newApp(), { body }),
      "validation",
    );
    expect(problem.errors?.map((e) => e.pointer)).toContain("/stops/1/items");
  });

  it.each([
    ["placeId", "/stops/0/placeId", { placeId: "1" }],
    ["placeId", "/stops/0/placeId", { placeId: -1 }],
    ["startsAt", "/stops/0/startsAt", { startsAt: "tomorrow" }],
    ["endsAt", "/stops/0/endsAt", { endsAt: 12 }],
  ])("rejects a bad %s at %s", async (_field, pointer, change) => {
    const body = validBody();
    Object.assign(body.stops[0], change);
    const problem = expectProblem(
      await savePlan(newApp(), { body }),
      "validation",
    );
    expect(problem.errors?.map((e) => e.pointer)).toContain(pointer);
  });

  it.each([
    ["itemId", "/stops/0/items/0/itemId", { itemId: 0 }],
    ["qty", "/stops/0/items/0/qty", { qty: 21 }],
    ["qty", "/stops/0/items/0/qty", { qty: 1.5 }],
    ["qty", "/stops/0/items/0/qty", { qty: "4" }],
  ])("rejects a bad item %s at %s", async (_field, pointer, change) => {
    const body = validBody();
    Object.assign(body.stops[0].items[0], change);
    const problem = expectProblem(
      await savePlan(newApp(), { body }),
      "validation",
    );
    expect(problem.errors?.map((e) => e.pointer)).toContain(pointer);
  });

  it("rejects a stop that starts before the previous stop ends", async () => {
    const body = validBody();
    body.stops[1].startsAt = "2026-11-28T03:00:00.000Z";
    const problem = expectProblem(
      await savePlan(newApp(), { body }),
      "validation",
    );
    expect(problem.errors?.some((e) => e.pointer.startsWith("/stops/1"))).toBe(
      true,
    );
  });

  it("accepts a stop that starts exactly when the previous one ends", async () => {
    const body = validBody();
    body.stops[1].startsAt = body.stops[0].endsAt;
    expect((await savePlan(newApp(), { body })).statusCode).toBe(200);
  });
});

describe("plan-rejected (422)", () => {
  it("rejects a place that does not exist, with code unknown-place", async () => {
    // The contract's section 2 example: the second stop names place 999.
    const body = validBody();
    body.stops[1].placeId = 999;
    const problem = expectProblem(
      await savePlan(newApp(), { body }),
      "plan-rejected",
    );
    expect(problem.errors).toEqual([
      expect.objectContaining({
        code: "unknown-place",
        pointer: "/stops/1/placeId",
      }),
    ]);
  });

  it("rejects an item not sold at that stop's place, with code unknown-item", async () => {
    // Item 21 is sold at place 2, not at place 1.
    const body = validBody();
    body.stops[0].items[0].itemId = 21;
    const problem = expectProblem(
      await savePlan(newApp(), { body }),
      "plan-rejected",
    );
    expect(problem.errors).toEqual([
      expect.objectContaining({
        code: "unknown-item",
        pointer: "/stops/0/items/0/itemId",
      }),
    ]);
  });

  it("lists every violation the validator found, not just the first", async () => {
    const body = validBody();
    body.stops[0].items[0].itemId = 999;
    body.stops[1].placeId = 999;
    const problem = expectProblem(
      await savePlan(newApp(), { body }),
      "plan-rejected",
    );
    expect(problem.errors).toHaveLength(2);
    expect(problem.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "unknown-item",
          pointer: "/stops/0/items/0/itemId",
        }),
        expect.objectContaining({
          code: "unknown-place",
          pointer: "/stops/1/placeId",
        }),
      ]),
    );
    for (const error of problem.errors ?? []) {
      expect(typeof error.detail).toBe("string");
    }
  });
});

// `internal` (500) cannot be caused from outside through this endpoint
// without changing the code, so it has no test here.

describe("check order (section 4.1, steps 1-8)", () => {
  it("1 before 2 and 3: no token, no key, bad JSON gives 401", async () => {
    const res = await savePlan(newApp(), {
      token: null,
      key: null,
      rawBody: "{",
    });
    expectProblem(res, "unauthenticated");
  });

  it("2 before 3: no key and bad JSON gives idempotency-key-missing", async () => {
    const res = await savePlan(newApp(), { key: null, rawBody: "{" });
    expectProblem(res, "idempotency-key-missing");
  });

  it("3 before 4: bad JSON for a plan that does not exist gives invalid-json", async () => {
    const res = await savePlan(newApp(), { planId: 999, rawBody: "{" });
    expectProblem(res, "invalid-json");
  });

  it("4 before 7: invalid fields on a plan the caller cannot see give 404", async () => {
    const res = await savePlan(newApp(), {
      planId: 1,
      token: "user-3",
      body: { stops: [] },
    });
    expectProblem(res, "not-found");
  });

  it("5 before 7: invalid fields on a plan the caller does not own give 403", async () => {
    const res = await savePlan(newApp(), {
      planId: 3,
      token: "user-2",
      body: { stops: [] },
    });
    expectProblem(res, "forbidden");
  });

  it("7 before 8: a body with a bad field and an unknown place gives validation", async () => {
    const body = validBody();
    body.stops[0].items[0].qty = 0;
    body.stops[1].placeId = 999;
    const problem = expectProblem(
      await savePlan(newApp(), { body }),
      "validation",
    );
    expect(problem.errors?.map((e) => e.pointer)).toEqual([
      "/stops/0/items/0/qty",
    ]);
  });
});
