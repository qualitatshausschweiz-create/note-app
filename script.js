/* ============================================================
   STRUTTURA BASE — Variabili principali
============================================================ */

// Elementi DOM
const categoryList = document.getElementById("categoryList");
const noteList = document.getElementById("noteList");
const noteEditor = document.getElementById("noteEditor");
const noteTitle = document.getElementById("noteTitle");
const noteContent = document.getElementById("noteContent");
const currentCategoryName = document.getElementById("currentCategoryName");

// Popup
const lifebuoyPopup = document.getElementById("lifebuoyPopup");
const settingsPopup = document.getElementById("settingsPopup");
const contextMenu = document.getElementById("contextMenu");

// Stato app
let categories = [];
let notes = [];
let selectedCategory = "all";
let editingNoteId = null;

/* ============================================================
   CARICAMENTO DATI — LocalStorage
============================================================ */

function loadData() {
    const savedCategories = localStorage.getItem("categories");
    const savedNotes = localStorage.getItem("notes");

    categories = savedCategories ? JSON.parse(savedCategories) : [];
    notes = savedNotes ? JSON.parse(savedNotes) : [];

    // Se non esistono categorie, crea quelle base
    if (categories.length === 0) {
        categories = [
            { id: "all", name: "Tutte le note", color: "#007aff" },
            { id: "uncategorized", name: "Senza categoria", color: "#8e8e93" }
        ];
        saveData();
    }
}

function saveData() {
    localStorage.setItem("categories", JSON.stringify(categories));
    localStorage.setItem("notes", JSON.stringify(notes));
}

/* ============================================================
   RENDER CATEGORIE
============================================================ */

function renderCategories() {
    categoryList.innerHTML = "";

    categories.forEach(cat => {
        const li = document.createElement("li");
        li.classList.add("category-item");
        li.dataset.id = cat.id;

        li.innerHTML = `
            <span class="color-dot" style="background:${cat.color};"></span>
            <span class="category-name">${cat.name}</span>
            <button class="category-menu-btn">⋯</button>
        `;

        // Click categoria
        li.addEventListener("click", (e) => {
            if (e.target.classList.contains("category-menu-btn")) return;
            selectCategory(cat.id);
        });

        // Menu ⋯ categoria
        li.querySelector(".category-menu-btn").addEventListener("click", (e) => {
            e.stopPropagation();
            openContextMenu(e, "category", cat.id);
        });

        categoryList.appendChild(li);
    });
}

/* ============================================================
   SELEZIONE CATEGORIA
============================================================ */

function selectCategory(id) {
    selectedCategory = id;

    const cat = categories.find(c => c.id === id);
    currentCategoryName.textContent = cat ? cat.name : "Tutte le note";

    renderNotes();
}

/* ============================================================
   INIZIALIZZAZIONE APP
============================================================ */

function initApp() {
    loadData();
    renderCategories();
    renderNotes();
}

initApp();
/* ============================================================
   CREAZIONE NUOVA NOTA
============================================================ */

document.getElementById("addNoteBtn").addEventListener("click", () => {
    editingNoteId = null; // nuova nota
    noteTitle.value = "";
    noteContent.value = "";
    noteEditor.classList.remove("hidden");
    noteTitle.focus();
});

/* ============================================================
   SALVATAGGIO NOTA
============================================================ */

document.getElementById("saveNoteBtn").addEventListener("click", () => {
    const title = noteTitle.value.trim();
    const content = noteContent.value.trim();

    if (title === "" && content === "") return;

    if (editingNoteId) {
        // Modifica nota esistente
        const note = notes.find(n => n.id === editingNoteId);
        if (note) {
            note.title = title;
            note.content = content;
            note.updated = Date.now();
        }
    } else {
        // Nuova nota
        const newNote = {
            id: Date.now().toString(),
            title,
            content,
            category: selectedCategory,
            color: getCategoryColor(selectedCategory),
            created: Date.now(),
            updated: Date.now()
        };
        notes.unshift(newNote);
    }

    saveData();
    renderNotes();
    noteEditor.classList.add("hidden");
});

/* ============================================================
   ANNULLA EDITOR
============================================================ */

document.getElementById("cancelEditBtn").addEventListener("click", () => {
    noteEditor.classList.add("hidden");
    editingNoteId = null;
});

/* ============================================================
   RENDER NOTE
============================================================ */

