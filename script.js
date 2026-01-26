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
let savedPIN = localStorage.getItem("appPIN") || "4618";

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
  }
};

/* ============================================================
   MULTILINGUA
============================================================ */
function applyTranslations() {
  const t = translations[currentLang];

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
  const t = translations[currentLang];
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
document.getElementById("theme-amoled").onclick = () => applyTheme("amoled");

/* ============================================================
   PIN
============================================================ */
let enteredPIN = "";
const pinCircles = document.querySelectorAll(".circle");
const pinOverlay = document.getElementById("pinOverlay");

function updateCircles() {
  pinCircles.forEach((c, i) => c.classList.toggle("filled", i < enteredPIN.length));
}

function checkPIN() {
  const t = translations[currentLang];
  if (enteredPIN === savedPIN) {
    pinOverlay.classList.add("hidden");
    if (document.getElementById("rememberPin").checked)
      localStorage.setItem("rememberPIN", "1");
  } else {
    document.getElementById("pinError").textContent = t.pinError;
    setTimeout(() => (document.getElementById("pinError").textContent = ""), 1200);
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

if (localStorage.getItem("rememberPIN") === "1") {
  pinOverlay.classList.add("hidden");
}

/* ============================================================
   NOTE
============================================================ */
function getCategoryLabel(cat) {
  const t = translations[currentLang];
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

  notes
    .filter(n => currentCategoryFilter === "all" || n.category === currentCategoryFilter)
    .forEach(n => {
      const div = document.createElement("div");
      div.className = "note";
      div.style.background = n.color;

      if (privacyMode) {
        div.style.filter = "blur(6px)";
      }

      div.innerHTML = `
        <div class="note-header">
          <div class="note-title">${n.title || translations[currentLang].noTitle}</div>
          <div class="note-category-tag">${getCategoryLabel(n.category)}</div>
        </div>
        <div class="note-text">${(n.text || "").slice(0, 160)}</div>
        <div class="note-actions">
          <button class="note-action-btn" data-action="edit">✍️</button>
          <button class="note-action-btn" data-action="delete">🗑️</button>
        </div>
      `;

      div.onclick = () => {
        if (privacyMode) div.style.filter = "none";
        openEditor(n.id);
      };

      div.querySelector('[data-action="edit"]').onclick = e => {
        e.stopPropagation();
        openEditor(n.id);
      };

      div.querySelector('[data-action="delete"]').onclick = e => {
        e.stopPropagation();
        deleteNoteById(n.id);
      };

      container.appendChild(div);
    });
}

/* ============================================================
   FILTRO CATEGORIE
============================================================ */
document.querySelectorAll(".category-btn").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".category-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentCategoryFilter = btn.dataset.category;
    renderNotes();
  };
});

