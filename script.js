/* ===========================
   PART 1 — STATE & INIT
   =========================== */

// ELEMENTS
const noteTitle = document.getElementById("noteTitle");
const noteContent = document.getElementById("noteContent");
const categorySelector = document.getElementById("categorySelector");
const noteList = document.getElementById("noteList");
const categoryList = document.getElementById("categoryList");
const searchInput = document.getElementById("searchInput");

const themeToggleBtn = document.getElementById("themeToggleBtn");
const themeSelect = document.getElementById("themeSelect");
const customColorPicker = document.getElementById("customColorPicker");

const openSettingsBtn = document.getElementById("openSettingsBtn");
const settingsPopup = document.getElementById("settingsPopup");
const closeSettingsBtn = document.getElementById("closeSettingsBtn");

const openLifebuoyBtn = document.getElementById("openLifebuoyBtn");
const lifebuoyPopup = document.getElementById("lifebuoyPopup");
const closeLifebuoyBtn = document.getElementById("closeLifebuoyBtn");

const openTrashBtn = document.getElementById("openTrashBtn");
const openArchiveBtn = document.getElementById("openArchiveBtn");

const createBackupBtn = document.getElementById("createBackupBtn");
const importBackupBtn = document.getElementById("importBackupBtn");
const exportDataBtn = document.getElementById("exportDataBtn");
const backupList = document.getElementById("backupList");

const addCategoryBtn = document.getElementById("addCategoryBtn");

// STATE
let notes = [];
let deletedNotes = [];
let archivedNotes = [];

let categories = [
  { id: "personale", name: "Personale", color: "#ff9500" },
  { id: "lavoro", name: "Lavoro", color: "#34c759" },
  { id: "idee", name: "Idee", color: "#af52de" },
  { id: "spesa", name: "Spesa", color: "#007aff" },
  { id: "tutte", name: "Tutte", color: "#8e8e93" },
  { id: "altro", name: "Altro", color: "#5ac8fa" }
];

let showTrash = false;
let showArchive = false;

// LOCALSTORAGE KEYS
const LS_NOTES = "notes_v1";
const LS_DELETED = "deleted_notes_v1";
const LS_ARCHIVED = "archived_notes_v1";
const LS_CATEGORIES = "categories_v1";
const LS_SETTINGS = "settings_v1";
const LS_BACKUPS = "backups_v1";

// LOAD DATA
function loadData() {
  const n = localStorage.getItem(LS_NOTES);
  const d = localStorage.getItem(LS_DELETED);
  const a = localStorage.getItem(LS_ARCHIVED);
  const c = localStorage.getItem(LS_CATEGORIES);
  const s = localStorage.getItem(LS_SETTINGS);

  if (n) notes = JSON.parse(n);
  if (d) deletedNotes = JSON.parse(d);
  if (a) archivedNotes = JSON.parse(a);
  if (c) categories = JSON.parse(c);

  if (s) {
    const settings = JSON.parse(s);

    if (settings.theme) {
      document.documentElement.setAttribute("data-theme", settings.theme);
      themeToggleBtn.textContent = settings.theme === "dark" ? "🌙" : "🌞";
      themeSelect.value = settings.theme;
    }

    if (settings.accent) {
      document.documentElement.style.setProperty("--accent", settings.accent);
      customColorPicker.value = settings.accent;
    }
  }

  renderCategories();
  renderNotes();
  renderBackupList();
}

// SAVE DATA
function saveData() {
  localStorage.setItem(LS_NOTES, JSON.stringify(notes));
  localStorage.setItem(LS_DELETED, JSON.stringify(deletedNotes));
  localStorage.setItem(LS_ARCHIVED, JSON.stringify(archivedNotes));
  localStorage.setItem(LS_CATEGORIES, JSON.stringify(categories));
  saveSettings();
}

// SAVE SETTINGS
function saveSettings() {
  const settings = {
    theme: document.documentElement.getAttribute("data-theme"),
    accent: getComputedStyle(document.documentElement).getPropertyValue("--accent").trim()
  };
  localStorage.setItem(LS_SETTINGS, JSON.stringify(settings));
}

// INIT
loadData();
/* ===========================
   PART 2 — NOTES, CATEGORIES,
   ARCHIVE, SEARCH, TAGS
   =========================== */

