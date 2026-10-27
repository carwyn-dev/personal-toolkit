import {
  t,
  language,
  setLanguage,
  getTheme,
  setTheme,
  dateLabel,
} from "./i18n.js";
import {
  el,
  button,
  field,
  select,
  input,
  modal,
  toast,
  act,
  confirmAction,
} from "./ui.js";
import { snapshot, replace } from "./storage.js";
import {
  KEYS,
  MAX_BACKUP,
  defaults,
  backupEnvelope,
  parseBackup,
} from "./model.js";
const label = (key) => t(key === "timer" ? "focus" : key);
export async function showSettings() {
  const lang = select(
    [
      ["en", "English"],
      ["vi", "Tiếng Việt"],
    ],
    language,
    {
      onchange: (event) => {
        setLanguage(event.target.value);
        location.reload();
      },
    },
  );
  const theme = select(
    ["system", "light", "dark"].map((v) => [v, t(v)]),
    getTheme(),
    { onchange: (event) => setTheme(event.target.value) },
  );
  const scope = select(
    [["all", t("all")], ...KEYS.map((k) => [k, label(k)])],
    "all",
  );
  const selected = () => (scope.value === "all" ? KEYS : [scope.value]);
  const backupState = el("p", { class: "small muted" });
  function lastBackup() {
    let time;
    try {
      time = localStorage.getItem("pt:lastBackup");
    } catch {}
    backupState.textContent = `${t("lastBackup")}: ${time ? dateLabel(time, { dateStyle: "medium", timeStyle: "short" }) : t("never")}`;
  }
  lastBackup();
  async function exportData(scopeKeys = selected()) {
    const envelope = backupEnvelope(await snapshot(scopeKeys), scopeKeys);
    const raw = JSON.stringify(envelope, null, 2);
    if (new Blob([raw]).size > MAX_BACKUP) {
      toast(t("largeBackup"), true);
    }
    const url = URL.createObjectURL(
      new Blob([raw], { type: "application/json" }),
    );
    const link = el("a", {
      href: url,
      download: `personal-toolkit-backup-${scopeKeys.length === KEYS.length ? "all" : scopeKeys[0]}-${new Date().toISOString().slice(0, 10)}.json`,
    });
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    try {
      localStorage.setItem("pt:lastBackup", new Date().toISOString());
    } catch {}
    lastBackup();
  }
  const file = input({
    type: "file",
    accept: ".json,application/json",
    "aria-label": t("import"),
    onchange: async () => {
      const picked = file.files[0];
      if (!picked) return;
      let backup;
      try {
        if (picked.size > MAX_BACKUP) throw new Error();
        backup = parseBackup(await picked.text());
      } catch {
        toast(t("invalidBackup"), true);
        file.value = "";
        return;
      }
      const counts = el(
        "ul",
        {},
        backup.scope.map((key) =>
          el(
            "li",
            {},
            `${label(key)}: ${key === "timer" ? backup.data[key].sessions.length : backup.data[key].length} ${t("records")}`,
          ),
        ),
      );
      const restoreButton = button(t("restore"), () =>
        act(async () => {
          restoreButton.disabled = true;
          try {
            await replace(backup.data);
            dialog.close();
            toast(t("restored"));
          } finally {
            restoreButton.disabled = false;
          }
        }),
      );
      const dialog = modal(
        t("restorePreview"),
        el(
          "div",
          { class: "stack" },
          el("p", {}, t("restoreWarning")),
          el(
            "p",
            { class: "small muted" },
            dateLabel(backup.exportedAt, {
              dateStyle: "medium",
              timeStyle: "short",
            }),
          ),
          counts,
          button(
            t("export"),
            () => act(() => exportData(backup.scope)),
            "button secondary",
            "download",
          ),
        ),
        [
          button(t("cancel"), () => dialog.close(), "button secondary"),
          restoreButton,
        ],
      );
      file.value = "";
    },
  });
  const clearButton = button(
    t("clear"),
    () =>
      act(async () => {
        if (
          await confirmAction(
            `${t("clearWarning")} (${scope.value === "all" ? t("all") : label(scope.value)})`,
          )
        ) {
          await replace(
            Object.fromEntries(selected().map((k) => [k, defaults(k)])),
          );
          toast(t("cleared"));
        }
      }),
    "button secondary",
    "trash",
  );
  modal(
    t("settings"),
    el(
      "div",
      {},
      el(
        "section",
        { class: "stack" },
        field(t("language"), lang),
        field(t("theme"), theme),
      ),
      el(
        "section",
        { class: "stack" },
        el("h3", {}, t("backup")),
        el("p", { class: "small muted" }, t("backupHelp")),
        field(t("scope"), scope),
        button(t("export"), () => act(exportData), "button", "download"),
        field(t("import"), file),
        backupState,
        clearButton,
      ),
      el(
        "section",
        {},
        el("h3", {}, t("privacyTitle")),
        el("p", { class: "small muted" }, t("privacyDetail")),
      ),
    ),
  );
}
