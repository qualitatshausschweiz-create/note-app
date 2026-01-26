/* ============================================================
   VARIABILI GLOBALI
============================================================ */
let notes = JSON.parse(localStorage.getItem("notes") || "[]");
let trash = JSON.parse(localStorage.getItem("trash") || "[]");
let archive = JSON.parse(localStorage.getItem("archive") || "[]");

let editingId = null;
let selectedColor = "#ffffff";
let currentCategoryFilter = "all";
let currentLang = localStorage.getItem("appLang") || "it";

let autoBackupEnabled = JSON.parse(localStorage.getItem("autoBackupEnabled") || "true");
let autoRestoreEnabled = JSON.parse(localStorage.getItem("autoRestoreEnabled") || "true");

let privacyMode = JSON.parse(localStorage.getItem("privacyMode") || "false");
let animationsEnabled = JSON.parse(localStorage.getItem("animationsEnabled") || "true");
let textSize = localStorage.getItem("textSize") || "medium";
let fontMode = localStorage.getItem("fontMode") || "ios";

/* ============================================================
   TRADUZIONI
============================================================ */
const translations = {
  it: {
    notesTitle: "Le tue note",
    noTitle: "Senza titolo",
    catAll: "Tutte",
    catHome: "Casa",
    catWork: "Lavoro",
    catIdeas: "Idee",
    catShopping: "Spesa",
    catOther: "Altro",
    titlePlaceholder: "Titolo",
    textPlaceholder: "Scrivi la tua nota...",
    categoryLabel: "Categoria",
    colorLabel: "Colore nota",
    save: "Salva",
    delete: "Elimina",
    editNote: "Nota",
    backupTitle: "Backup & Ripristino",
    backupSection: "Backup",
    restoreSection: "Ripristino",
    exportSection: "Esporta / Importa",
    backupManageSection: "Gestione backup",
    quickBackup: "Backup veloce",
    manualBackup: "Backup manuale",
    manualRestore: "Ripristino manuale",
    exportText: "Esporta note (.txt)",
    deleteBackups: "Cancella backup",
    close: "Chiudi",
    settingsTitle: "Impostazioni",
    securitySection: "Sicurezza",
    maintenanceSection: "Manutenzione",
    deleteAllNotes: "Cancella tutte le note",
    resetApp: "Reset totale app",
    quickBackupDone: "Backup rapido eseguito.",
    manualBackupDone: "Backup manuale eseguito.",
    restoreDone: "Ripristino completato.",
    noBackupFound: "Nessun backup trovato."
  },
  en: {
    notesTitle: "Your notes",
    noTitle: "No title",
    catAll: "All",
    catHome: "Home",
    catWork: "Work",
    catIdeas: "Ideas",
    catShopping: "Shopping",
    catOther: "Other",
    titlePlaceholder: "Title",
    textPlaceholder: "Write your note...",
    categoryLabel: "Category",
    colorLabel: "Note color",
    save: "Save",
    delete: "Delete",
    editNote: "Note",
    backupTitle: "Backup & Restore",
    backupSection: "Backup",
    restoreSection: "Restore",
    exportSection: "Export / Import",
    backupManageSection: "Backup management",
    quickBackup: "Quick backup",
    manualBackup: "Manual backup",
    manualRestore: "Manual restore",
    exportText: "Export notes (.txt)",
    deleteBackups: "Delete backups",
    close: "Close",
    settingsTitle: "Settings",
    securitySection: "Security",
    maintenanceSection: "Maintenance",
    deleteAllNotes: "Delete all notes",
    resetApp: "Reset app",
    quickBackupDone: "Quick backup done.",
    manualBackupDone: "Manual backup done.",
    restoreDone: "Restore completed.",
    noBackupFound: "No backup found."
  }
};

/* ============================================================
   MULTILINGUA
============================================================ */
function getT() {
  return translations[currentLang] || translations.it;
}

function applyTranslations() {
  const t = getT();

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (t[key]) el.textContent = t[key];
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (t[key]) el.placeholder = t[key];
  });

  updateCategoryButtons();
  renderNotes();
}

function updateCategoryButtons() {
  const t = getT();
  document.querySelector('[data-category="all"]').innerHTML = `📁 ${t.catAll}`;
  document.querySelector('[data-category="home"]').innerHTML = `🏠 ${t.catHome}`;
  document.querySelector('[data-category="work"]').innerHTML = `💼 ${t.catWork}`;
  document.querySelector('[data-category="ideas"]').innerHTML = `💡 ${t.catIdeas}`;
  document.querySelector('[data-category="shopping"]').innerHTML = `🛒 ${t.catShopping}`;
  document.querySelector('[data-category="other"]').innerHTML = `⭐ ${t.catOther}`;
}

document.querySelectorAll(".lang-btn").forEach(btn => {
  if (btn.dataset.lang === currentLang) btn.classList.add("active");
  btn.onclick = () => {
    document.querySelectorAll(".lang-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentLang = btn.dataset.lang;
    localStorage.setItem("appLang", currentLang);
    applyTranslations();
  };
});

/* ============================================================
   TEMI
============================================================ */
function applyTheme(theme) {
  document.body.classList.remove("light", "dark", "amoled");
  document.body.classList.add(theme);
  localStorage.setItem("appTheme", theme);
}

applyTheme(localStorage.getItem("appTheme") || "light");

document.getElementById("theme-light").onclick = () => applyTheme("light");
document.getElementById("theme-dark").onclick = () => applyTheme("dark");

/* ============================================================
   NOTE
============================================================ */
function getCategoryLabel(cat) {
  const t = getT();
  return {
    home: t.catHome,
    work: t.catWork,
    ideas: t.catIdeas,
    shopping: t.catShopping,
    other: t.catOther
  }[cat] || t.catOther;
}

function renderNotes() {
  const container = document.getElementById("notes-container");
  container.innerHTML = "";

  const sortMode = localStorage.getItem("sortMode") || "date";
  let list = [...notes];

  if (sortMode === "title") list.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
  if (sortMode ===
