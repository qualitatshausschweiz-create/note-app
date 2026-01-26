// =========================
// STRUTTURA DATI PRINCIPALE
// =========================

let state = {
  theme: "light",
  categories: [],
  notes: [],
  trash: [],
  selectedNoteId: null,
  selectedCategoryId: null,
  autoBackupEnabled: true,
  backups: [] // lista backup automatici (illimitata)
};

const STORAGE_KEY = "sandro_notes_app_state_v1";
const BACKUP_STORAGE_KEY = "sandro_notes_app_backups_v1";

// =========================
// FUNZIONI DI STORAGE
// =========================

function saveStateToLocalStorage() {
  const data = {
    theme: state.theme,
    categories: state.categories,
    notes: state.notes,
    trash: state.trash,
    autoBackupEnabled: state.autoBackupEnabled
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadStateFromLocalStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    initDefaultState();
    return;
  }
  try {
    const data = JSON.parse(raw);
    state.theme = data.theme || "light";
    state.categories = data.categories || [];
    state.notes = data.notes || [];
    state.trash = data.trash || [];
    state.autoBackupEnabled =
      typeof data.autoBackupEnabled === "boolean"
        ? data.autoBackupEnabled
        : true;
  } catch (e) {
    console.error("Errore nel parsing dello stato:", e);
    initDefaultState();
  }
}

function saveBackupsToLocalStorage() {
  localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(state.backups));
}

function loadBackupsFromLocalStorage() {
  const raw = localStorage.getItem(BACKUP_STORAGE_KEY);
  if (!raw) {
    state.backups = [];
    return;
  }
  try {
    state.backups = JSON.parse(raw) || [];
  } catch (e) {
    console.error("Errore nel parsing dei backup:", e);
    state.backups = [];
  }
}

// =========================
// STATO DI DEFAULT
// =========================

function initDefaultState() {
  state.theme = "light";
  state.categories = [
    { id: "cat-1", name: "Personale", color: "#f97316" },
    { id: "cat-2", name: "Lavoro", color: "#22c55e" },
    { id: "cat-3", name: "Idee", color: "#a855f7" }
  ];
  state.notes = [];
  state.trash = [];
  state.selectedNoteId = null;
  state.selectedCategoryId = state.categories[0].id;
  state.autoBackupEnabled = true;
}

// =========================
// UTILITY
// =========================

