/* ============================================================
   SCRIPT.JS PRO — BLOCCO 1
   Core dell’app: PIN, Lingua, Temi, Pannelli, Variabili globali
   Versione PRO ricostruita da zero per il nuovo HTML/CSS
============================================================ */

/* ------------------------------------------------------------
   VARIABILI GLOBALI
------------------------------------------------------------ */
let notes = JSON.parse(localStorage.getItem("notes") || "[]");
let editingId = null;
let currentCategoryFilter = "all";
let selectedColor = "#ffffff";

/* ------------------------------------------------------------
   PIN DI SICUREZZA
------------------------------------------------------------ */
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
    const remember = document.getElementById("rememberPin")?.checked;

    if (enteredPIN === savedPIN) {
        pinOverlay.classList.add("hidden");
        if (remember) localStorage.setItem("rememberPIN", "1");
    } else {
        pinError.textContent = currentTranslations.pinError || "PIN errato";
        setTimeout(() => pinError.textContent = "", 1200);
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

// Se PIN ricordato → salta overlay
if (localStorage.getItem("rememberPIN") === "1") {
    pinOverlay.classList.add("hidden");
}

/* ------------------------------------------------------------
   MULTILINGUA
------------------------------------------------------------ */
const translations = {
    it: { pinError: "PIN errato", noTitle: "Senza titolo" },
    en: { pinError: "Wrong PIN", noTitle: "Untitled" },
    de: { pinError: "Falscher PIN", noTitle: "Ohne Titel" },
    es: { pinError: "PIN incorrecto", noTitle: "Sin título" }
};

let currentLang = localStorage.getItem("appLang") || "it";
let currentTranslations = translations[currentLang];

function applyTranslations() {
    currentTranslations = translations[currentLang];

    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        if (currentTranslations[key]) el.textContent = currentTranslations[key];
    });

    renderNotes();
}

document.querySelectorAll(".lang-btn").forEach(btn => {
    if (btn.dataset.lang === currentLang) btn.classList.add("active");

    btn.onclick = () => {
        document.querySelectorAll(".lang-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        currentLang = btn.dataset.lang;
        localStorage.setItem("appLang", currentLang);
        applyTranslations();
    };
});

/* ------------------------------------------------------------
   TEMI (Chiaro / Scuro / AMOLED)
------------------------------------------------------------ */
function applyTheme(theme) {
    document.body.classList.remove("dark", "amoled");
    if (theme === "dark") document.body.classList.add("dark");
    if (theme === "amoled") document.body.classList.add("amoled");
}

let savedTheme = localStorage.getItem("appTheme") || "light";
applyTheme(savedTheme);

document.getElementById("theme-light").onclick = () => {
    localStorage.setItem("appTheme", "light");
    applyTheme("light");
};

document.getElementById("theme-dark").onclick = () => {
    localStorage.setItem("appTheme", "dark");
    applyTheme("dark");
};

document.getElementById("theme-amoled").onclick = () => {
    localStorage.setItem("appTheme", "amoled");
    applyTheme("amoled");
};

/* ------------------------------------------------------------
   APERTURA / CHIUSURA PANNELLI (Backup + Impostazioni)
------------------------------------------------------------ */
const backupPanel = document.getElementById("backup-panel");
const settingsPanel = document.getElementById("settings-panel");

document.getElementById("backup-btn").onclick = () => {
    backupPanel.classList.add("show");
};

document.getElementById("settings-btn").onclick = () => {
    settingsPanel.classList.add("show");
};

document.getElementById("close-backup-panel").onclick = () => {
    backupPanel.classList.remove("show");
};

document.getElementById("close-settings-panel").onclick = () => {
    settingsPanel.classList.remove("show");
};

/* ------------------------------------------------------------
   FUNZIONI BASE
------------------------------------------------------------ */
function saveNotes(autoBackup = true) {
    localStorage.setItem("notes", JSON.stringify(notes));
    if (autoBackup) autoBackupNotes();
}

function autoRestoreIfEmpty() {
    if (notes.length === 0) {
        const backup = localStorage.getItem("notesBackup");
        if (backup) {
            notes = JSON.parse(backup);
            saveNotes(false);
        }
    }
}

/* ------------------------------------------------------------
   INIZIALIZZAZIONE
------------------------------------------------------------ */
autoRestoreIfEmpty();
applyTranslations();
/* ============================================================
   SCRIPT.JS PRO — BLOCCO 2
   Gestione Note: creazione, modifica, eliminazione, colori,
   categorie, filtri e rendering.
============================================================ */

/* ------------------------------------------------------------
   RENDERING NOTE
------------------------------------------------------------ */
function renderNotes() {
    const container = document.getElementById("notes-container");
    container.innerHTML = "";

    notes
        .filter(n => currentCategoryFilter === "all" || n.category === currentCategoryFilter)
        .forEach(n => {
            const div = document.createElement("div");
            div.className = "note";
            div.style.background = n.color || "var(--note-bg)";
            div.dataset.icon = getCategoryIcon(n.category);

            div.innerHTML = `
                <div class="note-title">${n.title || currentTranslations.noTitle}</div>
                <div class="note-text">${(n.text || "").slice(0, 150)}</div>
            `;

            div.onclick = () => openEditor(n.id);
            container.appendChild(div);
        });
}

/* ------------------------------------------------------------
   CATEGORIE — Icone
------------------------------------------------------------ */
function getCategoryIcon(cat) {
    switch (cat) {
        case "casa": return "🏠";
        case "lavoro": return "💼";
        case "idee": return "💡";
        case "spesa": return "🛒";
        case "altro": return "⭐";
        default: return "⭐";
    }
}

/* ------------------------------------------------------------
   FILTRO CATEGORIE
------------------------------------------------------------ */
document.querySelectorAll(".category-btn").forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll(".category-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        currentCategoryFilter = btn.dataset.category;
        renderNotes();
    };
});

