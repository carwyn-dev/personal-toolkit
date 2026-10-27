import { t } from "../i18n.js";
import { el, button, field, input, select, heading, toast } from "../ui.js";
import { calculate } from "../model.js";
export async function mount(main) {
  const text = el("textarea", {
    class: "input",
    rows: 11,
    maxlength: 100000,
    placeholder: t("textPlaceholder"),
    "aria-label": t("textInput"),
    oninput: counts,
  });
  const metrics = el("div", { class: "metric-row" });
  function counts() {
    const value = text.value;
    const numbers = [
      ["words", value.trim() ? value.trim().split(/\s+/u).length : 0],
      ["characters", Array.from(value).length],
      ["lines", value ? value.split(/\r?\n/).length : 0],
    ];
    metrics.replaceChildren(
      ...numbers.map(([key, n]) =>
        el(
          "div",
          {},
          el("strong", {}, n),
          el("p", { class: "small muted" }, t(key)),
        ),
      ),
    );
  }
  const first = input({ type: "number", step: "any", required: true }),
    second = input({ type: "number", step: "any", required: true });
  const operation = select(
    [
      ["+", "+"],
      ["-", "−"],
      ["*", "×"],
      ["/", "÷"],
      ["%", t("percentage")],
    ],
    "+",
  );
  const result = el("output", { class: "help-note", role: "status" }, "—");
  const form = el(
    "form",
    { class: "stack" },
    field(t("firstNumber"), first),
    field(t("operation"), operation),
    field(t("secondNumber"), second),
    el("button", { class: "button", type: "submit" }, t("calculate")),
    field(t("result"), result),
  );
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    try {
      result.textContent = String(
        calculate(first.value, second.value, operation.value),
      );
    } catch {
      result.textContent = t("mathError");
    }
  });
  main.replaceChildren(
    heading("utilities"),
    el(
      "div",
      { class: "two-col" },
      el(
        "section",
        { class: "panel stack" },
        el("h2", {}, t("textTools")),
        field(t("textInput"), text),
        metrics,
        el(
          "div",
          { class: "row" },
          ...["upper", "lower", "tidy"].map((key) =>
            button(
              t(key),
              () => {
                text.value =
                  key === "upper"
                    ? text.value.toLocaleUpperCase()
                    : key === "lower"
                      ? text.value.toLocaleLowerCase()
                      : text.value
                          .split("\n")
                          .map((v) => v.trim().replace(/[\t ]+/g, " "))
                          .join("\n")
                          .trim();
                counts();
              },
              "button secondary",
            ),
          ),
          button(
            t("copy"),
            async () => {
              try {
                await navigator.clipboard.writeText(text.value);
                toast(t("copied"));
              } catch {
                toast(t("copyError"), true);
              }
            },
            "button secondary",
          ),
        ),
        el("p", { class: "small muted" }, t("wordRule")),
      ),
      el("section", { class: "panel" }, el("h2", {}, t("calculator")), form),
    ),
  );
  counts();
}
