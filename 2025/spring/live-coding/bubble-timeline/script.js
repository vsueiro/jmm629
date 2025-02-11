// Import d3 library
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Read data
let seizures = await d3.csv("mochi-seizures.csv", d3.autoType);

// Convert duration into 0-1 values
let scale = d3.scaleLinear().domain([20, 83]).range([0, 1]);

// Get color based on 0-1 values
let color = d3.scaleSequential(d3.interpolateBuPu);

// let xScale = d3.scaleTime([new Date("2025-01-01"), new Date()], [0, 600]);
let xScale = d3
  .scaleTime()
  .domain([new Date("2025-01-01"), new Date()])
  .range([0, 600]);

// For each row in my dataset
for (let seizure of seizures) {
  // Add a circle to my SVG chart
  chart.innerHTML += `<circle 
    cx="${xScale(seizure.Date)}"
    cy="200"
    r="50"
    fill="${color(scale(seizure.Duration))}"
    ></circle>`;
}
