/* ============================================================
   VARIABILI GLOBALI
============================================================ */

let notes = JSON.parse(localStorage.getItem("notes") || "[]");
let deletedNotes = JSON.parse(localStorage.getItem("deletedNotes") || "[]");
let archivedNotes = JSON.parse(localStorage.getItem("archivedNotes") || "[]");
let categories = JSON.parse(localStorage.getItem("categories") || "[]");

let currentLang = localStorage.getItem("lang") || "it";
let autoBackup = JSON.parse(localStorage.getItem("autoBackup") || "false");

let customPalette = JSON.parse(localStorage.getItem("customPalette") || "[]");
let selectedNoteColor = "#ff9500";

let showTrash = false;
let showArchive = false;

let fontSelected = localStorage.getItem("fontSelected") || "Inter";
let textSize = localStorage.getItem("textSize") || "m";
let animationsEnabled = JSON.parse(localStorage.getItem("animationsEnabled") || "true");

let showNoteCounter = JSON.parse(localStorage.getItem("showNoteCounter") || "false");
let showCategoryCounter = JSON.parse(localStorage.getItem("showCategoryCounter") || "false");

/* ============================================================
   SALVATAGGIO
============================================================ */

function saveAll() {
  localStorage.setItem("notes", JSON.stringify(notes));
  localStorage.setItem("deletedNotes", JSON.stringify(deletedNotes));
  localStorage.setItem("archivedNotes", JSON.stringify(archivedNotes));
  localStorage.setItem("categories", JSON.stringify(categories));
  localStorage.setItem("customPalette", JSON.stringify(customPalette));
}

/* ============================================================
   MULTILINGUA (SEMPLIFICATO)
============================================================ */

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem("lang", lang);
  renderNotes();
  renderCategories();
  renderBackupList();
}

/* ============================================================
   RENDER CATEGORIE
============================================================ */

function renderCategories() {
  const categoryList = document.getElementById("categoryList");
  const categorySelector = document.getElementById("categorySelector");

  if (!categoryList || !categorySelector) return;

  categoryList.innerHTML = "";
  categorySelector.innerHTML = "";

  const allOpt = document.createElement("option");
  allOpt.value = "tutte";
  allOpt.textContent = {
    it: "Tutte",
    en: "All",
    de: "Alle",
    es: "Todas"
  }[currentLang];
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
}

/* ============================================================
   RENDER NOTE
============================================================ */

function renderNotes() {
  const noteList = document.getElementById("noteList");
  if (!noteList) return;

  noteList.innerHTML = "";

  let list = showTrash ? deletedNotes :
             showArchive ? archivedNotes :
             notes;

  list.forEach(note => renderSingleNote(note));

  updateCounters();
}

function renderSingleNote(note) {
  const noteList = document.getElementById("noteList");
  const div = document.createElement("div");
  div.className = "note-item";
  div.style.borderLeftColor = note.color || "#ff9500";

  div.innerHTML = `
    <h3>${note.title[currentLang]}</h3>
    <p>${note.content[currentLang]}</p>
    <div class="note-footer">
      <span class="note-badge">${getCategoryName(note.category)}</span>
      ${renderNoteActions(note)}
    </div>
  `;

  attachNoteActions(div, note);
  noteList.appendChild(div);
}

function getCategoryName(id) {
  const c = categories.find(x => x.id === id);
  return c ? c.name[currentLang] : "";
}

/* ============================================================
   AZIONI NOTE
============================================================ */

function renderNoteActions(note) {
  if (showTrash) {
    return `<span class="note-restore">Ripristina</span>`;
  }
  if (showArchive) {
    return `<span class="note-restore">Rimuovi archivio</span>`;
  }
  return `
    <span class="note-delete">Elimina</span>
    <span class="note-archive">Archivia</span>
  `;
}

function attachNoteActions(div, note) {
  if (showTrash) {
    div.querySelector(".note-restore").onclick = () => restoreNote(note.id);
  } else if (showArchive) {
    div.querySelector(".note-restore").onclick = () => unarchiveNote(note.id);
  } else {
    div.querySelector(".note-delete").onclick = () => deleteNote(note.id);
    div.querySelector(".note-archive").onclick = () => archiveNote(note.id);
  }
}

function deleteNote(id) {
  const n = notes.find(x => x.id === id);
  notes = notes.filter(x => x.id !== id);
  deletedNotes.unshift(n);
  saveAll();
  renderNotes();
}

function restoreNote(id) {
  const n = deletedNotes.find(x => x.id === id);
  deletedNotes = deletedNotes.filter(x => x.id !== id);
  notes.unshift(n);
  saveAll();
  renderNotes();
}

function archiveNote(id) {
  const n = notes.find(x => x.id === id);
  notes = notes.filter(x => x.id !== id);
  archivedNotes.unshift(n);
  saveAll();
  renderNotes();
}

function unarchiveNote(id) {
  const n = archivedNotes.find(x => x.id === id);
  archivedNotes = archivedNotes.filter(x => x.id !== id);
  notes.unshift(n);
  saveAll();
  renderNotes();
}

