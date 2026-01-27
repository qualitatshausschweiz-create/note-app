// CATEGORIE DI BASE
let categories = JSON.parse(localStorage.getItem("categories")) || [
    { name: "Lavoro", color: "#1e90ff" },
    { name: "Spesa", color: "#ffa502" },
    { name: "Idee", color: "#a55eea" },
    { name: "Tutte", color: "#2ed573" }
];

let selectedColor = null;

// ELEMENTI
const popup = document.getElementById("categoryPopup");
const categoryList = document.getElementById("categoryList");
const saveBtn = document.getElementById("saveCategoryBtn");
const closeBtn = document.getElementById("closePopupBtn");
const newCategoryName = document.getElementById("newCategoryName");

// APRI POPUP
document.getElementById("categoriesBtn").onclick = () => {
    popup.classList.remove("hidden");
    renderCategories();
};

// CHIUDI POPUP
closeBtn.onclick = () => {
    popup.classList.add("hidden");
};

// RENDER CATEGORIE
function renderCategories() {
    categoryList.innerHTML = "";
    categories.forEach((cat, index) => {
        const div = document.createElement("div");
        div.className = "category-item";
        div.innerHTML = `
            <span>${cat.name}</span>
            <div style="display:flex; gap:10px;">
                <div class="category-color" style="background:${cat.color}"></div>
                <button data-index="${index}" class="deleteCat">❌</button>
            </div>
        `;
        categoryList.appendChild(div);
    });

    document.querySelectorAll(".deleteCat").forEach(btn => {
        btn.onclick = () => {
            const i = btn.getAttribute("data-index");
            categories.splice(i, 1);
            saveCategories();
            renderCategories();
        };
    });
}

// SELEZIONE COLORE
document.querySelectorAll(".color").forEach(c => {
    c.onclick = () => {
        document.querySelectorAll(".color").forEach(x => x.classList.remove("selected"));
        c.classList.add("selected");
        selectedColor = c.dataset.color;
    };
});

// SALVA NUOVA CATEGORIA
saveBtn.onclick = () => {
    const name = newCategoryName.value.trim();
    if (!name || !selectedColor) return;

    categories.push({ name, color: selectedColor });
    saveCategories();

    newCategoryName.value = "";
    selectedColor = null;
    document.querySelectorAll(".color").forEach(x => x.classList.remove("selected"));

    renderCategories();
};

// SALVA SU LOCALSTORAGE
function saveCategories() {
    localStorage.setItem("categories", JSON.stringify(categories));
}

// TEMA CHIARO/SCURO
document.getElementById("sunBtn").onclick = () => {
    document.body.classList.remove("dark");
};

document.getElementById("moonBtn").onclick = () => {
    document.body.classList.add("dark");
};
