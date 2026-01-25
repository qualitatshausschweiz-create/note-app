// ===== PIN =====
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
    pinOverlay.style.display = "none";
    if (remember) {
      localStorage.setItem("rememberPIN", "1");
    }
  } else {
    pinError.textContent = currentTranslations.pinError || "PIN errato";
    setTimeout(() => pinError.textContent = "", 1000);
  }
  enteredPIN = "";
  updateCircles();
}

document.querySelectorAll(".pinPad button").forEach(btn => {
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

// ===== NOTE, CATEGORIE, COLORI =====
let notes = JSON.parse(localStorage.getItem("notes") || "[]");
let editingId = null;
let currentCategoryFilter = "all";
let selectedColor = "#ffffff";

function saveNotes(autoBackup = true) {
  localStorage.setItem("notes", JSON.stringify(notes));
  if (autoBackup) {
    autoBackupNotes();
  }
}

function renderNotes() {
  const list = document.getElementById("notesList");
  list.innerHTML = "";

  notes
    .filter(n => currentCategoryFilter === "all" || n.category === currentCategoryFilter)
    .forEach(n => {
      const div = document.createElement("div");
      div.className = "noteItem";
      div.style.background = n.color || "#ffffff";

      const catLabel = getCategoryLabel(n.category);

      div.innerHTML = `
        <div class="noteHeaderRow">
          <h3>${n.title || currentTranslations.noTitle || "Senza titolo"}</h3>
          ${catLabel}
        </div>
        <p>${(n.text || "").slice(0, 120)}</p>
      `;
      div.onclick = () => openEditor(n.id);
      list.appendChild(div);
    });
}

function openEditor(id = null) {
  editingId = id;

  const editor = document.getElementById("editor");
  const title = document.getElementById("noteTitle");
  const text = document.getElementById("noteText");
  const cat = document.getElementById("noteCategory");

  if (id) {
    const n = notes.find(x => x.id === id);
    if (!n) return;
    title.value = n.title;
    text.value = n.text;
    cat.value = n.category || "other";
    selectedColor = n.color || "#ffffff";
  } else {
    title.value = "";
    text.value = "";
    cat.value = "home";
    selectedColor = "#ffffff";
  }

  document.getElementById("customColor").value = selectedColor;

  document.querySelectorAll(".colorDot").forEach(d => {
    d.classList.toggle("selected", d.dataset.color === selectedColor);
  });

  editor.classList.remove("hidden");
}

document.getElementById("addNoteBtn").onclick = () => openEditor(null);

document.getElementById("saveNote").onclick = () => {
  const title = document.getElementById("noteTitle").value.trim();
  const text = document.getElementById("noteText").value.trim();
  const category = document.getElementById("noteCategory").value;

  if (!text) return;

  if (editingId) {
    const n = notes.find(x => x.id === editingId);
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
  document.getElementById("editor").classList.add("hidden");
};

document.getElementById("cancelEdit").onclick = () => {
  document.getElementById("editor").classList.add("hidden");
};

document.getElementById("deleteNote").onclick = () => {
  if (!editingId) return;

  notes = notes.filter(n => n.id !== editingId);
  saveNotes(true);
  renderNotes();
  document.getElementById("editor").classList.add("hidden");
};

// Categorie filtro
document.querySelectorAll(".catBtn").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".catBtn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentCategoryFilter = btn.dataset.category;
    renderNotes();
  };
});

function getCategoryLabel(cat) {
  switch (cat) {
    case "home":
      return `<span class="noteCategoryTag home">${currentTranslations.catHome}</span>`;
    case "work":
      return `<span class="noteCategoryTag work">${currentTranslations.catWork}</span>`;
    case "ideas":
      return `<span class="noteCategoryTag ideas">${currentTranslations.catIdeas}</span>`;
    case "shopping":
      return `<span class="noteCategoryTag shopping">${currentTranslations.catShopping}</span>`;
    case "other":
      return `<span class="noteCategoryTag other">${currentTranslations.catOther}</span>`;
    default:
      return `<span class="noteCategoryTag other">${currentTranslations.catOther}</span>`;
  }
}

// Gestione colore nota
document.querySelectorAll(".colorDot").forEach(dot => {
  dot.onclick = () => {
    selectedColor = dot.dataset.color;

    document.querySelectorAll(".colorDot").forEach(d => d.classList.remove("selected"));
    dot.classList.add("selected");

    document.getElementById("customColor").value = selectedColor;
  };
});

document.getElementById("customColor").oninput = e => {
  selectedColor = e.target.value;
  document.querySelectorAll(".colorDot").forEach(d => d.classList.remove("selected"));
};