/* ============================================================
   SALVATAGGIO NOTE + COLORE
============================================================ */

async function saveNote() {
  const titleIT = document.getElementById("noteTitle").value.trim();
  const contentIT = document.getElementById("noteContent").value.trim();
  const category = document.getElementById("categorySelector").value;

  if (!titleIT && !contentIT) return;

  const translated = await translateNoteFull(titleIT, contentIT);

  notes.unshift({
    id: Date.now(),
    title: translated.title,
    content: translated.content,
    category,
    color: selectedNoteColor
  });

  saveAll();
  renderNotes();
}

/* ============================================================
   PALETTE COLORI DINAMICA
============================================================ */

function renderPalette() {
  const palette = document.getElementById("noteColorPalette");
  palette.innerHTML = "";

  const defaultColors = [
    "#ff3b30", "#ff9500", "#ffcc00",
    "#34c759", "#007aff", "#5856d6",
    "#af52de", "#ff2d55"
  ];

  [...defaultColors, ...customPalette].forEach(color => {
    const div = document.createElement("div");
    div.style.background = color;
    div.onclick = () => selectColor(color);
    palette.appendChild(div);
  });
}

function selectColor(color) {
  selectedNoteColor = color;

  if (!customPalette.includes(color)) {
    customPalette.push(color);
    localStorage.setItem("customPalette", JSON.stringify(customPalette));
  }

  renderPalette();
}

/* ============================================================
   FONT
============================================================ */

function applyFont() {
  document.body.style.fontFamily = fontSelected;
}

document.getElementById("fontSelector").onchange = e => {
  fontSelected = e.target.value;
  localStorage.setItem("fontSelected", fontSelected);
  applyFont();
};

/* ============================================================
   DIMENSIONE TESTO
============================================================ */

function applyTextSize() {
  document.body.style.fontSize = {
    s: "var(--text-s)",
    m: "var(--text-m)",
    l: "var(--text-l)"
  }[textSize];
}

document.querySelectorAll(".text-size-btn").forEach(btn => {
  btn.onclick = () => {
    textSize = btn.dataset.size;
    localStorage.setItem("textSize", textSize);
    document.querySelectorAll(".text-size-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    applyTextSize();
  };
});

/* ============================================================
   SWITCH iOS
============================================================ */

document.getElementById("toggleAnimations").onchange = e => {
  animationsEnabled = e.target.checked;
  localStorage.setItem("animationsEnabled", animationsEnabled);
};

document.getElementById("toggleAutoBackup").onchange = e => {
  autoBackup = e.target.checked;
  localStorage.setItem("autoBackup", autoBackup);
};

document.getElementById("toggleNoteCounter").onchange = e => {
  showNoteCounter = e.target.checked;
  localStorage.setItem("showNoteCounter", showNoteCounter);
  updateCounters();
};

document.getElementById("toggleCategoryCounter").onchange = e => {
  showCategoryCounter = e.target.checked;
  localStorage.setItem("showCategoryCounter", showCategoryCounter);
  updateCounters();
};

/* ============================================================
   CONTATORI
============================================================ */

function updateCounters() {
  const noteCounter = document.getElementById("noteCounter");
  const catCounter = document.getElementById("categoryCounter");

  if (noteCounter) noteCounter.style.display = showNoteCounter ? "block" : "none";
  if (catCounter) catCounter.style.display = showCategoryCounter ? "block" : "none";

  if (noteCounter) noteCounter.textContent = `Note totali: ${notes.length}`;
  if (catCounter) catCounter.textContent = `Categorie: ${categories.length}`;
}

/* ============================================================
   RESET
============================================================ */

document.getElementById("resetCategoriesBtn").onclick = () => {
  if (!confirm("Ripristinare le categorie originali?")) return;

  categories = [
    {
      id: "work",
      color: "#007aff",
      name: { it: "Lavoro", en: "Work", de: "Arbeit", es: "Trabajo" }
    },
    {
      id: "personal",
      color: "#ff9500",
      name: { it: "Personale", en: "Personal", de: "Persönlich", es: "Personal" }
    }
  ];

  saveAll();
  renderCategories();
};

document.getElementById("resetNotesBtn").onclick = () => {
  if (!confirm("Cancellare tutte le note?")) return;

  notes = [];
  deletedNotes = [];
  archivedNotes = [];

  saveAll();
  renderNotes();
};

/* ============================================================
   INIT
============================================================ */

function init() {
  applyFont();
  applyTextSize();
  renderPalette();
  renderCategories();
  renderNotes();
  updateCounters();

  document.getElementById("toggleAnimations").checked = animationsEnabled;
  document.getElementById("toggleAutoBackup").checked = autoBackup;
  document.getElementById("toggleNoteCounter").checked = showNoteCounter;
  document.getElementById("toggleCategoryCounter").checked = showCategoryCounter;

  document.getElementById("fontSelector").value = fontSelected;
}

init();
