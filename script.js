let notes = JSON.parse(localStorage.getItem("notes")) || [];
let editingNoteId = null;

function saveNotes() {
  localStorage.setItem("notes", JSON.stringify(notes));
}

function renderNotes() {
  const container = document.getElementById("notes-container");
  container.innerHTML = "";
  notes.forEach(note => {
    const div = document.createElement("div");
    div.className = "note";
    div.onclick = () => openEditor(note.id);
    div.innerHTML = `
      <div class="note-title">${note.title}</div>
      <div class="note-content">${note.content}</div>
    `;
    container.appendChild(div);
  });
}

function openEditor(id = null) {
  editingNoteId = id;
  if (id) {
    const note = notes.find(n => n.id === id);
    document.getElementById("note-title-input").value = note.title;
    document.getElementById("note-content-input").value = note.content;
  } else {
    document.getElementById("note-title-input").value = "";
    document.getElementById("note-content-input").value = "";
  }
  document.getElementById("editor-panel").style.right = "0";
}

function closeEditor() {
  document.getElementById("editor-panel").style.right = "-100%";
}

document.getElementById("save-note-btn").onclick = () => {
  const title = document.getElementById("note-title-input").value.trim();
  const content = document.getElementById("note-content-input").value.trim();
  if (!title && !content) return;

  if (editingNoteId) {
    const note = notes.find(n => n.id === editingNoteId);
    note.title = title;
    note.content = content;
  } else {
    notes.push({ id: Date.now(), title, content });
  }

  saveNotes();
  renderNotes();
  closeEditor();
};

document.getElementById("close-editor-btn").onclick = closeEditor;
document.getElementById("add-note-btn").onclick = () => openEditor(null);

const settings = { theme: "light" };

function applyTheme() {
  document.body.setAttribute("data-theme", settings.theme);
  document.getElementById("theme-toggle-btn").textContent =
    settings.theme === "light" ? "🌞" : "🌙";
}

document.getElementById("theme-toggle-btn").onclick = () => {
  settings.theme = settings.theme === "light" ? "dark" : "light";
  applyTheme();
};

applyTheme();
renderNotes();
