import { t, dateLabel } from "../i18n.js";
import {
  el,
  button,
  iconButton,
  input,
  field,
  empty,
  act,
  heading,
  searchBox,
  confirmAction,
  toast,
} from "../ui.js";
import { read, mutate, changes } from "../storage.js";
import { fresh, updateRecord } from "../model.js";
export async function mount(main) {
  let notes = await read("notes"),
    selected = null,
    baseRev = null,
    query = "",
    dirty = false,
    saving = false,
    blocked = false,
    timeout,
    refreshPending = false;
  const list = el("div", { class: "note-list" }),
    editor = el("section", { class: "panel note-editor" }),
    state = el("span", { class: "small muted", role: "status" });
  const title = input({
    class: "input note-title",
    maxlength: 200,
    "aria-label": t("noteTitle"),
    placeholder: t("noteTitle"),
    oninput: changed,
  });
  const body = el("textarea", {
    class: "input note-body",
    maxlength: 100000,
    "aria-label": t("noteBody"),
    placeholder: t("noteBody"),
    oninput: changed,
  });
  function changed() {
    dirty = true;
    state.textContent = t("unsaved");
    clearTimeout(timeout);
    if (!blocked) timeout = setTimeout(() => act(save), 500);
  }
  async function save() {
    if (!dirty || saving || blocked || !selected) return;
    saving = true;
    let failed = false;
    state.textContent = t("saving");
    const id = selected,
      rev = baseRev,
      fields = { title: title.value, body: body.value };
    try {
      const result = await mutate("notes", (current) =>
        updateRecord(current, id, rev, fields),
      );
      notes = result;
      const saved = result.find((v) => v.id === id);
      baseRev = saved.rev;
      dirty = title.value !== fields.title || body.value !== fields.body;
      state.textContent = t(dirty ? "unsaved" : "saved");
      renderList();
    } catch (error) {
      failed = true;
      blocked = error.message === "conflict";
      state.textContent = t(blocked ? "conflict" : "saveError");
      throw error;
    } finally {
      saving = false;
      if (dirty && !blocked && !failed) {
        clearTimeout(timeout);
        timeout = setTimeout(() => act(save), 500);
      }
      if (refreshPending) {
        refreshPending = false;
        await refresh();
      }
    }
  }
  async function canLeave() {
    if (saving) {
      toast(t("saving"));
      return false;
    }
    if (dirty) {
      try {
        await save();
      } catch {
        return false;
      }
    }
    return !dirty;
  }
  async function choose(note) {
    if (note.id === selected) return;
    if (!(await canLeave())) return;
    selected = note.id;
    baseRev = note.rev;
    blocked = false;
    dirty = false;
    title.value = note.title;
    body.value = note.body;
    renderEditor();
    renderList();
  }
  async function create() {
    if (!(await canLeave())) return;
    const note = fresh({ title: "", body: "" });
    notes = await mutate("notes", (current) => [note, ...current]);
    await choose(note);
    title.focus();
  }
  async function remove() {
    const id = selected,
      rev = baseRev;
    if (saving) return;
    if (!(await confirmAction(t("confirmDelete")))) return;
    await mutate("notes", (current) => {
      if (current.find((v) => v.id === id)?.rev !== rev)
        throw new Error("conflict");
      return current.filter((v) => v.id !== id);
    });
    dirty = false;
    selected = null;
    baseRev = null;
    blocked = false;
    clearTimeout(timeout);
    renderEditor();
  }
  function renderEditor() {
    editor.replaceChildren();
    if (!selected) {
      editor.append(empty(t("notesEmpty"), "notes"));
      return;
    }
    state.textContent = t(dirty ? "unsaved" : "saved");
    editor.append(
      el(
        "div",
        { class: "row spread" },
        el("span", { class: "small muted" }, t("editing")),
        el(
          "div",
          { class: "row" },
          state,
          button(t("save"), () => act(save), "text-button"),
          iconButton(t("delete"), "trash", () => act(remove)),
        ),
      ),
      el("hr", { class: "divider" }),
      el(
        "div",
        { class: "stack" },
        field(t("noteTitle"), title),
        field(t("noteBody"), body),
      ),
    );
  }
  function renderList() {
    const shown = notes
      .filter((v) =>
        (v.title + " " + v.body).toLocaleLowerCase().includes(query),
      )
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    list.replaceChildren(
      ...shown.map((note) =>
        el(
          "button",
          {
            type: "button",
            class: `note-list-button ${note.id === selected ? "active" : ""}`,
            onclick: () => act(() => choose(note)),
          },
          el("strong", {}, note.title || t("untitled")),
          el("p", {}, note.body.slice(0, 90) || "—"),
          el("span", { class: "small muted" }, dateLabel(note.updatedAt)),
        ),
      ),
    );
    if (!shown.length)
      list.append(empty(t(notes.length ? "noResults" : "notesEmpty"), "notes"));
  }
  async function refresh() {
    if (saving) {
      refreshPending = true;
      return;
    }
    notes = await read("notes");
    const note = notes.find((v) => v.id === selected);
    if (selected && (!note || note.rev !== baseRev)) {
      if (dirty) {
        blocked = true;
        clearTimeout(timeout);
        state.textContent = t("conflict");
        toast(t("conflict"), true);
      } else if (note) {
        baseRev = note.rev;
        title.value = note.title;
        body.value = note.body;
      } else {
        selected = null;
        baseRev = null;
        renderEditor();
      }
    }
    renderList();
  }
  main.replaceChildren(
    heading("notes"),
    el(
      "div",
      { class: "note-layout" },
      el(
        "aside",
        {},
        button(t("newNote"), () => act(create), "button", "plus"),
        el(
          "div",
          { class: "tabs" },
          searchBox((value) => {
            query = value.toLocaleLowerCase();
            renderList();
          }),
        ),
        list,
      ),
      editor,
    ),
  );
  renderEditor();
  renderList();
  changes.addEventListener("change", (event) => {
    if (event.detail.includes("notes")) act(refresh);
  });
  window.addEventListener("beforeunload", (event) => {
    if (dirty || saving) {
      event.preventDefault();
      event.returnValue = "";
    }
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && dirty && !blocked) act(save);
  });
}
