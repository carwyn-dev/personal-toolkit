import { t, dateLabel } from "../i18n.js";
import {
  el,
  button,
  iconButton,
  field,
  input,
  empty,
  act,
  heading,
  formDialog,
  confirmAction,
} from "../ui.js";
import { read, mutate, changes } from "../storage.js";
import {
  fresh,
  revise,
  updateRecord,
  localDate,
  shiftDate,
  streak,
} from "../model.js";
export async function mount(main) {
  let habits = await read("habits");
  const name = input({
    required: true,
    maxlength: 100,
    placeholder: t("habitName"),
  });
  const submit = el(
    "button",
    { type: "submit", class: "button" },
    t("addHabit"),
  );
  const form = el(
    "form",
    { class: "row" },
    field(t("habitName"), name),
    submit,
  );
  const list = el("div", { class: "two-col" });
  const checkDate = input({
    type: "date",
    value: localDate(),
    min: "0001-01-01",
    max: localDate(),
    onchange: render,
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!name.value.trim() || submit.disabled) return;
    act(async () => {
      submit.disabled = true;
      try {
        await mutate("habits", (v) => [
          fresh({ name: name.value.trim(), archived: false, days: [] }),
          ...v,
        ]);
        name.value = "";
      } finally {
        submit.disabled = false;
      }
    });
  });
  async function toggle(habit, day) {
    if (!day || day > localDate()) throw new Error("invalid");
    await mutate("habits", (v) =>
      v.map((item) =>
        item.id === habit.id
          ? revise(item, {
              days: item.days.includes(day)
                ? item.days.filter((d) => d !== day)
                : [...item.days, day].sort(),
            })
          : item,
      ),
    );
  }
  function edit(habit) {
    const title = input({ value: habit.name, required: true, maxlength: 100 });
    formDialog(t("edit"), [field(t("habitName"), title)], () =>
      mutate("habits", (v) => {
        if (!title.value.trim()) throw new Error("invalid");
        return updateRecord(v, habit.id, habit.rev, {
          name: title.value.trim(),
        });
      }),
    );
  }
  async function remove(habit) {
    if (await confirmAction(t("confirmDelete")))
      await mutate("habits", (v) => {
        if (v.find((item) => item.id === habit.id)?.rev !== habit.rev)
          throw new Error("conflict");
        return v.filter((item) => item.id !== habit.id);
      });
  }
  function render() {
    list.replaceChildren();
    const day = checkDate.value || localDate();
    for (const archived of [false, true]) {
      const shown = habits.filter((v) => v.archived === archived);
      if (archived && shown.length)
        list.append(el("h2", { class: "grow" }, t("archived")));
      for (const habit of shown) {
        const week = Array.from({ length: 7 }, (_, i) =>
          shiftDate(localDate(), i - 6),
        );
        const calendar = el(
          "div",
          { class: "habit-week", "aria-label": t("pastWeek") },
          week.map((date) =>
            el(
              "button",
              {
                type: "button",
                class: `day-cell ${habit.days.includes(date) ? "checked" : ""}`,
                "aria-pressed": habit.days.includes(date),
                "aria-label": `${dateLabel(`${date}T12:00:00`, { weekday: "long", month: "long", day: "numeric" })}: ${t(habit.days.includes(date) ? "uncheck" : "checkin")}`,
                disabled: habit.archived,
                onclick: () => act(() => toggle(habit, date)),
              },
              el(
                "span",
                {},
                dateLabel(`${date}T12:00:00`, { weekday: "short" }),
              ),
              el("b", {}, Number(date.slice(-2))),
            ),
          ),
        );
        const check = button(
          t(habit.days.includes(day) ? "uncheck" : "checkin"),
          () => act(() => toggle(habit, day)),
          habit.days.includes(day) ? "button" : "button secondary",
        );
        check.disabled = archived || day > localDate();
        const actions = el(
          "div",
          { class: "row" },
          iconButton(t("edit"), "edit", () => edit(habit)),
          button(
            t(archived ? "unarchive" : "archive"),
            () =>
              act(() =>
                mutate("habits", (v) =>
                  updateRecord(v, habit.id, habit.rev, { archived: !archived }),
                ),
              ),
            "text-button",
          ),
          iconButton(t("delete"), "trash", () => act(() => remove(habit))),
        );
        list.append(
          el(
            "article",
            { class: "panel habit-card" },
            el(
              "div",
              { class: "row spread" },
              el("h3", { class: "grow" }, habit.name),
              el(
                "span",
                { class: "badge" },
                `${streak(habit.days)} ${t("streak")}`,
              ),
            ),
            calendar,
            el("div", { class: "row spread" }, check, actions),
          ),
        );
      }
    }
    if (!habits.length) list.append(empty(t("habitsEmpty"), "habits"));
  }
  main.replaceChildren(
    heading("habits"),
    el(
      "section",
      { class: "panel stack" },
      form,
      field(t("habitDate"), checkDate),
    ),
    el("div", { class: "section-line" }, el("h2", {}, t("pastWeek"))),
    list,
  );
  render();
  let current = localDate();
  setInterval(() => {
    if (current !== localDate()) {
      current = localDate();
      checkDate.value = current;
      checkDate.max = current;
      render();
    }
  }, 15000);
  changes.addEventListener("change", (event) => {
    if (event.detail.includes("habits"))
      act(async () => {
        habits = await read("habits");
        render();
      });
  });
}
