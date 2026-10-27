import test from "node:test";
import assert from "node:assert/strict";
import {
  KEYS,
  MAX_BACKUP,
  defaults,
  fresh,
  revise,
  validateCollection,
  backupEnvelope,
  parseBackup,
  safeURL,
  calculate,
  streak,
  shiftDate,
  localDate,
  remaining,
  updateRecord,
  completeTimer,
} from "../assets/model.js";

const task = () =>
  fresh({ title: "Read one chapter", date: "2026-10-26", done: false });
test("full backup round trip includes all tools and preserves Unicode and script-like text as data", () => {
  const data = Object.fromEntries(KEYS.map((k) => [k, defaults(k)]));
  data.tasks = [task()];
  data.notes = [
    fresh({
      title: "Ý tưởng 🌱",
      body: "<img src=x onerror=alert(1)> & plain text",
    }),
  ];
  data.bookmarks = [
    fresh({
      title: "Docs",
      url: "https://example.com/docs?q=a&b=c",
      group: "Study",
    }),
  ];
  data.habits = [
    fresh({ name: "Read", archived: false, days: ["2026-10-25"] }),
  ];
  data.flashcards = [
    fresh({
      name: "Languages",
      cards: [
        fresh({ front: "hello", back: "xin chào", reviews: 2, remembered: 1 }),
      ],
      cursor: 1,
    }),
  ];
  const result = parseBackup(JSON.stringify(backupEnvelope(data)));
  assert.deepEqual(result.data, data);
  assert.deepEqual(result.scope, KEYS);
});
test("single-tool backup explicitly contains only that tool", () => {
  const result = parseBackup(
    JSON.stringify(backupEnvelope({ tasks: [task()] }, ["tasks"])),
  );
  assert.deepEqual(Object.keys(result.data), ["tasks"]);
  assert.deepEqual(result.scope, ["tasks"]);
});
test("rejects malformed, unsupported, unknown, duplicate, and oversized backups", () => {
  const good = backupEnvelope({ tasks: [task()] }, ["tasks"]);
  for (const value of [
    { ...good, version: 2 },
    { ...good, app: "other" },
    { ...good, scope: ["tasks", "tasks"] },
    { ...good, scope: ["__proto__"] },
    { ...good, data: {} },
    { ...good, exportedAt: "bad" },
    null,
    [],
  ])
    assert.throws(() => parseBackup(JSON.stringify(value)), /invalidBackup/);
  assert.throws(() => parseBackup("{"), /invalidBackup/);
  assert.throws(() => parseBackup(" ".repeat(MAX_BACKUP + 1)), /invalidBackup/);
});
test("rejects unsafe URLs and embedded credentials", () => {
  for (const url of [
    "javascript:alert(1)",
    "data:text/html,x",
    "file:///C:/secret",
    "//example.com",
    "https://user:pass@example.com",
    "\n JaVaScRiPt:alert(1)",
  ])
    assert.equal(safeURL(url), null);
  assert.equal(safeURL("https://example.com/a"), "https://example.com/a");
  assert.throws(
    () =>
      validateCollection("bookmarks", [
        fresh({ title: "x", url: "javascript:alert(1)", group: "" }),
      ]),
    /invalidBackup/,
  );
});
test("schema rejects invalid dates, duplicate IDs, wrong types and impossible review progress", () => {
  const a = task();
  assert.throws(() =>
    validateCollection("tasks", [{ ...a, date: "2026-02-30" }]),
  );
  assert.throws(() => validateCollection("tasks", [a, a]));
  assert.throws(() => validateCollection("tasks", [{ ...a, done: "yes" }]));
  assert.throws(() =>
    validateCollection("tasks", [{ ...a, title: "x".repeat(301) }]),
  );
  assert.throws(() =>
    validateCollection("habits", [
      fresh({ name: "x", archived: false, days: ["2026-10-26", "2026-10-26"] }),
    ]),
  );
  assert.throws(() =>
    validateCollection("flashcards", [
      fresh({ name: "x", cards: [], cursor: 1 }),
    ]),
  );
  assert.throws(() =>
    validateCollection("flashcards", [
      fresh({
        name: "x",
        cards: [fresh({ front: "a", back: "b", reviews: 0, remembered: 1 })],
        cursor: 0,
      }),
    ]),
  );
});
test("strips unexpected properties instead of merging objects from untrusted input", () => {
  const raw = JSON.parse(
    JSON.stringify({ ...task(), admin: true }).replace(
      '"admin":true',
      '"__proto__":{"polluted":true}',
    ),
  );
  const clean = validateCollection("tasks", [raw]);
  assert.equal(Object.hasOwn(clean[0], "__proto__"), false);
  assert.equal({}.polluted, undefined);
});
test("streak includes yesterday when today is incomplete and respects date boundaries", () => {
  assert.equal(streak(["2026-10-24", "2026-10-25"], "2026-10-26"), 2);
  assert.equal(streak(["2026-10-24", "2026-10-26"], "2026-10-26"), 1);
  assert.equal(streak(["2026-10-24"], "2026-10-26"), 0);
  assert.equal(streak(["2025-12-31", "2026-01-01"], "2026-01-01"), 2);
  assert.equal(shiftDate("2024-03-01", -1), "2024-02-29");
  assert.equal(localDate(new Date(2026, 0, 1, 0, 1)), "2026-01-01");
});
test("calculator handles finite arithmetic without evaluating source text", () => {
  assert.equal(calculate(15, 200, "%"), 30);
  assert.equal(calculate(8, 2, "/"), 4);
  assert.equal(calculate(-2, 5, "*"), -10);
  for (const args of [
    [1, 0, "/"],
    ["", 2, "+"],
    ["alert(1)", 2, "+"],
    [1, 2, "eval"],
    [1e308, 1e308, "*"],
    [Infinity, 1, "+"],
  ])
    assert.throws(() => calculate(...args), /mathError/);
});
test("timer uses wall-clock timestamps and never returns negative time", () => {
  const active = { status: "running", endAt: 10000, remaining: 60 };
  assert.equal(remaining(active, 6501), 4);
  assert.equal(remaining(active, 20000), 0);
  assert.equal(
    remaining({ ...active, status: "paused", remaining: 13 }, 20000),
    13,
  );
});
test("timer schema rejects inconsistent running and paused states", () => {
  const timer = defaults("timer");
  timer.active = {
    id: "test",
    mode: "focus",
    duration: 60,
    remaining: 60,
    status: "running",
    endAt: null,
    taskTitle: "",
  };
  assert.throws(() => validateCollection("timer", timer));
  timer.active.endAt = Date.now() + 60000;
  assert.doesNotThrow(() => validateCollection("timer", timer));
  timer.active.duration = 61;
  assert.throws(() => validateCollection("timer", timer));
  timer.active.duration = 60;
  timer.active.remaining = 61;
  assert.throws(() => validateCollection("timer", timer));
});
test("record revisions reject stale edits and missing/deleted records", () => {
  const original = task(),
    updated = revise(original, { title: "Changed elsewhere" });
  assert.throws(
    () =>
      updateRecord([updated], original.id, original.rev, { title: "stale" }),
    /conflict/,
  );
  assert.throws(
    () => updateRecord([], original.id, original.rev, { title: "stale" }),
    /conflict/,
  );
  const result = updateRecord([original], original.id, original.rev, {
    title: "New",
  });
  assert.equal(result[0].title, "New");
  assert.notEqual(result[0].rev, original.rev);
});
test("timer completion is idempotent, excludes breaks, and ignores paused or unfinished sessions", () => {
  const active = {
    id: "session",
    mode: "focus",
    status: "running",
    duration: 60,
    remaining: 60,
    endAt: 10000,
    taskTitle: "Read",
  };
  let timer = { ...defaults("timer"), active: { ...active } };
  assert.equal(completeTimer(timer, 9000).completed, false);
  const result = completeTimer(timer, 10001);
  assert.equal(result.completed, true);
  assert.equal(result.timer.sessions.length, 1);
  assert.equal(result.timer.sessions[0].taskTitle, "Read");
  assert.equal(completeTimer(result.timer, 11000).completed, false);
  assert.equal(result.timer.sessions.length, 1);
  timer = { ...defaults("timer"), active: { ...active, mode: "short" } };
  assert.equal(completeTimer(timer, 10001).timer.sessions.length, 0);
  timer = {
    ...defaults("timer"),
    active: { ...active, status: "paused", endAt: null },
  };
  assert.equal(completeTimer(timer, 10001).completed, false);
});
