import { mkdir, writeFile } from "node:fs/promises";
const names = [
  "home",
  "focus",
  "tasks",
  "habits",
  "bookmarks",
  "utilities",
  "flashcards",
  "notes",
];
const titles = {
  home: "Your everyday space",
  focus: "Focus Timer",
  tasks: "Today’s Tasks",
  habits: "Habits",
  bookmarks: "Bookmarks",
  utilities: "Quick Tools",
  flashcards: "Flashcards",
  notes: "Quick Notes",
};
for (const name of names) {
  const directory = name === "home" ? "." : `tools/${name}`;
  const prefix = name === "home" ? "./" : "../../";
  await mkdir(directory, { recursive: true });
  await writeFile(
    `${directory}/index.html`,
    `<!doctype html>
<html lang="en" data-theme="system">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="referrer" content="no-referrer">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'none'; font-src 'self'; base-uri 'none'; object-src 'none'; form-action 'none'">
  <title>${titles[name]} · Personal Toolkit</title>
  <meta name="description" content="Seven small tools for everyday focus, planning, and learning. No account required. Personal content is stored in your browser.">
  <link rel="icon" href="${prefix}assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="${prefix}assets/style.css">
  <script type="module" src="${prefix}assets/app.js"></script>
</head>
<body data-page="${name}">
  <noscript>This toolkit needs JavaScript for its tools and browser-local storage. Bộ công cụ cần JavaScript để hoạt động và lưu dữ liệu.</noscript>
</body>
</html>
`,
  );
}