function generateId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function formatDateTime(ts) {
  const d = new Date(ts);
  const date = d.toLocaleDateString("it-CH", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  const time = d.toLocaleTimeString("it-CH", {
    hour: "2-digit",
    minute: "2-digit"
  });
  return `${date} ${time}`;
}

// =========================
// RENDERING UI
// =========================

function renderTheme() {
  const body = document.body;
  if (state.theme === "dark") {
    body.classList.add("dark-theme");
  } else {
    body.classList.remove("dark-theme");
  }

  const themeToggle = document.getElementById("themeToggle");
  const settingsThemeToggle = document.getElementById("settingsThemeToggle");
  if (state.theme === "dark") {
    themeToggle.textContent = "🌙";
    if (settingsThemeToggle) {
      settingsThemeToggle.textContent = "Passa a tema chiaro";
    }
  } else {
    themeToggle.textContent = "🌞";
    if (settingsThemeToggle) {
      settingsThemeToggle.textContent = "Passa a tema scuro";
    }
  }
}

function renderCategories() {
  const categoryList = document.getElementById("categoryList");
  const noteCategorySelect = document.getElementById("noteCategorySelect");
  const settingsCategoryList = document.getElementById(
    "settingsCategoryList"
  );

  categoryList.innerHTML = "";
  noteCategorySelect.innerHTML = "";
  settingsCategoryList.innerHTML = "";

  state.categories.forEach((cat) => {
    // Sidebar
    const li = document.createElement("li");
    li.className = "category-item";
    if (state.selectedCategoryId === cat.id) {
      li.classList.add("active");
    }
    li.dataset.id = cat.id;

    const dot = document.createElement("div");
    dot.className = "category-color-dot";
    dot.style.backgroundColor = cat.color;

    const nameSpan = document.createElement("span");
    nameSpan.className = "category-name";
    nameSpan.textContent = cat.name;

    li.appendChild(dot);
    li.appendChild(nameSpan);
    li.addEventListener("click", () => {
      state.selectedCategoryId = cat.id;
      renderCategories();
      renderNotesList();
    });

    categoryList.appendChild(li);

    // Select categoria
    const opt = document.createElement("option");
    opt.value = cat.id;
    opt.textContent = cat.name;
    noteCategorySelect.appendChild(opt);

    // Settings categoria
    const settingsItem = document.createElement("li");
    settingsItem.className = "settings-category-item";

    const settingsName = document.createElement("span");
    settingsName.className = "settings-category-name";
    settingsName.textContent = cat.name;

    const colorInput = document.createElement("input");
    colorInput.type = "color";
    colorInput.value = cat.color;
    colorInput.className = "settings-category-color-input";
    colorInput.addEventListener("input", (e) => {
      cat.color = e.target.value;
      saveStateToLocalStorage();
      renderCategories();
      renderNotesList();
    });

    settingsItem.appendChild(settingsName);
    settingsItem.appendChild(colorInput);
    settingsCategoryList.appendChild(settingsItem);
  });

  // Se non c'è categoria selezionata, seleziona la prima
  if (!state.selectedCategoryId && state.categories.length > 0) {
    state.selectedCategoryId = state.categories[0].id;
  }
  if (state.selectedCategoryId) {
    noteCategorySelect.value = state.selectedCategoryId;
  }
}

function renderNotesList() {
  const notesList = document.getElementById("notesList");
  notesList.innerHTML = "";

  const filteredNotes = state.selectedCategoryId
    ? state.notes.filter((n) => n.categoryId === state.selectedCategoryId)
    : state.notes;

  filteredNotes
    .slice()
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .forEach((note) => {
      const li = document.createElement("li");
      li.className = "note-item";
      li.dataset.id = note.id;

      const header = document.createElement("div");
      header.className = "note-item-header";

      const titleSpan = document.createElement("span");
      titleSpan.className = "note-item-title";
      titleSpan.textContent = note.title || "(Senza titolo)";

      const cat = state.categories.find((c) => c.id === note.categoryId);
      const catSpan = document.createElement("span");
      catSpan.className = "note-item-category";
      catSpan.textContent = cat ? cat.name : "Senza categoria";
      if (cat) {
        catSpan.style.backgroundColor = cat.color + "33";
      }

      header.appendChild(titleSpan);
      header.appendChild(catSpan);

      const contentDiv = document.createElement("div");
      contentDiv.className = "note-item-content";
      contentDiv.textContent =
        note.content.length > 160
          ? note.content.slice(0, 160) + "..."
          : note.content;

      li.appendChild(header);
      li.appendChild(contentDiv);

      li.addEventListener("click", () => {
        loadNoteIntoEditor(note.id);
      });

      notesList.appendChild(li);
    });
}

function renderTrashList() {
  const trashList = document.getElementById("trashList");
  trashList.innerHTML = "";

  state.trash
    .slice()
    .sort((a, b) => b.deletedAt - a.deletedAt)
    .forEach((note) => {
      const li = document.createElement("li");
      li.className = "note-item";

      const header = document.createElement("div");
      header.className = "note-item-header";

      const titleSpan = document.createElement("span");
      titleSpan.className = "note-item-title";
      titleSpan.textContent = note.title || "(Senza titolo)";

      const restoreButton = document.createElement("button");
      restoreButton.className = "primary-button";
      restoreButton.textContent = "Ripristina";
      restoreButton.style.padding = "4px 10px";
      restoreButton.addEventListener("click", (e) => {
        e.stopPropagation();
        restoreNoteFromTrash(note.id);
      });

      header.appendChild(titleSpan);
      header.appendChild(restoreButton);

      const contentDiv = document.createElement("div");
      contentDiv.className = "note-item-content";
      contentDiv.textContent =
        note.content.length > 160
          ? note.content.slice(0, 160) + "..."
          : note.content;

      li.appendChild(header);
      li.appendChild(contentDiv);

      trashList.appendChild(li);
    });
}

function renderSettings() {
  const autoBackupToggle = document.getElementById("autoBackupToggle");
  autoBackupToggle.checked = state.autoBackupEnabled;
}

function renderBackupList() {
  const backupList = document.getElementById("backupList");
  backupList.innerHTML = "";

  if (!state.backups.length) {
    const li = document.createElement("li");
    li.textContent = "Nessun backup automatico disponibile.";
    li.style.opacity = "0.7";
    backupList.appendChild(li);
    return;
  }

  state.backups
    .slice()
    .sort((a, b) => b.timestamp - a.timestamp)
    .forEach((backup) => {
      const li = document.createElement("li");
      li.className = "backup-item";

      const infoSpan = document.createElement("span");
      infoSpan.textContent = formatDateTime(backup.timestamp);

      const restoreBtn = document.createElement("button");
      restoreBtn.className = "secondary-button";
      restoreBtn.textContent = "Ripristina";
      restoreBtn.style.fontSize = "0.75rem";
      restoreBtn.style.padding = "4px 8px";

      restoreBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        restoreFromBackupObject(backup.data);
      });

      li.appendChild(infoSpan);
      li.appendChild(restoreBtn);
      backupList.appendChild(li);
    });
}

