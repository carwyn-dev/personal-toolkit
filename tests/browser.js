import { createStorage } from "../assets/storage.js";
import { el } from "../assets/ui.js";
import {
  fresh,
  revise,
  updateRecord,
  defaults,
  backupEnvelope,
  parseBackup,
  completeTimer,
} from "../assets/model.js";
const result = document.querySelector("#result");
document.querySelector("#run").addEventListener("click", async () => {
  const run = document.querySelector("#run");
  run.disabled = true;
  result.textContent = "Running…";
  let passed = 0;
  const name = `pt-test-${crypto.randomUUID()}`,
    db = createStorage(name),
    other = createStorage(name);
  function check(condition, message) {
    if (!condition) throw new Error(message);
    passed++;
    result.textContent += `\nPASS ${message}`;
  }
  try {
    const note = fresh({
      title: "Synthetic test",
      body: '<img src=x onerror="alert(1)">',
    });
    await db.mutate("notes", (v) => [note, ...v]);
    check(
      (await db.read("notes"))[0].body === note.body,
      "IndexedDB persists text",
    );
    await Promise.all(
      Array.from({ length: 12 }, (_, i) =>
        db.mutate("tasks", (v) => [
          ...v,
          fresh({ title: `Concurrent ${i}`, date: null, done: false }),
        ]),
      ),
    );
    check(
      (await db.read("tasks")).length === 12,
      "Concurrent transactions preserve all updates",
    );
    const updated = await db.mutate("notes", (v) =>
      updateRecord(v, note.id, note.rev, { body: "Updated" }),
    );
    let rejected = false;
    try {
      await other.mutate("notes", (v) =>
        updateRecord(v, note.id, note.rev, { body: "Stale" }),
      );
    } catch (error) {
      rejected = error.message === "conflict";
    }
    check(
      rejected && (await db.read("notes"))[0].body === "Updated",
      "Stale editor cannot overwrite newer content",
    );
    const before = await db.snapshot();
    rejected = false;
    try {
      await db.replace({ notes: [], tasks: [{ bad: true }] });
    } catch {
      rejected = true;
    }
    check(
      rejected &&
        JSON.stringify(await db.snapshot()) === JSON.stringify(before),
      "Invalid restore preserves all current data",
    );
    rejected = false;
    try {
      await db.mutate("tasks", () => {
        throw new Error("test failure");
      });
    } catch {
      rejected = true;
    }
    check(
      rejected && (await db.read("tasks")).length === 12,
      "Aborted transaction preserves old data",
    );
    const scoped = parseBackup(
      JSON.stringify(backupEnvelope({ notes: updated }, ["notes"])),
    );
    await db.replace(scoped.data);
    const restored = (await db.read("notes"))[0];
    check(
      restored.body === "Updated" && (await db.read("tasks")).length === 12,
      "Scoped restore does not replace other tools",
    );
    check(
      restored.rev !== updated[0].rev,
      "Restore invalidates editors with an older revision",
    );
    const text = el("p", {}, note.body);
    document.body.append(text);
    check(
      !text.querySelector("img"),
      "Script-like note content remains plain text",
    );
    text.remove();
    const toggle = el("button", { "aria-pressed": false, disabled: false });
    check(
      toggle.getAttribute("aria-pressed") === "false" && !toggle.disabled,
      "Shared renderer preserves false ARIA states without disabling controls",
    );
    const notified = new Promise((resolve) => {
      other.changes.addEventListener(
        "change",
        (event) => resolve(event.detail.includes("habits")),
        { once: true },
      );
    });
    await db.mutate("habits", (v) => [
      fresh({ name: "Synthetic habit", archived: false, days: [] }),
      ...v,
    ]);
    check(
      await Promise.race([
        notified,
        new Promise((resolve) => setTimeout(() => resolve(false), 2000)),
      ]),
      "Changes notify another storage client",
    );
    const timer = defaults("timer");
    timer.active = {
      id: "completed",
      mode: "focus",
      status: "running",
      duration: 60,
      remaining: 60,
      endAt: Date.now() - 1000,
      taskTitle: "",
    };
    await db.replace({ timer });
    const completion = () => db.mutate("timer", (v) => completeTimer(v).timer);
    await Promise.all([completion(), completion()]);
    check(
      (await db.read("timer")).sessions.length === 1,
      "Simultaneous timer completion writes one history entry",
    );
    result.textContent += `\n\n${passed} checks passed.`;
  } catch (error) {
    result.textContent += `\nFAIL ${error.message}`;
  } finally {
    await db.close();
    await other.close();
    await new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(name);
      request.onsuccess = resolve;
      request.onerror = reject;
    });
    run.disabled = false;
  }
});
