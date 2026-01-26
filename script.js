// ================== VARIABILI GLOBALI ==================
let notes = JSON.parse(localStorage.getItem("notes") || "[]");
let editingId = null;
let currentCategoryFilter = "all";
let selectedColor = "#ffffff";

// ================== TRADUZIONI ==================
const translations = {
  it: {
    notesTitle: "Le tue note",
    enterPin: "Inserisci PIN",
    rememberPin: "Memorizza PIN su questo dispositivo",
    pinError: "PIN errato",
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
    newPinPlaceholder: "Nuovo PIN (4 cifre)",
    savePin: "Salva nuovo PIN",
    deleteAllNotes: "Cancella tutte le note",
    resetApp: "Reset totale app",
    quickBackupDone: "Backup rapido eseguito.",
    manualBackupDone: "Backup manuale eseguito.",
    restoreDone: "Ripristino completato.",
    noBackupFound: "Nessun backup trovato.",
    pinFormat: "Il PIN deve avere 4 cifre.",
    pinChanged: "PIN cambiato."
  },
  en: {
    notesTitle: "Your notes",
    enterPin: "Enter PIN",
    rememberPin: "Remember PIN on this device",
    pinError: "Wrong PIN",
    noTitle: "Untitled",
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
    newPinPlaceholder: "New PIN (4 digits)",
    savePin: "Save new PIN",
    deleteAllNotes: "Delete all notes",
    resetApp: "Reset app",
    quickBackupDone: "Quick backup done.",
    manualBackupDone: "Manual backup done.",
    restoreDone: "Restore completed.",
    noBackupFound: "No backup found.",
    pinFormat: "PIN must be 4 digits.",
    pinChanged: "PIN changed."
  },
  de: {
    notesTitle: "Deine Notizen",
    enterPin: "PIN eingeben",
    rememberPin: "PIN auf diesem Gerät merken",
    pinError: "Falscher PIN",
    noTitle: "Ohne Titel",
    catAll: "Alle",
    catHome: "Zuhause",
    catWork: "Arbeit",
    catIdeas: "Ideen",
    catShopping: "Einkauf",
    catOther: "Sonstiges",
    titlePlaceholder: "Titel",
    textPlaceholder: "Notiz schreiben...",
    categoryLabel: "Kategorie",
    colorLabel: "Notizfarbe",
    save: "Speichern",
    delete: "Löschen",
    editNote: "Notiz",
    backupTitle: "Backup & Wiederherstellung",
    backupSection: "Backup",
    restoreSection: "Wiederherstellung",
    exportSection: "Export / Import",
    backupManageSection: "Backup-Verwaltung",
    quickBackup: "Schnelles Backup",
    manualBackup: "Manuelles Backup",
    manualRestore: "Manuelle Wiederherstellung",
    exportText: "Notizen exportieren (.txt)",
    deleteBackups: "Backups löschen",
    close: "Schließen",
    settingsTitle: "Einstellungen",
    securitySection: "Sicherheit",
    maintenanceSection: "Wartung",
    newPinPlaceholder: "Neuer PIN (4 Ziffern)",
    savePin: "Neuen PIN speichern",
    deleteAllNotes: "Alle Notizen löschen",
    resetApp: "App zurücksetzen",
    quickBackupDone: "Schnelles Backup durchgeführt.",
    manualBackupDone: "Manuelles Backup durchgeführt.",
    restoreDone: "Wiederherstellung abgeschlossen.",
    noBackupFound: "Kein Backup gefunden.",
    pinFormat: "PIN muss 4 Ziffern haben.",
    pinChanged: "PIN geändert."
  },
  es: {
    notesTitle: "Tus notas",
    enterPin: "Introduce el PIN",
    rememberPin: "Recordar PIN en este dispositivo",
    pinError: "PIN incorrecto",
    noTitle: "Sin título",
    catAll: "Todas",
    catHome: "Casa",
    catWork: "Trabajo",
    catIdeas: "Ideas",
    catShopping: "Compras",
    catOther: "Otros",
    titlePlaceholder: "Título",
    textPlaceholder: "Escribe tu nota...",
    categoryLabel: "Categoría",
    colorLabel: "Color de la nota",
    save: "Guardar",
    delete: "Eliminar",
    editNote: "Nota",
    backupTitle: "Copia y restauración",
    backupSection: "Copia",
    restoreSection: "Restauración",
    exportSection: "Exportar / Importar",
    backupManageSection: "Gestión de copias",
    quickBackup: "Copia rápida",
    manualBackup: "Copia manual",
    manualRestore: "Restauración manual",
    exportText: "Exportar notas (.txt)",
    deleteBackups: "Eliminar copias",
    close: "Cerrar",
    settingsTitle: "Ajustes",
    securitySection: "Seguridad",
    maintenanceSection: "Mantenimiento",
    newPinPlaceholder: "Nuevo PIN (4 dígitos)",
    savePin: "Guardar nuevo PIN",
    deleteAllNotes: "Eliminar todas las notas",
    resetApp: "Restablecer app",
    quickBackupDone: "Copia rápida realizada.",
    manualBackupDone: "Copia manual realizada.",
    restoreDone: "Restauración completada.",
    noBackupFound: "No se encontró ninguna copia.",
    pinFormat: "El PIN debe tener 4 dígitos.",
    pinChanged: "PIN cambiado."
  }
};