// =========================
// NOTE: CREAZIONE, MODIFICA, ELIMINAZIONE
// =========================

function loadNoteIntoEditor(noteId) {
  const note = state.notes.find((n) => n.id === noteId);
  if (!note) return;

  state.selectedNoteId = noteId;

  const titleInput = document.getElementById("noteTitleInput");
  const contentInput = document.getElementById("noteContentInput");
  const categorySelect = document.getElementById("noteCategorySelect");

  titleInput.value = note.title;
  contentInput.value = note.content;
  categorySelect.value = note.categoryId;
}

function clearNoteEditor() {
  state.selectedNoteId = null;
  document.getElementById("noteTitleInput").value = "";
  document.getElementById("noteContentInput").value = "";
}

function saveNoteFromEditor() {
  const titleInput = document.getElementById("noteTitleInput");
  const contentInput = document.getElementById("noteContentInput");
  const categorySelect = document.getElementById("noteCategorySelect");

  const title = titleInput.value.trim();
  const content = contentInput.value.trim();
  const categoryId = categorySelect.value;

  if (!content && !title) {
    return;
  }

  const now = Date.now();

  if (state.selectedNoteId) {
    const note = state.notes.find((n) => n.id === state.selectedNoteId);
    if (note) {
      note.title = title;
      note.content = content;
      note.categoryId = categoryId;
      note.updatedAt = now;
    }
  } else {
    const newNote = {
      id: generateId("note"),
      title,
      content,
      categoryId,
      createdAt: now,
      updatedAt: now
    };
    state.notes.push(newNote);
    state.selectedNoteId = newNote.id;
  }

  saveStateToLocalStorage();
  if (state.autoBackupEnabled) {
    createAutomaticBackup();
  }
  renderNotesList();
}

function deleteCurrentNote() {
  if (!state.selectedNoteId) return;
  const idx = state.notes.findIndex((n) => n.id === state.selectedNoteId);
  if (idx === -1) return;

  const note = state.notes[idx];
  state.notes.splice(idx, 1);

  const deletedNote = { ...note, deletedAt: Date.now() };
  state.trash.push(deletedNote);

  state.selectedNoteId = null;
  clearNoteEditor();
  saveStateToLocalStorage();
  if (state.autoBackupEnabled) {
    createAutomaticBackup();
  }
  renderNotesList();
  renderTrashList();
}

