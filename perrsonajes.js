export let characters = [];
export let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

const characterContainer = document.getElementById("characters");
const favoritesContainer = document.getElementById("favorites");

export async function fetchCharacters() {
  let url = "https://rickandmortyapi.com/api/character";
  let allCharacters = [];

  try {
    while (url) {
      const res = await fetch(url);
      const data = await res.json();
      allCharacters = allCharacters.concat(data.results);
      url = data.info.next;
    }

    characters = allCharacters;
    renderCharacters(characters);
    renderFavorites();
  } catch (error) {
    console.error("Error fetching characters:", error);
  }
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

export function renderCharacters(data) {
  characterContainer.innerHTML = "";

  const grid = document.createElement("div");
  grid.className = "character-grid";

  data.forEach(char => {
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
  renderCharacters(characters);
  renderFavorites();
}

export function renderFavorites() {
  favoritesContainer.innerHTML = "<h2>Favoritos</h2>";
  const favChars = characters.filter(c => favorites.includes(c.id));

  if (favChars.length === 0) {
    favoritesContainer.innerHTML += "<p>No hay favoritos aún.</p>";
    return;
  }

  const grid = document.createElement("div");
  grid.className = "character-grid";

  favChars.forEach(char => {
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
