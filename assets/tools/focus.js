import { t, dateLabel } from "../i18n.js";
import {
  el,
  button,
  field,
  input,
  select,
  empty,
  act,
  heading,
  toast,
  confirmAction,
} from "../ui.js";
import { read, mutate, changes } from "../storage.js";
import { remaining, localDate, completeTimer } from "../model.js";
export async function mount(main) {
  let timer = await read("timer"),
    mode = timer.active?.mode || "focus",
    busy = false,
    finishing = false;
  let audioContext;
  function unlockSound() {
    try {
      const Context = window.AudioContext || window.webkitAudioContext;
      audioContext ??= new Context();
      audioContext.resume().catch(() => {});
    } catch {}
  }
  const tabs = el("div", { class: "tabs timer-tabs" }),
    digits = el("div", {
      class: "timer-digits",
      role: "timer",
      "aria-label": t("focus"),
    }),
    modeLabel = el("span", { class: "small" }),
    controls = el("div", { class: "row timer-controls" }),
    history = el("div"),
    stats = el("div", { class: "stats" });
  const minutes = input({
    type: "number",
    min: 1,
    max: 180,
    step: 1,
    value: timer.durations[mode],
  });
  const sound = input({
    type: "checkbox",
    class: "check-box",
    checked: timer.sound,
    onchange: () => {
      if (sound.checked) unlockSound();
      act(() => mutate("timer", (v) => ({ ...v, sound: sound.checked })));
    },
  });
  const task = select([["", t("noTask")]], "");
  async function refreshTasks() {
    const value = task.value;
    const tasks = (await read("tasks")).filter((v) => !v.done);
    task.replaceChildren(
      el("option", { value: "" }, t("noTask")),
      ...tasks.map((v) => el("option", { value: v.id }, v.title)),
    );
    task.value = tasks.some((v) => v.id === value) ? value : "";
  }
  await refreshTasks();
  function active() {
    return timer.active;
  }
  function checkCurrent(v) {
    if (
      (v.active?.id ?? null) !== (timer.active?.id ?? null) ||
      v.active?.status !== timer.active?.status
    )
      throw new Error("conflict");
  }
  function playSound() {
    if (!timer.sound || audioContext?.state !== "running") return;
    try {
      const context = audioContext;
      const oscillator = context.createOscillator(),
        gain = context.createGain();
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.frequency.value = 660;
      gain.gain.value = 0.08;
      oscillator.start();
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.6);
      oscillator.stop(context.currentTime + 0.65);
    } catch {}
  }
  async function finish() {
    if (finishing) return;
    finishing = true;
    let completed = false;
    const id = active()?.id;
    try {
      timer = await mutate("timer", (v) => {
        if (v.active?.id !== id) return v;
        const result = completeTimer(v);
        completed = result.completed;
        return result.timer;
      });
      if (completed) {
        playSound();
        toast(t("timerDone"));
      }
    } finally {
      finishing = false;
    }
  }
  function paintClock() {
    const a = active();
    const seconds = a ? remaining(a) : timer.durations[mode] * 60;
    digits.textContent = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
    document.title = `${digits.textContent} · ${t("focus")} · Personal Toolkit`;
    if (a?.status === "running" && seconds === 0) act(finish);
  }
  async function startPause() {
    if (busy) return;
    busy = true;
    try {
      const taskTitle = task.value
        ? task.selectedOptions[0]?.textContent || ""
        : "";
      timer = await mutate("timer", (v) => {
        checkCurrent(v);
        if (!v.active)
          v.active = {
            id: crypto.randomUUID(),
            mode,
            status: "running",
            duration: v.durations[mode] * 60,
            remaining: v.durations[mode] * 60,
            endAt: Date.now() + v.durations[mode] * 60000,
            taskTitle,
          };
        else if (v.active.status === "running") {
          v.active.remaining = remaining(v.active);
          v.active.endAt = null;
          v.active.status = "paused";
        } else {
          v.active.status = "running";
          v.active.endAt = Date.now() + v.active.remaining * 1000;
        }
        return v;
      });
    } finally {
      busy = false;
    }
  }
  async function reset(nextMode = mode) {
    if (active() && !(await confirmAction(t("resetConfirm")))) return;
    timer = await mutate("timer", (v) => {
      checkCurrent(v);
      v.active = null;
      return v;
    });
    mode = nextMode;
    render();
  }
  minutes.addEventListener("change", () =>
    act(async () => {
      if (active()) {
        minutes.value = timer.durations[mode];
        return;
      }
      const value = Number(minutes.value);
      if (!Number.isInteger(value) || value < 1 || value > 180) {
        minutes.value = timer.durations[mode];
        throw new Error("invalid");
      }
      await mutate("timer", (v) => {
        if (v.active) throw new Error("conflict");
        v.durations[mode] = value;
        return v;
      });
    }),
  );
  function render() {
    const a = active();
    if (a) mode = a.mode;
    tabs.replaceChildren(
      ...["focus", "short", "long"].map((value) =>
        button(
          t(`${value}Mode`),
          () =>
            act(async () => {
              if (value !== mode) await reset(value);
            }),
          `tab ${mode === value ? "active" : ""}`,
        ),
      ),
    );
    modeLabel.textContent = t(`${mode}Mode`);
    minutes.value = timer.durations[mode];
    minutes.disabled = Boolean(a);
    task.disabled = Boolean(a);
    sound.checked = timer.sound;
    controls.replaceChildren(
      button(
        t(a?.status === "running" ? "pause" : a ? "resume" : "start"),
        () => {
          if (timer.sound) unlockSound();
          act(startPause);
        },
        "button",
        a?.status === "running" ? "pause" : "play",
      ),
      button(t("reset"), () => act(() => reset()), "button secondary"),
    );
    const todaySessions = timer.sessions.filter(
      (v) => localDate(new Date(v.endedAt)) === localDate(),
    );
    stats.replaceChildren(
      ...[
        ["sessions", todaySessions.length],
        ["minutes", todaySessions.reduce((n, v) => n + v.minutes, 0)],
        ["history", timer.sessions.length],
      ].map(([label, count]) =>
        el(
          "div",
          { class: "stat" },
          el("strong", {}, count),
          el("span", {}, t(label)),
        ),
      ),
    );
    history.replaceChildren(
      el("h2", {}, t("history")),
      ...timer.sessions.slice(0, 8).map((v) =>
        el(
          "div",
          { class: "history-item" },
          el(
            "div",
            { class: "row spread" },
            el("strong", { class: "small" }, `${v.minutes} ${t("minutes")}`),
            el(
              "span",
              { class: "small muted" },
              dateLabel(v.endedAt, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }),
            ),
          ),
          el("p", { class: "small muted" }, v.taskTitle || t("noTask")),
        ),
      ),
    );
    if (!timer.sessions.length) history.append(empty(t("noSessions"), "focus"));
    paintClock();
  }
  main.replaceChildren(
    heading("focus"),
    stats,
    el(
      "div",
      { class: "timer-layout" },
      el(
        "section",
        { class: "panel timer-panel" },
        tabs,
        el("p", { class: "small muted" }, t("timerKicker")),
        el("div", { class: "timer-face" }, digits, modeLabel),
        controls,
        field(t("taskLink"), task),
        el(
          "div",
          { class: "timer-settings stack" },
          field(t("duration"), minutes),
          el("label", { class: "row small" }, sound, t("sound")),
          el("p", { class: "small muted" }, t("background")),
        ),
      ),
      el("section", { class: "panel" }, history),
    ),
  );
  render();
  setInterval(paintClock, 500);
  changes.addEventListener("change", (event) => {
    if (event.detail.includes("timer"))
      act(async () => {
        timer = await read("timer");
        render();
      });
    if (event.detail.includes("tasks")) act(refreshTasks);
  });
}