function restoreNoteFromTrash(noteId) {
  const idx = state.trash.findIndex((n) => n.id === noteId);
  if (idx === -1) return;

  const note = state.trash[idx];
  state.trash.splice(idx, 1);

  delete note.deletedAt;
  note.updatedAt = Date.now();
  state.notes.push(note);

  saveStateToLocalStorage();
  if (state.autoBackupEnabled) {
    createAutomaticBackup();
  }
  renderNotesList();
  renderTrashList();
}

// =========================
// CATEGORIE
// =========================

function addNewCategory() {
  const name = prompt("Nome della nuova categoria:");
  if (!name) return;

  const color = "#3b82f6";
  const newCat = {
    id: generateId("cat"),
    name: name.trim(),
    color
  };
  state.categories.push(newCat);
  state.selectedCategoryId = newCat.id;
  saveStateToLocalStorage();
  renderCategories();
  renderNotesList();
}

// =========================
// BACKUP & RIPRISTINO
// =========================

function getCurrentStateForBackup() {
  return {
    theme: state.theme,
    categories: state.categories,
    notes: state.notes,
    trash: state.trash,
    autoBackupEnabled: state.autoBackupEnabled
  };
}

function applyStateFromBackup(data) {
  state.theme = data.theme || "light";
  state.categories = data.categories || [];
  state.notes = data.notes || [];
  state.trash = data.trash || [];
  state.autoBackupEnabled =
    typeof data.autoBackupEnabled === "boolean"
      ? data.autoBackupEnabled
      : true;
  state.selectedNoteId = null;
  if (state.categories.length) {
    state.selectedCategoryId = state.categories[0].id;
  } else {
    state.selectedCategoryId = null;
  }
  saveStateToLocalStorage();
  renderTheme();
  renderCategories();
  renderNotesList();
  renderTrashList();
  renderSettings();
  renderBackupList();
}