/* ------------------------------------------------------------
   APERTURA EDITOR
------------------------------------------------------------ */
function openEditor(id = null) {
    editingId = id;

    const editor = document.getElementById("note-editor");
    const title = document.getElementById("note-title");
    const text = document.getElementById("note-text");
    const cat = document.getElementById("note-category");
    const colorPicker = document.getElementById("note-color");

    if (id) {
        const n = notes.find(x => x.id === id);
        if (!n) return;

        title.value = n.title;
        text.value = n.text;
        cat.value = n.category;
        selectedColor = n.color || "#ffffff";
    } else {
        title.value = "";
        text.value = "";
        cat.value = "altro";
        selectedColor = "#ffffff";
    }

    colorPicker.value = selectedColor;
    editor.classList.remove("hidden");
}

/* ------------------------------------------------------------
   CHIUSURA EDITOR
------------------------------------------------------------ */
document.getElementById("close-editor-btn").onclick = () => {
    document.getElementById("note-editor").classList.add("hidden");
};

/* ------------------------------------------------------------
   SALVATAGGIO NOTA
------------------------------------------------------------ */
document.getElementById("save-note-btn").onclick = () => {
    const title = document.getElementById("note-title").value.trim();
    const text = document.getElementById("note-text").value.trim();
    const category = document.getElementById("note-category").value;

    if (!text) return;

    if (editingId) {
        const n = notes.find(x => x.id === editingId);
        if (!n) return;

        n.title = title;
        n.text = text;
        n.category = category;
        n.color = selectedColor;
    } else {
        notes.push({
            id: Date.now(),
            title,
            text,
            category,
            color: selectedColor
        });
    }

    saveNotes(true);
    renderNotes();
    document.getElementById("note-editor").classList.add("hidden");
};

/* ------------------------------------------------------------
   ELIMINAZIONE NOTA
------------------------------------------------------------ */
document.getElementById("delete-note-btn").onclick = () => {
    if (!editingId) return;

    notes = notes.filter(n => n.id !== editingId);
    saveNotes(true);
    renderNotes();
    document.getElementById("note-editor").classList.add("hidden");
};

