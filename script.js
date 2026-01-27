// --- NAVIGAZIONE TRA LE SEZIONI ---
function showSection(id) {
    document.querySelectorAll(".page-section").forEach(sec => sec.classList.add("hidden"));
    document.getElementById(id).classList.remove("hidden");
}

// --- TEMA CHIARO/SCURO (SOLE/LUNA) ---
const themeToggle = document.getElementById("themeToggle");
let darkMode = JSON.parse(localStorage.getItem("darkMode")) || false;

function applyTheme() {
    if (darkMode) {
        document.body.classList.add("dark");
        themeToggle.textContent = "🌚";
    } else {
        document.body.classList.remove("dark");
        themeToggle.textContent = "🌞";
    }
}

themeToggle.onclick = () => {
    darkMode = !darkMode;
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    applyTheme();
};

applyTheme();

// --- DATI BASE ---
let notes = JSON.parse(localStorage.getItem("notes")) || [];
let archive = JSON.parse(localStorage.getItem("archive")) || [];
let trash = JSON.parse(localStorage.getItem("trash")) || [];

// --- CATEGORIE UFFICIALI + SALVATAGGIO ---
let categories = JSON.parse(localStorage.getItem("categories")) || [
    { name: "Personale", color: "#4da3ff" },
    { name: "Lavoro", color: "#555555" },
    { name: "Spesa", color: "#3cb371" },
    { name: "Appuntamenti", color: "#ff8c00" },
    { name: "Viaggi", color: "#1e90ff" },
    { name: "Idee", color: "#ffd700" },
    { name: "Emozioni", color: "#ff69b4" },
    { name: "Tecnico", color: "#ff0000" },
    { name: "Studio", color: "#9370db" }
];

function saveCategories() {
    localStorage.setItem("categories", JSON.stringify(categories));
}

function saveAll() {
    localStorage.setItem("notes", JSON.stringify(notes));
    localStorage.setItem("archive", JSON.stringify(archive));
    localStorage.setItem("trash", JSON.stringify(trash));
}

// --- POPUP NUOVA NOTA ---
const notePopup = document.getElementById("notePopup");
const categoryPopup = document.getElementById("categoryPopup");
const addNoteBtn = document.getElementById("addNoteBtn");

let selectedCategory = null;

addNoteBtn.onclick = () => {
    document.getElementById("noteText").value = "";
    selectedCategory = null;
    renderCategoryList();
    notePopup.classList.remove("hidden");
};

function closePopup() {
    notePopup.classList.add("hidden");
}

// --- LISTA CATEGORIE NEL POPUP ---
function renderCategoryList() {
    const list = document.getElementById("categoryList");
    list.innerHTML = "";

    categories.forEach((cat, index) => {
        const row = document.createElement("div");

        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "cat";
        radio.onclick = () => {
            selectedCategory = cat.name;
        };

        const tag = document.createElement("span");
        tag.className = "category-tag";
        tag.style.background = cat.color;
        tag.textContent = cat.name;

        const del = document.createElement("span");
        del.className = "delete-cat";
        del.textContent = "❌";
        del.onclick = () => deleteCategory(index);

        row.appendChild(radio);
        row.appendChild(tag);
        row.appendChild(del);

        list.appendChild(row);
    });
}

// --- NUOVA CATEGORIA ---
document.getElementById("addCategoryBtn").onclick = () => {
    document.getElementById("newCategoryName").value = "";
    document.getElementById("newCategoryColor").value = "#007aff";
    categoryPopup.classList.remove("hidden");
};

function closeCategoryPopup() {
    categoryPopup.classList.add("hidden");
}

function createCategory() {
    const name = document.getElementById("newCategoryName").value.trim();
    const color = document.getElementById("newCategoryColor").value;

    if (!name) {
        alert("Inserisci un nome per la categoria");
        return;
    }

    categories.push({ name, color });
    saveCategories();
    closeCategoryPopup();
    renderCategoryList();
}

// --- ELIMINA CATEGORIA ---
function deleteCategory(i) {
    const removed = categories[i].name;
    categories.splice(i, 1);
    saveCategories();

    // Le note che avevano questa categoria diventano "Senza categoria"
    notes = notes.map(n => {
        if (n.category === removed) {
            return { ...n, category: null };
        }
        return n;
    });
    saveAll();
    renderCategoryList();
    renderNotes();
}

