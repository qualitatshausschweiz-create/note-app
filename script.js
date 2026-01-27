document.addEventListener("DOMContentLoaded", () => {

    // STORAGE
    let categories = JSON.parse(localStorage.getItem("categories")) || [
        { name: "Lavoro", color: "#1e90ff" },
        { name: "Spesa", color: "#ffa502" },
        { name: "Idee", color: "#a55eea" },
        { name: "Tutte", color: "#2ed573" }
    ];

    let notes = JSON.parse(localStorage.getItem("notes")) || [];
    let trash = JSON.parse(localStorage.getItem("trash")) || [];

    // ELEMENTI
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

    let selectedCategory = null;
    let selectedColor = "#1e90ff";

    // APRI PANELLO NUOVA NOTA
    addNoteBtn.onclick = () => {
        notePanel.classList.remove("hidden");
        renderCategoryButtons();
        renderPalette();
    };

    // CHIUDI PANELLO
    closeNotePanel.onclick = () => {
        notePanel.classList.add("hidden");
        resetNoteForm();
    };

    // BOTTONI CATEGORIA
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

    // PALETTE COLORI
    function renderPalette() {
        const colors = ["#ff6b6b", "#ffa502", "#2ed573", "#1e90ff", "#a55eea", "#000000", "#ffffff"];
        notePalette.innerHTML = "";

        colors.forEach(c => {
            const div = document.createElement("div");
            div.className = "color";
            div.style.background = c;

            div.onclick = () => {
                selectedColor = c;
                document.querySelectorAll(".color").forEach(x => x.classList.remove("selected"));
                div.classList.add("selected");
            };

            notePalette.appendChild(div);
        });
    }

    // SALVA NOTA
    saveNoteBtn.onclick = () => {
        if (!noteTitle.value.trim() || !selectedCategory) return;

        const newNote = {
            id: Date.now(),
            titolo: noteTitle.value,
            testo: noteText.value,
            colore: selectedColor,
            categoria: selectedCategory,
            data: new Date().toISOString()
        };

        notes.push(newNote);
        localStorage.setItem("notes", JSON.stringify(notes));

        renderNotes();
        resetNoteForm();
        notePanel.classList.add("hidden");
    };

    function resetNoteForm() {
        noteTitle.value = "";
        noteText.value = "";
        selectedCategory = null;
        selectedColor = "#1e90ff";
    }

    // MOSTRA NOTE
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
                localStorage.setItem("notes", JSON.stringify(notes));
                localStorage.setItem("trash", JSON.stringify(trash));
                renderNotes();
            };

            notesContainer.appendChild(div);
        });
    }

    renderNotes();

    // CESTINO
    trashBtn.onclick = () => {
        trashPanel.classList.remove("hidden");
        renderTrash();
    };

    closeTrashPanel.onclick = () => {
        trashPanel.classList.add("hidden");
    };

    function renderTrash() {
        trashList.innerHTML = "";

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
                localStorage.setItem("notes", JSON.stringify(notes));
                localStorage.setItem("trash", JSON.stringify(trash));
                renderTrash();
                renderNotes();
            };

            div.querySelector(".deleteForever").onclick = () => {
                trash = trash.filter(x => x.id !== n.id);
                localStorage.setItem("trash", JSON.stringify(trash));
                renderTrash();
            };

            trashList.appendChild(div);
        });
    }

});
