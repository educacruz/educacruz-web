const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");
menuButton.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(open));
});
document.querySelectorAll(".nav a").forEach(link => link.addEventListener("click", () => {
  nav.classList.remove("open");
  menuButton.setAttribute("aria-expanded", "false");
}));
document.getElementById("year").textContent = new Date().getFullYear();

async function loadMaterials() {
  const container = document.getElementById("materials-list");
  const search = document.getElementById("search-materials");
  const area = document.getElementById("filter-area");
  try {
    const response = await fetch("materiales/materiales.json");
    const data = await response.json();
    function render() {
      const term = search.value.trim().toLowerCase();
      const selectedArea = area.value;
      const filtered = data.filter(item => {
        const haystack = `${item.titulo} ${item.area} ${item.grado} ${item.descripcion}`.toLowerCase();
        return haystack.includes(term) && (!selectedArea || item.area === selectedArea);
      });
      container.innerHTML = "";
      if (!filtered.length) {
        container.innerHTML = '<div class="empty-state">Todavía no hay materiales que coincidan con la búsqueda.</div>';
        return;
      }
      filtered.forEach(item => {
        const card = document.createElement("article");
        card.className = "material-card";
        const meta = document.createElement("div"); meta.className = "material-meta";
        meta.textContent = `${item.area} · ${item.grado}`;
        const title = document.createElement("h3"); title.textContent = item.titulo;
        const description = document.createElement("p"); description.textContent = item.descripcion;
        const link = document.createElement("a"); link.className = "download-link";
        link.href = `materiales/${encodeURIComponent(item.archivo)}`; link.target = "_blank";
        link.rel = "noopener"; link.textContent = "Ver o descargar material ↗";
        card.append(meta, title, description, link); container.append(card);
      });
    }
    search.addEventListener("input", render);
    area.addEventListener("change", render);
    render();
  } catch (error) {
    container.innerHTML = '<div class="empty-state">No se pudo cargar la biblioteca. Revisa el archivo materiales/materiales.json.</div>';
  }
}
loadMaterials();