// ===== BACKUP COMPLETO =====

// Backup veloce (salvataggio immediato)
document.getElementById("backupBtn").onclick = () => {
  localStorage.setItem("notesBackup", JSON.stringify(notes));
  alert(currentTranslations.quickBackupDone || "Backup rapido eseguito.");
};

// Backup manuale (esporta file .json)
document.getElementById("manualBackup").onclick = () => {
  const data = JSON.stringify(notes, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "note-backup.json";
  a.click();

  URL.revokeObjectURL(url);

  alert(currentTranslations.manualBackupDone || "Backup manuale eseguito.");
};

// Ripristino manuale (importa file .json)
document.getElementById("manualRestore").onclick = () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json";

  input.onchange = e => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = event => {
      try {
        notes = JSON.parse(event.target.result);
        saveNotes(false);
        renderNotes();
        alert(currentTranslations.restoreDone || "Ripristino completato.");
      } catch {
        alert("File non valido.");
      }
    };

    reader.readAsText(file);
  };

  input.click();
};

// Backup automatico (ogni salvataggio)
function autoBackupNotes() {
  localStorage.setItem("notesBackup", JSON.stringify(notes));
}

// Ripristino automatico (se note vuote)
function autoRestoreIfEmpty() {
  if (notes.length === 0) {
    const backup = localStorage.getItem("notesBackup");
    if (backup) {
      notes = JSON.parse(backup);
      saveNotes(false);
    }
  }
}

// ===== IMPOSTAZIONI =====
const settingsOverlay = document.getElementById("settingsOverlay");
document.getElementById("settingsBtn").onclick = () => {
  settingsOverlay.classList.remove("hidden");
};

document.getElementById("closeSettings").onclick = () => {
  settingsOverlay.classList.add("hidden");
};

document.getElementById("saveNewPin").onclick = () => {
  const newPin = document.getElementById("newPin").value.trim();
  if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
    alert(currentTranslations.pinFormat || "Il PIN deve avere 4 cifre.");
    return;
  }
  savedPIN = newPin;
  localStorage.setItem("appPIN", newPin);
  document.getElementById("newPin").value = "";
  alert(currentTranslations.pinChanged || "PIN cambiato.");
};

const rememberCheckbox = document.getElementById("rememberPin");
if (localStorage.getItem("rememberPIN") === "1") {
  rememberCheckbox.checked = true;
  pinOverlay.style.display = "none";
}

// Esporta tutte le note in un file .txt
document.getElementById("exportText").onclick = () => {
  let content = "";
  notes.forEach(n => {
    content += `Titolo: ${n.title}\nCategoria: ${n.category}\nColore: ${n.color}\n${n.text}\n\n---\n\n`;
  });

  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "note-export.txt";
  a.click();

  URL.revokeObjectURL(url);
};

// Cancella tutte le note
document.getElementById("deleteAllNotes").onclick = () => {
  if (!confirm("Vuoi davvero cancellare tutte le note?")) return;
  notes = [];
  saveNotes(true);
  renderNotes();
};

// Reset totale app
document.getElementById("resetApp").onclick = () => {
  if (!confirm("Reset totale? Cancella note, PIN e backup.")) return;
  localStorage.clear();
  location.reload();
};

// ===== TEMA CHIARO/SCURO =====
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");

function applyTheme(theme) {
  if (theme === "dark") {
    document.body.classList.add("dark");
    themeIcon.textContent = "🌙";
  } else {
    document.body.classList.remove("dark");
    themeIcon.textContent = "🌞";
  }
}

let savedTheme = localStorage.getItem("appTheme") || "light";
applyTheme(savedTheme);

themeToggle.onclick = () => {
  savedTheme = savedTheme === "light" ? "dark" : "light";
  localStorage.setItem("appTheme", savedTheme);
  applyTheme(savedTheme);
};

