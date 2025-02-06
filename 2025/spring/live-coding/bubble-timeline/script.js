import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

let seizures = await d3.csv("mochi-seizures.csv", d3.autoType);

let scale = d3.scaleLinear().domain([20, 83]).range([0, 1]);
let color = d3.scaleSequential(d3.interpolateBuPu);
let randomX = d3.randomUniform(0, 600);

color(0.5);

for (let seizure of seizures) {
  chart.innerHTML += `<circle 
    cx="${randomX()}"
    cy="200"
    r="50"
    style="fill: ${color(scale(seizure.Duration))}"
    ></circle>`;
}
