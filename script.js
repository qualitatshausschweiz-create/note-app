document.addEventListener("DOMContentLoaded", () => {

  /* ---------------------- TEMA SOLE/LUNA ---------------------- */
  const themeToggle = document.getElementById("themeToggle");
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeToggle.textContent = "🌙";
  }

  themeToggle.onclick = () => {
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

  /* ---------------------- STORAGE ---------------------- */
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

  /* ---------------------- ELEMENTI ---------------------- */
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

  const importBackupBtn = document.getElementById("importBackupBtn");
  const syncCloudBtn = document.getElementById("syncCloudBtn");
  const autoThemeBtn = document.getElementById("autoThemeBtn");

  let selectedCategory = null;
  let selectedNoteColor = "#1e90ff";
  let selectedCategoryColor = "#1e90ff";

  /* ---------------------- ANIMAZIONE PANNELLI ---------------------- */
  function openPanel(panel) {
    panel.classList.remove("hidden");
    setTimeout(() => panel.classList.add("show"), 10);
  }

  function closePanel(panel) {
    panel.classList.remove("show");
    setTimeout(() => panel.classList.add("hidden"), 250);
  }

  /* ---------------------- NOTE ---------------------- */
  addNoteBtn.onclick = () => {
    openPanel(notePanel);
    renderCategoryButtons();
    renderNotePalette();
  };

  closeNotePanel.onclick = () => closePanel(notePanel);

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
      div.className = "color-dot";
      div.style.background = c;

      div.onclick = () => {
        selectedNoteColor = c;
        document.querySelectorAll(".color-dot").forEach(d => d.style.border = "none");
        div.style.border = "2px solid #000";
      };

      notePalette.appendChild(div);
    });
  }

  /* ---------------------- SALVATAGGIO NOTA ---------------------- */
  saveNoteBtn.onclick = () => {
    const title = noteTitle.value.trim();
    const text = noteText.value.trim();

    if (!title && !text) return;

    notes.push({
      id: Date.now(),
      title,
      text,
      category: selectedCategory || "Tutte",
      color: selectedNoteColor,
      date: new Date().toISOString()
    });

    saveNotes();
    renderNotes();
    resetNoteForm();
    closePanel(notePanel);
  };

  /* ---------------------- RENDER NOTE ---------------------- */
  function renderNotes() {
    notesContainer.innerHTML = "";

    notes.forEach(n => {
      const div = document.createElement("div");
      div.className = "note-item";
      div.style.background = n.color;

      div.innerHTML = `
        <h3>${n.title}</h3>
        <p>${n.text}</p>
        <small>${n.category}</small>
        <button class="delete-note">🗑️</button>
      `;

      div.querySelector(".delete-note").onclick = () => {
        trash.push(n);
        notes = notes.filter(x => x.id !== n.id);
        saveNotes();
        saveTrash();
        renderNotes();
      };

      notesContainer.appendChild(div);
    });
  }

  renderNotes();

  /* ---------------------- CESTINO ---------------------- */
  trashBtn.onclick = () => {
    openPanel(trashPanel);
    renderTrash();
  };

  closeTrashPanel.onclick = () => closePanel(trashPanel);

  function renderTrash() {
    trashList.innerHTML = "";

    trash.forEach(t => {
      const div = document.createElement("div");
      div.className = "trash-item";
      div.innerHTML = `
        <h3>${t.title}</h3>
        <p>${t.text}</p>
        <button class="restore">♻️</button>
        <button class="remove">❌</button>
      `;

      div.querySelector(".restore").onclick = () => {
        notes.push(t);
        trash = trash.filter(x => x.id !== t.id);
        saveNotes();
        saveTrash();
        renderTrash();
        renderNotes();
      };

      div.querySelector(".remove").onclick = () => {
        trash = trash.filter(x => x.id !== t.id);
        saveTrash();
        renderTrash();
      };

      trashList.appendChild(div);
    });
  }

  /* ---------------------- CATEGORIE ---------------------- */
  categoriesBtn.onclick = () => {
    openPanel(categoryPanel);
    renderCategoryList();
    renderCategoryPalette();
  };

  closeCategoryPanel.onclick = () => closePanel(categoryPanel);

  function renderCategoryPalette() {
    const colors = ["#ff6b6b", "#ffa502", "#2ed573", "#1e90ff", "#a55eea", "#000000", "#ffffff"];
    categoryPalette.innerHTML = "";

    colors.forEach(c => {
      const div = document.createElement("div");
      div.className = "color-dot";
      div.style.background = c;

      div.onclick = () => {
        selectedCategoryColor = c;
        document.querySelectorAll("#categoryPalette .color-dot").forEach(d => d.style.border = "none");
        div.style.border = "2px solid #000";
      };

      categoryPalette.appendChild(div);
    });
  }

  saveCategoryBtn.onclick = () => {
    const name = newCategoryName.value.trim();
    if (!name) return;

    categories.push({ name, color: selectedCategoryColor });
    saveCategories();
    renderCategoryList();
    newCategoryName.value = "";
  };

  function renderCategoryList() {
    categoryList.innerHTML = "";

    categories.forEach(cat => {
      const div = document.createElement("div");
      div.className = "category-item";
      div.style.background = cat.color;
      div.textContent = cat.name;

      div.onclick = () => {
        selectedCategory = cat.name;
        renderNotes();
        closePanel(categoryPanel);
      };

      categoryList.appendChild(div);
    });
  }

  /* ---------------------- IMPOSTAZIONI ---------------------- */
  settingsBtn.onclick = () => openPanel(settingsPanel);
  closeSettingsPanel.onclick = () => closePanel(settingsPanel);

  infoAppBtn.onclick = () => {
    alert("Note App — Versione 1.0\nCreata da Sandro");
  };

  exportBackupBtn.onclick = () => {
    const backup = {
      notes,
      categories,
      trash
    };
    const blob = new Blob([JSON.stringify(backup)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "backup_note_app.json";
    a.click();
  };

  resetDataBtn.onclick = () => {
    if (confirm("Vuoi davvero cancellare tutti i dati?")) {
      notes = [];
      categories = [];
      trash = [];
      saveNotes();
      saveCategories();
      saveTrash();
      renderNotes();
      alert("Dati cancellati");
    }
  };

  memoryStatusBtn.onclick = () => {
    const used = JSON.stringify(localStorage).length;
    alert(`Memoria usata: ${used} bytes`);
  };

  /* ---------------------- NUOVE FUNZIONI ---------------------- */

  importBackupBtn.onclick = () => {
    alert("Funzione Importa backup in arrivo!");
  };

 /* Pulsante Sync Cloud */
syncCloudBtn.onclick = () => {
  if (!accessToken) {
    getDriveToken(() => {
      uploadBackupToDrive();
    });
  } else {
    uploadBackupToDrive();
  }
};


  autoThemeBtn.onclick = () => {
    const hour = new Date().getHours();
    const isDay = hour >= 7 && hour <= 19;

    if (isDay) {
      document.body.classList.remove("dark");
      themeToggle.textContent = "☀️";
    } else {
      document.body.classList.add("dark");
      themeToggle.textContent = "🌙";
    }

    alert("Tema automatico attivato in base all'orario.");
  };

});
