document.addEventListener("DOMContentLoaded", () => {

  /* TEMA SOLE/LUNA */
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

  /* STORAGE */
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

  /* ELEMENTI */
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
  const exportNotesOnlyBtn = document.getElementById("exportNotesOnlyBtn");
  const importBackupBtn = document.getElementById("importBackupBtn");
  const importFileInput = document.getElementById("importFileInput");

  const sortNotesBtn = document.getElementById("sortNotesBtn");
  const sortMenu = document.getElementById("sortMenu");
  const statsBtn = document.getElementById("statsBtn");

  const resetDataBtn = document.getElementById("resetDataBtn");
  const memoryStatusBtn = document.getElementById("memoryStatusBtn");

  let selectedCategory = null;
  let selectedNoteColor = "#1e90ff";
  let selectedCategoryColor = "#1e90ff";

  /* ANIMAZIONE PANNELLI */
  function openPanel(panel) {
    panel.classList.remove("hidden");
    setTimeout(() => panel.classList.add("show"), 10);
  }

  function closePanel(panel) {
    panel.classList.remove("show");
    setTimeout(() => panel.classList.add("hidden"), 250);
  }

  /* NOTE */
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
      div.className = "color";
      div.style.background = c;

      div.onclick = () => {
        selectedNoteColor = c;
        document.querySelectorAll("#notePalette .color").forEach(x => x.classList.remove("selected"));
        div.classList.add("selected");
      };

      notePalette.appendChild(div);
    });

    notePalette.querySelector(".color").classList.add("selected");
  }
  saveNoteBtn.onclick = () => {
    const titolo = noteTitle.value.trim();
    const testo = noteText.value.trim();
    if (!titolo && !testo) return;

    const categoriaScelta = selectedCategory || categories[0].name;

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
    closePanel(notePanel);
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

  renderNotes();

  /* CESTINO */
  trashBtn.onclick = () => {
    openPanel(trashPanel);
    renderTrash();
  };

  closeTrashPanel.onclick = () => closePanel(trashPanel);

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

  /* CATEGORIE */
  categoriesBtn.onclick = () => {
    openPanel(categoryPanel);
    renderCategoryPalette();
    renderCategoryList();
  };

  closeCategoryPanel.onclick = () => closePanel(categoryPanel);

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

    categoryPalette.querySelector(".color").classList.add("selected");
    categoryColorPicker.value = colors[0];

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
          <div style="width:16px;height:16px;border-radius:50%;background:${cat.color}"></div>
          <button data-index="${index}">❌</button>
        </div>
      `;

      row.querySelector("button").onclick = () => {
        categories.splice(index, 1);
        saveCategories();
        renderCategoryList();
        renderCategoryButtons();
      };

      categoryList.appendChild(row);
    });
  }

  /* ⚙️ IMPOSTAZIONI — NUOVE FUNZIONI */

  /* Esporta solo note */
  exportNotesOnlyBtn.onclick = () => {
    const data = JSON.stringify(notes, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "note_export.json";
    a.click();

    URL.revokeObjectURL(url);
  };

  /* Importa backup */
  importBackupBtn.onclick = () => {
    importFileInput.click();
  };

  importFileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);

        notes = data.notes || [];
        categories = data.categories || [];
        trash = data.trash || [];

        saveNotes();
        saveCategories();
        saveTrash();

        renderNotes();
        renderCategoryList();

        alert("Backup importato con successo!");
      } catch {
        alert("Errore: file non valido.");
      }
    };

    reader.readAsText(file);
  };

  /* Ordina note */
  sortNotesBtn.onclick = () => {
    sortMenu.classList.toggle("hidden");
  };

  document.querySelectorAll(".sortOption").forEach(btn => {
    btn.onclick = () => {
      const type = btn.dataset.sort;

      if (type === "newest") {
        notes.sort((a, b) => new Date(b.data) - new Date(a.data));
      }
      if (type === "oldest") {
        notes.sort((a, b) => new Date(a.data) - new Date(b.data));
      }
      if (type === "color") {
        notes.sort((a, b) => a.colore.localeCompare(b.colore));
      }
      if (type === "category") {
        notes.sort((a, b) => a.categoria.localeCompare(b.categoria));
      }

      saveNotes();
      renderNotes();
      sortMenu.classList.add("hidden");
    };
  });

  /* Statistiche */
  statsBtn.onclick = () => {
    const totalNotes = notes.length;
    const totalCategories = categories.length;
    const totalTrash = trash.length;

    const mostUsedCategory = notes.length
      ? notes.reduce((acc, n) => {
          acc[n.categoria] = (acc[n.categoria] || 0) + 1;
          return acc;
        }, {})
      : {};

    const topCategory = Object.entries(mostUsedCategory).sort((a, b) => b[1] - a[1])[0]?.[0] || "Nessuna";

    const mostUsedColor = notes.length
      ? notes.reduce((acc, n) => {
          acc[n.colore] = (acc[n.colore] || 0) + 1;
          return acc;
        }, {})
      : {};

    const topColor = Object.entries(mostUsedColor).sort((a, b) => b[1] - a[1])[0]?.[0] || "Nessuno";

    const lastNote = notes.length
      ? new Date(Math.max(...notes.map(n => new Date(n.data)))).toLocaleString()
      : "Nessuna";

    alert(
      `📊 STATISTICHE\n\n` +
      `Note totali: ${totalNotes}\n` +
      `Categorie: ${totalCategories}\n` +
      `Cestino: ${totalTrash}\n\n` +
      `Categoria più usata: ${topCategory}\n` +
      `Colore più usato: ${topColor}\n` +
      `Ultima nota: ${lastNote}`
    );
  };

  /* Pannello impostazioni */
  settingsBtn.onclick = () => openPanel(settingsPanel);
  closeSettingsPanel.onclick = () => closePanel(settingsPanel);

  /* Backup completo */
  exportBackupBtn.onclick = () => {
    const backup = { notes, categories, trash };
    const data = JSON.stringify(backup, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "backup_note_app.json";
    a.click();

    URL.revokeObjectURL(url);
  };

  /* Reset totale */
  resetDataBtn.onclick = () => {
    if (confirm("Vuoi davvero cancellare tutti i dati?")) {
      notes = [];
      categories = [];
      trash = [];
      saveNotes();
      saveCategories();
      saveTrash();
      renderNotes();
      renderCategoryList();
      alert("Dati cancellati.");
    }
  };

  /* Stato memoria */
  memoryStatusBtn.onclick = () => {
    const size = new Blob([JSON.stringify({ notes, categories, trash })]).size;
    alert("Memoria usata: " + size + " bytes");
  };

});
