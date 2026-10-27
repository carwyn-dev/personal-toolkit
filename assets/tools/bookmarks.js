import { t } from "../i18n.js";
import {
  el,
  button,
  icon,
  iconButton,
  field,
  input,
  empty,
  act,
  heading,
  formDialog,
  confirmAction,
  searchBox,
  select,
} from "../ui.js";
import { read, mutate, changes } from "../storage.js";
import { fresh, updateRecord, safeURL } from "../model.js";
export async function mount(main) {
  let bookmarks = await read("bookmarks"),
    query = "",
    group = "";
  const list = el("div", { class: "tool-grid" });
  const groups = select([["", t("allGroups")]], "", {
    onchange: () => {
      group = groups.value;
      renderList();
    },
  });
  function edit(item) {
    const title = input({
        required: true,
        maxlength: 300,
        value: item?.title || "",
      }),
      url = input({
        required: true,
        type: "url",
        maxlength: 2048,
        value: item?.url || "",
        placeholder: "https://example.com",
      }),
      category = input({ maxlength: 80, value: item?.group || "" });
    formDialog(
      t(item ? "edit" : "addBookmark"),
      [
        field(t("title"), title),
        field(t("url"), url),
        field(t("group"), category),
      ],
      async () => {
        const parsed = safeURL(url.value);
        if (!parsed) throw new Error("urlError");
        if (!title.value.trim()) throw new Error("invalid");
        const fields = {
          title: title.value.trim(),
          url: parsed,
          group: category.value.trim(),
        };
        await mutate("bookmarks", (v) =>
          item
            ? updateRecord(v, item.id, item.rev, fields)
            : [fresh(fields), ...v],
        );
      },
    );
  }
  async function remove(item) {
    if (await confirmAction(t("confirmDelete")))
      await mutate("bookmarks", (v) => {
        if (v.find((r) => r.id === item.id)?.rev !== item.rev)
          throw new Error("conflict");
        return v.filter((r) => r.id !== item.id);
      });
  }
  function renderList() {
    const shown = bookmarks.filter(
      (v) =>
        (!group || v.group === group) &&
        (v.title + " " + v.url + " " + v.group)
          .toLocaleLowerCase()
          .includes(query),
    );
    list.replaceChildren(
      ...shown.map((item) =>
        el(
          "article",
          { class: "panel bookmark-card stack" },
          el(
            "div",
            { class: "row spread" },
            el("span", { class: "tool-symbol" }, icon("bookmarks")),
            el("span", { class: "badge" }, item.group || t("ungrouped")),
          ),
          el(
            "div",
            {},
            el(
              "h3",
              {},
              el(
                "a",
                {
                  href: item.url,
                  target: "_blank",
                  rel: "noopener noreferrer",
                },
                item.title,
              ),
            ),
            el("p", { class: "bookmark-url" }, new URL(item.url).hostname),
          ),
          el(
            "div",
            { class: "row spread" },
            el(
              "a",
              {
                class: "text-button",
                href: item.url,
                target: "_blank",
                rel: "noopener noreferrer",
              },
              t("visit"),
              " ",
              icon("external"),
            ),
            el(
              "div",
              { class: "row" },
              iconButton(t("edit"), "edit", () => edit(item)),
              iconButton(t("delete"), "trash", () => act(() => remove(item))),
            ),
          ),
        ),
      ),
    );
    if (!shown.length)
      list.append(
        empty(t(bookmarks.length ? "noResults" : "bookmarkEmpty"), "bookmarks"),
      );
  }
  function render() {
    const values = [
      ...new Set(bookmarks.map((v) => v.group).filter(Boolean)),
    ].sort();
    if (group && !values.includes(group)) group = "";
    groups.replaceChildren(
      el("option", { value: "" }, t("allGroups")),
      ...values.map((v) => el("option", { value: v }, v)),
    );
    groups.value = group;
    renderList();
  }
  main.replaceChildren(
    heading("bookmarks"),
    el(
      "div",
      { class: "row spread" },
      searchBox((value) => {
        query = value.toLocaleLowerCase();
        renderList();
      }),
      button(t("addBookmark"), () => edit(null), "button", "plus"),
    ),
    el("div", { class: "tabs" }, field(t("group"), groups)),
    list,
  );
  render();
  changes.addEventListener("change", (event) => {
    if (event.detail.includes("bookmarks"))
      act(async () => {
        bookmarks = await read("bookmarks");
        render();
      });
  });
}
