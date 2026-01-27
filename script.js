/* ===========================
   STATO & LINGUA ATTIVA
=========================== */

let currentLang = localStorage.getItem("currentLang") || "it";

let notes = [];
let deletedNotes = [];
let archivedNotes = [];

let categories = [
  {
    id: "personale",
    name: {
      it: "Personale",
      de: "Persönlich",
      en: "Personal",
      es: "Personal"
    },
    color: "#ff9500"
  },
  {
    id: "lavoro",
    name: {
      it: "Lavoro",
      de: "Arbeit",
      en: "Work",
      es: "Trabajo"
    },
    color: "#34c759"
  },
  {
    id: "idee",
    name: {
      it: "Idee",
      de: "Ideen",
      en: "Ideas",
      es: "Ideas"
    },
    color: "#af52de"
  },
  {
    id: "spesa",
    name: {
      it: "Spesa",
      de: "Einkauf",
      en: "Shopping",
      es: "Compra"
    },
    color: "#007aff"
  },
  {
    id: "altro",
    name: {
      it: "Altro",
      de: "Andere",
      en: "Other",
      es: "Otro"
    },
    color: "#5ac8fa"
  }
];

let showTrash = false;
let showArchive = false;
let autoBackup = JSON.parse(localStorage.getItem("autoBackup") || "false");

/* ===========================
   ELEMENTI DOM
=========================== */

const noteTitle = document.getElementById("noteTitle");
const noteContent = document.getElementById("noteContent");
const categorySelector = document.getElementById("categorySelector");
const noteList = document.getElementById("noteList");
const categoryList = document.getElementById("categoryList");
const searchInput = document.getElementById("searchInput");

const langButtons = document.querySelectorAll(".lang-btn");

/* ===========================
   SALVATAGGIO
=========================== */

function saveAll() {
  localStorage.setItem("notes", JSON.stringify(notes));
  localStorage.setItem("deletedNotes", JSON.stringify(deletedNotes));
  localStorage.setItem("archivedNotes", JSON.stringify(archivedNotes));
  localStorage.setItem("categories", JSON.stringify(categories));
  localStorage.setItem("currentLang", currentLang);
}

function loadAll() {
  notes = JSON.parse(localStorage.getItem("notes") || "[]");
  deletedNotes = JSON.parse(localStorage.getItem("deletedNotes") || "[]");
  archivedNotes = JSON.parse(localStorage.getItem("archivedNotes") || "[]");

  const storedCats = localStorage.getItem("categories");
  if (storedCats) categories = JSON.parse(storedCats);

  currentLang = localStorage.getItem("currentLang") || "it";
}

/* ===========================
   TRADUZIONE AUTOMATICA
=========================== */

async function translateText(text, targetLang) {
  // Traduzione ultra‑precisa (simulata)
  // In una app reale useresti un'API esterna.
  // Qui manteniamo la struttura per compatibilità.
  return text + " [" + targetLang + "]";
}

async function translateNoteFull(titleIT, contentIT) {
  return {
    title: {
      it: titleIT,
      de: await translateText(titleIT, "de"),
      en: await translateText(titleIT, "en"),
      es: await translateText(titleIT, "es")
    },
    content: {
      it: contentIT,
      de: await translateText(contentIT, "de"),
      en: await translateText(contentIT, "en"),
      es: await translateText(contentIT, "es")
    }
  };
}

/* ===========================
   CAMBIO LINGUA
=========================== */

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem("currentLang", lang);

  langButtons.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });

  renderCategories();
  renderNotes();
}

langButtons.forEach(btn => {
  btn.onclick = () => setLanguage(btn.dataset.lang);
});
/* ===========================
   RENDER CATEGORIE (MULTILINGUA)
=========================== */

