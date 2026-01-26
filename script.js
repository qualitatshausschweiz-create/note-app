// ELEMENTI
const themeToggleBtn = document.getElementById("themeToggleBtn");
const themeSelect = document.getElementById("themeSelect");
const customColorPicker = document.getElementById("customColorPicker");

// TEMA SOLE/LUNA
function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  const next = current === "light" ? "dark" : "light";

  document.documentElement.setAttribute("data-theme", next);
  themeToggleBtn.textContent = next === "dark" ? "🌙" : "🌞";
  themeSelect.value = next;

  saveSettings();
}

themeToggleBtn.addEventListener("click", toggleTheme);

// CAMBIO TEMA DA SELECT
themeSelect.addEventListener("change", e => {
  const theme = e.target.value;
  document.documentElement.setAttribute("data-theme", theme);
  themeToggleBtn.textContent = theme === "dark" ? "🌙" : "🌞";
  saveSettings();
});

// PALETTE COLORI
document.querySelectorAll(".color-swatch").forEach(swatch => {
  swatch.addEventListener("click", () => {
    const color = swatch.dataset.color;

    document.documentElement.style.setProperty("--accent", color);
    customColorPicker.value = color;

    document.querySelectorAll(".color-swatch").forEach(s => s.classList.remove("selected"));
    swatch.classList.add("selected");

    saveSettings();
  });
});

// COLORE PERSONALIZZATO
customColorPicker.addEventListener("input", e => {
  const color = e.target.value;
  document.documentElement.style.setProperty("--accent", color);
  saveSettings();
});

// SALVATAGGIO IMPOSTAZIONI
function saveSettings() {
  const settings = {
    theme: document.documentElement.getAttribute("data-theme"),
    accent: getComputedStyle(document.documentElement).getPropertyValue("--accent").trim()
  };
  localStorage.setItem("settings_v1", JSON.stringify(settings));
}

// CARICAMENTO IMPOSTAZIONI
function loadSettings() {
  const s = localStorage.getItem("settings_v1");
  if (!s) return;

  const settings = JSON.parse(s);

  if (settings.theme) {
    document.documentElement.setAttribute("data-theme", settings.theme);
    themeToggleBtn.textContent = settings.theme === "dark" ? "🌙" : "🌞";
    themeSelect.value = settings.theme;
  }

  if (settings.accent) {
    document.documentElement.style.setProperty("--accent", settings.accent);
    customColorPicker.value = settings.accent;
  }
}

loadSettings();
