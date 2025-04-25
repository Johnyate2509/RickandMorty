import { characters, renderCharacters } from "./perrsonajes.js";

const searchInput = document.getElementById("search-input");
const statusFilter = document.getElementById("status-filter");

function applyFilters() {
  const search = searchInput.value.toLowerCase();
  const status = statusFilter.value;

  const filtered = characters.filter((char) =>
    char.name.toLowerCase().includes(search) &&
    (status === "" || char.status.toLowerCase() === status)
  );

  renderCharacters(filtered);
}

searchInput.addEventListener("input", applyFilters);
statusFilter.addEventListener("change", applyFilters);
