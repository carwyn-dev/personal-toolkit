import {
  t,
  language,
  setLanguage,
  applyTheme,
  getTheme,
  setTheme,
  dateLabel,
} from "./i18n.js";
import {
  el,
  icon,
  iconButton,
  button,
  empty,
  searchBox,
  report,
} from "./ui.js";
import { openDB, changes } from "./storage.js";
applyTheme();
export const page = document.body.dataset.page || "home";
document.title = `${t(page)} · Personal Toolkit`;
export const root = new URL("../", import.meta.url);
export const toolList = [
  "focus",
  "tasks",
  "habits",
  "bookmarks",
  "utilities",
  "flashcards",
  "notes",
];
export function toolURL(name) {
  return new URL(`tools/${name}/`, root).href;
}
const brand = () =>
  el(
    "a",
    { class: "brand", href: root.href },
    el(
      "span",
      { class: "brand-mark", "aria-hidden": "true" },
      [1, 2, 3, 4].map(() => el("i")),
    ),
    "personal toolkit",
  );
async function showSettings() {
  try {
    const module = await import("./settings.js");
    await module.showSettings();
  } catch (error) {
    report(error);
  }
}
const nav = el(
  "nav",
  { "aria-label": t("tools") },
  el(
    "a",
    {
      class: `nav-link ${page === "home" ? "active" : ""}`,
      href: root.href,
      "aria-current": page === "home" ? "page" : null,
    },
    icon("home"),
    t("home"),
  ),
  el("p", { class: "nav-title" }, t("tools")),
  toolList.map((name) =>
    el(
      "a",
      {
        class: `nav-link ${page === name ? "active" : ""}`,
        href: toolURL(name),
        "aria-current": page === name ? "page" : null,
      },
      icon(name),
      t(name),
    ),
  ),
);
const sidebar = el(
  "aside",
  { class: "sidebar", id: "navigation" },
  brand(),
  nav,
  el(
    "div",
    { class: "sidebar-bottom" },
    button(t("settings"), showSettings, "nav-link nav-settings", "settings"),
    el("div", { class: "sidebar-note" }, icon("shield"), t("local")),
  ),
);
const menu = iconButton(t("tools"), "menu", () => {
  setNavigation(!sidebar.classList.contains("open"));
});
menu.classList.add("mobile-menu");
menu.setAttribute("aria-controls", "navigation");
menu.setAttribute("aria-expanded", "false");
const mobileQuery = matchMedia("(max-width: 760px)");
function setNavigation(open) {
  sidebar.classList.toggle("open", open);
  sidebar.inert = mobileQuery.matches && !open;
  menu.setAttribute("aria-expanded", String(open));
}
setNavigation(false);
mobileQuery.addEventListener("change", () => setNavigation(false));
const languageButton = button(
  language === "en" ? "EN / VI" : "VI / EN",
  () => {
    setLanguage(language === "en" ? "vi" : "en");
    location.reload();
  },
  "language-button",
);
languageButton.setAttribute("aria-label", t("language"));
const header = el(
  "header",
  { class: "topbar" },
  el(
    "div",
    { class: "row" },
    menu,
    el(
      "div",
      { class: "breadcrumb" },
      icon(page === "home" ? "home" : page),
      t(page),
    ),
  ),
  el(
    "div",
    { class: "topbar-actions" },
    el(
      "span",
      { class: "top-date" },
      dateLabel(new Date(), {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
    ),
    languageButton,
    iconButton(t("theme"), "sun", () => {
      const theme = getTheme();
      const isDark =
        theme === "dark" ||
        (theme === "system" &&
          matchMedia("(prefers-color-scheme: dark)").matches);
      setTheme(isDark ? "light" : "dark");
    }),
  ),
);
export const main = el(
  "main",
  { id: "main", tabindex: "-1" },
  el("p", { class: "loading" }, t("loading")),
);
document.body.append(
  el("a", { class: "skip", href: "#main" }, t("skip")),
  sidebar,
  el(
    "div",
    { class: "frame" },
    header,
    main,
    el(
      "footer",
      {},
      el("span", {}, t("made")),
      el(
        "a",
        {
          href: "https://github.com/carwyn-dev/personal-toolkit",
          target: "_blank",
          rel: "noopener noreferrer",
        },
        t("source"),
      ),
    ),
  ),
  el("div", {
    id: "toast",
    class: "toast",
    role: "status",
    "aria-live": "polite",
    hidden: true,
  }),
);
document.addEventListener("click", (event) => {
  if (!sidebar.contains(event.target) && !menu.contains(event.target)) {
    setNavigation(false);
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    const wasOpen = sidebar.classList.contains("open");
    setNavigation(false);
    if (wasOpen) menu.focus();
  }
});
function home() {
  const groups = el("div");
  let query = "";
  function render() {
    groups.replaceChildren();
    const arrangements = [
      ["productivity", ["focus", "tasks", "habits"]],
      ["organize", ["bookmarks", "utilities"]],
      ["learn", ["flashcards", "notes"]],
    ];
    let matches = 0;
    for (const [title, names] of arrangements) {
      const shown = names.filter((name) =>
        (t(name) + " " + t(`${name}Desc`)).toLocaleLowerCase().includes(query),
      );
      if (!shown.length) continue;
      matches += shown.length;
      groups.append(
        el("div", { class: "section-line" }, el("h2", {}, t(title))),
        el(
          "div",
          { class: "tool-grid" },
          shown.map((name) =>
            el(
              "a",
              { class: "tool-card", href: toolURL(name), "data-tool": name },
              el(
                "div",
                { class: "card-top" },
                el("span", { class: "tool-symbol" }, icon(name)),
                el(
                  "span",
                  { class: "tool-number" },
                  String(toolList.indexOf(name) + 1).padStart(2, "0"),
                ),
              ),
              el("h3", {}, t(name)),
              el("p", {}, t(`${name}Desc`)),
              el("div", { class: "card-bottom" }, t("open"), icon("arrow")),
            ),
          ),
        ),
      );
    }
    if (!matches) groups.append(empty(t("noResults")));
  }
  main.replaceChildren(
    el(
      "section",
      { class: "hero" },
      el("div", { class: "eyebrow" }, icon("leaf"), t("free")),
      el("h1", {}, t("welcome")),
      el("p", {}, t("intro")),
      el(
        "div",
        { class: "hero-flourish", "aria-hidden": "true" },
        icon("leaf"),
      ),
    ),
    el(
      "div",
      { class: "hero-line" },
      el("span", { class: "small-caption" }, `07 — ${t("toolsCount")}`),
      searchBox((value) => {
        query = value.toLocaleLowerCase();
        render();
      }, t("searchTools")),
    ),
    groups,
    el(
      "section",
      { class: "privacy-banner" },
      icon("shield"),
      el(
        "div",
        {},
        el("h3", {}, t("privacyTitle")),
        el("p", {}, t("privacyText")),
      ),
      button(t("privacyMore"), showSettings, "text-button"),
    ),
  );
  render();
}
changes.addEventListener("unavailable", () => report(new Error("loadError")));
try {
  if (page === "home") {
    home();
    openDB().catch(report);
  } else if (toolList.includes(page)) {
    if (page !== "utilities") await openDB();
    const module = await import(`./tools/${page}.js`);
    await module.mount(main);
  } else main.replaceChildren(empty());
} catch (error) {
  main.replaceChildren(empty(t("loadError"), "shield"));
  report(error);
}
