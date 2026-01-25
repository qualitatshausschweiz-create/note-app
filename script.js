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
  if (enteredPIN === savedPIN) {
    pinOverlay.style.display = "none";
  } else {
    pinError.textContent = "PIN errato";
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

let notes = JSON.parse(localStorage.getItem("notes") || "[]");
let editingId = null;

function saveNotes() {
  localStorage.setItem("notes", JSON.stringify(notes));
}

function renderNotes() {
  const list = document.getElementById("notesList");
  list.innerHTML = "";

  notes.forEach(n => {
    const div = document.createElement("div");
    div.className = "noteItem";
    div.innerHTML = `
      <h3>${n.title || "Senza titolo"}</h3>
      <p>${n.text.slice(0, 100)}</p>
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

  if (id) {
    const n = notes.find(x => x.id === id);
    title.value = n.title;
    text.value = n.text;
  } else {
    title.value = "";
    text.value = "";
  }

  editor.classList.remove("hidden");
}

document.getElementById("addNoteBtn").onclick = () => openEditor(null);

document.getElementById("saveNote").onclick = () => {
  const title = document.getElementById("noteTitle").value.trim();
  const text = document.getElementById("noteText").value.trim();

  if (!text) return;

  if (editingId) {
    const n = notes.find(x => x.id === editingId);
    n.title = title;
    n.text = text;
  } else {
    notes.push({
      id: Date.now(),
      title,
      text
    });
  }

  saveNotes();
  renderNotes();
  document.getElementById("editor").classList.add("hidden");
};

document.getElementById("cancelEdit").onclick = () => {
  document.getElementById("editor").classList.add("hidden");
};

document.getElementById("deleteNote").onclick = () => {
  if (!editingId) return;

  notes = notes.filter(n => n.id !== editingId);
  saveNotes();
  renderNotes();
  document.getElementById("editor").classList.add("hidden");
};

renderNotes();
