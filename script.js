document.addEventListener("DOMContentLoaded", () => {
    // CATEGORIE DI BASE
    let categories = [];
    try {
        categories = JSON.parse(localStorage.getItem("categories")) || [
            { name: "Lavoro", color: "#1e90ff" },
            { name: "Spesa", color: "#ffa502" },
            { name: "Idee", color: "#a55eea" },
            { name: "Tutte", color: "#2ed573" }
        ];
    } catch (e) {
        categories = [
            { name: "Lavoro", color: "#1e90ff" },
            { name: "Spesa", color: "#ffa502" },
            { name: "Idee", color: "#a55eea" },
            { name: "Tutte", color: "#2ed573" }
        ];
    }

    let selectedColor = null;

    // ELEMENTI (con controlli di sicurezza)
    const popup = document.getElementById("categoryPopup");
    const categoryList = document.getElementById("categoryList");
    const saveBtn = document.getElementById("saveCategoryBtn");
    const closeBtn = document.getElementById("closePopupBtn");
    const newCategoryName = document.getElementById("newCategoryName");
    const categoriesBtn = document.getElementById("categoriesBtn");
    const sunBtn = document.getElementById("sunBtn");
    const moonBtn = document.getElementById("moonBtn");

    // Se manca il popup, esco senza rompere tutto
    if (!popup || !categoryList || !saveBtn || !closeBtn || !newCategoryName) {
        console.warn("Elementi popup categorie mancanti");
        return;
    }

    // APRI POPUP
    if (categoriesBtn) {
        categoriesBtn.addEventListener("click", () => {
            popup.classList.remove("hidden");
            renderCategories();
        });
    }

    // CHIUDI POPUP (bottone)
    closeBtn.addEventListener("click", () => {
        popup.classList.add("hidden");
    });

    // CHIUDI POPUP cliccando fuori dal contenuto
    popup.addEventListener("click", (e) => {
        if (e.target === popup) {
            popup.classList.add("hidden");
        }
    });

    // RENDER CATEGORIE
    function renderCategories() {
        categoryList.innerHTML = "";
        categories.forEach((cat, index) => {
            const div = document.createElement("div");
            div.className = "category-item";
            div.innerHTML = `
                <span>${cat.name}</span>
                <div style="display:flex; gap:10px; align-items:center;">
                    <div class="category-color" style="background:${cat.color}"></div>
                    <button data-index="${index}" class="deleteCat">❌</button>
                </div>
            `;
            categoryList.appendChild(div);
        });

        // ELIMINA CATEGORIA
        categoryList.querySelectorAll(".deleteCat").forEach(btn => {
            btn.addEventListener("click", () => {
                const i = parseInt(btn.getAttribute("data-index"), 10);
                if (!isNaN(i)) {
                    categories.splice(i, 1);
                    saveCategories();
                    renderCategories();
                }
            });
        });
    }

    // SELEZIONE COLORE PALETTE
    const colorNodes = document.querySelectorAll(".palette .color");
    colorNodes.forEach(c => {
        c.addEventListener("click", () => {
            colorNodes.forEach(x => x.classList.remove("selected"));
            c.classList.add("selected");
            selectedColor = c.dataset.color || null;
        });
    });

    // SALVA NUOVA CATEGORIA
    saveBtn.addEventListener("click", () => {
        const name = newCategoryName.value.trim();
        if (!name) {
            // niente nome, non salvo
            return;
        }
        if (!selectedColor) {
            // nessun colore selezionato, non salvo
            return;
        }

        categories.push({ name, color: selectedColor });
        saveCategories();

        // reset campi
        newCategoryName.value = "";
        selectedColor = null;
        colorNodes.forEach(x => x.classList.remove("selected"));

        renderCategories();
    });

    // SALVA SU LOCALSTORAGE
    function saveCategories() {
        try {
            localStorage.setItem("categories", JSON.stringify(categories));
        } catch (e) {
            console.warn("Errore salvataggio categorie", e);
        }
    }

    // TEMA CHIARO/SCURO
    if (sunBtn) {
        sunBtn.addEventListener("click", () => {
            document.body.classList.remove("dark");
        });
    }

    if (moonBtn) {
        moonBtn.addEventListener("click", () => {
            document.body.classList.add("dark");
        });
    }
});
