// ===============================
// COSTANTI STORAGE
// ===============================
const STORAGE_NOTES = "notes_v2";
const STORAGE_TRASH = "trash_notes_v2";
const STORAGE_BACKUP = "notes_backup_v2";
const STORAGE_SETTINGS = "notes_settings_v2";

// ===============================
// STATO
// ===============================
let notes = JSON.parse(localStorage.getItem(STORAGE_NOTES) || "[]");
let trashNotes = JSON.parse(localStorage.getItem(STORAGE_TRASH) || "[]");
let editingId = null;
let currentCategoryFilter = "all";
let currentView = "notes"; // "notes" | "trash"

let settings = {
  theme: "light",
  privacy: false,
  font: "system",
  textSize: 16,
  animations: true,
  animationSpeed: "normal",
  transparency: false,
  sortMode: "updated_desc",
  autoBackup: false,
  autoRestore: false
};

let backupData = JSON.parse(localStorage.getItem(STORAGE_BACKUP) || "null");

// ===============================
// CARICA SETTINGS
// ===============================
function loadSettings() {
  const saved = localStorage.getItem(STORAGE_SETTINGS);
  if (saved) {
    try {
      const obj = JSON.parse(saved);
      settings = { ...settings, ...obj };
    } catch (e) {}
  }
  applySettingsToUI();
  applySettingsToDOM();
}

function saveSettings() {
  localStorage.setItem(STORAGE_SETTINGS, JSON.stringify(settings));
}

// ===============================
// APPLICA SETTINGS AL DOM
// ===============================
function applySettingsToDOM() {
  const body = document.body;

  // Tema
  body.setAttribute("data-theme", settings.theme);

  // Privacy
  if (settings.privacy) body.classList.add("privacy-on");
  else body.classList.remove("privacy-on");

  // Font
  body.classList.remove("font-serif", "font-mono");
  if (settings.font === "serif") body.classList.add("font-serif");
  if (settings.font === "mono") body.classList.add("font-mono");

  // Dimensione testo
  document.documentElement.style.setProperty("--note-font-size", settings.textSize + "px");

  // Animazioni
  if (!settings.animations) body.classList.add("no-animations");
  else body.classList.remove("no-animations");

  // Velocità animazioni
  let speed = "0.25s";
  if (settings.animationSpeed === "fast") speed = "0.15s";
  if (settings.animationSpeed === "slow") speed = "0.4s";
  document.documentElement.style.setProperty("--transition-speed", speed);

  // Trasparenze
  if (settings.transparency) body.classList.add("transparency-on");
  else body.classList.remove("transparency-on");
}

// ===============================
// APPLICA SETTINGS ALLA UI
// ===============================
function applySettingsToUI() {
  // Tema bottone
  const themeBtn = document.getElementById("theme-toggle-btn");
  themeBtn.textContent = settings.theme === "light" ? "🌞" : "🌙";

  // Privacy
  document.getElementById("privacy-toggle").checked = settings.privacy;

  // Font
  const fontSelect = document.getElementById("font-select");
  fontSelect.value = settings.font;

  // Text size
  document.getElementById("text-size-range").value = settings.textSize;

  // Animazioni
  document.getElementById("animations-toggle").checked = settings.animations;

  // Velocità
  document.getElementById("animation-speed-select").value = settings.animationSpeed;

  // Trasparenze
  document.getElementById("transparency-toggle").checked = settings.transparency;

  // Ordina
  document.getElementById("sort-notes-select").value = settings.sortMode;

  // Backup auto
  const autoBackupBtn = document.getElementById("toggle-auto-backup-btn");
  autoBackupBtn.textContent = "Backup automatico: " + (settings.autoBackup ? "ON" : "OFF");

  const autoRestoreBtn = document.getElementById("toggle-auto-restore-btn");
  autoRestoreBtn.textContent = "Ripristino automatico: " + (settings.autoRestore ? "ON" : "OFF");
}

