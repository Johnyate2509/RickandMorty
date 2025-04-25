const locationsContainer = document.getElementById("locations-container");

export async function fetchLocations() {
  let url = "https://rickandmortyapi.com/api/location";
  let allLocations = [];

  try {
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
  } catch (error) {
    console.error("Error fetching locations:", error);
  }
}