/* ============================================================
   EDITOR
============================================================ */
function openEditor(id = null) {
  editingId = id;

  const editor = document.getElementById("note-editor");
  const title = document.getElementById("note-title");
  const text = document.getElementById("note-text");
  const cat = document.getElementById("note-category");
  const colorPicker = document.getElementById("note-color");

  if (id) {
    const n = notes.find(x => x.id === id);
    title.value = n.title;
    text.value = n.text;
    cat.value = n.category;
    selectedColor = n.color;
  } else {
    title.value = "";
    text.value = "";
    cat.value = "other";
    selectedColor = "#ffffff";
  }

  colorPicker.value = selectedColor;

  document.querySelectorAll(".color-dot").forEach(d => {
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
    const n = notes.find(x => x.id === editingId);
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

  saveNotes();
  renderNotes();
  document.getElementById("note-editor").classList.add("hidden");
};

document.getElementById("delete-note-btn").onclick = () => {
  if (!editingId) return;
  deleteNoteById(editingId);
  document.getElementById("note-editor").classList.add("hidden");
};

function deleteNoteById(id) {
  const note = notes.find(n => n.id === id);
  trash.push(note);
  localStorage.setItem("trash", JSON.stringify(trash));

  notes = notes.filter(n => n.id !== id);
  saveNotes();
  renderNotes();
}

/* Colori rapidi */
document.querySelectorAll(".color-dot").forEach(dot => {
  dot.onclick = () => {
    selectedColor = dot.dataset.color;
    document.getElementById("note-color").value = selectedColor;
    document.querySelectorAll(".color-dot").forEach(d => d.classList.remove("selected"));
    dot.classList.add("selected");
  };
});

document.getElementById("note-color").oninput = e => {
  selectedColor = e.target.value;
  document.querySelectorAll(".color-dot").forEach(d => d.classList.remove("selected"));
};

/* ============================================================
   BACKUP — PARTE 1
============================================================ */
function saveNotes() {
  localStorage.setItem("notes", JSON.stringify(notes));
  if (autoBackupEnabled) autoBackupNotes();
}

function autoBackupNotes() {
  localStorage.setItem("notesBackup", JSON.stringify(notes));
}

function autoRestoreIfEmpty() {
  if (!autoRestoreEnabled) return;
  if (notes.length === 0) {
    const backup = localStorage.getItem("notesBackup");
    if (backup) {
      notes = JSON.parse(backup);
      saveNotes();
    }
  }
}
/* ============================================================
   BACKUP — PARTE 2
============================================================ */
document.getElementById("quick-backup-btn").onclick = () => {
  localStorage.setItem("notesBackup", JSON.stringify(notes));
  alert(translations[currentLang].quickBackupDone);
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
  alert(translations[currentLang].manualBackupDone);
};

document.getElementById("manual-restore-btn").onclick = () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json";

  input.onchange = e => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = event => {
      try {
        notes = JSON.parse(event.target.result);
        saveNotes();
        renderNotes();
        alert(translations[currentLang].restoreDone);
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
  notes.forEach(n => {
    content += `Titolo: ${n.title}\nCategoria: ${getCategoryLabel(n.category)}\nColore: ${n.color}\n${n.text}\n\n---\n\n`;
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
  alert(translations[currentLang].noBackupFound);
};

/* Backup automatico ON/OFF */
document.getElementById("toggle-auto-backup").onclick = () => {
  autoBackupEnabled = !autoBackupEnabled;
  localStorage.setItem("autoBackupEnabled", autoBackupEnabled);
  alert("Backup automatico " + (autoBackupEnabled ? "attivato" : "disattivato"));
};

/* Ripristino automatico ON/OFF */
document.getElementById("toggle-auto-restore").onclick = () => {
  autoRestoreEnabled = !autoRestoreEnabled;
  localStorage.setItem("autoRestoreEnabled", autoRestoreEnabled);
  alert("Ripristino automatico " + (autoRestoreEnabled ? "attivato" : "disattivato"));
};

/* ============================================================
   PANNELLI
============================================================ */
document.getElementById("backup-btn").onclick = () => {
  document.getElementById("backup-panel").classList.remove("hidden");
};

document.getElementById("settings-btn").onclick = () => {
  document.getElementById("settings-panel").classList.remove("hidden");
};

document.getElementById("info-btn").onclick = () => {
  updateDebugInfo();
  updateStorageInfo();
  document.getElementById("info-panel").classList.remove("hidden");
};

document.getElementById("close-backup-panel").onclick = () => {
  document.getElementById("backup-panel").classList.add("hidden");
};

document.getElementById("close-settings-panel").onclick = () => {
  document.getElementById("settings-panel").classList.add("hidden");
};

document.getElementById("close-info-panel").onclick = () => {
  document.getElementById("info-panel").classList.add("hidden");
};

/* ============================================================
   IMPOSTAZIONI AVANZATE
============================================================ */

/* Cambio PIN */
document.getElementById("save-new-pin-btn").onclick = () => {
  const newPin = document.getElementById("new-pin-input").value.trim();
  if (!/^\d{4}$/.test(newPin)) {
    alert(translations[currentLang].pinFormat);
    return;
  }
  savedPIN = newPin;
  localStorage.setItem("appPIN", newPin);
  alert(translations[currentLang].pinChanged);
};

/* Modalità privacy */
document.getElementById("toggle-privacy").onclick = () => {
  privacyMode = !privacyMode;
  localStorage.setItem("privacyMode", privacyMode);
  renderNotes();
};

/* Font */
document.getElementById("change-font").onclick = () => {
  const fonts = ["ios", "modern", "mono"];
  const next = fonts[(fonts.indexOf(fontMode) + 1) % fonts.length];
  fontMode = next;
  localStorage.setItem("fontMode", next);

  document.body.style.fontFamily =
    next === "modern"
      ? "Inter, sans-serif"
      : next === "mono"
      ? "Menlo, monospace"
      : "-apple-system, BlinkMacSystemFont, sans-serif";
};

/* Dimensione testo */
document.getElementById("change-text-size").onclick = () => {
  const sizes = ["small", "medium", "large"];
  const next = sizes[(sizes.indexOf(textSize) + 1) % sizes.length];
  textSize = next;
  localStorage.setItem("textSize", next);

  document.documentElement.style.setProperty(
    "--note-text-size",
    next === "small" ? "12px" : next === "large" ? "16px" : "14px"
  );

  renderNotes();
};

/* Animazioni ON/OFF */
document.getElementById("toggle-animations").onclick = () => {
  animationsEnabled = !animationsEnabled;
  localStorage.setItem("animationsEnabled", animationsEnabled);
  document.body.style.setProperty("--animations", animationsEnabled ? "1" : "0");
};

/* Velocità animazioni */
document.getElementById("change-animation-speed").onclick = () => {
  const speeds = ["slow", "normal", "fast"];
  const current = document.body.dataset.animSpeed || "normal";
  const next = speeds[(speeds.indexOf(current) + 1) % speeds.length];
  document.body.dataset.animSpeed = next;

  document.documentElement.style.setProperty(
    "--anim-speed",
    next === "slow" ? "0.6s" : next === "fast" ? "0.2s" : "0.35s"
  );
};

/* Trasparenze */
document.getElementById("toggle-transparency").onclick = () => {
  const current = document.body.dataset.transparency || "on";
  const next = current === "on" ? "off" : "on";
  document.body.dataset.transparency = next;

  document.documentElement.style.setProperty(
    "--glass",
    next === "off" ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.6)"
  );
};

/* ============================================================
   ORDINAMENTO NOTE
============================================================ */
document.getElementById("sort-notes").onclick = () => {
  const modes = ["date", "title", "category"];
  const current = localStorage.getItem("sortMode") || "date";
  const next = modes[(modes.indexOf(current) + 1) % modes.length];
  localStorage.setItem("sortMode", next);

  if (next === "title") notes.sort((a, b) => a.title.localeCompare(b.title));
  if (next === "category") notes.sort((a, b) => a.category.localeCompare(b.category));
  if (next === "date") notes.sort((a, b) => b.id - a.id);

  renderNotes();
};

/* ============================================================
   ARCHIVIO E CESTINO
============================================================ */
document.getElementById("open-archive").onclick = () => {
  alert("Archivio note in sviluppo.");
};

document.getElementById("open-trash").onclick = () => {
  alert("Cestino note in sviluppo.");
};

document.getElementById("duplicate-note").onclick = () => {
  alert("Duplica nota in sviluppo.");
};

document.getElementById("merge-notes").onclick = () => {
  alert("Unisci note in sviluppo.");
};

/* ============================================================
   DEBUG INFO
============================================================ */
function updateDebugInfo() {
  const debug = document.getElementById("debug-info");
  debug.innerHTML = `
    Note totali: ${notes.length}<br>
    Archivio: ${archive.length}<br>
    Cestino: ${trash.length}<br>
    Backup automatico: ${autoBackupEnabled}<br>
    Ripristino automatico: ${autoRestoreEnabled}<br>
    Privacy: ${privacyMode}<br>
    Animazioni: ${animationsEnabled}<br>
    Font: ${fontMode}<br>
    Dimensione testo: ${textSize}
  `;
}

/* ============================================================
   STATO MEMORIA
============================================================ */
function updateStorageInfo() {
  const used = JSON.stringify(localStorage).length;
  const max = 5 * 1024 * 1024; // 5MB
  const percent = ((used / max) * 100).toFixed(1);

  document.getElementById("storage-info").innerHTML = `
    Spazio usato: ${(used / 1024).toFixed(1)} KB<br>
    Percentuale: ${percent}%<br>
    Limite: 5 MB
  `;
}

/* ============================================================
   INIT
============================================================ */
autoRestoreIfEmpty();
applyTranslations();
renderNotes();