// --- NOTE ---
function saveNote() {
    const text = document.getElementById("noteText").value.trim();
    if (!text) {
        alert("Scrivi qualcosa nella nota");
        return;
    }

    notes.push({
        text,
        category: selectedCategory
    });

    saveAll();
    closePopup();
    renderNotes();
}

function renderNotes() {
    const container = document.getElementById("notesContainer");
    container.innerHTML = "";

    notes.forEach((n, index) => {
        const div = document.createElement("div");
        div.className = "note";

        let tagHTML = "";
        if (n.category) {
            const cat = categories.find(c => c.name === n.category);
            if (cat) {
                tagHTML = `<div class="category-tag" style="background:${cat.color}">${cat.name}</div>`;
            } else {
                tagHTML = `<div class="category-tag" style="background:#777">Senza categoria</div>`;
            }
        }

        div.innerHTML = `
            ${tagHTML}
            <p>${n.text}</p>
        `;

        container.appendChild(div);
    });
}

renderNotes();

// --- BACKUP MANUALE ---
function manualBackup() {
    const data = JSON.stringify({ notes, archive, trash, categories });
    const blob = new Blob([data], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "backup_manuale.json";
    a.click();
}

function manualRestore() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            const data = JSON.parse(reader.result);
            notes = data.notes || [];
            archive = data.archive || [];
            trash = data.trash || [];
            categories = data.categories || categories;
            saveAll();
            saveCategories();
            renderNotes();
            alert("Ripristino manuale completato.");
        };
        reader.readAsText(file);
    };
    input.click();
}

// --- BACKUP AUTOMATICO ---
let autoBackupEnabled = JSON.parse(localStorage.getItem("autoBackup")) || false;

function toggleAutoBackup() {
    autoBackupEnabled = !autoBackupEnabled;
    localStorage.setItem("autoBackup", JSON.stringify(autoBackupEnabled));
    alert("Backup automatico: " + (autoBackupEnabled ? "ATTIVO" : "DISATTIVO"));
}

function autoBackup() {
    if (autoBackupEnabled) {
        localStorage.setItem("autoBackupData", JSON.stringify({ notes, archive, trash, categories }));
    }
}

setInterval(autoBackup, 5000);

function autoRestore() {
    const data = JSON.parse(localStorage.getItem("autoBackupData"));
    if (!data) return alert("Nessun backup automatico trovato.");
    notes = data.notes || [];
    archive = data.archive || [];
    trash = data.trash || [];
    categories = data.categories || categories;
    saveAll();
    saveCategories();
    renderNotes();
    alert("Ripristino automatico completato.");
}

// --- BACKUP COMPLETO ---
function fullBackup() {
    const data = JSON.stringify({
        notes,
        archive,
        trash,
        categories,
        autoBackupEnabled
    });
    const blob = new Blob([data], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "backup_completo.json";
    a.click();
}

function fullRestore() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            const data = JSON.parse(reader.result);
            notes = data.notes || [];
            archive = data.archive || [];
            trash = data.trash || [];
            categories = data.categories || categories;
            autoBackupEnabled = data.autoBackupEnabled || false;
            saveAll();
            saveCategories();
            renderNotes();
            alert("Ripristino completo effettuato.");
        };
        reader.readAsText(file);
    };
    input.click();
}

// --- BACKUP LOCALE ---
function localBackup() {
    localStorage.setItem("localBackup", JSON.stringify({ notes, archive, trash, categories }));
    alert("Backup locale salvato.");
}

function localRestore() {
    const data = JSON.parse(localStorage.getItem("localBackup"));
    if (!data) return alert("Nessun backup locale trovato.");
    notes = data.notes || [];
    archive = data.archive || [];
    trash = data.trash || [];
    categories = data.categories || categories;
    saveAll();
    saveCategories();
    renderNotes();
    alert("Ripristino locale completato.");
}

// --- BACKUP ICLOUD (USO STESSA LOGICA DEL MANUALE) ---
function icloudBackup() {
    manualBackup();
}

function icloudRestore() {
    manualRestore();
}
