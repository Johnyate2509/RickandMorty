// Archivo: main.js

// Firebase configuración y lógica (si ya está configurado en otro lugar, omitir esta parte)
// const firebaseConfig = { ... };
// firebase.initializeApp(firebaseConfig);
// const database = firebase.database();

// --- Splash screen ocultar después de 5 segundos ---
window.addEventListener("load", () => {
  setTimeout(() => {
    const splash = document.getElementById("splash-screen");
    splash.style.opacity = "0";
    splash.style.visibility = "hidden";
  }, 5000);
});

// --- Navegación dinámica entre secciones ---
document.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll("main section");
  const bottomMenuButtons = document.querySelectorAll("#bottom-menu button");

  function mostrarSeccion(id) {
    sections.forEach(section => {
      section.style.display = section.id === id ? "block" : "none";
    });

    links.forEach(link => {
      link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
    });
  }

  links.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const id = link.getAttribute("href").substring(1);
      window.location.hash = `#${id}`;
    });
  });

  const sectionMap = {
    inicio: "home",
    buscar: "characters",
    favoritos: "favorites",
    perfil: "register"
  };

  bottomMenuButtons.forEach(button => {
    button.addEventListener("click", () => {
      const id = sectionMap[button.textContent.toLowerCase()];
      if (id) window.location.hash = `#${id}`;
    });
  });

  window.addEventListener("hashchange", () => {
    const id = window.location.hash.substring(1) || "home";
    mostrarSeccion(id);
  });

  const inicial = window.location.hash.substring(1) || "home";
  mostrarSeccion(inicial);
});

// --- Cargar datos desde la API de Rick and Morty ---
const characterContainer = document.getElementById("characters");
const searchInput = document.getElementById("search-input");
const statusFilter = document.getElementById("status-filter");

let characters = [];

async function fetchCharacters() {
  let url = "https://rickandmortyapi.com/api/character";
  let allCharacters = [];

  while (url) {
    const res = await fetch(url);
    const data = await res.json();
    allCharacters = allCharacters.concat(data.results);
    url = data.info.next;
  }

  characters = allCharacters;
  renderCharacters(characters);
}

function renderCharacters(data) {
  characterContainer.innerHTML = "";

  data.forEach((char) => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${char.image}" alt="${char.name}" />
      <h3>${char.name}</h3>
      <p>${char.status}</p>
    `;

    characterContainer.appendChild(card);
  });
}

function applyFilters() {
  const search = searchInput.value.toLowerCase();
  const status = statusFilter.value;

  const filtered = characters.filter((char) => {
    return (
      char.name.toLowerCase().includes(search) &&
      (status === "" || char.status.toLowerCase() === status)
    );
  });

  renderCharacters(filtered);
}

searchInput.addEventListener("input", applyFilters);
statusFilter.addEventListener("change", applyFilters);

fetchCharacters();