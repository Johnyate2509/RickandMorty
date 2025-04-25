export function initNavigation() {
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
  }
  