/* ========== STATE ========== */
let notes = [];
let deletedNotes = [];
let archivedNotes = [];

let categories = [
  { id: "personale", name: "Personale", color: "#ff9500" },
  { id: "lavoro", name: "Lavoro", color: "#34c759" },
  { id: "idee", name: "Idee", color: "#af52de" },
  { id: "spesa", name: "Spesa", color: "#007aff" },
  { id: "altro", name: "Altro", color: "#5ac8fa" }
];

let showTrash = false;
let showArchive = false;

/* ========== ELEMENTS ========== */
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

const openTrashBtn = document.getElementById("openTrashBtn");
const openArchiveBtn = document.getElementById("openArchiveBtn");

const openLifebuoyBtn = document.getElementById("openLifebuoyBtn");
const lifebuoyPopup = document.getElementById("lifebuoyPopup");
const closeLifebuoyBtn = document.getElementById("closeLifebuoyBtn");

const createBackupBtn = document.getElementById("createBackupBtn");
const importBackupBtn = document.getElementById("importBackupBtn");
const exportDataBtn = document.getElementById("exportDataBtn");
const backupList = document.getElementById("backupList");

const addCategoryBtn = document.getElementById("addCategoryBtn");
const saveNoteBtn = document.getElementById("saveNoteBtn");

/* ========== STORAGE ========== */
function saveAll() {
  localStorage.setItem("notes", JSON.stringify(notes));
  localStorage.setItem("deletedNotes", JSON.stringify(deletedNotes));
  localStorage.setItem("archivedNotes", JSON.stringify(archivedNotes));
  localStorage.setItem("categories", JSON.stringify(categories));
  const settings = {
    theme: document.documentElement.getAttribute("data-theme") || "light",
    accent: getComputedStyle(document.documentElement).getPropertyValue("--accent").trim()
  };
  localStorage.setItem("settings", JSON.stringify(settings));
}

function loadAll() {
  notes = JSON.parse(localStorage.getItem("notes") || "[]");
  deletedNotes = JSON.parse(localStorage.getItem("deletedNotes") || "[]");
  archivedNotes = JSON.parse(localStorage.getItem("archivedNotes") || "[]");
  const storedCats = localStorage.getItem("categories");
  if (storedCats) categories = JSON.parse(storedCats);

  const s = localStorage.getItem("settings");
  if (s) {
    const settings = JSON.parse(s);
    if (settings.theme) {
      document.documentElement.setAttribute("data-theme", settings.theme);
      themeToggleBtn.textContent = settings.theme === "dark" ? "🌙" : "🌞";
      if (themeSelect) themeSelect.value = settings.theme;
    }
    if (settings.accent) {
      document.documentElement.style.setProperty("--accent", settings.accent);
      if (customColorPicker) customColorPicker.value = settings.accent;
    }
  }
}

/* ========== NOTES ========== */
function saveNote() {
  const title = noteTitle.value.trim();
  const content = noteContent.value.trim();
  const category = categorySelector.value;

  if (!title && !content) return;

  notes.unshift({
    id: Date.now(),
    title: title || "(Senza titolo)",
    content,
    category
  });

  noteTitle.value = "";
  noteContent.value = "";

  saveAll();
  renderNotes();
}
saveNoteBtn.addEventListener("click", saveNote);

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