let currentLang = localStorage.getItem("appLang") || "it";
let currentTranslations = translations[currentLang];

// ================== PIN ==================
let savedPIN = localStorage.getItem("appPIN") || "4618";
let enteredPIN = "";

const pinOverlay = document.getElementById("pinOverlay");
const pinCircles = document.querySelectorAll(".circle");
const pinError = document.getElementById("pinError");

function updateCircles() {
  pinCircles.forEach((c, i) => {
    c.classList.toggle("filled", i < enteredPIN.length);
  });
}

function checkPIN() {
  const remember = document.getElementById("rememberPin")?.checked;
  if (enteredPIN === savedPIN) {
    pinOverlay.classList.add("hidden");
    if (remember) localStorage.setItem("rememberPIN", "1");
  } else {
    pinError.textContent = currentTranslations.pinError;
    setTimeout(() => (pinError.textContent = ""), 1200);
  }
  enteredPIN = "";
  updateCircles();
}

document.querySelectorAll(".pinPad button").forEach((btn) => {
  btn.onclick = () => {
    const num = btn.dataset.num;
    if (num !== undefined) {
      if (enteredPIN.length < 4) {
        enteredPIN += num;
        updateCircles();
        if (enteredPIN.length === 4) checkPIN();
      }
    }
  };
});

document.getElementById("pinBack").onclick = () => {
  enteredPIN = enteredPIN.slice(0, -1);
  updateCircles();
};

if (localStorage.getItem("rememberPIN") === "1") {
  pinOverlay.classList.add("hidden");
}

// ================== TEMI ==================
function applyTheme(theme) {
  document.body.classList.remove("dark", "amoled");
  if (theme === "dark") document.body.classList.add("dark");
  if (theme === "amoled") document.body.classList.add("amoled");
}

let savedTheme = localStorage.getItem("appTheme") || "light";
applyTheme(savedTheme);

document.getElementById("theme-light").onclick = () => {
  savedTheme = "light";
  localStorage.setItem("appTheme", savedTheme);
  applyTheme(savedTheme);
};
document.getElementById("theme-dark").onclick = () => {
  savedTheme = "dark";
  localStorage.setItem("appTheme", savedTheme);
  applyTheme(savedTheme);
};
document.getElementById("theme-amoled").onclick = () => {
  savedTheme = "amoled";
  localStorage.setItem("appTheme", savedTheme);
  applyTheme(savedTheme);
};

// ================== MULTILINGUA ==================
function applyTranslations() {
  currentTranslations = translations[currentLang];

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (currentTranslations[key]) el.textContent = currentTranslations[key];
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (currentTranslations[key]) el.placeholder = currentTranslations[key];
  });

  // Aggiorna titolo app
  const titleEl = document.querySelector(".app-title");
  if (titleEl) titleEl.textContent = currentTranslations.notesTitle;

  renderNotes();
}

