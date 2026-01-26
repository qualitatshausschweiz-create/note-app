const noteTitle = document.getElementById("noteTitle");
const noteContent = document.getElementById("noteContent");
const categorySelector = document.getElementById("categorySelector");
const noteList = document.getElementById("noteList");

let notes = [];

function saveNote() {
  const title = noteTitle.value.trim();
  const content = noteContent.value.trim();
  const category = categorySelector.value;

  if (title === "" && content === "") return;

  const newNote = {
    id: Date.now(),
    title: title || "(Senza titolo)",
    content,
    category
  };

  notes.unshift(newNote);
  renderNotes();
  noteTitle.value = "";
  noteContent.value = "";
}

function deleteNote(id) {
  notes = notes.filter(n => n.id !== id);
  renderNotes();
}

function renderNotes() {
  noteList.innerHTML = "";

  notes.forEach(note => {
    const div = document.createElement("div");
    div.classList.add("note-item");

    div.innerHTML = `
      <h3>${note.title}</h3>
      <p>${note.content}</p>
      <span class="note-category" style="color:${getCategoryColor(note.category)};">${note.category}</span>
    `;

    noteList.appendChild(div);
  });
}

function getCategoryColor(cat) {
  const colors = {
    personale: "#ff9500",
    lavoro: "#34c759",
    idee: "#af52de",
    spesa: "#007aff",
    altro: "#5ac8fa",
    tutte: "#8e8e93"
  };
  return colors[cat] || "#8e8e93";
}

document.getElementById("saveNoteBtn").addEventListener("click", saveNote);
document.getElementById("cancelEditBtn").addEventListener("click", () => {
  noteTitle.value = "";
  noteContent.value = "";
});