function renderCategories() {
  categoryList.innerHTML = "";
  categorySelector.innerHTML = "";

  // Opzione "Tutte"
  const allOpt = document.createElement("option");
  allOpt.value = "tutte";
  allOpt.textContent = currentLang === "it" ? "Tutte" :
                       currentLang === "de" ? "Alle" :
                       currentLang === "en" ? "All" :
                       "Todas";
  categorySelector.appendChild(allOpt);

  categories.forEach(cat => {
    const li = document.createElement("li");
    li.className = "category-item";

    li.innerHTML = `
      <span class="color-dot" style="background:${cat.color}"></span>
      ${cat.name[currentLang]}
    `;

    li.onclick = () => filterCategory(cat.id);
    categoryList.appendChild(li);

    const opt = document.createElement("option");
    opt.value = cat.id;
    opt.textContent = cat.name[currentLang];
    categorySelector.appendChild(opt);
  });

  categorySelector.value = "tutte";
}

/* ===========================
   FILTRO CATEGORIA
=========================== */

function filterCategory(id) {
  if (id === "tutte") {
    renderNotes();
    return;
  }

  noteList.innerHTML = "";

  const baseList = showTrash ? deletedNotes :
                   showArchive ? archivedNotes :
                   notes;

  baseList
    .filter(n => n.category === id)
    .forEach(n => renderSingleNote(n));
}

/* ===========================
   RENDER NOTE (MULTILINGUA)
=========================== */

function renderNotes() {
  noteList.innerHTML = "";

  let list = showTrash ? deletedNotes :
             showArchive ? archivedNotes :
             notes;

  const q = (searchInput?.value || "").toLowerCase();
  if (q) {
    list = list.filter(n =>
      n.title[currentLang].toLowerCase().includes(q) ||
      n.content[currentLang].toLowerCase().includes(q)
    );
  }

  list.forEach(note => renderSingleNote(note));
}

function renderSingleNote(note) {
  const div = document.createElement("div");
  div.className = "note-item";

  const cat = categories.find(c => c.id === note.category);
  const catName = cat ? cat.name[currentLang] : "";

  let actionsHTML = "";

  if (showTrash) {
    actionsHTML = `<span class="note-restore" style="color:#34c759;">🟢 ${
      currentLang === "it" ? "Ripristina" :
      currentLang === "de" ? "Wiederherstellen" :
      currentLang === "en" ? "Restore" :
      "Restaurar"
    }</span>`;
  } else if (showArchive) {
    actionsHTML = `<span class="note-restore" style="color:#ff9500;">${
      currentLang === "it" ? "Rimuovi archivio" :
      currentLang === "de" ? "Archiv entfernen" :
      currentLang === "en" ? "Unarchive" :
      "Desarchivar"
    }</span>`;
  } else {
    actionsHTML = `
      <span class="note-delete" style="color:#ff3b30;">${
        currentLang === "it" ? "Elimina" :
        currentLang === "de" ? "Löschen" :
        currentLang === "en" ? "Delete" :
        "Eliminar"
      }</span>
      <span class="note-archive" style="color:#af52de;">${
        currentLang === "it" ? "Archivia" :
        currentLang === "de" ? "Archivieren" :
        currentLang === "en" ? "Archive" :
        "Archivar"
      }</span>
    `;
  }

  div.innerHTML = `
    <h3>${note.title[currentLang]}</h3>
    <p>${note.content[currentLang]}</p>
    <div class="note-footer">
      <span class="note-badge">${catName}</span>
      ${actionsHTML}
    </div>
  `;

  if (showTrash) {
    div.querySelector(".note-restore").onclick = () => restoreNote(note.id);
  } else if (showArchive) {
    div.querySelector(".note-restore").onclick = () => unarchiveNote(note.id);
  } else {
    div.querySelector(".note-delete").onclick = () => deleteNote(note.id);
    div.querySelector(".note-archive").onclick = () => archiveNote(note.id);
  }

  noteList.appendChild(div);
}

/* ===========================
   SALVATAGGIO NOTE MULTILINGUA
=========================== */

