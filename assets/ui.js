import { t } from "./i18n.js";
export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (
      value === null ||
      value === undefined ||
      (value === false && !key.startsWith("aria-"))
    )
      continue;
    if (key.startsWith("on"))
      node.addEventListener(key.slice(2).toLowerCase(), value);
    else if (key === "class") node.className = value;
    else if (key === "checked" || key === "disabled" || key === "hidden")
      node[key] = Boolean(value);
    else if (key === "value") node.value = value;
    else
      node.setAttribute(
        key,
        value === true && !key.startsWith("aria-") ? "" : String(value),
      );
  }
  for (const child of children.flat(Infinity))
    if (child !== null && child !== undefined && child !== false)
      node.append(
        child instanceof Node ? child : document.createTextNode(String(child)),
      );
  return node;
}
const paths = {
  home: "M3 10 12 3l9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z",
  focus: "M9 2h6m-3 0v3m6 1 2 2M12 9v5l3 2M21 14a9 9 0 1 1-18 0 9 9 0 0 1 18 0",
  tasks: "m4 7 2 2 4-4m3 2h7M4 15l2 2 4-4m3 2h7",
  habits: "M4 4h16v16H4ZM8 2v4m8-4v4M4 9h16m-12 4h1m6 0h1m-8 4h1m6 0h1",
  bookmarks: "M6 3h12v18l-6-4-6 4Z",
  utilities: "m8 3 2 4-2 4-2-4Zm9 7 2 4-2 4-2-4ZM4 16l2 2-2 2-2-2Zm9 3h8",
  flashcards: "M3 7h15v14H3Zm4-4h14v14m-14-6h7m-7 4h4",
  notes: "M5 3h10l4 4v14H5Zm10 0v5h4M8 12h8m-8 4h6",
  settings: "M4 6h16M4 12h16M4 18h16M8 3v6m8 0v6m-6 0v6",
  arrow: "M5 12h14m-5-5 5 5-5 5",
  search: "M20 20l-5-5m2-6a6 6 0 1 1-12 0 6 6 0 0 1 12 0",
  sun: "M12 3V1m0 22v-2M3 12H1m22 0h-2M5 5 3 3m18 18-2-2M5 19l-2 2M21 3l-2 2M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0",
  shield: "M12 2 3 6v6c0 5 9 10 9 10s9-5 9-10V6Zm-5 10 3 3 6-6",
  plus: "M12 5v14M5 12h14",
  check: "m5 12 4 4L19 6",
  trash: "M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7",
  edit: "m4 15 11-11 5 5L9 20l-6 1Zm9-9 5 5",
  play: "m8 4 13 8-13 8Z",
  pause: "M7 4v16M17 4v16",
  download: "M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4",
  close: "m6 6 12 12M6 18 18 6",
  menu: "M4 6h16M4 12h16M4 18h16",
  external: "M14 3h7v7m0-7L10 14M10 4H4v16h16v-6",
  leaf: "M20 3C8 1 3 6 4 13s10 9 15 0c1-3 1-6 1-10ZM4 21 15 9",
};
export function icon(name, cls = "") {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  for (const [k, v] of Object.entries({
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "1.6",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    "aria-hidden": "true",
    class: `icon ${cls}`,
  }))
    svg.setAttribute(k, v);
  const path = document.createElementNS(svg.namespaceURI, "path");
  path.setAttribute("d", paths[name] || paths.notes);
  svg.append(path);
  return svg;
}
export function button(label, fn, cls = "button", name) {
  return el(
    "button",
    { type: "button", class: cls, onclick: fn },
    name ? icon(name) : null,
    label,
  );
}
export function iconButton(label, name, fn) {
  return el(
    "button",
    {
      type: "button",
      class: "icon-button",
      title: label,
      "aria-label": label,
      onclick: fn,
    },
    icon(name),
  );
}
export function field(label, input) {
  const id = input.id || crypto.randomUUID();
  input.id = id;
  return el("label", { class: "field", for: id }, el("span", {}, label), input);
}
export function input(attrs = {}) {
  return el("input", { class: "input", ...attrs });
}
export function option(value, label) {
  return el("option", { value }, label);
}
export function select(options, value, attrs = {}) {
  const s = el(
    "select",
    { class: "input", ...attrs },
    options.map(([v, l]) => option(v, l)),
  );
  s.value = value;
  return s;
}
export function empty(message = t("empty"), name = "leaf") {
  return el("div", { class: "empty" }, icon(name), el("p", {}, message));
}
let toastTimer;
export function toast(message, error = false) {
  const dialog = Array.from(document.querySelectorAll("dialog[open]")).at(-1);
  if (dialog) {
    let notice = dialog.querySelector("[data-dialog-notice]");
    if (!notice) {
      notice = el("p", {
        "data-dialog-notice": "",
        role: "status",
        "aria-live": "polite",
      });
      dialog.querySelector(".dialog-body").prepend(notice);
    }
    notice.className = error ? "help-note error-text" : "help-note";
    notice.textContent = message;
    notice.scrollIntoView({ block: "nearest" });
    return;
  }
  const box = document.querySelector("#toast");
  if (!box) return;
  clearTimeout(toastTimer);
  box.textContent = message;
  box.className = error ? "toast error" : "toast";
  box.hidden = false;
  toastTimer = setTimeout(() => (box.hidden = true), error ? 12000 : 5000);
}
export function report(error) {
  toast(
    t(
      error?.message === "conflict"
        ? "conflict"
        : error?.message === "invalidBackup"
          ? "invalidBackup"
          : error?.message === "loadError"
            ? "loadError"
            : error?.message === "invalid"
              ? "invalid"
              : "saveError",
    ),
    true,
  );
}
export async function act(fn) {
  try {
    return await fn();
  } catch (error) {
    report(error);
    return undefined;
  }
}
export function modal(title, content, actions = []) {
  const previous = document.activeElement;
  const titleId = crypto.randomUUID();
  const dialog = el(
    "dialog",
    { class: "dialog", "aria-labelledby": titleId },
    el(
      "div",
      { class: "dialog-head" },
      el("h2", { id: titleId }, title),
      iconButton(t("close"), "close", () => dialog.close()),
    ),
    el("div", { class: "dialog-body" }, content),
    actions.length ? el("div", { class: "dialog-actions" }, actions) : null,
  );
  dialog.addEventListener("close", () => {
    dialog.remove();
    previous?.focus();
  });
  document.body.append(dialog);
  dialog.showModal();
  return dialog;
}
export async function confirmAction(message) {
  return new Promise((resolve) => {
    let accepted = false;
    const dialog = modal(t("confirmAction"), el("p", {}, message), [
      button(t("cancel"), () => dialog.close(), "button secondary"),
      button(
        t("confirm"),
        () => {
          accepted = true;
          dialog.close();
        },
        "button danger",
      ),
    ]);
    dialog.addEventListener("close", () => resolve(accepted), { once: true });
  });
}
export function searchBox(onchange, placeholder = t("search")) {
  return el(
    "div",
    { class: "search-box" },
    icon("search"),
    input({
      type: "search",
      placeholder,
      "aria-label": placeholder,
      oninput: (event) => onchange(event.target.value),
    }),
  );
}
export function formDialog(title, fields, onSave) {
  const form = el("form", { class: "stack" }, fields);
  const status = el("p", { class: "error-text", role: "status" });
  const submit = el("button", { type: "submit", class: "button" }, t("save"));
  form.append(status, el("div", { class: "dialog-actions" }, submit));
  const dialog = modal(title, form);
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submit.disabled) return;
    submit.disabled = true;
    try {
      await onSave();
      dialog.close();
    } catch (error) {
      status.textContent = t(
        error.message === "conflict"
          ? "conflict"
          : error.message === "urlError"
            ? "urlError"
            : error.message === "invalid"
              ? "invalid"
              : "saveError",
      );
    } finally {
      submit.disabled = false;
    }
  });
  return dialog;
}
export function heading(name) {
  return el(
    "div",
    { class: "page-heading" },
    el(
      "div",
      {},
      el("div", { class: "eyebrow" }, icon(name), t("tools")),
      el("h1", {}, t(name)),
      el("p", {}, t(`${name}Desc`)),
    ),
  );
}
