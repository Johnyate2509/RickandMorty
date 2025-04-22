// Archivo: main.js

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
const episodesContainer = document.getElementById("episodes");
const locationsContainer = document.getElementById("locations");
const favoritesContainer = document.getElementById("favorites");

let characters = [];
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

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
  renderFavorites(); // Aseguramos que se llama solo cuando characters ya tiene datos
}

function createCharacterCard(char, isFavorite) {
  const card = document.createElement("div");
  card.className = "card";

  card.innerHTML = `
    <img src="${char.image}" alt="${char.name}" />
    <h3>${char.name}</h3>
    <p>${char.status}</p>
    <button class="favorite-btn" data-id="${char.id}">
      ${isFavorite ? "Eliminar de favoritos" : "Agregar a favoritos"}
    </button>
  `;

  return card;
}

function renderCharacters(data) {
  characterContainer.innerHTML = "";

  const grid = document.createElement("div");
  grid.className = "character-grid";

  data.forEach((char) => {
    const isFavorite = favorites.includes(char.id);
    const card = createCharacterCard(char, isFavorite);
    grid.appendChild(card);
  });

  characterContainer.appendChild(grid);

  document.querySelectorAll(".favorite-btn").forEach(button => {
    button.addEventListener("click", toggleFavorite);
  });
}

function toggleFavorite(e) {
  const id = parseInt(e.target.dataset.id);
  if (favorites.includes(id)) {
    favorites = favorites.filter(fav => fav !== id);
  } else {
    favorites.push(id);
  }

  localStorage.setItem("favorites", JSON.stringify(favorites));
  console.log("Favoritos actualizados:", favorites);
  renderCharacters(characters);
  renderFavorites();
}

function renderFavorites() {
  console.log("Renderizando favoritos:", favorites);
  favoritesContainer.innerHTML = "<h2>Favoritos</h2>";
  const favChars = characters.filter(c => favorites.includes(c.id));

  if (favChars.length === 0) {
    favoritesContainer.innerHTML += "<p>No hay favoritos aún.</p>";
    return;
  }

  const grid = document.createElement("div");
  grid.className = "character-grid";

  favChars.forEach((char) => {
    const card = createCharacterCard(char, true);
    const btn = card.querySelector(".favorite-btn");
    btn.className = "remove-favorite-btn";
    btn.textContent = "Eliminar de favoritos";
    grid.appendChild(card);
  });

  favoritesContainer.appendChild(grid);

  document.querySelectorAll(".remove-favorite-btn").forEach(button => {
    button.addEventListener("click", (e) => {
      const id = parseInt(e.target.dataset.id);
      favorites = favorites.filter(fav => fav !== id);
      localStorage.setItem("favorites", JSON.stringify(favorites));
      renderCharacters(characters);
      renderFavorites();
    });
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

// Inicia carga principal
fetchCharacters();

// --- Cargar episodios y ubicaciones ---
async function fetchEpisodes() {
  let url = "https://rickandmortyapi.com/api/episode";
  let allEpisodes = [];

  while (url) {
    const res = await fetch(url);
    const data = await res.json();
    allEpisodes = allEpisodes.concat(data.results);
    url = data.info.next;
  }

  episodesContainer.innerHTML += "<div class='episode-list'>" +
    allEpisodes.map(ep => `
      <div class='card episode-content'>
        <h3>${ep.name}</h3>
        <p>${ep.episode}</p>
      </div>`).join("") +
    "</div>";
}

async function fetchLocations() {
  let url = "https://rickandmortyapi.com/api/location";
  let allLocations = [];

  while (url) {
    const res = await fetch(url);
    const data = await res.json();
    allLocations = allLocations.concat(data.results);
    url = data.info.next;
  }

  locationsContainer.innerHTML += "<div class='location-list'>" +
    allLocations.map(loc => `
      <div class='card location-content'>
        <h3>${loc.name}</h3>
        <p>${loc.type} - ${loc.dimension}</p>
      </div>`).join("") +
    "</div>";
}

fetchEpisodes();
fetchLocations();