function renderNotes() {
    noteList.innerHTML = "";

    const filtered = selectedCategory === "all"
        ? notes
        : notes.filter(n => n.category === selectedCategory);

    filtered.forEach(note => {
        const div = document.createElement("div");
        div.classList.add("note-item");
        div.dataset.id = note.id;

        div.innerHTML = `
            <div class="note-color" style="background:${note.color};"></div>
            <div class="note-text">
                <h3>${note.title || "Senza titolo"}</h3>
                <p>${note.content.slice(0, 80)}${note.content.length > 80 ? "…" : ""}</p>
            </div>
            <button class="note-menu-btn">⋯</button>
        `;

        // Apri nota
        div.addEventListener("click", (e) => {
            if (e.target.classList.contains("note-menu-btn")) return;
            openNoteEditor(note.id);
        });

        // Menu ⋯
        div.querySelector(".note-menu-btn").addEventListener("click", (e) => {
            e.stopPropagation();
            openContextMenu(e, "note", note.id);
        });

        noteList.appendChild(div);
    });
}

/* ============================================================
   APRI EDITOR PER MODIFICA
============================================================ */

function openNoteEditor(id) {
    const note = notes.find(n => n.id === id);
    if (!note) return;

    editingNoteId = id;
    noteTitle.value = note.title;
    noteContent.value = note.content;

    noteEditor.classList.remove("hidden");
    noteTitle.focus();
}

/* ============================================================
   ELIMINA NOTA
============================================================ */

function deleteNote(id) {
    notes = notes.filter(n => n.id !== id);
    saveData();
    renderNotes();
}

/* ============================================================
   UTILITY: COLORE CATEGORIA
============================================================ */

function getCategoryColor(id) {
    const cat = categories.find(c => c.id === id);
    return cat ? cat.color : "#8e8e93";
}
/* ============================================================
   MENU CONTESTUALE — Apertura dinamica
============================================================ */

function openContextMenu(event, type, id) {
    contextMenu.innerHTML = ""; // reset
    contextMenu.classList.remove("hidden");

    // Posizionamento dinamico
    const x = event.clientX;
    const y = event.clientY;

    contextMenu.style.left = x + "px";
    contextMenu.style.top = y + "px";

    // Genera voci in base al tipo
    if (type === "category") {
        buildCategoryMenu(id);
    } else if (type === "note") {
        buildNoteMenu(id);
    }

    // Chiudi cliccando fuori
    document.addEventListener("click", closeContextMenu, { once: true });
}

function closeContextMenu() {
    contextMenu.classList.add("hidden");
}
/* ============================================================
   MENU CATEGORIA
============================================================ */

function buildCategoryMenu(id) {
    const renameBtn = createMenuItem("Rinomina", () => renameCategory(id));
    const colorBtn = createMenuItem("Cambia colore", () => changeCategoryColor(id));

    // Non permettere di eliminare categorie base
    if (id !== "all" && id !== "uncategorized") {
        const deleteBtn = createMenuItem("Elimina", () => deleteCategory(id), true);
        contextMenu.append(renameBtn, colorBtn, deleteBtn);
    } else {
        contextMenu.append(renameBtn, colorBtn);
    }
}
/* ============================================================
   MENU NOTA
============================================================ */

function buildNoteMenu(id) {
    const editBtn = createMenuItem("Modifica", () => openNoteEditor(id));
    const deleteBtn = createMenuItem("Elimina", () => deleteNote(id), true);

    contextMenu.append(editBtn, deleteBtn);
}
/* ============================================================
   CREA ELEMENTO MENU
============================================================ */

function createMenuItem(label, action, danger = false) {
    const btn = document.createElement("button");
    btn.classList.add("context-item");
    if (danger) btn.classList.add("danger");

    btn.textContent = label;
    btn.addEventListener("click", (e) => {
        e.stopPropagation();
        closeContextMenu();
        action();
    });

    return btn;
}
/* ============================================================
   RINOMINA CATEGORIA
============================================================ */

function renameCategory(id) {
    const cat = categories.find(c => c.id === id);
    if (!cat) return;

    const newName = prompt("Nuovo nome categoria:", cat.name);
    if (!newName) return;

    cat.name = newName.trim();
    saveData();
    renderCategories();
    renderNotes();
}
/* ============================================================
   CAMBIA COLORE CATEGORIA
============================================================ */

function changeCategoryColor(id) {
    const cat = categories.find(c => c.id === id);
    if (!cat) return;

    const newColor = prompt("Inserisci un colore HEX (es: #ff6b6b):", cat.color);
    if (!newColor) return;

    cat.color = newColor.trim();

    // Aggiorna colore note della categoria
    notes.forEach(n => {
        if (n.category === id) n.color = newColor;
    });

    saveData();
    renderCategories();
    renderNotes();
}
/* ============================================================
   ELIMINA CATEGORIA
============================================================ */

function deleteCategory(id) {
    if (!confirm("Eliminare questa categoria? Le note verranno spostate in 'Senza categoria'.")) return;

    // Sposta note
    notes.forEach(n => {
        if (n.category === id) {
            n.category = "uncategorized";
            n.color = getCategoryColor("uncategorized");
        }
    });

    // Elimina categoria
    categories = categories.filter(c => c.id !== id);

    saveData();
    renderCategories();
    renderNotes();

    // Se era selezionata, torna a "Tutte le note"
    if (selectedCategory === id) {
        selectCategory("all");
    }
}
/* ============================================================
   POPUP SALVAGENTE — Apertura e chiusura
============================================================ */