// CREATE NOTE
function saveNote() {
  const title = noteTitle.value.trim();
  const content = noteContent.value.trim();
  const category = categorySelector.value;

  if (title === "" && content === "") return;

  const newNote = {
    id: Date.now(),
    title: title || "(Senza titolo)",
    content,
    category,
    tags: extractTags(content),
    date: new Date().toISOString()
  };

  notes.unshift(newNote);

  noteTitle.value = "";
  noteContent.value = "";

  renderNotes();
  saveData();
}

// EXTRACT TAGS (#tag)
function extractTags(text) {
  const matches = text.match(/#\w+/g);
  return matches ? matches.map(t => t.toLowerCase()) : [];
}

// DELETE NOTE → moves to trash
function deleteNote(id) {
  const note = notes.find(n => n.id === id);
  if (!note) return;

  notes = notes.filter(n => n.id !== id);
  deletedNotes.unshift(note);

  renderNotes();
  saveData();
}

// RESTORE NOTE from trash
function restoreNote(id) {
  const note = deletedNotes.find(n => n.id === id);
  if (!note) return;

  deletedNotes = deletedNotes.filter(n => n.id !== id);
  notes.unshift(note);

  renderNotes();
  saveData();
}

// ARCHIVE NOTE
function archiveNote(id) {
  const note = notes.find(n => n.id === id);
  if (!note) return;

  notes = notes.filter(n => n.id !== id);
  archivedNotes.unshift(note);

  renderNotes();
  saveData();
}

// RESTORE FROM ARCHIVE
function unarchiveNote(id) {
  const note = archivedNotes.find(n => n.id === id);
  if (!note) return;

  archivedNotes = archivedNotes.filter(n => n.id !== id);
  notes.unshift(note);

  renderNotes();
  saveData();
}

// SEARCH NOTES
function searchNotes(query) {
  query = query.toLowerCase();

  const list = showTrash
    ? deletedNotes
    : showArchive
    ? archivedNotes
    : notes;

  return list.filter(n =>
    n.title.toLowerCase().includes(query) ||
    n.content.toLowerCase().includes(query) ||
    n.tags.some(t => t.includes(query))
  );
}

if (searchInput) {
  searchInput.addEventListener("input", () => {
    renderNotes();
  });
}

// RENDER NOTES
function renderNotes() {
  noteList.innerHTML = "";

  const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
  const list = query ? searchNotes(query) :
    showTrash ? deletedNotes :
    showArchive ? archivedNotes :
    notes;

  list.forEach(note => {
    const div = document.createElement("div");
    div.classList.add("note-item");

    const cat = categories.find(c => c.id === note.category);
    const catName = cat ? cat.name : note.category;
    const catColor = cat ? cat.color : "#8e8e93";

    const tagsHTML = note.tags.length
      ? `<div class="tag-row">${note.tags.map(t => `<span class="tag">${t}</span>`).join("")}</div>`
      : "";

    div.innerHTML = `
      <h3>${note.title}</h3>
      <p>${note.content}</p>
      ${tagsHTML}
      <div class="note-footer">
        <span class="note-badge" style="background:${catColor}22;color:${catColor};">${catName}</span>
        ${
          showTrash
            ? `<span class="note-restore" style="color:#34c759;">Ripristina</span>`
            : showArchive
            ? `<span class="note-restore" style="color:#ff9500;">Rimuovi archivio</span>`
            : `<span class="note-restore" style="color:#ff3b30;">Elimina</span>
               <span class="note-archive" style="color:#af52de;">Archivia</span>`
        }
      </div>
    `;

    const restoreBtn = div.querySelector(".note-restore");
    const archiveBtn = div.querySelector(".note-archive");

    if (showTrash) {
      restoreBtn.addEventListener("click", () => restoreNote(note.id));
    } else if (showArchive) {
      restoreBtn.addEventListener("click", () => unarchiveNote(note.id));
    } else {
      restoreBtn.addEventListener("click", () => deleteNote(note.id));
      archiveBtn.addEventListener("click", () => archiveNote(note.id));
    }

    noteList.appendChild(div);
  });
}

// RENDER CATEGORIES
function renderCategories() {
  categoryList.innerHTML = "";
  categorySelector.innerHTML = "";

  categories.forEach(cat => {
    const li = document.createElement("li");
    li.classList.add("category-item");
    li.dataset.id = cat.id;

    li.innerHTML = `
      <span class="color-dot" style="background:${cat.color};"></span>
      ${cat.name}
    `;

    li.addEventListener("click", () => filterByCategory(cat.id));

    categoryList.appendChild(li);

    if (cat.id !== "tutte") {
      const opt = document.createElement("option");
      opt.value = cat.id;
      opt.textContent = cat.name;
      categorySelector.appendChild(opt);
    }
  });
}

// FILTER BY CATEGORY
function filterByCategory(catId) {
  if (catId === "tutte") {
    renderNotes();
    return;
  }

  const list = showTrash
    ? deletedNotes
    : showArchive
    ? archivedNotes
    : notes;

  const filtered = list.filter(n => n.category === catId);

  noteList.innerHTML = "";
  filtered.forEach(n => {
    const div = document.createElement("div");
    div.classList.add("note-item");
    div.innerHTML = `<h3>${n.title}</h3><p>${n.content}</p>`;
    noteList.appendChild(div);
  });
}

// ADD CATEGORY
function addCategory() {
  const name = prompt("Nome nuova categoria:");
  if (!name) return;

  const color = prompt("Colore HEX (es: #ff9500):", "#ff9500") || "#ff9500";
  const id = name.toLowerCase().replace(/\s+/g, "_");

  categories.push({ id, name, color });

  renderCategories();
  saveData();
}

addCategoryBtn.addEventListener("click", addCategory);
/* ===========================
   PART 3 — THEME, PALETTE,
   SETTINGS, AUTO THEME
   =========================== */

/* ---------------------------
   TEMA MANUALE (SOLE/LUNA)
   --------------------------- */
function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  const next = current === "light" ? "dark" : "light";

  // Fade premium iOS
  document.documentElement.style.transition =
    "background-color 0.35s ease, color 0.35s ease, filter 0.35s ease";
  document.body.style.transition =
    "background-color 0.35s ease, color 0.35s ease, filter 0.35s ease";

  document.documentElement.setAttribute("data-theme", next);
  themeToggleBtn.textContent = next === "dark" ? "🌙" : "🌞";
  themeSelect.value = next;

  saveSettings();
}

