document.addEventListener("DOMContentLoaded", () => {

  // THEME
  const themeToggle = document.getElementById("themeToggle");
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeToggle.textContent = "🌙";
  } else {
    document.body.classList.remove("dark");
    themeToggle.textContent = "☀️";
  }

  themeToggle.onclick = () => {
    themeToggle.classList.add("animate");
    setTimeout(() => themeToggle.classList.remove("animate"), 250);

    if (document.body.classList.contains("dark")) {
      document.body.classList.remove("dark");
      themeToggle.textContent = "☀️";
      localStorage.setItem("theme", "light");
    } else {
      document.body.classList.add("dark");
      themeToggle.textContent = "🌙";
      localStorage.setItem("theme", "dark");
    }
  };

  // STORAGE
  let categories = JSON.parse(localStorage.getItem("categories")) || [
    { name: "Lavoro", color: "#1e90ff" },
    { name: "Spesa", color: "#ffa502" },
    { name: "Idee", color: "#a55eea" },
    { name: "Tutte", color: "#2ed573" }
  ];

  let notes = JSON.parse(localStorage.getItem("notes")) || [];
  let trash = JSON.parse(localStorage.getItem("trash")) || [];

  function saveCategories() { localStorage.setItem("categories", JSON.stringify(categories)); }
  function saveNotes() { localStorage.setItem("notes", JSON.stringify(notes)); }
  function saveTrash() { localStorage.setItem("trash", JSON.stringify(trash)); }

  // ELEMENTI
  const addNoteBtn = document.getElementById("addNoteBtn");
  const notePanel = document.getElementById("notePanel");
  const closeNotePanel = document.getElementById("closeNotePanel");
  const saveNoteBtn = document.getElementById("saveNoteBtn");
  const noteTitle = document.getElementById("noteTitle");
  const noteText = document.getElementById("noteText");
  const categoryButtons = document.getElementById("categoryButtons");
  const notePalette = document.getElementById("notePalette");
  const notesContainer = document.getElementById("notesContainer");

  const trashBtn = document.getElementById("trashBtn");
  const trashPanel = document.getElementById("trashPanel");
  const closeTrashPanel = document.getElementById("closeTrashPanel");
  const trashList = document.getElementById("trashList");

  const categoriesBtn = document.getElementById("categoriesBtn");
  const categoryPanel = document.getElementById("categoryPanel");
  const closeCategoryPanel = document.getElementById("closeCategoryPanel");
  const newCategoryName = document.getElementById("newCategoryName");
  const categoryPalette = document.getElementById("categoryPalette");
  const categoryColorPicker = document.getElementById("categoryColorPicker");
  const saveCategoryBtn = document.getElementById("saveCategoryBtn");
  const categoryList = document.getElementById("categoryList");

  const settingsBtn = document.getElementById("settingsBtn");
  const settingsPanel = document.getElementById("settingsPanel");
  const closeSettingsPanel = document.getElementById("closeSettingsPanel");

  const infoAppBtn = document.getElementById("infoAppBtn");
  const exportBackupBtn = document.getElementById("exportBackupBtn");
  const resetDataBtn = document.getElementById("resetDataBtn");
  const memoryStatusBtn = document.getElementById("memoryStatusBtn");

  let selectedCategory = null;
  let selectedNoteColor = "#1e90ff";
  let selectedCategoryColor = "#1e90ff";

  // NOTE
  addNoteBtn.onclick = () => {
    notePanel.classList.remove("hidden");
    setTimeout(() => notePanel.classList.add("show"), 10);
    renderCategoryButtons();
    renderNotePalette();
  };

  closeNotePanel.onclick = () => {
    notePanel.classList.remove("show");
    setTimeout(() => notePanel.classList.add("hidden"), 250);
  };

  function resetNoteForm() {
    noteTitle.value = "";
    noteText.value = "";
    selectedCategory = null;
    selectedNoteColor = "#1e90ff";
  }

  function renderCategoryButtons() {
    categoryButtons.innerHTML = "";
    categories.forEach(cat => {
      const btn = document.createElement("button");
      btn.className = "category-btn";
      btn.style.background = cat.color;
      btn.textContent = cat.name;

      btn.onclick = () => {
        selectedCategory = cat.name;
        document.querySelectorAll(".category-btn").forEach(b => b.style.opacity = "0.5");
        btn.style.opacity = "1";
      };

      categoryButtons.appendChild(btn);
    });
  }

  function renderNotePalette() {
    const colors = ["#ff6b6b", "#ffa502", "#2ed573", "#1e90ff", "#a55eea", "#000000", "#ffffff"];
    notePalette.innerHTML = "";

    colors.forEach(c => {
      const div = document.createElement("div");
      div.className = "color";
      div.style.background = c;

      div.onclick = () => {
        selectedNoteColor = c;
        document.querySelectorAll("#notePalette .color").forEach(x => x.classList.remove("selected"));
        div.classList.add("selected");
      };

      notePalette.appendChild(div);
    });

    const first = notePalette.querySelector(".color");
    if (first) first.classList.add("selected");
  }

  saveNoteBtn.onclick = () => {
    const titolo = noteTitle.value.trim();
    const testo = noteText.value.trim();
    if (!titolo && !testo) return;

    const categoriaScelta = selectedCategory || (categories.length > 0 ? categories[0].name : "Senza categoria");

    const newNote = {
      id: Date.now(),
      titolo,
      testo,
      colore: selectedNoteColor,
      categoria: categoriaScelta,
      data: new Date().toISOString()
    };

    notes.push(newNote);
    saveNotes();
    renderNotes();
    resetNoteForm();
    notePanel.classList.remove("show");
    setTimeout(() => notePanel.classList.add("hidden"), 250);
  };

  function renderNotes() {
    notesContainer.innerHTML = "";
    notes.forEach(n => {
      const div = document.createElement("div");
      div.className = "note";
      div.style.borderLeftColor = n.colore;

      div.innerHTML = `
        <h3>${n.titolo}</h3>
        <p>${n.testo}</p>
        <small>${n.categoria}</small><br>
        <button class="deleteNote">Elimina</button>
      `;

      div.querySelector(".deleteNote").onclick = () => {
        trash.push(n);
        notes = notes.filter(x => x.id !== n.id);
        saveNotes();
        saveTrash();
        renderNotes();
      };

      notesContainer.appendChild(div);
    });
  }

  // CESTINO
  trashBtn.onclick = () => {
    trashPanel.classList.remove("hidden");
    setTimeout(() => trashPanel.classList.add("show"), 10);
    renderTrash();
  };

  closeTrashPanel.onclick = () => {
    trashPanel.classList.remove("show");
    setTimeout(() => trashPanel.classList.add("hidden"), 250);
  };

  function renderTrash() {
    trashList.innerHTML = "";
    if (trash.length === 0) {
      trashList.textContent = "Cestino vuoto";
      return;
    }

    trash.forEach(n => {
      const div = document.createElement("div");
      div.className = "note";
      div.style.borderLeftColor = n.colore;

      div.innerHTML = `
        <h3>${n.titolo}</h3>
        <p>${n.testo}</p>
        <small>${n.categoria}</small><br>
        <button class="restoreNote">Ripristina</button>
        <button class="deleteForever">Elimina definitivamente</button>
      `;

      div.querySelector(".restoreNote").onclick = () => {
        notes.push(n);
        trash = trash.filter(x => x.id !== n.id);
        saveNotes();
        saveTrash();
        renderTrash();
        renderNotes();
      };

      div.querySelector(".deleteForever").onclick = () => {
        trash = trash.filter(x => x.id !== n.id);
        saveTrash();
        renderTrash();
      };

      trashList.appendChild(div);
    });
  }

  // CATEGORIE
  categoriesBtn.onclick = () => {
    categoryPanel.classList.remove("hidden");
    setTimeout(() => categoryPanel.classList.add("show"), 10);
    renderCategoryPalette();
    renderCategoryList();
  };

  closeCategoryPanel.onclick = () => {
    categoryPanel.classList.remove("show");
    setTimeout(() => categoryPanel.classList.add("hidden"), 250);
  };

  function renderCategoryPalette() {
    const colors = ["#ff6b6b", "#ffa502", "#2ed573", "#1e90ff", "#a55eea", "#000000", "#ffffff"];
    categoryPalette.innerHTML = "";

    colors.forEach(c => {
      const div = document.createElement("div");
      div.className = "color";
      div.style.background = c;

      div.onclick = () => {
        selectedCategoryColor = c;
        document.querySelectorAll("#categoryPalette .color").forEach(x => x.classList.remove("selected"));
        div.classList.add("selected");
        categoryColorPicker.value = c;
      };

      categoryPalette.appendChild(div);
    });

    const first = categoryPalette.querySelector(".color");
    if (first) {
      first.classList.add("selected");
      selectedCategoryColor = colors[0];
      categoryColorPicker.value = colors[0];
    }

    categoryColorPicker.oninput = (e) => {
      selectedCategoryColor = e.target.value;
      document.querySelectorAll("#categoryPalette .color").forEach(x => x.classList.remove("selected"));
    };
  }

  saveCategoryBtn.onclick = () => {
    const name = newCategoryName.value.trim();
    if (!name) return;

    categories.push({ name, color: selectedCategoryColor });
    saveCategories();
    newCategoryName.value = "";
    renderCategoryList();
    renderCategoryButtons();
  };

  function renderCategoryList() {
    categoryList.innerHTML = "";

    categories.forEach((cat, index) => {
      const row = document.createElement("div");
      row.className = "category-row";
      row.innerHTML = `
        <span>${cat.name}</span>
        <div style="display:flex;align-items:center;gap:8px;">
          <div style="width:16px;height:16px;border-radius:50%;background:${cat.color};"></div>
          <button data-index="${index}">❌</button>
        </div>
      `;