async function saveNote() {
  const titleIT = noteTitle.value.trim();
  const contentIT = noteContent.value.trim();
  const category = categorySelector.value;

  if (!titleIT && !contentIT) return;

  const translated = await translateNoteFull(titleIT, contentIT);

  notes.unshift({
    id: Date.now(),
    title: translated.title,
    content: translated.content,
    category
  });

  noteTitle.value = "";
  noteContent.value = "";

  saveAll();

  if (autoBackup) createBackup(true);

  renderNotes();
}

document.getElementById("saveNoteBtn").onclick = saveNote;
/* ===========================
   CESTINO
=========================== */

function deleteNote(id) {
  const n = notes.find(x => x.id === id);
  if (!n) return;

  notes = notes.filter(x => x.id !== id);
  deletedNotes.unshift(n);

  saveAll();
  renderNotes();
}

function restoreNote(id) {
  const n = deletedNotes.find(x => x.id === id);
  if (!n) return;

  deletedNotes = deletedNotes.filter(x => x.id !== id);
  notes.unshift(n);

  saveAll();
  renderNotes();
}

/* ===========================
   ARCHIVIO
=========================== */

function archiveNote(id) {
  const n = notes.find(x => x.id === id);
  if (!n) return;

  notes = notes.filter(x => x.id !== id);
  archivedNotes.unshift(n);

  saveAll();
  renderNotes();
}

function unarchiveNote(id) {
  const n = archivedNotes.find(x => x.id === id);
  if (!n) return;

  archivedNotes = archivedNotes.filter(x => x.id !== id);
  notes.unshift(n);

  saveAll();
  renderNotes();
}

/* ===========================
   POPUP CESTINO / ARCHIVIO
=========================== */

document.getElementById("openTrashBtn").onclick = () => {
  showTrash = !showTrash;
  if (showTrash) showArchive = false;
  renderNotes();
};

document.getElementById("openArchiveBtn").onclick = () => {
  showArchive = !showArchive;
  if (showArchive) showTrash = false;
  renderNotes();
};

/* ===========================
   POPUP IMPOSTAZIONI
=========================== */

document.getElementById("openSettingsBtn").onclick = () =>
  document.getElementById("settingsPopup").classList.remove("hidden");

document.getElementById("closeSettingsBtn").onclick = () =>
  document.getElementById("settingsPopup").classList.add("hidden");

/* ===========================
   POPUP SALVAGENTE
=========================== */

document.getElementById("openLifebuoyBtn").onclick = () =>
  document.getElementById("lifebuoyPopup").classList.remove("hidden");

document.getElementById("closeLifebuoyBtn").onclick = () =>
  document.getElementById("lifebuoyPopup").classList.add("hidden");

/* ===========================
   BACKUP MANUALE
=========================== */

function createBackup(silent = false) {
  const backups = JSON.parse(localStorage.getItem("backups") || "[]");

  backups.unshift({
    notes,
    deletedNotes,
    archivedNotes,
    categories,
    lang: currentLang,
    date: new Date().toLocaleString()
  });

  localStorage.setItem("backups", JSON.stringify(backups));

  if (!silent) {
    alert(
      currentLang === "it" ? "Backup creato." :
      currentLang === "de" ? "Backup erstellt." :
      currentLang === "en" ? "Backup created." :
      "Copia de seguridad creada."
    );
  }

  renderBackupList();
}

/* ===========================
   RIPRISTINO MANUALE
=========================== */

function restoreBackup(index) {
  const backups = JSON.parse(localStorage.getItem("backups") || "[]");
  const b = backups[index];
  if (!b) return;

  notes = b.notes || [];
  deletedNotes = b.deletedNotes || [];
  archivedNotes = b.archivedNotes || [];
  categories = b.categories || categories;
  currentLang = b.lang || "it";

  saveAll();
  renderCategories();
  renderNotes();
  renderBackupList();

  alert(
    currentLang === "it" ? "Backup ripristinato." :
    currentLang === "de" ? "Backup wiederhergestellt." :
    currentLang === "en" ? "Backup restored." :
    "Copia restaurada."
  );
}