document.querySelectorAll(".lang-btn").forEach((btn) => {
  if (btn.dataset.lang === currentLang) btn.classList.add("active");
  btn.onclick = () => {
    document.querySelectorAll(".lang-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentLang = btn.dataset.lang;
    localStorage.setItem("appLang", currentLang);
    applyTranslations();
  };
});

// ================== NOTE ==================
function getCategoryLabel(cat) {
  switch (cat) {
    case "home":
      return currentTranslations.catHome;
    case "work":
      return currentTranslations.catWork;
    case "ideas":
      return currentTranslations.catIdeas;
    case "shopping":
      return currentTranslations.catShopping;
    case "other":
    default:
      return currentTranslations.catOther;
  }
}

function renderNotes() {
  const container = document.getElementById("notes-container");
  container.innerHTML = "";

  notes
    .filter((n) => currentCategoryFilter === "all" || n.category === currentCategoryFilter)
    .forEach((n) => {
      const div = document.createElement("div");
      div.className = "note";
      div.style.background = n.color || "#ffffff";

      const catLabel = getCategoryLabel(n.category);

      div.innerHTML = `
        <div class="note-header">
          <div class="note-title">${n.title || currentTranslations.noTitle}</div>
          <div class="note-category-tag">${catLabel}</div>
        </div>
        <div class="note-text">${(n.text || "").slice(0, 160)}</div>
        <div class="note-actions">
          <button class="note-action-btn" data-action="edit">✍️</button>
          <button class="note-action-btn" data-action="delete">🗑️</button>
        </div>
      `;

      div.querySelector('[data-action="edit"]').onclick = (e) => {
        e.stopPropagation();
        openEditor(n.id);
      };
      div.querySelector('[data-action="delete"]').onclick = (e) => {
        e.stopPropagation();
        deleteNoteById(n.id);
      };

      div.onclick = () => openEditor(n.id);

      container.appendChild(div);
    });
}

// ================== FILTRO CATEGORIE ==================
document.querySelectorAll(".category-btn").forEach((btn) => {
  btn.onclick = () => {
    document.querySelectorAll(".category-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentCategoryFilter = btn.dataset.category;
    renderNotes();
  };
});

// ================== EDITOR ==================
function openEditor(id = null) {
  editingId = id;

  const editor = document.getElementById("note-editor");
  const title = document.getElementById("note-title");
  const text = document.getElementById("note-text");
  const cat = document.getElementById("note-category");
  const colorPicker = document.getElementById("note-color");

  if (id) {
    const n = notes.find((x) => x.id === id);
    if (!n) return;
    title.value = n.title;
    text.value = n.text;
    cat.value = n.category;
    selectedColor = n.color || "#ffffff";
  } else {
    title.value = "";
    text.value = "";
    cat.value = "other";
    selectedColor = "#ffffff";
  }

  colorPicker.value = selectedColor;
  document.querySelectorAll(".color-dot").forEach((d) => {
    d.classList.toggle("selected", d.dataset.color === selectedColor);
  });

  editor.classList.remove("hidden");
}

document.getElementById("close-editor-btn").onclick = () => {
  document.getElementById("note-editor").classList.add("hidden");
};

document.getElementById("add-note-btn").onclick = () => openEditor(null);

document.getElementById("save-note-btn").onclick = () => {
  const title = document.getElementById("note-title").value.trim();
  const text = document.getElementById("note-text").value.trim();
  const category = document.getElementById("note-category").value;

  if (!text) return;

  if (editingId) {
    const n = notes.find((x) => x.id === editingId);
    if (!n) return;
    n.title = title;
    n.text = text;
    n.category = category;
    n.color = selectedColor;
  } else {
    notes.push({
      id: Date.now(),
      title,
      text,
      category,
      color: selectedColor
    });
  }

  saveNotes(true);
  renderNotes();
  document.getElementById("note-editor").classList.add("hidden");
};

document.getElementById("delete-note-btn").onclick = () => {
  if (!editingId) return;
  deleteNoteById(editingId);
  document.getElementById("note-editor").classList.add("hidden");
};

function deleteNoteById(id) {
  notes = notes.filter((n) => n.id !== id);
  saveNotes(true);
  renderNotes();
}

// Colori rapidi
document.querySelectorAll(".color-dot").forEach((dot) => {
  dot.onclick = () => {
    selectedColor = dot.dataset.color;
    document.getElementById("note-color").value = selectedColor;
    document.querySelectorAll(".color-dot").forEach((d) => d.classList.remove("selected"));
    dot.classList.add("selected");
  };
});

document.getElementById("note-color").oninput = (e) => {
  selectedColor = e.target.value;
  document.querySelectorAll(".color-dot").forEach((d) => d.classList.remove("selected"));
};

// ================== BACKUP ==================
function saveNotes(autoBackup = true) {
  localStorage.setItem("notes", JSON.stringify(notes));
  if (autoBackup) autoBackupNotes();
}

function autoBackupNotes() {
  localStorage.setItem("notesBackup", JSON.stringify(notes));
}

function autoRestoreIfEmpty() {
  if (notes.length === 0) {
    const backup = localStorage.getItem("notesBackup");
    if (backup) {
      notes = JSON.parse(backup);
      saveNotes(false);
    }
  }
}

document.getElementById("quick-backup-btn").onclick = () => {
  localStorage.setItem("notesBackup", JSON.stringify(notes));
  alert(currentTranslations.quickBackupDone);
};

document.getElementById("manual-backup-btn").onclick = () => {
  const data = JSON.stringify(notes, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "note-backup.json";
  a.click();
  URL.revokeObjectURL(url);
  alert(currentTranslations.manualBackupDone);
};

document.getElementById("manual-restore-btn").onclick = () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json";

  input.onchange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        notes = JSON.parse(event.target.result);
        saveNotes(false);
        renderNotes();
        alert(currentTranslations.restoreDone);
      } catch {
        alert("File non valido.");
      }
    };
    reader.readAsText(file);
  };

  input.click();
};

