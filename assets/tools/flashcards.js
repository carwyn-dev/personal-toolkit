import { t } from "../i18n.js";
import {
  el,
  button,
  iconButton,
  field,
  input,
  select,
  empty,
  act,
  heading,
  formDialog,
  confirmAction,
  searchBox,
} from "../ui.js";
import { read, mutate, changes } from "../storage.js";
import { fresh, revise, updateRecord } from "../model.js";
export async function mount(main) {
  let decks = await read("flashcards"),
    selected = decks[0]?.id || "",
    flipped = false,
    shownCard = null,
    query = "",
    page = 0;
  const pick = select([], selected, {
      onchange: () => {
        selected = pick.value;
        flipped = false;
        query = "";
        page = 0;
        render();
      },
    }),
    area = el("div"),
    toolbar = el("div", { class: "deck-toolbar" });
  const deck = () => decks.find((v) => v.id === selected);
  function editDeck(item) {
    const name = input({
      required: true,
      maxlength: 100,
      value: item?.name || "",
    });
    formDialog(
      t(item ? "edit" : "addDeck"),
      [field(t("deckName"), name)],
      async () => {
        if (!name.value.trim()) throw new Error("invalid");
        if (item)
          await mutate("flashcards", (v) =>
            updateRecord(v, item.id, item.rev, { name: name.value.trim() }),
          );
        else {
          const record = fresh({
            name: name.value.trim(),
            cards: [],
            cursor: 0,
          });
          await mutate("flashcards", (v) => [record, ...v]);
          selected = record.id;
          await refresh();
        }
      },
    );
  }
  async function removeDeck(item) {
    if (await confirmAction(t("confirmDelete")))
      await mutate("flashcards", (v) => {
        if (v.find((d) => d.id === item.id)?.rev !== item.rev)
          throw new Error("conflict");
        return v.filter((d) => d.id !== item.id);
      });
  }
  function editCard(item) {
    const d = deck();
    if (!d) return;
    const front = el(
        "textarea",
        { class: "input", required: true, maxlength: 2000, rows: 3 },
        item?.front || "",
      ),
      back = el(
        "textarea",
        { class: "input", required: true, maxlength: 4000, rows: 3 },
        item?.back || "",
      );
    formDialog(
      t(item ? "edit" : "addCard"),
      [field(t("front"), front), field(t("back"), back)],
      () =>
        mutate("flashcards", (v) => {
          if (!front.value.trim() || !back.value.trim())
            throw new Error("invalid");
          const current = v.find((x) => x.id === d.id);
          if (!current || current.rev !== d.rev) throw new Error("conflict");
          const cards = item
            ? updateRecord(current.cards, item.id, item.rev, {
                front: front.value.trim(),
                back: back.value.trim(),
              })
            : [
                ...current.cards,
                fresh({
                  front: front.value.trim(),
                  back: back.value.trim(),
                  remembered: 0,
                  reviews: 0,
                }),
              ];
          return updateRecord(v, d.id, d.rev, { cards });
        }),
    );
  }
  async function removeCard(item) {
    const d = deck();
    if (!(await confirmAction(t("confirmDelete")))) return;
    await mutate("flashcards", (v) => {
      const current = v.find((x) => x.id === d.id);
      if (!current || current.rev !== d.rev) throw new Error("conflict");
      const cards = current.cards.filter((c) => c.id !== item.id);
      return updateRecord(v, d.id, d.rev, {
        cards,
        cursor: Math.min(current.cursor, cards.length),
      });
    });
  }
  async function review(remembered) {
    const d = deck(),
      card = d?.cards[d.cursor];
    if (!card) return;
    await mutate("flashcards", (v) => {
      const current = v.find((x) => x.id === d.id);
      if (!current || current.rev !== d.rev) throw new Error("conflict");
      const cards = current.cards.map((c) =>
        c.id === card.id
          ? revise(c, {
              reviews: c.reviews + 1,
              remembered: c.remembered + (remembered ? 1 : 0),
            })
          : c,
      );
      return updateRecord(v, d.id, d.rev, { cards, cursor: d.cursor + 1 });
    });
    flipped = false;
  }
  function render() {
    const d = deck();
    pick.replaceChildren(
      ...decks.map((v) => el("option", { value: v.id }, v.name)),
    );
    pick.value = selected;
    toolbar.replaceChildren(
      field(t("selectDeck"), pick),
      button(t("addDeck"), () => editDeck(null), "button", "plus"),
    );
    if (d)
      toolbar.append(
        iconButton(t("edit"), "edit", () => editDeck(d)),
        iconButton(t("delete"), "trash", () => act(() => removeDeck(d))),
      );
    area.replaceChildren();
    if (!d) {
      area.append(empty(t("deckEmpty"), "flashcards"));
      return;
    }
    const card = d.cards[d.cursor];
    if (shownCard !== card?.id) {
      flipped = false;
      shownCard = card?.id;
    }
    const study = el(
      "section",
      { class: "panel" },
      el(
        "div",
        { class: "row spread" },
        el("h2", {}, t("review")),
        el(
          "span",
          { class: "badge" },
          `${Math.min(d.cursor + 1, d.cards.length)} / ${d.cards.length}`,
        ),
      ),
    );
    if (!d.cards.length) study.append(empty(t("noCards"), "flashcards"));
    else if (!card)
      study.append(
        empty(t("reviewDone"), "check"),
        button(
          t("restart"),
          () =>
            act(() =>
              mutate("flashcards", (v) =>
                updateRecord(v, d.id, d.rev, { cursor: 0 }),
              ),
            ),
          "button secondary",
        ),
      );
    else
      study.append(
        el(
          "div",
          { class: "review-card", "aria-live": "polite" },
          el("span", { class: "small muted" }, t(flipped ? "back" : "front")),
          el("p", {}, flipped ? card.back : card.front),
        ),
        el(
          "div",
          { class: "row" },
          flipped
            ? [
                button(
                  t("notYet"),
                  () => act(() => review(false)),
                  "button secondary",
                ),
                button(
                  t("remembered"),
                  () => act(() => review(true)),
                  "button",
                  "check",
                ),
              ]
            : button(
                t("flip"),
                () => {
                  flipped = true;
                  render();
                },
                "button secondary",
              ),
        ),
      );
    const manager = el(
      "section",
      { class: "panel" },
      el(
        "div",
        { class: "row spread" },
        el("h2", {}, t("manageCards")),
        button(t("addCard"), () => editCard(null), "button secondary", "plus"),
      ),
    );
    const cards = el("div", { class: "item-list" });
    function renderCards() {
      const filtered = d.cards.filter((c) =>
        (c.front + " " + c.back).toLocaleLowerCase().includes(query),
      );
      const maxPage = Math.max(0, Math.ceil(filtered.length / 20) - 1);
      page = Math.min(page, maxPage);
      const rows = filtered.slice(page * 20, page * 20 + 20).map((c) => {
        const content = el(
          "div",
          { class: "grow" },
          el("p", { class: "item-title card-content" }, c.front),
          el("p", { class: "small muted card-content" }, c.back),
          el(
            "span",
            { class: "badge" },
            `${t("remembered")}: ${c.remembered}/${c.reviews}`,
          ),
        );
        const actions = el(
          "div",
          { class: "row" },
          iconButton(t("edit"), "edit", () => editCard(c)),
          iconButton(t("delete"), "trash", () => act(() => removeCard(c))),
        );
        return el("div", { class: "item-row" }, content, actions);
      });
      cards.replaceChildren(...rows);
      if (filtered.length > 20)
        cards.append(
          el(
            "div",
            { class: "row spread" },
            button(
              t("previous"),
              () => {
                page = Math.max(0, page - 1);
                renderCards();
              },
              "button secondary",
            ),
            el(
              "span",
              { class: "small muted" },
              `${page + 1} / ${maxPage + 1}`,
            ),
            button(
              t("next"),
              () => {
                page = Math.min(maxPage, page + 1);
                renderCards();
              },
              "button secondary",
            ),
          ),
        );
    }
    manager.append(
      el(
        "div",
        { class: "tabs" },
        searchBox((value) => {
          query = value.toLocaleLowerCase();
          page = 0;
          renderCards();
        }),
      ),
      cards,
    );
    renderCards();
    area.append(el("div", { class: "two-col" }, study, manager));
  }
  async function refresh() {
    decks = await read("flashcards");
    if (!decks.some((d) => d.id === selected)) selected = decks[0]?.id || "";
    render();
  }
  main.replaceChildren(heading("flashcards"), toolbar, area);
  render();
  changes.addEventListener("change", (event) => {
    if (event.detail.includes("flashcards")) act(refresh);
  });
}
