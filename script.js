// main.js

    // Splash screen ocultar después de 5 segundos
    window.addEventListener("load", () => {
      setTimeout(() => {
        const splash = document.getElementById("splash-screen");
        splash.style.opacity = "0";
        splash.style.visibility = "hidden";
      }, 5000);
    });

// Esperar a que el DOM cargue completamente
document.addEventListener("DOMContentLoaded", function () {
  const sections = document.querySelectorAll("main section");
  const menuLinks = document.querySelectorAll(".nav-link");
  const bottomMenuButtons = document.querySelectorAll("#bottom-menu button");

  // Estilo de fondo inicial
  document.body.style.backgroundColor = "#9dafac";

  // Mostrar la sección activa según el hash en la URL
  function showActiveSection() {
    sections.forEach((section) => section.classList.remove("active"));
    let activeSectionId = window.location.hash || "#home";
    let activeSection = document.querySelector(activeSectionId);
    if (activeSection) activeSection.classList.add("active");

    // Resaltar link activo en la navegación
    menuLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === activeSectionId);
    });
  }

  // Mapeo de botones del menú inferior a secciones
  bottomMenuButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const sectionMap = {
        inicio: "home",
        buscar: "characters",
        favoritos: "favorites",
        perfil: "register",
      };
      const target = button.textContent.toLowerCase();
      const sectionId = sectionMap[target];
      if (sectionId) window.location.hash = `#${sectionId}`;
    });
  });

  showActiveSection();
  window.addEventListener("hashchange", showActiveSection);
});

// Firebase Configuración
const firebaseConfig = {
  apiKey: "AIzaSyBCJXeinurb2klueon_QMpwanb8uMy7s1E",
  authDomain: "rickandmorty-a77e9.firebaseapp.com",
  projectId: "rickandmorty-a77e9",
  storageBucket: "rickandmorty-a77e9.appspot.com",
  messagingSenderId: "996378141670",
  appId: "1:996378141670:web:f441b528bb30766e1f6c27",
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Elementos del DOM necesarios
const searchInput = document.getElementById("search-input");
const statusFilter = document.getElementById("status-filter");
const charactersContainer = document.getElementById("characters");
const favoritesContainer = document.getElementById("favorites");
const episodesContainer = document.getElementById("episodes");
const locationsContainer = document.getElementById("locations");
const registerForm = document.getElementById("register-form");

// Endpoints de la API de Rick and Morty
const API_BASE = {
  characters: "https://rickandmortyapi.com/api/character",
  locations: "https://rickandmortyapi.com/api/location",
  episodes: "https://rickandmortyapi.com/api/episode",
};

// Registro de usuario con Firebase
if (registerForm) {
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(registerForm);
    const userData = Object.fromEntries(formData.entries());
    const userId = `user_${Date.now()}`;

    database
      .ref("usuarios/" + userId)
      .set(userData)
      .then(() => {
        alert("Usuario registrado con éxito");
        registerForm.reset();
      })
      .catch((error) => {
        alert("Error al registrar usuario: " + error.message);
      });
  });
}

// Función para obtener personajes desde la API
async function fetchCharacters(query = "", status = "") {
  try {
    const url = `${API_BASE.characters}/?name=${query}&status=${status}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.results) {
      charactersContainer.innerHTML = "<p>No se encontraron personajes.</p>";
      return;
    }
    renderCharacters(data.results);
  } catch (error) {
    charactersContainer.innerHTML = "<p>Error al cargar personajes.</p>";
  }
}

// Mostrar tarjetas de personajes
function renderCharacters(characters) {
  charactersContainer.innerHTML = characters
    .map(
      (c) => `
    <div class="card">
      <img src="${c.image}" alt="${c.name}" />
      <h3>${c.name}</h3>
      <p>${c.status}</p>
      <button onclick="addToFavorites(${c.id})">Agregar a Favoritos</button>
    </div>`
    )
    .join("");
}

// Obtener favoritos del localStorage
function getFavorites() {
  return JSON.parse(localStorage.getItem("favorites")) || [];
}

// Agregar personaje a favoritos
function addToFavorites(id) {
  const favorites = getFavorites();
  if (!favorites.includes(id)) {
    favorites.push(id);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    loadFavorites();
  }
}

// Quitar personaje de favoritos
function removeFromFavorites(id) {
  const updated = getFavorites().filter((fid) => fid !== id);
  localStorage.setItem("favorites", JSON.stringify(updated));
  loadFavorites();
}

// Cargar favoritos
async function loadFavorites() {
  const ids = getFavorites();
  if (ids.length === 0) {
    favoritesContainer.innerHTML = "<p>No hay favoritos aún.</p>";
    return;
  }

  try {
    const response = await fetch(`${API_BASE.characters}/${ids.join(",")}`);
    const data = await response.json();
    const results = Array.isArray(data) ? data : [data];

    favoritesContainer.innerHTML = results
      .map(
        (c) => `
      <div class="card">
        <img src="${c.image}" alt="${c.name}" />
        <h3>${c.name}</h3>
        <p>${c.status}</p>
        <button onclick="removeFromFavorites(${c.id})">Eliminar</button>
      </div>`
      )
      .join("");
  } catch (error) {
    favoritesContainer.innerHTML = "<p>Error al cargar favoritos.</p>";
  }
}

// Obtener lista de episodios
async function fetchEpisodes() {
  try {
    const response = await fetch(API_BASE.episodes);
    const data = await response.json();
    episodesContainer.innerHTML = data.results
      .map((ep) => `<p><strong>${ep.name}</strong> - ${ep.episode}</p>`) 
      .join("");
  } catch (error) {
    episodesContainer.innerHTML = "<p>Error al cargar episodios.</p>";
  }
}

// Obtener lista de ubicaciones
async function fetchLocations() {
  try {
    const response = await fetch(API_BASE.locations);
    const data = await response.json();
    locationsContainer.innerHTML = data.results
      .map((loc) => `<p><strong>${loc.name}</strong> - ${loc.type}</p>`) 
      .join("");
  } catch (error) {
    locationsContainer.innerHTML = "<p>Error al cargar ubicaciones.</p>";
  }
}

// Eventos del buscador y filtro
if (searchInput && statusFilter) {
  searchInput.addEventListener("input", () => {
    fetchCharacters(searchInput.value, statusFilter.value);
  });

  statusFilter.addEventListener("change", () => {
    fetchCharacters(searchInput.value, statusFilter.value);
  });
}

// Llamadas iniciales
fetchCharacters();
fetchEpisodes();
fetchLocations();
loadFavorites();

// Exponer funciones a window para uso en botones inline
window.addToFavorites = addToFavorites;
window.removeFromFavorites = removeFromFavorites;
