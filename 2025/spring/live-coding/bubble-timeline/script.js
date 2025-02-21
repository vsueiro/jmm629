// Import d3 library
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Read data
let seizures = await d3.csv("mochi-seizures.csv", d3.autoType);

// Convert duration into 0-1 values
let scale = d3.scaleLinear().domain([40, 83]).range([0.25, 1]);

// Get color based on 0-1 values
let color = d3.scaleSequential(d3.interpolateBuPu);

// Convert dates between 0 and 600
let xScale = d3
  .scaleTime()
  .domain([new Date("2025-01-01"), new Date()])
  .range([0, 600]);

let yScale = d3.scaleLinear().domain([0, 24]).range([400, 0]);

let radiusScale = d3.scaleSqrt().domain([0, 83]).range([0, 60]);

// For each row in my dataset
for (let seizure of seizures) {
  // Add a circle to my SVG chart
  chart.innerHTML += `<circle 
    cx="${xScale(seizure.Date)}"
    cy="${yScale(seizure.Start)}"
    r="${radiusScale(seizure.Duration)}"
    fill="${color(scale(seizure.Duration))}"
    ></circle>
    `;
}