// ===== MULTILINGUA =====
const translations = {
  it: {
    notesTitle: "Le mie note",
    notesSection: "Note",
    enterPin: "Inserisci PIN",
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
    colorLabel: "Colore nota",
    save: "Salva",
    cancel: "Annulla",
    delete: "Elimina",
    settingsTitle: "Impostazioni",
    changePin: "Cambia PIN",
    savePin: "Salva PIN",
    rememberPin: "Memorizza PIN su questo dispositivo",
    backupTitle: "Backup & Ripristino",
    manualBackup: "Backup manuale",
    manualRestore: "Ripristino manuale",
    autoBackupInfo: "Il backup automatico avviene ad ogni salvataggio.",
    appInfoTitle: "Info app",
    appInfoText: "App note privata con PIN, categorie, backup e tema chiaro/scuro.",
    close: "Chiudi",
    quickBackupDone: "Backup rapido eseguito.",
    manualBackupDone: "Backup manuale eseguito.",
    noBackupFound: "Nessun backup trovato.",
    restoreDone: "Ripristino completato.",
    pinFormat: "Il PIN deve avere 4 cifre.",
    pinChanged: "PIN cambiato."
  },
  en: {
    notesTitle: "My notes",
    notesSection: "Notes",
    enterPin: "Enter PIN",
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
    colorLabel: "Note color",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    settingsTitle: "Settings",
    changePin: "Change PIN",
    savePin: "Save PIN",
    rememberPin: "Remember PIN on this device",
    backupTitle: "Backup & Restore",
    manualBackup: "Manual backup",
    manualRestore: "Manual restore",
    autoBackupInfo: "Automatic backup happens on every save.",
    appInfoTitle: "App info",
    appInfoText: "Private notes app with PIN, categories, backup and light/dark theme.",
    close: "Close",
    quickBackupDone: "Quick backup done.",
    manualBackupDone: "Manual backup done.",
    noBackupFound: "No backup found.",
    restoreDone: "Restore completed.",
    pinFormat: "PIN must be 4 digits.",
    pinChanged: "PIN changed."
  },
  de: {
    notesTitle: "Meine Notizen",
    notesSection: "Notizen",
    enterPin: "PIN eingeben",
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
    colorLabel: "Notizfarbe",
    save: "Speichern",
    cancel: "Abbrechen",
    delete: "Löschen",
    settingsTitle: "Einstellungen",
    changePin: "PIN ändern",
    savePin: "PIN speichern",
    rememberPin: "PIN auf diesem Gerät merken",
    backupTitle: "Backup & Wiederherstellung",
    manualBackup: "Manuelles Backup",
    manualRestore: "Manuelle Wiederherstellung",
    autoBackupInfo: "Automatisches Backup bei jedem Speichern.",
    appInfoTitle: "App-Info",
    appInfoText: "Private Notizen-App mit PIN, Kategorien, Backup und Hell/Dunkel-Theme.",
    close: "Schließen",
    quickBackupDone: "Schnelles Backup durchgeführt.",
    manualBackupDone: "Manuelles Backup durchgeführt.",
    noBackupFound: "Kein Backup gefunden.",
    restoreDone: "Wiederherstellung abgeschlossen.",
    pinFormat: "PIN muss 4 Ziffern haben.",
    pinChanged: "PIN geändert."
  },
  es: {
    notesTitle: "Mis notas",
    notesSection: "Notas",
    enterPin: "Introduce el PIN",
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
    colorLabel: "Color de la nota",
    save: "Guardar",
    cancel: "Cancelar",
    delete: "Eliminar",
    settingsTitle: "Ajustes",
    changePin: "Cambiar PIN",
    savePin: "Guardar PIN",
    rememberPin: "Recordar PIN en este dispositivo",
    backupTitle: "Copia y restauración",
    manualBackup: "Copia manual",
    manualRestore: "Restauración manual",
    autoBackupInfo: "La copia automática se hace en cada guardado.",
    appInfoTitle: "Info de la app",
    appInfoText: "App de notas privada con PIN, categorías, copia de seguridad y tema claro/oscuro.",
    close: "Cerrar",
    quickBackupDone: "Copia rápida realizada.",
    manualBackupDone: "Copia manual realizada.",
    noBackupFound: "No se encontró ninguna copia.",
    restoreDone: "Restauración completada.",
    pinFormat: "El PIN debe tener 4 dígitos.",
    pinChanged: "PIN cambiado."
  }
};

let currentLang = localStorage.getItem("appLang") || "it";
let currentTranslations = translations[currentLang];

function applyTranslations() {
  currentTranslations = translations[currentLang];

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (currentTranslations[key]) {
      el.textContent = currentTranslations[key];
    }
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (currentTranslations[key]) {
      el.placeholder = currentTranslations[key];
    }
  });

  renderNotes();
}

document.querySelectorAll(".langBtn").forEach(btn => {
  if (btn.dataset.lang === currentLang) btn.classList.add("active");
  btn.onclick = () => {
    document.querySelectorAll(".langBtn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentLang = btn.dataset.lang;
    localStorage.setItem("appLang", currentLang);
    applyTranslations();
  };
});

// ===== INIT =====
autoRestoreIfEmpty();
applyTranslations();
renderNotes();
