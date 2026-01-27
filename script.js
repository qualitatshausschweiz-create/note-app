/* ============================================================
   DATI IN LOCALSTORAGE
============================================================ */

let notes = JSON.parse(localStorage.getItem("notes") || "[]");
let categories = JSON.parse(localStorage.getItem("categories") || "[]");
let trash = JSON.parse(localStorage.getItem("trash") || "[]");

/* Categorie di default */
if (categories.length === 0) {
  categories = [
    { id: "personale", name: "Personale", color: "#ff9500" },
    { id: "lavoro", name: "Lavoro", color: "#34c759" },
    { id: "idee", name: "Idee", color: "#af52de" },
    { id: "spesa", name: "Spesa", color: "#007aff" },
    { id: "tutte", name: "Tutte", color: "#8e8e93" },
    { id: "altro", name: "Altro", color: "#5ac8fa" }
  ];
  localStorage.setItem("categories", JSON.stringify(categories));
}

/* ============================================================
   SALVA NOTE
============================================================ */

document.getElementById("saveNoteBtn").onclick = () => {
  const title = document.getElementById("noteTitle").value.trim();
  const content = document.getElementById("noteContent").value.trim();
  const category = document.getElementById("categorySelector").value;

  if (!title && !content) return;

  notes.unshift({
    id: Date.now(),
    title,
    content,
    category
  });

  localStorage.setItem("notes", JSON.stringify(notes));

  document.getElementById("noteTitle").value = "";
  document.getElementById("noteContent").value = "";

  renderNotes();
};

/* ============================================================
   ELIMINA NOTE (solo pulizia campi)
============================================================ */

document.getElementById("deleteNoteBtn").onclick = () => {
  document.getElementById("noteTitle").value = "";
  document.getElementById("noteContent").value = "";
};

/* ============================================================
   MANDARE UNA NOTA NEL CESTINO
============================================================ */

function moveToTrash(id) {
  const note = notes.find(n => n.id == id);
  if (!note) return;

  trash.unshift(note);
  notes = notes.filter(n => n.id != id);

  localStorage.setItem("notes", JSON.stringify(notes));
  localStorage.setItem("trash", JSON.stringify(trash));

  renderNotes();
}

/* ============================================================
   RENDER NOTE (VERSIONE AGGIORNATA CON ICONA 🗑️)
============================================================ */

function renderNotes(filter = "tutte") {
  const list = document.getElementById("noteList");
  list.innerHTML = "";

  let filteredNotes = notes;

  if (filter !== "tutte") {
    filteredNotes = notes.filter(n => n.category === filter);
  }

  filteredNotes.forEach(note => {
    const div = document.createElement("div");
    div.className = "note-item";

    const cat = categories.find(c => c.id === note.category);

    div.innerHTML = `
      <h3>${note.title || "(Senza titolo)"}</h3>
      <p>${note.content}</p>
      <span class="note-category" style="background:${cat.color}">
        ${cat.name}
      </span>

      <div class="note-actions">
        <span class="delete-note-btn" data-id="${note.id}">🗑️</span>
      </div>
    `;

    list.appendChild(div);
  });

  document.querySelectorAll(".delete-note-btn").forEach(btn => {
    btn.onclick = () => moveToTrash(btn.dataset.id);
  });
}

/* ============================================================
   RENDER CATEGORIE
============================================================ */

function renderCategories() {
  const ul = document.getElementById("categoryList");
  ul.innerHTML = "";

  categories.forEach(cat => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span class="color-dot" style="background:${cat.color}"></span>
      ${cat.name}
    `;
    li.onclick = () => {
      renderNotes(cat.id);
    };
    ul.appendChild(li);
  });
}

/* ============================================================
   AGGIUNGI CATEGORIA
============================================================ */

document.getElementById("addCategoryBtn").onclick = () => {
  const name = prompt("Nome nuova categoria:");
  if (!name) return;

  const newCat = {
    id: name.toLowerCase().replace(/\s+/g, "-"),
    name,
    color: "#007aff"
  };

  categories.push(newCat);
  localStorage.setItem("categories", JSON.stringify(categories));

  renderCategories();
};

/* ============================================================
   INIT
============================================================ */

renderCategories();
renderNotes();