// ===============================
// SALVA NOTE
// ===============================
function persistNotes() {
  localStorage.setItem(STORAGE_NOTES, JSON.stringify(notes));
  localStorage.setItem(STORAGE_TRASH, JSON.stringify(trashNotes));
  if (settings.autoBackup) {
    quickBackup(false);
  }
}

// ===============================
// RENDER NOTE
// ===============================
function renderNotes() {
  const container = document.getElementById("notes-container");
  container.innerHTML = "";

  let list = currentView === "notes" ? notes : trashNotes;

  // filtro categoria solo in vista note
  if (currentView === "notes" && currentCategoryFilter !== "all") {
    list = list.filter(n => n.category === currentCategoryFilter);
  }

  // ordinamento
  list = [...list];
  list.sort((a, b) => {
    if (settings.sortMode === "updated_desc") {
      return (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt);
    }
    if (settings.sortMode === "updated_asc") {
      return (a.updatedAt || a.createdAt) - (b.updatedAt || b.createdAt);
    }
    if (settings.sortMode === "title_asc") {
      return (a.title || "").localeCompare(b.title || "");
    }
    return 0;
  });

  if (list.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-text";
    empty.textContent =
      currentView === "notes"
        ? "Nessuna nota in questa categoria."
        : "Il cestino è vuoto.";
    container.appendChild(empty);
    return;
  }

  list.forEach(note => {
    const card = document.createElement("div");
    card.className = "note-card";
    card.style.backgroundColor = note.color || "#fff9c4";

    const title = document.createElement("h3");
    title.className = "note-title";
    title.textContent = note.title || "Senza titolo";

    const text = document.createElement("p");
    text.className = "note-body";
    text.textContent = note.text || "";

    const meta = document.createElement("div");
    meta.className = "note-meta";
    meta.textContent = formatDate(note.updatedAt || note.createdAt);

    const actions = document.createElement("div");
    actions.className = "note-actions";

    const trashBtn = document.createElement("button");
    trashBtn.className = "note-action-btn trash";
    trashBtn.textContent = "🗑️";

    const restoreBtn = document.createElement("button");
    restoreBtn.className = "note-action-btn restore";
    restoreBtn.textContent = "♻️";

    if (currentView === "notes") {
      // in vista note: cestino = sposta nel cestino, ripristina disabilitato
      trashBtn.onclick = (e) => {
        e.stopPropagation();
        moveNoteToTrash(note.id);
      };
      restoreBtn.style.opacity = 0.3;
      restoreBtn.style.pointerEvents = "none";
    } else {
      // in cestino: cestino = elimina definitivamente, ripristina = torna tra le note
      trashBtn.onclick = (e) => {
        e.stopPropagation();
        deleteNoteForever(note.id);
      };
      restoreBtn.onclick = (e) => {
        e.stopPropagation();
        restoreNoteFromTrash(note.id);
      };
    }

    actions.appendChild(trashBtn);
    actions.appendChild(restoreBtn);

    card.appendChild(title);
    card.appendChild(text);
    card.appendChild(meta);
    card.appendChild(actions);

    if (currentView === "notes") {
      card.onclick = () => openEditor(note.id);
    }

    container.appendChild(card);
  });
}

