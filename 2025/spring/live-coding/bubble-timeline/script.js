// Import d3 library
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const w = 600;
const h = 400;
const r = w * 0.075;
const offset = r;

// Adjust viewBox (to “zoom out”)
chart.setAttribute("viewBox", `${-offset} ${-offset} ${w + offset * 2} ${h + offset * 2}`);

// Read data
const seizures = await d3.csv("mochi-seizures.csv", d3.autoType);
const medications = await d3.csv("mochi-medications.csv", d3.autoType);

console.log(seizures);

// Get min and max values
const minDuration = d3.min(seizures, (d) => d.Duration);
const maxDuration = d3.max(seizures, (d) => d.Duration);
const minDate = d3.min(seizures, (d) => d.Start);
const maxDate = d3.max(seizures, (d) => d.Start);

window.highlight = function (circle, flag = true) {
  console.log("yooo");
  circle.classList.toggle("highlight", flag);
};

// Convert duration into 0-1 values
let scale = d3.scaleLinear().domain([minDuration, maxDuration]).range([0.25, 1]);

// Get color based on 0-1 values
let color = d3.scaleSequential(d3.interpolateBuPu);

// Convert dates between 0 and 600
let xScale = d3.scaleTime().domain([minDate, maxDate]).range([0, 600]).nice();

let yScale = d3.scaleLinear().domain([0, 24]).range([h, 0]);

let radiusScale = d3.scaleSqrt().domain([0, maxDuration]).range([0, r]);

// Add horizontal lines every 6h
for (let tick of [0, 6, 12, 18, 24]) {
  // Define vertical alignment of text
  let alignment = "middle";
  if (tick === 0) alignment = "baseline";
  if (tick === 24) alignment = "hanging";

  // Add axis label
  chart.innerHTML += `<text
    x="-12"
    y="${yScale(tick)}"
    text-anchor="end"
    alignment-baseline="${alignment}"
    fill="gray"
    font-size="12"
    font-family="sans-serif"
  >${tick}h</text>
  `;

  if (tick === 0 || tick === 24) {
    continue;
  }
  // Add a axis lines
  chart.innerHTML += `<line
    x1="0"
    y1="${yScale(tick)}"
    x2="${w}"
    y2="${yScale(tick)}"
    stroke="lightgray"
    ></line>
  `;
}

// Add vertical lines every X days
for (let tick of xScale.ticks()) {
  console.log(tick);

  // Add a axis lines
  chart.innerHTML += `<line
    x1="${xScale(tick)}"
    y1="${h}"
    x2="${xScale(tick)}"
    y2="${0}"
    stroke="lightgray"
    ></line>
  `;
}

// Add border
chart.innerHTML += `
  <rect
    width="${w}"
    height="${h}"
    fill="none"
    stroke="lightgray"
  ></rect>
`;

// For each row in my dataset of medications
for (let medication of medications) {
  // Add a line to my SVG chart
  chart.innerHTML += `<line
    x1="${xScale(medication.Start)}"
    y1="0"
    x2="${xScale(medication.Start)}"
    y2="${h}"
    stroke="black"
    stroke-width="2"
  ></line>
  `;
}

// For each row in my dataset of seizures
for (let seizure of seizures) {
  // Get hour of day as decimals
  const time = seizure.Start.getHours() + seizure.Start.getMinutes() / 60;

  // Add a big circles to my SVG chart
  chart.innerHTML += `<circle 
    cx="${xScale(seizure.Start)}"
    cy="${yScale(time)}"
    r="${radiusScale(seizure.Duration)}"
    fill="${color(scale(seizure.Duration))}"
    fill-opacity="0.6"
    onmouseover="highlight(this)"
    onmouseout="highlight(this,false)"
  ></circle>
  `;

  // Add a tiny circles to my SVG chart
  chart.innerHTML += `<circle 
    cx="${xScale(seizure.Start)}"
    cy="${yScale(time)}"
    r="${2}"
    fill="${color(scale(seizure.Duration))}"
  ></circle>
  `;
}