/* ------------------------------------------------------------
   COLORE NOTA
------------------------------------------------------------ */
document.getElementById("note-color").oninput = e => {
    selectedColor = e.target.value;
};

/* ------------------------------------------------------------
   PULSANTE AGGIUNGI NOTA
------------------------------------------------------------ */
document.getElementById("add-note-btn").onclick = () => openEditor(null);
/* ============================================================
   SCRIPT.JS PRO — BLOCCO 3
   Backup, Ripristino, Impostazioni, Reset, Inizializzazione finale
============================================================ */

/* ------------------------------------------------------------
   BACKUP VELOCE (salva subito in localStorage)
------------------------------------------------------------ */
document.getElementById("quick-backup-btn").onclick = () => {
    localStorage.setItem("notesBackup", JSON.stringify(notes));
    alert("Backup rapido eseguito.");
};

/* ------------------------------------------------------------
   BACKUP MANUALE (esporta file JSON)
------------------------------------------------------------ */
document.getElementById("manual-backup-btn").onclick = () => {
    const data = JSON.stringify(notes, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "note-backup.json";
    a.click();

    URL.revokeObjectURL(url);
    alert("Backup manuale eseguito.");
};

/* ------------------------------------------------------------
   RIPRISTINO MANUALE (importa file JSON)
------------------------------------------------------------ */
document.getElementById("manual-restore-btn").onclick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";

    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = event => {
            try {
                notes = JSON.parse(event.target.result);
                saveNotes(false);
                renderNotes();
                alert("Ripristino completato.");
            } catch {
                alert("File non valido.");
            }
        };

        reader.readAsText(file);
    };

    input.click();
};

/* ------------------------------------------------------------
   BACKUP AUTOMATICO (ogni salvataggio)
------------------------------------------------------------ */
function autoBackupNotes() {
    localStorage.setItem("notesBackup", JSON.stringify(notes));
}

/* ------------------------------------------------------------
   RIPRISTINO AUTOMATICO (se note vuote)
------------------------------------------------------------ */
function autoRestoreIfEmpty() {
    if (notes.length === 0) {
        const backup = localStorage.getItem("notesBackup");
        if (backup) {
            notes = JSON.parse(backup);
            saveNotes(false);
        }
    }
}

/* ------------------------------------------------------------
   IMPOSTAZIONI — CAMBIO PIN
------------------------------------------------------------ */
document.getElementById("save-new-pin-btn").onclick = () => {
    const newPin = document.getElementById("new-pin-input").value.trim();

    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
        alert("Il PIN deve avere 4 cifre.");
        return;
    }

    savedPIN = newPin;
    localStorage.setItem("appPIN", newPin);
    document.getElementById("new-pin-input").value = "";
    alert("PIN cambiato.");
};

/* ------------------------------------------------------------
   IMPOSTAZIONI — ESPORTA TUTTE LE NOTE IN .TXT
------------------------------------------------------------ */
document.getElementById("export-text-btn").onclick = () => {
    let content = "";
    notes.forEach(n => {
        content += `Titolo: ${n.title}\nCategoria: ${n.category}\nColore: ${n.color}\n${n.text}\n\n---\n\n`;
    });

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "note-export.txt";
    a.click();

    URL.revokeObjectURL(url);
};

/* ------------------------------------------------------------
   IMPOSTAZIONI — CANCELLA TUTTE LE NOTE
------------------------------------------------------------ */
document.getElementById("delete-all-notes-btn").onclick = () => {
    if (!confirm("Vuoi davvero cancellare tutte le note?")) return;

    notes = [];
    saveNotes(true);
    renderNotes();
};

/* ------------------------------------------------------------
   IMPOSTAZIONI — RESET TOTALE APP
------------------------------------------------------------ */
document.getElementById("reset-app-btn").onclick = () => {
    if (!confirm("Reset totale? Cancella note, PIN e backup.")) return;

    localStorage.clear();
    location.reload();
};

/* ------------------------------------------------------------
   INIZIALIZZAZIONE FINALE
------------------------------------------------------------ */
renderNotes();
