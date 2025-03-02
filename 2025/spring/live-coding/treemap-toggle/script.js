// Import d3 library
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const buildings = [
  { name: "c", area: 1000, lat: 45, lon: 50 },
  { name: "d", area: 1500, lat: 85, lon: 30 },
  { name: "f", area: 750, lat: 15, lon: 90 },
  { name: "a", area: 500, lat: 20, lon: 20 },
  { name: "b", area: 250, lat: 70, lon: 85 },
  { name: "e", area: 100, lat: 50, lon: 20 },
];

// Convert data to hierarchical format
const root = d3.hierarchy({ children: buildings }).sum((d) => d.area);

const w = 600;
const h = 400;

// Create and compute treemap layout
d3.treemap().size([w, h]).padding(0).tile(d3.treemapBinary)(root);

// Extract computed positions
const leaves = root.leaves();

buildings.forEach((building, index) => {
  const d = leaves[index];

  building.x = d.x0;
  building.y = d.y0;
  building.width = d.x1 - d.x0;
  building.height = d.y1 - d.y0;

  building.element = document.createElement("div");
  building.element.classList.add("building");
  building.element.textContent = building.name;
  building.element.style.width = building.width + "px";
  building.element.style.height = building.height + "px";
  building.element.style.transitionDelay = index * 0.05 + "s";

  if (building.name === "a") {
    building.element.style.background = "DeepPink";
  }

  chart.append(building.element);
});

function move() {
  const mode = document.querySelector('[name="mode"]:checked').value;

  const offsetX = (840 - w) / 2;
  const offsetY = ((840 * 2) / 3 - h) / 2;

  buildings.forEach((building) => {
    if (mode === "rank") {
      building.element.style.left = offsetX + building.x + "px";
      building.element.style.top = offsetY + building.y + "px";
      building.element.style.scale = 1;
      building.element.style.translate = "0% 0%";
      return;
    }

    if (mode === "map") {
      building.element.style.left = building.lon + "%";
      building.element.style.top = building.lat + "%";
      building.element.style.scale = 0.5;
      building.element.style.translate = "-50% -50%";
    }
  });
}

move();

filters.oninput = move;