/* ========== RENDER NOTES ========== */
function renderNotes() {
  noteList.innerHTML = "";

  let list = showTrash ? deletedNotes : showArchive ? archivedNotes : notes;

  const q = (searchInput?.value || "").toLowerCase();
  if (q) {
    list = list.filter(
      n =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q)
    );
  }

  list.forEach(note => {
    const div = document.createElement("div");
    div.className = "note-item";

    const cat = categories.find(c => c.id === note.category);
    const catName = cat ? cat.name : note.category;

    let actionsHTML = "";
    if (showTrash) {
      actionsHTML = `<span class="note-restore" style="color:#34c759;">🟢 Ripristina</span>`;
    } else if (showArchive) {
      actionsHTML = `<span class="note-restore" style="color:#ff9500;">Rimuovi archivio</span>`;
    } else {
      actionsHTML = `
        <span class="note-delete" style="color:#ff3b30;">Elimina</span>
        <span class="note-archive" style="color:#af52de;">Archivia</span>
      `;
    }

    div.innerHTML = `
      <h3>${note.title}</h3>
      <p>${note.content}</p>
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
  });

  applyAccent();
}

/* ========== CATEGORIES ========== */
function renderCategories() {
  categoryList.innerHTML = "";
  categorySelector.innerHTML = "";

  // voce "Tutte"
  const allOpt = document.createElement("option");
  allOpt.value = "tutte";
  allOpt.textContent = "Tutte";
  categorySelector.appendChild(allOpt);

  categories.forEach(cat => {
    const li = document.createElement("li");
    li.className = "category-item";
    li.innerHTML = `<span class="color-dot" style="background:${cat.color}"></span>${cat.name}`;
    li.onclick = () => filterCategory(cat.id);
    categoryList.appendChild(li);

    const opt = document.createElement("option");
    opt.value = cat.id;
    opt.textContent = cat.name;
    categorySelector.appendChild(opt);
  });

  categorySelector.value = "personale";
}

function filterCategory(id) {
  if (id === "tutte") {
    showTrash = false;
    showArchive = false;
    renderNotes();
    return;
  }
  noteList.innerHTML = "";
  const baseList = showTrash ? deletedNotes : showArchive ? archivedNotes : notes;
  baseList
    .filter(n => n.category === id)
    .forEach(n => {
      const div = document.createElement("div");
      div.className = "note-item";
      div.innerHTML = `<h3>${n.title}</h3><p>${n.content}</p>`;
      noteList.appendChild(div);
    });
  applyAccent();
}

addCategoryBtn.onclick = () => {
  const name = prompt("Nome categoria:");
  if (!name) return;
  const color = prompt("Colore HEX:", "#ff9500") || "#ff9500";
  categories.push({ id: name.toLowerCase(), name, color });
  saveAll();
  renderCategories();
};

/* ========== THEME & PALETTE ========== */
themeToggleBtn.onclick = () => {
  const t = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", t);
  themeToggleBtn.textContent = t === "dark" ? "🌙" : "🌞";
  saveAll();
};

const advancedPalette = [
  "#ff2d55","#ff3b30","#ff9500","#ffcc00",
  "#34c759","#30d158","#5ac8fa","#007aff",
  "#0a84ff","#af52de","#bf5af2","#ff9f0a",
  "#ffd60a","#64d2ff","#32ade6","#8e8e93"
];

function renderAdvancedPalette() {
  const paletteContainer = document.querySelector(".color-palette");
  if (!paletteContainer) return;
  paletteContainer.innerHTML = "";
  advancedPalette.forEach(color => {
    const swatch = document.createElement("div");
    swatch.className = "color-swatch";
    swatch.style.background = color;
    swatch.onclick = () => {
      document.documentElement.style.setProperty("--accent", color);
      if (customColorPicker) customColorPicker.value = color;
      applyAccent();
      saveAll();
    };
    paletteContainer.appendChild(swatch);
  });
}

customColorPicker.oninput = e => {
  document.documentElement.style.setProperty("--accent", e.target.value);
  applyAccent();
  saveAll();
};

function applyAccent() {
  document.querySelectorAll(".note-badge").forEach(b => {
    b.style.background = "var(--accent)";
    b.style.color = "white";
  });
}

/* ========== POPUP ========== */
openSettingsBtn.onclick = () => settingsPopup.classList.remove("hidden");
closeSettingsBtn.onclick = () => settingsPopup.classList.add("hidden");

openLifebuoyBtn.onclick = () => lifebuoyPopup.classList.remove("hidden");
closeLifebuoyBtn.onclick = () => lifebuoyPopup.classList.add("hidden");

/* ========== TRASH & ARCHIVE ========== */
openTrashBtn.onclick = () => {
  showTrash = !showTrash;
  if (showTrash) showArchive = false;
  renderNotes();
};

openArchiveBtn.onclick = () => {
  showArchive = !showArchive;
  if (showArchive) showTrash = false;
  renderNotes();
};

/* ========== BACKUP ========== */
function renderBackupList() {
  backupList.innerHTML = "";
  const backups = JSON.parse(localStorage.getItem("backups") || "[]");
  backups.forEach((b, i) => {
    const div = document.createElement("div");
    div.className = "backup-item";
    div.innerHTML = `
      <p><strong>Backup ${i + 1}</strong> — ${b.date}</p>
      <button class="primary-btn">Ripristina</button>
    `;
    div.querySelector("button").onclick = () => restoreBackup(i);
    backupList.appendChild(div);
  });
}

function createBackup() {
  const backups = JSON.parse(localStorage.getItem("backups") || "[]");
  backups.unshift({
    notes,
    deletedNotes,
    archivedNotes,
    categories,
    date: new Date().toLocaleString()
  });
  localStorage.setItem("backups", JSON.stringify(backups));
  renderBackupList();
}
createBackupBtn.onclick = createBackup;

function restoreBackup(i) {
  const backups = JSON.parse(localStorage.getItem("backups") || "[]");
  const b = backups[i];
  if (!b) return;
  notes = b.notes;
  deletedNotes = b.deletedNotes;
  archivedNotes = b.archivedNotes;
  categories = b.categories;
  saveAll();
  renderCategories();
  renderNotes();
  alert("Backup ripristinato.");
}

exportDataBtn.onclick = () => {
  const data = { notes, deletedNotes, archivedNotes, categories };
  const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "backup.json";
  a.click();
  URL.revokeObjectURL(url);
};

/* ========== INIT ========== */
loadAll();
renderCategories();
renderNotes();
renderAdvancedPalette();
renderBackupList();
