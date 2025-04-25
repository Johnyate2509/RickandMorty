import { initNavigation } from "./menu.js";
import { fetchCharacters } from "./perrsonajes.js";
import "./busqueda.js";
import { fetchEpisodes } from "./episodios.js";
import { fetchLocations } from "./lugares.js";

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  fetchCharacters();
  fetchEpisodes();
  fetchLocations();
});
