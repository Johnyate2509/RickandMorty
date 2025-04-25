const episodesContainer = document.getElementById("episodes-container");

export async function fetchEpisodes() {
  let url = "https://rickandmortyapi.com/api/episode";
  let allEpisodes = [];

  try {
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
  } catch (error) {
    console.error("Error fetching episodes:", error);
  }
}
