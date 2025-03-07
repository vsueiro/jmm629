// Import d3 library
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const w = 600;
const h = 400;
const r = w * 0.075;
const offset = r;

// Adjust viewBox (to “zoom out”)
chart.setAttribute("viewBox", `${-offset} ${-offset} ${w + offset * 2} ${h + offset * 2}`);

// Function to get today’s date as ISO string in current timezone
// const today = () =>
//   new Date().toISOString().slice(0, -1) +
//   (new Date().getTimezoneOffset() > 0 ? "-" : "+") +
//   String(Math.abs(Math.floor(new Date().getTimezoneOffset() / 60))).padStart(2, "0") +
//   ":" +
//   String(Math.abs(new Date().getTimezoneOffset() % 60)).padStart(2, "0");

// Read data
const seizures = await d3.csv("mochi-seizures.csv", d3.autoType);
const medications = await d3.csv("mochi-medications.csv", d3.autoType);

// Get min and max values
const minDuration = d3.min(seizures, (d) => d.Duration);
const maxDuration = d3.max(seizures, (d) => d.Duration);
// const minDate = d3.min(seizures, (d) => d.Start);
const minDate = new Date("2025-01-05T00:00:00-05:00");
// const maxDate = d3.max(seizures, (d) => d.Start);
const maxDate = new Date();

// Global Variables
window.hoveredElement;

// Global Events
window.highlight = (circle, flag = true) => {
  circle.classList.toggle("highlight", flag);
  window.hoveredElement = flag ? circle : undefined;
};

window.moveTooltip = (event) => {
  const { x, y } = event;
  const tooltip = document.querySelector("#tooltip");

  tooltip.style.left = x + "px";
  tooltip.style.top = y + "px";

  if (window.hoveredElement) {
    tooltip.style.opacity = 1;
    tooltip.innerHTML = window.hoveredElement.dataset.tooltip;
    return;
  }

  tooltip.style.opacity = 0;
};

window.onclick = (event) => {
  if (event.target.dataset.tooltip) {
    window.hoveredElement = event.target;
    moveTooltip(event);
    return;
  }

  window.hoveredElement = undefined;
  const tooltip = document.querySelector("#tooltip");
  tooltip.style.opacity = 0;

  document.querySelectorAll("[data-tooltip]").forEach((circle) => {
    highlight(circle, false);
  });
};

// Event listeners
window.onpointermove = moveTooltip;

// Convert duration into 0-1 values
let scale = d3.scaleLinear().domain([minDuration, maxDuration]).range([0.33, 1]);

// Get color based on 0-1 values
let color = d3.scaleSequential(d3.interpolateBuPu);

// Convert dates between 0 and 600
let xScale = d3.scaleTime().domain([minDate, maxDate]).range([0, 600]); //.nice();

let yScale = d3.scaleLinear().domain([0, 24]).range([h, 0]);

let radiusScale = d3.scaleSqrt().domain([0, maxDuration]).range([0, r]);

// Add 1 week length legend
const weekEnd = xScale(new Date("2025-01-12T00:00:00-05:00"));
chart.innerHTML = `
  <text
    x="${weekEnd / 2}"
    y="-28"
    text-anchor="middle"
    alignment-baseline="baseline"
    fill="black"
    font-size="12"
    font-family="sans-serif"
  >1 week</text>
  <path d="M 0 -12 L 0 -18 L ${weekEnd} -18 L ${weekEnd} -12" stroke="black" fill="none"></path>`;

let yTicks = [0, 6, 12, 18, 24];
// let yTicks = [0, 6, 14, 22, 24];

