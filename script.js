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
    if (activeSection) activeSection.classList.add('active'); // Activa sección correspondiente

    // Actualiza el estado visual del menú de navegación superior
    menuLinks.forEach(link => {
      link.classList.toggle("active", link.getAttribute("href") === activeSectionId);
    });
  }


  // Asignar funcionalidad a los botones del menú inferior
  bottomMenuButtons.forEach(button => {
    button.addEventListener('click', () => {
      const sectionMap = {
        'inicio': 'home',
        'buscar': 'characters',
        'favoritos': 'favorites',
        'perfil': 'register'
      };
      const target = button.textContent.toLowerCase(); // Detecta texto del botón
      const sectionId = sectionMap[target]; // Mapea a ID de sección
      if (sectionId) window.location.hash = `#${sectionId}`; // Navega a la sección
    });
  });
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

// Referencias a elementos del DOM
const searchInput = document.getElementById('search-input');
const statusFilter = document.getElementById('status-filter');
const charactersSection = document.getElementById('characters');
const favoritesSection = document.getElementById('favorites');
const registerForm = document.getElementById('register-form');
const API_BASE_URL = 'https://rickandmortyapi.com/api/character';

// Guarda los datos del usuario registrado en Firebase
function guardarRegistroEnFirebase(data) {
  const userId = `user_${Date.now()}`; // ID único basado en timestamp
  database.ref('usuarios/' + userId).set(data)
    .then(() => {
      alert('Usuario registrado con éxito');
      registerForm.reset(); // Limpia el formulario
    })
    .catch((error) => {
      alert('Error al registrar usuario: ' + error.message);
      console.error(error);
    });
}

// Evento al enviar el formulario de registro
registerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(registerForm);
  const userData = Object.fromEntries(formData.entries()); // Convierte a objeto
  guardarRegistroEnFirebase(userData); // Guarda en Firebase
});

// Obtiene personajes desde la API con filtros de nombre y estado
async function fetchCharacters(query = '', status = '') {
  try {
    const url = `${API_BASE_URL}/?name=${query}&status=${status}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      charactersSection.innerHTML = '<p>No se encontraron personajes.</p>';
      return;
    }

    renderCharacters(data.results); // Muestra personajes
  } catch (error) {
    charactersSection.innerHTML = '<p>Error al cargar personajes.</p>';
    console.error(error);
  }
}

// Renderiza las tarjetas de personajes
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

// Eventos del buscador y filtro por estado
searchInput.addEventListener('input', () => {
  fetchCharacters(searchInput.value, statusFilter.value);
});

statusFilter.addEventListener('change', () => {
  fetchCharacters(searchInput.value, statusFilter.value);
});

// Devuelve el array de favoritos desde localStorage
function getFavorites() {
  return JSON.parse(localStorage.getItem('favorites')) || [];
}

// Agrega un personaje a favoritos y lo guarda en localStorage
function addToFavorites(id) {
  const favorites = getFavorites();
  if (!favorites.includes(id)) {
    favorites.push(id);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    alert('Agregado a favoritos');
    loadFavorites(); // Actualiza lista
  }
}

// Elimina un personaje de favoritos
function removeFromFavorites(id) {
  const favorites = getFavorites().filter(fav => fav !== id);
  localStorage.setItem('favorites', JSON.stringify(favorites));
  loadFavorites(); // Actualiza lista
}

// Carga y muestra los personajes favoritos
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

// Carga inicial de personajes y favoritos
fetchCharacters();
loadFavorites();

// Expone funciones para que puedan usarse en HTML dinámico
window.addToFavorites = addToFavorites;
window.removeFromFavorites = removeFromFavorites;
window.guardarRegistroEnFirebase = guardarRegistroEnFirebase;

showActiveSection(); // Mostrar sección inicial
window.addEventListener('hashchange', showActiveSection); // Cambiar sección al cambiar el hash

// Oculta el splash screen una vez cargada la página
window.addEventListener('load', () => {
  const splash = document.getElementById('splash-screen');
  if (splash) splash.style.display = 'none';
});