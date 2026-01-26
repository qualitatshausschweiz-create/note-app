// ELEMENTI BASE
const noteTitle = document.getElementById("noteTitle");
const noteContent = document.getElementById("noteContent");
const categorySelector = document.getElementById("categorySelector");
const noteList = document.getElementById("noteList");
const categoryList = document.getElementById("categoryList");

const themeToggleBtn = document.getElementById("themeToggleBtn");
const openSettingsBtn = document.getElementById("openSettingsBtn");
const openTrashBtn = document.getElementById("openTrashBtn");
const openLifebuoyBtn = document.getElementById("openLifebuoyBtn");

const lifebuoyPopup = document.getElementById("lifebuoyPopup");
const settingsPopup = document.getElementById("settingsPopup");
const closeLifebuoyBtn = document.getElementById("closeLifebuoyBtn");
const closeSettingsBtn = document.getElementById("closeSettingsBtn");

const createBackupBtn = document.getElementById("createBackupBtn");
const importBackupBtn = document.getElementById("importBackupBtn");
const exportDataBtn = document.getElementById("exportDataBtn");
const backupList = document.getElementById("backupList");

const themeSelect = document.getElementById("themeSelect");
const fontSelect = document.getElementById("fontSelect");
const resetAppBtn = document.getElementById("resetAppBtn");
const addCategoryBtn = document.getElementById("addCategoryBtn");

// STATO
let notes = [];
let deletedNotes = [];
let categories = [
  { id: "personale", name: "Personale", color: "#ff9500" },
  { id: "lavoro", name: "Lavoro", color: "#34c759" },
  { id: "idee", name: "Idee", color: "#af52de" },
  { id: "spesa", name: "Spesa", color: "#007aff" },
  { id: "tutte", name: "Tutte", color: "#8e8e93" },
  { id: "altro", name: "Altro", color: "#5ac8fa" }
];

let showTrash = false;
let autoBackupEnabled = false;

// LOCALSTORAGE KEYS
const LS_NOTES = "notes_v1";
const LS_DELETED = "deleted_notes_v1";
const LS_CATEGORIES = "categories_v1";
const LS_SETTINGS = "settings_v1";
const LS_BACKUPS = "backups_v1";
const LS_AUTOBACKUP = "auto_backup_v1";

// INIT
function loadData() {
  const n = localStorage.getItem(LS_NOTES);
  const d = localStorage.getItem(LS_DELETED);
  const c = localStorage.getItem(LS_CATEGORIES);
  const s = localStorage.getItem(LS_SETTINGS);
  const b = localStorage.getItem(LS_BACKUPS);
  const ab = localStorage.getItem(LS_AUTOBACKUP);

  if (n) notes = JSON.parse(n);
  if (d) deletedNotes = JSON.parse(d);
  if (c) categories = JSON.parse(c);

  if (s) {
    const settings = JSON.parse(s);
    if (settings.theme) document.documentElement.setAttribute("data-theme", settings.theme);
    if (settings.font) document.documentElement.style.setProperty("--app-font", settings.font);
    if (settings.accent) document.documentElement.style.setProperty("--accent", settings.accent);
    if (settings.autoBackupEnabled) autoBackupEnabled = true;
    themeSelect.value = settings.theme || "auto";
    fontSelect.value = settings.font || "system-ui";
  }

  if (ab) {
    // ripristino automatico (chiedo conferma)
    if (confirm("Vuoi ripristinare automaticamente l'ultimo backup?")) {
      const data = JSON.parse(ab);
      notes = data.notes || [];
      deletedNotes = data.deletedNotes || [];
      categories = data.categories || categories;
    }
  }

  renderCategories();
  renderNotes();
  renderBackupList();
}

function saveData() {
  localStorage.setItem(LS_NOTES, JSON.stringify(notes));
  localStorage.setItem(LS_DELETED, JSON.stringify(deletedNotes));
  localStorage.setItem(LS_CATEGORIES, JSON.stringify(categories));
  saveSettings();
  if (autoBackupEnabled) saveAutoBackup();
}

function saveSettings() {
  const settings = {
    theme: document.documentElement.getAttribute("data-theme") || "auto",
    font: getComputedStyle(document.documentElement).getPropertyValue("--app-font").trim() || "system-ui",
    accent: getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#007aff",
    autoBackupEnabled
  };
  localStorage.setItem(LS_SETTINGS, JSON.stringify(settings));
}

