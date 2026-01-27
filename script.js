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

// --- CATEGORIE UFFICIALI ---
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

// --- POPUP NOTA ---
const notePopup = document.getElementById("notePopup");
const categoryPopup = document.getElementById("categoryPopup");

let selectedCategory = null;

document.getElementById("addNoteBtn").onclick = () => {
    openNotePopup();
};

function openNotePopup() {
    renderCategoryList();
    notePopup.classList.remove("hidden");
}

function closePopup() {
    notePopup.classList.add("hidden");
}

// --- LISTA CATEGORIE NEL POPUP ---
function renderCategoryList() {
    const list = document.getElementById("categoryList");
    list.innerHTML = "";

    categories.forEach((cat, index) => {
        const row = document.createElement("div");
        row.innerHTML = `
            <input type="radio" name="cat" onclick="selectedCategory='${cat.name}'">
            <span class="category-tag" style="background:${cat.color}">${cat.name}</span>
            <span onclick="deleteCategory(${index})">❌</span>
        `;
        list.appendChild(row);
    });
}

// --- NUOVA CATEGORIA ---
document.getElementById("addCategoryBtn").onclick = () => {
    categoryPopup.classList.remove("hidden");
};

function closeCategoryPopup() {
    categoryPopup.classList.add("hidden");
}

function createCategory() {
    const name = document.getElementById("newCategoryName").value.trim();
    const color = document.getElementById("newCategoryColor").value;

    if (!name) return alert("Inserisci un nome");

    categories.push({ name, color });
    saveCategories();
    closeCategoryPopup();
    renderCategoryList();
}

// --- ELIMINA CATEGORIA ---
function deleteCategory(i) {
    categories.splice(i, 1);
    saveCategories();
    renderCategoryList();
}

// --- NOTE ---
let notes = JSON.parse(localStorage.getItem("notes")) || [];

function saveNote() {
    const text = document.getElementById("noteText").value.trim();
    if (!text) return;

    notes.push({
        text,
        category: selectedCategory
    });

    localStorage.setItem("notes", JSON.stringify(notes));
    closePopup();
    renderNotes();
}

function renderNotes() {
    const container = document.getElementById("notesContainer");
    container.innerHTML = "";

    notes.forEach(n => {
        const div = document.createElement("div");
        div.className = "note";

        let tag = "";
        if (n.category) {
            const cat = categories.find(c => c.name === n.category);
            if (cat) {
                tag = `<div class="category-tag" style="background:${cat.color}">${cat.name}</div>`;
            }
        }

        div.innerHTML = `
            ${tag}
            <p>${n.text}</p>
        `;

        container.appendChild(div);
    });
}

renderNotes();