function formatDate(ts) {
  const d = new Date(ts);
  return d.toLocaleString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

// ===============================
// EDITOR
// ===============================
const editor = document.getElementById("note-editor");
const noteTitleInput = document.getElementById("note-title");
const noteTextInput = document.getElementById("note-text");
const noteCategorySelect = document.getElementById("note-category");
const noteColorInput = document.getElementById("note-color");

function openEditor(id = null) {
  if (currentView === "trash") return; // niente editing nel cestino
  editingId = id;

  if (id === null) {
    noteTitleInput.value = "";
    noteTextInput.value = "";
    noteCategorySelect.value = "home";
    noteColorInput.value = "#fff9c4";
  } else {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    noteTitleInput.value = note.title || "";
    noteTextInput.value = note.text || "";
    noteCategorySelect.value = note.category || "home";
    noteColorInput.value = note.color || "#fff9c4";
  }

  editor.classList.remove("hidden");
}

function closeEditor() {
  editor.classList.add("hidden");
  editingId = null;
}

function saveNote() {
  const title = noteTitleInput.value.trim();
  const text = noteTextInput.value.trim();
  const category = noteCategorySelect.value;
  const color = noteColorInput.value || "#fff9c4";
  const now = Date.now();

  if (!text && !title) {
    closeEditor();
    return;
  }

  if (editingId === null) {
    const newNote = {
      id: Date.now(),
      title,
      text,
      category,
      color,
      createdAt: now,
      updatedAt: now
    };
    notes.unshift(newNote);
  } else {
    const idx = notes.findIndex(n => n.id === editingId);
    if (idx !== -1) {
      notes[idx].title = title;
      notes[idx].text = text;
      notes[idx].category = category;
      notes[idx].color = color;
      notes[idx].updatedAt = now;
    }
  }

  persistNotes();
  renderNotes();
  closeEditor();
}

function deleteCurrentNote() {
  if (editingId === null) {
    closeEditor();
    return;
  }
  moveNoteToTrash(editingId);
  closeEditor();
}

// ===============================
// CESTINO
// ===============================
function moveNoteToTrash(id) {
  const idx = notes.findIndex(n => n.id === id);
  if (idx === -1) return;
  const [note] = notes.splice(idx, 1);
  trashNotes.unshift(note);
  persistNotes();
  renderNotes();
}

function restoreNoteFromTrash(id) {
  const idx = trashNotes.findIndex(n => n.id === id);
  if (idx === -1) return;
  const [note] = trashNotes.splice(idx, 1);
  notes.unshift(note);
  persistNotes();
  renderNotes();
}

function deleteNoteForever(id) {
  trashNotes = trashNotes.filter(n => n.id !== id);
  persistNotes();
  renderNotes();
}

// ===============================
// CATEGORIE
// ===============================
document.querySelectorAll(".category-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    if (currentView === "trash") return;
    document.querySelectorAll(".category-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentCategoryFilter = btn.dataset.category;
    renderNotes();
  });
});

// ===============================
// BACKUP
// ===============================
const backupPanel = document.getElementById("backup-panel");

document.getElementById("backup-btn").onclick = () => {
  backupPanel.classList.remove("hidden");
};

document.getElementById("close-backup-panel").onclick = () => {
  backupPanel.classList.add("hidden");
};

function quickBackup(showAlert = true) {
  const payload = {
    notes,
    trashNotes,
    timestamp: Date.now()
  };
  backupData = payload;
  localStorage.setItem(STORAGE_BACKUP, JSON.stringify(payload));
  if (showAlert) alert("Backup veloce eseguito.");
}

document.getElementById("quick-backup-btn").onclick = () => {
  quickBackup(true);
};

document.getElementById("manual-backup-btn").onclick = () => {
  quickBackup(true);
};

document.getElementById("manual-restore-btn").onclick = () => {
  if (!backupData) {
    alert("Nessun backup trovato.");
    return;
  }
  notes = backupData.notes || [];
  trashNotes = backupData.trashNotes || [];
  persistNotes();
  renderNotes();
  alert("Backup ripristinato.");
};

document.getElementById("toggle-auto-backup-btn").onclick = () => {
  settings.autoBackup = !settings.autoBackup;
  saveSettings();
  applySettingsToUI();
};

document.getElementById("toggle-auto-restore-btn").onclick = () => {
  settings.autoRestore = !settings.autoRestore;
  saveSettings();
  applySettingsToUI();
};