function saveAutoBackup() {
  const data = { notes, deletedNotes, categories };
  localStorage.setItem(LS_AUTOBACKUP, JSON.stringify(data));
}

// NOTE
function saveNote() {
  const title = noteTitle.value.trim();
  const content = noteContent.value.trim();
  const category = categorySelector.value;

  if (title === "" && content === "") return;

  const newNote = {
    id: Date.now(),
    title: title || "(Senza titolo)",
    content,
    category
  };

  notes.unshift(newNote);
  noteTitle.value = "";
  noteContent.value = "";
  renderNotes();
  saveData();
}

function deleteNote(id) {
  const note = notes.find(n => n.id === id);
  if (!note) return;
  notes = notes.filter(n => n.id !== id);
  deletedNotes.unshift(note);
  renderNotes();
  saveData();
}

function restoreNote(id) {
  const note = deletedNotes.find(n => n.id === id);
  if (!note) return;
  deletedNotes = deletedNotes.filter(n => n.id !== id);
  notes.unshift(note);
  renderNotes();
  saveData();
}

function renderNotes() {
  noteList.innerHTML = "";

  const list = showTrash ? deletedNotes : notes;

  list.forEach(note => {
    const div = document.createElement("div");
    div.classList.add("note-item");

    const cat = categories.find(c => c.id === note.category);
    const catName = cat ? cat.name : note.category;
    const catColor = cat ? cat.color : "#8e8e93";

    div.innerHTML = `
      <h3>${note.title}</h3>
      <p>${note.content}</p>
      <div class="note-footer">
        <span class="note-badge" style="background:${catColor}22;color:${catColor};">${catName}</span>
        ${
          showTrash
            ? `<span class="note-restore">Ripristina</span>`
            : `<span class="note-restore" style="color:#ff3b30;">Elimina</span>`
        }
      </div>
    `;

    const action = div.querySelector(".note-restore");
    if (showTrash) {
      action.addEventListener("click", () => restoreNote(note.id));
    } else {
      action.addEventListener("click", () => deleteNote(note.id));
    }

    noteList.appendChild(div);
  });
}

// CATEGORIE
function renderCategories() {
  categoryList.innerHTML = "";
  categorySelector.innerHTML = "";

  categories.forEach(cat => {
    // lista in basso
    const li = document.createElement("li");
    li.classList.add("category-item");
    li.dataset.id = cat.id;
    li.innerHTML = `<span class="color-dot" style="background:${cat.color};"></span> ${cat.name}`;
    categoryList.appendChild(li);

    // select editor (escludo "tutte")
    if (cat.id !== "tutte") {
      const opt = document.createElement("option");
      opt.value = cat.id;
      opt.textContent = cat.name;
      if (cat.id === "lavoro") opt.selected = true;
      categorySelector.appendChild(opt);
    }
  });
}

function addCategory() {
  const name = prompt("Nome nuova categoria:");
  if (!name) return;
  const color = prompt("Colore HEX (es: #ff9500):", "#ff9500") || "#ff9500";
  const id = name.toLowerCase().replace(/\s+/g, "_");

  categories.push({ id, name, color });
  renderCategories();
  saveData();
}

// BACKUP (locale + “iCloud” via file)
function getBackups() {
  const b = localStorage.getItem(LS_BACKUPS);
  return b ? JSON.parse(b) : [];
}

function renderBackupList() {
  if (!backupList) return;
  backupList.innerHTML = "";
  const backups = getBackups();
  if (backups.length === 0) {
    backupList.innerHTML = "<p>Nessun backup disponibile.</p>";
    return;
  }
  backups.forEach(b => {
    const div = document.createElement("div");
    div.classList.add("backup-item");
    div.innerHTML = `
      <span>${b.date}</span>
      <button class="primary-btn" data-id="${b.id}">Ripristina</button>
    `;
    div.querySelector("button").addEventListener("click", () => restoreBackup(b.id));
    backupList.appendChild(div);
  });
}

function createBackup() {
  const backups = getBackups();
  const backup = {
    id: Date.now(),
    date: new Date().toLocaleString(),
    notes,
    deletedNotes,
    categories
  };
  backups.unshift(backup);
  localStorage.setItem(LS_BACKUPS, JSON.stringify(backups));
  renderBackupList();
  alert("Backup creato in locale.");
}

