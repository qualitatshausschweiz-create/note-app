// ===============================
// DATI
// ===============================
let notes = JSON.parse(localStorage.getItem("notes") || "[]");
let backupData = localStorage.getItem("notesBackup") || null;

let editingId = null;
let currentCategoryFilter = "all";

// ===============================
// RENDER NOTE
// ===============================
function renderNotes() {
  const container = document.getElementById("notes-container");
  container.innerHTML = "";

  let filtered = notes;
  if (currentCategoryFilter !== "all") {
    filtered = notes.filter(n => n.category === currentCategoryFilter);
  }

  if (filtered.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-text";
    empty.textContent = "Nessuna nota in questa categoria.";
    container.appendChild(empty);
    return;
  }

  filtered.forEach(note => {
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
    meta.textContent = formatDate(note.updatedAt);

    card.appendChild(title);
    card.appendChild(text);
    card.appendChild(meta);

    card.onclick = () => openEditor(note.id);

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

  localStorage.setItem("notes", JSON.stringify(notes));
  renderNotes();
  closeEditor();
}

function deleteCurrentNote() {
  if (editingId === null) {
    closeEditor();
    return;
  }
  notes = notes.filter(n => n.id !== editingId);
  localStorage.setItem("notes", JSON.stringify(notes));
  renderNotes();
  closeEditor();
}

// ===============================
// CATEGORIE
// ===============================
document.querySelectorAll(".category-btn").forEach(btn => {
  btn.addEventListener("click", () => {
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

document.getElementById("quick-backup-btn").onclick = () => {
  localStorage.setItem("notesBackup", JSON.stringify(notes));
  backupData = localStorage.getItem("notesBackup");
  alert("Backup veloce eseguito.");
};

document.getElementById("manual-restore-btn").onclick = () => {
  const data = localStorage.getItem("notesBackup");
  if (!data) {
    alert("Nessun backup trovato.");
    return;
  }
  notes = JSON.parse(data);
  localStorage.setItem("notes", JSON.stringify(notes));
  renderNotes();
  alert("Ripristino completato.");
};

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

document.getElementById("delete-all-notes-btn").onclick = () => {
  if (!confirm("Sei sicuro di voler cancellare tutte le note?")) return;
  notes = [];
  localStorage.setItem("notes", JSON.stringify(notes));
  renderNotes();
};

// ===============================
// BOTTONI EDITOR
// ===============================
document.getElementById("add-note-btn").onclick = () => openEditor(null);
document.getElementById("close-editor-btn").onclick = closeEditor;
document.getElementById("save-note-btn").onclick = saveNote;
document.getElementById("delete-note-btn").onclick = deleteCurrentNote;

// ===============================
// AVVIO
// ===============================
renderNotes();