/* ===========================
   BACKUP AUTOMATICO
=========================== */

function setAutoBackup(value) {
  autoBackup = value;
  localStorage.setItem("autoBackup", JSON.stringify(value));

  alert(
    currentLang === "it" ? "Backup automatico aggiornato." :
    currentLang === "de" ? "Automatisches Backup aktualisiert." :
    currentLang === "en" ? "Automatic backup updated." :
    "Copia automática actualizada."
  );
}

function restoreLatestBackupAuto() {
  const backups = JSON.parse(localStorage.getItem("backups") || "[]");
  if (!backups.length) {
    alert(
      currentLang === "it" ? "Nessun backup disponibile." :
      currentLang === "de" ? "Keine Backups verfügbar." :
      currentLang === "en" ? "No backups available." :
      "No hay copias disponibles."
    );
    return;
  }
  restoreBackup(0);
}

/* ===========================
   LISTA BACKUP
=========================== */

function renderBackupList() {
  const backupList = document.getElementById("backupList");
  backupList.innerHTML = "";

  const controls = document.createElement("div");
  controls.className = "backup-controls";

  controls.innerHTML = `
    <button id="btnBackupManuale" class="primary-btn">${
      currentLang === "it" ? "Backup manuale" :
      currentLang === "de" ? "Manuelles Backup" :
      currentLang === "en" ? "Manual backup" :
      "Copia manual"
    }</button>

    <button id="btnRipristinoManuale" class="secondary-btn">${
      currentLang === "it" ? "Ripristino manuale" :
      currentLang === "de" ? "Manuelle Wiederherstellung" :
      currentLang === "en" ? "Manual restore" :
      "Restauración manual"
    }</button>

    <button id="btnBackupAutomatico" class="secondary-btn">
      ${
        currentLang === "it" ? "Backup automatico: " :
        currentLang === "de" ? "Automatisches Backup: " :
        currentLang === "en" ? "Automatic backup: " :
        "Copia automática: "
      } ${autoBackup ? "ON" : "OFF"}
    </button>

    <button id="btnRipristinoAutomatico" class="secondary-btn">${
      currentLang === "it" ? "Ripristino automatico" :
      currentLang === "de" ? "Automatische Wiederherstellung" :
      currentLang === "en" ? "Automatic restore" :
      "Restauración automática"
    }</button>

    <hr/>
  `;

  backupList.appendChild(controls);

  document.getElementById("btnBackupManuale").onclick = () => createBackup(false);
  document.getElementById("btnRipristinoManuale").onclick = () => {
    const backups = JSON.parse(localStorage.getItem("backups") || "[]");
    if (!backups.length) return alert("Nessun backup.");
    const index = prompt("Quale backup vuoi ripristinare? (1 = più recente)");
    const i = parseInt(index, 10) - 1;
    if (!isNaN(i)) restoreBackup(i);
  };
  document.getElementById("btnBackupAutomatico").onclick = () => {
    setAutoBackup(!autoBackup);
    renderBackupList();
  };
  document.getElementById("btnRipristinoAutomatico").onclick = restoreLatestBackupAuto;

  const backups = JSON.parse(localStorage.getItem("backups") || "[]");

  backups.forEach((b, i) => {
    const div = document.createElement("div");
    div.className = "backup-item";
    div.innerHTML = `
      <p><strong>Backup ${i + 1}</strong> — ${b.date}</p>
      <button class="primary-btn">${
        currentLang === "it" ? "Ripristina" :
        currentLang === "de" ? "Wiederherstellen" :
        currentLang === "en" ? "Restore" :
        "Restaurar"
      }</button>
    `;
    div.querySelector("button").onclick = () => restoreBackup(i);
    backupList.appendChild(div);
  });
}

/* ===========================
   INIT
=========================== */

loadAll();
renderCategories();
renderNotes();
renderBackupList();
setLanguage(currentLang);