themeToggleBtn.addEventListener("click", toggleTheme);


/* ---------------------------
   TEMA DA SELECT IMPOSTAZIONI
   --------------------------- */
themeSelect.addEventListener("change", e => {
  const theme = e.target.value;

  if (theme === "auto") {
    applyAutoTheme();
    return;
  }

  document.documentElement.setAttribute("data-theme", theme);
  themeToggleBtn.textContent = theme === "dark" ? "🌙" : "🌞";

  saveSettings();
});


/* ---------------------------
   TEMA AUTOMATICO (ORARIO)
   --------------------------- */
function applyAutoTheme() {
  const hour = new Date().getHours();
  const isNight = hour >= 20 || hour < 7;

  const theme = isNight ? "dark" : "light";

  document.documentElement.setAttribute("data-theme", theme);
  themeToggleBtn.textContent = theme === "dark" ? "🌙" : "🌞";

  saveSettings();
}

// Se l’utente ha scelto "auto", aggiorna ogni minuto
setInterval(() => {
  if (themeSelect.value === "auto") applyAutoTheme();
}, 60000);


/* ---------------------------
   TEMA AUTOMATICO (iOS SYSTEM)
   --------------------------- */
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

prefersDark.addEventListener("change", () => {
  if (themeSelect.value === "auto") {
    applyAutoTheme();
  }
});


/* ---------------------------
   PALETTE COLORI AVANZATA
   --------------------------- */

// Palette neon, pastello, scuri
const advancedPalette = [
  "#ff2d55", "#ff3b30", "#ff9500", "#ffcc00",
  "#34c759", "#30d158", "#5ac8fa", "#007aff",
  "#0a84ff", "#af52de", "#bf5af2", "#ff9f0a",
  "#ffd60a", "#64d2ff", "#32ade6", "#8e8e93"
];

function renderAdvancedPalette() {
  const paletteContainer = document.querySelector(".color-palette");

  advancedPalette.forEach(color => {
    const swatch = document.createElement("div");
    swatch.classList.add("color-swatch");
    swatch.style.background = color;
    swatch.dataset.color = color;

    swatch.addEventListener("click", () => {
      document.documentElement.style.setProperty("--accent", color);
      customColorPicker.value = color;

      document.querySelectorAll(".color-swatch")
        .forEach(s => s.classList.remove("selected"));

      swatch.classList.add("selected");

      saveSettings();
    });

    paletteContainer.appendChild(swatch);
  });
}

renderAdvancedPalette();


/* ---------------------------
   COLORE PERSONALIZZATO
   --------------------------- */
