// The field rules for the save request body (step 7 of the contract).
// Returns every broken rule, not just the first.

import type { FieldError } from "../shared/problems.js";
import type { StopInput } from "./plan.model.js";

const TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

export type SaveRequestCheck =
  { ok: true; stops: StopInput[] } | { ok: false; errors: FieldError[] };

export function checkSaveRequest(body: unknown): SaveRequestCheck {
  if (!isObject(body)) {
    return fail([{ pointer: "", detail: "must be a JSON object" }]);
  }
  const stops = body.stops;
  if (!Array.isArray(stops) || stops.length < 1 || stops.length > 20) {
    return fail([
      { pointer: "/stops", detail: "must be an array of 1 to 20 stops" },
    ]);
  }

  const errors: FieldError[] = [];
  let previousEnd: string | null = null;

  stops.forEach((stop: unknown, i) => {
    const at = `/stops/${i}`;
    if (!isObject(stop)) {
      errors.push({ pointer: at, detail: "must be an object" });
      previousEnd = null;
      return;
    }

    if (!isPositiveInt(stop.placeId)) {
      errors.push({
        pointer: `${at}/placeId`,
        detail: "must be a positive integer",
      });
    }

    const start = isTimestamp(stop.startsAt) ? stop.startsAt : null;
    const end = isTimestamp(stop.endsAt) ? stop.endsAt : null;
    if (start === null) {
      errors.push({
        pointer: `${at}/startsAt`,
        detail: "must be a UTC timestamp such as 2026-11-28T02:00:00.000Z",
      });
    }
    if (end === null) {
      errors.push({
        pointer: `${at}/endsAt`,
        detail: "must be a UTC timestamp such as 2026-11-28T03:00:00.000Z",
      });
    } else if (start !== null && end <= start) {
      errors.push({
        pointer: `${at}/endsAt`,
        detail: "must be later than startsAt",
      });
    }
    if (start !== null && previousEnd !== null && start < previousEnd) {
      errors.push({
        pointer: `${at}/startsAt`,
        detail: "must not be earlier than the previous stop's endsAt",
      });
    }
    previousEnd = end;

    const items = stop.items;
    if (!Array.isArray(items) || items.length > 8) {
      errors.push({
        pointer: `${at}/items`,
        detail: "must be an array of 0 to 8 items",
      });
      return;
    }
    items.forEach((item: unknown, j) => {
      const itemAt = `${at}/items/${j}`;
      if (!isObject(item)) {
        errors.push({ pointer: itemAt, detail: "must be an object" });
        return;
      }
      if (!isPositiveInt(item.itemId)) {
        errors.push({
          pointer: `${itemAt}/itemId`,
          detail: "must be a positive integer",
        });
      }
      if (!isIntIn(item.qty, 1, 20)) {
        errors.push({
          pointer: `${itemAt}/qty`,
          detail: "must be an integer from 1 to 20",
        });
      }
    });
  });

  return errors.length > 0
    ? fail(errors)
    : { ok: true, stops: stops as StopInput[] };
}

function fail(errors: FieldError[]): SaveRequestCheck {
  return { ok: false, errors };
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isPositiveInt(v: unknown): v is number {
  return Number.isInteger(v) && (v as number) > 0;
}

function isIntIn(v: unknown, min: number, max: number): v is number {
  return Number.isInteger(v) && (v as number) >= min && (v as number) <= max;
}

// A timestamp must match the format and be a real instant: "2026-02-30..."
// matches the pattern but does not round-trip, so it is rejected.
function isTimestamp(v: unknown): v is string {
  if (typeof v !== "string" || !TIMESTAMP.test(v)) return false;
  const d = new Date(v);
  return !Number.isNaN(d.getTime()) && d.toISOString() === v;
}
