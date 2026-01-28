document.addEventListener("DOMContentLoaded", () => {

  /* GOOGLE DRIVE CONFIG */
  const CLIENT_ID = "792122447047-u30lrb5oo1jjbnkibfh420ah0o95e3d8.apps.googleusercontent.com";
  const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";
  let accessToken = null;

  function getDriveToken(callback) {
    const tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: DRIVE_SCOPE,
      callback: (response) => {
        if (response.access_token) {
          accessToken = response.access_token;
          callback();
        } else {
          alert("Errore nel recupero del token Google Drive.");
        }
      }
    });

    tokenClient.requestAccessToken();
  }

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

  /* BACKUP OBJECT */
  function createBackupObject() {
    return {
      notes,
      categories,
      trash
    };
  }

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
  const resetDataBtn = document.getElementById("resetDataBtn");
  const memoryStatusBtn = document.getElementById("memoryStatusBtn");
  const syncCloudBtn = document.getElementById("syncCloudBtn");

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

  /* IMPOSTAZIONI — ⚙️ */
  settingsBtn.onclick = () => {
    openPanel(settingsPanel);
  };

  closeSettingsPanel.onclick = () => {
    closePanel(settingsPanel);
  };

  infoAppBtn.onclick = () => {
    alert("Note App — Versione 1.0\nSviluppata da Sandro");
  };

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

  memoryStatusBtn.onclick = () => {
    const size = new Blob([JSON.stringify({ notes, categories, trash })]).size;
    alert("Memoria usata: " + size + " bytes");
  };

  /* GOOGLE DRIVE UPLOAD */
  async function uploadBackupToDrive() {
    if (!accessToken) {
      alert("Token Google non presente.");
      return;
    }

    const backup = createBackupObject();

    const metadata = {
      name: "note_app_backup.json",
      mimeType: "application/json"
    };

    const boundary = "-------314159265358979323846";
    const delimiter = "\r\n--" + boundary + "\r\n";
    const closeDelimiter = "\r\n--" + boundary + "--";

    const body =
      delimiter +
      "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
      JSON.stringify(metadata) +
      delimiter +
      "Content-Type: application/json\r\n\r\n" +
      JSON.stringify(backup) +
      closeDelimiter;

    const res = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
      {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + accessToken,
          "Content-Type": "multipart/related; boundary=" + boundary
        },
        body
      }
    );

    if (!res.ok) {
      alert("Errore nel backup su Google Drive.");
      return;
    }

    alert("✅ Backup caricato su Google Drive!");
  }

  syncCloudBtn.onclick = () => {
    if (!accessToken) {
      getDriveToken(() => uploadBackupToDrive());
    } else {
      uploadBackupToDrive();
    }
  };

});