function createManualBackupFile() {
  const data = getCurrentStateForBackup();
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const ts = formatDateTime(Date.now()).replace(/[^\d]/g, "");
  a.href = url;
  a.download = `note_backup_${ts}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function createAutomaticBackup() {
  const data = getCurrentStateForBackup();
  const backup = {
    id: generateId("backup"),
    timestamp: Date.now(),
    data
  };
  state.backups.push(backup);
  saveBackupsToLocalStorage();
  renderBackupList();
}

function restoreFromBackupObject(data) {
  if (!data) return;
  applyStateFromBackup(data);
}

function restoreFromLatestBackup() {
  if (!state.backups.length) return;
  const latest = state.backups.reduce((acc, b) =>
    !acc || b.timestamp > acc.timestamp ? b : acc
  );
  if (latest && latest.data) {
    applyStateFromBackup(latest.data);
  }
}

function handleManualRestoreFromFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      applyStateFromBackup(data);
    } catch (err) {
      console.error("Errore nel ripristino da file:", err);
      alert("File di backup non valido.");
    }
  };
  reader.readAsText(file);
}

// =========================
// POPUP SALVAGENTE
// =========================

function openLifebuoyPopup() {
  const overlay = document.getElementById("lifebuoyOverlay");
  overlay.classList.remove("hidden");
  renderBackupList();
}

function closeLifebuoyPopup() {
  const overlay = document.getElementById("lifebuoyOverlay");
  overlay.classList.add("hidden");
}

// =========================
// OVERLAY PAGINE (CESTINO, IMPOSTAZIONI)
// =========================

function openTrashPage() {
  renderTrashList();
  document.getElementById("trashPage").classList.remove("hidden");
}

function closeTrashPage() {
  document.getElementById("trashPage").classList.add("hidden");
}

function openSettingsPage() {
  renderSettings();
  document.getElementById("settingsPage").classList.remove("hidden");
}

function closeSettingsPage() {
  document.getElementById("settingsPage").classList.add("hidden");
}

// =========================
// EVENT LISTENERS
// =========================

function setupEventListeners() {
  // Tema
  document.getElementById("themeToggle").addEventListener("click", () => {
    state.theme = state.theme === "light" ? "dark" : "light";
    saveStateToLocalStorage();
    renderTheme();
  });

  document
    .getElementById("settingsThemeToggle")
    .addEventListener("click", () => {
      state.theme = state.theme === "light" ? "dark" : "light";
      saveStateToLocalStorage();
      renderTheme();
    });

  // Categorie
  document
    .getElementById("addCategoryButton")
    .addEventListener("click", addNewCategory);

  // Note
  document
    .getElementById("saveNoteButton")
    .addEventListener("click", () => {
      saveNoteFromEditor();
    });

  document
    .getElementById("deleteNoteButton")
    .addEventListener("click", () => {
      deleteCurrentNote();
    });

  // Cestino
  document
    .getElementById("trashPageButton")
    .addEventListener("click", openTrashPage);
  document
    .getElementById("closeTrashPage")
    .addEventListener("click", closeTrashPage);

  // Impostazioni
  document
    .getElementById("settingsButton")
    .addEventListener("click", openSettingsPage);
  document
    .getElementById("closeSettingsPage")
    .addEventListener("click", closeSettingsPage);

  document
    .getElementById("autoBackupToggle")
    .addEventListener("change", (e) => {
      state.autoBackupEnabled = e.target.checked;
      saveStateToLocalStorage();
    });

  // Salvagente
  document
    .getElementById("lifebuoyButton")
    .addEventListener("click", openLifebuoyPopup);
  document
    .getElementById("closeLifebuoyButton")
    .addEventListener("click", closeLifebuoyPopup);

  // Chiudi popup cliccando fuori
  document
    .getElementById("lifebuoyBackdrop")
    .addEventListener("click", closeLifebuoyPopup);

  // Backup manuale
  document
    .getElementById("manualBackupButton")
    .addEventListener("click", () => {
      createManualBackupFile();
    });

  // Backup automatico ora
  document
    .getElementById("autoBackupNowButton")
    .addEventListener("click", () => {
      createAutomaticBackup();
    });

  // Ripristino manuale da file
  document
    .getElementById("manualRestoreFileButton")
    .addEventListener("click", () => {
      const input = document.getElementById("restoreFileInput");
      input.value = "";
      input.click();
    });

  document
    .getElementById("restoreFileInput")
    .addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        handleManualRestoreFromFile(file);
      }
    });

  // Ripristino da lista backup
  document
    .getElementById("manualRestoreListButton")
    .addEventListener("click", () => {
      // Già gestito cliccando sui singoli elementi della lista
      alert(
        "Seleziona un backup dalla lista qui sotto per ripristinare quella versione."
      );
    });

  // Ripristino automatico ultimo backup
  document
    .getElementById("autoRestoreButton")
    .addEventListener("click", () => {
      if (!state.backups.length) {
        alert("Nessun backup automatico disponibile.");
        return;
      }
      restoreFromLatestBackup();
    });
}

// =========================
// INIZIALIZZAZIONE
// =========================

function init() {
  loadStateFromLocalStorage();
  loadBackupsFromLocalStorage();

  // Se non ci sono categorie (caso di reset), inizializza default
  if (!state.categories || !state.categories.length) {
    initDefaultState();
  }

  renderTheme();
  renderCategories();
  renderNotesList();
  renderTrashList();
  renderSettings();
  renderBackupList();
  setupEventListeners();

  // Ripristino automatico all'avvio (se vuoi che sia davvero automatico)
  // Se non vuoi che ripristini da solo, commenta le due righe sotto:
  if (state.backups.length) {
    // Non ripristino automaticamente senza consenso, ma potresti abilitarlo qui.
    // restoreFromLatestBackup();
  }
}

document.addEventListener("DOMContentLoaded", init);