document.getElementById("export-notes-btn").onclick = () => {
  let content = "";
  notes.forEach(n => {
    content += `Titolo: ${n.title || "Senza titolo"}\n`;
    content += `Categoria: ${n.category}\n`;
    content += `Data: ${formatDate(n.updatedAt || n.createdAt)}\n`;
    content += `${n.text || ""}\n`;
    content += `-----------------------------\n\n`;
  });
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "note.txt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

document.getElementById("clear-backups-btn").onclick = () => {
  backupData = null;
  localStorage.removeItem(STORAGE_BACKUP);
  alert("Backup eliminato.");
};

// Ripristino automatico all'avvio se attivo
function autoRestoreIfNeeded() {
  if (!settings.autoRestore) return;
  if (notes.length === 0 && backupData && backupData.notes && backupData.notes.length > 0) {
    notes = backupData.notes;
    trashNotes = backupData.trashNotes || [];
    persistNotes();
  }
}

// ===============================
// IMPOSTAZIONI
// ===============================
const settingsPanel = document.getElementById("settings-panel");

document.getElementById("settings-btn").onclick = () => {
  settingsPanel.classList.remove("hidden");
};

document.getElementById("close-settings-panel").onclick = () => {
  settingsPanel.classList.add("hidden");
};

document.getElementById("privacy-toggle").onchange = (e) => {
  settings.privacy = e.target.checked;
  saveSettings();
  applySettingsToDOM();
};

document.getElementById("font-select").onchange = (e) => {
  settings.font = e.target.value;
  saveSettings();
  applySettingsToDOM();
};

document.getElementById("text-size-range").oninput = (e) => {
  settings.textSize = parseInt(e.target.value, 10);
  saveSettings();
  applySettingsToDOM();
};

document.getElementById("animations-toggle").onchange = (e) => {
  settings.animations = e.target.checked;
  saveSettings();
  applySettingsToDOM();
};

document.getElementById("animation-speed-select").onchange = (e) => {
  settings.animationSpeed = e.target.value;
  saveSettings();
  applySettingsToDOM();
};

document.getElementById("transparency-toggle").onchange = (e) => {
  settings.transparency = e.target.checked;
  saveSettings();
  applySettingsToDOM();
};

document.getElementById("sort-notes-select").onchange = (e) => {
  settings.sortMode = e.target.value;
  saveSettings();
  renderNotes();
};

document.getElementById("open-trash-view-btn").onclick = () => {
  currentView = "trash";
  settingsPanel.classList.add("hidden");
  renderNotes();
};

// Ripristina layout
document.getElementById("reset-layout-btn").onclick = () => {
  settings.font = "system";
  settings.textSize = 16;
  settings.animations = true;
  settings.animationSpeed = "normal";
  settings.transparency = false;
  settings.privacy = false;
  settings.sortMode = "updated_desc";
  saveSettings();
  applySettingsToUI();
  applySettingsToDOM();
  renderNotes();
};

// Cancella tutte le note
document.getElementById("delete-all-notes-btn").onclick = () => {
  if (!confirm("Sei sicuro di voler cancellare tutte le note?")) return;
  notes = [];
  trashNotes = [];
  persistNotes();
  renderNotes();
};

// Reset totale app
document.getElementById("full-reset-btn").onclick = () => {
  if (!confirm("Reset totale app? Verrà cancellato tutto.")) return;
  localStorage.removeItem(STORAGE_NOTES);
  localStorage.removeItem(STORAGE_TRASH);
  localStorage.removeItem(STORAGE_BACKUP);
  localStorage.removeItem(STORAGE_SETTINGS);
  location.reload();
};

// ===============================
// TEMA SOLE/LUNA
// ===============================
document.getElementById("theme-toggle-btn").onclick = () => {
  settings.theme = settings.theme === "light" ? "dark" : "light";
  saveSettings();
  applySettingsToUI();
  applySettingsToDOM();
};

// ===============================
// BOTTONI EDITOR
// ===============================
document.getElementById("add-note-btn").onclick = () => {
  currentView = "notes";
  renderNotes();
  openEditor(null);
};
document.getElementById("close-editor-btn").onclick = closeEditor;
document.getElementById("save-note-btn").onclick = saveNote;
document.getElementById("delete-note-btn").onclick = deleteCurrentNote;

// ===============================
// AVVIO
// ===============================
loadSettings();
autoRestoreIfNeeded();
renderNotes();