document.getElementById("openLifebuoyBtn").addEventListener("click", () => {
    renderBackupList();
    lifebuoyPopup.classList.remove("hidden");
});

document.getElementById("closeLifebuoyBtn").addEventListener("click", () => {
    lifebuoyPopup.classList.add("hidden");
});
/* ============================================================
   CREA BACKUP
============================================================ */

document.getElementById("createBackupBtn").addEventListener("click", () => {
    const backup = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        categories,
        notes
    };

    // Salva in localStorage
    const backups = getBackups();
    backups.unshift(backup);
    localStorage.setItem("backups", JSON.stringify(backups));

    renderBackupList();
});
/* ============================================================
   RECUPERA LISTA BACKUP
============================================================ */

function getBackups() {
    const saved = localStorage.getItem("backups");
    return saved ? JSON.parse(saved) : [];
}
/* ============================================================
   RENDER LISTA BACKUP
============================================================ */

function renderBackupList() {
    const container = document.getElementById("backupList");
    container.innerHTML = "";

    const backups = getBackups();

    if (backups.length === 0) {
        container.innerHTML = "<p>Nessun backup disponibile.</p>";
        return;
    }

    backups.forEach(b => {
        const div = document.createElement("div");
        div.classList.add("backup-item");

        div.innerHTML = `
            <span class="backup-date">${b.date}</span>
            <button class="restoreBackupBtn">Ripristina</button>
        `;

        div.querySelector(".restoreBackupBtn").addEventListener("click", () => {
            restoreBackup(b.id);
        });

        container.appendChild(div);
    });
}
/* ============================================================
   RIPRISTINA BACKUP
============================================================ */

function restoreBackup(id) {
    if (!confirm("Ripristinare questo backup? I dati attuali verranno sovrascritti.")) return;

    const backups = getBackups();
    const backup = backups.find(b => b.id === id);
    if (!backup) return;

    categories = backup.categories;
    notes = backup.notes;

    saveData();
    renderCategories();
    renderNotes();

    lifebuoyPopup.classList.add("hidden");
}
/* ============================================================
   ESPORTA BACKUP
============================================================ */

document.getElementById("exportDataBtn").addEventListener("click", () => {
    const data = {
        categories,
        notes
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "note-backup.json";
    a.click();

    URL.revokeObjectURL(url);
});
/* ============================================================
   IMPORTA BACKUP
============================================================ */

document.getElementById("importBackupBtn").addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";

    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            try {
                const data = JSON.parse(reader.result);

                if (!data.categories || !data.notes) {
                    alert("File non valido.");
                    return;
                }

                categories = data.categories;
                notes = data.notes;

                saveData();
                renderCategories();
                renderNotes();

                lifebuoyPopup.classList.add("hidden");
            } catch {
                alert("Errore durante l'importazione.");
            }
        };

        reader.readAsText(file);
    };

    input.click();
});
/* ============================================================
   POPUP IMPOSTAZIONI — Apertura e chiusura
============================================================ */

document.getElementById("openSettingsBtn").addEventListener("click", () => {
    loadSettingsUI();
    settingsPopup.classList.remove("hidden");
});

document.getElementById("closeSettingsBtn").addEventListener("click", () => {
    settingsPopup.classList.add("hidden");
});
/* ============================================================
   CARICA IMPOSTAZIONI NELLA UI
============================================================ */

function loadSettingsUI() {
    const theme = localStorage.getItem("theme") || "auto";
    const font = localStorage.getItem("font") || "system-ui";
    const accent = localStorage.getItem("accent") || "#007aff";

    document.getElementById("themeSelect").value = theme;
    document.getElementById("fontSelect").value = font;

    // Seleziona colore attivo
    document.querySelectorAll(".color-swatch").forEach(s => {
        s.classList.remove("selected");
        if (s.dataset.color === accent) s.classList.add("selected");
    });
}
/* ============================================================
   CAMBIO TEMA
============================================================ */

document.getElementById("themeSelect").addEventListener("change", (e) => {
    const theme = e.target.value;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
});
/* ============================================================
   CAMBIO FONT
============================================================ */

document.getElementById("fontSelect").addEventListener("change", (e) => {
    const font = e.target.value;
    document.documentElement.style.setProperty("--app-font", font);
    localStorage.setItem("font", font);
});
/* ============================================================
   CAMBIO COLORE ACCENT
============================================================ */