document.getElementById("export-text-btn").onclick = () => {
  let content = "";
  notes.forEach((n) => {
    content += `Titolo: ${n.title}\nCategoria: ${getCategoryLabel(n.category)}\nColore: ${
      n.color
    }\n${n.text}\n\n---\n\n`;
  });
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "note-export.txt";
  a.click();
  URL.revokeObjectURL(url);
};

document.getElementById("delete-backups-btn").onclick = () => {
  localStorage.removeItem("notesBackup");
  alert(currentTranslations.noBackupFound);
};

// ================== PANNELLI ==================
const backupPanel = document.getElementById("backup-panel");
const settingsPanel = document.getElementById("settings-panel");

document.getElementById("backup-btn").onclick = () => {
  backupPanel.classList.remove("hidden");
};

document.getElementById("settings-btn").onclick = () => {
  settingsPanel.classList.remove("hidden");
};

document.getElementById("close-backup-panel").onclick = () => {
  backupPanel.classList.add("hidden");
};

document.getElementById("close-settings-panel").onclick = () => {
  settingsPanel.classList.add("hidden");
};

// ================== IMPOSTAZIONI ==================
document.getElementById("save-new-pin-btn").onclick = () => {
  const newPin = document.getElementById("new-pin-input").value.trim();
  if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
    alert(currentTranslations.pinFormat);
    return;
  }
  savedPIN = newPin;
  localStorage.setItem("appPIN", newPin);
  document.getElementById("new-pin-input").value = "";
  alert(currentTranslations.pinChanged);
};

document.getElementById("delete-all-notes-btn").onclick = () => {
  if (!confirm(currentTranslations.deleteAllNotes + "?")) return;
  notes = [];
  saveNotes(true);
  renderNotes();
};

document.getElementById("reset-app-btn").onclick = () => {
  if (!confirm(currentTranslations.resetApp + "?")) return;
  localStorage.clear();
  location.reload();
};

// ================== INIT ==================
autoRestoreIfEmpty();
applyTranslations();
renderNotes();