customColorPicker.addEventListener("input", e => {
  const color = e.target.value;
  document.documentElement.style.setProperty("--accent", color);
  saveSettings();
});


/* ---------------------------
   POPUP IMPOSTAZIONI
   --------------------------- */
openSettingsBtn.addEventListener("click", () => {
  settingsPopup.classList.remove("hidden");
});

closeSettingsBtn.addEventListener("click", () => {
  settingsPopup.classList.add("hidden");
});
/* ===========================
   PART 4 — BACKUP, RESTORE,
   EXPORT, RESET, POPUPS
   =========================== */

/* ---------------------------
   BACKUP LOCALE
   --------------------------- */
function getBackups() {
  const b = localStorage.getItem(LS_BACKUPS);
  return b ? JSON.parse(b) : [];
}

function saveBackups(backups) {
  localStorage.setItem(LS_BACKUPS, JSON.stringify(backups));
}

function createBackup() {
  const backups = getBackups();

  const data = {
    notes,
    deletedNotes,
    archivedNotes,
    categories,
    settings: JSON.parse(localStorage.getItem(LS_SETTINGS)),
    date: new Date().toLocaleString()
  };

  backups.unshift(data);
  saveBackups(backups);
  renderBackupList();
}

createBackupBtn.addEventListener("click", createBackup);


/* ---------------------------
   RENDER BACKUP LIST
   --------------------------- */
function renderBackupList() {
  backupList.innerHTML = "";

  const backups = getBackups();
  if (backups.length === 0) {
    backupList.innerHTML = "<p>Nessun backup disponibile.</p>";
    return;
  }

  backups.forEach((b, index) => {
    const div = document.createElement("div");
    div.classList.add("backup-item");

    div.innerHTML = `
      <p><strong>Backup ${index + 1}</strong> — ${b.date}</p>
      <button class="primary-btn" data-id="${index}">Ripristina</button>
    `;

    div.querySelector("button").addEventListener("click", () => restoreBackup(index));

    backupList.appendChild(div);
  });
}


/* ---------------------------
   RIPRISTINO BACKUP
   --------------------------- */
function restoreBackup(index) {
  const backups = getBackups();
  const b = backups[index];
  if (!b) return;

  notes = b.notes;
  deletedNotes = b.deletedNotes;
  archivedNotes = b.archivedNotes;
  categories = b.categories;

  localStorage.setItem(LS_SETTINGS, JSON.stringify(b.settings));

  saveData();
  loadData();

  alert("Backup ripristinato con successo.");
}


/* ---------------------------
   IMPORT BACKUP DA FILE
   --------------------------- */
importBackupBtn.addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";

  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const data = JSON.parse(event.target.result);

        notes = data.notes || [];
        deletedNotes = data.deletedNotes || [];
        archivedNotes = data.archivedNotes || [];
        categories = data.categories || [];

        if (data.settings) {
          localStorage.setItem(LS_SETTINGS, JSON.stringify(data.settings));
        }

        saveData();
        loadData();

        alert("Backup importato correttamente.");
      } catch (err) {
        alert("File non valido.");
      }
    };

    reader.readAsText(file);
  };

  input.click();
});


/* ---------------------------
   ESPORTAZIONE DATI
   --------------------------- */
exportDataBtn.addEventListener("click", () => {
  const data = {
    notes,
    deletedNotes,
    archivedNotes,
    categories,
    settings: JSON.parse(localStorage.getItem(LS_SETTINGS))
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = "backup_note_app.json";
  a.click();

  URL.revokeObjectURL(url);
});


/* ---------------------------
   RESET APP
   --------------------------- */
document.getElementById("resetAppBtn").addEventListener("click", () => {
  if (!confirm("Sei sicuro di voler resettare l’app?")) return;

  localStorage.clear();
  location.reload();
});


/* ---------------------------
   POPUP BACKUP
   --------------------------- */
openLifebuoyBtn.addEventListener("click", () => {
  lifebuoyPopup.classList.remove("hidden");
});

closeLifebuoyBtn.addEventListener("click", () => {
  lifebuoyPopup.classList.add("hidden");
});


/* ---------------------------
   POPUP TRASH / ARCHIVE
   --------------------------- */
openTrashBtn.addEventListener("click", () => {
  showTrash = !showTrash;
  showArchive = false;
  renderNotes();
});

if (openArchiveBtn) {
  openArchiveBtn.addEventListener("click", () => {
    showArchive = !showArchive;
    showTrash = false;
    renderNotes();
  });
}
