const words = {
  home: ["Overview", "Tổng quan"],
  tools: ["Your toolkit", "Bộ công cụ"],
  focus: ["Focus Timer", "Đồng hồ tập trung"],
  tasks: ["Today’s Tasks", "Việc hôm nay"],
  habits: ["Habits", "Thói quen"],
  bookmarks: ["Bookmarks", "Đường dẫn"],
  utilities: ["Quick Tools", "Công cụ nhanh"],
  flashcards: ["Flashcards", "Thẻ học"],
  notes: ["Quick Notes", "Ghi chú nhanh"],
  settings: ["Settings & backup", "Cài đặt & sao lưu"],
  local: ["Saved on this device", "Lưu trên thiết bị này"],
  localShort: ["Browser-local", "Lưu tại trình duyệt"],
  tagline: [
    "A little more focus. A little less friction.",
    "Tập trung thêm một chút. Nhẹ nhàng hơn mỗi ngày.",
  ],
  welcome: ["Make room for a good day.", "Dành chỗ cho một ngày tốt lành."],
  intro: [
    "Seven small tools for the things that fill your day. Pick one and make it yours.",
    "Bảy công cụ nhỏ cho những việc mỗi ngày. Chọn một công cụ và bắt đầu theo cách của bạn.",
  ],
  free: [
    "Free. No account. Just you.",
    "Miễn phí. Không tài khoản. Dành cho bạn.",
  ],
  searchTools: ["Find a tool…", "Tìm công cụ…"],
  open: ["Open tool", "Mở công cụ"],
  visit: ["Visit website", "Mở website"],
  allGroups: ["All groups", "Tất cả nhóm"],
  confirmAction: ["Confirm action", "Xác nhận thao tác"],
  confirm: ["Confirm", "Xác nhận"],
  focusDesc: [
    "One thing at a time. Find your rhythm with focused sessions and proper breaks.",
    "Từng việc một. Tạo nhịp làm việc với các phiên tập trung và nghỉ ngơi.",
  ],
  tasksDesc: [
    "Clear your head. Keep today’s priorities and tomorrow’s plans in one place.",
    "Nhẹ đầu hơn. Giữ việc hôm nay và kế hoạch ngày mai ở cùng một nơi.",
  ],
  habitsDesc: [
    "Small steps add up. Build routines you can come back to, day after day.",
    "Tích tiểu thành đại. Duy trì những việc nhỏ, từng ngày một.",
  ],
  bookmarksDesc: [
    "A home for your favorite corners of the internet. Less searching, more finding.",
    "Góc riêng cho các đường dẫn yêu thích. Tìm lại nhanh, dùng thuận tiện.",
  ],
  utilitiesDesc: [
    "Count words, tidy up text, and work out the numbers. Little jobs, sorted.",
    "Đếm từ, làm gọn văn bản và tính toán. Xử lý nhanh những việc nhỏ.",
  ],
  flashcardsDesc: [
    "Turn a little spare time into something you remember. Learn at your pace.",
    "Biến thời gian rảnh thành kiến thức. Học theo nhịp của bạn.",
  ],
  notesDesc: [
    "Catch a thought before it slips away. A quiet space for words and ideas.",
    "Giữ ý tưởng trước khi quên. Một góc yên tĩnh cho những dòng ghi chú.",
  ],
  productivity: ["Get things done", "Làm việc hiệu quả"],
  organize: ["Keep it together", "Sắp xếp gọn gàng"],
  learn: ["Learn & create", "Học & sáng tạo"],
  privacyTitle: [
    "Your space. Your data.",
    "Không gian của bạn. Dữ liệu của bạn.",
  ],
  privacyText: [
    "Your content stays in this browser. No sign-up, no tracking scripts. Export a backup to keep a copy safe.",
    "Nội dung ở lại trình duyệt này. Không đăng ký, không mã theo dõi. Xuất bản sao lưu để giữ một bản an toàn.",
  ],
  privacyMore: ["Storage & privacy", "Lưu trữ & riêng tư"],
  made: [
    "A small space for everyday things.",
    "Một góc nhỏ cho những việc mỗi ngày.",
  ],
  source: ["View source", "Xem mã nguồn"],
  close: ["Close", "Đóng"],
  cancel: ["Cancel", "Hủy"],
  save: ["Save", "Lưu"],
  saving: ["Saving…", "Đang lưu…"],
  saved: ["Saved", "Đã lưu"],
  add: ["Add", "Thêm"],
  edit: ["Edit", "Sửa"],
  delete: ["Delete", "Xóa"],
  done: ["Done", "Xong"],
  search: ["Search…", "Tìm kiếm…"],
  empty: ["A fresh start.", "Bắt đầu từ đây."],
  noResults: ["Nothing matches your search.", "Không có kết quả phù hợp."],
  loadError: [
    "Storage is unavailable. Your changes cannot be saved. Check browser settings and reload.",
    "Không thể mở bộ nhớ. Thay đổi chưa thể lưu. Kiểm tra cài đặt trình duyệt và tải lại.",
  ],
  saveError: [
    "Could not save. Your input is still here. Export a backup and check browser storage.",
    "Không thể lưu. Nội dung nhập vẫn còn. Hãy sao lưu và kiểm tra bộ nhớ trình duyệt.",
  ],
  invalid: [
    "Please check the fields and try again.",
    "Kiểm tra các ô nhập rồi thử lại.",
  ],
  conflict: [
    "This item changed in another tab or was restored. Copy your text, then reload before editing again.",
    "Mục này đã đổi ở tab khác hoặc được khôi phục. Sao chép nội dung rồi tải lại trước khi sửa tiếp.",
  ],
  confirmDelete: [
    "Delete this item? This cannot be undone.",
    "Xóa mục này? Không thể hoàn tác.",
  ],
  language: ["Language", "Ngôn ngữ"],
  theme: ["Appearance", "Giao diện"],
  light: ["Light", "Sáng"],
  dark: ["Dark", "Tối"],
  system: ["System", "Theo hệ thống"],
  backup: ["Backup & restore", "Sao lưu & khôi phục"],
  scope: ["Data to include", "Dữ liệu cần chọn"],
  all: ["All tools", "Tất cả công cụ"],
  export: ["Export backup", "Xuất sao lưu"],
  import: ["Choose backup file", "Chọn file sao lưu"],
  backupHelp: [
    "JSON files are unencrypted. Store them somewhere safe. Import limit: 10 MiB.",
    "File JSON chưa mã hóa. Hãy lưu ở nơi an toàn. Giới hạn nhập: 10 MiB.",
  ],
  restore: ["Replace selected data", "Thay thế dữ liệu đã chọn"],
  restorePreview: ["Review your backup", "Kiểm tra bản sao lưu"],
  restoreWarning: [
    "Restoring replaces the tools listed below. Other tools stay as they are. Export your current data first.",
    "Khôi phục sẽ thay thế dữ liệu các công cụ bên dưới. Công cụ khác giữ nguyên. Hãy xuất dữ liệu hiện tại trước.",
  ],
  restored: ["Backup restored.", "Đã khôi phục sao lưu."],
  invalidBackup: [
    "This backup is invalid, too large, or uses an unsupported version. No data was changed.",
    "File sao lưu không hợp lệ, quá lớn hoặc khác phiên bản hỗ trợ. Dữ liệu chưa thay đổi.",
  ],
  largeBackup: [
    "Backup exceeds 10 MiB and cannot be imported by this version. Export individual tools instead.",
    "Sao lưu vượt 10 MiB, phiên bản này không thể nhập lại. Hãy xuất từng công cụ.",
  ],
  clear: ["Delete selected data", "Xóa dữ liệu đã chọn"],
  clearWarning: [
    "Permanently delete the selected toolkit data? Export a backup first.",
    "Xóa vĩnh viễn dữ liệu bộ công cụ đã chọn? Hãy sao lưu trước.",
  ],
  cleared: ["Selected data deleted.", "Đã xóa dữ liệu đã chọn."],
  privacyDetail: [
    "Content is stored in this browser profile using IndexedDB. It does not sync across devices. Clearing site data or private browsing can remove it. Storage and exported backups are not encrypted vaults: do not keep passwords or secrets here. The app does not upload personal content; the hosting provider receives normal page requests, and opening a bookmark contacts its destination.",
    "Nội dung lưu bằng IndexedDB trong hồ sơ trình duyệt này, không đồng bộ thiết bị. Xóa dữ liệu trang hoặc dùng ẩn danh có thể làm mất dữ liệu. Bộ nhớ và file sao lưu không phải két mã hóa: không lưu mật khẩu hay bí mật. Ứng dụng không tải nội dung cá nhân lên máy chủ; dịch vụ hosting vẫn nhận yêu cầu tải trang và mở đường dẫn sẽ kết nối đến trang đích.",
  ],
  taskTitle: ["What needs doing?", "Bạn cần làm gì?"],
  taskDate: ["Date (optional)", "Ngày (không bắt buộc)"],
  addTask: ["Add task", "Thêm việc"],
  taskEmpty: [
    "Start with one small thing you want to get done.",
    "Bắt đầu với một việc nhỏ bạn muốn hoàn thành.",
  ],
  today: ["Today", "Hôm nay"],
  overdue: ["Overdue", "Quá hạn"],
  upcoming: ["Upcoming", "Sắp tới"],
  undated: ["Anytime", "Chưa đặt ngày"],
  completed: ["Completed", "Đã hoàn thành"],
  pending: ["Open tasks", "Việc chưa xong"],
  complete: ["Complete task", "Hoàn thành việc"],
  reopen: ["Reopen task", "Mở lại việc"],
  sessions: ["Focus sessions", "Phiên tập trung"],
  minutes: ["minutes", "phút"],
  focusMode: ["Focus", "Tập trung"],
  shortMode: ["Short break", "Nghỉ ngắn"],
  longMode: ["Long break", "Nghỉ dài"],
  timerKicker: [
    "A moment for what matters",
    "Dành thời gian cho điều quan trọng",
  ],
  start: ["Start session", "Bắt đầu phiên"],
  pause: ["Pause", "Tạm dừng"],
  resume: ["Resume", "Tiếp tục"],
  reset: ["Reset", "Đặt lại"],
  duration: ["Duration (1–180 minutes)", "Thời lượng (1–180 phút)"],
  sound: ["Completion sound", "Âm thanh khi kết thúc"],
  taskLink: ["Working on", "Đang làm việc"],
  noTask: ["A little time for yourself", "Một chút thời gian cho bản thân"],
  history: ["Recent sessions", "Phiên gần đây"],
  noSessions: [
    "Your completed focus sessions will appear here.",
    "Các phiên tập trung hoàn tất sẽ xuất hiện ở đây.",
  ],
  timerDone: [
    "Session complete. Take a breath.",
    "Phiên đã hoàn tất. Nghỉ một chút nhé.",
  ],
  resetConfirm: [
    "Discard the current session and reset the timer?",
    "Bỏ phiên hiện tại và đặt lại đồng hồ?",
  ],
  background: [
    "Keep this page open for sound. Sleeping devices and background tabs may delay alerts.",
    "Giữ trang mở để phát âm. Thiết bị ngủ và tab nền có thể làm trễ âm báo.",
  ],
  habitName: ["A habit to build", "Thói quen muốn xây dựng"],
  addHabit: ["Add habit", "Thêm thói quen"],
  habitsEmpty: [
    "Choose something small enough to repeat tomorrow.",
    "Chọn một việc đủ nhỏ để lặp lại ngày mai.",
  ],
  archive: ["Archive", "Lưu trữ"],
  unarchive: ["Unarchive", "Bỏ lưu trữ"],
  archived: ["Archived habits", "Thói quen đã lưu trữ"],
  streak: ["day streak", "ngày liên tiếp"],
  habitDate: ["Check-in date", "Ngày đánh dấu"],
  checkin: ["Mark complete", "Đánh dấu hoàn thành"],
  uncheck: ["Undo check-in", "Bỏ đánh dấu"],
  pastWeek: ["Last 7 days", "7 ngày gần nhất"],
  title: ["Title", "Tiêu đề"],
  url: ["Website URL", "Địa chỉ website"],
  group: ["Group", "Nhóm"],
  addBookmark: ["Add bookmark", "Thêm đường dẫn"],
  bookmarkEmpty: [
    "Save a link you want to find again.",
    "Lưu một đường dẫn bạn muốn tìm lại.",
  ],
  urlError: [
    "Use a full http:// or https:// address.",
    "Dùng địa chỉ đầy đủ bắt đầu bằng http:// hoặc https://.",
  ],
  ungrouped: ["Ungrouped", "Chưa phân nhóm"],
  textTools: ["Text workbench", "Xử lý văn bản"],
  textInput: ["Your text", "Văn bản của bạn"],
  textPlaceholder: [
    "Paste a paragraph, draft an idea, or tidy up a little text…",
    "Dán một đoạn văn, viết ý tưởng hoặc làm gọn văn bản…",
  ],
  words: ["words", "từ"],
  characters: ["characters", "ký tự"],
  lines: ["lines", "dòng"],
  wordRule: [
    "Words are separated by whitespace. Characters count Unicode code points. Counts are approximate for some languages.",
    "Từ được tách bằng khoảng trắng. Ký tự đếm theo mã Unicode. Một số ngôn ngữ có số đếm gần đúng.",
  ],
  upper: ["UPPERCASE", "CHỮ HOA"],
  lower: ["lowercase", "chữ thường"],
  tidy: ["Tidy spacing", "Gọn khoảng trắng"],
  copy: ["Copy text", "Sao chép"],
  copied: ["Copied.", "Đã sao chép."],
  copyError: [
    "Could not copy. Select and copy the text manually.",
    "Không sao chép được. Hãy chọn và sao chép văn bản thủ công.",
  ],
  calculator: ["Quick calculator", "Tính nhanh"],
  firstNumber: ["First number", "Số thứ nhất"],
  secondNumber: ["Second number", "Số thứ hai"],
  operation: ["Operation", "Phép tính"],
  calculate: ["Calculate", "Tính"],
  result: ["Result", "Kết quả"],
  percentage: ["% of", "% của"],
  mathError: [
    "Enter finite numbers. Division by zero is not allowed.",
    "Nhập số hữu hạn. Không thể chia cho 0.",
  ],
  decks: ["Your decks", "Bộ thẻ của bạn"],
  deckName: ["Deck name", "Tên bộ thẻ"],
  addDeck: ["Create deck", "Tạo bộ thẻ"],
  deckEmpty: [
    "Give your next little learning project a name.",
    "Đặt tên cho điều tiếp theo bạn muốn học.",
  ],
  front: ["Front / question", "Mặt trước / câu hỏi"],
  back: ["Back / answer", "Mặt sau / đáp án"],
  addCard: ["Add card", "Thêm thẻ"],
  cards: ["cards", "thẻ"],
  review: ["Review", "Ôn tập"],
  flip: ["Reveal answer", "Xem đáp án"],
  remembered: ["Remembered", "Đã nhớ"],
  notYet: ["Not yet", "Chưa nhớ"],
  reviewDone: ["You’ve reached the end of this deck.", "Bạn đã ôn hết bộ thẻ."],
  restart: ["Review again", "Ôn lại"],
  noCards: [
    "Add your first question and answer below.",
    "Thêm câu hỏi và đáp án đầu tiên bên dưới.",
  ],
  noteTitle: ["Note title", "Tiêu đề ghi chú"],
  newNote: ["New note", "Ghi chú mới"],
  noteBody: ["Write something…", "Viết điều gì đó…"],
  notesEmpty: [
    "A thought, a list, a small beginning. Make your first note.",
    "Một ý tưởng, danh sách hay khởi đầu nhỏ. Tạo ghi chú đầu tiên.",
  ],
  untitled: ["Untitled note", "Ghi chú chưa có tên"],
  editing: ["Editing", "Đang sửa"],
  loading: ["Opening your space…", "Đang mở không gian của bạn…"],
  goHome: ["Back to overview", "Về tổng quan"],
  records: ["records", "bản ghi"],
  updated: ["Updated", "Cập nhật"],
  skip: ["Skip to content", "Đến nội dung chính"],
  selectDeck: ["Select a deck", "Chọn bộ thẻ"],
  leaveNote: [
    "Your note has unsaved changes. Leave this page?",
    "Ghi chú chưa lưu xong. Rời trang này?",
  ],
  runningElsewhere: [
    "The timer changed in another tab. Showing the latest state.",
    "Đồng hồ đã đổi ở tab khác. Đang hiện trạng thái mới nhất.",
  ],
  lastBackup: ["Last export", "Lần xuất gần nhất"],
  never: ["Not yet", "Chưa có"],
  activeHabits: ["Active habits", "Thói quen hiện tại"],
  noteCount: ["Quick notes", "Ghi chú"],
  toolsCount: [
    "small tools, one calmer day",
    "công cụ nhỏ, một ngày nhẹ nhàng hơn",
  ],
  previous: ["Previous", "Trước"],
  next: ["Next", "Tiếp"],
  manageCards: ["Manage cards", "Quản lý thẻ"],
  unsaved: ["Unsaved changes", "Thay đổi chưa lưu"],
  draftNotice: [
    "Copy any unsaved text before closing or restoring data.",
    "Sao chép nội dung chưa lưu trước khi đóng hoặc khôi phục dữ liệu.",
  ],
};
function preference(key, fallback) {
  try {
    return localStorage.getItem(`pt:${key}`) || fallback;
  } catch {
    return fallback;
  }
}
export let language = preference("language", "en") === "vi" ? "vi" : "en";
export function t(key) {
  return words[key]?.[language === "vi" ? 1 : 0] ?? key;
}
export function setLanguage(value) {
  language = value === "vi" ? "vi" : "en";
  try {
    localStorage.setItem("pt:language", language);
  } catch {}
}
export function getTheme() {
  const value = preference("theme", "system");
  return ["light", "dark", "system"].includes(value) ? value : "system";
}
export function setTheme(value) {
  try {
    localStorage.setItem("pt:theme", value);
  } catch {}
  applyTheme(value);
}
export function applyTheme(value = getTheme()) {
  document.documentElement.dataset.theme = value;
  document.documentElement.lang = language;
}
export function dateLabel(
  date = new Date(),
  options = { month: "short", day: "numeric" },
) {
  return new Intl.DateTimeFormat(
    language === "vi" ? "vi-VN" : "en-US",
    options,
  ).format(new Date(date));
}
export const translationKeys = Object.keys(words);
