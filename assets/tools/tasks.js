import { t, dateLabel } from "../i18n.js";
import {
  el,
  button,
  iconButton,
  field,
  input,
  empty,
  act,
  formDialog,
  confirmAction,
  heading,
} from "../ui.js";
import { read, mutate, changes } from "../storage.js";
import { fresh, revise, updateRecord, localDate } from "../model.js";
export async function mount(main) {
  let tasks = await read("tasks"),
    filter = "today";
  const list = el("div", { class: "item-list" }),
    tabs = el("div", { class: "tabs" }),
    stats = el("div", { class: "stats" });
  const title = input({
    required: true,
    maxlength: 300,
    placeholder: t("taskTitle"),
  });
  const day = input({
    type: "date",
    value: localDate(),
    min: "0001-01-01",
    max: "9999-12-31",
  });
  const submit = el(
    "button",
    { type: "submit", class: "button" },
    t("addTask"),
  );
  const form = el(
    "form",
    { class: "task-form" },
    field(t("taskTitle"), title),
    field(t("taskDate"), day),
    submit,
  );
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!title.value.trim() || submit.disabled) return;
    act(async () => {
      submit.disabled = true;
      try {
        const record = fresh({
          title: title.value.trim(),
          date: day.value || null,
          done: false,
        });
        await mutate("tasks", (current) => [record, ...current]);
        title.value = "";
        title.focus();
      } finally {
        submit.disabled = false;
      }
    });
  });
  function edit(task) {
    const name = input({ required: true, maxlength: 300, value: task.title });
    const date = input({
      type: "date",
      value: task.date || "",
      min: "0001-01-01",
      max: "9999-12-31",
    });
    formDialog(
      t("edit"),
      [field(t("taskTitle"), name), field(t("taskDate"), date)],
      async () => {
        if (!name.value.trim()) throw new Error("invalid");
        await mutate("tasks", (current) =>
          updateRecord(current, task.id, task.rev, {
            title: name.value.trim(),
            date: date.value || null,
          }),
        );
      },
    );
  }
  async function remove(task) {
    if (await confirmAction(t("confirmDelete")))
      await mutate("tasks", (current) => {
        const existing = current.find((v) => v.id === task.id);
        if (!existing || existing.rev !== task.rev) throw new Error("conflict");
        return current.filter((v) => v.id !== task.id);
      });
  }
  function render() {
    const today = localDate();
    const predicates = {
      today: (v) => !v.done && v.date === today,
      overdue: (v) => !v.done && v.date && v.date < today,
      upcoming: (v) => !v.done && v.date > today,
      undated: (v) => !v.done && !v.date,
      completed: (v) => v.done,
    };
    stats.replaceChildren(
      ...[
        ["pending", tasks.filter((v) => !v.done).length],
        ["today", tasks.filter(predicates.today).length],
        ["completed", tasks.filter((v) => v.done).length],
      ].map(([key, n]) =>
        el(
          "div",
          { class: "stat" },
          el("strong", {}, n),
          el("span", {}, t(key)),
        ),
      ),
    );
    tabs.replaceChildren(
      ...Object.keys(predicates).map((key) =>
        button(
          `${t(key)} · ${tasks.filter(predicates[key]).length}`,
          () => {
            filter = key;
            render();
          },
          `tab ${filter === key ? "active" : ""}`,
        ),
      ),
    );
    const shown = tasks.filter(predicates[filter]);
    list.replaceChildren(
      ...shown.map((task) => {
        const check = input({
          type: "checkbox",
          class: "check-box",
          checked: task.done,
          "aria-label": t(task.done ? "reopen" : "complete"),
          onchange: () =>
            act(() =>
              mutate("tasks", (current) =>
                current.map((v) =>
                  v.id === task.id ? revise(v, { done: check.checked }) : v,
                ),
              ),
            ),
        });
        return el(
          "div",
          { class: `item-row ${task.done ? "is-done" : ""}` },
          check,
          el(
            "div",
            { class: "grow" },
            el("p", { class: "item-title" }, task.title),
            task.date
              ? el(
                  "span",
                  { class: "small muted" },
                  dateLabel(`${task.date}T12:00:00`),
                )
              : null,
          ),
          el(
            "div",
            { class: "row" },
            iconButton(t("edit"), "edit", () => edit(task)),
            iconButton(t("delete"), "trash", () => act(() => remove(task))),
          ),
        );
      }),
    );
    if (!shown.length) list.append(empty(t("taskEmpty"), "tasks"));
  }
  main.replaceChildren(
    heading("tasks"),
    stats,
    el("section", { class: "panel" }, form, tabs, list),
  );
  render();
  let currentDay = localDate();
  setInterval(() => {
    if (currentDay !== localDate()) {
      currentDay = localDate();
      render();
    }
  }, 15000);
  changes.addEventListener("change", (event) => {
    if (event.detail.includes("tasks"))
      act(async () => {
        tasks = await read("tasks");
        render();
      });
  });
}