document.querySelectorAll(".color-swatch").forEach(swatch => {
    swatch.addEventListener("click", () => {
        const color = swatch.dataset.color;

        // aggiorna UI
        document.querySelectorAll(".color-swatch").forEach(s => s.classList.remove("selected"));
        swatch.classList.add("selected");

        // salva
        document.documentElement.style.setProperty("--accent", color);
        localStorage.setItem("accent", color);
    });
});
/* ============================================================
   RESET APP
============================================================ */

document.getElementById("resetAppBtn").addEventListener("click", () => {
    if (!confirm("Ripristinare completamente l'app? Tutte le note e categorie verranno eliminate.")) return;

    localStorage.clear();
    location.reload();
});
/* ============================================================
   APPLICA IMPOSTAZIONI ALL'AVVIO
============================================================ */

function applyInitialSettings() {
    const theme = localStorage.getItem("theme") || "auto";
    const font = localStorage.getItem("font") || "system-ui";
    const accent = localStorage.getItem("accent") || "#007aff";

    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.setProperty("--app-font", font);
    document.documentElement.style.setProperty("--accent", accent);
}

applyInitialSettings();
/* ============================================================
   CHIUSURA POPUP CLICCANDO FUORI
============================================================ */

document.querySelectorAll(".popup-overlay").forEach(overlay => {
    overlay.addEventListener("click", () => {
        overlay.parentElement.classList.add("hidden");
    });
});
/* ============================================================
   CHIUDI MENU ⋯ SE L’UTENTE SCROLLA
============================================================ */

window.addEventListener("scroll", () => {
    contextMenu.classList.add("hidden");
}, true);
/* ============================================================
   FORMATTAZIONE DATA (per future funzioni)
============================================================ */

function formatDate(timestamp) {
    const d = new Date(timestamp);
    return d.toLocaleString();
}
/* ============================================================
   GENERA ID UNICO
============================================================ */

function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
/* ============================================================
   FIX iOS — Evita zoom indesiderato
============================================================ */

document.addEventListener("gesturestart", function (e) {
    e.preventDefault();
});
/* ============================================================
   CHIUDI MENU ⋯ CON TASTO ESC
============================================================ */

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        contextMenu.classList.add("hidden");
        lifebuoyPopup.classList.add("hidden");
        settingsPopup.classList.add("hidden");
    }
});
/* ============================================================
   RIMUOVI SELEZIONI VISIVE (mobile)
============================================================ */

document.addEventListener("touchstart", () => {
    contextMenu.classList.add("hidden");
}, { passive: true });
/* ============================================================
   POSIZIONAMENTO SICURO MENU ⋯
============================================================ */

function adjustContextMenuPosition() {
    const rect = contextMenu.getBoundingClientRect();

    if (rect.right > window.innerWidth) {
        contextMenu.style.left = (window.innerWidth - rect.width - 10) + "px";
    }

    if (rect.bottom > window.innerHeight) {
        contextMenu.style.top = (window.innerHeight - rect.height - 10) + "px";
    }
}

new MutationObserver(adjustContextMenuPosition).observe(contextMenu, {
    attributes: true,
    attributeFilter: ["class"]
});
/* ============================================================
   PREVENZIONE DOPPI CLICK — Evita azioni duplicate
============================================================ */

let clickLock = false;

function lockClicks(duration = 250) {
    if (clickLock) return true;
    clickLock = true;
    setTimeout(() => clickLock = false, duration);
    return false;
}

// Applica a pulsanti principali
document.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => lockClicks(), true);
});
/* ============================================================
   SALVATAGGIO SICURO — Evita conflitti multipli
============================================================ */

let saveTimeout = null;

function safeSave() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        saveData();
    }, 120);
}
/* ============================================================
   SCROLL AUTOMATICO ALL'EDITOR
============================================================ */

function scrollToEditor() {
    noteEditor.scrollIntoView({ behavior: "smooth", block: "start" });
}
/* ============================================================
   SELEZIONE AUTOMATICA TITOLO QUANDO SI CREA UNA NOTA
============================================================ */

noteTitle.addEventListener("focus", () => {
    noteTitle.select();
});
/* ============================================================
   DISABILITA MENU ⋯ QUANDO L'EDITOR È APERTO
============================================================ */

const observerEditor = new MutationObserver(() => {
    if (!noteEditor.classList.contains("hidden")) {
        contextMenu.classList.add("hidden");
    }
});

observerEditor.observe(noteEditor, { attributes: true });
/* ============================================================
   CHIUDI MENU ⋯ SE LA FINESTRA CAMBIA DIMENSIONE
============================================================ */

window.addEventListener("resize", () => {
    contextMenu.classList.add("hidden");
});
/* ============================================================
   CATCH GLOBALE — Evita crash dell'app
============================================================ */

window.addEventListener("error", (e) => {
    console.warn("Errore catturato:", e.message);
});
