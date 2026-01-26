let notes = JSON.parse(localStorage.getItem("notes")) || [];
let trash = JSON.parse(localStorage.getItem("trash")) || [];

let settings = JSON.parse(localStorage.getItem("settings")) || {
  theme: "light",
  language: "it",
  font: "default",
  textSize: 16,
  privacy: false,
  transparency: false,
  animations: true,
  animationSpeed: "normal",
  autoBackup: true,
  autoRestore: true
};

let backupData = JSON.parse(localStorage.getItem("backupData")) || null;
let editingNoteId = null;

function saveNotes() {
  localStorage.setItem("notes", JSON.stringify(notes));
}
function saveTrash() {
  localStorage.setItem("trash", JSON.stringify(trash));
}
function saveSettings() {
  localStorage.setItem("settings", JSON.stringify(settings));
}
function saveBackup() {
  backupData = { notes, trash, settings };
  localStorage.setItem("backupData", JSON.stringify(backupData));
}

function applySettingsToDOM() {
  document.body.setAttribute("data-theme", settings.theme);
  document.getElementById("theme-toggle-btn").textContent =
    settings.theme === "light" ? "🌞" : "🌙";

  document.getElementById("language-select").value = settings.language;
  document.getElementById("font-select").value = settings.font;
  document.getElementById("text-size-slider").value = settings.textSize;
  document.getElementById("privacy-toggle").checked = settings.privacy;
  document.getElementById("transparency-toggle").checked = settings.transparency;
  document.getElementById("animation-speed-select").value = settings.animationSpeed;

  document.documentElement.style.setProperty("--note-font-size", settings.textSize + "px");

  document.body.classList.remove("font-serif", "font-mono");
  if (settings.font === "serif") document.body.classList.add("font-serif");
  if (settings.font === "mono") document.body.classList.add("font-mono");

  if (!settings.animations) document.body.classList.add("no-animations");
  else document.body.classList.remove("no-animations");

  let speed = "0.25s";
  if (settings.animationSpeed === "fast") speed = "0.15s";
  if (settings.animationSpeed === "slow") speed = "0.4s";
  document.documentElement.style.setProperty("--transition-speed", speed);
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
  if (settings.autoBackup) saveBackup();
};

document.getElementById("close-editor-btn").onclick = closeEditor;
document.getElementById("add-note-btn").onclick = () => openEditor(null);

function openTrash() {
  const panel = document.getElementById("trash-panel");
  panel.style.right = "0";
  const container = document.getElementById("trash-container");
  container.innerHTML = "";
  trash.forEach(item => {
    const div = document.createElement("div");
    div.className = "trash-item";
    div.innerHTML = `
      <div><strong>${item.title}</strong></div>
      <div>${item.content}</div>
      <button class="restore-btn">Ripristina</button>
    `;
    div.querySelector(".restore-btn").onclick = () => restoreFromTrash(item.id);
    container.appendChild(div);
  });
}
function closeTrash() {
  document.getElementById("trash-panel").style.right = "-100%";
}
function restoreFromTrash(id) {
  const item = trash.find(t => t.id === id);
  notes.push(item);
  trash = trash.filter(t => t.id !== id);
  saveNotes();
  saveTrash();
  renderNotes();
  openTrash();
}
document.getElementById("close-trash-btn").onclick = closeTrash;
document.getElementById("open-trash-btn").onclick = openTrash;

document.getElementById("manual-backup-btn").onclick = () => saveBackup();
document.getElementById("manual-restore-btn").onclick = () => {
  if (!backupData) return;
  notes = backupData.notes;
  trash = backupData.trash;
  settings = backupData.settings;
  saveNotes();
  saveTrash();
  saveSettings();
  applySettingsToDOM();
  renderNotes();
};
document.getElementById("toggle-auto-backup-btn").onclick = () => {
  settings.autoBackup = !settings.autoBackup;
  saveSettings();
};
document.getElementById("toggle-auto-restore-btn").onclick = () => {
  settings.autoRestore = !settings.autoRestore;
  saveSettings();
};
document.getElementById("delete-backup-btn").onclick = () => {
  backupData = null;
  localStorage.removeItem("backupData");
};
document.getElementById("close-lifebuoy-btn").onclick = () => {
  document.getElementById("lifebuoy-panel").style.right = "-100%";
};

document.getElementById("settings-btn").onclick = () => {
  document.getElementById("settings-panel").style.right = "0";
};
document.getElementById("close-settings-btn").onclick = () => {
  document.getElementById("settings-panel").style.right = "-100%";
};

document.getElementById("theme-toggle-btn").onclick = () => {
  settings.theme = settings.theme === "light" ? "dark" : "light";
  saveSettings();
  applySettingsToDOM();
};

document.getElementById("language-select").onchange = e => {
  settings.language = e.target.value;
  saveSettings();
};
document.getElementById("font-select").onchange = e => {
  settings.font = e.target.value;
  saveSettings();
  applySettingsToDOM();
};
document.getElementById("text-size-slider").oninput = e => {
  settings.textSize = parseInt(e.target.value);
  saveSettings();
  applySettingsToDOM();
};
document.getElementById("privacy-toggle").onchange = e => {
  settings.privacy = e.target.checked;
  saveSettings();
};
document.getElementById("transparency-toggle").onchange = e => {
  settings.transparency = e.target.checked;
  saveSettings();
};
document.getElementById("animation-speed-select").onchange = e => {
  settings.animationSpeed = e.target.value;
  saveSettings();
  applySettingsToDOM();
};

document.getElementById("reset-layout-btn").onclick = () => {
  settings.font = "default";
  settings.textSize = 16;
  settings.transparency = false;
  settings.animations = true;
  settings.animationSpeed = "normal";
  saveSettings();
  applySettingsToDOM();
};
document.getElementById("reset-app-btn").onclick = () => {
  localStorage.clear();
  location.reload();
};

document.getElementById("lifebuoy-btn").onclick = () => {
  document.getElementById("lifebuoy-panel").style.right = "0";
};

document.getElementById("ai-chat-btn").onclick = () => {
  document.getElementById("ai-chat-panel").style.right = "0";
};
document.getElementById("close-ai-chat-btn").onclick = () => {
  document.getElementById("ai-chat-panel").style.right = "-100%";
};

document.getElementById("ai-chat-send-btn").onclick = sendAIMessage;
document.getElementById("ai-chat-input").addEventListener("keypress", e => {
  if (e.key === "Enter") sendAIMessage();
});

function sendAIMessage() {
  const input = document.getElementById("ai-chat-input");
  const text = input.value.trim();
  if (!text) return;
  addUserMessage(text);
  input.value = "";
  setTimeout(() => {
    addAIMessage("Risposta generata dall’AI (placeholder).");
  }, 400);
}

function addUserMessage(text) {
  const container = document.getElementById("ai-chat-messages");
  const div = document.createElement("div");
  div.className = "user-msg";
  div.innerHTML = `
    <div class="avatar avatar-user"></div>
    <div>${text}</div>
  `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function addAIMessage(text) {
  const container = document.getElementById("ai-chat-messages");
  const div = document.createElement("div");
  div.className = "ai-msg";
  div.innerHTML = `
    <div class="avatar avatar-ai"></div>
    <div>${text}</div>
  `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

applySettingsToDOM();
renderNotes();

if (settings.autoRestore && backupData) {
  notes = backupData.notes;
  trash = backupData.trash;
  settings = backupData.settings;
  saveNotes();
  saveTrash();
  saveSettings();
  applySettingsToDOM();
  renderNotes();
}