function restoreBackup(id) {
  const backups = getBackups();
  const backup = backups.find(b => b.id === id);
  if (!backup) return;
  if (!confirm("Ripristinare questo backup?")) return;

  notes = backup.notes || [];
  deletedNotes = backup.deletedNotes || [];
  categories = backup.categories || categories;

  renderCategories();
  renderNotes();
  saveData();
  alert("Backup ripristinato.");
}

// EXPORT/IMPORT (simuliamo iCloud)
function exportData() {
  const data = { notes, deletedNotes, categories };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "note-backup-icloud.json";
  a.click();
  URL.revokeObjectURL(url);
  alert("Backup esportato (puoi salvarlo su iCloud Drive).");
}

function importData() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json";
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data.notes || !data.categories) {
          alert("File non valido.");
          return;
        }
        notes = data.notes || [];
        deletedNotes = data.deletedNotes || [];
        categories = data.categories || categories;
        renderCategories();
        renderNotes();
        saveData();
        alert("Backup importato (da file / iCloud).");
      } catch {
        alert("Errore durante l'importazione.");
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

// TEMA / FONT / ACCENT
function toggleThemeButton() {
  const current = document.documentElement.getAttribute("data-theme") || "auto";
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  themeSelect.value = next;
  themeToggleBtn.textContent = next === "dark" ? "🌙" : "🌞";
  saveSettings();
}

function applyThemeSelect(e) {
  const theme = e.target.value;
  document.documentElement.setAttribute("data-theme", theme);
  themeToggleBtn.textContent = theme === "dark" ? "🌙" : "🌞";
  saveSettings();
}

function applyFontSelect(e) {
  const font = e.target.value;
  document.documentElement.style.setProperty("--app-font", font);
  saveSettings();
}

document.querySelectorAll(".color-swatch").forEach(swatch => {
  swatch.addEventListener("click", () => {
    const color = swatch.dataset.color;
    document.documentElement.style.setProperty("--accent", color);
    document.querySelectorAll(".color-swatch").forEach(s => s.classList.remove("selected"));
    swatch.classList.add("selected");
    saveSettings();
  });
});

// POPUP
function openPopup(p) {
  p.classList.remove("hidden");
}
function closePopup(p) {
  p.classList.add("hidden");
}

// RESET
function resetApp() {
  if (!confirm("Ripristinare completamente l'app? Tutti i dati verranno eliminati.")) return;
  localStorage.clear();
  location.reload();
}

// EVENTI
document.getElementById("saveNoteBtn").addEventListener("click", saveNote);
document.getElementById("cancelEditBtn").addEventListener("click", () => {
  noteTitle.value = "";
  noteContent.value = "";
});

addCategoryBtn.addEventListener("click", addCategory);

openLifebuoyBtn.addEventListener("click", () => openPopup(lifebuoyPopup));
closeLifebuoyBtn.addEventListener("click", () => closePopup(lifebuoyPopup));

openSettingsBtn.addEventListener("click", () => openPopup(settingsPopup));
closeSettingsBtn.addEventListener("click", () => closePopup(settingsPopup));

themeToggleBtn.addEventListener("click", toggleThemeButton);
themeSelect.addEventListener("change", applyThemeSelect);
fontSelect.addEventListener("change", applyFontSelect);

resetAppBtn.addEventListener("click", resetApp);

createBackupBtn.addEventListener("click", createBackup);
exportDataBtn.addEventListener("click", exportData);
importBackupBtn.addEventListener("click", importData);

openTrashBtn.addEventListener("click", () => {
  showTrash = !showTrash;
  openTrashBtn.textContent = showTrash ? "🗂️" : "🗑️";
  renderNotes();
});

// AUTO BACKUP TOGGLE (in impostazioni, semplice conferma)
settingsPopup.addEventListener("click", (e) => {
  if (e.target.id === "settingsPopup") return;
});

document.addEventListener("keydown", (e) => {
  if (e.key === "b" && e.altKey) {
    autoBackupEnabled = !autoBackupEnabled;
    alert("Backup automatico " + (autoBackupEnabled ? "attivato" : "disattivato"));
    saveSettings();
  }
});

// AVVIO
loadData();
