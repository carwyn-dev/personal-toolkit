export const KEYS = [
  "tasks",
  "habits",
  "bookmarks",
  "flashcards",
  "notes",
  "timer",
];
export const MAX_BACKUP = 10 * 1024 * 1024;
export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function shiftDate(day, amount) {
  const d = new Date(`${day}T12:00:00`);
  d.setDate(d.getDate() + amount);
  return localDate(d);
}
export function streak(days, today = localDate()) {
  const set = new Set(days);
  let day = set.has(today) ? today : shiftDate(today, -1);
  let count = 0;
  while (set.has(day) && count < 100000) {
    count++;
    day = shiftDate(day, -1);
  }
  return count;
}
export function safeURL(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) &&
      !url.username &&
      !url.password
      ? url.href
      : null;
  } catch {
    return null;
  }
}
export function defaults(key) {
  return key === "timer"
    ? {
        active: null,
        sessions: [],
        durations: { focus: 25, short: 5, long: 15 },
        sound: false,
      }
    : [];
}
function fail() {
  throw new Error("invalidBackup");
}
function object(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function text(value, max, min = 0) {
  if (typeof value !== "string" || value.length > max || value.length < min)
    fail();
  return value;
}
function bool(value) {
  if (typeof value !== "boolean") fail();
  return value;
}
function integer(value, min, max) {
  if (!Number.isInteger(value) || value < min || value > max) fail();
  return value;
}
function finite(value, min, max) {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < min ||
    value > max
  )
    fail();
  return value;
}
function date(value) {
  text(value, 10, 10);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    !Number.isFinite(Date.parse(`${value}T12:00:00Z`)) ||
    new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) !== value
  )
    fail();
  return value;
}
function stamp(value) {
  text(value, 40, 1);
  if (!Number.isFinite(Date.parse(value))) fail();
  return value;
}
function base(value) {
  if (!object(value)) fail();
  return {
    id: text(value.id, 100, 1),
    rev: text(value.rev, 100, 1),
    createdAt: stamp(value.createdAt),
    updatedAt: stamp(value.updatedAt),
  };
}
function list(values, fn, max = 20000) {
  if (!Array.isArray(values) || values.length > max) fail();
  return values.map(fn);
}
function unique(values) {
  if (new Set(values.map((v) => v.id)).size !== values.length) fail();
  return values;
}
export function validateCollection(key, value) {
  if (!KEYS.includes(key)) fail();
  if (key === "timer") {
    if (!object(value) || !object(value.durations)) fail();
    const durations = {};
    for (const mode of ["focus", "short", "long"])
      durations[mode] = integer(value.durations[mode], 1, 180);
    const sessions = unique(
      list(value.sessions, (v) => {
        if (!object(v)) fail();
        return {
          id: text(v.id, 100, 1),
          endedAt: stamp(v.endedAt),
          minutes: integer(v.minutes, 1, 180),
          taskTitle: text(v.taskTitle, 300),
        };
      }),
    );
    let active = null;
    if (value.active !== null) {
      const a = value.active;
      if (
        !object(a) ||
        !["focus", "short", "long"].includes(a.mode) ||
        !["running", "paused", "ready"].includes(a.status)
      )
        fail();
      active = {
        id: text(a.id, 100, 1),
        mode: a.mode,
        status: a.status,
        duration: integer(a.duration, 60, 10800),
        remaining: finite(a.remaining, 0, 10800),
        endAt: a.endAt === null ? null : finite(a.endAt, 0, 8640000000000000),
        taskTitle: text(a.taskTitle, 300),
      };
      if (active.duration % 60 !== 0) fail();
      if (sessions.some((session) => session.id === active.id)) fail();
      if (
        (active.status === "running") !== (active.endAt !== null) ||
        active.remaining > active.duration
      )
        fail();
    }
    return { active, sessions, durations, sound: bool(value.sound) };
  }
  return unique(
    list(value, (v) => {
      const b = base(v);
      if (key === "tasks")
        return {
          ...b,
          title: text(v.title, 300, 1),
          date: v.date === null ? null : date(v.date),
          done: bool(v.done),
        };
      if (key === "notes")
        return { ...b, title: text(v.title, 200), body: text(v.body, 100000) };
      if (key === "bookmarks") {
        const url = safeURL(v.url);
        if (!url || url.length > 2048) fail();
        return {
          ...b,
          title: text(v.title, 300, 1),
          url,
          group: text(v.group, 80),
        };
      }
      if (key === "habits") {
        const days = list(v.days, date, 50000);
        if (new Set(days).size !== days.length) fail();
        return {
          ...b,
          name: text(v.name, 100, 1),
          archived: bool(v.archived),
          days,
        };
      }
      if (key === "flashcards") {
        const cards = unique(
          list(
            v.cards,
            (c) => ({
              ...base(c),
              front: text(c.front, 2000, 1),
              back: text(c.back, 4000, 1),
              remembered: integer(c.remembered, 0, 1000000),
              reviews: integer(c.reviews, 0, 1000000),
            }),
            5000,
          ),
        );
        if (cards.some((c) => c.remembered > c.reviews)) fail();
        return {
          ...b,
          name: text(v.name, 100, 1),
          cards,
          cursor: integer(v.cursor, 0, cards.length),
        };
      }
      fail();
    }),
  );
}
export function backupEnvelope(data, scope = KEYS) {
  return {
    app: "personal-toolkit",
    version: 1,
    exportedAt: new Date().toISOString(),
    scope: [...scope],
    data: Object.fromEntries(
      scope.map((k) => [k, validateCollection(k, data[k])]),
    ),
  };
}
export function parseBackup(raw) {
  if (
    typeof raw !== "string" ||
    new TextEncoder().encode(raw).length > MAX_BACKUP
  )
    fail();
  let value;
  try {
    value = JSON.parse(raw);
  } catch {
    fail();
  }
  if (
    !object(value) ||
    value.app !== "personal-toolkit" ||
    value.version !== 1 ||
    !Array.isArray(value.scope) ||
    !value.scope.length ||
    value.scope.length > KEYS.length ||
    new Set(value.scope).size !== value.scope.length ||
    !object(value.data)
  )
    fail();
  stamp(value.exportedAt);
  if (Object.keys(value.data).length !== value.scope.length) fail();
  const data = {};
  for (const key of value.scope) {
    if (!KEYS.includes(key) || !Object.hasOwn(value.data, key)) fail();
    data[key] = validateCollection(key, value.data[key]);
  }
  return {
    app: value.app,
    version: 1,
    exportedAt: value.exportedAt,
    scope: [...value.scope],
    data,
  };
}
export function calculate(a, b, operation) {
  if (
    (typeof a === "string" && !a.trim()) ||
    (typeof b === "string" && !b.trim())
  )
    throw new Error("mathError");
  a = Number(a);
  b = Number(b);
  if (!Number.isFinite(a) || !Number.isFinite(b)) throw new Error("mathError");
  let result;
  switch (operation) {
    case "+":
      result = a + b;
      break;
    case "-":
      result = a - b;
      break;
    case "*":
      result = a * b;
      break;
    case "/":
      if (b === 0) throw new Error("mathError");
      result = a / b;
      break;
    case "%":
      result = (a * b) / 100;
      break;
    default:
      throw new Error("mathError");
  }
  if (!Number.isFinite(result)) throw new Error("mathError");
  return result;
}
export function remaining(active, now = Date.now()) {
  return active.status === "running"
    ? Math.max(0, Math.ceil((active.endAt - now) / 1000))
    : Math.ceil(active.remaining);
}
export function fresh(fields) {
  const time = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    rev: crypto.randomUUID(),
    createdAt: time,
    updatedAt: time,
    ...fields,
  };
}
export function completeTimer(timer, now = Date.now()) {
  const active = timer.active;
  if (!active || active.status !== "running" || remaining(active, now) > 0)
    return { timer, completed: false };
  if (
    active.mode === "focus" &&
    !timer.sessions.some((item) => item.id === active.id)
  ) {
    timer.sessions.unshift({
      id: active.id,
      endedAt: new Date(active.endAt).toISOString(),
      minutes: active.duration / 60,
      taskTitle: active.taskTitle,
    });
    timer.sessions = timer.sessions.slice(0, 20000);
  }
  timer.active = null;
  return { timer, completed: true };
}
export function revise(item, fields) {
  return {
    ...item,
    ...fields,
    rev: crypto.randomUUID(),
    updatedAt: new Date().toISOString(),
  };
}
export function updateRecord(list, id, expectedRev, fields) {
  const index = list.findIndex((v) => v.id === id);
  if (index < 0 || list[index].rev !== expectedRev) throw new Error("conflict");
  list[index] = revise(list[index], fields);
  return list;
}