// Add horizontal lines every 6h
for (let tick of yTicks) {
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
    opacity=".5"
    ></line>
  `;
}

// Keep track of date of previous tick, for formatting
let prevDate = "";

// Add vertical lines every X days
for (let tick of xScale.ticks()) {
  const x = xScale(tick);

  let date = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(tick);

  let month = date.substring(0, 3);
  let day = date.replace(month, "").trim();

  // Add axis lines
  chart.innerHTML += `<line
    x1="${x}"
    y1="${h}"
    x2="${x}"
    y2="${0}"
    stroke="lightgray"
    opacity=".5"
    ></line>
  `;

  // Add axis labels
  chart.innerHTML += `<text
    x="${x}"
    y="${h + 18}"
    fill="gray"
    text-anchor="start"
    
    fill="gray"
    font-size="12"
    font-family="sans-serif"
  >
    <tspan x="${x}" >${prevDate.startsWith(month) ? "&nbsp;" : month}</tspan>
    <tspan x="${x}" dy="1.2em">${day}</tspan>
    
  </text>
  `;

  prevDate = date;
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
  const x = xScale(medication.Start);

  // Add a line to my SVG chart
  chart.innerHTML += `<line
    x1="${x}"
    y1="0"
    x2="${x}"
    y2="${h}"
    stroke="black"
    stroke-width="2"
  ></line>
  `;

  const date = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(medication.Start);

  // Add medication label
  chart.innerHTML += `<text
    x="${x}"
    y="-28"
    class="medication"
    fill="black"
    font-size="12"
    font-family="sans-serif"
  >
    <tspan x="${x}">${medication.Label}</tspan>
    <tspan x="${x}" dy="1.2em">${date}</tspan>
    
  </text>
  `;
}

// For each row in my dataset of seizures
for (let seizure of seizures) {
  // Get hour of day as decimals
  const time = seizure.Start.getHours() + seizure.Start.getMinutes() / 60;

  // Format text for tooltip
  const formatted = {};
  formatted.date = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(seizure.Start);

  formatted.time = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(seizure.Start);

  formatted.duration =
    seizure.Duration < 60
      ? `${seizure.Duration}s`
      : `${Math.floor(seizure.Duration / 60)}m${seizure.Duration % 60 === 0 ? "" : (seizure.Duration % 60) + "s"}`;

  const text = `${formatted.date} <br> ${formatted.time}<br> Lasted ${formatted.duration} `;

  // Add a big circles to my SVG chart
  chart.innerHTML += `<circle 
    cx="${xScale(seizure.Start)}"
    cy="${yScale(time)}"
    r="${radiusScale(seizure.Duration)}"
    fill="${color(scale(seizure.Duration))}"
    fill-opacity="0.6"
    data-tooltip="${text}"
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
    style="pointer-events: none"
  ></circle>
  `;

  // If is min or max duration
  if (minDuration === seizure.Duration || maxDuration === seizure.Duration) {
    // Add duration label
    chart.innerHTML += `<text
      x="${xScale(seizure.Start)}"
      y="${yScale(time) + radiusScale(seizure.Duration) + 6}"
      fill="${color(scale(seizure.Duration))}"
      font-size="12"
      style="font-weight: bold"
      text-anchor="middle"
      alignment-baseline="hanging"
      font-family="sans-serif"
      class="duration"
    >
    Lasted ${formatted.duration}
    </text>
    `;
  }
}

// Gaps calculations

function formatTimeDifference(diffMs) {
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  if (diffDays >= 1) return `${Math.floor(diffDays)} days`;

  const diffHours = diffMs / (1000 * 60 * 60);
  if (diffHours >= 1) return `${Math.floor(diffHours)} hours`;

  const diffMinutes = diffMs / (1000 * 60);
  return `${Math.floor(diffMinutes)} minutes`;
}

seizures.forEach((seizure, i) => {
  const currentDate = seizure.Start;
  const nextDate = i < seizures.length - 1 ? seizures[i + 1].Start : maxDate;
  const diffMs = nextDate - currentDate;

  const currentDuration = seizure.Duration;
  const nextDuration = i < seizures.length - 1 ? seizures[i + 1].Duration : 0;

  let start = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(currentDate);

  let end = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: i === 0 ? "numeric" : undefined,
  }).format(nextDate);

  const startingMonth = start.substring(0, 3);

  if (end.startsWith(startingMonth)) {
    end = end.replace(startingMonth, "").trim();
  }

  const text = `<strong>${formatTimeDifference(diffMs)}</strong> <small>${start} to ${end}</small>`;
  const bar = `<div class="bar" style="width:${diffMs / 3000000}px">
    <div class="start-circle" style="background: ${color(scale(currentDuration))}"></div>
    <div class="end-circle" style="background: ${color(scale(nextDuration))}"></div>
  </div>`;

  gaps.innerHTML += `
    <div class="gap">
      <p>${text}</p>
      ${bar}
    </div>`;
});
