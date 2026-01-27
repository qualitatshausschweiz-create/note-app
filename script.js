// --- NAVIGAZIONE TRA LE SEZIONI ---
function showSection(id) {
    document.querySelectorAll(".page-section").forEach(sec => sec.classList.add("hidden"));
    document.getElementById(id).classList.remove("hidden");
}

// --- NOTE BASE ---
let notes = JSON.parse(localStorage.getItem("notes")) || [];
let archive = JSON.parse(localStorage.getItem("archive")) || [];
let trash = JSON.parse(localStorage.getItem("trash")) || [];

function saveAll() {
    localStorage.setItem("notes", JSON.stringify(notes));
    localStorage.setItem("archive", JSON.stringify(archive));
    localStorage.setItem("trash", JSON.stringify(trash));
}

function renderNotes() {
    const container = document.getElementById("notesContainer");
    container.innerHTML = "";
    notes.forEach((n, i) => {
        const div = document.createElement("div");
        div.className = "note";
        div.innerHTML = `
            <p>${n}</p>
            <button onclick="archiveNote(${i})">Archivia</button>
            <button onclick="deleteNote(${i})">Elimina</button>
        `;
        container.appendChild(div);
    });
}

document.getElementById("addNoteBtn").onclick = () => {
    const text = prompt("Scrivi la nota:");
    if (text) {
        notes.push(text);
        saveAll();
        renderNotes();
    }
};

function archiveNote(i) {
    archive.push(notes[i]);
    notes.splice(i, 1);
    saveAll();
    renderNotes();
}

function deleteNote(i) {
    trash.push(notes[i]);
    notes.splice(i, 1);
    saveAll();
    renderNotes();
}

renderNotes();

// --- BACKUP MANUALE ---
function manualBackup() {
    const data = JSON.stringify({ notes, archive, trash });
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
            notes = data.notes;
            archive = data.archive;
            trash = data.trash;
            saveAll();
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
        localStorage.setItem("autoBackupData", JSON.stringify({ notes, archive, trash }));
    }
}

setInterval(autoBackup, 5000);

function autoRestore() {
    const data = JSON.parse(localStorage.getItem("autoBackupData"));
    if (!data) return alert("Nessun backup automatico trovato.");
    notes = data.notes;
    archive = data.archive;
    trash = data.trash;
    saveAll();
    renderNotes();
    alert("Ripristino automatico completato.");
}

// --- BACKUP COMPLETO ---
function fullBackup() {
    const data = JSON.stringify({
        notes, archive, trash, autoBackupEnabled
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
            notes = data.notes;
            archive = data.archive;
            trash = data.trash;
            autoBackupEnabled = data.autoBackupEnabled;
            saveAll();
            renderNotes();
            alert("Ripristino completo effettuato.");
        };
        reader.readAsText(file);
    };
    input.click();
}

// --- BACKUP LOCALE ---
function localBackup() {
    localStorage.setItem("localBackup", JSON.stringify({ notes, archive, trash }));
    alert("Backup locale salvato.");
}

function localRestore() {
    const data = JSON.parse(localStorage.getItem("localBackup"));
    if (!data) return alert("Nessun backup locale trovato.");
    notes = data.notes;
    archive = data.archive;
    trash = data.trash;
    saveAll();
    renderNotes();
    alert("Ripristino locale completato.");
}

// --- BACKUP ICLOUD DRIVE ---
function icloudBackup() {
    manualBackup();
}

function icloudRestore() {
    manualRestore();
}
