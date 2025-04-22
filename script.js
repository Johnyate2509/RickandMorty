document.addEventListener("DOMContentLoaded", function () {
  // Obtener secciones y elementos del menú
  const sections = document.querySelectorAll('main section');
  const menuLinks = document.querySelectorAll('#main-nav ul li a');
  const bottomMenuButtons = document.querySelectorAll('#bottom-menu button');

  // Estilo del fondo al cargar
  document.body.style.backgroundColor = "#9dafac";

  // Muestra solo la sección activa según el hash de la URL
  function showActiveSection() {
    sections.forEach(section => section.classList.remove('active')); // Oculta todas
    let activeSectionId = window.location.hash || "#home"; // Por defecto, muestra #home
    let activeSection = document.querySelector(activeSectionId);
    if (activeSection) activeSection.classList.add('active'); // Activa la sección correspondiente

    // Actualiza el estado visual del menú de navegación superior
    menuLinks.forEach(link => {
      link.classList.toggle("active", link.getAttribute("href") === activeSectionId);
    });
  }

  // Mapa de texto a ID de secciones para el menú inferior
  const sectionMap = {
    'inicio': 'home',
    'buscar': 'characters',
    'favoritos': 'favorites',
    'perfil': 'register'
  };

  // Funcionalidad de botones del menú inferior
  bottomMenuButtons.forEach(button => {
    button.addEventListener('click', () => {
      const target = button.textContent.toLowerCase();
      const sectionId = sectionMap[target];
      if (sectionId) window.location.hash = `#${sectionId}`;
    });
  });

  showActiveSection(); // Muestra sección inicial
  window.addEventListener('hashchange', showActiveSection); // Cambio de sección al cambiar el hash
});

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBCJXeinurb2klueon_QMpwanb8uMy7s1E",
  authDomain: "rickandmorty-a77e9.firebaseapp.com",
  projectId: "rickandmorty-a77e9",
  storageBucket: "rickandmorty-a77e9.appspot.com",
  messagingSenderId: "996378141670",
  appId: "1:996378141670:web:f441b528bb30766e1f6c27"
};

// Inicializa Firebase y base de datos
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Constantes y referencias DOM
const API_BASE_URL = 'https://rickandmortyapi.com/api/character';
const LOCATIONS_API_URL = 'https://rickandmortyapi.com/api/location';
const EPISODES_API_URL = 'https://rickandmortyapi.com/api/episode';

const searchInput = document.getElementById('search-input');
const statusFilter = document.getElementById('status-filter');
const charactersSection = document.getElementById('characters');
const favoritesSection = document.getElementById('favorites');
const registerForm = document.getElementById('register-form');
const locationsSection = document.getElementById('locations');
const episodesSection = document.getElementById('episodes');

// Función para guardar registros en Firebase
function guardarRegistroEnFirebase(data) {
  const userId = `user_${Date.now()}`;
  database.ref('usuarios/' + userId).set(data)
    .then(() => {
      alert('Usuario registrado con éxito');
      registerForm.reset();
    })
    .catch((error) => {
      alert('Error al registrar usuario: ' + error.message);
      console.error(error);
    });
}

// Evento del formulario de registro
registerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(registerForm);
  const userData = Object.fromEntries(formData.entries());
  guardarRegistroEnFirebase(userData);
});

// Obtener personajes desde la API con filtros
async function fetchCharacters(query = '', status = '') {
  try {
    const url = `${API_BASE_URL}/?name=${query}&status=${status}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      charactersSection.innerHTML = '<p>No se encontraron personajes.</p>';
      return;
    }

    renderCharacters(data.results);
  } catch (error) {
    charactersSection.innerHTML = '<p>Error al cargar personajes.</p>';
    console.error(error);
  }
}

// Renderizar tarjetas de personajes
function renderCharacters(characters) {
  charactersSection.innerHTML = characters.map(character => `
    <div class="card">
      <img src="${character.image}" alt="${character.name}" />
      <h3>${character.name}</h3>
      <p>${character.status}</p>
      <button onclick="addToFavorites(${character.id})">Agregar a Favoritos</button>
    </div>
  `).join('');
}

// Eventos del buscador y filtros
searchInput.addEventListener('input', () => {
  fetchCharacters(searchInput.value, statusFilter.value);
});

statusFilter.addEventListener('change', () => {
  fetchCharacters(searchInput.value, statusFilter.value);
});

// LocalStorage: obtener favoritos
function getFavorites() {
  return JSON.parse(localStorage.getItem('favorites')) || [];
}

// Agregar a favoritos
function addToFavorites(id) {
  const favorites = getFavorites();
  if (!favorites.includes(id)) {
    favorites.push(id);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    alert('Agregado a favoritos');
    loadFavorites();
  }
}

// Eliminar de favoritos
function removeFromFavorites(id) {
  const favorites = getFavorites().filter(fav => fav !== id);
  localStorage.setItem('favorites', JSON.stringify(favorites));
  loadFavorites();
}

// Cargar favoritos desde la API
async function loadFavorites() {
  const ids = getFavorites();
  if (ids.length === 0) {
    favoritesSection.innerHTML = '<p>No hay favoritos aún.</p>';
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/${ids.join(',')}`);
    const data = await response.json();
    const characters = Array.isArray(data) ? data : [data];
    favoritesSection.innerHTML = characters.map(character => `
      <div class="card">
        <img src="${character.image}" alt="${character.name}" />
        <h3>${character.name}</h3>
        <p>${character.status}</p>
        <button onclick="removeFromFavorites(${character.id})">Eliminar</button>
      </div>
    `).join('');
  } catch (error) {
    favoritesSection.innerHTML = '<p>Error al cargar favoritos.</p>';
    console.error(error);
  }
}

// Obtener episodios desde la API
async function fetchEpisodes() {
  try {
    const response = await fetch(EPISODES_API_URL);
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      episodesSection.innerHTML = '<p>No se encontraron episodios.</p>';
      return;
    }

    renderEpisodes(data.results);
  } catch (error) {
    episodesSection.innerHTML = '<p>Error al cargar episodios.</p>';
    console.error(error);
  }
}

// Renderizar episodios
function renderEpisodes(episodes) {
  episodesSection.innerHTML = episodes.map(ep => `
    <div class="card">
      <h3>${ep.name}</h3>
      <p><strong>Fecha:</strong> ${ep.air_date}</p>
      <p><strong>Episodio:</strong> ${ep.episode}</p>
    </div>
  `).join('');
}

// Obtener ubicaciones desde la API
async function fetchLocations() {
  try {
    const response = await fetch(LOCATIONS_API_URL);
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      locationsSection.innerHTML = '<p>No se encontraron ubicaciones.</p>';
      return;
    }

    renderLocations(data.results);
  } catch (error) {
    locationsSection.innerHTML = '<p>Error al cargar ubicaciones.</p>';
    console.error(error);
  }
}

// Renderizar ubicaciones
function renderLocations(locations) {
  locationsSection.innerHTML = locations.map(loc => `
    <div class="card">
      <h3>${loc.name}</h3>
      <p><strong>Tipo:</strong> ${loc.type}</p>
      <p><strong>Dimensión:</strong> ${loc.dimension}</p>
    </div>
  `).join('');
}

// Carga inicial
fetchCharacters();
loadFavorites();
fetchEpisodes();
fetchLocations();

// Exponer funciones globalmente
window.addToFavorites = addToFavorites;
window.removeFromFavorites = removeFromFavorites;
window.guardarRegistroEnFirebase = guardarRegistroEnFirebase;
