// --- NAVIGAZIONE ---
function showSection(id) {
    document.querySelectorAll(".page-section").forEach(sec => sec.classList.add("hidden"));
    document.getElementById(id).classList.remove("hidden");
}

// --- TEMA CHIARO/SCURO ---
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
let categories = JSON.parse(localStorage.getItem("categories")) || [
    { name: "Personale", color: "#4da3ff" },
    { name: "Lavoro", color: "#555555" },
    { name: "Spesa", color: "#3cb371" }
];

function saveCategories() {
    localStorage.setItem("categories", JSON.stringify(categories));
}

function saveNotes() {
    localStorage.setItem("notes", JSON.stringify(notes));
}

// --- POPUP NOTA ---
const notePopup = document.getElementById("notePopup");
const categoryPopup = document.getElementById("categoryPopup");

let selectedCategory = null;

document.getElementById("addNoteBtn").onclick = () => {
    document.getElementById("noteText").value = "";
    selectedCategory = null;
    renderCategoryList();
    notePopup.classList.remove("hidden");
};

function closeNotePopup() {
    notePopup.classList.add("hidden");
}

// --- LISTA CATEGORIE ---
function renderCategoryList() {
    const list = document.getElementById("categoryList");
    list.innerHTML = "";

    categories.forEach((cat, index) => {
        const row = document.createElement("div");

        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "cat";
        radio.onclick = () => selectedCategory = cat.name;

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
        alert("Inserisci un nome");
        return;
    }

    categories.push({ name, color });
    saveCategories();
    renderCategoryList();

    closeCategoryPopup();
    notePopup.classList.remove("hidden");
}

// --- ELIMINA CATEGORIA ---
function deleteCategory(i) {
    categories.splice(i, 1);
    saveCategories();
    renderCategoryList();
}

// --- SALVA NOTA ---
function saveNote() {
    const text = document.getElementById("noteText").value.trim();
    if (!text) {
        alert("Scrivi qualcosa");
        return;
    }

    notes.push({
        text,
        category: selectedCategory
    });

    saveNotes();
    closeNotePopup();
    renderNotes();
}

// --- MOSTRA NOTE ---
function renderNotes() {
    const container = document.getElementById("notesContainer");
    container.innerHTML = "";

    notes.forEach(n => {
        const div = document.createElement("div");
        div.className = "note";

        let tagHTML = "";
        if (n.category) {
            const cat = categories.find(c => c.name === n.category);
            if (cat) {
                tagHTML = `<div class="category-tag" style="background:${cat.color}">${cat.name}</div>`;
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
