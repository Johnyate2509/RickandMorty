document.addEventListener("DOMContentLoaded", function () {
  const sections = document.querySelectorAll('main section');
  const menuLinks = document.querySelectorAll('#main-nav ul li a');
  document.body.style.backgroundColor = "#9dafac";

  function showActiveSection() {
      // Ocultar todas las secciones
      sections.forEach(section => section.classList.remove('active'));

      // Obtener el ID de la sección activa desde el hash de la URL o usar #home como predeterminado
      let activeSectionId = window.location.hash || "#home";
      let activeSection = document.querySelector(activeSectionId);

      // Si la sección existe, mostrarla
      if (activeSection) {
          activeSection.classList.add('active');
      }

      // Marcar el enlace activo en el menú
      menuLinks.forEach(link => {
          link.classList.toggle("active", link.getAttribute("href") === activeSectionId);
      });
  }

  // Llamar a la función al cargar la página
  showActiveSection();

  // Detectar cambios en la URL y actualizar la sección activa
  window.addEventListener('hashchange', showActiveSection);
});

// Este script debe ser cargado con <script type="module" src="main.js"></script>

// Esperar que cargue el DOM
window.addEventListener('load', () => {
    const splash = document.getElementById('splash-screen');
    if (splash) splash.style.display = 'none';
  });
  
  // Elementos del DOM
  const searchInput = document.getElementById('search-input');
  const statusFilter = document.getElementById('status-filter');
  const charactersSection = document.getElementById('characters');
  const favoritesSection = document.getElementById('favorites');
  const registerForm = document.getElementById('register-form');
  
  // API de Rick and Morty
  const API_BASE_URL = 'https://rickandmortyapi.com/api/character';
  
  // Firebase (usa type="module" para que los imports funcionen)
  const firebaseConfig = {
    apiKey: "AIzaSyBCJXeinurb2klueon_QMpwanb8uMy7s1E",
    authDomain: "rickandmorty-a77e9.firebaseapp.com",
    projectId: "rickandmorty-a77e9",
    storageBucket: "rickandmorty-a77e9.firebasestorage.app",
    messagingSenderId: "996378141670",
    appId: "1:996378141670:web:f441b528bb30766e1f6c27"
  };

  function guardarRegistroEnFirebase(data) {
    const userId = `user_${Date.now()}`;
    set(ref(database, 'usuarios/' + userId), data)
      .then(() => {
        alert('Usuario registrado con éxito');
        registerForm.reset();
      })
      .catch((error) => {
        alert('Error al registrar usuario: ' + error.message);
        console.error(error);
      });
  }
  
  // Asegúrate que este código esté dentro de window.load o después de definir la función
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(registerForm);
    const userData = Object.fromEntries(formData.entries());
    guardarRegistroEnFirebase(userData);
  });
  
    
  // Obtener personajes desde la API
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
  
  // Renderizar personajes
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
  
  // Buscar y filtrar
  searchInput.addEventListener('input', () => {
    fetchCharacters(searchInput.value, statusFilter.value);
  });
  
  statusFilter.addEventListener('change', () => {
    fetchCharacters(searchInput.value, statusFilter.value);
  });
  
  // CRUD Favoritos - LocalStorage
  function getFavorites() {
    return JSON.parse(localStorage.getItem('favorites')) || [];
  }
  
  function addToFavorites(id) {
    const favorites = getFavorites();
    if (!favorites.includes(id)) {
      favorites.push(id);
      localStorage.setItem('favorites', JSON.stringify(favorites));
      alert('Agregado a favoritos');
      loadFavorites();
    }
  }
  
  function removeFromFavorites(id) {
    const favorites = getFavorites().filter(fav => fav !== id);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    loadFavorites();
  }
  
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
  
  // Formulario de registro
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(registerForm);
    const userData = Object.fromEntries(formData.entries());
    guardarRegistroEnFirebase(userData);
    alert('Usuario registrado con éxito');
    registerForm.reset();
  });
  
  // Cargar datos iniciales
  fetchCharacters();
  loadFavorites();
  
  // Hacer funciones accesibles globalmente (por los botones en el HTML generado)
  window.addToFavorites = addToFavorites;
  window.removeFromFavorites = removeFromFavorites;  
  window.guardarRegistroEnFirebase = guardarRegistroEnFirebase;
